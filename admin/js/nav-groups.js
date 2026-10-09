/*
  The admin sidebar mirrors the site navigation: every content section is
  assigned to the nav item whose pages it belongs to.
*/

export const NAV_GROUPS = [
  { label: "Home", match: (p) => p === "/index.html" || p === "/" },
  { label: "About", match: (p) => p.startsWith("/pages/") },
  { label: "Research & Publications", match: (p) => p.startsWith("/research/") },
  { label: "Library", match: (p) => p.startsWith("/library/") },
  { label: "Education", match: (p) => p.startsWith("/education/") },
  { label: "Data Hub", match: (p) => p.startsWith("/datahub/") },
  { label: "Events", match: (p) => p.startsWith("/events/") },
  { label: "Insights", match: (p) => p.startsWith("/insights/") },
  { label: "Media", match: (p) => p.startsWith("/media/") },
  { label: "Get Involved", match: (p) => p.startsWith("/get-involved/") },
  { label: "Contact", match: (p) => p === "/contact.html" },
];

export function groupOf(section) {
  const pages = Array.isArray(section.pages) ? section.pages : [];
  for (const page of pages) {
    const hit = NAV_GROUPS.find((group) => group.match(page));
    if (hit) return hit.label;
  }
  return "Other pages";
}

export const GROUP_ORDER = NAV_GROUPS.map((group) => group.label).concat(["Other pages"]);

export function groupSections(sections) {
  const grouped = new Map();
  (sections || []).forEach(function (section) {
    const label = groupOf(section);
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label).push(section);
  });
  return grouped;
}
