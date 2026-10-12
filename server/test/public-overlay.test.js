"use strict";

/* The public overlay only ships rows the admin has actually edited. */

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const helpers = require("./helpers");

const PAGE = "/__test__.html";

let token;
let section;

before(async () => {
  await helpers.start();
  await helpers.resetDatabase();
  const admin = await helpers.createAdmin({ email: "overlay-suite@example.test" });
  token = await helpers.login(admin.email, admin.password);
  section = await helpers.createTestSection({ pages: [PAGE] });
});

after(async () => {
  await helpers.stop();
});

async function overlay(path = PAGE) {
  return helpers.request(`/api/public/content?path=${encodeURIComponent(path)}`);
}

test("a page with no registered sections returns an empty section list", async () => {
  const res = await overlay("/pages/mission.html");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.sections, []);
});

test("only rows with edited_at are marked for the browser to apply", async () => {
  /* three static rows: only the middle one has been edited in the panel */
  await helpers.insertItem(section.id, { eventId: 1, title: "untouched one" }, 0);
  await helpers.insertItem(section.id, { eventId: 2, title: "edited two" }, 1, { edited: true });
  await helpers.insertItem(section.id, { eventId: 3, title: "untouched three" }, 2);

  const res = await overlay();
  assert.equal(res.status, 200);

  const found = res.body.sections.find((s) => s.key === section.key);
  assert.ok(found, "section is served");
  assert.equal(found.items.length, 3, "every row is listed with its editedAt stamp");

  const stamped = found.items.filter((i) => i.editedAt !== null);
  assert.equal(stamped.length, 1, "exactly one row carries editedAt");
  assert.equal(stamped[0].data.title, "edited two");
  assert.equal(res.headers.get("cache-control"), "no-cache");
});

test("editing a row through the admin makes the overlay send it", async () => {
  const rows = await helpers.db().many(
    "SELECT id, data FROM content_items WHERE section_id = $1 ORDER BY item_index",
    [section.id]
  );

  const res = await helpers.request(
    `/api/admin/content/${section.key}/items/${rows[0].id}`,
    { token, method: "PATCH", body: { data: { title: "now edited" } } }
  );
  assert.equal(res.status, 200);

  const after = await overlay();
  const found = after.body.sections.find((s) => s.key === section.key);
  const stamped = found.items.filter((i) => i.editedAt !== null);
  assert.equal(stamped.length, 2, "the newly edited row joined the stamped set");
  assert.ok(stamped.some((i) => i.data.title === "now edited"));
});

test("hidden rows are flagged so the overlay can suppress them", async () => {
  const rows = await helpers.db().many(
    "SELECT id FROM content_items WHERE section_id = $1 ORDER BY item_index",
    [section.id]
  );

  await helpers.request(
    `/api/admin/content/${section.key}/items/${rows[2].id}`,
    { token, method: "PATCH", body: { hidden: true } }
  );

  const res = await overlay();
  const found = res.body.sections.find((s) => s.key === section.key);
  const hidden = found.items.filter((i) => i.hidden);
  assert.equal(hidden.length, 1);
  assert.equal(hidden[0].data.title, "untouched three");
});

test("the overlay path parameter rejects traversal-shaped input", async () => {
  const res = await helpers.request(
    `/api/public/content?path=${encodeURIComponent("../../etc/passwd")}`
  );
  assert.equal(res.status, 400);
});
