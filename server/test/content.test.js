"use strict";

/* Content CRUD: create, update, hide, delete, validation, 409, XSS, URLs. */

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const helpers = require("./helpers");

let token;
let section;

before(async () => {
  await helpers.start();
  await helpers.resetDatabase();
  const admin = await helpers.createAdmin({ email: "content-suite@example.test" });
  token = await helpers.login(admin.email, admin.password);
  section = await helpers.createTestSection();
});

after(async () => {
  await helpers.stop();
});

function auth(extra = {}) {
  return { token, ...extra };
}

test("the section list includes counts for the panel dashboard", async () => {
  const res = await helpers.request("/api/admin/content/", auth());
  assert.equal(res.status, 200);
  const found = res.body.sections.find((s) => s.key === section.key);
  assert.ok(found, "test section is listed");
  assert.equal(typeof found.item_count, "number");
});

test("unauthenticated content API access is rejected", async () => {
  const res = await helpers.request("/api/admin/content/");
  assert.equal(res.status, 401);
});

test("create stores an item and stamps it as edited", async () => {
  const res = await helpers.request(`/api/admin/content/${section.key}/items`, auth({
    method: "POST",
    body: { data: { eventId: 1, title: "First card", summary: "A plain summary" } },
  }));

  assert.equal(res.status, 201);
  assert.equal(res.body.item.data.title, "First card");
  assert.ok(res.body.item.editedAt, "new rows carry editedAt so the overlay sends them");
  assert.ok(res.body.item.slug);
});

test("create rejects undeclared fields and bad types", async () => {
  const unknownField = await helpers.request(`/api/admin/content/${section.key}/items`, auth({
    method: "POST",
    body: { data: { eventId: 2, title: "x", evilField: "nope" } },
  }));
  assert.equal(unknownField.status, 400);

  const badNumber = await helpers.request(`/api/admin/content/${section.key}/items`, auth({
    method: "POST",
    body: { data: { eventId: "not-a-number", title: "x" } },
  }));
  assert.equal(badNumber.status, 400);
});

test("the duplicate matchBy value is refused with 409", async () => {
  const res = await helpers.request(`/api/admin/content/${section.key}/items`, auth({
    method: "POST",
    body: { data: { eventId: 1, title: "Clone of the first card" } },
  }));

  assert.equal(res.status, 409);
  assert.match(res.body.error.message, /duplicate eventId/i);
  assert.equal(res.body.error.details.field, "eventId");
});

test("update merges data, stamps editedAt and leaves other rows alone", async () => {
  const created = await helpers.request(`/api/admin/content/${section.key}/items`, auth({
    method: "POST",
    body: { data: { eventId: 5, title: "Editable", summary: "before" } },
  }));
  const id = created.body.item.id;

  const untouched = await helpers.db().one(
    "SELECT edited_at FROM content_items WHERE id = (SELECT min(id) FROM content_items)"
  );

  const res = await helpers.request(`/api/admin/content/${section.key}/items/${id}`, auth({
    method: "PATCH",
    body: { data: { summary: "after" } },
  }));

  assert.equal(res.status, 200);
  assert.equal(res.body.item.data.summary, "after");
  assert.equal(res.body.item.data.title, "Editable", "PATCH merges, not replaces");
  assert.ok(res.body.item.editedAt);

  const stillUntouched = await helpers.db().one(
    "SELECT edited_at FROM content_items WHERE id = (SELECT min(id) FROM content_items)"
  );
  assert.deepEqual(
    stillUntouched.edited_at,
    untouched.edited_at,
    "an unrelated row's edited_at does not move"
  );
});

test("hide toggles is_hidden without deleting the row", async () => {
  const created = await helpers.request(`/api/admin/content/${section.key}/items`, auth({
    method: "POST",
    body: { data: { eventId: 6, title: "Hideable" } },
  }));
  const id = created.body.item.id;

  const hidden = await helpers.request(`/api/admin/content/${section.key}/items/${id}`, auth({
    method: "PATCH",
    body: { hidden: true },
  }));
  assert.equal(hidden.status, 200);
  assert.equal(hidden.body.item.hidden, true);

  const row = await helpers.db().one("SELECT is_hidden FROM content_items WHERE id = $1", [id]);
  assert.equal(row.is_hidden, true);

  const shown = await helpers.request(`/api/admin/content/${section.key}/items/${id}`, auth({
    method: "PATCH",
    body: { hidden: false },
  }));
  assert.equal(shown.body.item.hidden, false);
});

test("delete removes the row and the item 404s afterwards", async () => {
  const created = await helpers.request(`/api/admin/content/${section.key}/items`, auth({
    method: "POST",
    body: { data: { eventId: 7, title: "Disposable" } },
  }));
  const id = created.body.item.id;

  const del = await helpers.request(`/api/admin/content/${section.key}/items/${id}`, auth({
    method: "DELETE",
  }));
  assert.equal(del.status, 200);
  assert.equal(del.body.ok, true);

  const again = await helpers.request(`/api/admin/content/${section.key}/items/${id}`, auth({
    method: "PATCH",
    body: { data: { title: "ghost" } },
  }));
  assert.equal(again.status, 404);
});

test("XSS payloads in html fields are sanitised on write", async () => {
  const payload =
    '<script>alert(1)</script><img src=x onerror="alert(2)">' +
    '<b>bold</b><a href="javascript:alert(3)">click</a><p onclick="evil()">text</p>';

  const res = await helpers.request(`/api/admin/content/${section.key}/items`, auth({
    method: "POST",
    body: { data: { eventId: 8, title: "XSS probe", summary: payload } },
  }));

  assert.equal(res.status, 201);
  const stored = res.body.item.data.summary;
  assert.ok(!/<script/i.test(stored), "script tags stripped");
  assert.ok(!/onerror/i.test(stored), "onerror handlers stripped");
  assert.ok(!/onclick/i.test(stored), "onclick handlers stripped");
  assert.ok(!/javascript:/i.test(stored), "javascript: URLs stripped");
  assert.ok(/<b>bold<\/b>/.test(stored), "safe markup survives");
});

test("javascript: URLs are rejected in url fields", async () => {
  const res = await helpers.request(`/api/admin/content/${section.key}/items`, auth({
    method: "POST",
    body: { data: { eventId: 9, title: "URL probe", linkUrl: "javascript:alert(1)" } },
  }));

  assert.equal(res.status, 400);

  const vbscript = await helpers.request(`/api/admin/content/${section.key}/items`, auth({
    method: "POST",
    body: { data: { eventId: 10, title: "URL probe 2", linkUrl: "  VbScript:msgbox(1)" } },
  }));
  assert.equal(vbscript.status, 400);

  const dataUrl = await helpers.request(`/api/admin/content/${section.key}/items`, auth({
    method: "POST",
    body: { data: { eventId: 11, title: "URL probe 3", linkUrl: "data:text/html,<script>1</script>" } },
  }));
  assert.equal(dataUrl.status, 400);
});

test("harmless http(s) URLs are accepted", async () => {
  const res = await helpers.request(`/api/admin/content/${section.key}/items`, auth({
    method: "POST",
    body: { data: { eventId: 12, title: "URL probe 4", linkUrl: "https://example.org/page" } },
  }));
  assert.equal(res.status, 201);
});

test("every mutation lands in the audit log", async () => {
  const { rows } = await helpers.db().query(
    `SELECT action FROM audit_log WHERE entity = 'content_item'`
  );
  const actions = new Set(rows.map((r) => r.action));

  for (const expected of ["content.create", "content.update", "content.hide", "content.delete"]) {
    assert.ok(actions.has(expected), `${expected} was audited`);
  }
});
