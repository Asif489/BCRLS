/*
  Router + dashboard shell.

  Hash routes
    #/                        dashboard
    #/s/<key>                 section screen
    #/s/<key>/new             editor - new item
    #/s/<key>/item/<id>       editor - existing item
    #/submissions             form submissions
    #/submissions/<id>        one submission
    #/account                 account / change password

  The sidebar mirrors the site navigation: sections returned by
  GET /api/admin/content/ are grouped by the page they belong to.
*/

import api, { getToken, getUser, clearSession } from "./api.js";
import * as ui from "./ui.js";
import { mountLogin } from "./screens/login.js";
import { renderDashboard } from "./screens/dashboard.js";
import { renderSection } from "./screens/section.js";
import { renderEditor } from "./screens/editor.js";
import { renderSubmissions } from "./screens/submissions.js";
import { renderIssues } from "./screens/issues.js";
import { renderAccount } from "./screens/account.js";
import { GROUP_ORDER, groupSections } from "./nav-groups.js";

const views = {
  login: document.getElementById("loginView"),
  app: document.getElementById("appView"),
  main: document.getElementById("mainContent"),
  notice: document.getElementById("loginNotice"),
  navList: document.getElementById("navList"),
  topbarName: document.getElementById("topbarName"),
  submissionCount: document.getElementById("navSubmissionCount"),
};

let sections = [];
let currentHash = "";
let firstRender = true;

/* ------------------------------------------------------------- login */

const login = mountLogin({
  root: views.login,
  onSignedIn: function (session) {
    ui.setDirtyGuard(null);
    startSession(session);
  },
});

function showLogin(notice) {
  views.app.hidden = true;
  views.login.hidden = false;
  ui.setDirtyGuard(null);

  if (notice) {
    views.notice.textContent = notice;
    views.notice.hidden = false;
  } else {
    views.notice.hidden = true;
    views.notice.textContent = "";
  }

  login.focusFirstField();
  document.title = "Sign in · BCRLS Admin";
}

function startSession(session) {
  views.login.hidden = true;
  views.app.hidden = false;
  views.notice.hidden = true;
  views.topbarName.textContent =
    (session && (session.name || session.email)) || "";

  boot();
}

/* -------------------------------------------------------------- boot */

async function boot() {
  const loading = ui.make("li", "nav-muted", "Loading sections…");
  views.navList.replaceChildren(loading);

  try {
    const result = await api.listSections();
    sections = (result && result.sections) || [];
  } catch (err) {
    if (err && err.status === 401) return; /* session-expired handler takes over */
    views.navList.replaceChildren();
    const li = ui.make("li", "nav-muted");
    li.textContent = "Could not load sections: " + err.message;
    views.navList.appendChild(li);
    ui.toast(err.message, "error");
    return;
  }

  renderSidebar();
  refreshSubmissionCount();

  if (!location.hash) history.replaceState(null, "", "#/");
  currentHash = location.hash;
  await renderRoute();
}

function refreshSubmissionCount() {
  api
    .listSubmissions({ status: "new", limit: 1 })
    .then(function (payload) {
      const counts = (payload && payload.counts) || [];
      const total = counts.reduce(function (sum, row) {
        return sum + (row.status === "new" ? Number(row.total) : 0);
      }, 0);
      views.submissionCount.textContent = String(total);
      views.submissionCount.hidden = total === 0;
    })
    .catch(function () {
      /* the badge is decoration - never block the shell on it */
    });
}

window.addEventListener("admin:count-changed", refreshSubmissionCount);

/* ----------------------------------------------------------- sidebar */

function renderSidebar() {
  const grouped = groupSections(sections);

  const orderedLabels = GROUP_ORDER.filter((label) => grouped.has(label));

  const fragment = document.createDocumentFragment();

  const home = ui.make("li", "");
  const homeLink = ui.make("a", "nav-link", "Dashboard");
  homeLink.href = "#/";
  home.appendChild(homeLink);
  fragment.appendChild(home);

  orderedLabels.forEach(function (label, index) {
    const group = ui.make("li", "nav-group");
    const id = "navGroup" + index;

    const button = ui.make("button", "nav-group-btn");
    button.type = "button";
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("aria-controls", id);
    const name = ui.make("span", "nav-group-label", label);
    const count = ui.make("span", "nav-group-count", String(grouped.get(label).length));
    button.appendChild(name);
    button.appendChild(count);

    const sub = ui.make("ul", "nav-sub");
    sub.id = id;

    grouped.get(label).forEach(function (section) {
      const item = ui.make("li", "");
      const link = ui.make("a", "nav-link");
      link.href = "#/s/" + encodeURIComponent(section.key);
      link.dataset.sectionKey = section.key;
      link.appendChild(ui.make("span", "nav-link-label", section.title));

      const badge = ui.make(
        "span",
        "nav-count" + (section.hiddenCount ? " nav-count-hidden" : ""),
        String(section.itemCount)
      );
      badge.title =
        section.itemCount +
        " item" + (section.itemCount === 1 ? "" : "s") +
        (section.hiddenCount ? " · " + section.hiddenCount + " hidden" : "");
      link.appendChild(badge);

      item.appendChild(link);
      sub.appendChild(item);
    });

    button.addEventListener("click", function () {
      const open = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", open ? "false" : "true");
      sub.hidden = open;
    });

    group.appendChild(button);
    group.appendChild(sub);
    fragment.appendChild(group);
  });

  views.navList.replaceChildren(fragment);
  markActiveLink();
}

