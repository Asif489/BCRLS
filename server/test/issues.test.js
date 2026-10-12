"use strict";

/* Journal issues: CRUD, the single-current rule, archive behaviour, public feed. */

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const helpers = require("./helpers");

let token;

before(async () => {
  await helpers.start();
  await helpers.resetDatabase();
  const admin = await helpers.createAdmin({ email: "issues-suite@example.test" });
  token = await helpers.login(admin.email, admin.password);
});

after(async () => {
  await helpers.stop();
});

function auth(extra = {}) {
  return { token, ...extra };
}

async function createIssue(body) {
  const res = await helpers.request(
    "/api/admin/issues",
    auth({ method: "POST", body })
  );
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.issue;
}

test("unauthenticated issue API access is rejected", async () => {
  const res = await helpers.request("/api/admin/issues");
  assert.equal(res.status, 401);
});

test("creating an issue stores it and the first current issue is flagged", async () => {
  const issue = await createIssue({
    volume: "Volume 1",
    issueNumber: "Issue 1",
    title: "Inaugural issue",
    year: 2024,
    publishedAt: "2024-06-01",
    isCurrent: true,
  });

  assert.equal(issue.volume, "Volume 1");
  assert.equal(issue.year, 2024);
  assert.equal(issue.isCurrent, true);
  assert.equal(issue.slug, "volume-1-issue-1-2024");
});

test("creating a new current issue moves the previous one to the archive", async () => {
  const previous = await createIssue({
    volume: "Volume 2",
    issueNumber: "Issue 1",
    year: 2025,
    isCurrent: true,
  });

  const latest = await createIssue({
    volume: "Volume 2",
    issueNumber: "Issue 2",
    year: 2025,
    isCurrent: true,
  });

  const list = await helpers.request("/api/admin/issues", auth());
  assert.equal(list.status, 200);

  const current = list.body.issues.filter((issue) => issue.isCurrent);
  assert.equal(current.length, 1, "exactly one current issue");
  assert.equal(current[0].id, latest.id);

  const archived = list.body.issues.find((issue) => issue.id === previous.id);
  assert.ok(archived, "the previous current issue still exists");
  assert.equal(archived.isCurrent, false, "it was demoted, not deleted");
});

test("set-current promotes an archived issue and demotes the current one", async () => {
  const list = await helpers.request("/api/admin/issues", auth());
  const archived = list.body.issues.find((issue) => !issue.isCurrent);
  assert.ok(archived, "there is an archived issue to promote");

  const res = await helpers.request(
    `/api/admin/issues/${archived.id}/current`,
    auth({ method: "POST" })
  );
  assert.equal(res.status, 200);
  assert.equal(res.body.issue.isCurrent, true);

  const after = await helpers.request("/api/admin/issues", auth());
  const current = after.body.issues.filter((issue) => issue.isCurrent);
  assert.equal(current.length, 1);
  assert.equal(current[0].id, archived.id);
});

test("updating an issue can promote it in the same call", async () => {
  const list = await helpers.request("/api/admin/issues", auth());
  const archived = list.body.issues.find((issue) => !issue.isCurrent);
  assert.ok(archived);

  const res = await helpers.request(
    `/api/admin/issues/${archived.id}`,
    auth({ method: "PATCH", body: { title: "Updated title", isCurrent: true } })
  );
  assert.equal(res.status, 200);
  assert.equal(res.body.issue.title, "Updated title");
  assert.equal(res.body.issue.isCurrent, true);

  const after = await helpers.request("/api/admin/issues", auth());
  assert.equal(after.body.issues.filter((issue) => issue.isCurrent).length, 1);
});

test("an empty issue and script URLs are rejected", async () => {
  const empty = await helpers.request(
    "/api/admin/issues",
    auth({ method: "POST", body: { description: "no identity" } })
  );
  assert.equal(empty.status, 400);

  const script = await helpers.request(
    "/api/admin/issues",
    auth({ method: "POST", body: { volume: "Volume 9", pdfUrl: "javascript:alert(1)" } })
  );
  assert.equal(script.status, 400);

  const unknown = await helpers.request(
    "/api/admin/issues",
    auth({ method: "POST", body: { volume: "Volume 9", evil: "nope" } })
  );
  assert.equal(unknown.status, 400);
});

test("the public feed returns the current issue and the full archive", async () => {
  const res = await helpers.request("/api/public/issues");
  assert.equal(res.status, 200);
  assert.ok(res.body.current, "a current issue is present");
  assert.ok(Array.isArray(res.body.issues));
  assert.ok(res.body.issues.length >= 2, "the archive is included");
  assert.equal(res.body.issues[0].id, res.body.current.id, "current issue is first");
});

test("deleting an issue removes it from the feed", async () => {
  const created = await createIssue({ volume: "Volume 8", issueNumber: "Issue 8", year: 2020 });

  const del = await helpers.request(
    `/api/admin/issues/${created.id}`,
    auth({ method: "DELETE" })
  );
  assert.equal(del.status, 200);

  const gone = await helpers.request(`/api/admin/issues/${created.id}`, auth());
  assert.equal(gone.status, 404);
});
