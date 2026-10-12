#!/usr/bin/env node
"use strict";

/*
  Loads server/seed/legacy/content.json (produced by `npm run extract`)
  into content_sections / content_items.

  Re-running is safe: section metadata is refreshed from the extractor, but
  rows an administrator has already touched (edited_at IS NOT NULL) are never
  overwritten.

    npm run db:seed
*/

const fs = require("fs");
const path = require("path");
const db = require("../src/db/pool");

const SEED_FILE = path.join(__dirname, "..", "seed", "legacy", "content.json");

async function seedSection(client, section) {
  const stats = { sections: 1, itemsInserted: 0, itemsRefreshed: 0 };

  const { rows } = await client.query(
    `INSERT INTO content_sections
       (key, title, pages, kind, source_type, container_selector, item_selector,
        match_by, imported_count, fields, template_html, sort_order)
     VALUES ($1, $2, $3::text[], $4, $5, $6, $7, $8, $9, $10::jsonb, $11, 0)
     ON CONFLICT (key) DO UPDATE SET
       title              = EXCLUDED.title,
       pages              = EXCLUDED.pages,
       kind               = EXCLUDED.kind,
       source_type        = EXCLUDED.source_type,
       container_selector = EXCLUDED.container_selector,
       item_selector      = EXCLUDED.item_selector,
       match_by           = EXCLUDED.match_by,
       imported_count     = EXCLUDED.imported_count,
       fields             = EXCLUDED.fields,
       template_html      = EXCLUDED.template_html
     RETURNING id`,
    [
      section.key,
      section.title,
      section.pages,
      section.kind,
      section.sourceType,
      section.containerSelector,
      section.itemSelector,
      section.matchBy,
      section.importedCount,
      JSON.stringify(section.fields),
      section.templateHtml,
    ]
  );

  const sectionId = rows[0].id;

  for (const item of section.items) {
    const { rows: itemRows } = await client.query(
      `INSERT INTO content_items (section_id, slug, item_index, data, is_imported)
       VALUES ($1, $2, $3, $4::jsonb, true)
       ON CONFLICT (section_id, slug) DO UPDATE SET
         data        = CASE WHEN content_items.edited_at IS NULL THEN EXCLUDED.data ELSE content_items.data END,
         item_index  = CASE WHEN content_items.edited_at IS NULL THEN EXCLUDED.item_index ELSE content_items.item_index END
       RETURNING (xmax = 0) AS inserted`,
      [sectionId, item.slug, item.index, JSON.stringify(item.data || {})]
    );

    if (itemRows[0].inserted) stats.itemsInserted += 1;
    else stats.itemsRefreshed += 1;
  }

  return stats;
}

async function main() {
  if (!fs.existsSync(SEED_FILE)) {
    throw new Error(`seed file missing: ${SEED_FILE} (run "npm run extract" first)`);
  }

  const payload = JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));
  const total = { sections: 0, itemsInserted: 0, itemsRefreshed: 0 };

  await db.withTransaction(async (client) => {
    for (const section of payload.sections) {
      const stats = await seedSection(client, section);
      total.sections += stats.sections;
      total.itemsInserted += stats.itemsInserted;
      total.itemsRefreshed += stats.itemsRefreshed;
    }
  });

  console.log(
    `[seed] ${total.sections} sections, ${total.itemsInserted} items inserted, ` +
      `${total.itemsRefreshed} items refreshed (rows with admin edits are left alone)`
  );
}

main()
  .catch((err) => {
    console.error(`[seed] FAILED: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => db.close());
