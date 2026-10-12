/*
  Journal issues screen.

  #/issues                 list of issues (current first, then the archive)
  #/issues/new             create a new issue
  #/issues/item/<id>       edit an issue

  The lifecycle rule lives on the server: exactly one issue is the current
  issue.  Promoting an issue here demotes the previous one to the archive
  (it is never deleted), so adding a new current issue automatically moves
  the old one into the archive.
*/

import api, { UPLOAD_MAX_BYTES, UPLOAD_MIME_TYPES } from "../api.js";
import * as ui from "../ui.js";

const SCRIPT_URL = /^\s*(javascript|vbscript|data|file|blob):/i;

const STATUS_CURRENT = "Current issue";
const STATUS_ARCHIVE = "Archive";

export async function renderIssues(container, options) {
  const opts = options || {};
  if (opts.mode === "new" || opts.mode === "edit") {
    return renderEditor(container, opts);
  }
  return renderList(container);
}

/* -------------------------------------------------- shared helpers */

function issueLabel(issue) {
  const parts = [];
  if (issue.volume) parts.push(issue.volume);
  if (issue.issueNumber) parts.push(issue.issueNumber);
  return parts.join(" · ");
}

function issueTitle(issue) {
  return issueLabel(issue) || issue.title || (issue.year ? String(issue.year) : "Untitled issue");
}

function humanYear(value) {
  return value ? String(value) : "—";
}

/* --------------------------------------------------------------- list */

