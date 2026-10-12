"use strict";

const crypto = require("crypto");
const path = require("path");
const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config({ path: process.env.DOTENV_PATH || path.join(__dirname, "..", "..", ".env") });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  SITE_ROOT: z.string().default("."),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required (postgres://user:pass@host:port/db)")
    .refine((v) => /^postgres(ql)?:\/\//.test(v), "DATABASE_URL must start with postgres://"),
  JWT_SECRET: z.string().default(""),
  JWT_EXPIRES_IN: z.string().default("8h"),
  STORAGE_DRIVER: z.enum(["local", "cloudinary"]).default("local"),
  UPLOAD_DIR: z.string().default("server/uploads"),
  CLOUDINARY_URL: z.string().default(""),
  PUBLIC_ORIGIN: z.string().default("http://localhost:4000"),
  HARDCODED_ADMIN_1_EMAIL: z.string().default("admin1@gmail.com"),
  HARDCODED_ADMIN_1_PASSWORD: z.string().default("Admin1234@"),
  HARDCODED_ADMIN_2_EMAIL: z.string().default("admin2@gmail.com"),
  HARDCODED_ADMIN_2_PASSWORD: z.string().default("ADmin1234@"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${details}`);
}

const env = parsed.data;

let jwtSecret = env.JWT_SECRET.trim();

if (jwtSecret.length < 32) {
  if (env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set to at least 32 characters in production");
  }
  jwtSecret = crypto.randomBytes(48).toString("hex");
  if (env.JWT_SECRET.trim().length === 0) {
    console.warn("[config] JWT_SECRET not set - using a random development key (sessions reset on restart)");
  } else {
    console.warn("[config] JWT_SECRET is shorter than 32 characters - using a random development key");
  }
}

const hardcodedAdmins = [
  {
    id: "hardcoded-1",
    email: (env.HARDCODED_ADMIN_1_EMAIL || process.env.ADMIN_1_EMAIL || "admin1@gmail.com").trim().toLowerCase(),
    password: env.HARDCODED_ADMIN_1_PASSWORD || process.env.ADMIN_1_PASSWORD || "Admin1234@",
    name: "Admin 1",
    role: "admin",
    isHardcoded: true,
  },
  {
    id: "hardcoded-2",
    email: (env.HARDCODED_ADMIN_2_EMAIL || process.env.ADMIN_2_EMAIL || "admin2@gmail.com").trim().toLowerCase(),
    password: env.HARDCODED_ADMIN_2_PASSWORD || process.env.ADMIN_2_PASSWORD || "ADmin1234@",
    name: "Admin 2",
    role: "admin",
    isHardcoded: true,
  },
];

function findHardcodedAdmin(email, password) {
  if (!email || !password) return null;
  const cleanEmail = String(email).trim().toLowerCase();
  return (
    hardcodedAdmins.find(
      (a) => a.email.toLowerCase() === cleanEmail && a.password === password
    ) || null
  );
}

function getHardcodedAdminByEmail(email) {
  if (!email) return null;
  const cleanEmail = String(email).trim().toLowerCase();
  return (
    hardcodedAdmins.find((a) => a.email.toLowerCase() === cleanEmail) || null
  );
}

module.exports = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  port: env.PORT,
  siteRoot: path.resolve(__dirname, "..", "..", env.SITE_ROOT),
  databaseUrl: env.DATABASE_URL,
  jwtSecret,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  storageDriver: env.STORAGE_DRIVER,
  uploadDir: path.resolve(__dirname, "..", "..", env.UPLOAD_DIR),
  cloudinaryUrl: env.CLOUDINARY_URL,
  publicOrigin: env.PUBLIC_ORIGIN,
  hardcodedAdmins,
  findHardcodedAdmin,
  getHardcodedAdminByEmail,
};
