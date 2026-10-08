"use strict";

const express = require("express");
const { z } = require("zod");
const db = require("../db/pool");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncRoute, notFound } = require("../lib/http");
const { audit } = require("../lib/audit");

const router = express.Router();

router.use(requireAuth);

const listQuery = z.object({
  form: z.string().max(60).optional(),
  status: z.enum(["new", "read", "archived"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

router.get(
  "/",
  validate(listQuery, "query"),
  asyncRoute(async (req, res) => {
    const { form, status, limit, offset } = req.query;

    const filters = [];
    const values = [];

    if (form) {
      values.push(form);
      filters.push(`form_key = $${values.length}`);
    }
    if (status) {
      values.push(status);
      filters.push(`status = $${values.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    values.push(limit, offset);

    const rows = await db.many(
      `SELECT id, form_key, page, payload, status, created_at
         FROM form_submissions
         ${where}
        ORDER BY created_at DESC
        LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    const counts = await db.many(
      `SELECT form_key, status, count(*)::int AS total
         FROM form_submissions
        GROUP BY form_key, status
        ORDER BY form_key, status`
    );

    res.json({
      submissions: rows.map((row) => ({
        id: row.id,
        formKey: row.form_key,
        page: row.page,
        payload: row.payload,
        status: row.status,
        createdAt: new Date(row.created_at).toISOString(),
      })),
      counts,
      limit,
      offset,
    });
  })
);

router.patch(
  "/:id",
  validate(z.object({ status: z.enum(["new", "read", "archived"]) }).strict()),
  asyncRoute(async (req, res) => {
    const row = await db.one(
      "UPDATE form_submissions SET status = $1 WHERE id = $2 RETURNING id, status",
      [req.body.status, Number(req.params.id)]
    );

    if (!row) throw notFound("Submission not found");

    await audit(db, {
      adminId: req.admin.id,
      action: "form.status",
      entity: "form_submission",
      entityId: row.id,
      detail: { status: row.status },
    });

    res.json({ ok: true, id: row.id, status: row.status });
  })
);

router.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    const row = await db.one("DELETE FROM form_submissions WHERE id = $1 RETURNING id", [
      Number(req.params.id),
    ]);

    if (!row) throw notFound("Submission not found");

    await audit(db, {
      adminId: req.admin.id,
      action: "form.delete",
      entity: "form_submission",
      entityId: row.id,
    });

    res.json({ ok: true, id: row.id });
  })
);

module.exports = router;
