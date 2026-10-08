"use strict";

const jwt = require("jsonwebtoken");
const db = require("../db/pool");
const config = require("../config");
const { unauthorized, forbidden } = require("../lib/http");

function signToken(admin, expiresIn = config.jwtExpiresIn) {
  return jwt.sign(
    { sub: String(admin.id), email: admin.email, name: admin.display_name, role: admin.role },
    config.jwtSecret,
    { expiresIn }
  );
}

function verifyToken(req) {
  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(/\s+/);

  if (scheme !== "Bearer" || !token) return { error: unauthorized() };

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return { payload };
  } catch (err) {
    return {
      error: unauthorized(
        err.name === "TokenExpiredError" ? "Session expired, sign in again" : "Invalid token"
      ),
    };
  }
}

/*
  Every authenticated request re-reads the admin row, so an account that was
  deactivated (or deleted) while a token was still valid is rejected on the
  very next call instead of at token expiry.
*/
async function requireAuth(req, res, next) {
  const { payload, error } = verifyToken(req);
  if (error) {
    next(error);
    return;
  }

  try {
    const { rows } = await db.query(
      `SELECT id, email, display_name AS name, role, is_active
         FROM admins
        WHERE id = $1`,
      [payload.sub]
    );

    const admin = rows[0];

    if (!admin) {
      next(unauthorized("Account no longer exists"));
      return;
    }
    if (!admin.is_active) {
      next(forbidden("Account has been deactivated"));
      return;
    }

    req.admin = {
      id: Number(admin.id),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.admin) {
      next(unauthorized());
      return;
    }
    if (req.admin.role !== role) {
      next(forbidden(`Requires the '${role}' role`));
      return;
    }
    next();
  };
}

module.exports = { signToken, requireAuth, requireRole };
