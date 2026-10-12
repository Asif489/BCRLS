# BCRLS Website Audit

Read-only audit produced before any code change.
Backup of the original state: git tag `backup-before-admin` plus a read-only snapshot of all
128 HTML/CSS/JS/JSON/TXT/MD files with a SHA-256 manifest
(`%TEMP%/opencode/bcrls-original-snapshot`, `bcrls-original-snapshot.sha256`).

---

## 1. Repository inventory

| Kind | Count | Notes |
|---|---|---|
| HTML | 35 | 2 are not real pages (see §1.2) |
| CSS | 16 | all referenced, no orphans |
| JS | 8 in `js/` | `js/team.js` is loaded by 0 pages |
| Images | ~220 | jpg/jpeg/png/svg |
| PDF | 2 | `assets/docs/BCRLS Module.pdf`, plus 1 in `assets/` |
| Apps Script | 2 | Google Drive gallery — untouched, already working |

Stack: plain HTML + CSS + vanilla JS. No build step, no package manager, no framework.
Scripts: `js/app.js` (2138 lines, loaded everywhere), `js/events.js`, `js/get-involved.js`,
`js/media-gallery.js` + `js/media-gallery-config.js`, `js/home-events.js`,
`js/home-promo-video.js`, `js/team.js` (orphan).
External: Font Awesome 6.5.1 **and** 6.5.2 (mixed), Google Fonts.

### 1.1 Page inventory

| File | Title | H1 | Notes |
|---|---|---|---|
| `index.html` | BCRLS \| Bangladesh Center for Refugee Law Studies | Advancing refugee law… | home; 6 content sections |
| `contact.html` | Contact \| BCRLS | We'd Love to Hear From You | form |
| `datahub/dataPortal.html` | Rohingya Data Portal \| BCRLS | Rohingya Data Portal | 5 portal cards |
| `datahub/database.html` | Database \| BCRLS | South Asia Database | 4 database cards |
| `datahub/statistics.html` | Refugee Statistics | Refugee Statistics | 5 cards; duplicate title/h1 |
| `education/masters.html` | Masters Program \| BCRLS | … | 7 programme cards |
| `education/phd.html` | PhD Program \| BCRLS | … | 10 programme cards |
| `education/traning.html` | Professional Training \| BCRLS | … | filename typo, kept on purpose; 4 cards |
| `events/archive.html` | Event Archive \| BCRLS | Event Archive | 15 `article.event-card` |
| `events/index.html` | Upcoming Events \| BCRLS | Upcoming Events | grid filled by `events.js` |
| `events/upcoming.html` | Upcoming Events \| BCRLS | Upcoming Events | near-duplicate of `events/index.html` |
| `forms/call-for-papers.html` | Call for Papers \| BCRLS | Call for Papers | no `<form>` — informational |
| `get-involved/index.html` | Get Involved \| BCRLS | … | 6 opportunity cards |
| `get-involved/become-a-member.html` | Become a Member \| BCRLS | … | form |
| `get-involved/campus-fellow.html` | Campus Fellow \| BCRLS | … | form |
| `get-involved/internship-programme.html` | Internship Programme \| BCRLS | … | form |
| `get-involved/partner-with-us.html` | Partner With Us \| BCRLS | … | form |
| `get-involved/volunteer-programme.html` | Volunteer Programme \| BCRLS | … | form |
| `insights/index.html` | Insights \| BCRLS | Insights | **stub**, 33 words, 2 placeholder cards |
| `library/academic.html` | Academic Journals \| BCRLS | Academic Journals | 7 cards |
| `library/books.html` | Books & E-Books \| BCRLS | Books & E-Books | 3 cards |
| `library/report.html` | Reports & Documents \| BCRLS | Reports & Documents | 4 cards |
| `media/gallery.html` | Photo Gallery \| BCRLS | Photo Gallery | JS slideshow + Drive feed |
| `media/newsroom.html` | Newsroom \| BCRLS | BCRLS in the News | 1 feature card, thin |
| `media/promo-video.html` | BCRLS Promo Video \| BCRLS | BCRLS Promo Video | 2 cards |
| `pages/Founder.html` | Founder's Message \| BCRLS | A Message from the Founder | prose |
| `pages/Strategic-Objectives.html` | Strategic Objectives \| BCRLS | … | 6 `.bio-item` |
| `pages/about.html` | Who We Are \| BCRLS | Who We Are. | 3+4+11 cards/rows |
| `pages/mission.html` | Mission \| BCRLS | … | 4 `.bio-item` |
| `pages/pages.html` | — | — | **0 bytes, orphan** (0 inbound links) |
| `pages/team.html` | Team \| BCRLS | Our Team | cards rendered by `app.js` `teamData` (9+9+2) |
| `pages/vision.html` | Vision \| BCRLS | … | 5 `.bio-item` |
| `research/blog.html` | Non-Refoulement \| BCRLS | Non-Refoulement | 11 theme / 7 submit / 6 guideline cards |
| `research/conference-proceedings.html` | (none) | (none) | **not a page** — raw nav-dropdown fragment, unstyled |
| `research/journal.html` | Journal \| BCRLS | … | 18 editorial cards, archive/issue placeholders |

