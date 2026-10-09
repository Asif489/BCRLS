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

/* ------------------------------------------------------------------ CSP

  Content-Security-Policy for the site and the admin panel.

  Inline scripts the policy has to allow (all of them ship in the
  original HTML and are reproduced here so the list stays auditable):

    contact.html                       navigation + contact form handler
    get-involved/index.html            navigation + mobile dropdowns
    get-involved/become-a-member.html  navigation + #memberForm handler
    get-involved/campus-fellow.html    navigation + #fellowForm handler
    get-involved/internship-programme.html  navigation + #internshipForm
    get-involved/partner-with-us.html  navigation + #partnerForm handler
    get-involved/volunteer-programme.html   navigation + #volunteerForm
    pages/Founder.html                 navigation
    pages/about.html                   navigation
    research/blog.html                 navigation + drawer escape handler
    research/journal.html              navigation

  There are no inline event handlers (onclick=...) anywhere on the site,
  so 'unsafe-inline' in script-src covers exactly those 11 blocks; every
  other script is a same-origin file under /js or /admin/js.  Styles need
  'unsafe-inline' because the pages carry large inline <style> blocks and
  59 style="..." attributes.  The admin panel has no inline script at all.

  connect-src also lists PUBLIC_ORIGIN so a split deployment (static site
  on one host, API on another) can still reach /api/*.
  upgrade-insecure-requests is only enabled in production so plain-HTTP
  local development keeps working.
---------------------------------------------------------------------- */
const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "media-src": ["'self'", "data:", "blob:"],
  "connect-src": ["'self'", config.publicOrigin, "https://script.google.com"],
  "frame-src": ["https://drive.google.com", "https://docs.google.com", "https://www.youtube.com"],
  "worker-src": ["'self'", "blob:"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'self'"],
};

if (config.isProduction) CSP_DIRECTIVES["upgrade-insecure-requests"] = [];

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
      contentSecurityPolicy: {
        useDefaults: false,
        directives: CSP_DIRECTIVES,
      },
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
