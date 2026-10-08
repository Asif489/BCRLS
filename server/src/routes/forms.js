"use strict";

const crypto = require("crypto");
const express = require("express");
const { z } = require("zod");
const rateLimit = require("express-rate-limit");
const db = require("../db/pool");
const config = require("../config");
const { validate } = require("../middleware/validate");
const { asyncRoute, badRequest } = require("../lib/http");
const { audit } = require("../lib/audit");

const router = express.Router();

/*
  The eight static forms keep their original field names (contactName,
  connectEmail, ...).  The browser posts the form serialised as-is, so the
  server only enforces the universal rules: a valid e-mail, a name where the
  form has one, sane sizes, and a honeypot.
*/
const FORMS = {
  contact: { requireName: true },
  connection: { requireName: true },
  newsletter: { requireName: false },
  member: { requireName: true },
  fellow: { requireName: true },
  internship: { requireName: true },
  partner: { requireName: true },
  volunteer: { requireName: true },
};

const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { message: "Too many submissions, please try again later" } },
});

const valueSchema = z.union([
  z.string().max(5000),
  z.boolean(),
  z.array(z.string().max(5000)).max(40),
]);

const bodySchema = z
  .record(valueSchema)
  .refine((record) => Object.keys(record).length <= 40, { message: "Too many fields" });

function findField(record, pattern) {
  return Object.keys(record).find((key) => pattern.test(key));
}

function buildValidator(formKey) {
  const spec = FORMS[formKey];

  return (record) => {
    const issues = [];

    const emailKey = findField(record, /email/i);
    const email = emailKey ? String(record[emailKey] || "").trim() : "";

    if (!email) issues.push({ path: emailKey || "email", message: "E-mail is required" });
    else if (!z.string().email().safeParse(email).success) {
      issues.push({ path: emailKey, message: "Enter a valid e-mail address" });
    }

    if (spec.requireName) {
      const nameKey = findField(record, /name/i);
      const name = nameKey ? String(record[nameKey] || "").trim() : "";
      if (!name) issues.push({ path: nameKey || "name", message: "Name is required" });
    }

    return issues;
  };
}

function hashIp(ip) {
  return crypto.createHmac("sha256", config.jwtSecret).update(String(ip || "")).digest("hex");
}

router.post(
  "/:formKey",
  submitLimiter,
  validate(z.object({}).passthrough(), "body"),
  asyncRoute(async (req, res) => {
    const formKey = req.params.formKey;
    const spec = FORMS[formKey];

    if (!spec) throw badRequest("Unknown form");

    const parsed = bodySchema.safeParse(req.body || {});
    if (!parsed.success) throw parsed.error;

    const record = parsed.data;

    /* honeypot - real visitors never fill the hidden 'website' field */
    if (typeof record.website === "string" && record.website.trim() !== "") {
      res.status(202).json({ ok: true, queued: false });
      return;
    }

    const issues = buildValidator(formKey)(record);
    if (issues.length) {
      const error = badRequest("Please check the highlighted fields");
      error.details = issues;
      throw error;
    }

    const userAgent = (req.get("user-agent") || "").slice(0, 300);

    const row = await db.one(
      `INSERT INTO form_submissions (form_key, page, payload, user_agent, ip_hash)
       VALUES ($1, $2, $3::jsonb, $4, $5)
       RETURNING id, created_at`,
      [formKey, String(record.page || req.get("referer") || "/").slice(0, 300), JSON.stringify(record), userAgent, hashIp(req.ip)]
    );

    await audit(db, {
      adminId: null,
      action: "form.submit",
      entity: "form_submission",
      entityId: row.id,
      detail: { formKey },
    });

    res.status(202).json({ ok: true, id: row.id });
  })
);

module.exports = { router, FORMS };