### 1.2 Stub / structural problems

1. `pages/pages.html` — 0 bytes, no `<html>`, linked from nothing.
2. `research/conference-proceedings.html` — 2.8 KB `<nav>` fragment with no `<html>/<head>/CSS/JS,
   reachable from the site-wide "Research & Publications" dropdown on ~30 pages. Renders as unstyled
   text. Contains mojibake. Line 29 is a self-link with a doubled `research/` prefix.
3. `insights/index.html` — 1.7 KB, one sentence, no `<header>`/`<nav>`. Every footer links to
   `insights/index.html#expert-interviews` and `#refugee-voices`.
4. `events/index.html` vs `events/upcoming.html` — identical `<title>` and `<h1>`.
5. `media/gallery.html` and `media/newsroom.html` carry a **different, shortened header** (no
   Insights dropdown, shorter labels) — nav drift between copies.
6. `index.html:1592` and `research/journal.html:1033` show "Coming Soon" placeholders.

---

## 2. Broken internal links and asset references (34)

Resolved against the file's own directory, case-sensitively.

### 2.1 Wrong path — target exists elsewhere (21)

| File | Ref | Should be |
|---|---|---|
| `datahub/dataPortal.html` (×2), `datahub/database.html` (×2) | `journal.html` | `../research/journal.html` |
| `datahub/dataPortal.html` (×2), `datahub/database.html` (×2) | `conference-proceedings.html` | `../research/conference-proceedings.html` |
| `datahub/statistics.html:430` | `../pages/founder-message.html` | `../pages/Founder.html` |
| `datahub/statistics.html:456` | `index.html` | `../index.html` |
| `education/masters.html:648`, `phd.html:645`, `traning.html:510` | `../research/call-for-papers.html` | `../forms/call-for-papers.html` |
| `education/masters.html:657`, `phd.html:654`, `traning.html:519` | `training.html` | `traning.html` |
| `pages/about.html` (9 refs) | `index.html`, `pages/Founder.html`, `pages/team.html`, `research/journal.html`, `events/index.html`, `research/conference-proceedings.html`, `research/blog.html`, `get-involved/index.html` | all missing `../` (or doubled `pages/`) |
| `research/conference-proceedings.html:29` | `research/conference-proceedings.html` | `conference-proceedings.html` |

### 2.2 Case-only mismatch (2 — work on Windows, 404 on Linux/hosting)

| File | Ref | Actual |
|---|---|---|
| `datahub/dataPortal.html:441` | `dataportal.html` | `dataPortal.html` |
| `datahub/database.html:404` | `dataportal.html` | `dataPortal.html` |

### 2.3 No such file anywhere (11)

`datahub/dataPortal.html:435` + `datahub/database.html:398` → `datahub.html` (no such page).

`research/conference-proceedings.html`: `editorial.html`, `journal-archive.html`,
`submission-guidelines.html`, `publication-ethics.html`, `callpaper.html`, `blog-guidelines.html`,
`blog-ethics.html`, `call-for-blog.html` (8 refs). Real counterparts that exist: `journal.html`
(already correct), `blog.html`, `../forms/call-for-papers.html`.

### 2.4 Root-absolute paths (3 — break unless served from domain root)

`education/phd.html:11,12` → `/assets/logo.png`; `pages/about.html:705` → `/pages/about.html`.

### 2.5 Dead `href="#"` (41)

Social icons and card links: `contact.html` ×4, `index.html` ×2, `datahub/statistics.html` ×6,
`education/*` ×9, `events/*` ×4, `library/*` ×6, `media/promo-video.html` ×2, `pages/about.html` ×2,
`pages/team.html` ×6. Not console errors, but no-ops.

### 2.6 Clean

- 0 missing `<script src>`, 0 missing `<link rel=stylesheet>`.
- 0 broken refs inside `js/*.js` (79 path literals checked, case-sensitively).
- 0 duplicate `id` attributes, 0 CSS `url()`/`@import` refs, 0 `srcset`.
- Orphans: `pages/pages.html`, `js/team.js`.

