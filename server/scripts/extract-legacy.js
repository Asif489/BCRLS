#!/usr/bin/env node
"use strict";

/*
  Reads the hardcoded content of the static site and writes
  server/seed/legacy/content.json, which `npm run db:seed` loads into
  content_sections / content_items.

    node server/scripts/extract-legacy.js
*/

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const cheerio = require("cheerio");
const { SCALARS, HTML_COLLECTIONS, JS_COLLECTIONS } = require("./legacy-spec");

const SITE_ROOT = path.resolve(__dirname, "..", "..");
const OUT_DIR = path.join(SITE_ROOT, "server", "seed", "legacy");
const OUT_FILE = path.join(OUT_DIR, "content.json");

const warnings = [];
const warn = (msg) => warnings.push(msg);

/* ------------------------------------------------------------------ utils */

const readSite = (rel) => fs.readFileSync(path.join(SITE_ROOT, rel), "utf8");

const normalizeWs = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim();

const clone = (value) => JSON.parse(JSON.stringify(value));

function slugify(text) {
  const slug = normalizeWs(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "item";
}

function uniqueSlug(base, used) {
  let slug = base;
  let n = 2;
  while (used.has(slug)) slug = `${base}-${n++}`;
  used.add(slug);
  return slug;
}

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function parseHumanDate(text) {
  const match = normalizeWs(text).match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const month = MONTHS[match[2].toLowerCase()];
  if (!month) return null;
  return `${match[3]}-${String(month).padStart(2, "0")}-${String(Number(match[1])).padStart(2, "0")}`;
}

/* --------------------------------------------------- js data extraction */

function extractConstLiteral(fileRel, variable) {
  const src = readSite(fileRel);
  const re = new RegExp(`\\b(?:const|let|var)\\s+${variable}\\s*=`);
  const match = re.exec(src);
  if (!match) throw new Error(`${fileRel}: '${variable}' not found`);

  let i = src.indexOf("=", match.index) + 1;
  while (i < src.length && /\s/.test(src[i])) i += 1;

  const open = src[i];
  if (open !== "{" && open !== "[") {
    throw new Error(`${fileRel}: '${variable}' is not an object/array literal`);
  }
  const close = open === "{" ? "}" : "]";

  let depth = 0;
  let state = null; // null | "'" | '"' | '`' | 'line' | 'block'

  for (let j = i; j < src.length; j += 1) {
    const c = src[j];
    const next = src[j + 1];

    if (state === "'" || state === '"' || state === "`") {
      if (c === "\\") j += 1;
      else if (c === state) state = null;
      continue;
    }
    if (state === "line") {
      if (c === "\n") state = null;
      continue;
    }
    if (state === "block") {
      if (c === "*" && next === "/") {
        state = null;
        j += 1;
      }
      continue;
    }

    if (c === "'" || c === '"' || c === "`") state = c;
    else if (c === "/" && next === "/") {
      state = "line";
      j += 1;
    } else if (c === "/" && next === "*") {
      state = "block";
      j += 1;
    } else if (c === "{" || c === "[") depth += 1;
    else if (c === "}" || c === "]") {
      depth -= 1;
      if (depth === 0 && c === close) return src.slice(i, j + 1);
    }
  }

  throw new Error(`${fileRel}: unbalanced literal for '${variable}'`);
}

function readJsData(fileRel, variable, subpath) {
  const literal = extractConstLiteral(fileRel, variable);
  let value = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 2000 });
  if (subpath) value = value[subpath];
  return clone(value);
}

/* -------------------------------------------------------- field handling */

function locate(scope, sel) {
  if (sel.startsWith("@")) return scope;
  const found = scope.find(sel);
  if (found.length) return found.first();
  if (scope.is && scope.is(sel)) return scope;
  return null;
}