async function renderList(container) {
  container.replaceChildren(ui.loadingNode());
  document.title = "Journal issues · BCRLS Admin";

  let payload;
  try {
    payload = await api.listIssues();
  } catch (err) {
    container.replaceChildren(
      ui.errorNode(err.message || "Could not load journal issues.")
    );
    return;
  }

  const issues = (payload && payload.issues) || [];

  container.replaceChildren();

  const head = ui.make("header", "page-head");
  const crumbs = ui.make("nav", "crumbs");
  crumbs.setAttribute("aria-label", "Breadcrumb");
  const dash = ui.make("a", "", "Dashboard");
  dash.href = "#/";
  crumbs.appendChild(dash);
  crumbs.appendChild(ui.make("span", "", "/"));
  crumbs.appendChild(ui.make("span", "", "Journal issues"));
  head.appendChild(crumbs);

  const titleRow = ui.make("div", "page-head-row");
  titleRow.appendChild(ui.make("h1", "", "Journal issues"));
  const newBtn = ui.make("a", "btn btn-primary", "New issue");
  newBtn.href = "#/issues/new";
  titleRow.appendChild(newBtn);
  head.appendChild(titleRow);
  head.appendChild(
    ui.make(
      "p",
      "page-sub",
      "Exactly one issue is the current issue. Creating or promoting an issue " +
        "moves the previous current issue to the archive - nothing is deleted."
    )
  );
  container.appendChild(head);

  if (!issues.length) {
    container.appendChild(
      ui.emptyNode(
        "No journal issues yet.",
        "Create the first issue to feature it on the journal page."
      )
    );
    return;
  }

  const current = issues.find((issue) => issue.isCurrent) || null;
  if (current) {
    const banner = ui.make("p", "callout");
    banner.textContent = "Current issue: " + issueTitle(current) + ".";
    container.appendChild(banner);
  }

  const table = ui.make("table", "item-table");
  table.appendChild(ui.make("caption", "sr-only", "Journal issues"));

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Issue", "Year", "Published", "Status", "Actions"].forEach(function (label) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = label;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  issues.forEach(function (issue) {
    const tr = document.createElement("tr");
    if (issue.isCurrent) tr.classList.add("is-current");

    const issueCell = ui.make("td", "cell-item");
    issueCell.dataset.label = "Issue";
    issueCell.appendChild(ui.make("span", "", issueTitle(issue)));
    if (issue.title && issueLabel(issue)) {
      issueCell.appendChild(ui.make("span", "cell-sub", issue.title));
    }

    const year = ui.make("td", "", humanYear(issue.year));
    year.dataset.label = "Year";

    const published = ui.make("td", "", issue.publishedAt || "—");
    published.dataset.label = "Published";

    const status = ui.make("td", "cell-status");
    status.dataset.label = "Status";
    status.appendChild(
      ui.make(
        "span",
        "status " + (issue.isCurrent ? "status-current" : "status-archived"),
        issue.isCurrent ? STATUS_CURRENT : STATUS_ARCHIVE
      )
    );

    const actions = ui.make("td", "cell-actions");
    actions.dataset.label = "Actions";

    const edit = ui.make("a", "btn btn-sm btn-secondary", "Edit");
    edit.href = "#/issues/item/" + issue.id;
    actions.appendChild(edit);

    if (!issue.isCurrent) {
      const makeCurrent = ui.make("button", "btn btn-sm btn-secondary", "Set current");
      makeCurrent.type = "button";
      makeCurrent.addEventListener("click", function () {
        actSetCurrent(issue, container);
      });
      actions.appendChild(makeCurrent);
    }

    const del = ui.make("button", "btn btn-sm btn-danger", "Delete");
    del.type = "button";
    del.addEventListener("click", function () {
      actDelete(issue, container);
    });
    actions.appendChild(del);

    tr.appendChild(issueCell);
    tr.appendChild(year);
    tr.appendChild(published);
    tr.appendChild(status);
    tr.appendChild(actions);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

async function actSetCurrent(issue, container) {
  const confirmed = await ui.confirmDialog({
    title: "Make this the current issue?",
    message:
      issueTitle(issue) +
      " will replace the current issue on the journal page. " +
      "The issue that is current now moves to the archive.",
    confirmLabel: "Set as current",
  });
  if (!confirmed) return;

  try {
    await api.setCurrentIssue(issue.id);
    ui.toast("Current issue updated", "success");
    await renderList(container);
  } catch (err) {
    ui.toast(err.message || "Could not update the current issue", "error");
  }
}

async function actDelete(issue, container) {
  const confirmed = await ui.confirmDialog({
    title: "Delete this issue?",
    message: issueTitle(issue) + " will be deleted permanently.",
    confirmLabel: "Delete",
    danger: true,
  });
  if (!confirmed) return;

  try {
    await api.deleteIssue(issue.id);
    ui.toast("Issue deleted", "success");
    await renderList(container);
  } catch (err) {
    ui.toast(err.message || "Could not delete the issue", "error");
  }
}

/* ------------------------------------------------------------- editor */

async function renderEditor(container, { mode, id }) {
  container.replaceChildren(ui.loadingNode());
  const isCreate = mode === "new";

  let existing = null;
  if (!isCreate) {
    const payload = await api.getIssue(id);
    existing = payload && payload.issue;
    if (!existing) throw new Error("That issue no longer exists.");
  }

  const values = existing || {
    volume: "",
    issueNumber: "",
    title: "",
    year: "",
    coverImage: "",
    description: "",
    pdfUrl: "",
    publishedAt: "",
    isCurrent: false,
  };

  document.title =
    (isCreate ? "New journal issue" : issueTitle(existing)) + " · BCRLS Admin";

  container.replaceChildren();

  /* head */
  const head = ui.make("header", "page-head");
  const crumbs = ui.make("nav", "crumbs");
  crumbs.setAttribute("aria-label", "Breadcrumb");
  const dash = ui.make("a", "", "Dashboard");
  dash.href = "#/";
  const issuesLink = ui.make("a", "", "Journal issues");
  issuesLink.href = "#/issues";
  crumbs.appendChild(dash);
  crumbs.appendChild(ui.make("span", "", "/"));
  crumbs.appendChild(issuesLink);
  crumbs.appendChild(ui.make("span", "", "/"));
  crumbs.appendChild(ui.make("span", "", isCreate ? "New issue" : "Edit"));
  head.appendChild(crumbs);
  head.appendChild(ui.make("h1", "", isCreate ? "New journal issue" : "Edit journal issue"));
  container.appendChild(head);

  /* form */
  const form = ui.make("form", "item-form");
  form.noValidate = true;
  form.setAttribute("novalidate", "");

  const summary = ui.make("div", "form-error-summary");
  summary.setAttribute("role", "alert");
  summary.hidden = true;
  form.appendChild(summary);

  const controllers = [];
  const controls = ui.make("div", "issue-form-grid");

  controllers.push(textField("volume", "Volume", values.volume, "e.g. Volume 1"));
  controllers.push(textField("issueNumber", "Issue number", values.issueNumber, "e.g. Issue 2"));
  controllers.push(textField("title", "Title", values.title, "Optional issue title"));
  controllers.push(numberField("year", "Year", values.year));
  controllers.push(dateField("publishedAt", "Published on", values.publishedAt));
  controllers.push(imageField("coverImage", "Cover image", values.coverImage));
  controllers.push(urlField("pdfUrl", "PDF URL", values.pdfUrl));
  controllers.push(checkboxField("isCurrent", "Make this the current issue", values.isCurrent));
  controllers.push(textareaField("description", "Description", values.description));

  controllers.forEach(function (controller) {
    controls.appendChild(controller.node);
  });
  form.appendChild(controls);

  /* actions */
  const actions = ui.make("div", "form-actions");
  const dirtyNote = ui.make("span", "dirty-note", "Unsaved changes");
  dirtyNote.hidden = true;

  const cancel = ui.make("a", "btn btn-secondary", "Cancel");
  cancel.href = "#/issues";

  const save = ui.make("button", "btn btn-primary", isCreate ? "Create issue" : "Save changes");
  save.type = "submit";

  actions.appendChild(dirtyNote);
  actions.appendChild(cancel);
  actions.appendChild(save);
  form.appendChild(actions);
  container.appendChild(form);

  /* dirty guard */
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

  /* validation */
  function clearErrors() {
    summary.hidden = true;
    summary.textContent = "";
    controllers.forEach((controller) => controller.clearError());
  }

  function showErrors(err) {
    let shown = 0;
    controllers.forEach(function (controller) {
      const message = fieldMessageFor(err, controller.path);
      if (message) {
        controller.showError(message);
        shown += 1;
      }
    });
    if (!shown) {
      summary.textContent = err.message || "Could not save this issue.";
      summary.hidden = false;
    }
    const first = form.querySelector(".field-error:not([hidden])");
    if (first && first.closest) {
      const field = first.closest(".field");
      const control = field && field.querySelector("input, textarea");
      if (control && control.focus) control.focus();
      if (field) field.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  /* save */
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearErrors();

    const data = {};
    controllers.forEach(function (controller) {
      data[controller.path] = controller.read();
    });

    if (isCreate && !data.volume && !data.issueNumber && !data.title && !data.year) {
      summary.textContent =
        "Fill in at least one of volume, issue number, title or year before creating the issue.";
      summary.hidden = false;
      return;
    }

    save.disabled = true;
    const original = save.textContent;
    save.textContent = isCreate ? "Creating…" : "Saving…";

    try {
      if (isCreate) {
        await api.createIssue(data);
        ui.toast("Issue created", "success");
      } else {
        await api.updateIssue(existing.id, data);
        ui.toast("Changes saved", "success");
      }
      clearDirty();
      location.hash = "#/issues";
    } catch (err) {
      save.disabled = false;
      save.textContent = original;
      showErrors(err);
      ui.toast(err.message || "Could not save the issue", "error");
    } finally {
      save.disabled = false;
      save.textContent = original;
    }
  });
}

function fieldMessageFor(err, path) {
  if (!err || !Array.isArray(err.details)) return null;
  const hit = err.details.find(function (detail) {
    if (!detail || typeof detail.path !== "string") return false;
    return detail.path === path || detail.path === "data." + path;
  });
  return hit ? hit.message : null;
}

/* ---------------------------------------------------- field builders */

function baseField(path, label, hint) {
  const wrap = ui.make("div", "field");
  wrap.dataset.field = path;

  const id = "issue-" + path;
  const labelEl = ui.make("label", "field-label", label);
  labelEl.htmlFor = id;

  const errorEl = ui.make("p", "field-error");
  errorEl.id = id + "-error";
  errorEl.hidden = true;

  let hintEl = null;
  if (hint) {
    hintEl = ui.make("p", "field-hint", hint);
    hintEl.id = id + "-hint";
  }

  wrap.appendChild(labelEl);
  return { wrap: wrap, id: id, labelEl: labelEl, errorEl: errorEl, hintEl: hintEl };
}

function attachFeedback(parts, control) {
  if (parts.hintEl) parts.wrap.appendChild(parts.hintEl);
  parts.wrap.appendChild(parts.errorEl);
  if (control && control.setAttribute) {
    const described = [parts.errorEl.id];
    if (parts.hintEl) described.unshift(parts.hintEl.id);
    control.setAttribute("aria-describedby", described.join(" "));
  }
}

function showError(parts, message) {
  parts.errorEl.textContent = message;
  parts.errorEl.hidden = false;
  parts.wrap.classList.add("has-error");
}

function clearError(parts) {
  parts.errorEl.textContent = "";
  parts.errorEl.hidden = true;
  parts.wrap.classList.remove("has-error");
}

function textField(path, label, value, hint) {
  const parts = baseField(path, label, hint || null);
  const input = document.createElement("input");
  input.type = "text";
  input.id = parts.id;
  input.name = path;
  input.className = "input";
  input.value = value == null ? "" : String(value);
  parts.wrap.appendChild(input);
  attachFeedback(parts, input);

  return {
    path: path,
    node: parts.wrap,
    read: function () {
      return input.value.trim();
    },
    showError: function (message) {
      showError(parts, message);
    },
    clearError: function () {
      clearError(parts);
    },
  };
}

function textareaField(path, label, value) {
  const parts = baseField(path, label, "Shown on the journal page under the current issue.");
  parts.wrap.classList.add("field-wide");
  const input = document.createElement("textarea");
  input.rows = 5;
  input.id = parts.id;
  input.name = path;
  input.className = "input";
  input.value = value == null ? "" : String(value);
  parts.wrap.appendChild(input);
  attachFeedback(parts, input);

  return {
    path: path,
    node: parts.wrap,
    read: function () {
      return input.value;
    },
    showError: function (message) {
      showError(parts, message);
    },
    clearError: function () {
      clearError(parts);
    },
  };
}

function numberField(path, label, value) {
  const parts = baseField(path, label, "Four-digit year, for example 2026.");
  const input = document.createElement("input");
  input.type = "number";
  input.min = "1800";
  input.max = "2200";
  input.step = "1";
  input.inputMode = "numeric";
  input.id = parts.id;
  input.name = path;
  input.className = "input";
  input.value = value == null || value === "" ? "" : String(value);
  parts.wrap.appendChild(input);
  attachFeedback(parts, input);

  return {
    path: path,
    node: parts.wrap,
    read: function () {
      const raw = input.value.trim();
      return raw === "" ? "" : Number(raw);
    },
    showError: function (message) {
      showError(parts, message);
    },
    clearError: function () {
      clearError(parts);
    },
  };
}

function dateField(path, label, value) {
  const parts = baseField(path, label, "Format: YYYY-MM-DD. Leave empty to clear.");
  const input = document.createElement("input");
  input.type = "date";
  input.id = parts.id;
  input.name = path;
  input.className = "input";
  input.value = value == null ? "" : String(value);
  parts.wrap.appendChild(input);
  attachFeedback(parts, input);

  return {
    path: path,
    node: parts.wrap,
    read: function () {
      return input.value === "" ? "" : input.value;
    },
    showError: function (message) {
      showError(parts, message);
    },
    clearError: function () {
      clearError(parts);
    },
  };
}

function urlField(path, label, value) {
  const parts = baseField(path, label, "Full address, for example https://…/issue.pdf");
  const input = document.createElement("input");
  input.type = "url";
  input.id = parts.id;
  input.name = path;
  input.className = "input";
  input.placeholder = "https://…";
  input.value = value == null ? "" : String(value);
  parts.wrap.appendChild(input);
  attachFeedback(parts, input);

  return {
    path: path,
    node: parts.wrap,
    read: function () {
      return input.value.trim();
    },
    showError: function (message) {
      showError(parts, message);
    },
    clearError: function () {
      clearError(parts);
    },
  };
}

function checkboxField(path, label, value) {
  const wrap = ui.make("div", "field field-checkbox");
  wrap.dataset.field = path;
  const id = "issue-" + path;

  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = id;
  input.name = path;
  input.checked = value === true;

  const labelEl = ui.make("label", "field-label", label);
  labelEl.htmlFor = id;

  const errorEl = ui.make("p", "field-error");
  errorEl.hidden = true;

  wrap.appendChild(input);
  wrap.appendChild(labelEl);
  wrap.appendChild(errorEl);

  return {
    path: path,
    node: wrap,
    read: function () {
      return input.checked;
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
    },
  };
}

function imageField(path, label, value) {
  const parts = baseField(path, label, "JPEG, PNG, WebP, GIF, SVG or AVIF · maximum 5 MB.");
  parts.wrap.classList.add("field-wide");

  const preview = document.createElement("img");
  preview.className = "image-preview";
  preview.alt = "Cover preview";
  preview.hidden = true;

  const input = document.createElement("input");
  input.type = "url";
  input.id = parts.id;
  input.name = path;
  input.className = "input";
  input.placeholder = "https://… or /uploads/…";
  input.value = value == null ? "" : String(value);

  const controls = ui.make("div", "image-actions");

  const uploadLabel = ui.make("label", "btn btn-sm btn-secondary");
  const uploadText = ui.make("span", "", "Upload image");
  const file = document.createElement("input");
  file.type = "file";
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
    if (!url || SCRIPT_URL.test(url)) {
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
    clearError(parts);

    if (UPLOAD_MIME_TYPES.indexOf(chosen.type) === -1) {
      showError(parts, "Unsupported file type '" + (chosen.type || "unknown") + "'.");
      return;
    }
    if (chosen.size > UPLOAD_MAX_BYTES) {
      showError(
        parts,
        "File is " + (chosen.size / 1024 / 1024).toFixed(1) + " MB - the maximum is 5 MB."
      );
      return;
    }

    const before = uploadText.textContent;
    uploadText.textContent = "Uploading…";
    try {
      const result = await api.upload(chosen);
      input.value = result.upload.url;
      ui.rememberUpload(result.upload);
      updatePreview();
      ui.toast("Image uploaded", "success");
    } catch (err) {
      showError(parts, err.message || "Upload failed.");
    } finally {
      uploadText.textContent = before;
    }
  });

  pick.addEventListener("click", function () {
    const history = ui.getUploadHistory();
    if (!history.length) {
      ui.openModal({
        title: "Previous uploads",
        body:
          "No images have been uploaded from this browser yet. Use “Upload image” to add one.",
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
      button.appendChild(img);
      button.appendChild(ui.make("span", "upload-name", entry.filename || entry.url));
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
    read: function () {
      return input.value.trim();
    },
    showError: function (message) {
      showError(parts, message);
    },
    clearError: function () {
      clearError(parts);
    },
  };
}
