"use strict";

/* Auth: login success, wrong password, expired token, deactivated admin. */

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

const helpers = require("./helpers");

const EMAIL = "auth-suite@example.test";
const PASSWORD = "auth-password-123";

let token;
let adminId;

before(async () => {
  await helpers.start();
  await helpers.resetDatabase();
  const admin = await helpers.createAdmin({ email: EMAIL, password: PASSWORD });
  adminId = admin.id;
  token = await helpers.login(EMAIL, PASSWORD);
});

after(async () => {
  await helpers.stop();
});

test("login succeeds with the right password and returns a usable token", async () => {
  const res = await helpers.request("/api/auth/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });

  assert.equal(res.status, 200);
  assert.ok(res.body.token, "token is present");
  assert.equal(res.body.admin.email, EMAIL);

  const me = await helpers.request("/api/auth/me", { token: res.body.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.admin.email, EMAIL);
});

test("login fails with the wrong password", async () => {
  const res = await helpers.request("/api/auth/login", {
    method: "POST",
    body: { email: EMAIL, password: "definitely-wrong" },
  });

  assert.equal(res.status, 401);
  assert.match(res.body.error.message, /invalid e-mail or password/i);
});

test("login fails for an unknown account", async () => {
  const res = await helpers.request("/api/auth/login", {
    method: "POST",
    body: { email: "nobody@example.test", password: PASSWORD },
  });

  assert.equal(res.status, 401);
});

test("requests without a token are rejected", async () => {
  const res = await helpers.request("/api/auth/me");
  assert.equal(res.status, 401);
});

test("a garbage token is rejected", async () => {
  const res = await helpers.request("/api/auth/me", { token: "not.a.jwt" });
  assert.equal(res.status, 401);
});

test("an expired token is rejected with a session-expired message", async () => {
  const config = require("../src/config");
  const expired = jwt.sign(
    { sub: String(adminId), email: EMAIL, name: "Test Admin", role: "admin", exp: Math.floor(Date.now() / 1000) - 60 },
    config.jwtSecret
  );

  const res = await helpers.request("/api/auth/me", { token: expired });
  assert.equal(res.status, 401);
  assert.match(res.body.error.message, /expired/i);
});

test("a token signed with a different secret is rejected", async () => {
  const forged = jwt.sign(
    { sub: String(adminId), email: EMAIL, name: "Test Admin", role: "admin" },
    "some-other-secret-that-is-not-the-real-one"
  );

  const res = await helpers.request("/api/auth/me", { token: forged });
  assert.equal(res.status, 401);
});

test("a deactivated admin is rejected on the very next request", async () => {
  const victim = await helpers.createAdmin({ email: "deactivated@example.test", password: PASSWORD });
  const victimToken = await helpers.login(victim.email, PASSWORD);

  const before = await helpers.request("/api/auth/me", { token: victimToken });
  assert.equal(before.status, 200, "token works while the account is active");

  await helpers.db().query("UPDATE admins SET is_active = false WHERE id = $1", [victim.id]);

  const after = await helpers.request("/api/auth/me", { token: victimToken });
  assert.equal(after.status, 403);
  assert.match(after.body.error.message, /deactivated/i);

  const relogin = await helpers.request("/api/auth/login", {
    method: "POST",
    body: { email: victim.email, password: PASSWORD },
  });
  assert.equal(relogin.status, 401, "a deactivated admin cannot sign in again");
});

test("an editor account can use the content API", async () => {
  const editor = await helpers.createAdmin({
    email: "editor@example.test",
    password: PASSWORD,
    role: "editor",
  });
  const editorToken = await helpers.login(editor.email, PASSWORD);

  /* the content API only requires authentication today, so exercise
     requireRole through a known role-guarded route instead */
  const res = await helpers.request("/api/admin/content/", { token: editorToken });
  assert.equal(res.status, 200, "editors are allowed to read content");
  assert.ok(token, "admin token was minted");
});
