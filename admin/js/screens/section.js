/*
  Section screen: the item list for one content section.

  List + search + pagination + status badges, and the row actions
  Edit / Hide / Show / Reorder / Delete / New item.
  Scalar sections (hero text, mission, ...) are edit-only.
*/

import api from "../api.js";
import * as ui from "../ui.js";

const PAGE_SIZE = 10;

export async function renderSection(container, { key }) {
  container.replaceChildren(ui.loadingNode());

  const payload = await api.getSection(key);
  const section = payload.section;
  let items = (payload.items || []).slice();

  const isCollection = section.kind === "collection";

  document.title = section.title + " · BCRLS Admin";
  container.replaceChildren();

  /* ------------------------------------------------------------ head */

  const head = ui.make("header", "page-head");

  const crumbs = ui.make("nav", "crumbs");
  crumbs.setAttribute("aria-label", "Breadcrumb");
  const back = ui.make("a", "", "Dashboard");
  back.href = "#/";
  crumbs.appendChild(back);
  crumbs.appendChild(ui.make("span", "", "/"));
  (section.pages || []).forEach(function (page) {
    const link = ui.make("a", "", page.replace(/^\//, ""));
    link.href = page;
    link.target = "_blank";
    link.rel = "noopener";
    link.title = "Open " + page + " on the public site";
    crumbs.appendChild(link);
  });
  head.appendChild(crumbs);

  head.appendChild(ui.make("h1", "", section.title));

  const meta = ui.make("p", "page-sub");
  meta.appendChild(
    ui.make(
      "span",
      "pill",
      isCollection ? "Collection" : "Single value"
    )
  );
  head.appendChild(meta);

  if (!isCollection) {
    const note = ui.make("p", "callout");
    note.textContent =
      "This section holds a single value (for example hero text or the mission statement). " +
      "You can edit it, but items cannot be created or deleted here.";
    head.appendChild(note);
  }

  container.appendChild(head);

  /* ---------------------------------------------------------- toolbar */

  const toolbar = ui.make("div", "toolbar");

  const searchField = ui.make("div", "field field-inline search-field");
  const searchLabel = ui.make("label", "", "Search");
  searchLabel.setAttribute("for", "sectionSearch");
  const search = ui.make("input", "input");
  search.type = "search";
  search.id = "sectionSearch";
  search.placeholder = "Search by title or content";
  search.autocomplete = "off";
  searchField.appendChild(searchLabel);
  searchField.appendChild(search);
  toolbar.appendChild(searchField);

  const newWrap = ui.make("div", "toolbar-actions");
  if (isCollection) {
    const newBtn = ui.make("button", "btn btn-primary", "New item");
    newBtn.type = "button";
    newBtn.addEventListener("click", function () {
      location.hash = "#/s/" + encodeURIComponent(key) + "/new";
    });
    newWrap.appendChild(newBtn);
  }
  toolbar.appendChild(newWrap);
  container.appendChild(toolbar);

  /* ------------------------------------------------------ list region */

  const statusLine = ui.make("p", "result-line");
  statusLine.setAttribute("aria-live", "polite");
  container.appendChild(statusLine);

  const listRegion = ui.make("div", "list-region");
  container.appendChild(listRegion);

  const pager = ui.make("nav", "pager");
  pager.setAttribute("aria-label", "Pagination");
  container.appendChild(pager);

  let page = 1;
  let query = "";
  let busy = false;

  function visibleItems() {
    if (!query) return items;
    const needle = query.toLowerCase();
    return items.filter(function (item) {
      if ((item.slug || "").toLowerCase().includes(needle)) return true;
      return JSON.stringify(item.data || {}).toLowerCase().includes(needle);
    });
  }

  function itemLabel(item) {
    return ui.itemTitle(item, section.fields);
  }

  async function reOrder(from, to) {
    if (busy || from === to || to < 0 || to >= items.length) return;
    busy = true;

    const snapshot = items.slice();
    const moved = snapshot.splice(from, 1)[0];
    snapshot.splice(to, 0, moved);

    try {
      const result = await api.reorder(
        key,
        snapshot.map((item) => item.id)
      );
      items = (result.items || []).slice();
      ui.toast("Order saved", "success");
    } catch (err) {
      items = snapshot; /* the API rejected it - fall back to the server order below */
      try {
        const fresh = await api.getSection(key);
        items = (fresh.items || []).slice();
      } catch (again) {
        /* keep the optimistic order and tell the user */
      }
      ui.toast(err.message || "Could not save the new order", "error");
    } finally {
      busy = false;
      render();
    }
  }

  async function toggleHidden(item) {
    if (busy) return;
    busy = true;
    try {
      const result = await api.updateItem(key, item.id, { hidden: !item.hidden });
      const index = items.findIndex((candidate) => candidate.id === item.id);
      if (index > -1) items[index] = result.item;
      ui.toast(
        result.item.hidden ? "Item hidden from the site" : "Item is visible again",
        "success"
      );
    } catch (err) {
      ui.toast(err.message || "Could not change visibility", "error");
    } finally {
      busy = false;
      render();
    }
  }

  async function removeItem(item) {
    const confirmed = await ui.confirmDialog({
      title: "Delete this item?",
      message:
        '"' + itemLabel(item) + '" will be removed from the section and from the site. This cannot be undone.',
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;

    if (busy) return;
    busy = true;
    try {
      await api.deleteItem(key, item.id);
      items = items.filter((candidate) => candidate.id !== item.id);
      ui.toast("Item deleted", "success");
    } catch (err) {
      ui.toast(err.message || "Could not delete the item", "error");
    } finally {
      busy = false;
      render();
    }
  }

  function rowNode(item, position, searchable) {
    const row = document.createElement("tr");
    if (item.hidden) row.className = "row-hidden";

    /* position */
    const posCell = ui.make("td", "cell-index");
    posCell.dataset.label = "#";
    posCell.textContent = String(position);

    /* item */
    const itemCell = ui.make("td", "cell-item");
    itemCell.dataset.label = "Item";
    const title = ui.make("span", "item-title", itemLabel(item));
    itemCell.appendChild(title);
    const slug = ui.make("span", "item-slug", item.slug || "");
    itemCell.appendChild(slug);
    if (item.editedAt) {
      itemCell.appendChild(
        ui.make("span", "item-edited", "edited " + ui.formatDate(item.editedAt))
      );
    }

    /* status */
    const statusCell = ui.make("td", "cell-status");
    statusCell.dataset.label = "Status";
    statusCell.appendChild(ui.statusBadge(item));

    /* visibility */
    const visibility = ui.make("td", "cell-visibility");
    visibility.dataset.label = "Visibility";
    const pill = ui.make("span", "visibility " + (item.hidden ? "visibility-off" : "visibility-on"));
    pill.textContent = item.hidden ? "Hidden" : "Visible";
    visibility.appendChild(pill);

    /* actions */
    const actions = ui.make("td", "cell-actions");
    actions.dataset.label = "Actions";

    const edit = ui.make("button", "btn btn-sm btn-secondary", "Edit");
    edit.type = "button";
    edit.setAttribute("aria-label", "Edit " + itemLabel(item));
    edit.addEventListener("click", function () {
      location.hash = "#/s/" + encodeURIComponent(key) + "/item/" + item.id;
    });
    actions.appendChild(edit);

    if (isCollection) {
      const hide = ui.make(
        "button",
        "btn btn-sm btn-ghost",
        item.hidden ? "Show" : "Hide"
      );
      hide.type = "button";
      hide.setAttribute(
        "aria-label",
        (item.hidden ? "Show " : "Hide ") + itemLabel(item)
      );
      hide.addEventListener("click", function () {
        toggleHidden(item);
      });
      actions.appendChild(hide);

      const up = ui.make("button", "btn btn-sm btn-ghost btn-icon", "\u2191");
      up.type = "button";
      up.title = "Move up";
      up.setAttribute("aria-label", "Move " + itemLabel(item) + " up");
      const down = ui.make("button", "btn btn-sm btn-ghost btn-icon", "\u2193");
      down.type = "button";
      down.title = "Move down";
      down.setAttribute("aria-label", "Move " + itemLabel(item) + " down");

      const reorderDisabled = Boolean(query) || items.length < 2 || busy;
      up.disabled = reorderDisabled || position === 1;
      down.disabled = reorderDisabled || position === items.length;
      if (query) {
        up.title = down.title = "Clear the search to reorder";
      }

      const order = items.findIndex((candidate) => candidate.id === item.id);
      up.addEventListener("click", function () {
        reOrder(order, order - 1);
      });
      down.addEventListener("click", function () {
        reOrder(order, order + 1);
      });
      actions.appendChild(up);
      actions.appendChild(down);

      const del = ui.make("button", "btn btn-sm btn-danger", "Delete");
      del.type = "button";
      del.setAttribute("aria-label", "Delete " + itemLabel(item));
      del.addEventListener("click", function () {
        removeItem(item);
      });
      actions.appendChild(del);
    }

    row.appendChild(posCell);
    row.appendChild(itemCell);
    row.appendChild(statusCell);
    row.appendChild(visibility);
    row.appendChild(actions);
    if (searchable) row.classList.add("is-filtered");
    return row;
  }

  function render() {
    const matches = visibleItems();
    const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * PAGE_SIZE;
    const slice = matches.slice(start, start + PAGE_SIZE);

    statusLine.textContent = query
      ? matches.length + " of " + items.length + " items match \u201c" + query + "\u201d"
      : items.length + " item" + (items.length === 1 ? "" : "s");

    listRegion.replaceChildren();

    if (!items.length) {
      listRegion.appendChild(
        ui.emptyNode(
          "This section has no items yet.",
          isCollection ? "Use \u201cNew item\u201d to add the first one." : null
        )
      );
      pager.replaceChildren();
      return;
    }

    if (!matches.length) {
      listRegion.appendChild(ui.emptyNode("No items match your search."));
      pager.replaceChildren();
      return;
    }

    const table = ui.make("table", "item-table");
    const caption = ui.make("caption", "sr-only", "Items in " + section.title);
    table.appendChild(caption);

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["#", "Item", "Status", "Visibility", "Actions"].forEach(function (label, i) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = label;
      if (i === 4) th.className = "th-actions";
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    slice.forEach(function (item, offset) {
      tbody.appendChild(rowNode(item, start + offset + 1, Boolean(query)));
    });
    table.appendChild(tbody);
    listRegion.appendChild(table);

    /* pager */
    pager.replaceChildren();
    if (matches.length > PAGE_SIZE) {
      const prev = ui.make("button", "btn btn-sm btn-secondary", "Previous");
      prev.type = "button";
      prev.disabled = page === 1;
      prev.addEventListener("click", function () {
        page -= 1;
        render();
        listRegion.scrollIntoView({ block: "start", behavior: "smooth" });
      });

      const label = ui.make("span", "pager-label", "Page " + page + " of " + totalPages);

      const next = ui.make("button", "btn btn-sm btn-secondary", "Next");
      next.type = "button";
      next.disabled = page === totalPages;
      next.addEventListener("click", function () {
        page += 1;
        render();
        listRegion.scrollIntoView({ block: "start", behavior: "smooth" });
      });

      pager.appendChild(prev);
      pager.appendChild(label);
      pager.appendChild(next);
    }
  }

  search.addEventListener("input", function () {
    query = search.value.trim();
    page = 1;
    render();
  });

  render();
}
