#!/usr/bin/env node
"use strict";

/*
  verify-snapshot.js - proves the static site was not silently rewritten.

  Compares every site file (HTML, CSS, JS, assets) in the working tree with
  the same file at the `backup-before-admin` tag:

    - hashed with SHA-256 after normalising line endings (CRLF <-> LF)
    - every difference is classified against an allow-list:
        * navbar CSS + navbar JS (the Task 1 breakpoint/ARIA work)
        * the js/app.js script injection (content-sync.js + form-submit.js)
        * contact.html (the guarded resize handler)
        * data-* attribute additions in any other HTML file
    - a missing file or any other difference is a failure

  Usage:
    node server/scripts/verify-snapshot.js [--tag backup-before-admin] [--json]

  Exit code 0 = only allowed differences, 1 = something else changed.
*/

const { execFileSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");

/* ------------------------------------------------------------- options */

function parseArgs(argv) {
  const out = { tag: "backup-before-admin", json: false };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--tag") out.tag = argv[++i];
    else if (argv[i] === "--json") out.json = true;
    else throw new Error(`unknown argument: ${argv[i]}`);
  }
  return out;
}

/* --------------------------------------------------------------- git */

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
}

function tagFiles(tag) {
  return git(["ls-tree", "-r", "--name-only", tag])
    .toString("utf8")
    .split("\n")
    .filter(Boolean);
}

function tagBlob(tag, file) {
  try {
    return git(["show", `${tag}:${file}`]);
  } catch (err) {
    return null; /* deleted or unreadable */
  }
}

/* ------------------------------------------------------------ hashing */

const TEXT_EXT = new Set([
  "html", "htm", "css", "js", "mjs", "json", "txt", "md", "svg", "gs", "xml", "csv",
]);

function isText(file) {
  return TEXT_EXT.has(path.extname(file).toLowerCase().slice(1));
}

/* Line endings are ignored: both sides are normalised before hashing. */
function sha256(buffer, text) {
  const data = text ? Buffer.from(buffer.toString("utf8").replace(/\r\n?/g, "\n"), "utf8") : buffer;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/* --------------------------------------------------------- allow-lists */

/* Modified files whose whole diff is allowed, with the reason to print. */
const ALLOWED_MODIFIED = {
  "css/responsive.css": "navbar CSS",
  "css/design-system.css": "navbar CSS",
  "css/final-polish.css": "navbar CSS",
  "css/datahub.css": "navbar CSS",
  "css/media.css": "navbar CSS",
  "js/app.js": "navbar JS + script injection",
  "js/events.js": "content-sync hooks (script injection)",
  "contact.html": "contact page fix",
};

/* New files that are allowed to exist. */
const ALLOWED_ADDED = {
  "js/content-sync.js": "script injection",
  "js/form-submit.js": "script injection",
};

/* Directories that are not part of the shipped static site. */
const NON_SITE_DIRS = ["server/", "admin/", "docs/", "node_modules/", ".git/", ".vscode/", ".kilo/", ".freebuff/"];

const SITE_EXT = new Set([
  "html", "htm", "css", "js", "mjs", "jpg", "jpeg", "png", "gif", "svg", "webp", "ico",
  "pdf", "woff", "woff2", "ttf", "eot", "txt", "gs",
]);

function isSiteFile(file) {
  if (NON_SITE_DIRS.some((dir) => file.startsWith(dir))) return false;
  return SITE_EXT.has(path.extname(file).toLowerCase().slice(1));
}

/* ------------------------------------------------- data-* only diffs */

function stripDataAttrs(html) {
  const attrs = [];
  const stripped = html.replace(/\s(data-[a-z0-9-]+)(?:="[^"]*")?/gi, (match, name) => {
    attrs.push(name.toLowerCase());
    return "";
  });
  return { stripped, attrs };
}

/*
  An HTML file outside the allow-list may still differ when the only change
  is the addition of data-* attributes (used by the content overlay to find
  its nodes).  Returns a reason string, or null when the diff is not that.
*/
function dataAttrOnlyReason(oldBuffer, newBuffer, file) {
  if (!/\.html?$/i.test(file)) return null;

  const oldText = oldBuffer.toString("utf8").replace(/\r\n?/g, "\n");
  const newText = newBuffer.toString("utf8").replace(/\r\n?/g, "\n");

  const before = stripDataAttrs(oldText);
  const after = stripDataAttrs(newText);

  if (before.stripped !== after.stripped) return null;

  const removed = before.attrs.filter((name) => !after.attrs.includes(name));
  if (removed.length) return null; /* removals are not allowed */

  const added = after.attrs.filter((name) => !before.attrs.includes(name));
  if (!added.length) return null; /* nothing changed after stripping */

  const unique = [...new Set(added)].sort();
  return `data-* additions (${unique.join(", ")})`;
}

/* ------------------------------------------------------------ scanning */

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(path.relative(ROOT, full).replace(/\\/g, "/"));
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  const results = { tag: args.tag, unchanged: [], allowed: [], failures: [] };
  let failed = false;

  const files = tagFiles(args.tag);

  /* 1. every file at the tag must still exist, byte-for-byte or allowed */
  for (const file of files) {
    const oldBuffer = tagBlob(args.tag, file);
    const newBuffer = fs.existsSync(path.join(ROOT, file)) ? fs.readFileSync(path.join(ROOT, file)) : null;

    if (!newBuffer) {
      results.failures.push({ file, reason: "file missing from the working tree" });
      continue;
    }

    const text = isText(file);
    const oldHash = sha256(oldBuffer, text);
    const newHash = sha256(newBuffer, text);

    if (oldHash === newHash) {
      results.unchanged.push({ file, sha256: newHash });
      continue;
    }

    const allowed = ALLOWED_MODIFIED[file] || dataAttrOnlyReason(oldBuffer, newBuffer, file);
    if (allowed) {
      results.allowed.push({ file, reason: allowed, sha256: newHash });
    } else {
      results.failures.push({ file, reason: "differs from the backup and is not on the allow-list" });
    }
  }

  /* 2. new site files must be on the allow-list too */
  const tagSet = new Set(files);
  const seen = new Set();

  for (const file of walk(ROOT)) {
    if (tagSet.has(file) || seen.has(file)) continue;
    seen.add(file);
    if (!isSiteFile(file)) continue;

    const reason = ALLOWED_ADDED[file];
    if (reason) results.allowed.push({ file, reason: `new file: ${reason}` });
    else results.failures.push({ file, reason: "new site file not on the allow-list" });
  }

  failed = results.failures.length > 0;

  /* ------------------------------------------------------------ report */

  if (args.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(`snapshot check against tag '${args.tag}'`);
    console.log(`  files at tag:        ${files.length}`);
    console.log(`  unchanged:           ${results.unchanged.length}`);
    console.log(`  allowed differences: ${results.allowed.length}`);

    if (results.allowed.length) {
      console.log("\nallowed differences:");
      for (const entry of results.allowed) {
        console.log(`  ~ ${entry.file}  [${entry.reason}]`);
      }
    }

    if (results.failures.length) {
      console.log("\nUNEXPECTED differences:");
      for (const entry of results.failures) {
        console.log(`  ! ${entry.file}  - ${entry.reason}`);
      }
    }

    console.log("");
    console.log(
      failed
        ? "verify-snapshot: FAILED - files changed outside the allow-list"
        : "verify-snapshot: OK - only allowed differences (navbar CSS/JS, script injection, contact.html, data-* additions)"
    );
  }

  process.exitCode = failed ? 1 : 0;
}

main();
