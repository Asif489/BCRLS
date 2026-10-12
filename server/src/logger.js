"use strict";

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

const threshold = LEVELS[process.env.LOG_LEVEL] || (process.env.NODE_ENV === "test" ? LEVELS.silent : LEVELS.info);

function write(level, msg, meta) {
  if (LEVELS[level] < threshold) return;

  const line = {
    time: new Date().toISOString(),
    level,
    msg,
    ...(meta && typeof meta === "object" ? meta : {}),
  };

  const text = JSON.stringify(line);

  if (level === "error") process.stderr.write(text + "\n");
  else process.stdout.write(text + "\n");
}

module.exports = {
  debug: (msg, meta) => write("debug", msg, meta),
  info: (msg, meta) => write("info", msg, meta),
  warn: (msg, meta) => write("warn", msg, meta),
  error: (msg, meta) => write("error", msg, meta),
};
