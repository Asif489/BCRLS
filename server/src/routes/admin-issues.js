"use strict";

/*
  Journal issues (BJRLDs).

  Lifecycle rule: exactly one issue may be the "current issue".  Creating or
  updating an issue with `isCurrent: true` demotes whatever was current before
  to the archive - the previous issue is never deleted, only un-flagged, so it
  keeps showing up in the archive.  The archive is every issue that is not the
  current one.

  Every mutation is audited.
*/

const express = require("express");
const { z } = require("zod");
const db = require("../db/pool");
const { requireAuth } = require("../middleware/auth");
const { asyncRoute, notFound } = require("../lib/http");
const { audit } = require("../lib/audit");

const router = express.Router();

router.use(requireAuth);

const SCRIPT_URL = /^\s*(javascript|vbscript|data|file|blob):/i;

const urlField = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => !SCRIPT_URL.test(value), "must not be a script URL");

const dateField = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"), z.literal(""), z.null()])
  .optional();

const bodySchema = z
  .object({
    volume: z.string().trim().max(120).optional(),
    issueNumber: z.string().trim().max(120).optional(),
    title: z.string().trim().max(300).optional(),
    year: z
      .union([z.coerce.number().int().gte(1800).lte(2200), z.literal(""), z.null()])
      .optional(),
    coverImage: urlField.optional(),
    description: z.string().max(50_000).optional(),
    pdfUrl: urlField.optional(),
    publishedAt: dateField,
    isCurrent: z.boolean().optional(),
  })
  .strict();

/* ------------------------------------------------------------------ helpers */

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
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

function slugify(text) {
  const slug = String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "issue";
}