### 2.7 Console-error risks found

| Sev | Finding |
|---|---|
| Medium | `src=""` on 5 modal/slideshow images (`index.html:339`, `events/archive.html:747`, `events/upcoming.html:344`, `media/gallery.html:57`, `pages/team.html:413`) → the HTML document is re-requested as an image + decode error. |
| Medium | `js/app.js` `resolveSiteAsset()` depth formula is off by one → all 28 team photos 404 when the site is served from the domain root or opened via `file://`. |
| Medium | `index.html` `#connectionForm` and `#newsletterForm` have **no handler** → native GET submit, full page reload, data lost. `newsletterEmail` has no `name`. |
| Low | `js/home-events.js:6` reads `track.querySelectorAll` before the `if (!track …)` guard. |
| Low | Mobile menu double-bound on the 6 `get-involved/*.html` (both `app.js` and `get-involved.js`). |
| Low | `#eventModal` markup exists in `index.html` but `events.js` is not loaded there → the modal can never open. |
| Low | `js/app.js:250` `modalContent` declared, never used (dead). |

---

## 3. Form inventory (8 forms, 7 files)

No form has `action`, `method`, a honeypot, or a failure path. All are frontend-only mocks.
`forms/call-for-papers.html` contains **no form** (submissions are by email).

| # | File | Form | Fields | Message element | Handler |
|---|---|---|---|---|---|
| 1 | `contact.html:1543` | `#contactForm.contact-form` | contactName, contactEmail, contactPhone, contactSubject (select), contactMessage | `#formMessage` | inline `:1808` |
| 2 | `index.html:1853` | `#connectionForm.connection-form` | connectName, connectEmail, connectInstitution, connectRole, connectInterest, connectMessage, connectConsent (checkbox, no `name`) | **none** | **none → native GET reload** |
| 3 | `index.html:2134` | `#newsletterForm.newsletter-form` | newsletterEmail (**no `name`**) | **none** | **none → native GET reload** |
| 4 | `get-involved/become-a-member.html:1414` | `#memberForm.member-form` | memberName, memberEmail, memberPhone, memberInstitution, memberRole, membershipType, memberInterest, memberMessage | `#memberFormMessage` | inline `:1599` **+** `get-involved.js:405` (double bound) |
| 5 | `get-involved/campus-fellow.html:1398` | `#fellowForm.fellow-form` | fellowName, fellowEmail, fellowPhone, fellowInstitution, fellowPosition, fellowExperience, interestArea (checkbox ×6), fellowResearchTitle, fellowMotivation, fellowCV (`file`) | `#fellowMessage` | inline `:1605` + `get-involved.js:405` |
| 6 | `get-involved/internship-programme.html:1236` | `#internshipForm.internship-form` | internName, internEmail, internPhone, internInstitution, internProgramme, internYear, internArea, internDuration, internMotivation, internCV (`file`) | `#internshipMessage` | inline `:1395` + `get-involved.js:405` |
| 7 | `get-involved/partner-with-us.html:1476` | `#partnerForm.partner-form` | partnerName, partnerEmail, partnerOrganization, partnerPosition, partnerType, partnerCategory, interest (checkbox ×6), partnerMessage | `#partnerMessageBox` | inline `:1682` + `get-involved.js:405` |
| 8 | `get-involved/volunteer-programme.html:1496` | `#volunteerForm.volunteer-form` | volunteerName, volunteerEmail, volunteerPhone, volunteerInstitution, volunteerRole, volunteerExperience, interest (checkbox ×6), volunteerAvailability, volunteerMode, volunteerMotivation | `#volunteerMessage` | inline `:1733` + `get-involved.js:405` |

Notes
- `js/get-involved.js:395-449` binds one shared listener to `.partner-form, .member-form, .fellow-form, .volunteer-form, .internship-form` but writes only to `form.querySelector(".form-message")`, which resolves **only** on `#memberForm`. On the other four it is a silent no-op.
- The inline handlers are registered after `get-involved.js`, so on `become-a-member.html` the inline handler wins and overwrites the shared one → the string *"The BCRLS backend will be connected later."* is unreachable in the UI.
- There is no `fetch`/`XHR`/`sendBeacon` anywhere in the site. No CAPTCHA.

---

## 4. Content inventory (hardcoded posts to be migrated)

Container + item markup actually used, per section.

