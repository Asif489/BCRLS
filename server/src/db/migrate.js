"use strict";

const fs = require("fs");
const path = require("path");
const { pool } = require("./pool");

const MIGRATIONS_DIR = path.join(__dirname, "..", "..", "migrations");

async function appliedMigrations(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  const { rows } = await client.query("SELECT name FROM schema_migrations");
  return new Set(rows.map((r) => r.name));
}

/**
 * Applies every pending file in server/migrations/ once, in name order,
 * each file inside its own transaction.
 */
async function migrate(log = () => {}) {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  const client = await pool.connect();
  const applied = new Set();
  const done = [];

  try {
    const already = await appliedMigrations(client);

    for (const file of files) {
      if (already.has(file)) continue;

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        err.message = `${file}: ${err.message}`;
        throw err;
      }

      applied.add(file);
      done.push(file);
      log(`applied ${file}`);
    }

    if (!done.length) log("database is up to date");
    return { applied: done, total: files.length, alreadyApplied: [...already] };
  } finally {
    client.release();
  }
}

module.exports = { migrate, MIGRATIONS_DIR };
