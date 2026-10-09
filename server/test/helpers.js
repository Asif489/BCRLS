"use strict";

/*
  Test bootstrap.

  Requiring this module MUST happen before any server/src module: it points
  DATABASE_URL at a dedicated `*_test` database and NODE_ENV at "test" so
  server/src/config.js picks them up when it is first loaded.

  Usage:

    const { start, stop, request, createAdmin, login } = require("./helpers");
    before(start);
    after(stop);
*/

const path = require("path");
const dotenv = require("dotenv");
const { URL } = require("url");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

/* --------------------------------------------- environment first */

function testDatabase() {
  const raw = process.env.DATABASE_URL || "postgres://bcrls:bcrls@127.0.0.1:5432/bcrls";
  const url = new URL(raw);
  /*
    `node --test` runs every test file in its own process and in parallel,
    so each file gets its own database (bcrls_test_<file>) to keep the
    suites from truncating each other's rows.
  */
  const suite = path
    .basename(process.argv[1] || "suite", ".js")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 40);
  const name = `${(url.pathname.slice(1).split("?")[0] || "bcrls")}_test${suite ? `_${suite}` : ""}`;
  url.pathname = `/${name}`;
  return { url: url.toString(), name };
}

const testDb = testDatabase();

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = testDb.url;
process.env.SITE_ROOT = process.env.SITE_ROOT || ".";
process.env.STORAGE_DRIVER = "local";

/* ----------------------------------------------- server lifecycle */

let state = null;
let adminSeq = 0;

async function ensureDatabase() {
  const { Pool } = require("pg");
  const adminUrl = new URL(testDb.url);
  adminUrl.pathname = "/postgres";
  const pool = new Pool({ connectionString: adminUrl.toString(), connectionTimeoutMillis: 5000 });

  try {
    await pool.query(`CREATE DATABASE "${testDb.name.replace(/"/g, '""')}"`);
  } catch (err) {
    if (err.code !== "42P04") throw err; /* 42P04 = duplicate_database */
  } finally {
    await pool.end();
  }
}

async function start() {
  if (state) return state;

  await ensureDatabase();

  const { migrate } = require("../src/db/migrate");
  await migrate();

  const { createApp } = require("../src/app");
  const db = require("../src/db/pool");

  const server = await new Promise((resolve) => {
    const s = createApp().listen(0, "127.0.0.1", () => resolve(s));
  });

  state = {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    server,
    db,
  };

  return state;
}

async function stop() {
  if (!state) return;
  const { server, db } = state;
  state = null;
  await new Promise((resolve) => server.close(resolve));
  await db.close();
}

function requireState() {
  if (!state) throw new Error("helpers.start() has not been awaited yet");
  return state;
}

/* ------------------------------------------------------ requests */

async function request(pathname, { method = "GET", token, body, headers = {} } = {}) {
  const { baseUrl } = requireState();

  const opts = { method, headers: { ...headers } };
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(baseUrl + pathname, opts);
  const text = await res.text();

  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (err) {
    json = text;
  }

  return { status: res.status, body: json, headers: res.headers };
}

/* ---------------------------------------------------------- admins */

const bcrypt = require("bcryptjs");

async function createAdmin({
  email,
  password = "test-password-123",
  role = "admin",
  active = true,
  name = "Test Admin",
} = {}) {
  const { db } = requireState();
  adminSeq += 1;
  const address = email || `admin-${Date.now()}-${adminSeq}@example.test`;

  const { rows } = await db.query(
    `INSERT INTO admins (email, password_hash, display_name, role, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, display_name, role, is_active`,
    [address, bcrypt.hashSync(password, 4), name, role, active]
  );

  return { ...rows[0], password };
}

async function login(email, password) {
  const res = await request("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (res.status !== 200) {
    throw new Error(`login failed (${res.status}): ${JSON.stringify(res.body)}`);
  }

  return res.body.token;
}

/* ----------------------------------------------------------- data */

async function resetDatabase() {
  const { db } = requireState();
  await db.query(
    "TRUNCATE content_items, content_sections, form_submissions, audit_log, uploads, admins CASCADE"
  );
}

const TEST_FIELDS = {
  eventId: { sel: "@", label: "Event id", type: "number", mode: "attr", attr: "data-event-id" },
  title: { sel: "h3", label: "Title", type: "text", mode: "text" },
  summary: { sel: "p", label: "Summary", type: "text", mode: "html" },
  linkUrl: { sel: "a", label: "Link", type: "url", mode: "attr", attr: "href" },
};

async function createTestSection(overrides = {}) {
  const { db } = requireState();

  const section = {
    key: "test-cards",
    title: "Test cards",
    pages: ["/__test__.html"],
    kind: "collection",
    sourceType: "html",
    containerSelector: ".test-grid",
    itemSelector: ".test-card",
    matchBy: "eventId",
    fields: TEST_FIELDS,
    templateHtml: null,
    ...overrides,
  };

  const { rows } = await db.query(
    `INSERT INTO content_sections
       (key, title, pages, kind, source_type, container_selector, item_selector,
        match_by, fields, template_html)
     VALUES ($1, $2, $3::text[], $4, $5, $6, $7, $8, $9::jsonb, $10)
     ON CONFLICT (key) DO UPDATE SET
       title = EXCLUDED.title, pages = EXCLUDED.pages, kind = EXCLUDED.kind,
       source_type = EXCLUDED.source_type, container_selector = EXCLUDED.container_selector,
       item_selector = EXCLUDED.item_selector, match_by = EXCLUDED.match_by,
       fields = EXCLUDED.fields, template_html = EXCLUDED.template_html
     RETURNING id, key, match_by`,
    [
      section.key,
      section.title,
      section.pages,
      section.kind,
      section.sourceType,
      section.containerSelector,
      section.itemSelector,
      section.matchBy,
      JSON.stringify(section.fields),
      section.templateHtml,
    ]
  );

  /* deterministic slate: each test starts from an empty section */
  await db.query("DELETE FROM content_items WHERE section_id = $1", [rows[0].id]);

  return rows[0];
}

async function insertItem(sectionId, data, itemIndex = 0, { edited = false, hidden = false } = {}) {
  const { db } = requireState();

  const { rows } = await db.query(
    `INSERT INTO content_items (section_id, slug, item_index, data, is_imported, is_hidden, edited_at)
     VALUES ($1, $2, $3, $4::jsonb, true, $5, CASE WHEN $6 THEN now() ELSE NULL END)
     RETURNING id, slug, item_index`,
    [
      sectionId,
      `row-${itemIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      itemIndex,
      JSON.stringify(data),
      hidden,
      edited,
    ]
  );

  return rows[0];
}

module.exports = {
  start,
  stop,
  request,
  createAdmin,
  login,
  resetDatabase,
  createTestSection,
  insertItem,
  TEST_FIELDS,
  testDatabase,
  db: () => requireState().db,
  baseUrl: () => requireState().baseUrl,
};