| Page | Section | Container | Item | Count | Source |
|---|---|---|---|---|---|
| `events/archive.html` | archive | `.events-grid` | `article.event-card[data-event-id]` | 15 | HTML |
| `events/index.html`, `events/upcoming.html` | upcoming | `#upcomingEventsGrid` (empty in HTML) | `.event-card` | 1 | `js/events.js` `upcomingEvents` |
| `index.html` | upcoming | `.event-grid` | `article.event-card` | 1 | HTML |
| `index.html` | latest | `.latest-grid` | `article.latest-card` | 2 | HTML |
| `library/academic.html` | academic | `#academic-journals .library-resource-grid` | `article.library-resource-card` | 7 | HTML |
| `library/report.html` | reports | `#reports .library-resource-grid` | `article.library-resource-card` | 4 | HTML |
| `library/books.html` | books | `#books .library-resource-grid` | `article.library-resource-card` | 3 | HTML |
| `education/masters.html` | masters | `.education-section .container` | `article.training-card` | 7 | HTML |
| `education/phd.html` | phd | `.education-section .container` | `article.training-card` | 10 | HTML |
| `education/traning.html` | training | `.education-section .container` | `article.training-card` | 4 | HTML |
| `datahub/statistics.html` | statistics | `.datahub-grid` | `article.datahub-card` | 5 | HTML |
| `datahub/dataPortal.html` | portals | `.portal-grid` | `.portal-card` / `article.portal-card` | 5 | HTML |
| `datahub/database.html` | database | `.database-grid` | `article.database-card` | 4 | HTML |
| `media/newsroom.html` | newsroom | `.newsroom-list` | `article.newsroom-feature` | 1 | HTML |
| `insights/index.html` | insights | `.latest-grid` | `article.latest-card` (ids `#expert-interviews`, `#refugee-voices`) | 2 | HTML |
| `pages/team.html` | advisory/directors/operational | `#advisoryGrid` / `#directorsGrid` / `#operationalGrid` | `.member-card` | 9+9+2 | `js/app.js` `teamData` |
| `media/gallery.html` | gallery | `#driveGallery` / `#mediaSlideStage` | `.media-slide` | 39 photos | `js/media-gallery.js` + Drive feed (keep as is) |

Two authoritative sources exist for events (15 HTML cards vs `archiveEventDetails` /
`archiveDateByTitle` in `js/events.js`) and for the team (prose on `pages/*` vs `teamData` in
`js/app.js`). The extractor reconciles them by title.

Representative markup to be cloned (verbatim):

```html
<article class="event-card" data-event-id="1">
    <div class="event-card-image">
        <img alt="BCRLS Inaugural Lecture Series" src="../assets/events/inargument.jpeg"/>
    </div>
    <div class="event-card-body">
        <span class="event-card-type">LECTURE SERIES</span>
        <h3 class="event-card-title">BCRLS Inaugural Lecture Series</h3>
        <div class="event-card-meta">
            <span><i class="fa-regular fa-calendar"></i> 7 October 2025</span>
        </div>
        <p class="event-card-description">…</p>
        <button class="event-details-btn" data-event-id="1" type="button">
            Event Details <i class="fa-solid fa-arrow-right"></i>
        </button>
    </div>
</article>
```

Structural (non-post) cards that are **not** migrated as posts: `index.html` `.research-card`
portal links, `get-involved/index.html` `.opportunity-card`, `research/blog.html` theme/submit/
guideline cards, `.bio-item` on `pages/*`, journal editorial board.

---

## 5. Navbar (Task 1) — why it breaks

- `css/responsive.css` is 4605 lines / 110 KB of stacked, contradictory media queries with 11
  different breakpoints (1500, 1201, 1025, 1024, 1000, 901, 900, 768, 767, 520, 480, 479, 360).
- Three JS-toggled device classes (`bcrls-touch-device`, `bcrls-mobile-device`,
  `bcrls-desktop-mode`) are written by an IIFE in `js/app.js:1900-1947` and then get their own
  competing nav rules at `responsive.css:4011-4598`. Depending on the class the same breakpoint
  gets a different `.main-nav` layout.
- Two different "open" states are used (`.main-nav.active` from `js/get-involved.js` /
  `js/team.js`, `.main-nav.mobile-open` from `js/app.js`), so on `get-involved/*` two listeners
  fight over one button.
- Dropdown open state is `.nav-dropdown.mobile-open` **or** `.nav-dropdown.open`, and the
  hover-only desktop rules (`.nav-dropdown:hover .dropdown-menu`) leak into touch layouts.
