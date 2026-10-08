"use strict";

const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const config = require("./config");
const { notFoundHandler, errorHandler } = require("./middleware/errors");
const authRoutes = require("./routes/auth");
const publicContentRoutes = require("./routes/public-content");
const adminContentRoutes = require("./routes/admin-content");
const adminSubmissionRoutes = require("./routes/admin-submissions");
const uploadsRoutes = require("./routes/uploads");
const { router: formsRouter } = require("./routes/forms");

const ADMIN_DIR = path.join(__dirname, "..", "..", "admin");

/* Repository files that must never be reachable over HTTP. */
const BLOCKED_DIR = /^\/(?:server|node_modules|docs|\.kilo|\.git|\.opencode)(?:\/|$)/i;
const BLOCKED_FILE =
  /^\/(?:\.env(?:\.example)?|package(?:-lock)?\.json|README(?:\.md)?|\.gitignore|Dockerfile|\.npmrc)$/i;

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      /* images may be embedded by a site hosted on another origin */
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin: config.publicOrigin,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));

  /* ------------------------------------------------------------- API */

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, env: config.env, time: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/public", publicContentRoutes);
  app.use("/api/admin/content", adminContentRoutes);
  app.use("/api/admin/submissions", adminSubmissionRoutes);
  app.use("/api/admin/uploads", uploadsRoutes);
  app.use("/api/forms", formsRouter);

  /* --------------------------------------------------- uploaded images */

  app.use(
    "/uploads",
    express.static(config.uploadDir, { maxAge: "7d", fallthrough: true, index: false })
  );

  /* ----------------------------------------------------- admin panel */

  app.use("/admin", express.static(ADMIN_DIR, { index: "index.html", fallthrough: true }));

  /* --------------------------------------------- repository firewall */

  app.use((req, res, next) => {
    if (req.path === "/admin" || req.path.startsWith("/admin/")) return next();

    if (BLOCKED_DIR.test(req.path) || BLOCKED_FILE.test(req.path)) {
      res.status(403).json({ error: { message: "Forbidden" } });
      return;
    }

    next();
  });

  /* ------------------------------------------------- the static site */

  app.use(
    express.static(config.siteRoot, {
      index: "index.html",
      extensions: ["html"],
      dotfiles: "ignore",
      fallthrough: true,
    })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
