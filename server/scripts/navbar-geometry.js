#!/usr/bin/env node
"use strict";

/*
  Navbar geometry harness.

  Loads a set of pages at several viewport widths and records the exact
  geometry of the header: logo, nav container, every visible nav entry, the
  hamburger button, whether anything overlaps and whether the header overflows
  horizontally.  Two runs can be diffed to prove a change did (not) move the
  navbar.

    node server/scripts/navbar-geometry.js --base http://127.0.0.1:4000 \
        --widths 1366,1440,1500,1501,1920 --out /tmp/nav-1.json

    node server/scripts/navbar-geometry.js --compare /tmp/nav-a.json /tmp/nav-b.json

  Requires playwright-core (npm i --no-save playwright-core) and a local
  Chrome/Chromium ("chrome" channel).
*/

const fs = require("fs");
const { chromium } = require("playwright-core");

const DEFAULT_PAGES = [
  "/index.html",
  "/events/archive.html",
  "/pages/team.html",
  "/research/blog.html",
  "/get-involved/index.html",
  "/media/gallery.html",
];

const DEFAULT_WIDTHS = [1366, 1440, 1500, 1501, 1920];

function parseArgs(argv) {
  const out = { base: "http://127.0.0.1:4000", widths: DEFAULT_WIDTHS, pages: DEFAULT_PAGES, out: null };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--base") out.base = argv[++i];
    else if (arg === "--widths") out.widths = argv[++i].split(",").map(Number);
    else if (arg === "--pages") out.pages = argv[++i].split(",");
    else if (arg === "--out") out.out = argv[++i];
    else if (arg === "--compare") out.compare = [argv[++i], argv[++i]];
    else if (arg === "--height") out.height = Number(argv[++i]);
    else throw new Error(`unknown argument: ${arg}`);
  }

  return out;
}

const rect = (r) => ({
  x: Math.round(r.x),
  y: Math.round(r.y),
  w: Math.round(r.width),
  h: Math.round(r.height),
});

/* Sub-pixel positions of adjacent entries round to a 1px overlap; anything
   below 3px in both directions is rounding, not a collision. */
const OVERLAP_TOLERANCE = 3;

const overlapBox = (a, b) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > OVERLAP_TOLERANCE && h > OVERLAP_TOLERANCE ? { w, h } : null;
};

async function measure(browser, base, path, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(base + path, { waitUntil: "load" });
  await page.waitForTimeout(500);

  const data = await page.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };
    const visible = (el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 && r.height > 0;
    };

    const brand = document.querySelector(".brand, .navbar-brand, header .logo");
    const nav = document.querySelector(".main-nav");
    const toggle = document.querySelector(".menu-toggle");

    const entries = [];
    if (nav) {
      Array.from(nav.children).forEach((child) => {
        if (!visible(child)) return;
        const link = child.matches("a, .nav-link") ? child : child.querySelector("a, .nav-link");
        entries.push({
          label: (link ? link.textContent : child.textContent).replace(/\s+/g, " ").trim().slice(0, 24),
          box: box(child),
        });
      });
    }

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      scrollWidth: document.documentElement.scrollWidth,
      brand: brand && visible(brand) ? box(brand) : null,
      nav: nav && visible(nav) ? box(nav) : null,
      hamburger: toggle && visible(toggle) ? box(toggle) : null,
      entries,
    };
  });

  /* overlaps between visible header pieces */
  const pieces = [];
  if (data.brand) pieces.push({ label: "logo", box: data.brand });
  if (data.nav) pieces.push({ label: "nav", box: data.nav });
  if (data.hamburger) pieces.push({ label: "hamburger", box: data.hamburger });
  data.entries.forEach((entry) => pieces.push({ label: `item:${entry.label}`, box: entry.box }));

  data.overlaps = [];
  for (let i = 0; i < pieces.length; i += 1) {
    for (let j = i + 1; j < pieces.length; j += 1) {
      const a = pieces[i];
      const b = pieces[j];
      const nested = a.label.startsWith("item:") && b.label === "nav";
      const nested2 = b.label.startsWith("item:") && a.label === "nav";
      if (nested || nested2) continue;
      const overlap = overlapBox(a.box, b.box);
      if (overlap) data.overlaps.push(`${a.label} x ${b.label} = ${overlap.w}x${overlap.h}px`);
    }
  }

  data.headerOverflow = data.scrollWidth > data.viewport.w;
  data.fits =
    data.overlaps.length === 0 &&
    !data.headerOverflow &&
    Boolean(data.nav) &&
    !data.hamburger;

  await page.close();
  return data;
}

function diffRuns(a, b) {
  const diffs = [];
  const key = (page, width) => `${page}@${width}`;
  const keys = new Set([...Object.keys(a.results), ...Object.keys(b.results)]);

  for (const k of keys) {
    const left = a.results[k];
    const right = b.results[k];
    if (!left || !right) {
      diffs.push(`${k}: missing in ${left ? "b" : "a"}`);
      continue;
    }

    for (const field of ["brand", "nav", "hamburger", "scrollWidth", "fits", "headerOverflow"]) {
      if (JSON.stringify(left[field]) !== JSON.stringify(right[field])) {
        diffs.push(`${k}.${field}: ${JSON.stringify(left[field])} -> ${JSON.stringify(right[field])}`);
      }
    }

    if (left.entries.length !== right.entries.length) {
      diffs.push(`${k}.entries: ${left.entries.length} -> ${right.entries.length}`);
    } else {
      left.entries.forEach((entry, i) => {
        const other = right.entries[i];
        if (JSON.stringify(entry.box) !== JSON.stringify(other.box) || entry.label !== other.label) {
          diffs.push(
            `${k}.entry[${i}] ${entry.label}: ${JSON.stringify(entry.box)} -> ${JSON.stringify(other.box)}`
          );
        }
      });
    }

    const la = left.overlaps.join("; ");
    const lb = right.overlaps.join("; ");
    if (la !== lb) diffs.push(`${k}.overlaps: ${la || "(none)"} -> ${lb || "(none)"}`);
  }

  return diffs;
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.compare) {
    const a = JSON.parse(fs.readFileSync(args.compare[0], "utf8"));
    const b = JSON.parse(fs.readFileSync(args.compare[1], "utf8"));
    const diffs = diffRuns(a, b);
    console.log(diffs.length ? diffs.join("\n") : "no differences");
    process.exitCode = diffs.length ? 1 : 0;
    return;
  }

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = {};

  for (const width of args.widths) {
    for (const page of args.pages) {
      const data = await measure(browser, args.base, page, width, args.height || 900);
      results[`${page}@${width}`] = data;
      console.log(
        `${page} @${width}: ${data.fits ? "fits" : "does NOT fit"}` +
          ` (hamburger ${data.hamburger ? "visible" : "hidden"}, ` +
          `${data.entries.length} entries, ${data.overlaps.length} overlap(s)` +
          `${data.headerOverflow ? ", horizontal overflow" : ""})`
      );
      data.overlaps.forEach((line) => console.log(`    overlap: ${line}`));
    }
  }

  const payload = { generatedAt: new Date().toISOString(), base: args.base, results };
  if (args.out) {
    fs.writeFileSync(args.out, JSON.stringify(payload, null, 2) + "\n", "utf8");
    console.log(`\nwritten: ${args.out}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
