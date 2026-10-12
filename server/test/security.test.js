"use strict";

/*
  Security pass: CSP header, production JWT_SECRET enforcement, and upload
  restrictions (type, size, no overwrites).
*/

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const helpers = require("./helpers");

const ROOT = path.join(__dirname, "..", "..");

let token;

before(async () => {
  await helpers.start();
  await helpers.resetDatabase();
  const admin = await helpers.createAdmin({ email: "security-suite@example.test" });
  token = await helpers.login(admin.email, admin.password);
});

after(async () => {
  await helpers.stop();
});

/* ------------------------------------------------------------------ CSP */

test("every response carries a Content-Security-Policy", async () => {
  for (const p of ["/", "/contact.html", "/admin/", "/api/health"]) {
    const res = await helpers.request(p);
    const csp = res.headers.get("content-security-policy");
    assert.ok(csp, `${p} has a CSP header`);

    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /object-src 'none'/);
    assert.match(csp, /base-uri 'self'/);
    assert.match(csp, /frame-ancestors 'self'/);
    assert.match(csp, /form-action 'self'/);
    assert.match(csp, /script-src 'self' 'unsafe-inline'/);
  }
});

test("the CSP allows the origins the site actually uses", async () => {
  const res = await helpers.request("/contact.html");
  const csp = res.headers.get("content-security-policy");

  assert.match(csp, /fonts\.googleapis\.com/, "Google Fonts CSS");
  assert.match(csp, /fonts\.gstatic\.com/, "Google Fonts files");
  assert.match(csp, /cdnjs\.cloudflare\.com/, "Font Awesome");
  assert.match(csp, /script\.google\.com/, "Drive gallery feed");
  assert.match(csp, /frame-src[^;]*drive\.google\.com/, "Drive video previews");
  assert.match(csp, /frame-src[^;]*youtube\.com/, "YouTube embed");
});

test("helmet hardening headers are present and x-powered-by is gone", async () => {
  const res = await helpers.request("/contact.html");
  assert.equal(res.headers.get("x-powered-by"), null);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.equal(res.headers.get("x-frame-options"), "SAMEORIGIN"); /* matches frame-ancestors 'self' */
  assert.equal(res.headers.get("referrer-policy"), "no-referrer");
});

/* --------------------------------------------------- production JWT check */

function configLoads(env) {
  try {
    execFileSync(process.execPath, ["-e", "require('./server/src/config')"], {
      cwd: ROOT,
      env: { ...process.env, ...env },
      stdio: "pipe",
    });
    return { ok: true, output: "" };
  } catch (err) {
    return {
      ok: false,
      output: `${err.stderr || ""}${err.stdout || ""}${err.message || ""}`.toString(),
    };
  }
}

test("NODE_ENV=production refuses to start with a short JWT_SECRET", () => {
  const short = configLoads({
    NODE_ENV: "production",
    JWT_SECRET: "too-short",
    DOTENV_PATH: path.join(ROOT, "server", "test", "does-not-exist.env"),
  });

  assert.equal(short.ok, false, "the process exited with an error");
  assert.match(short.output, /JWT_SECRET/i);
});

test("NODE_ENV=production refuses to start without a JWT_SECRET", () => {
  const missing = configLoads({
    NODE_ENV: "production",
    JWT_SECRET: "",
    DOTENV_PATH: path.join(ROOT, "server", "test", "does-not-exist.env"),
  });

  assert.equal(missing.ok, false, "the process exited with an error");
  assert.match(missing.output, /JWT_SECRET/i);
});

test("NODE_ENV=production starts with a strong JWT_SECRET", () => {
  const strong = configLoads({
    NODE_ENV: "production",
    JWT_SECRET: "a".repeat(48),
    DOTENV_PATH: path.join(ROOT, "server", "test", "does-not-exist.env"),
  });

  assert.equal(strong.ok, true, `config loaded: ${strong.output}`);
});

test("development still runs without any JWT_SECRET", () => {
  const dev = configLoads({
    NODE_ENV: "development",
    JWT_SECRET: "",
    DOTENV_PATH: path.join(ROOT, "server", "test", "does-not-exist.env"),
  });

  assert.equal(dev.ok, true, `config loaded: ${dev.output}`);
});

/* -------------------------------------------------------------- uploads */

function pngBytes(size) {
  /* smallest valid PNG header + padding; the server checks the declared
     mime type, not the pixel data, so this is enough for the request */
  const header = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489",
    "hex"
  );
  return Buffer.concat([header, Buffer.alloc(Math.max(0, size - header.length), 0x42)]);
}

async function upload(filename, contentType, bytes, tok = token) {
  const baseUrl = helpers.baseUrl();
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: contentType }), filename);

  const res = await fetch(`${baseUrl}/api/admin/uploads`, {
    method: "POST",
    headers: tok ? { Authorization: `Bearer ${tok}` } : {},
    body: form,
  });

  let json = null;
  const text = await res.text();
  try {
    json = text ? JSON.parse(text) : null;
  } catch (err) {
    json = text;
  }

  return { status: res.status, body: json };
}

test("uploads require authentication", async () => {
  const res = await upload("logo.png", "image/png", pngBytes(64), null);
  assert.equal(res.status, 401);
});

test("a valid PNG is accepted and stored under a unique name", async () => {
  const res = await upload("logo.png", "image/png", pngBytes(1024));
  assert.equal(res.status, 201, JSON.stringify(res.body));
  assert.match(res.body.upload.url, /^\/uploads\//);
  assert.match(res.body.upload.filename, /^\d+-[0-9a-f]+-logo\.png$/);
});

test("two uploads with the same original name never overwrite each other", async () => {
  const first = await upload("logo.png", "image/png", pngBytes(2048));
  const second = await upload("logo.png", "image/png", pngBytes(4096));

  assert.equal(first.status, 201, JSON.stringify(first.body));
  assert.equal(second.status, 201, JSON.stringify(second.body));
  assert.notEqual(first.body.upload.filename, second.body.upload.filename);

  const dir = path.join(ROOT, "server", "uploads");
  const a = fs.statSync(path.join(dir, first.body.upload.filename));
  const b = fs.statSync(path.join(dir, second.body.upload.filename));

  assert.equal(a.size, 2048, "the first file kept its own bytes");
  assert.equal(b.size, 4096, "the second file did not clobber it");
});

test("non-image mime types are rejected", async () => {
  const html = await upload("evil.html", "text/html", Buffer.from("<script>alert(1)</script>"));
  assert.equal(html.status, 400);
  assert.match(JSON.stringify(html.body), /unsupported file type/i);

  const js = await upload("evil.js", "application/javascript", Buffer.from("alert(1)"));
  assert.equal(js.status, 400);

  const svg = await upload("ok.svg", "image/svg+xml", Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"));
  assert.equal(svg.status, 201, "svg is on the allow-list");
});

test("uploads larger than 5 MB are rejected", async () => {
  const res = await upload("huge.png", "image/png", pngBytes(6 * 1024 * 1024));
  assert.equal(res.status, 413, JSON.stringify(res.body));
});
