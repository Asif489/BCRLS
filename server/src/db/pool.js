"use strict";

const { Pool } = require("pg");
const config = require("../config");
const logger = require("../logger");

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => logger.error("postgres pool error", { error: err.message }));

async function query(text, params) {
  return pool.query(text, params);
}

async function one(text, params) {
  const { rows } = await pool.query(text, params);
  return rows[0] || null;
}

async function many(text, params) {
  const { rows } = await pool.query(text, params);
  return rows;
}

/** Runs `fn(client)` inside a transaction, rolling back on any throw. */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      logger.error("rollback failed", { error: rollbackErr.message });
    }
    throw err;
  } finally {
    client.release();
  }
}

async function close() {
  await pool.end();
}

module.exports = { pool, query, one, many, withTransaction, close };