async function nextSlug(client, base, excludeId = null) {
  const { rows } = await client.query(
    "SELECT id, slug FROM journal_issues WHERE ($1::bigint IS NULL OR id <> $1)",
    [excludeId]
  );
  const taken = new Set(rows.map((row) => row.slug));

  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

function resolveYear(value) {
  if (value === "" || value === null || value === undefined) return null;
  return Number(value);
}

/* Fields a create body may carry, with sensible defaults. */
function insertValues(body) {
  return {
    volume: (body.volume || "").trim(),
    issueNumber: (body.issueNumber || "").trim(),
    title: (body.title || "").trim(),
    year: resolveYear(body.year),
    coverImage: body.coverImage || "",
    description: body.description || "",
    pdfUrl: body.pdfUrl || "",
    publishedAt: body.publishedAt || null,
    isCurrent: body.isCurrent === true,
  };
}

/* Merge a (partial) patch onto the stored row. */
function mergedValues(existing, body) {
  const str = (incoming, current) => (incoming === undefined ? current : String(incoming).trim());
  return {
    volume: str(body.volume, existing.volume),
    issueNumber: str(body.issueNumber, existing.issue_number),
    title: str(body.title, existing.title),
    year: body.year === undefined ? existing.year : resolveYear(body.year),
    coverImage: body.coverImage === undefined ? existing.cover_image : body.coverImage,
    description: body.description === undefined ? existing.description : body.description,
    pdfUrl: body.pdfUrl === undefined ? existing.pdf_url : body.pdfUrl,
    publishedAt: body.publishedAt === undefined ? (existing.published_at ? new Date(existing.published_at).toISOString().slice(0, 10) : null) : body.publishedAt || null,
    isCurrent: body.isCurrent === undefined ? existing.is_current : body.isCurrent === true,
  };
}

async function loadIssue(id) {
  if (!Number.isInteger(id) || id <= 0) throw notFound("Unknown issue");
  const issue = await db.one("SELECT * FROM journal_issues WHERE id = $1", [id]);
  if (!issue) throw notFound("Unknown issue");
  return issue;
}

/* --------------------------------------------------------------------- list */

router.get(
  "/",
  asyncRoute(async (req, res) => {
    const rows = await db.many(
      `SELECT * FROM journal_issues
        ORDER BY is_current DESC,
                 published_at DESC NULLS LAST,
                 year DESC NULLS LAST,
                 id DESC`
    );
    res.json({ issues: rows.map(toIssue) });
  })
);

/* ---------------------------------------------------------------------- one */

router.get(
  "/:id",
  asyncRoute(async (req, res) => {
    const issue = await loadIssue(Number(req.params.id));
    res.json({ issue: toIssue(issue) });
  })
);

/* ------------------------------------------------------------------- create */

router.post(
  "/",
  asyncRoute(async (req, res) => {
    const body = bodySchema.parse(req.body || {});
    const values = insertValues(body);

    if (!values.volume && !values.issueNumber && !values.title && !values.year) {
      res.status(400).json({
        error: {
          message:
            "Provide at least one of volume, issue number, title or year so the issue can be identified.",
        },
      });
      return;
    }

    const issue = await db.withTransaction(async (client) => {
      if (values.isCurrent) {
        await client.query("UPDATE journal_issues SET is_current = false WHERE is_current");
      }

      const base = slugify(
        [values.volume, values.issueNumber, values.year].filter(Boolean).join(" ") ||
          values.title ||
          "issue"
      );
      const slug = await nextSlug(client, base);

      const { rows } = await client.query(
        `INSERT INTO journal_issues
           (slug, volume, issue_number, title, year, cover_image, description,
            pdf_url, published_at, is_current, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          slug,
          values.volume,
          values.issueNumber,
          values.title,
          values.year,
          values.coverImage,
          values.description,
          values.pdfUrl,
          values.publishedAt,
          values.isCurrent,
          req.admin.id,
        ]
      );
      return rows[0];
    });

    await audit(db, {
      adminId: req.admin.id,
      action: "journal_issue.create",
      entity: "journal_issue",
      entityId: issue.id,
      detail: { slug: issue.slug, isCurrent: issue.is_current },
    });

    res.status(201).json({ issue: toIssue(issue) });
  })
);

/* ------------------------------------------------------------------- update */

router.patch(
  "/:id",
  asyncRoute(async (req, res) => {
    const existing = await loadIssue(Number(req.params.id));
    const body = bodySchema.parse(req.body || {});
    const values = mergedValues(existing, body);

    const issue = await db.withTransaction(async (client) => {
      if (values.isCurrent) {
        await client.query(
          "UPDATE journal_issues SET is_current = false WHERE is_current AND id <> $1",
          [existing.id]
        );
      }

      const base = slugify(
        [values.volume, values.issueNumber, values.year].filter(Boolean).join(" ") ||
          values.title ||
          existing.slug
      );
      const slug = base === existing.slug ? existing.slug : await nextSlug(client, base, existing.id);

      const { rows } = await client.query(
        `UPDATE journal_issues
            SET slug = $1, volume = $2, issue_number = $3, title = $4, year = $5,
                cover_image = $6, description = $7, pdf_url = $8, published_at = $9,
                is_current = $10
          WHERE id = $11
          RETURNING *`,
        [
          slug,
          values.volume,
          values.issueNumber,
          values.title,
          values.year,
          values.coverImage,
          values.description,
          values.pdfUrl,
          values.publishedAt,
          values.isCurrent,
          existing.id,
        ]
      );
      return rows[0];
    });

    await audit(db, {
      adminId: req.admin.id,
      action: "journal_issue.update",
      entity: "journal_issue",
      entityId: issue.id,
      detail: { slug: issue.slug, isCurrent: issue.is_current },
    });

    res.json({ issue: toIssue(issue) });
  })
);

/* -------------------------------------------------------- set as current */

/*
  Promoting an issue to "current" automatically demotes the previously
  current one to the archive: the demoted row keeps all of its data, only
  is_current turns false.  Front and centre of the requirement.
*/
router.post(
  "/:id/current",
  asyncRoute(async (req, res) => {
    const existing = await loadIssue(Number(req.params.id));

    const issue = await db.withTransaction(async (client) => {
      await client.query("UPDATE journal_issues SET is_current = false WHERE is_current AND id <> $1", [
        existing.id,
      ]);
      const { rows } = await client.query(
        "UPDATE journal_issues SET is_current = true WHERE id = $1 RETURNING *",
        [existing.id]
      );
      return rows[0];
    });

    await audit(db, {
      adminId: req.admin.id,
      action: "journal_issue.set_current",
      entity: "journal_issue",
      entityId: issue.id,
      detail: { slug: issue.slug, previous: existing.slug },
    });

    res.json({ issue: toIssue(issue) });
  })
);

/* ------------------------------------------------------------------- delete */

router.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    const existing = await loadIssue(Number(req.params.id));

    await db.query("DELETE FROM journal_issues WHERE id = $1", [existing.id]);

    await audit(db, {
      adminId: req.admin.id,
      action: "journal_issue.delete",
      entity: "journal_issue",
      entityId: existing.id,
      detail: { slug: existing.slug, wasCurrent: existing.is_current },
    });

    res.json({ ok: true, id: existing.id });
  })
);

module.exports = router;
