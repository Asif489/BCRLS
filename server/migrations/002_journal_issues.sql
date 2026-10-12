-- ============================================================
-- 002_journal_issues.sql - BJRLDs journal issues
--
-- One row per published journal issue.  Exactly one row may carry
-- is_current = true at a time (enforced by the partial unique index below);
-- when an administrator promotes a new issue the previous current issue is
-- demoted to the archive.  The archive is simply every other row.
-- ============================================================

CREATE TABLE journal_issues (
    id            bigserial PRIMARY KEY,
    slug          text NOT NULL UNIQUE,
    volume        text NOT NULL DEFAULT '',
    issue_number  text NOT NULL DEFAULT '',
    title         text NOT NULL DEFAULT '',
    year          integer,
    cover_image   text NOT NULL DEFAULT '',
    description   text NOT NULL DEFAULT '',
    pdf_url       text NOT NULL DEFAULT '',
    published_at  date,
    is_current    boolean NOT NULL DEFAULT false,
    created_by    bigint REFERENCES admins (id) ON DELETE SET NULL,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

-- at most one current issue
CREATE UNIQUE INDEX journal_issues_current_unique
    ON journal_issues (is_current)
    WHERE is_current;

CREATE INDEX journal_issues_published_idx
    ON journal_issues (published_at DESC NULLS LAST, id DESC);

CREATE TRIGGER journal_issues_touch_updated_at
    BEFORE UPDATE ON journal_issues
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
