/*
  Form submissions: filterable table, detail view, status actions, delete
  and CSV export.
*/

import api from "../api.js";
import * as ui from "../ui.js";

const PAGE_SIZE = 25;
const FETCH_PAGE = 200;

const STATUS_LABELS = { new: "New", read: "Read", archived: "Archived" };

export async function renderSubmissions(container, { id }) {
  if (id) return renderDetail(container, id);
  return renderList(container);
}

/* ------------------------------------------------------------- list */

async function renderList(container) {
  container.replaceChildren(ui.loadingNode());
  document.title = "Form Submissions · BCRLS Admin";

  const state = { form: "", status: "", offset: 0 };
  let payload = { submissions: [], counts: [] };

  container.replaceChildren();

  const head = ui.make("header", "page-head");
  const crumbs = ui.make("nav", "crumbs");
  crumbs.setAttribute("aria-label", "Breadcrumb");
  const dash = ui.make("a", "", "Dashboard");
  dash.href = "#/";
  crumbs.appendChild(dash);
  crumbs.appendChild(ui.make("span", "", "/"));
  crumbs.appendChild(ui.make("span", "", "Form Submissions"));
  head.appendChild(crumbs);
  head.appendChild(ui.make("h1", "", "Form Submissions"));
  head.appendChild(
    ui.make("p", "page-sub", "Messages and forms sent from the public site.")
  );
  container.appendChild(head);

  /* filters */
  const toolbar = ui.make("div", "toolbar");

  const formField = ui.make("div", "field field-inline");
  const formLabel = ui.make("label", "", "Form");
  formLabel.setAttribute("for", "filterForm");
  const formSelect = document.createElement("select");
  formSelect.id = "filterForm";
  formSelect.className = "input";
  formField.appendChild(formLabel);
  formField.appendChild(formSelect);
  toolbar.appendChild(formField);

  const statusField = ui.make("div", "field field-inline");
  const statusLabel = ui.make("label", "", "Status");
  statusLabel.setAttribute("for", "filterStatus");
  const statusSelect = document.createElement("select");
  statusSelect.id = "filterStatus";
  statusSelect.className = "input";
  ["", "new", "read", "archived"].forEach(function (value) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value ? STATUS_LABELS[value] : "Any status";
    statusSelect.appendChild(option);
  });
  statusField.appendChild(statusLabel);
  statusField.appendChild(statusSelect);
  toolbar.appendChild(statusField);

  const tools = ui.make("div", "toolbar-actions");
  const exportBtn = ui.make("button", "btn btn-secondary", "Export CSV");
  exportBtn.type = "button";
  exportBtn.title = "Download everything that matches the current filters";
  tools.appendChild(exportBtn);
  toolbar.appendChild(tools);
  container.appendChild(toolbar);

  const statusLine = ui.make("p", "result-line");
  statusLine.setAttribute("aria-live", "polite");
  container.appendChild(statusLine);

  const listRegion = ui.make("div", "list-region");
  container.appendChild(listRegion);

  const pager = ui.make("nav", "pager");
  pager.setAttribute("aria-label", "Pagination");
  container.appendChild(pager);

  function buildFormOptions() {
    const keys = [];
    (payload.counts || []).forEach(function (row) {
      if (row.form_key && keys.indexOf(row.form_key) === -1) keys.push(row.form_key);
    });
    keys.sort();

    const previous = formSelect.value;
    formSelect.replaceChildren();
    const all = document.createElement("option");
    all.value = "";
    all.textContent = "All forms";
    formSelect.appendChild(all);
    keys.forEach(function (key) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      formSelect.appendChild(option);
    });
    formSelect.value = keys.indexOf(previous) > -1 || !previous ? previous : "";
  }

  function newCount() {
    return (payload.counts || []).reduce(function (sum, row) {
      if (row.status !== "new") return sum;
      if (state.form && row.form_key !== state.form) return sum;
      return sum + Number(row.total || 0);
    }, 0);
  }

  async function load() {
    listRegion.replaceChildren(ui.loadingNode());
    try {
      payload = await api.listSubmissions({
        form: state.form,
        status: state.status,
        limit: PAGE_SIZE,
        offset: state.offset,
      });
    } catch (err) {
      listRegion.replaceChildren(ui.errorNode(err.message || "Could not load submissions."));
      return;
    }
    buildFormOptions();
    render();
  }

  function summaryOf(submission) {
    const data = submission.payload || {};
    const keys = Object.keys(data);
    if (!keys.length) return "(no data)";
    return keys
      .slice(0, 3)
      .map(function (key) {
        const value = data[key];
        const text = typeof value === "object" ? JSON.stringify(value) : String(value);
        return key + ": " + text;
      })
      .join(" · ");
  }

  function statusPill(status) {
    const pill = ui.make("span", "status status-" + status, STATUS_LABELS[status] || status);
    return pill;
  }

  async function act(submission, action) {
    if (action === "read") {
      try {
        await api.setSubmissionStatus(submission.id, "read");
        ui.toast("Marked as read", "success");
        window.dispatchEvent(new CustomEvent("admin:count-changed"));
        await load();
      } catch (err) {
        ui.toast(err.message || "Could not update the submission", "error");
      }
      return;
    }

    if (action === "archive") {
      try {
        await api.setSubmissionStatus(submission.id, "archived");
        ui.toast("Archived", "success");
        window.dispatchEvent(new CustomEvent("admin:count-changed"));
        await load();
      } catch (err) {
        ui.toast(err.message || "Could not update the submission", "error");
      }
      return;
    }

    if (action === "delete") {
      const confirmed = await ui.confirmDialog({
        title: "Delete this submission?",
        message: "The message from " + summaryOf(submission) + " will be deleted permanently.",
        confirmLabel: "Delete",
        danger: true,
      });
      if (!confirmed) return;
      try {
        await api.deleteSubmission(submission.id);
        ui.toast("Submission deleted", "success");
        window.dispatchEvent(new CustomEvent("admin:count-changed"));
        if (state.offset > 0 && (payload.submissions || []).length === 1) {
          state.offset = Math.max(0, state.offset - PAGE_SIZE);
        }
        await load();
      } catch (err) {
        ui.toast(err.message || "Could not delete the submission", "error");
      }
    }
  }

  function render() {
    const rows = payload.submissions || [];
    const total = newCount();

    statusLine.textContent =
      rows.length + " shown" + (total ? " · " + total + " new" : "");

    listRegion.replaceChildren();

    if (!rows.length) {
      listRegion.appendChild(
        ui.emptyNode(
          "No submissions match these filters.",
          "Try another form or status."
        )
      );
      pager.replaceChildren();
      return;
    }

    const table = ui.make("table", "item-table submissions-table");
    table.appendChild(ui.make("caption", "sr-only", "Form submissions"));

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["Received", "Form", "Page", "Message", "Status", "Actions"].forEach(function (label) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = label;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    rows.forEach(function (submission) {
      const tr = document.createElement("tr");

      const received = ui.make("td", "cell-index", ui.formatDate(submission.createdAt));
      received.dataset.label = "Received";

      const form = ui.make("td", "cell-item", submission.formKey || "—");
      form.dataset.label = "Form";

      const page = ui.make("td", "cell-item", submission.page || "—");
      page.dataset.label = "Page";

      const message = ui.make("td", "cell-message", summaryOf(submission));
      message.dataset.label = "Message";

      const status = ui.make("td", "cell-status");
      status.dataset.label = "Status";
      status.appendChild(statusPill(submission.status));

      const actions = ui.make("td", "cell-actions");
      actions.dataset.label = "Actions";

      const view = ui.make("button", "btn btn-sm btn-secondary", "View");
      view.type = "button";
      view.setAttribute("aria-label", "View submission from " + summaryOf(submission));
      view.addEventListener("click", function () {
        location.hash = "#/submissions/" + submission.id;
      });
      actions.appendChild(view);

      if (submission.status !== "read") {
        const read = ui.make("button", "btn btn-sm btn-ghost", "Mark read");
        read.type = "button";
        read.addEventListener("click", function () {
          act(submission, "read");
        });
        actions.appendChild(read);
      }
      if (submission.status !== "archived") {
        const archive = ui.make("button", "btn btn-sm btn-ghost", "Archive");
        archive.type = "button";
        archive.addEventListener("click", function () {
          act(submission, "archive");
        });
        actions.appendChild(archive);
      }

      const del = ui.make("button", "btn btn-sm btn-danger", "Delete");
      del.type = "button";
      del.addEventListener("click", function () {
        act(submission, "delete");
      });
      actions.appendChild(del);

      tr.appendChild(received);
      tr.appendChild(form);
      tr.appendChild(page);
      tr.appendChild(message);
      tr.appendChild(status);
      tr.appendChild(actions);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    listRegion.appendChild(table);

    /* pager */
    pager.replaceChildren();
    if ((payload.submissions || []).length === PAGE_SIZE || state.offset > 0) {
      const prev = ui.make("button", "btn btn-sm btn-secondary", "Previous");
      prev.type = "button";
      prev.disabled = state.offset === 0;
      prev.addEventListener("click", function () {
        state.offset = Math.max(0, state.offset - PAGE_SIZE);
        load();
      });

      const label = ui.make(
        "span",
        "pager-label",
        "Rows " + (state.offset + 1) + "\u2013" + (state.offset + rows.length)
      );

      const next = ui.make("button", "btn btn-sm btn-secondary", "Next");
      next.type = "button";
      next.disabled = rows.length < PAGE_SIZE;
      next.addEventListener("click", function () {
        state.offset += PAGE_SIZE;
        load();
      });

      pager.appendChild(prev);
      pager.appendChild(label);
      pager.appendChild(next);
    }
  }

  formSelect.addEventListener("change", function () {
    state.form = formSelect.value;
    state.offset = 0;
    load();
  });
  statusSelect.addEventListener("change", function () {
    state.status = statusSelect.value;
    state.offset = 0;
    load();
  });

  exportBtn.addEventListener("click", async function () {
    exportBtn.disabled = true;
    const label = exportBtn.textContent;
    exportBtn.textContent = "Preparing…";
    try {
      const all = await fetchAll();
      if (!all.length) {
        ui.toast("Nothing to export for these filters.", "warn");
        return;
      }
      downloadCsv(all, state.form || "all-forms");
      ui.toast("Exported " + all.length + " submission" + (all.length === 1 ? "" : "s"), "success");
    } catch (err) {
      ui.toast(err.message || "Export failed", "error");
    } finally {
      exportBtn.disabled = false;
      exportBtn.textContent = label;
    }
  });

  async function fetchAll() {
    const collected = [];
    let offset = 0;
    for (;;) {
      const page = await api.listSubmissions({
        form: state.form,
        status: state.status,
        limit: FETCH_PAGE,
        offset: offset,
      });
      const rows = page.submissions || [];
      collected.push.apply(collected, rows);
      if (rows.length < FETCH_PAGE) break;
      offset += FETCH_PAGE;
    }
    return collected;
  }

  await load();
}

/* ------------------------------------------------------------ detail */

async function renderDetail(container, id) {
  container.replaceChildren(ui.loadingNode());
  document.title = "Submission · BCRLS Admin";

  let submission = null;
  let offset = 0;

  /* the API has no GET-by-id, so walk the list pages until it shows up */
  for (let guard = 0; guard < 100 && !submission; guard += 1) {
    const page = await api.listSubmissions({ limit: FETCH_PAGE, offset: offset });
    const rows = page.submissions || [];
    submission = rows.find((row) => String(row.id) === String(id)) || null;
    if (rows.length < FETCH_PAGE) break;
    offset += FETCH_PAGE;
  }

  container.replaceChildren();

  if (!submission) {
    container.appendChild(
      ui.emptyNode("That submission no longer exists.", "It may have been deleted.")
    );
    const back = ui.make("a", "btn btn-secondary", "Back to submissions");
    back.href = "#/submissions";
    container.appendChild(back);
    return;
  }

  const head = ui.make("header", "page-head");
  const crumbs = ui.make("nav", "crumbs");
  crumbs.setAttribute("aria-label", "Breadcrumb");
  const list = ui.make("a", "", "Form Submissions");
  list.href = "#/submissions";
  crumbs.appendChild(list);
  crumbs.appendChild(ui.make("span", "", "/"));
  crumbs.appendChild(ui.make("span", "", submission.formKey || "Submission"));
  head.appendChild(crumbs);
  head.appendChild(ui.make("h1", "", submission.formKey || "Submission"));
  const meta = ui.make("p", "page-sub");
  meta.appendChild(ui.make("span", "status status-" + submission.status, STATUS_LABELS[submission.status] || submission.status));
  meta.appendChild(document.createTextNode(" \u00b7 received " + ui.formatDate(submission.createdAt)));
  if (submission.page) meta.appendChild(document.createTextNode(" \u00b7 " + submission.page));
  head.appendChild(meta);
  container.appendChild(head);

  const card = ui.make("section", "detail-card");
  const list2 = ui.make("dl", "detail-list");
  const data = submission.payload || {};
  const keys = Object.keys(data);
  if (!keys.length) {
    list2.appendChild(ui.make("dt", "", "Payload"));
    list2.appendChild(ui.make("dd", "", "(no data)"));
  }
  keys.forEach(function (key) {
    const dt = document.createElement("dt");
    dt.textContent = key;
    const dd = document.createElement("dd");
    const value = data[key];
    dd.textContent =
      value === null || value === undefined
        ? ""
        : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
    list2.appendChild(dt);
    list2.appendChild(dd);
  });
  card.appendChild(list2);
  container.appendChild(card);

  const actions = ui.make("div", "form-actions");

  const back = ui.make("a", "btn btn-secondary", "Back");
  back.href = "#/submissions";
  actions.appendChild(back);

  if (submission.status !== "read") {
    const read = ui.make("button", "btn btn-secondary", "Mark as read");
    read.type = "button";
    read.addEventListener("click", async function () {
      try {
        await api.setSubmissionStatus(submission.id, "read");
        ui.toast("Marked as read", "success");
        window.dispatchEvent(new CustomEvent("admin:count-changed"));
        renderDetail(container, id);
      } catch (err) {
        ui.toast(err.message || "Could not update the submission", "error");
      }
    });
    actions.appendChild(read);
  }

  if (submission.status !== "archived") {
    const archive = ui.make("button", "btn btn-secondary", "Archive");
    archive.type = "button";
    archive.addEventListener("click", async function () {
      try {
        await api.setSubmissionStatus(submission.id, "archived");
        ui.toast("Archived", "success");
        window.dispatchEvent(new CustomEvent("admin:count-changed"));
        renderDetail(container, id);
      } catch (err) {
        ui.toast(err.message || "Could not update the submission", "error");
      }
    });
    actions.appendChild(archive);
  }

  const del = ui.make("button", "btn btn-danger", "Delete");
  del.type = "button";
  del.addEventListener("click", async function () {
    const confirmed = await ui.confirmDialog({
      title: "Delete this submission?",
      message: "This message will be deleted permanently.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await api.deleteSubmission(submission.id);
      ui.toast("Submission deleted", "success");
      window.dispatchEvent(new CustomEvent("admin:count-changed"));
      location.hash = "#/submissions";
    } catch (err) {
      ui.toast(err.message || "Could not delete the submission", "error");
    }
  });
  actions.appendChild(del);

  container.appendChild(actions);
}

/* --------------------------------------------------------------- csv */

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return '"' + text.replace(/"/g, '""') + '"';
}

function downloadCsv(rows, label) {
  const payloadKeys = [];
  rows.forEach(function (row) {
    Object.keys(row.payload || {}).forEach(function (key) {
      if (payloadKeys.indexOf(key) === -1) payloadKeys.push(key);
    });
  });
  payloadKeys.sort();

  const header = ["id", "form", "page", "status", "received"].concat(payloadKeys);
  const lines = [header.map(csvCell).join(",")];

  rows.forEach(function (row) {
    const cells = [
      row.id,
      row.formKey,
      row.page,
      row.status,
      row.createdAt,
    ].concat(
      payloadKeys.map(function (key) {
        const value = (row.payload || {})[key];
        return value === null || value === undefined
          ? ""
          : typeof value === "object"
          ? JSON.stringify(value)
          : value;
      })
    );
    lines.push(cells.map(csvCell).join(","));
  });

  const blob = new Blob(["\ufeff" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "submissions-" + label + ".csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1000);
}
