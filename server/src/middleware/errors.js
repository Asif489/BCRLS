"use strict";

const { ZodError } = require("zod");
const { HttpError, notFound } = require("../lib/http");
const logger = require("../logger");

/* 404 - JSON for the API, minimal page for everything else. */
function notFoundHandler(req, res, next) {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: { message: "Not found" } });
    return;
  }

  res
    .status(404)
    .type("html")
    .send("<!doctype html><meta charset='utf-8'><title>404</title><h1>404 - Not found</h1>");
}

/* Central error handler. */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let status = 500;
  let message = "Internal server error";
  let details;

  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 400;
    message = "Validation failed";
    details = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err && err.type === "entity.parse.failed") {
    status = 400;
    message = "Malformed JSON body";
  } else if (err && err.name === "MulterError") {
    status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = err.message;
  } else if (err && err.statusCode && err.statusCode < 500) {
    status = err.statusCode;
    message = err.message;
  }

  const payload = { error: { message } };
  if (details) payload.error.details = details;

  if (status >= 500) {
    logger.error("request failed", {
      method: req.method,
      path: req.originalUrl,
      error: err && err.message,
      stack: err && err.stack,
    });
  } else {
    logger.debug("request rejected", { method: req.method, path: req.originalUrl, status, message });
  }

  res.status(status).json(payload);
}

module.exports = { notFoundHandler, errorHandler, notFound };
