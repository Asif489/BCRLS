"use strict";

/*
  Public, unauthenticated journal-issue feed for research/journal.html.

  Returns the current issue and the full archive (every issue, newest first,
  current one included and flagged).  The page keeps its static "Coming Soon"
  markup when the API is unreachable or no issues exist.
*/

const express = require("express");
const db = require("../db/pool");
const { asyncRoute } = require("../lib/http");

const router = express.Router();

function toIssue(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    slug: row.slug,
    volume: row.volume,
    issueNumber: row.issue_number,
    title: row.title,
    year: row.year,
    coverImage: row.cover_image,
    description: row.description,
    pdfUrl: row.pdf_url,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString().slice(0, 10) : null,
    isCurrent: row.is_current,
  };
}

router.get(
  "/",
  asyncRoute(async (req, res) => {
    const rows = await db.many(
      `SELECT id, slug, volume, issue_number, title, year, cover_image,
              description, pdf_url, published_at, is_current
         FROM journal_issues
        ORDER BY is_current DESC,
                 published_at DESC NULLS LAST,
                 year DESC NULLS LAST,
                 id DESC`
    );

    const issues = rows.map(toIssue);
    const current = issues.find((issue) => issue.isCurrent) || null;

    res.set("Cache-Control", "no-cache");
    res.json({
      generatedAt: new Date().toISOString(),
      current,
      issues,
    });
  })
);

module.exports = router;
