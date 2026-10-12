"use strict";

/* Appends a row to audit_log.  Accepts the pool or a transaction client. */
async function audit(client, { adminId = null, action, entity, entityId = null, detail = {} }) {
  await client.query(
    `INSERT INTO audit_log (admin_id, action, entity, entity_id, detail)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [adminId, action, entity, entityId == null ? null : String(entityId), JSON.stringify(detail)]
  );
}

module.exports = { audit };
