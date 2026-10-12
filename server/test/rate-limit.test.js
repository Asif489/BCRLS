"use strict";

/* Login + form submission rate limits (own file: limiters are per-process). */

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const helpers = require("./helpers");

before(async () => {
  await helpers.start();
  await helpers.resetDatabase();
  await helpers.createAdmin({ email: "ratelimit@example.test", password: "rate-password-123" });
});

after(async () => {
  await helpers.stop();
});

test("login is rate limited after 10 attempts in the window", async () => {
  const statuses = [];

  for (let i = 0; i < 12; i += 1) {
    const res = await helpers.request("/api/auth/login", {
      method: "POST",
      body: { email: "ratelimit@example.test", password: "wrong-password" },
    });
    statuses.push(res.status);
  }

  assert.equal(statuses.slice(0, 10).every((s) => s === 401), true, `first 10 are 401, got ${statuses}`);
  assert.ok(statuses.includes(429), `a 429 was served, got ${statuses}`);
  assert.equal(statuses[10], 429, "the 11th attempt is rejected by the limiter");
});

test("form submissions are rate limited after 20 in the window", async () => {
  const statuses = [];

  for (let i = 0; i < 23; i += 1) {
    const res = await helpers.request("/api/forms/contact", {
      method: "POST",
      body: { name: "Rate Test", email: "rate@example.test", message: `attempt ${i}` },
    });
    statuses.push(res.status);
  }

  assert.equal(
    statuses.slice(0, 20).every((s) => s === 202),
    true,
    `first 20 accepted, got ${statuses.filter((s) => s !== 202).join(",")}`
  );
  assert.ok(statuses.includes(429), `a 429 was served, got ${statuses}`);
});
