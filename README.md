# BCRLS Website + Content Admin

The website of the **Bangladesh Center for Refugee Law Studies** — a static
HTML/CSS/vanilla-JS site (35 pages, no build step, no framework) — plus a
small Express API and a vanilla-JS admin panel that let staff edit content
and read form submissions **without touching the HTML files**.

Two rules shaped the whole project:

1. **The static files are the source of truth.** If the API is down, every
   page renders exactly as shipped. The API only *overlays* edits on top of
   the markup the browser already received.
2. **Nothing original is lost.** The pre-project state is preserved in the
   git tag `backup-before-admin`, and `npm run verify:snapshot` proves the
   shipped files differ only where they are allowed to.

---

## 1. Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  BROWSER                                                            │
│                                                                      │
│  static page (index.html, contact.html, ...)                         │
│    ├── js/app.js          nav + team data, injects two scripts:      │
│    │     ├── js/content-sync.js   overlays edited content            │
│    │     └── js/form-submit.js    posts forms to the API             │
│    ├── js/events.js, js/get-involved.js, ...   page behaviour        │
│    └── inline <script> per page (original, untouched)                │
└──────────────┬──────────────────────────────┬────────────────────────┘
               │ GET  /*.html, /css, /js, /assets
               │ GET  /api/public/content?path=...
               │ POST /api/forms/:key
               │ GET  /admin  (admin panel, static)
               │ POST /api/auth/login  -> JWT
               │ CRUD /api/admin/...   (Bearer token)
               ▼                              ▼
┌────────────────────────────┐   ┌────────────────────────────────────┐
│  Express (server/src)      │   │  PostgreSQL                        │
│  app.js                    │   │  admins          (accounts, bcrypt)│
│   ├── helmet + CORS        │   │  content_sections (section meta,   │
│   ├── repository firewall  │   │                    selectors)      │
│   │   (/server, /.env,     │   │  content_items    (edits + imports)│
│   │    /package.json 403)  │   │  form_submissions (site forms)     │
│   ├── /api/auth            │   │  uploads         (image metadata)  │
│   ├── /api/public          │   │  audit_log       (who changed what)│
│   ├── /api/admin/*         │   └────────────────────────────────────┘
│   ├── /api/forms           │
│   ├── /uploads             │──> local disk (dev) or Cloudinary (prod)
│   └── static site + /admin │
└────────────────────────────┘
```

* **One process serves everything** in the default setup: the site, the
  admin panel and the API on a single port (`PORT`, default 4000).
* The admin panel (`admin/`) is a separate static SPA — plain HTML + ES
  modules, no framework, no build.
* All SQL lives in `server/`; all site code lives at the repository root.

---

## 2. Local setup

### Requirements

| | |
|---|---|
| Node.js | **20 or newer** (developed on 24; `node -v` to check) |
| PostgreSQL | 14+ (Docker image `postgres:16-alpine` works well) |
| npm | ships with Node |

### 2.1 Install dependencies

```bash
npm install
```

### 2.2 PostgreSQL

**Option A — Docker (same on Windows and Linux):**

```bash
docker run -d --name bcrls-postgres \
  -e POSTGRES_USER=bcrls -e POSTGRES_PASSWORD=bcrls \
  -e POSTGRES_DB=bcrls \
  -p 5432:5432 postgres:16-alpine
```

On Windows PowerShell, the command is identical (line continuations become
a backtick `` ` `` if you prefer one line — or just paste it as one line).

**Option B — local PostgreSQL:** create a role and database:

```sql
CREATE ROLE bcrls LOGIN PASSWORD 'bcrls';
CREATE DATABASE bcrls OWNER bcrls;
```

### 2.3 Configure

```bash
cp .env.example .env        # Windows: copy .env.example .env
```

Then edit `.env` — at minimum set a real `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`.env` is git-ignored; never commit it. Key variables:

| Variable | Meaning | Default |
|---|---|---|
| `PORT` | HTTP port | `4000` |
| `SITE_ROOT` | directory served as the static site | `.` (repo root) |
| `DATABASE_URL` | `postgres://user:pass@host:port/db` | — (required) |
| `JWT_SECRET` | signing key for admin sessions, ≥ 32 chars | random in dev, **required in production** |
| `JWT_EXPIRES_IN` | admin session lifetime | `8h` |
| `STORAGE_DRIVER` | `local` or `cloudinary` | `local` |
| `UPLOAD_DIR` | where images are written in `local` mode | `server/uploads` |
| `CLOUDINARY_URL` | `cloudinary://key:secret@cloud` (production) | — |
| `PUBLIC_ORIGIN` | the site origin, used for CORS | `http://localhost:4000` |

### 2.4 Create the schema and content

```bash
npm run db:migrate      # apply server/migrations/*.sql
npm run extract         # read the HTML -> server/seed/legacy/content.json
npm run db:seed         # load that JSON into content_sections/content_items
npm run create-admin    # e-mail + password for the first admin account
```

`npm run db:seed` is safe to re-run: rows an admin has already edited
(`edited_at` set) are never overwritten.

### 2.5 Run

```bash
npm run dev             # node --watch server/src/index.js
# or
npm start
```

Open <http://localhost:4000> for the site and
<http://localhost:4000/admin> for the panel.

---

## 3. Commands

| Command | What it does |
|---|---|
| `npm start` | run the server |
| `npm run dev` | run with auto-restart on change |
| `npm run db:migrate` | apply pending SQL migrations (each in its own transaction) |
| `npm run extract` | parse the static HTML/JS into `server/seed/legacy/content.json` |
| `npm run db:seed` | load/refresh the extracted content into Postgres |
| `npm run create-admin` | create an admin account (interactive, or `--email --password --name`) |
| `npm test` | full test suite (Node's built-in test runner, per-file test databases) |
| `npm run verify:snapshot` | prove the site files still match `backup-before-admin` |

---

## 4. How the content overlay works

### 4.1 The site ships with hardcoded content

Every card, event, library entry and team member exists as real HTML (or as
a JS data array in `js/events.js` / `js/app.js`). That markup is what a
visitor sees with **no API at all**.

### 4.2 Extraction copies it into the database

`npm run extract` walks the site according to `server/scripts/legacy-spec.js`,
writes one row per item into `content_sections` + `content_items`
(`is_imported = true`, `edited_at = NULL`) and produces the seed JSON.
`npm run db:seed` loads it.

### 4.3 Edits are *overlays*, not replacements

1. An admin edits an item in the panel → the API stores the new `data` and
   stamps `edited_at = now()`.
2. The page loads `js/content-sync.js` (injected by `js/app.js`).
   It calls `GET /api/public/content?path=/current/page.html`.
3. The overlay **only writes a DOM node when its row carries `editedAt`** —
   untouched rows are ignored, so an untouched install renders the original
   bytes.
4. If the API is unreachable, the request fails silently and the hardcoded
   markup stays exactly as shipped.
5. New items created in the panel are appended using the section's
   `template_html`; hidden items (`is_hidden`) are suppressed.

That is why "hide" and "delete" in the panel never edit the HTML files on
disk: `npm run verify:snapshot` still passes afterwards.

### 4.4 Forms

`js/form-submit.js` (loaded via `js/app.js` on every page) registers one
capture-phase `submit` listener. For each of the eight forms
(`contact`, `connection`, `newsletter`, `member`, `fellow`, `internship`,
`partner`, `volunteer`) it:

* stops the original fake handlers and the native GET submit,
* validates with the browser's own constraint validation,
* adds a hidden honeypot field **in JavaScript** (never in the HTML),
* POSTs the form as JSON to `POST /api/forms/:key`,
* shows success/error text in the message element the page already has,
* disables the submit button while the request is in flight,
* on failure (API down, rate limit, validation) keeps everything the user
  typed and shows a friendly message.

Submissions land in `form_submissions` and appear in the panel's
**Submissions** screen. Bots that fill the honeypot get a fake success and
nothing is stored. Each IP may send 20 submissions per 10 minutes.

---

## 5. Adding a new section to `legacy-spec.js`

`server/scripts/legacy-spec.js` exports three arrays:

* `SCALARS` — one value (a hero heading, a paragraph),
* `HTML_COLLECTIONS` — repeated cards that exist in the markup,
* `JS_COLLECTIONS` — repeated items that exist only in a JS data array
  (upcoming events, team members).

**Example: make the four cards on `library/books.html` editable.**

```js
// server/scripts/legacy-spec.js, inside HTML_COLLECTIONS:
{
  key: "library-books",            // stable, unique, lowercase-with-dashes
  title: "Library - books",        // what the admin sees
  pages: ["/library/books.html"],  // pages that receive this section
  container: ".library-resource-grid",   // element holding the cards
  item: "article.library-resource-card", // one card
  matchBy: "title",                // optional: pair rows with DOM nodes by
                                   // a unique field instead of position
  slugFrom: "title",               // field used to build the row slug
  fields: {
    title:       { sel: "h3", label: "Title", type: "text" },
    description: { sel: "p",  label: "Description", type: "textarea" },
    link:        { sel: "a",  attr: "href", label: "Link", type: "url" },
    image:       { sel: "img", attr: "src", label: "Cover", type: "image" },
  },
}
```

Field spec keys:

| key | meaning |
|---|---|
| `sel` | CSS selector resolved **inside the card**, or `@data-...` for an attribute of the card root |
| `attr` | read/write this attribute instead of text |
| `mode` | `text` (escaped), `html` (sanitised rich text), `attr` |
| `label` | label shown in the panel |
| `type` | input hint: `text`, `textarea`, `url`, `date`, `image`, `list`, `number`, `object` |
| `virtual` | `true` for values that exist only in JS data, not in the markup |
| `slugFrom` | use this field to build the row slug |

Then run:

```bash
npm run extract      # re-parse the site -> content.json
npm run db:seed      # upsert the new section + items (edits are preserved)
```

Rules:

* `key` and `pages` must be right — the overlay only runs on listed pages.
* Every field the panel should edit must have a selector that matches on
  **every** card of that section.
* If `matchBy` is set, the value must be unique per row (the API answers
  `409` otherwise) — use it when cards can be reordered.
* For `JS_COLLECTIONS` also add the enrichment hooks the extractor needs
  (see the existing `events-upcoming` entry) and, like `js/events.js` does,
  publish the data array on `window` so the overlay can reach it.

After re-seeding, check the panel: the new section appears in the nav with
its imported count, and its items are editable immediately.

---

## 6. Admin guide (for the client)

**Signing in.** Go to `/admin` on the website and sign in with the e-mail
and password your developer gave you. Sessions last 8 hours; after that,
sign in again. Five wrong passwords in a row are slowed down on purpose.

**The dashboard** shows how many items exist per section and how many have
been edited or hidden — a quick health check.

**Editing content.**

1. Pick the page section in the left sidebar (e.g. *Events → Event
   archive*).
2. Click an item, change what you need, press **Save**.
3. Reload the public page: the change is live immediately.

Nothing you do in the panel edits the HTML files, so the site can always be
restored to its original state.

**Hiding vs deleting.**

* **Hide** keeps the item in the database but removes it from the public
  page — use this for anything you might want back.
* **Delete** removes it permanently — use this only for junk.

**Adding an item.** Open a section and use **New item**. Fill in at least
the title; leave the rest blank if you like. The item appears at the bottom
of the public list. You can reorder with the up/down buttons.

**Uploading images.** Image fields have an upload button. Files must be
JPEG, PNG, WebP, GIF, SVG or AVIF and under 5 MB. Every upload gets a unique
file name, so uploading `poster.jpg` twice never overwrites the first one.
Copy the image URL into plain URL fields if needed.

**Submissions.** The *Submissions* screen lists everything sent through the
website forms. You can mark a row **read** or **archived**, filter by form,
and export the list as CSV. The e-mail address and message of each sender
are in the row itself.

**Account screen.** Change your own password here. New passwords need at
least 10 characters.

**When something looks wrong:** reload the page; if a section is empty, the
site is showing the original content, which is always safe. Contact your
developer before changing anything else.

---

## 7. Deployment

### 7.1 API + admin (e.g. Render, Railway, Fly.io, a VPS)

Any host that runs Node 20+ and gives you a managed PostgreSQL works. For
Render: a **Web Service** + a **Postgres** instance.

```bash
# build command
npm install
# start command
npm run db:migrate && npm start
```

Environment variables on the host:

```
NODE_ENV=production
PORT=10000                    # whatever the platform assigns
DATABASE_URL=<from the managed database>
JWT_SECRET=<64 random hex chars>   # REQUIRED: production refuses to start
                                  # with a missing or weak secret
JWT_EXPIRES_IN=8h
STORAGE_DRIVER=cloudinary
CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud>
PUBLIC_ORIGIN=https://www.bcrls.org   # the origin of the static site
SITE_ROOT=.                    # if you deploy the site with the API
```

Because disk on these platforms is ephemeral, **use `cloudinary` for
uploads in production** — files written to `UPLOAD_DIR` disappear on every
deploy.

Smoke test after deploy:

```bash
curl https://your-api.onrender.com/api/health
```

### 7.2 Static site on a separate host

The site can also be served as plain files (Netlify, Cloudflare Pages, S3,
nginx…). Two things must then be true:

1. **The HTML/CSS/JS must be the same files as in this repository** — they
   are the fallback when the API is down.
2. **CORS must allow the site's origin.** Set `PUBLIC_ORIGIN` on the API to
   the exact origin the pages are served from (scheme + host, no trailing
   slash), e.g. `https://www.bcrls.org`. The API sends that origin in
   `Access-Control-Allow-Origin`.

The pages call the API with **relative** URLs (`/api/public/content`,
`/api/forms/...`), so for a split deployment you must put the API on the
same host name — the simplest way is a reverse proxy:

```nginx
# nginx: site files locally, /api and /admin proxied to the Node app
location /api/   { proxy_pass http://127.0.0.1:4000; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
location /admin/ { proxy_pass http://127.0.0.1:4000; }
location /uploads/ { proxy_pass http://127.0.0.1:4000; }
location /       { root /var/www/bcrls; try_files $uri $uri/ /index.html; }
```

(If the platform cannot proxy, the alternative is serving the API from the
site's own origin — do **not** try to mix two different domains without
also changing the relative URLs in `js/content-sync.js` and
`js/form-submit.js`.)

### 7.3 Security headers / CSP

The server sets a Content-Security-Policy via `helmet` (see
`server/src/app.js`). The policy allows:

* scripts from `'self'` **plus `'unsafe-inline'`** — the original site has
  an inline `<script>` block on ~30 pages (navigation, form handlers,
  galleries); these are listed in `server/src/app.js` and in the CSP
  report comment there. External script origins that are allowed: none
  (Font Awesome and Google Fonts are CSS, not script).
* styles from `'self'`, `'unsafe-inline'` (the pages carry large inline
  `<style>` blocks) and `fonts.googleapis.com`;
* fonts from `'self'`, `fonts.gstatic.com`, `data:` and `cdnjs.cloudflare.com`;
* images from `'self'`, `data:`, remote https (Cloudinary, Google Drive
  thumbnails);
* frames for the Google Drive gallery embeds;
* `connect-src 'self'` plus `PUBLIC_ORIGIN` (the overlay and forms only
  ever call their own origin).

In production `NODE_ENV=production` **refuses to start** when `JWT_SECRET`
is missing or shorter than 32 characters.

### 7.4 Backup and restore

**Backup (daily, via cron or the platform's scheduler):**

```bash
pg_dump --format=custom --no-owner \
  "$DATABASE_URL" \
  > "bcrls-$(date +%Y%m%d-%H%M%S).dump"
```

Keep the dumps off the server (object storage or a second machine). The
database is small (a few MB), so daily full dumps are cheap.

**Restore:**

```bash
dropdb --if-exists bcrls_restore
createdb bcrls_restore
pg_restore --no-owner --dbname=bcrls_restore bcrls-YYYYMMDD-HHMMSS.dump
# then point DATABASE_URL at bcrls_restore (or swap the names)
```

On Render/Railage use the platform's *Backup / Restore* button — same file
format.

**What is NOT in the database:** the site files themselves (they live in
git — `git archive` or the `backup-before-admin` tag is your site backup)
and the uploaded images. If `STORAGE_DRIVER=cloudinary`, back up the
Cloudinary folder with their media library export; if `local`, back up
`server/uploads/`.

**Verify both halves regularly:**

```bash
npm run verify:snapshot   # site files intact vs backup-before-admin
npm test                  # API intact
```

---

## 8. Repository layout

```
/                       static site: *.html, css/, js/, assets/
/admin                   admin panel (static SPA, no build step)
/server
  /src
    app.js              express app: helmet, CORS, firewall, routes
    config.js           .env parsing + production safety checks
    /routes             auth, public content, admin content, forms, uploads
    /middleware         auth (JWT), validation (zod), error handling
    /lib                sanitising, storage drivers, audit, http helpers
    /db                 pg pool, migrations runner
  /migrations           *.sql, applied once, in order
  /scripts              extract, seed, migrate, create-admin,
                        legacy-spec, verify-snapshot, navbar-geometry
  /test                 Node test-runner suites + helpers
  /seed/legacy          content.json generated by `npm run extract`
/docs                   AUDIT.md (pre-project state), screenshots
```

## 9. Tests

```bash
npm test
```

Suites: authentication (success, wrong password, expired/forged token,
deactivated account), content CRUD (create/update/hide/delete, validation
failures, the duplicate-`matchBy` 409, XSS sanitising, `javascript:` URL
rejection), the public overlay (only edited rows are stamped), the forms
endpoint (valid, invalid, honeypot, rate limit) and the repository
firewall (`/server/*`, `/.env`, `/package.json` all answer 403).

Each test file runs in its own process against its own freshly created
`*_test` database, so suites can run in parallel and never touch your
development data.
