/*
  Shared UI helpers: escaping, toasts, modals, loading/empty states and the
  small HTML allow-list used by the rich text editor.

  Rule of the panel: every value that came from the API is written with
  textContent, or escaped with esc() before it goes near innerHTML.
*/

/* ------------------------------------------------------------ escaping */

export function esc(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function str(value) {
  return value === null || value === undefined ? "" : String(value);
}

export function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = str(text);
  return node;
}

/* -------------------------------------------------------------- toasts */

/* --------------------------------------------- unsaved-changes guard */

let dirtyGuard = null;

/* A screen registers () => true while its form still has unsaved changes. */
export function setDirtyGuard(fn) {
  dirtyGuard = typeof fn === "function" ? fn : null;
}

export function isDirty() {
  return Boolean(dirtyGuard && dirtyGuard());
}

/* -------------------------------------------------------------- toasts */

export function toast(message, type) {
  const region = document.getElementById("toastRegion");
  if (!region) return;

  const node = make("div", "toast toast-" + (type || "info"));
  node.textContent = str(message);

  const close = make("button", "toast-close", "\u00d7");
  close.type = "button";
  close.setAttribute("aria-label", "Dismiss notification");
  close.addEventListener("click", function () {
    remove();
  });
  node.appendChild(close);

  region.appendChild(node);

  let timer = window.setTimeout(remove, 5000);
  function remove() {
    window.clearTimeout(timer);
    if (node.parentNode) node.parentNode.removeChild(node);
  }
}

/* -------------------------------------------------------------- modals */

let openModals = 0;

/*
  openModal({ title, body, actions }) -> { close, node }
  body    DOM node or plain string (rendered as text)
  actions [{ label, variant, value }] -> resolves the modal with `value`
*/
export function openModal(options) {
  const root = document.getElementById("modalRoot");
  const previousFocus = document.activeElement;

  const backdrop = make("div", "modal-backdrop");
  const dialog = make("div", "modal");
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "modalTitle" + ++openModals);

  const head = make("div", "modal-head");
  const title = make("h2", "modal-title", options.title || "");
  title.id = dialog.getAttribute("aria-labelledby");
  const closeBtn = make("button", "icon-btn modal-close", "\u00d7");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close dialog");
  head.appendChild(title);
  head.appendChild(closeBtn);

  const body = make("div", "modal-body");
  if (options.body instanceof Node) body.appendChild(options.body);
  else if (options.body) body.appendChild(make("p", "", options.body));

  const foot = make("div", "modal-foot");
  const resolve = (value) => finish(value);
  (options.actions || [{ label: "Close", variant: "secondary", value: false }]).forEach(
    function (action) {
      const button = make(
        "button",
        "btn " + (action.variant === "primary" ? "btn-primary" : action.variant === "danger" ? "btn-danger" : "btn-secondary"),
        action.label
      );
      button.type = "button";
      button.addEventListener("click", function () {
        resolve(action.value);
      });
      foot.appendChild(button);
    }
  );

  dialog.appendChild(head);
  dialog.appendChild(body);
  if (foot.childNodes.length) dialog.appendChild(foot);
  backdrop.appendChild(dialog);
  root.appendChild(backdrop);

  let settled = false;
  let resolveFn = null;
  const promise = new Promise((res) => {
    resolveFn = res;
  });

  function finish(value) {
    if (settled) return;
    settled = true;
    document.removeEventListener("keydown", onKeydown, true);
    if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    if (previousFocus && previousFocus.focus) previousFocus.focus();
    resolveFn(value);
  }

  function onKeydown(event) {
    if (event.key === "Escape") {
      event.stopPropagation();
      finish(options.dismissValue === undefined ? false : options.dismissValue);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  backdrop.addEventListener("mousedown", function (event) {
    if (event.target === backdrop) finish(false);
  });
  closeBtn.addEventListener("click", function () {
    finish(false);
  });
  document.addEventListener("keydown", onKeydown, true);

  window.setTimeout(function () {
    const target = dialog.querySelector("input, textarea, select") || dialog.querySelector("button");
    if (target) target.focus();
  }, 0);

  return { close: finish, node: dialog, promise: promise };
}

/* Promise based confirmation dialog (used before every destructive action). */
export function confirmDialog(options) {
  const modal = openModal({
    title: options.title || "Are you sure?",
    body: options.message || "",
    actions: [
      { label: options.cancelLabel || "Cancel", variant: "secondary", value: false },
      { label: options.confirmLabel || "Confirm", variant: options.danger ? "danger" : "primary", value: true },
    ],
  });
  return modal.promise;
}

/* ---------------------------------------------------- loading / empty */

export function loadingNode(label) {
  const wrap = make("div", "state-block");
  const spinner = make("div", "spinner");
  spinner.setAttribute("aria-hidden", "true");
  wrap.appendChild(spinner);
  wrap.appendChild(make("p", "state-text", label || "Loading…"));
  return wrap;
}

export function emptyNode(message, hint) {
  const wrap = make("div", "state-block state-empty");
  wrap.appendChild(make("p", "state-text", message));
  if (hint) wrap.appendChild(make("p", "state-hint", hint));
  return wrap;
}

export function errorNode(message) {
  const wrap = make("div", "state-block state-error");
  wrap.setAttribute("role", "alert");
  wrap.appendChild(make("p", "state-text", message));
  return wrap;
}

/* -------------------------------------------------------- formatting */

export function formatDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusBadge(item) {
  const span = make("span", "badge ");
  if (!item.imported) {
    span.className += "badge-new";
    span.textContent = "New";
  } else if (item.editedAt) {
    span.className += "badge-edited";
    span.textContent = "Edited";
  } else {
    span.className += "badge-imported";
    span.textContent = "Imported";
  }
  return span;
}

/* The title shown in lists: the field the slug came from, else the first
   string value of the item. */
export function itemTitle(item, fields) {
  const data = item.data || {};
  const order = ["title", "name", "label", "heading", "value"];
  for (const key of order) {
    if (typeof data[key] === "string" && data[key].trim()) return data[key].trim();
  }
  for (const [name, spec] of Object.entries(fields || {})) {
    if (spec && spec.slugFrom && typeof data[name] === "string" && data[name].trim()) {
      return data[name].trim();
    }
  }
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim().slice(0, 80);
  }
  return item.slug || "Untitled";
}

