"use strict";

const { z } = require("zod");
const sanitizeHtml = require("sanitize-html");

/* Values that end up in href/src style attributes must never be script URLs. */
function safeUrl(value) {
  const v = String(value || "").trim();
  if (!v) return true;
  return !/^\s*(javascript|vbscript|data|file|blob):/i.test(v);
}

const urlLike = (message) =>
  z
    .string()
    .max(4000)
    .refine(safeUrl, message || "must not be a script URL");

/* HTML allowed in fields that are written with innerHTML on the site. */
const HTML_ALLOWED = {
  allowedTags: ["b", "strong", "i", "em", "u", "s", "br", "p", "span", "a", "small", "sub", "sup"],
  allowedAttributes: {
    a: ["href", "title", "rel", "target", "class"],
    span: ["class"],
    p: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
};

function sanitizeMarkup(value) {
  return sanitizeHtml(String(value || ""), HTML_ALLOWED);
}

function baseFieldSchema(spec) {
  const type = spec.type || "text";

  switch (type) {
    case "number":
      return z.coerce.number().int().gte(0).lte(1_000_000);

    case "date":
      return z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"), z.null()]);

    case "url":
    case "image":
      return urlLike();

    case "list":
      return z.array(z.string().max(4000).refine(safeUrl, "must not be a script URL")).max(60);

    case "object": {
      const shape = {};
      for (const [name, child] of Object.entries(spec.objectFields || {})) {
        shape[name] = z
          .unknown()
          .transform((value) => value)
          .pipe(baseFieldSchema(child))
          .optional()
          .nullable();
      }
      return z.object(shape).strict().partial();
    }

    case "textarea":
    case "text":
    default:
      return z.string().max(50_000);
  }
}

/*
  Builds a strict schema for one content_items.data payload.
  - `partial: true`  every field optional (PATCH semantics)
  - values of fields that are written with innerHTML are sanitised
  - keys that are not declared in section.fields are rejected
*/
function buildDataSchema(fields, { partial = true } = {}) {
  const shape = {};

  for (const [name, spec] of Object.entries(fields || {})) {
    let schema = baseFieldSchema(spec);

    if (spec.mode === "html") {
      schema = schema.transform((value) =>
        typeof value === "string" ? sanitizeMarkup(value) : value
      );
    }

    shape[name] = schema;
  }

  const object = z.object(shape).strict();
  return partial ? object.partial() : object;
}

module.exports = { buildDataSchema, sanitizeMarkup, safeUrl, baseFieldSchema };
