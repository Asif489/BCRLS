"use strict";

const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const rateLimit = require("express-rate-limit");
const db = require("../db/pool");
const config = require("../config");
const { signToken, requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { asyncRoute, HttpError, badRequest, unauthorized, notFound } = require("../lib/http");
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

const signupSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(10, "Password must be at least 10 characters").max(200),
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { message: "Too many signup attempts, try again later" } },
});

router.post(
  "/signup",
  signupLimiter,
  validate(signupSchema),
  asyncRoute(async (req, res) => {
    const email = req.body.email.toLowerCase();
    if (config.hardcodedAdmins.some((entry) => entry.email === email)) {
      throw new HttpError(409, "This e-mail is reserved for a built-in admin account");
    }
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    let admin;
    try {
      admin = await db.one(
        `INSERT INTO admins (email, password_hash, display_name, role, is_active)
         VALUES ($1, $2, $3, 'admin', true)
         RETURNING id, email, display_name, role`,
        [email, passwordHash, email.split("@")[0]]
      );
    } catch (err) {
      if (err && err.code === "23505") {
        throw new HttpError(409, "An account with this e-mail already exists");
      }
      throw err;
    }

    await audit(db, {
      adminId: admin.id,
      action: "signup",
      entity: "admin",
      entityId: admin.id,
      detail: { email: admin.email },
    });

    res.status(201).json({
      token: signToken(admin),
      admin: { id: admin.id, email: admin.email, name: admin.display_name, role: admin.role },
    });
  })
);

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  asyncRoute(async (req, res) => {
    const { email, password } = req.body;

    // 1. First check if the provided email + password match either of the two hardcoded credentials
    const hardcodedAdmin = config.findHardcodedAdmin(email, password);

    // 2. If they match grant full admin access immediately (do not query the database for these accounts)
    if (hardcodedAdmin) {
      const token = signToken({
        id: null,
        email: hardcodedAdmin.email,
        display_name: hardcodedAdmin.name,
        role: "admin",
        isHardcoded: true,
      });

      return res.json({
        token,
        admin: {
          id: null,
          email: hardcodedAdmin.email,
          name: hardcodedAdmin.name,
          role: "admin",
        },
      });
    }

    // 3. If they do not match fall back to the normal database authentication flow
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
    if (req.admin.isHardcoded) {
      return res.json({
        admin: {
          id: null,
          email: req.admin.email,
          name: req.admin.name,
          role: req.admin.role,
          is_active: true,
        },
      });
    }

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
    if (req.admin.isHardcoded) {
      throw badRequest("Password cannot be changed for hardcoded admin accounts");
    }

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
