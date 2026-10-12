"use strict";

/* Wraps an async route handler so rejections reach the error middleware
   (Express 4 does not do this automatically). */
const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const badRequest = (message, details) => new HttpError(400, message, details);
const unauthorized = (message = "Authentication required") => new HttpError(401, message);
const forbidden = (message = "Not allowed") => new HttpError(403, message);
const notFound = (message = "Not found") => new HttpError(404, message);
const conflict = (message, details) => new HttpError(409, message, details);

module.exports = { asyncRoute, HttpError, badRequest, unauthorized, forbidden, notFound, conflict };
