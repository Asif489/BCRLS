"use strict";

const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const rateLimit = require("express-rate-limit");
const db = require("../db/pool");
const config = require("../config");
const { signToken, requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncRoute, badRequest, unauthorized, notFound } = require("../lib/http");
const { audit } = require("../lib/audit");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { message: "Too many sign-in attempts, try again later" } },
});

const loginSchema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1).max(400),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(400),
  newPassword: z.string().min(10, "New password must be at least 10 characters").max(200),
});

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  asyncRoute(async (req, res) => {
    const { email, password } = req.body;

    const admin = await db.one("SELECT * FROM admins WHERE lower(email) = lower($1)", [email]);

    if (!admin || !admin.is_active || !(await bcrypt.compare(password, admin.password_hash))) {
      throw unauthorized("Invalid e-mail or password");
    }

    await db.query("UPDATE admins SET last_login_at = now() WHERE id = $1", [admin.id]);
    await audit(db, {
      adminId: admin.id,
      action: "login",
      entity: "admin",
      entityId: admin.id,
      detail: { email: admin.email },
    });

    res.json({
      token: signToken(admin),
      admin: { id: admin.id, email: admin.email, name: admin.display_name, role: admin.role },
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncRoute(async (req, res) => {
    const admin = await db.one(
      "SELECT id, email, display_name AS name, role, is_active FROM admins WHERE id = $1",
      [req.admin.id]
    );

    if (!admin || !admin.is_active) throw notFound("Account no longer active");

    res.json({ admin });
  })
);

router.post(
  "/password",
  requireAuth,
  validate(passwordSchema),
  asyncRoute(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const admin = await db.one("SELECT id, password_hash FROM admins WHERE id = $1", [req.admin.id]);
    if (!admin) throw notFound("Account not found");

    if (!(await bcrypt.compare(currentPassword, admin.password_hash))) {
      throw badRequest("Current password is incorrect");
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE admins SET password_hash = $1 WHERE id = $2", [hash, req.admin.id]);
    await audit(db, {
      adminId: req.admin.id,
      action: "password-changed",
      entity: "admin",
      entityId: req.admin.id,
    });

    res.json({ ok: true, jwtExpiresIn: config.jwtExpiresIn });
  })
);

module.exports = router;