function markActiveLink() {
  const hash = location.hash || "#/";
  document.querySelectorAll("#sidebar a.nav-link").forEach(function (link) {
    const target = link.getAttribute("href");
    const active =
      target === hash ||
      (target !== "#/" && hash.startsWith(target)) ||
      (target === "#/submissions" && hash.startsWith("#/submissions")) ||
      (target === "#/account" && hash.startsWith("#/account"));
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

/* ------------------------------------------------------- mobile nav */

const navToggle = document.getElementById("navToggle");
const navScrim = document.getElementById("navScrim");

function setMobileNav(open) {
  document.body.classList.toggle("nav-open", open);
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  navScrim.hidden = !open;
}

navToggle.addEventListener("click", function () {
  setMobileNav(!document.body.classList.contains("nav-open"));
});
navScrim.addEventListener("click", function () {
  setMobileNav(false);
});

document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") return;
  if (!document.body.classList.contains("nav-open")) return;
  setMobileNav(false);
  navToggle.focus();
});

/* ------------------------------------------------------------ router */

window.addEventListener("hashchange", function () {
  if (ui.isDirty()) {
    const leave = window.confirm(
      "You have unsaved changes. Leave this page and discard them?"
    );
    if (!leave) {
      history.replaceState(null, "", currentHash || "#/");
      return;
    }
  }
  currentHash = location.hash;
  renderRoute();
});

async function renderRoute() {
  ui.setDirtyGuard(null);
  setMobileNav(false);
  markActiveLink();

  const hash = (location.hash || "#/").replace(/^#/, "");
  const parts = hash.split("/").filter(Boolean);
  const main = views.main;

  main.replaceChildren(ui.loadingNode());

  try {
    if (parts.length === 0) {
      document.title = "Dashboard · BCRLS Admin";
      await renderDashboard(main, { sections: sections });
    } else if (parts[0] === "s" && parts[1] && !parts[2]) {
      await renderSection(main, { key: decodeURIComponent(parts[1]) });
    } else if (parts[0] === "s" && parts[1] && parts[2] === "new") {
      await renderEditor(main, { key: decodeURIComponent(parts[1]), itemId: null });
    } else if (parts[0] === "s" && parts[1] && parts[2] === "item" && parts[3]) {
      await renderEditor(main, {
        key: decodeURIComponent(parts[1]),
        itemId: Number(parts[3]),
      });
    } else if (parts[0] === "submissions" && parts[1]) {
      await renderSubmissions(main, { id: Number(parts[1]) });
    } else if (parts[0] === "submissions") {
      await renderSubmissions(main, { id: null });
    } else if (parts[0] === "issues" && parts[1] === "new") {
      await renderIssues(main, { mode: "new" });
    } else if (parts[0] === "issues" && parts[1] === "item" && parts[2]) {
      await renderIssues(main, { mode: "edit", id: Number(parts[2]) });
    } else if (parts[0] === "issues") {
      await renderIssues(main, { mode: "list" });
    } else if (parts[0] === "account") {
      document.title = "Account · BCRLS Admin";
      await renderAccount(main);
    } else {
      document.title = "Not found · BCRLS Admin";
      main.replaceChildren(
        ui.emptyNode("This page does not exist.", "Pick a section from the sidebar.")
      );
    }
  } catch (err) {
    if (err && err.status === 401) return;
    main.replaceChildren(ui.errorNode(err.message || "Something went wrong."));
    ui.toast(err.message || "Something went wrong.", "error");
  }

  if (!firstRender) {
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  firstRender = false;
}

/* ------------------------------------------------------ global events */

window.addEventListener("admin:session-expired", function (event) {
  const message = (event.detail && event.detail.message) || "Session expired";
  showLogin("Your session has expired. Please sign in again. (" + message + ")");
  ui.toast("Session expired - please sign in again.", "warn");
});

document.querySelectorAll('[data-action="logout"]').forEach(function (button) {
  button.addEventListener("click", function () {
    if (ui.isDirty() && !window.confirm("You have unsaved changes. Log out anyway?")) return;
    clearSession();
    showLogin("You have been signed out.");
  });
});

window.addEventListener("beforeunload", function (event) {
  if (!ui.isDirty()) return;
  event.preventDefault();
  event.returnValue = "";
});

/* --------------------------------------------------------------- boot */

if (getToken()) {
  const user = getUser() || {};
  startSession(user);
} else {
  showLogin(null);
}