/* -------------------------------------------------- upload history */

const UPLOADS_KEY = "bcrls.admin.uploads";

/* Previous uploads made from this browser (the API has no listing
   endpoint, so the panel remembers what it uploaded itself). */
export function getUploadHistory() {
  try {
    const raw = localStorage.getItem(UPLOADS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    return [];
  }
}

export function rememberUpload(upload) {
  try {
    const list = getUploadHistory().filter((entry) => entry.url !== upload.url);
    list.unshift({
      url: upload.url,
      filename: upload.filename || "",
      mimeType: upload.mimeType || "",
      at: new Date().toISOString(),
    });
    localStorage.setItem(UPLOADS_KEY, JSON.stringify(list.slice(0, 40)));
  } catch (err) {
    /* storage disabled - the picker simply stays empty */
  }
}

/* -------------------------------------------------- html sanitising */

const ALLOWED_TAGS = new Set([
  "b", "strong", "i", "em", "u", "s", "br", "p", "span", "a", "small", "sub", "sup",
]);
const ALLOWED_ATTRS = {
  a: new Set(["href", "title", "rel", "target", "class"]),
  span: new Set(["class"]),
  p: new Set(["class"]),
};
const SAFE_URL = /^\s*(javascript|vbscript|data|file|blob):/i;

function safeHref(value) {
  return !SAFE_URL.test(String(value || ""));
}

/*
  Same allow-list as server/src/lib/content-validation.js. HTML that enters
  the contenteditable goes through here before it is written back, so a
  paste can never smuggle a script or an event handler into the API payload.
*/
export function sanitizeMarkup(html) {
  if (!html) return "";
  const parsed = new DOMParser().parseFromString(String(html), "text/html");
  const fragment = document.createDocumentFragment();
  copyChildren(parsed.body, fragment, null);
  const holder = document.createElement("div");
  holder.appendChild(fragment);
  return holder.innerHTML.trim();
}

function copyChildren(source, target, parentTag) {
  Array.prototype.slice.call(source.childNodes).forEach(function (node) {
    if (node.nodeType === Node.TEXT_NODE) {
      target.appendChild(document.createTextNode(node.nodeValue));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName.toLowerCase();
    if (tag === "script" || tag === "style" || tag === "iframe" || tag === "object") return;

    if (!ALLOWED_TAGS.has(tag)) {
      /* drop the wrapper, keep its readable text */
      copyChildren(node, target, parentTag);
      return;
    }

    const clean = document.createElement(tag);
    const allowed = ALLOWED_ATTRS[tag];
    if (allowed) {
      Array.prototype.slice.call(node.attributes).forEach(function (attr) {
        const name = attr.name.toLowerCase();
        if (!allowed.has(name)) return;
        if ((name === "href" || name === "src") && !safeHref(attr.value)) return;
        clean.setAttribute(name, attr.value);
      });
      if (tag === "a" && clean.getAttribute("href")) {
        clean.setAttribute("rel", "noopener noreferrer");
      }
    }
    copyChildren(node, clean, tag);
    target.appendChild(clean);
  });
}
