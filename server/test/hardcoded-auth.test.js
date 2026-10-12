"use strict";

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../src/app");

let server;
let baseUrl;

before(async () => {
  const app = createApp();
  server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

async function apiRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return { status: res.status, body };
}

test("Admin 1 login succeeds with hardcoded credentials and returns full admin access", async () => {
  const res = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email: "admin1@gmail.com", password: "Admin1234@" },
  });

  assert.equal(res.status, 200);
  assert.ok(res.body.token, "JWT token must be present");
  assert.equal(res.body.admin.email, "admin1@gmail.com");
  assert.equal(res.body.admin.role, "admin");

  // Verify protected /me endpoint works without querying database
  const me = await apiRequest("/api/auth/me", { token: res.body.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.admin.email, "admin1@gmail.com");
  assert.equal(me.body.admin.role, "admin");
});

test("Admin 2 login succeeds with hardcoded credentials and returns full admin access", async () => {
  const res = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email: "admin2@gmail.com", password: "ADmin1234@" },
  });

  assert.equal(res.status, 200);
  assert.ok(res.body.token, "JWT token must be present");
  assert.equal(res.body.admin.email, "admin2@gmail.com");
  assert.equal(res.body.admin.role, "admin");

  // Verify protected /me endpoint works without querying database
  const me = await apiRequest("/api/auth/me", { token: res.body.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.admin.email, "admin2@gmail.com");
  assert.equal(me.body.admin.role, "admin");
});

test("Email matching is case-insensitive for hardcoded admins", async () => {
  const res = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email: "ADMIN1@GMAIL.COM", password: "Admin1234@" },
  });

  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.admin.email, "admin1@gmail.com");
  assert.equal(res.body.admin.role, "admin");
});

test("Password matching is case-sensitive: Admin 2 rejects Admin1234@", async () => {
  // Admin 2 password is 'ADmin1234@' with capital D
  const res = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email: "admin2@gmail.com", password: "Admin1234@" },
  });

  // Does not match hardcoded credentials, falls back to DB which has no row or fails
  assert.notEqual(res.status, 200);
});

test("Wrong password for Admin 1 falls back to database flow and does not grant access", async () => {
  const res = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email: "admin1@gmail.com", password: "WrongPassword999" },
  });

  assert.notEqual(res.status, 200);
});

test("Hardcoded admin token cannot change password via /api/auth/password", async () => {
  const loginRes = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email: "admin1@gmail.com", password: "Admin1234@" },
  });
  assert.equal(loginRes.status, 200);

  const pwRes = await apiRequest("/api/auth/password", {
    method: "POST",
    token: loginRes.body.token,
    body: {
      currentPassword: "Admin1234@",
      newPassword: "NewSecretPassword123#",
    },
  });

  assert.equal(pwRes.status, 400);
  assert.match(pwRes.body.error.message, /hardcoded/i);
});

test("Protected routes reject requests without a token or with a garbage token", async () => {
  const noToken = await apiRequest("/api/auth/me");
  assert.equal(noToken.status, 401);

  const garbageToken = await apiRequest("/api/auth/me", { token: "invalid.jwt.token" });
  assert.equal(garbageToken.status, 401);
});