function extractField($, scope, name, spec, where, { quiet = false } = {}) {
  if (spec.virtual) return { matched: false, virtual: true };

  const attrName = spec.attr || (spec.sel.startsWith("@") ? spec.sel.slice(1) : null);
  const el = locate(scope, spec.sel);

  if (!el || !el.length) {
    if (!quiet) warn(`${where}: field '${name}' selector '${spec.sel}' did not match`);
    return { matched: false };
  }

  if (attrName) {
    const value = el.attr(attrName);
    if (value === undefined) {
      if (!quiet) warn(`${where}: field '${name}' has no '${attrName}' attribute`);
      return { matched: false };
    }
    return { matched: true, mode: "attr", attr: attrName, value };
  }

  if (spec.mode === "html") {
    return { matched: true, mode: "html", keep: "", value: el.html() || "" };
  }

  const textParts = [];
  const elemParts = [];
  el.contents().each((_, node) => {
    if (node.type === "text") textParts.push(node.data);
    else if (node.type === "tag") elemParts.push(node);
  });

  const directText = normalizeWs(textParts.join(" "));

  if (elemParts.length && directText) {
    return {
      matched: true,
      mode: "html",
      keep: elemParts.map((node) => $.html(node)).join(""),
      value: directText,
    };
  }

  if (elemParts.length && !directText) {
    if (!quiet) {
      warn(
        `${where}: field '${name}' (${spec.sel}) only wraps child elements - ` +
          "stored as plain text, inner markup would be lost when edited"
      );
    }
    return { matched: true, mode: "text", value: normalizeWs(el.text()) };
  }

  return { matched: true, mode: "text", value: directText };
}

function buildTemplate($, root, fields, results) {
  const tokenClone = root.clone();

  for (const [name, spec] of Object.entries(fields)) {
    const result = results[name];
    if (!result || !result.matched || spec.virtual) continue;

    const el = locate(tokenClone, spec.sel);
    if (!el) continue;

    const token = `{{${name}}}`;
    if (result.mode === "attr") el.attr(result.attr, token);
    else if (result.mode === "html") el.html(result.keep ? `${result.keep} ${token}` : token);
    else el.text(token);
  }

  return $.html(tokenClone);
}

function publicFields(fields, bestResults) {
  const out = {};

  for (const [name, spec] of Object.entries(fields)) {
    const { slugFrom, ...rest } = spec;
    const best = bestResults && bestResults[name];
    if (best && best.keep) rest.keep = best.keep;
    if (best && best.mode) rest.mode = best.mode;
    if (best && best.attr) rest.attr = best.attr;
    out[name] = rest;
  }

  return out;
}

/* ------------------------------------------------------------- extractors */

function extractHtmlCollection(spec, $) {
  const container = $(spec.container);

  if (!container.length) {
    warn(`${spec.key}: container '${spec.container}' not found in ${spec.pages[0]}`);
    return null;
  }

  const nodes = container.find(spec.item).toArray();

  if (!nodes.length) {
    warn(`${spec.key}: no items matched '${spec.item}'`);
    return null;
  }

  const entries = nodes.map((node, index) => {
    const $item = $(node);
    const results = {};
    for (const [name, fieldSpec] of Object.entries(spec.fields)) {
      results[name] = extractField($, $item, name, fieldSpec, spec.key, { quiet: true });
    }

    const data = {};
    for (const [name, result] of Object.entries(results)) {
      if (result.matched) data[name] = result.value;
    }

    return { $item, results, data, index };
  });

  const used = new Set();
  for (const entry of entries) {
    entry.slug = uniqueSlug(slugify(entry.data[spec.slugFrom] || `item-${entry.index + 1}`), used);
  }

  const optional = [];
  for (const [name, fieldSpec] of Object.entries(spec.fields)) {
    if (fieldSpec.virtual) continue;
    const count = entries.filter((entry) => entry.results[name].matched).length;
    if (count === 0) warn(`${spec.key}: field '${name}' matched none of the ${entries.length} items`);
    else if (count < entries.length) optional.push(`${name} ${count}/${entries.length}`);
  }

  let best = entries[0];
  let bestCount = -1;
  for (const entry of entries) {
    const count = Object.values(entry.results).filter((r) => r.matched).length;
    if (count > bestCount) {
      bestCount = count;
      best = entry;
    }
  }

  const templateHtml = buildTemplate($, best.$item, spec.fields, best.results);

  if (spec.enrich) enrichEvents(entries, spec);

  return {
    key: spec.key,
    title: spec.title,
    pages: spec.pages,
    kind: "collection",
    sourceType: "html",
    containerSelector: spec.container,
    itemSelector: spec.item,
    matchBy: spec.matchBy || null,
    importedCount: entries.length,
    optionalFields: optional,
    fields: publicFields(spec.fields, best.results),
    templateHtml,
    items: entries.map((entry) => ({ slug: entry.slug, index: entry.index, data: entry.data })),
  };
}

