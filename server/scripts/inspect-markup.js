#!/usr/bin/env node
"use strict";

/* Prints the first item of every collection section so that field maps
   can be written from real markup instead of guesswork.
   Usage: node server/scripts/inspect-markup.js [section-key] */

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const SITE_ROOT = path.resolve(__dirname, "..", "..");

const TARGETS = [
  ["events-archive", "events/archive.html", ".events-grid", ".event-card"],
  ["home-upcoming", "index.html", ".event-grid", "article.event-card"],
  ["home-latest", "index.html", ".latest-grid", "article.latest-card"],
  ["library-academic", "library/academic.html", "#academic-journals .library-resource-grid", "article.library-resource-card"],
  ["library-reports", "library/report.html", "#reports .library-resource-grid", "article.library-resource-card"],
  ["library-books", "library/books.html", "#books .library-resource-grid", "article.library-resource-card"],
  ["education-masters", "education/masters.html", ".education-section .container", "article.training-card"],
  ["education-phd", "education/phd.html", ".education-section .container", "article.training-card"],
  ["education-training", "education/traning.html", ".education-section .container", "article.training-card"],
  ["datahub-statistics", "datahub/statistics.html", ".datahub-grid", "article.datahub-card"],
  ["datahub-portals", "datahub/dataPortal.html", ".portal-grid", ".portal-card"],
  ["datahub-database", "datahub/database.html", ".database-grid", "article.database-card"],
  ["media-newsroom", "media/newsroom.html", ".newsroom-list", "article.newsroom-feature"],
  ["insights-latest", "insights/index.html", ".latest-grid", "article.latest-card"],
];

const only = process.argv[2];

for (const [key, file, container, item] of TARGETS) {
  if (only && key !== only) continue;

  const html = fs.readFileSync(path.join(SITE_ROOT, file), "utf8");
  const $ = cheerio.load(html);
  const items = $(`${container} ${item}`);

  console.log(`\n===== ${key}  (${file})  container=${container}  item=${item}  count=${items.length} =====`);

  if (!items.length) {
    console.log("  !! NOT FOUND");
    continue;
  }

  console.log(
    $.html(items.first())
      .replace(/></g, ">\n<")
      .split("\n")
      .map((line) => "  " + line.trim())
      .join("\n")
  );
}
