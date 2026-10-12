"use strict";

const express = require("express");
const multer = require("multer");
const db = require("../db/pool");
const { requireAuth } = require("../middleware/auth");
const { asyncRoute, badRequest } = require("../lib/http");
const { save, isAllowedMime } = require("../lib/storage");
const { audit } = require("../lib/audit");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, cb) {
    if (!isAllowedMime(file.mimetype)) {
      cb(badRequest(`Unsupported file type '${file.mimetype}'`));
      return;
    }
    cb(null, true);
  },
});

router.post(
  "/",
  requireAuth,
  upload.single("file"),
  asyncRoute(async (req, res) => {
    if (!req.file) throw badRequest("Attach one image file as 'file'");

    const stored = await save({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    });

    const row = await db.one(
      `INSERT INTO uploads (filename, original_name, mime_type, byte_size, storage_driver, storage_key, url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, filename, url, mime_type, byte_size, created_at`,
      [
        stored.filename,
        String(req.file.originalname || "").slice(0, 200),
        req.file.mimetype,
        req.file.size,
        stored.storageDriver,
        stored.storageKey,
        stored.url,
        req.admin.id,
      ]
    );

    await audit(db, {
      adminId: req.admin.id,
      action: "upload.create",
      entity: "upload",
      entityId: row.id,
      detail: { url: row.url, bytes: row.byte_size },
    });

    res.status(201).json({
      upload: {
        id: row.id,
        url: row.url,
        filename: row.filename,
        mimeType: row.mime_type,
        byteSize: row.byte_size,
      },
    });
  })
);

module.exports = router;
