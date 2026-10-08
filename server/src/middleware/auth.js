"use strict";

const jwt = require("jsonwebtoken");
const config = require("../config");
const { unauthorized, forbidden } = require("../lib/http");

function signToken(admin, expiresIn = config.jwtExpiresIn) {
  return jwt.sign(
    { sub: String(admin.id), email: admin.email, name: admin.display_name, role: admin.role },
    config.jwtSecret,
    { expiresIn }
  );
}

function requireAuth(req, res, next) {
  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(/\s+/);

  if (scheme !== "Bearer" || !token) {
    next(unauthorized());
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.admin = {
      id: Number(payload.sub),
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
    next();
  } catch (err) {
    next(unauthorized(err.name === "TokenExpiredError" ? "Session expired, sign in again" : "Invalid token"));
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
