"use strict";

/*
  Upload storage behind a small interface:

    save({ buffer, originalName, mimeType }) ->
      { filename, storageDriver, storageKey, url }

  'local'     writes into config.uploadDir and serves from /uploads/<file>
  'cloudinary' uploads over HTTPS (production), requires CLOUDINARY_URL
*/

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const logger = require("../logger");

const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

const ALLOWED_MIME = new Set(Object.keys(EXT_BY_MIME));

function isAllowedMime(mime) {
  return ALLOWED_MIME.has(mime);
}

function baseName(originalName) {
  const withoutExt = path.basename(String(originalName || "upload")).replace(/\.[^.]+$/, "");
  const cleaned = withoutExt.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned.slice(0, 60) || "upload";
}

function buildFilename(originalName, mimeType) {
  const ext = EXT_BY_MIME[mimeType] || path.extname(String(originalName || "")).toLowerCase().slice(0, 8);
  return `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${baseName(originalName)}${ext}`;
}

async function saveLocal({ buffer, originalName, mimeType }) {
  fs.mkdirSync(config.uploadDir, { recursive: true });

  const filename = buildFilename(originalName, mimeType);
  fs.writeFileSync(path.join(config.uploadDir, filename), buffer);

  return {
    filename,
    storageDriver: "local",
    storageKey: filename,
    url: `/uploads/${filename}`,
  };
}

function parseCloudinaryUrl(url) {
  const match = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/.exec(url);
  if (!match) throw new Error("CLOUDINARY_URL must look like cloudinary://api_key:api_secret@cloud_name");
  return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] };
}

async function saveCloudinary({ buffer, originalName, mimeType }) {
  const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl(config.cloudinaryUrl);

  const filename = buildFilename(originalName, mimeType);
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "bcrls";
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const form = new FormData();
  form.append("file", new Blob([buffer], { type: mimeType }), filename);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`cloudinary upload failed (${response.status}): ${text.slice(0, 200)}`);
  }

  const result = await response.json();

  return {
    filename,
    storageDriver: "cloudinary",
    storageKey: result.public_id,
    url: result.secure_url,
  };
}

async function save(file) {
  if (config.storageDriver === "cloudinary") {
    if (!config.cloudinaryUrl) throw new Error("STORAGE_DRIVER=cloudinary but CLOUDINARY_URL is not set");
    return saveCloudinary(file);
  }

  if (config.storageDriver !== "local") throw new Error(`unknown STORAGE_DRIVER '${config.storageDriver}'`);
  return saveLocal(file);
}

module.exports = { save, isAllowedMime, ALLOWED_MIME, buildFilename };