- No `aria-expanded` sync on `.nav-dropdown-toggle`, no outside-click close, no body scroll lock
  verification, touch targets below 44px, and no focus management.

Fix strategy: one appended, self-contained override block at the **end** of `css/responsive.css`
plus a rewritten mobile-nav block in `js/app.js`. Nothing above the block changes, so the
≥1201px desktop rendering is byte-for-byte the same rules that exist today.

---

## 6. Proposed schema

```sql
-- 001_init.sql
CREATE TABLE admins (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         citext UNIQUE NOT NULL,        -- falls back to text + lower() index
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_login    timestamptz
);

CREATE TABLE content_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page          text NOT NULL,                 -- home|about|research|library|education|datahub|events|insights|media|get-involved|contact
  section       text NOT NULL,                 -- see §6.1
  category      text,                          -- free-form sub label shown on the card
  title         text NOT NULL,
  slug          text NOT NULL,
  summary       text,
  body          text,                          -- sanitized HTML
  image_url     text,
  link_url      text,
  event_date    timestamptz,
  published_at  timestamptz,
  status        text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
  display_order integer NOT NULL DEFAULT 0,
  extra         jsonb NOT NULL DEFAULT '{}'::jsonb,   -- venue, authors, duration, fees, ...
  legacy_key    text UNIQUE,                   -- set for items imported from the static site
  is_hidden     boolean NOT NULL DEFAULT false,
  is_imported   boolean NOT NULL DEFAULT false, -- shown as "imported" in admin only
  edited_at     timestamptz,                   -- set on admin update -> frontend replaces the hardcoded node
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_items_page_section_idx ON content_items (page, section, status, is_hidden);
CREATE INDEX content_items_event_date_idx   ON content_items (event_date DESC NULLS LAST);
CREATE INDEX content_items_slug_idx         ON content_items (slug);

CREATE TABLE uploads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename     text NOT NULL,
  storage_key  text NOT NULL,        -- path / cloudinary public_id
  url          text NOT NULL,
  mime_type    text NOT NULL,
  size_bytes   integer NOT NULL,
  created_by   uuid REFERENCES admins(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE form_submissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL,         -- contact|connection|newsletter|membership|fellow|internship|partner|volunteer
  payload     jsonb NOT NULL,
  status      text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','archived')),
  ip_hash     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX form_submissions_type_idx ON form_submissions (type, created_at DESC);

CREATE TABLE audit_log (
  id         bigserial PRIMARY KEY,
  admin_id   uuid REFERENCES admins(id) ON DELETE SET NULL,
  action     text NOT NULL,          -- create|update|delete|login|logout
  entity     text NOT NULL,          -- content_item|form_submission|admin|upload
  entity_id  text,
  meta       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 6.1 `page` / `section` values

| page | sections |
|---|---|
| `home` | `upcoming`, `latest`, `research-cards` |
| `about` | `team`, `founder`, `mission`, `vision`, `objectives`, `directors`, `advisors` |
| `research` | `blog`, `journal`, `conference-proceedings`, `call-for-papers` |
| `library` | `academic`, `books`, `reports` |
| `education` | `masters`, `phd`, `training` |
| `datahub` | `datahub` |
| `events` | `upcoming`, `archive` |
| `insights` | `insights` |
| `media` | `newsroom`, `gallery`, `promo-video` |
| `get-involved` | `overview`, `membership`, `fellow`, `internship`, `partner`, `volunteer` |
| `contact` | `contact` |

Team members are stored as `page='about'`, `section` ∈ `advisors|directors|operational`, with
`extra.role`, `extra.full_role`, `extra.photo`, `extra.bio` — they map 1:1 onto the existing
`teamData` shape and the `updateTeam()` / `addTeamMember()` / `removeTeamMember()` hooks that
`js/app.js` already exposes.

---

## 7. Risk register

| Risk | Mitigation |
|---|---|
| Losing hardcoded content | tag + read-only snapshot + SHA-256 manifest before any edit; extraction writes permanent JSON copies under `server/seed/legacy/` |
| API down → blank sections | frontend only mutates the DOM after a **successful** response; failures leave the hardcoded markup untouched |
| XSS through the admin | `sanitize-html` server-side on every `body`/`summary`, escaping on render, strict CSP headers |
| Layout shift on first paint | untouched hardcoded nodes are left in place unless `edited_at` says they changed |
| Non-persistent disk on Render | storage behind an interface; local driver for dev, Cloudinary driver for production |
| Native password-hash deps failing to build on Windows | `bcryptjs` (pure-JS bcrypt) with a cost factor of 12, swappable via config |