function enrichEvents(entries, spec) {
  const details = readJsData("js/events.js", "archiveEventDetails");
  const dateByTitle = readJsData("js/events.js", "archiveDateByTitle");

  for (const entry of entries) {
    const where = spec.key;

    if (spec.enrich.includes("eventDetails")) {
      const id = Number(entry.data.eventId);
      entry.data.detail = details[id] ? clone(details[id]) : null;
      if (!details[id]) warn(`${where}: no archiveEventDetails entry for event id ${id}`);
    }

    if (spec.enrich.includes("eventDate")) {
      const title = normalizeWs(entry.data.title);
      let iso = dateByTitle[title];
      if (!iso) {
        iso = Object.entries(dateByTitle).find(([key]) => normalizeWs(key) === title)?.[1];
      }
      if (!iso) {
        const metaText = entry.$item.find(".event-card-meta span").first().text();
        iso = parseHumanDate(metaText);
        if (iso) warn(`${where}: date for '${title}' parsed from markup instead of js/events.js`);
      }
      if (!iso) warn(`${where}: could not determine a date for '${title}'`);
      entry.data.dateIso = iso || null;
    }
  }
}

function extractJsCollection(spec) {
  const source = readJsData(spec.source.file, spec.source.variable, spec.source.path);

  if (!Array.isArray(source) || !source.length) {
    warn(`${spec.key}: ${spec.source.variable}${spec.source.path ? "." + spec.source.path : ""} is empty`);
    return null;
  }

  const used = new Set();
  const items = source.map((entry, index) => {
    const data = clone(entry);
    return {
      slug: uniqueSlug(slugify(data[spec.slugFrom] || `item-${index + 1}`), used),
      index,
      data,
    };
  });

  return {
    key: spec.key,
    title: spec.title,
    pages: spec.pages,
    kind: "collection",
    sourceType: "js",
    containerSelector: spec.container || null,
    itemSelector: spec.item || null,
    matchBy: spec.source.matchBy || null,
    importedCount: items.length,
    fields: publicFields(spec.fields),
    templateHtml: null,
    items,
  };
}

function extractScalar(spec, $) {
  const fieldSpec = spec.fields.value;

  if (!$(fieldSpec.sel).length) {
    warn(`${spec.key}: selector '${fieldSpec.sel}' not found in ${spec.pages[0]}`);
    return null;
  }

  const result = extractField($, $.root(), "value", fieldSpec, spec.key);
  if (!result.matched) return null;

  return {
    key: spec.key,
    title: spec.title,
    pages: spec.pages,
    kind: "scalar",
    sourceType: "html",
    containerSelector: null,
    itemSelector: fieldSpec.sel,
    matchBy: null,
    importedCount: 1,
    fields: publicFields(spec.fields, { value: result }),
    templateHtml: null,
    items: [{ slug: "value", index: 0, data: { value: result.value } }],
  };
}

/* -------------------------------------------------------------------- run */

function main() {
  const sections = [];

  for (const spec of HTML_COLLECTIONS) {
    const file = spec.pages[0];
    const $ = cheerio.load(readSite(file));
    const section = extractHtmlCollection(spec, $);
    if (section) sections.push(section);
  }

  for (const spec of JS_COLLECTIONS) {
    const section = extractJsCollection(spec);
    if (section) sections.push(section);
  }

  const pagesLoaded = new Map();
  for (const spec of SCALARS) {
    const file = spec.pages[0];
    if (!pagesLoaded.has(file)) pagesLoaded.set(file, cheerio.load(readSite(file)));
    const section = extractScalar(spec, pagesLoaded.get(file));
    if (section) sections.push(section);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    generator: "server/scripts/extract-legacy.js",
    spec: "server/scripts/legacy-spec.js",
    sections,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf8");

  const itemCount = sections.reduce((sum, s) => sum + s.items.length, 0);
  console.log(`[extract] ${sections.length} sections, ${itemCount} items -> ${path.relative(SITE_ROOT, OUT_FILE)}`);

  for (const section of sections) {
    const optional = section.optionalFields && section.optionalFields.length ? `  [partial: ${section.optionalFields.join(", ")}]` : "";
    console.log(`  ${section.key.padEnd(22)} ${String(section.items.length).padStart(3)} items  ${section.pages.join(", ")}${optional}`);
  }

  if (warnings.length) {
    console.error(`\n[extract] ${warnings.length} warning(s):`);
    for (const message of warnings) console.error(`  ! ${message}`);
    process.exitCode = 1;
  }
}

main();
