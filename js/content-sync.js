/* =========================================================
   BCRLS CONTENT SYNC
   Overlays edited content from the API onto the static page.

   - runs only after a successful response of /api/public/content
   - touches a DOM node only when the stored row carries editedAt,
     so an untouched install renders exactly the static markup
   - if the API is unreachable nothing happens at all
   ========================================================= */

(function () {
    "use strict";

    if (window.__bcrlsContentSync) return;
    window.__bcrlsContentSync = true;

    var API = "/api/public/content";

    /* ---------------------------------------------------- helpers */

    function esc(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function kebab(name) {
        return String(name).replace(/[A-Z]/g, function (ch) {
            return "-" + ch.toLowerCase();
        });
    }

    function whenLoaded(fn) {
        if (document.readyState === "complete") fn();
        else window.addEventListener("load", fn, { once: true });
    }

    function whenReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn, { once: true });
        } else {
            fn();
        }
    }

    function has(name) {
        try {
            return typeof window[name] !== "undefined" || eval("typeof " + name) !== "undefined";
        } catch (err) {
            return false;
        }
    }

    /* References to data declared with const/let in other classic scripts
       (teamData, upcomingEvents, ...) resolve through the global lexical
       environment, which typeof alone cannot probe safely. */
    function globalValue(name) {
        try {
            /* eslint-disable no-eval */
            return eval(name);
            /* eslint-enable no-eval */
        } catch (err) {
            return undefined;
        }
    }

    function setGlobal(name, value) {
        try {
            /* eslint-disable no-eval */
            eval(name + " = value");
            /* eslint-enable no-eval */
        } catch (err) {
            /* frozen or missing - nothing we can do */
        }
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

    function sortedItems(section, items) {
        return items.slice().sort(function (a, b) {
            return a.index - b.index;
        });
    }

    /* ---------------------------------------------- DOM application */

    function findTarget(root, selector) {
        if (selector.charAt(0) === "@") return root;
        if (root === document) return document.querySelector(selector);
        return root.querySelector(selector);
    }

    function applyField(root, spec, value) {
        if (!spec || !spec.sel || value === undefined || value === null) return;

        var el = findTarget(root, spec.sel);
        if (!el) return;

        if (spec.mode === "attr" || spec.attr) {
            el.setAttribute(spec.attr || spec.sel.slice(1), String(value));
        } else if (spec.mode === "html") {
            el.innerHTML = (spec.keep ? spec.keep + " " : "") + esc(value);
        } else {
            el.textContent = String(value);
        }
    }

    function applyFields(root, fields, data) {
        Object.keys(fields || {}).forEach(function (name) {
            var spec = fields[name];
            if (!spec || spec.virtual || !spec.sel) return;
            applyField(root, spec, data[name]);
        });
    }

    function renderTemplate(templateHtml, data) {
        return templateHtml.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, function (_, key) {
            var value = data[key];
            return value === undefined || value === null ? "" : esc(value);
        });
    }

    function applyScalar(section, items) {
        var item = items[0];
        if (!item) return;

        var spec = section.fields && section.fields.value;
        if (!spec || !spec.sel) return;

        var el = document.querySelector(spec.sel);
        if (!el) return;

        if (item.hidden) {
            el.style.display = "none";
            return;
        }

        if (!item.editedAt) return;

        applyFields(document, section.fields, item.data);
    }

    function applyCollection(section, items) {
        if (!section.containerSelector || !section.itemSelector) return;

        var container = document.querySelector(section.containerSelector);
        if (!container) return;

        var nodes = Array.prototype.slice.call(
            container.querySelectorAll(section.itemSelector)
        );

        var ordered = sortedItems(section, items);
        var importedCount = section.importedCount || 0;

        if (section.matchBy) {
            applyByAttribute(section, container, nodes, ordered, importedCount);
        } else {
            applyByPosition(section, container, nodes, ordered, importedCount);
        }
    }

    function applyByPosition(section, container, nodes, ordered, importedCount) {
        var present = {};

        ordered.forEach(function (item) {
            present[item.index] = true;

            if (item.index < importedCount) {
                var node = nodes[item.index];
                if (!node) return;
                if (item.hidden) {
                    node.style.display = "none";
                    return;
                }
                if (item.editedAt) applyFields(node, section.fields, item.data);
                return;
            }

            appendNew(section, container, item);
        });

        /* rows that disappeared from the database hide their static node */
        for (var i = 0; i < importedCount && i < nodes.length; i += 1) {
            if (!present[i]) nodes[i].style.display = "none";
        }
    }

    function applyByAttribute(section, container, nodes, ordered, importedCount) {
        var attr = "data-" + kebab(section.matchBy);
        var byKey = {};
        var used = {};

        nodes.forEach(function (node) {
            byKey[node.getAttribute(attr)] = node;
        });

        ordered.forEach(function (item) {
            var key = String(item.data[section.matchBy]);

            if (item.index < importedCount) {
                var node = byKey[key];
                used[key] = true;
                if (!node) return;
                if (item.hidden) {
                    node.style.display = "none";
                    return;
                }
                if (item.editedAt) applyFields(node, section.fields, item.data);
                return;
            }

            appendNew(section, container, item);
        });

        nodes.forEach(function (node) {
            var key = node.getAttribute(attr);
            if (!used[key]) node.style.display = "none";
        });
    }

    function appendNew(section, container, item) {
        if (item.hidden) return;
        if (!section.templateHtml) return;

        container.insertAdjacentHTML("beforeend", renderTemplate(section.templateHtml, item.data));
    }

    /* ----------------------------------------------------- js hooks */

    function hookEventsUpcoming(section, items) {
        var list = globalValue("upcomingEvents");
        if (!Array.isArray(list)) return;

        var next = sortedItems(section, items)
            .filter(function (item) { return !item.hidden; })
            .map(function (item) { return item.data; });

        list.length = 0;
        next.forEach(function (entry) { list.push(entry); });

        whenReady(function () {
            if (typeof loadUpcomingEvents === "function") loadUpcomingEvents();
        });
    }

    function hookTeam(group) {
        return function (section, items) {
            var data = globalValue("teamData");
            if (!data || !Array.isArray(data[group])) return;

            var next = sortedItems(section, items)
                .filter(function (item) { return !item.hidden; })
                .map(function (item) { return item.data; });

            data[group].length = 0;
            next.forEach(function (entry) { data[group].push(entry); });

            whenReady(function () {
                if (group === "operational") {
                    if (typeof renderOperational === "function") renderOperational();
                } else {
                    if (typeof renderTeam === "function") renderTeam(group);
                }
            });
        };
    }

    function hookEventsArchive(section, items) {
        whenLoaded(function () {
            var details = globalValue("archiveEventDetails");
            var dateByTitle = globalValue("archiveDateByTitle");
            var ordered = sortedItems(section, items);

            if (details && typeof details === "object") {
                ordered.forEach(function (item) {
                    if (!item.editedAt) return;
                    var id = Number(item.data.eventId);
                    if (!id) return;
                    details[id] = item.data.detail || {};
                });
            }

            if (dateByTitle && typeof dateByTitle === "object") {
                ordered.forEach(function (item) {
                    if (!item.data.dateIso) return;
                    var title = String(item.data.title || "").replace(/\s+/g, " ").trim();
                    if (title) dateByTitle[title] = item.data.dateIso;
                });
            }

            /* the date text on the card is always derived from dateIso */
            var grid = document.querySelector(section.containerSelector);
            if (grid) {
                Array.prototype.forEach.call(
                    grid.querySelectorAll(section.itemSelector),
                    function (card) {
                        var id = String(card.getAttribute("data-event-id"));
                        var item = ordered.filter(function (candidate) {
                            return String(candidate.data.eventId) === id;
                        })[0];
                        if (!item || !item.editedAt) return;

                        var iso = item.data.dateIso;
                        var span = card.querySelector(".event-card-meta span");
                        if (!span) return;

                        var text = formatDate(iso);
                        span.innerHTML = '<i class="fa-regular fa-calendar"></i>' + esc(text);
                    }
                );
            }

            if (typeof sortArchiveCardsByDate === "function") sortArchiveCardsByDate();

            /* re-read the cards so the modal shows the edited copy */
            if (typeof bindArchiveCards === "function") {
                Array.prototype.forEach.call(
                    document.querySelectorAll(".event-details-btn"),
                    function (button) {
                        if (!button.parentNode) return;
                        button.parentNode.replaceChild(button.cloneNode(true), button);
                    }
                );
                bindArchiveCards();
            }
        });
    }

    var HOOKS = {
        "events-upcoming": hookEventsUpcoming,
        "events-archive": function (section, items) { hookEventsArchive(section, items); },
        "team-advisory": hookTeam("advisory"),
        "team-directors": hookTeam("directors"),
        "team-operational": hookTeam("operational")
    };

    /* ------------------------------------------------------- driver */

    function applySection(section, items) {
        if (section.kind === "scalar") {
            applyScalar(section, items);
        } else {
            applyCollection(section, items);
        }

        var hook = HOOKS[section.key];
        if (hook) hook(section, items);
    }

    function apply(payload) {
        if (!payload || !Array.isArray(payload.sections)) return 0;

        var applied = 0;

        payload.sections.forEach(function (section) {
            try {
                applySection(section, section.items || []);
                applied += 1;
            } catch (err) {
                if (window.console && console.warn) {
                    console.warn("[content-sync] section '" + section.key + "' failed", err);
                }
            }
        });

        document.dispatchEvent(
            new CustomEvent("bcrls:content-synced", {
                detail: { path: payload.path, sections: applied }
            })
        );

        return applied;
    }

    function boot() {
        var path = window.location.pathname || "/";

        fetch(API + "?path=" + encodeURIComponent(path), {
            credentials: "same-origin",
            headers: { Accept: "application/json" }
        })
            .then(function (response) {
                if (!response.ok) throw new Error("HTTP " + response.status);
                return response.json();
            })
            .then(apply)
            .catch(function () {
                /* no API (static hosting) - the page stays exactly as shipped */
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }
})();
