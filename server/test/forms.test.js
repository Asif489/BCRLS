"use strict";

/* Public form endpoint: valid, invalid, honeypot, unknown key. */

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const helpers = require("./helpers");

before(async () => {
  await helpers.start();
  await helpers.resetDatabase();
});

after(async () => {
  await helpers.stop();
});

function post(formKey, body, extra = {}) {
  return helpers.request(`/api/forms/${formKey}`, {
    method: "POST",
    body,
    ...extra,
  });
}

async function countFor(formKey) {
  const { rows } = await helpers
    .db()
    .query("SELECT count(*)::int AS n FROM form_submissions WHERE form_key = $1", [formKey]);
  return rows[0].n;
}

test("a valid contact submission is stored and audited", async () => {
  const before = await countFor("contact");

  const res = await post("contact", {
    name: "Form Test",
    email: "forms@example.test",
    message: "Hello from the suite",
    page: "/contact.html",
  });

  assert.equal(res.status, 202);
  assert.equal(res.body.ok, true);
  assert.ok(res.body.id);

  assert.equal(await countFor("contact"), before + 1);

  const { rows } = await helpers
    .db()
    .query("SELECT payload, page FROM form_submissions WHERE id = $1", [res.body.id]);
  assert.equal(rows[0].payload.email, "forms@example.test");
  assert.equal(rows[0].page, "/contact.html");

  const audit = await helpers
    .db()
    .query("SELECT action FROM audit_log WHERE entity = 'form_submission' AND entity_id = $1", [
      String(res.body.id),
    ]);
  assert.equal(audit.rows.length, 1);
  assert.equal(audit.rows[0].action, "form.submit");
});

test("every wired form key is accepted", async () => {
  const keys = [
    "contact",
    "connection",
    "newsletter",
    "member",
    "fellow",
    "internship",
    "partner",
    "volunteer",
  ];

  for (const key of keys) {
    const res = await post(key, {
      name: "Suite Tester",
      email: `${key}-suite@example.test`,
      page: "/__test__.html",
    });
    assert.equal(res.status, 202, `${key} accepted (got ${res.status}: ${JSON.stringify(res.body)})`);
  }
});

test("a missing or malformed e-mail is rejected with details", async () => {
  const before = await countFor("contact");

  const missing = await post("contact", { name: "No Mail", message: "hi" });
  assert.equal(missing.status, 400);
  assert.ok(Array.isArray(missing.body.error.details));
  assert.ok(missing.body.error.details.some((d) => /e-mail is required/i.test(d.message)));

  const malformed = await post("contact", { name: "Bad Mail", email: "not-an-email", message: "hi" });
  assert.equal(malformed.status, 400);
  assert.ok(malformed.body.error.details.some((d) => /valid e-mail/i.test(d.message)));

  assert.equal(await countFor("contact"), before, "invalid payloads are not stored");
});

test("a name is required where the form asks for one", async () => {
  const res = await post("contact", { name: "   ", email: "someone@example.test", message: "hi" });
  assert.equal(res.status, 400);
  assert.ok(res.body.error.details.some((d) => /name is required/i.test(d.message)));
});

test("the newsletter form only needs an e-mail", async () => {
  const res = await post("newsletter", { email: "only-mail@example.test", page: "/index.html" });
  assert.equal(res.status, 202);
});

test("a filled honeypot is accepted but stored nowhere", async () => {
  const before = await countFor("contact");

  const res = await post("contact", {
    name: "Bot",
    email: "bot@example.test",
    message: "buy now",
    website: "http://spam.example",
  });

  assert.equal(res.status, 202);
  assert.equal(res.body.queued, false, "the bot sees a normal success");
  assert.equal(await countFor("contact"), before, "nothing was written");
});

test("an unknown form key is refused", async () => {
  const res = await post("does-not-exist", { email: "x@example.test" });
  assert.equal(res.status, 400);
  assert.match(res.body.error.message, /unknown form/i);
});

test("oversized payloads are refused", async () => {
  const res = await post("contact", {
    name: "Big",
    email: "big@example.test",
    message: "x".repeat(6000),
  });
  assert.equal(res.status, 400);
});

test("too many fields are refused", async () => {
  const body = { email: "many@example.test" };
  for (let i = 0; i < 45; i += 1) body[`field${i}`] = "v";

  const res = await post("contact", body);
  assert.equal(res.status, 400);
});
