#!/usr/bin/env node
"use strict";

const { migrate } = require("../src/db/migrate");
const db = require("../src/db/pool");

migrate((line) => console.log(`[migrate] ${line}`))
  .then(() => db.close())
  .catch((err) => {
    console.error(`[migrate] FAILED: ${err.message}`);
    process.exitCode = 1;
    return db.close();
  });
