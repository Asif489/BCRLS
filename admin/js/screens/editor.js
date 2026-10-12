/*
  Field-driven item editor.

  The form is built from the section's `fields` spec:

    text      -> single line input        url     -> url input
    textarea  -> textarea                 date    -> date input (YYYY-MM-DD)
    number    -> integer input            list    -> add/remove rows
    object    -> grouped fieldset         image   -> upload + preview + picker
    mode/html -> small rich text editor built on contenteditable

  Server validation errors are shown next to the field they belong to, and
  leaving with unsaved changes asks for confirmation.
*/

import api, { UPLOAD_MAX_BYTES, UPLOAD_MIME_TYPES } from "../api.js";
import * as ui from "../ui.js";

const MISSING = Symbol("missing");

export async function renderEditor(container, { key, itemId }) {
  container.replaceChildren(ui.loadingNode());

  const payload = await api.getSection(key);
  const section = payload.section;
  const isCreate = !itemId;

  let existing = null;
  if (!isCreate) {
    /* item ids come back from postgres as strings */
    existing =
      (payload.items || []).find((item) => String(item.id) === String(itemId)) || null;
    if (!existing) throw new Error("That item no longer exists in this section.");
  }

  if (isCreate && section.kind !== "collection") {
    throw new Error("This section holds a single value - it can be edited, not created.");
  }

  const originalData = existing ? existing.data || {} : {};
  document.title =
    (isCreate ? "New item" : ui.itemTitle(existing, section.fields)) +
    " · " +
    section.title +
    " · BCRLS Admin";

  container.replaceChildren();

  /* ------------------------------------------------------------ head */

  const head = ui.make("header", "page-head");

  const crumbs = ui.make("nav", "crumbs");
  crumbs.setAttribute("aria-label", "Breadcrumb");
  const dash = ui.make("a", "", "Dashboard");
  dash.href = "#/";
  const sectionLink = ui.make("a", "", section.title);
  sectionLink.href = "#/s/" + encodeURIComponent(key);
  crumbs.appendChild(dash);
  crumbs.appendChild(ui.make("span", "", "/"));
  crumbs.appendChild(sectionLink);
  crumbs.appendChild(ui.make("span", "", "/"));
  crumbs.appendChild(ui.make("span", "", isCreate ? "New item" : "Edit"));
  head.appendChild(crumbs);

  head.appendChild(ui.make("h1", "", isCreate ? "New item" : "Edit item"));

  if (section.kind !== "collection") {
    const note = ui.make("p", "callout");
    note.textContent =
      "Single value section: editing the value below updates the site, " +
      "but items cannot be created or deleted.";
    head.appendChild(note);
  }

  if (existing) {
    head.appendChild(
      ui.make("p", "page-sub", "Slug: " + (existing.slug || "") + (existing.imported ? " · imported from the original page" : " · created in this panel"))
    );
  }

  container.appendChild(head);

  /* ------------------------------------------------------------ form */

  const form = ui.make("form", "item-form");
  form.noValidate = true;
  form.setAttribute("novalidate", "");

  const summary = ui.make("div", "form-error-summary");
  summary.setAttribute("role", "alert");
  summary.hidden = true;

  form.appendChild(summary);

  const controllers = [];
  const fields = section.fields || {};

  Object.keys(fields).forEach(function (name) {
    const controller = buildField({
      path: name,
      label: (fields[name] && fields[name].label) || humanise(name),
      spec: fields[name] || {},
      value: originalData[name],
      isCreate: isCreate,
    });
    controllers.push(controller);
    form.appendChild(controller.node);
  });

  if (!controllers.length) {
    form.appendChild(ui.emptyNode("This section has no editable fields."));
  }

  /* --------------------------------------------------------- actions */

  const actions = ui.make("div", "form-actions");

  const dirtyNote = ui.make("span", "dirty-note", "Unsaved changes");
  dirtyNote.hidden = true;

  const save = ui.make("button", "btn btn-primary", isCreate ? "Create item" : "Save changes");
  save.type = "submit";

  const cancel = ui.make("a", "btn btn-secondary", "Cancel");
  cancel.href = "#/s/" + encodeURIComponent(key);

  actions.appendChild(dirtyNote);
  actions.appendChild(cancel);
  actions.appendChild(save);
  form.appendChild(actions);
  container.appendChild(form);

  /* ------------------------------------------- dirty state + guard */

  let dirty = false;
  function markDirty() {
    if (dirty) return;
    dirty = true;
    dirtyNote.hidden = false;
    ui.setDirtyGuard(function () {
      return dirty;
    });
  }
  function clearDirty() {
    dirty = false;
    dirtyNote.hidden = true;
    ui.setDirtyGuard(null);
  }

  form.addEventListener("input", markDirty);
  form.addEventListener("change", markDirty);

  /* ------------------------------------------------------- validation */

  function clearErrors() {
    summary.hidden = true;
    summary.textContent = "";
    controllers.forEach((controller) => controller.clearError());
  }

  function showFieldError(path, message) {
    const controller = controllers.find((candidate) => candidate.path === path);
    if (!controller) return false;
    controller.showError(message);
    return true;
  }

  function showErrors(err) {
    let shown = 0;

    const targets = [];
    controllers.forEach(function (controller) {
      targets.push(controller);
      (controller.children || []).forEach(function (child) {
        targets.push(child);
      });
    });

    targets.forEach(function (controller) {
      const message = fieldMessageFor(err, controller.path);
      if (message) {
        controller.showError(message);
        shown += 1;
      }
    });

    /* 409 duplicate match_by: the server names the offending field. */
    if (err.status === 409 && Array.isArray(err.details)) {
      err.details.forEach(function (detail) {
        if (detail && detail.field && showFieldError(detail.field, detail.message || err.message)) {
          shown += 1;
        }
      });
    }

    if (!shown) {
      summary.textContent = err.message || "Could not save this item.";
      summary.hidden = false;
    }

    const first = form.querySelector(".field-error:not([hidden])");
    if (first) {
      const field = first.closest(".field");
      if (field) {
        const control = field.querySelector("input, textarea, [contenteditable], button");
        if (control && control.focus) control.focus();
        field.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }

  /* ------------------------------------------------------------- save */

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearErrors();

    const data = {};
    let filled = 0;

    controllers.forEach(function (controller) {
      const value = controller.read();
      if (value === undefined) return;
      const changed = stable(value) !== stable(controller.original);

      if (isCreate) {
        if (isEmptyValue(value)) return;
        data[controller.path] = value;
        filled += 1;
      } else if (changed) {
        data[controller.path] = value;
        filled += 1;
      }
    });

    if (isCreate && !filled) {
      summary.textContent = "Fill in at least one field before creating the item.";
      summary.hidden = false;
      return;
    }

    if (!isCreate && !filled) {
      ui.toast("Nothing changed", "info");
      clearDirty();
      return;
    }

    save.disabled = true;
    const originalLabel = save.textContent;
    save.textContent = isCreate ? "Creating…" : "Saving…";

    try {
      if (isCreate) await api.createItem(key, data);
      else await api.updateItem(key, itemId, { data: data });

      clearDirty();
      ui.toast(isCreate ? "Item created" : "Changes saved", "success");
      location.hash = "#/s/" + encodeURIComponent(key);
    } catch (err) {
      save.disabled = false;
      save.textContent = originalLabel;
      showErrors(err);
      ui.toast(err.message || "Could not save", "error");
    } finally {
      save.disabled = false;
      save.textContent = originalLabel;
    }
  });
}

