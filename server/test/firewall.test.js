"use strict";

/* The repository firewall: no server file or dotfile over HTTP. */

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const helpers = require("./helpers");

before(async () => {
  await helpers.start();
});

after(async () => {
  await helpers.stop();
});

const FORBIDDEN = [
  "/server/src/app.js",
  "/server/src/config.js",
  "/server/../.env",
  "/.env",
  "/package.json",
  "/package-lock.json",
  "/.gitignore",
  "/README.md",
  "/docs/AUDIT.md",
  "/node_modules/express/package.json",
];

test("repository files are forbidden", async () => {
  for (const path of FORBIDDEN) {
    const res = await helpers.request(path);
    assert.equal(res.status, 403, `${path} must be 403, got ${res.status}`);
  }
});

test("the health endpoint still answers", async () => {
  const res = await helpers.request("/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
});

test("the static site is still served", async () => {
  const res = await helpers.request("/index.html");
  assert.equal(res.status, 200);
  assert.match(String(res.body), /<!DOCTYPE html>/i);
});

test("the admin panel is still served", async () => {
  const res = await helpers.request("/admin/");
  assert.equal(res.status, 200);
});

test("unknown API paths return JSON 404", async () => {
  const res = await helpers.request("/api/nope");
  assert.equal(res.status, 404);
  assert.equal(res.body.error.message, "Not found");
});
