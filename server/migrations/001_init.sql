-- ============================================================
-- 001_init.sql - BCRLS admin API schema
-- Applied exactly once by server/src/db/migrate.js (each file in
-- its own transaction).
-- ============================================================

CREATE TABLE admins (
    id            bigserial PRIMARY KEY,
    email         text NOT NULL,
    password_hash text NOT NULL,
    display_name  text NOT NULL DEFAULT '',
    role          text NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
    is_active     boolean NOT NULL DEFAULT true,
    last_login_at timestamptz,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

-- case-insensitive e-mail uniqueness without the citext extension
CREATE UNIQUE INDEX admins_email_lower ON admins (lower(email));


CREATE TABLE content_sections (
    id                 bigserial PRIMARY KEY,
    -- stable machine name, e.g. 'events-archive'
    key                text NOT NULL UNIQUE,
    title              text NOT NULL DEFAULT '',
    -- paths (express-style, e.g. '/events/archive.html') that receive this section
    pages              text[] NOT NULL,
    kind               text NOT NULL CHECK (kind IN ('scalar', 'collection')),
    -- 'html' = rendered from the page markup, 'js' = rendered from a JS data array
    source_type        text NOT NULL DEFAULT 'html' CHECK (source_type IN ('html', 'js')),
    container_selector text,
    item_selector      text,
    -- data-* attribute (without the 'data-' prefix) that pairs a stored row with
    -- a DOM node instead of relying on position, e.g. 'event-id'
    match_by           text,
    -- how many items the static source ships with (rows beyond this are "new")
    imported_count     integer,
    -- { "field": { "sel": "...", "mode": "text|html|attr|json", "attr": "...",
    --               "keep": "<i ...></i>", "label": "...", "type": "..." } }
    fields             jsonb NOT NULL DEFAULT '{}'::jsonb,
    -- markup of one item with {{field}} placeholders (used to append new rows)
    template_html      text,
    sort_order         integer NOT NULL DEFAULT 0,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX content_sections_pages_idx ON content_sections USING gin (pages);


CREATE TABLE content_items (
    id          bigserial PRIMARY KEY,
    section_id  bigint NOT NULL REFERENCES content_sections (id) ON DELETE CASCADE,
    slug        text NOT NULL,
    item_index  integer NOT NULL DEFAULT 0,
    data        jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_hidden   boolean NOT NULL DEFAULT false,
    is_imported boolean NOT NULL DEFAULT true,
    edited_at   timestamptz,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (section_id, slug)
);

CREATE INDEX content_items_section_index_idx ON content_items (section_id, item_index);
-- rows the browser should apply
CREATE INDEX content_items_edited_idx ON content_items (edited_at) WHERE edited_at IS NOT NULL;


CREATE TABLE uploads (
    id             bigserial PRIMARY KEY,
    filename       text NOT NULL UNIQUE,
    original_name  text NOT NULL,
    mime_type      text NOT NULL,
    byte_size      bigint NOT NULL,
    storage_driver text NOT NULL,
    storage_key    text NOT NULL,
    url            text NOT NULL,
    created_by     bigint REFERENCES admins (id) ON DELETE SET NULL,
    created_at     timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE form_submissions (
    id         bigserial PRIMARY KEY,
    form_key   text NOT NULL,
    page       text NOT NULL,
    payload    jsonb NOT NULL,
    user_agent text,
    -- no raw IP is stored, only a salted hash for abuse detection
    ip_hash    text,
    status     text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX form_submissions_created_idx ON form_submissions (created_at DESC);
CREATE INDEX form_submissions_form_key_idx ON form_submissions (form_key, created_at DESC);


CREATE TABLE audit_log (
    id         bigserial PRIMARY KEY,
    admin_id   bigint REFERENCES admins (id) ON DELETE SET NULL,
    action     text NOT NULL,
    entity     text NOT NULL,
    entity_id  text,
    detail     jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_created_idx ON audit_log (created_at DESC);


CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admins_touch_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER content_sections_touch_updated_at
    BEFORE UPDATE ON content_sections
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER content_items_touch_updated_at
    BEFORE UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