/* ------------------------------------------------------------ helpers */

/* Validation message for "title" or "detail.speakers" (zod paths are
   prefixed with "data."). */
function fieldMessageFor(err, path) {
  if (!err || !Array.isArray(err.details)) return null;
  const hit = err.details.find(function (detail) {
    if (!detail || typeof detail.path !== "string") return false;
    return detail.path === path || detail.path === "data." + path;
  });
  return hit ? hit.message : null;
}

/* Deep comparison that ignores object key order. */
function stable(value) {
  if (value === MISSING) return "__missing__";
  if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
  if (value && typeof value === "object") {
    return (
      "{" +
      Object.keys(value)
        .sort()
        .map(function (key) {
          return JSON.stringify(key) + ":" + stable(value[key]);
        })
        .join(",") +
      "}"
    );
  }
  return JSON.stringify(value === undefined ? null : value);
}

function humanise(name) {
  return String(name)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function isEmptyValue(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

function fieldId(path) {
  return "f-" + String(path).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function makeField(path, label, hint) {
  const id = fieldId(path);
  const wrap = ui.make("div", "field");
  wrap.dataset.field = path;

  const labelEl = ui.make("label", "field-label", label);
  labelEl.htmlFor = id;

  const errorEl = ui.make("p", "field-error");
  errorEl.id = id + "-error";
  errorEl.hidden = true;

  const hintEl = hint ? ui.make("p", "field-hint", hint) : null;
  if (hintEl) hintEl.id = id + "-hint";

  wrap.appendChild(labelEl);
  return { wrap: wrap, id: id, labelEl: labelEl, errorEl: errorEl, hintEl: hintEl };
}

function attachFeedback(parts, control) {
  if (parts.hintEl) parts.wrap.appendChild(parts.hintEl);
  parts.wrap.appendChild(parts.errorEl);
  if (control && control.setAttribute) {
    const describedBy = [parts.errorEl.id];
    if (parts.hintEl) describedBy.unshift(parts.hintEl.id);
    control.setAttribute("aria-describedby", describedBy.join(" "));
  }
}

function showFieldErrorOn(parts, message) {
  parts.errorEl.textContent = message;
  parts.errorEl.hidden = false;
  if (parts.wrap.classList) parts.wrap.classList.add("has-error");
  const control = parts.wrap.querySelector("input, textarea, [contenteditable]");
  if (control) control.setAttribute("aria-invalid", "true");
}

function clearFieldError(parts) {
  parts.errorEl.textContent = "";
  parts.errorEl.hidden = true;
  if (parts.wrap.classList) parts.wrap.classList.remove("has-error");
  const control = parts.wrap.querySelector("input, textarea, [contenteditable]");
  if (control) control.removeAttribute("aria-invalid");
}

/* Builds one control and returns the controller used by the form logic. */
function buildField({ path, label, spec, value, isCreate }) {
  const type = spec.type || "text";
  const isHtml = spec.mode === "html" || type === "html";

  if (isHtml) return richField({ path: path, label: label, spec: spec, value: value, isCreate: isCreate });
  if (type === "list") return listField({ path: path, label: label, spec: spec, value: value });
  if (type === "object") return objectField({ path, label, spec, value, isCreate });
  if (type === "image") return imageField({ path: path, label: label, spec: spec, value: value });

  /* scalar controls: text | textarea | url | date | number */
  const hints = {
    date: "Format: YYYY-MM-DD. Leave empty to clear the date.",
    number: "Whole number, 0 or more.",
    url: "Full address, for example https://example.org/page",
  };
  const parts = makeField(path, label, hints[type] || spec.hint || null);

  let control;
  if (type === "textarea") {
    control = document.createElement("textarea");
    control.rows = 6;
  } else {
    control = document.createElement("input");
    control.type =
      type === "date" ? "date" : type === "number" ? "number" : type === "url" ? "url" : "text";
    if (type === "number") {
      control.min = "0";
      control.step = "1";
      control.inputMode = "numeric";
    }
    if (type === "url") control.type = "url";
  }
  control.id = parts.id;
  control.name = path;
  control.className = "input";
  control.value = value === null || value === undefined ? "" : String(value);

  parts.wrap.appendChild(control);
  attachFeedback(parts, control);

  return {
    path: path,
    node: parts.wrap,
    original: value === undefined ? MISSING : value,
    read: function () {
      const raw = control.value;
      if (type === "number") {
        if (raw.trim() === "") return undefined;
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : raw;
      }
      if (type === "date") return raw === "" ? null : raw;
      return raw;
    },
    showError: function (message) {
      showFieldErrorOn(parts, message);
    },
    clearError: function () {
      clearFieldError(parts);
    },
  };
}

/* ------------------------------------------------------------- list */

function listField({ path, label, spec, value }) {
  const parts = makeField(path, label, "One value per row.");
  const list = ui.make("ul", "list-rows");
  list.id = parts.id;

  const rows = [];

  function addRow(rowValue) {
    const li = ui.make("li", "list-row");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "input";
    input.value = rowValue === null || rowValue === undefined ? "" : String(rowValue);
    input.setAttribute("aria-label", label + " row " + (rows.length + 1));

    const remove = ui.make("button", "btn btn-sm btn-ghost btn-icon", "\u00d7");
    remove.type = "button";
    remove.title = "Remove row";
    remove.setAttribute("aria-label", "Remove row " + (rows.length + 1));
    remove.addEventListener("click", function () {
      const index = rows.indexOf(entry);
      if (index > -1) rows.splice(index, 1);
      li.remove();
      renumber();
    });

    const entry = { input: input };
    rows.push(entry);
    li.appendChild(input);
    li.appendChild(remove);
    list.appendChild(li);
    renumber();
  }

  function renumber() {
    rows.forEach(function (entry, index) {
      entry.input.setAttribute("aria-label", label + " row " + (index + 1));
      const remove = entry.input.nextSibling;
      if (remove && remove.setAttribute) {
        remove.setAttribute("aria-label", "Remove row " + (index + 1));
      }
    });
    add.disabled = rows.length >= 60;
  }

  (Array.isArray(value) ? value : []).forEach(function (entry) {
    addRow(entry);
  });

  const add = ui.make("button", "btn btn-sm btn-secondary", "Add row");
  add.type = "button";
  add.addEventListener("click", function () {
    addRow("");
    const inputs = list.querySelectorAll("input");
    if (inputs.length) inputs[inputs.length - 1].focus();
  });

  parts.wrap.appendChild(list);
  parts.wrap.appendChild(add);
  attachFeedback(parts, null);

  return {
    path: path,
    node: parts.wrap,
    original: Array.isArray(value) ? value.slice() : MISSING,
    read: function () {
      const values = rows
        .map((entry) => entry.input.value.trim())
        .filter((entry) => entry !== "");
      return values;
    },
    showError: function (message) {
      showFieldErrorOn(parts, message);
    },
    clearError: function () {
      clearFieldError(parts);
    },
  };
}

/* ------------------------------------------------------------ object */

function objectField({ path, label, spec, value, isCreate }) {
  const wrap = ui.make("fieldset", "field field-group");
  wrap.dataset.field = path;
  const legend = ui.make("legend", "field-label", label);
  wrap.appendChild(legend);

  const errorEl = ui.make("p", "field-error");
  errorEl.id = fieldId(path) + "-error";
  errorEl.hidden = true;
  wrap.appendChild(errorEl);

  const children = [];
  const objectFields = spec.objectFields || {};

  Object.keys(objectFields).forEach(function (childName) {
    const childPath = path + "." + childName;
    const child = buildField({
      path: childPath,
      label: (objectFields[childName] && objectFields[childName].label) || humanise(childName),
      spec: objectFields[childName] || {},
      value: value && typeof value === "object" ? value[childName] : undefined,
      isCreate: isCreate,
    });
    children.push(child);
    wrap.appendChild(child.node);
  });

  const original = value && typeof value === "object" ? Object.assign({}, value) : MISSING;

  return {
    path: path,
    node: wrap,
    original: original,
    children: children,
    read: function () {
      const result = {};
      let any = false;
      children.forEach(function (child) {
        const childValue = child.read();
        if (childValue === undefined) return;
        /* rebuild the nested shape: "detail.speakers" -> detail: { speakers } */
        const keys = child.path.slice(path.length + 1).split(".");
        let target = result;
        while (keys.length > 1) {
          const head = keys.shift();
          if (!target[head] || typeof target[head] !== "object") target[head] = {};
          target = target[head];
        }
        target[keys.shift()] = childValue;
        any = true;
      });
      if (!any) return undefined;
      return result;
    },
    showError: function (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      wrap.classList.add("has-error");
    },
    clearError: function () {
      errorEl.textContent = "";
      errorEl.hidden = true;
      wrap.classList.remove("has-error");
      children.forEach((child) => child.clearError());
    },
  };
}

/* ------------------------------------------------------------- image */

function imageField({ path, label, spec, value }) {
  const parts = makeField(
    path,
    label,
    "JPEG, PNG, WebP, GIF, SVG or AVIF \u00b7 maximum 5 MB."
  );

  const preview = document.createElement("img");
  preview.className = "image-preview";
  preview.alt = "Preview of " + label;
  preview.hidden = true;

  const input = document.createElement("input");
  input.type = "url";
  input.id = parts.id;
  input.name = path;
  input.className = "input";
  input.placeholder = "https://… or /uploads/…";
  input.value = value === null || value === undefined ? "" : String(value);

  const controls = ui.make("div", "image-actions");

  const uploadLabel = ui.make("label", "btn btn-sm btn-secondary");
  const uploadText = ui.make("span", "", "Upload image");
  const file = document.createElement("input");
  file.type = "file";
  file.id = parts.id + "-file";
  file.accept = UPLOAD_MIME_TYPES.join(",");
  file.className = "sr-only";
  uploadLabel.appendChild(uploadText);
  uploadLabel.appendChild(file);

  const pick = ui.make("button", "btn btn-sm btn-secondary", "Choose previous");
  pick.type = "button";

  const clear = ui.make("button", "btn btn-sm btn-ghost", "Clear");
  clear.type = "button";

  controls.appendChild(uploadLabel);
  controls.appendChild(pick);
  controls.appendChild(clear);

  parts.wrap.appendChild(preview);
  parts.wrap.appendChild(input);
  parts.wrap.appendChild(controls);
  attachFeedback(parts, input);

  function updatePreview() {
    const url = input.value.trim();
    if (!url) {
      preview.hidden = true;
      preview.removeAttribute("src");
      return;
    }
    preview.hidden = false;
    preview.src = url;
  }

  preview.addEventListener("error", function () {
    preview.hidden = true;
  });
  input.addEventListener("input", updatePreview);
  updatePreview();

  clear.addEventListener("click", function () {
    input.value = "";
    updatePreview();
    input.focus();
  });

  file.addEventListener("change", async function () {
    const chosen = file.files && file.files[0];
    file.value = "";
    if (!chosen) return;

    clearFieldError(parts);

    if (UPLOAD_MIME_TYPES.indexOf(chosen.type) === -1) {
      showFieldErrorOn(parts, "Unsupported file type '" + (chosen.type || "unknown") + "'.");
      return;
    }
    if (chosen.size > UPLOAD_MAX_BYTES) {
      showFieldErrorOn(
        parts,
        "File is " + (chosen.size / 1024 / 1024).toFixed(1) + " MB - the maximum is 5 MB."
      );
      return;
    }

    const labelBefore = uploadText.textContent;
    uploadText.textContent = "Uploading\u2026";
    try {
      const result = await api.upload(chosen);
      const uploaded = result.upload;
      input.value = uploaded.url;
      ui.rememberUpload(uploaded);
      updatePreview();
      ui.toast("Image uploaded", "success");
    } catch (err) {
      showFieldErrorOn(parts, err.message || "Upload failed.");
    } finally {
      uploadText.textContent = labelBefore;
    }
  });

  pick.addEventListener("click", function () {
    const history = ui.getUploadHistory();
    if (!history.length) {
      ui.openModal({
        title: "Previous uploads",
        body:
          "No images have been uploaded from this browser yet. " +
          "Use \u201cUpload image\u201d to add one - it will be remembered here for later reuse.",
        actions: [{ label: "Close", variant: "secondary", value: false }],
      });
      return;
    }

    const grid = ui.make("div", "upload-grid");
    history.forEach(function (entry) {
      const button = ui.make("button", "upload-option");
      button.type = "button";
      const img = document.createElement("img");
      img.src = entry.url;
      img.alt = "";
      img.loading = "lazy";
      const caption = ui.make("span", "upload-name", entry.filename || entry.url);
      button.appendChild(img);
      button.appendChild(caption);
      button.addEventListener("click", function () {
        input.value = entry.url;
        updatePreview();
        modal.close(true);
        input.focus();
      });
      grid.appendChild(button);
    });

    const modal = ui.openModal({
      title: "Choose a previous upload",
      body: grid,
      actions: [{ label: "Cancel", variant: "secondary", value: false }],
    });
  });

  return {
    path: path,
    node: parts.wrap,
    original: value === undefined ? MISSING : value,
    read: function () {
      return input.value.trim();
    },
    showError: function (message) {
      showFieldErrorOn(parts, message);
    },
    clearError: function () {
      clearFieldError(parts);
    },
  };
}

/* ------------------------------------------------------------- rich */

function richField({ path, label, spec, value, isCreate }) {
  const parts = makeField(
    path,
    label,
    spec.mode === "html" ? "Bold, italic, links, paragraphs and lists only." : null
  );

  const box = ui.make("div", "rich");
  const toolbar = ui.make("div", "rich-toolbar");
  toolbar.setAttribute("role", "toolbar");
  toolbar.setAttribute("aria-label", "Formatting for " + label);

  const editor = document.createElement("div");
  editor.id = parts.id;
  editor.className = "rich-editor";
  editor.contentEditable = "true";
  editor.setAttribute("role", "textbox");
  editor.setAttribute("aria-multiline", "true");
  editor.setAttribute("aria-label", label);

  box.appendChild(toolbar);
  box.appendChild(editor);
  parts.wrap.appendChild(box);
  attachFeedback(parts, editor);

  function command(name, value) {
    editor.focus();
    try {
      document.execCommand(name, false, value === undefined ? null : value);
    } catch (err) {
      ui.toast("That formatting is not available in this browser.", "warn");
    }
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }

  const buttons = [
    { label: "B", title: "Bold", aria: "Bold", run: () => command("bold"), style: "font-weight:700" },
    { label: "I", title: "Italic", aria: "Italic", run: () => command("italic"), style: "font-style:italic" },
    { label: "P", title: "Paragraph", aria: "Paragraph", run: () => command("formatBlock", "<p>") },
    { label: "\u2022\u2022\u2022", title: "Bulleted list", aria: "Bulleted list", run: () => command("insertUnorderedList") },
    { label: "Link", title: "Add or edit link", aria: "Add link", run: linkAction },
    { label: "Unlink", title: "Remove link", aria: "Remove link", run: () => command("unlink") },
  ];

  function linkAction() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      ui.toast("Select the text you want to turn into a link first.", "warn");
      return;
    }

    const current = safeAnchorHref(selection);
    const body = ui.make("div", "field");
    const labelEl = ui.make("label", "field-label", "Link address");
    const url = document.createElement("input");
    url.type = "url";
    url.className = "input";
    url.placeholder = "https://example.org/page";
    url.value = current || "";
    const hint = ui.make("p", "field-hint", "http(s), mailto or tel addresses.");
    const error = ui.make("p", "field-error");
    error.hidden = true;
    labelEl.htmlFor = "linkUrlInput";
    url.id = "linkUrlInput";
    body.appendChild(labelEl);
    body.appendChild(url);
    body.appendChild(hint);
    body.appendChild(error);

    const modal = ui.openModal({
      title: "Insert link",
      body: body,
      actions: [
        { label: "Cancel", variant: "secondary", value: false },
        { label: "Apply", variant: "primary", value: true },
      ],
    });

    modal.promise.then(function (confirmed) {
      if (!confirmed) return;
      const address = url.value.trim();
      if (!isSafeUrl(address)) {
        error.textContent = "Enter a normal web, mail or telephone address.";
        error.hidden = false;
        return;
      }
      command("createLink", address);
      ui.toast("Link applied", "success");
    });
  }

  buttons.forEach(function (definition) {
    const button = ui.make("button", "rich-btn", definition.label);
    button.type = "button";
    button.title = definition.title;
    button.setAttribute("aria-label", definition.aria);
    if (definition.style) button.style.cssText = definition.style;
    /* keep the caret inside the editor while a toolbar button is pressed */
    button.addEventListener("mousedown", function (event) {
      event.preventDefault();
    });
    button.addEventListener("click", definition.run);
    toolbar.appendChild(button);
  });

  /* the value is markup by definition, so it goes through the same
     allow-list as the server before it is written into the editor */
  const initial = ui.sanitizeMarkup(value === null || value === undefined ? "" : String(value));
  editor.innerHTML = initial;

  return {
    path: path,
    node: parts.wrap,
    original: isCreate ? MISSING : initial,
    read: function () {
      const html = ui.sanitizeMarkup(editor.innerHTML);
      return html === "<br>" ? "" : html;
    },
    showError: function (message) {
      showFieldErrorOn(parts, message);
    },
    clearError: function () {
      clearFieldError(parts);
    },
  };
}

function safeAnchorHref(selection) {
  let node = selection.anchorNode;
  while (node && node !== document.body) {
    if (node.nodeType === 1 && node.tagName === "A") return node.getAttribute("href") || "";
    node = node.parentNode;
  }
  return "";
}

function isSafeUrl(value) {
  if (!value) return false;
  if (/^\s*(javascript|vbscript|data|file|blob):/i.test(value)) return false;
  return /^(https?:\/\/|mailto:|tel:|\/|#|\.\/|\.\.\/)/i.test(value) || !/^[a-z][a-z0-9+.-]*:/i.test(value);
}
