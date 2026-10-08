"use strict";

const express = require("express");
const { z } = require("zod");
const db = require("../db/pool");
const { validate } = require("../middleware/validate");
const { asyncRoute, badRequest } = require("../lib/http");

const router = express.Router();

const querySchema = z.object({
  path: z
    .string()
    .min(1)
    .max(300)
    .regex(/^\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]*$/, "expected a plain site path like /events/archive.html"),
});

function normalisePath(pathname) {
  if (pathname === "/" || pathname === "") return "/index.html";
  return pathname.replace(/\/+$/, "") || "/index.html";
}

/*
  Public, unauthenticated endpoint the site uses to overlay edited content on
  the static markup.  Returns every section registered for that path.

  The browser only touches DOM nodes for items that carry edited_at, so an
  untouched install renders exactly the static HTML.
*/
router.get(
  "/content",
  validate(querySchema, "query"),
  asyncRoute(async (req, res) => {
    const page = normalisePath(req.query.path);

    const sections = await db.many(
      `SELECT id, key, title, kind, source_type, container_selector, item_selector,
              match_by, imported_count, fields, template_html
         FROM content_sections
        WHERE $1 = ANY(pages)
        ORDER BY key`,
      [page]
    );

    if (!sections.length) {
      res.json({ path: page, generatedAt: new Date().toISOString(), sections: [] });
      return;
    }

    const items = await db.many(
      `SELECT i.id, i.section_id, i.slug, i.item_index, i.data, i.is_hidden, i.is_imported, i.edited_at
         FROM content_items i
          JOIN content_sections s ON s.id = i.section_id
        WHERE s.key = ANY($1)
        ORDER BY i.item_index, i.id`,
      [sections.map((section) => section.key)]
    );

    const bySection = new Map(sections.map((section) => [section.key, []]));

    for (const item of items) {
      const section = sections.find((candidate) => candidate.id === item.section_id);
      if (!section) continue;
      bySection.get(section.key).push({
        id: item.id,
        slug: item.slug,
        index: item.item_index,
        data: item.data,
        hidden: item.is_hidden,
        imported: item.is_imported,
        editedAt: item.edited_at ? new Date(item.edited_at).toISOString() : null,
      });
    }

    res.set("Cache-Control", "no-cache");
    res.json({
      path: page,
      generatedAt: new Date().toISOString(),
      sections: sections.map((section) => ({
        key: section.key,
        title: section.title,
        kind: section.kind,
        sourceType: section.source_type,
        containerSelector: section.container_selector,
        itemSelector: section.item_selector,
        matchBy: section.match_by,
        importedCount: section.imported_count,
        fields: section.fields,
        templateHtml: section.template_html,
        items: bySection.get(section.key) || [],
      })),
    });
  })
);

module.exports = router;
