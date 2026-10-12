/* =========================================================
   BCRLS JOURNAL ISSUES
   Renders the BJRLDs "Current Issue" and "Archive" sections from
   GET /api/public/issues.

   - the static markup already ships a "Coming Soon" fallback and an archive
     placeholder; both are left untouched when the request fails or no issue
     exists yet
   - every value is written with textContent, and link/image URLs are checked
     before they are set, so a stored value can never inject markup here
   ========================================================= */

(function () {
    "use strict";

    if (window.__bcrlsJournalIssues) return;
    window.__bcrlsJournalIssues = true;

    var API = "/api/public/issues";
    var UNSAFE_URL = /^\s*(?:javascript|vbscript|data:text\/html|file|blob):/i;

    function safeUrl(value) {
        var url = String(value || "").trim();
        if (!url || UNSAFE_URL.test(url)) return "";
        return url;
    }

    function make(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined && text !== null) node.textContent = String(text);
        return node;
    }

    function formatDate(iso) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""))) return "";
        try {
            return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        } catch (err) {
            return "";
        }
    }

    /* "Volume 3 · Issue 1" */
    function issueLabel(issue) {
        var parts = [];
        if (issue.volume) parts.push(issue.volume);
        if (issue.issueNumber) parts.push(issue.issueNumber);
        return parts.join(" \u00b7 ");
    }

    function issueHeading(issue) {
        return issueLabel(issue) || issue.title || (issue.year ? String(issue.year) : "Journal issue");
    }

    function coverFigure(issue, className, placeholderClass) {
        var url = safeUrl(issue.coverImage);
        if (url) {
            var figure = make("figure", className);
            var img = document.createElement("img");
            img.src = url;
            img.alt = "Cover of " + issueHeading(issue);
            img.loading = "lazy";
            figure.appendChild(img);
            return figure;
        }

        var placeholder = make("div", placeholderClass);
        placeholder.setAttribute("aria-hidden", "true");
        placeholder.appendChild(make("span", "", issue.year || "BJRLDs"));
        placeholder.appendChild(make("strong", "", "BJRLDs"));
        return placeholder;
    }

    function downloadLink(issue, className, label) {
        var url = safeUrl(issue.pdfUrl);
        if (!url) return null;
        var link = make("a", className, label || "Download issue");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener";
        return link;
    }

    /* ------------------------------------------------------- current issue */

    function renderCurrent(panel, issue) {
        panel.replaceChildren();

        var info = make("div", "journal-current-info");

        info.appendChild(make("span", "journal-eyebrow", "CURRENT ISSUE"));
        info.appendChild(make("h2", "", issueHeading(issue)));

        if (issue.title && issueLabel(issue)) {
            info.appendChild(make("p", "journal-current-title", issue.title));
        }

        if (issue.description) {
            info.appendChild(make("p", "journal-current-description", issue.description));
        }

        var meta = make("div", "journal-issue-meta");
        if (issue.year) meta.appendChild(make("span", "", String(issue.year)));
        var published = formatDate(issue.publishedAt);
        if (published) meta.appendChild(make("span", "", "Published " + published));
        if (meta.childNodes.length) info.appendChild(meta);

        var download = downloadLink(issue, "journal-issue-download", "Download this issue");
        if (download) info.appendChild(download);

        panel.appendChild(info);
        panel.appendChild(coverFigure(issue, "journal-current-cover", "journal-current-placeholder"));
        panel.classList.add("journal-info-panel-filled");
    }

    /* --------------------------------------------------------------- archive */

    function archiveItem(issue) {
        var item = make("article", "journal-archive-item" + (issue.isCurrent ? " is-current" : ""));

        item.appendChild(coverFigure(issue, "journal-archive-cover", "journal-archive-placeholder"));

        var body = make("div", "journal-archive-body");

        body.appendChild(
            make(
                "span",
                "journal-archive-tag",
                issue.isCurrent ? "Current issue" : "Archive"
            )
        );
        body.appendChild(make("h3", "", issueHeading(issue)));

        var subtitle = issue.title && issueLabel(issue) ? issue.title : "";
        if (subtitle) body.appendChild(make("p", "journal-archive-title", subtitle));

        if (issue.description) {
            body.appendChild(make("p", "journal-archive-desc", issue.description));
        }

        var meta = make("div", "journal-issue-meta");
        if (issue.year) meta.appendChild(make("span", "", String(issue.year)));
        var published = formatDate(issue.publishedAt);
        if (published) meta.appendChild(make("span", "", published));
        if (meta.childNodes.length) body.appendChild(meta);

        var download = downloadLink(issue, "journal-archive-link", "Download");
        if (download) body.appendChild(download);

        item.appendChild(body);
        return item;
    }

    function renderArchive(list, fallback, issues) {
        list.replaceChildren();

        issues.forEach(function (issue) {
            list.appendChild(archiveItem(issue));
        });

        if (issues.length) {
            if (fallback) fallback.hidden = true;
            list.hidden = false;
        } else {
            if (fallback) fallback.hidden = false;
            list.hidden = true;
        }
    }

    /* ---------------------------------------------------------------- boot */

    function apply(payload) {
        if (!payload) return;

        var currentPanel = document.getElementById("journalCurrentIssue");
        if (currentPanel && payload.current) {
            renderCurrent(currentPanel, payload.current);
        }

        var list = document.getElementById("journalArchiveList");
        var fallback = document.getElementById("journalArchiveFallback");
        if (list && Array.isArray(payload.issues) && payload.issues.length) {
            renderArchive(list, fallback, payload.issues);
        }
    }

    function boot() {
        fetch(API, { credentials: "same-origin", headers: { Accept: "application/json" } })
            .then(function (response) {
                if (!response.ok) throw new Error("HTTP " + response.status);
                return response.json();
            })
            .then(apply)
            .catch(function () {
                /* no API or no data - the static "Coming Soon" markup stays */
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }
})();
