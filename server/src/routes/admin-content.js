"use strict";

const express = require("express");
const { z } = require("zod");
const db = require("../db/pool");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncRoute, badRequest, notFound, conflict } = require("../lib/http");
const { buildDataSchema } = require("../lib/content-validation");
const { audit } = require("../lib/audit");

const router = express.Router();

router.use(requireAuth);

const KEY_RE = /^[a-z0-9][a-z0-9-]{0,60}$/;

async function loadSection(key) {
  if (!KEY_RE.test(key)) throw notFound("Unknown section");

  const section = await db.one("SELECT * FROM content_sections WHERE key = $1", [key]);
  if (!section) throw notFound("Unknown section");
  return section;
}

async function loadItem(section, itemId) {
  const item = await db.one(
    "SELECT * FROM content_items WHERE id = $1 AND section_id = $2",
    [itemId, section.id]
  );
  if (!item) throw notFound("Unknown item");
  return item;
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
  return slug || "item";
}

async function nextSlug(section, base, excludeId = null) {
  const { rows } = await db.query(
    "SELECT id, slug FROM content_items WHERE section_id = $1",
    [section.id]
  );
  const taken = new Set(rows.filter((row) => row.id !== excludeId).map((row) => row.slug));

  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

function mergeData(existing, patch, fields) {
  const merged = { ...existing };

  for (const [name, value] of Object.entries(patch)) {
    const spec = (fields || {})[name];
    if (spec && spec.type === "object" && value && typeof value === "object" && !Array.isArray(value)) {
      merged[name] = { ...(existing[name] || {}), ...value };
    } else {
      merged[name] = value;
    }
  }

  return merged;
}

/*
  A section's match_by column names the field that pairs a stored row with a
  DOM node instead of position (events: eventId, team: name, ...).  Two rows
  in one section carrying the same value would make the overlay ambiguous, so
  create and patch refuse the write with 409.
*/
async function assertMatchValueUnique(section, data, excludeId = null) {
  if (!section.match_by || !data) return;

  const value = data[section.match_by];
  if (value === undefined || value === null || value === "") return;

  const { rows } = await db.query(
    `SELECT id, slug
       FROM content_items
      WHERE section_id = $1
        AND (data ->> $2) = $3
        AND ($4::bigint IS NULL OR id <> $4)
      LIMIT 1`,
    [section.id, section.match_by, String(value), excludeId]
  );

  if (rows.length) {
    throw conflict(
      `Duplicate ${section.match_by}: another item in this section already uses ` +
        `${section.match_by}="${String(value)}" (item "${rows[0].slug}"). ` +
        `Every item of a section must carry a unique "${section.match_by}" value.`,
      { field: section.match_by, value: String(value), existingItemId: Number(rows[0].id) }
    );
  }
}

/* ------------------------------------------------------------ list sections */

router.get(
  "/",
  asyncRoute(async (req, res) => {
    const sections = await db.many(
      `SELECT s.key, s.title, s.pages, s.kind, s.source_type, s.container_selector,
              s.item_selector, s.imported_count,
              count(i.id)::int AS item_count,
              count(i.id) FILTER (WHERE i.edited_at IS NOT NULL)::int AS edited_count,
              count(i.id) FILTER (WHERE i.is_hidden)::int AS hidden_count
         FROM content_sections s
         LEFT JOIN content_items i ON i.section_id = s.id
        GROUP BY s.id
        ORDER BY s.key`
    );

    res.json({ sections });
  })
);

/* ------------------------------------------------------------- one section */

router.get(
  "/:key",
  asyncRoute(async (req, res) => {
    const section = await loadSection(req.params.key);

    const items = await db.many(
      `SELECT id, slug, item_index, data, is_hidden, is_imported, edited_at
         FROM content_items
        WHERE section_id = $1
        ORDER BY item_index, id`,
      [section.id]
    );

    res.json({
      section: {
        key: section.key,
        title: section.title,
        pages: section.pages,
        kind: section.kind,
        sourceType: section.source_type,
        containerSelector: section.container_selector,
        itemSelector: section.item_selector,
        matchBy: section.match_by,
        importedCount: section.imported_count,
        fields: section.fields,
        templateHtml: section.template_html,
      },
      items: items.map((item) => ({
        id: item.id,
        slug: item.slug,
        index: item.item_index,
        data: item.data,
        hidden: item.is_hidden,
        imported: item.is_imported,
        editedAt: item.edited_at ? new Date(item.edited_at).toISOString() : null,
      })),
    });
  })
);

/* ----------------------------------------------------------------- create */

router.post(
  "/:key/items",
  asyncRoute(async (req, res) => {
    const section = await loadSection(req.params.key);

    if (section.kind !== "collection") throw badRequest("This section holds a single value");

    const schema = z
      .object({
        data: buildDataSchema(section.fields, { partial: true }).optional().default({}),
        hidden: z.boolean().optional(),
      })
      .strict();

    const body = schema.parse(req.body || {});

    await assertMatchValueUnique(section, body.data);

    const slugBase = slugify(body.data.title || body.data.name || body.data.label || section.key);
    const slug = await nextSlug(section, slugBase);

    const item = await db.one(
      `INSERT INTO content_items (section_id, slug, item_index, data, is_hidden, is_imported, edited_at)
       VALUES ($1, $2,
               (SELECT COALESCE(MAX(item_index) + 1, 0) FROM content_items WHERE section_id = $1),
               $3::jsonb, $4, false, now())
       RETURNING id, slug, item_index, data, is_hidden, is_imported, edited_at`,
      [section.id, slug, JSON.stringify(body.data), Boolean(body.hidden)]
    );

    await audit(db, {
      adminId: req.admin.id,
      action: "content.create",
      entity: "content_item",
      entityId: item.id,
      detail: { section: section.key, slug: item.slug },
    });

    res.status(201).json({
      item: {
        id: item.id,
        slug: item.slug,
        index: item.item_index,
        data: item.data,
        hidden: item.is_hidden,
        imported: item.is_imported,
        editedAt: item.edited_at ? new Date(item.edited_at).toISOString() : null,
      },
    });
  })
);

/* ----------------------------------------------------------------- update */

router.patch(
  "/:key/items/:itemId",
  asyncRoute(async (req, res) => {
    const section = await loadSection(req.params.key);
    const existing = await loadItem(section, Number(req.params.itemId));

    const schema = z
      .object({
        data: buildDataSchema(section.fields, { partial: true }).optional(),
        hidden: z.boolean().optional(),
        slug: z.string().min(1).max(120).optional(),
      })
      .strict()
      .refine((value) => value.data !== undefined || value.hidden !== undefined || value.slug !== undefined, {
        message: "Nothing to update",
      });

    const body = schema.parse(req.body || {});

    const data = body.data ? mergeData(existing.data, body.data, section.fields) : existing.data;

    await assertMatchValueUnique(section, data, existing.id);

    const slug = body.slug ? await nextSlug(section, slugify(body.slug), existing.id) : existing.slug;

    const item = await db.one(
      `UPDATE content_items
          SET data = $1::jsonb,
              is_hidden = COALESCE($2, is_hidden),
              slug = $3,
              edited_at = now()
        WHERE id = $4 AND section_id = $5
        RETURNING id, slug, item_index, data, is_hidden, is_imported, edited_at`,
      [JSON.stringify(data), body.hidden === undefined ? null : body.hidden, slug, existing.id, section.id]
    );

    await audit(db, {
      adminId: req.admin.id,
      action: body.hidden !== undefined && body.data === undefined ? "content.hide" : "content.update",
      entity: "content_item",
      entityId: item.id,
      detail: {
        section: section.key,
        fields: body.data ? Object.keys(body.data) : [],
        hidden: body.hidden,
      },
    });

    res.json({
      item: {
        id: item.id,
        slug: item.slug,
        index: item.item_index,
        data: item.data,
        hidden: item.is_hidden,
        imported: item.is_imported,
        editedAt: item.edited_at ? new Date(item.edited_at).toISOString() : null,
      },
    });
  })
);

/* ----------------------------------------------------------------- delete */

router.delete(
  "/:key/items/:itemId",
  asyncRoute(async (req, res) => {
    const section = await loadSection(req.params.key);

    if (section.kind !== "collection") throw badRequest("This section holds a single value");

    const existing = await loadItem(section, Number(req.params.itemId));

    await db.query("DELETE FROM content_items WHERE id = $1", [existing.id]);

    await audit(db, {
      adminId: req.admin.id,
      action: "content.delete",
      entity: "content_item",
      entityId: existing.id,
      detail: { section: section.key, slug: existing.slug, imported: existing.is_imported },
    });

    res.json({ ok: true, id: existing.id });
  })
);

/* ---------------------------------------------------------------- reorder */

/*
  The panel reorders with up/down buttons and needs the new order to survive a
  reload: the body carries every id of the section exactly once, in display
  order, and item_index is rewritten positionally.
*/
router.post(
  "/:key/reorder",
  asyncRoute(async (req, res) => {
    const section = await loadSection(req.params.key);

    /* ids arrive as JSON numbers or as the strings the API itself returns
       (postgres bigint columns are serialised as strings) */
    const itemIdSchema = z
      .union([z.number().int().positive().max(2 ** 52), z.string().regex(/^\d{1,16}$/)])
      .transform(Number);

    const body = z
      .object({ order: z.array(itemIdSchema).min(1).max(5000) })
      .strict()
      .parse(req.body || {});

    const { rows } = await db.query(
      "SELECT id FROM content_items WHERE section_id = $1",
      [section.id]
    );
    const current = rows.map((row) => Number(row.id));
    const incoming = body.order;
    const unique = new Set(incoming);

    if (
      unique.size !== incoming.length ||
      incoming.length !== current.length ||
      !current.every((id) => unique.has(id))
    ) {
      throw badRequest(
        `Reorder expects every item id of '${section.key}' exactly once ` +
          `(${current.length} ids, got ${incoming.length})`
      );
    }

    /*
      The public overlay only writes rows that carry edited_at onto their
      static node, so a row that moved keeps showing its old position unless
      it is stamped.  Touching only the rows whose index really changed keeps
      every untouched row byte-identical on the site.
    */
    await db.query(
      `UPDATE content_items i
          SET item_index = u.ord - 1,
              edited_at = CASE WHEN i.item_index <> u.ord - 1 THEN now() ELSE i.edited_at END
         FROM unnest($1::bigint[]) WITH ORDINALITY AS u(id, ord)
        WHERE i.id = u.id AND i.section_id = $2`,
      [incoming, section.id]
    );

    await audit(db, {
      adminId: req.admin.id,
      action: "content.reorder",
      entity: "content_section",
      entityId: section.id,
      detail: { section: section.key, order: incoming },
    });

    const items = await db.many(
      `SELECT id, slug, item_index, data, is_hidden, is_imported, edited_at
         FROM content_items
        WHERE section_id = $1
        ORDER BY item_index, id`,
      [section.id]
    );

    res.json({
      items: items.map((item) => ({
        id: item.id,
        slug: item.slug,
        index: item.item_index,
        data: item.data,
        hidden: item.is_hidden,
        imported: item.is_imported,
        editedAt: item.edited_at ? new Date(item.edited_at).toISOString() : null,
      })),
    });
  })
);

module.exports = router;
