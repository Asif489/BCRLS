#!/usr/bin/env node
"use strict";

const readline = require("readline");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const db = require("../src/db/pool");
const config = require("../src/config");

const ROUNDS = 12;

function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    const match = arg.match(/^--([a-z-]+)(?:=(.*))?$/i);
    if (match) out[match[1]] = match[2] === undefined ? true : match[2];
  }
  return out;
}

function prompt(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    if (hidden) {
      rl._writeToOutput = (string) => {
        rl.output.write(string === "\n" || string === "\r\n" ? "\n" : "*");
      };
    }

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const email = String(args.email || (await prompt("Admin e-mail: ")));
  const name = String(args.name || (await prompt("Display name (optional): ")));
  const role = args.role === "editor" ? "editor" : "admin";

  let password = args.password ? String(args.password) : "";

  if (!password) {
    if (!process.stdin.isTTY) {
      throw new Error("--password is required when stdin is not a terminal");
    }
    password = await prompt("Password (min 10 characters): ", true);
    const confirm = await prompt("Repeat password: ", true);
    if (password !== confirm) throw new Error("Passwords do not match");
  }

  const parsed = z
    .object({
      email: z.string().trim().email("must be a valid e-mail address"),
      password: z.string().min(10, "password must be at least 10 characters"),
      name: z.string().trim().max(120).default(""),
    })
    .safeParse({ email, password, name });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }

  if (config.getHardcodedAdminByEmail(parsed.data.email)) {
    throw new Error(
      `Cannot store admin in database: "${parsed.data.email}" is reserved as a static hardcoded admin.`
    );
  }

  const hash = await bcrypt.hash(parsed.data.password, ROUNDS);

  const { rows } = await db.query(
    `INSERT INTO admins (email, password_hash, display_name, role, is_active)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (lower(email))
     DO UPDATE SET password_hash = EXCLUDED.password_hash,
                   display_name  = EXCLUDED.display_name,
                   role          = EXCLUDED.role,
                   is_active     = true,
                   updated_at    = now()
     RETURNING id, email, display_name, role`,
    [parsed.data.email, hash, parsed.data.name, role]
  );

  const admin = rows[0];
  console.log(
    `[create-admin] ${args.password ? "created" : "updated"} admin #${admin.id} ${admin.email} (role=${admin.role})`
  );
}

main()
  .catch((err) => {
    console.error(`[create-admin] FAILED: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => db.close());
