"use strict";

const config = require("./config");
const logger = require("./logger");
const db = require("./db/pool");
const { createApp } = require("./app");

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info("server listening", {
    port: config.port,
    env: config.env,
    siteRoot: config.siteRoot,
    storage: config.storageDriver,
  });
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info("shutting down", { signal });

  const force = setTimeout(() => {
    logger.warn("forced shutdown");
    process.exit(1);
  }, 5000);
  force.unref();

  server.close(async () => {
    try {
      await db.close();
    } catch (err) {
      logger.error("error closing database pool", { error: err.message });
    }
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error("unhandled rejection", { error: reason instanceof Error ? reason.message : String(reason) });
});
