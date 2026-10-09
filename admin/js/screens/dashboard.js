/*
  Dashboard: counts for the whole panel plus a quick way into every area of
  the site navigation.
*/

import * as ui from "../ui.js";
import { GROUP_ORDER, groupSections } from "../nav-groups.js";

export async function renderDashboard(container, { sections }) {
  container.replaceChildren();

  const list = Array.isArray(sections) ? sections : [];

  const head = ui.make("header", "page-head");
  head.appendChild(ui.make("h1", "", "Dashboard"));
  head.appendChild(
    ui.make("p", "page-sub", "Everything the panel can edit, grouped like the site menu.")
  );
  container.appendChild(head);

  if (!list.length) {
    container.appendChild(
      ui.emptyNode("No content sections found.", "Run the seeder to load the site content.")
    );
    return;
  }

  const totals = list.reduce(
    function (acc, section) {
      acc.items += section.itemCount || 0;
      acc.edited += section.editedCount || 0;
      acc.hidden += section.hiddenCount || 0;
      if (section.kind === "collection") acc.collections += 1;
      else acc.scalars += 1;
      return acc;
    },
    { items: 0, edited: 0, hidden: 0, collections: 0, scalars: 0 }
  );

  const stats = ui.make("section", "stat-grid");
  stats.setAttribute("aria-label", "Content totals");
  [
    { label: "Sections", value: list.length, hint: totals.collections + " collections · " + totals.scalars + " single value" },
    { label: "Content items", value: totals.items, hint: "across every page" },
    { label: "Edited", value: totals.edited, hint: "changed from the original" },
    { label: "Hidden", value: totals.hidden, hint: "not shown on the site" },
  ].forEach(function (card) {
    const node = ui.make("div", "stat-card");
    node.appendChild(ui.make("span", "stat-value", String(card.value)));
    node.appendChild(ui.make("span", "stat-label", card.label));
    node.appendChild(ui.make("span", "stat-hint", card.hint));
    stats.appendChild(node);
  });
  container.appendChild(stats);

  const grouped = groupSections(list);

  const section = ui.make("section", "dash-section");
  section.appendChild(ui.make("h2", "", "Browse by area"));
  container.appendChild(section);

  const grid = ui.make("div", "area-grid");
  GROUP_ORDER.filter((label) => grouped.has(label)).forEach(function (label) {
    const group = grouped.get(label);
    const card = ui.make("a", "area-card");
    card.href = "#/s/" + encodeURIComponent(group[0].key);

    const items = group.reduce((sum, s) => sum + (s.itemCount || 0), 0);
    const hidden = group.reduce((sum, s) => sum + (s.hiddenCount || 0), 0);

    card.appendChild(ui.make("span", "area-title", label));
    card.appendChild(
      ui.make(
        "span",
        "area-meta",
        group.length +
          " section" +
          (group.length === 1 ? "" : "s") +
          " · " +
          items +
          " item" +
          (items === 1 ? "" : "s") +
          (hidden ? " · " + hidden + " hidden" : "")
      )
    );
    grid.appendChild(card);
  });
  container.appendChild(grid);

  const tools = ui.make("section", "dash-section");
  tools.appendChild(ui.make("h2", "", "Tools"));
  const links = ui.make("div", "area-grid");
  [
    { href: "#/submissions", title: "Form Submissions", meta: "Messages and forms sent from the site" },
    { href: "#/account", title: "Account", meta: "Change your password" },
  ].forEach(function (entry) {
    const card = ui.make("a", "area-card");
    card.href = entry.href;
    card.appendChild(ui.make("span", "area-title", entry.title));
    card.appendChild(ui.make("span", "area-meta", entry.meta));
    links.appendChild(card);
  });
  tools.appendChild(links);
  container.appendChild(tools);
}
