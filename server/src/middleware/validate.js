"use strict";

/* Replaces req.body (or req.query) with the parsed, type-coerced value.
   A ZodError passed to next() is rendered as a 400 by the error handler. */

function validate(schema, target = "body") {
  return (req, res, next) => {
    const source = target === "query" ? req.query : req.body;
    const result = schema.safeParse(source ?? {});

    if (!result.success) {
      next(result.error);
      return;
    }

    if (target === "query") {
      req.query = { ...req.query, ...result.data };
    } else {
      req.body = result.data;
    }

    next();
  };
}

module.exports = { validate };
