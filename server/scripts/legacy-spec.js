"use strict";

/*
  Legacy content spec.

  One entry per editable section of the static site.  Every field selector is
  evaluated *inside* the first matching item element (or on the item root when
  it starts with "@").

  Field spec:
    sel      CSS selector, or "@attr" for an attribute of the item root
    attr     read/write an attribute of the matched element instead of its text
    mode     'text' | 'html' | 'attr'  (decided by the extractor, may be forced)
    label    label shown in the admin panel
    type     admin input hint: text | textarea | url | date | image | list | number
    slugFrom true  -> value used to build the row slug
*/

const SCALARS = [
  {
    key: "home-hero-eyebrow",
    title: "Home hero - eyebrow",
    pages: ["/index.html"],
    fields: {
      value: { sel: ".hero-content .eyebrow", label: "Eyebrow", type: "text", slugFrom: true },
    },
  },
  {
    key: "home-hero-heading",
    title: "Home hero - heading",
    pages: ["/index.html"],
    fields: {
      value: { sel: ".hero-content h1", mode: "html", label: "Heading", type: "textarea", slugFrom: true },
    },
  },
  {
    key: "home-hero-paragraph",
    title: "Home hero - paragraph",
    pages: ["/index.html"],
    fields: {
      value: { sel: ".hero-content > p", label: "Paragraph", type: "textarea", slugFrom: true },
    },
  },
];

const HTML_COLLECTIONS = [
  {
    key: "events-archive",
    title: "Event archive",
    pages: ["/events/archive.html"],
    container: ".events-grid",
    item: ".event-card",
    matchBy: "eventId",
    slugFrom: "title",
    fields: {
      eventId: { sel: "@data-event-id", label: "Event id", type: "number" },
      image: { sel: ".event-card-image img", attr: "src", label: "Image", type: "image" },
      imageAlt: { sel: ".event-card-image img", attr: "alt", label: "Image alt text", type: "text" },
      type: { sel: ".event-card-type", label: "Type", type: "text" },
      title: { sel: ".event-card-title", label: "Title", type: "text" },
      description: { sel: ".event-card-description", label: "Card description", type: "textarea" },
      dateIso: { virtual: true, label: "Date (drives sorting)", type: "date" },
      detail: {
        virtual: true,
        label: "Details modal",
        type: "object",
        objectFields: {
          description: { label: "Full description", type: "textarea" },
          programme: { label: "Programme", type: "textarea" },
          organizer: { label: "Organizer", type: "text" },
          speakers: { label: "Speakers", type: "list" },
          images: { label: "Gallery images", type: "list" },
          type: { label: "Type override", type: "text" },
        },
      },
    },
    /* values that live in js/events.js rather than in the markup */
    enrich: ["eventDetails", "eventDate"],
  },
  {
    key: "home-upcoming",
    title: "Home - featured course",
    pages: ["/index.html"],
    container: ".event-grid",
    item: "article.event-card",
    slugFrom: "title",
    fields: {
      image: { sel: ".event-card-image img", attr: "src", label: "Image", type: "image" },
      imageAlt: { sel: ".event-card-image img", attr: "alt", label: "Image alt text", type: "text" },
      type: { sel: ".event-type", label: "Type", type: "text" },
      title: { sel: ".event-content h3", label: "Title", type: "text" },
      description: { sel: ".event-content > p", label: "Description", type: "textarea" },
      detailsUrl: { sel: ".home-course-details", attr: "href", label: "Details link", type: "url" },
      moduleUrl: { sel: ".home-course-module", attr: "href", label: "Module link", type: "url" },
      registerUrl: { sel: ".home-course-register", attr: "href", label: "Registration link", type: "url" },
    },
  },
  {
    key: "home-latest",
    title: "Home - latest cards",
    pages: ["/index.html"],
    container: ".latest-grid",
    item: "article.latest-card",
    slugFrom: "title",
    fields: {
      icon: { sel: ".latest-image .placeholder-image i", attr: "class", label: "Icon class", type: "text" },
      category: { sel: ".latest-content > span", label: "Category", type: "text" },
      title: { sel: ".latest-content h3", label: "Title", type: "text" },
      description: { sel: ".latest-content > p", label: "Description", type: "textarea" },
      linkText: { sel: ".latest-content a.card-link", label: "Link text", type: "text" },
      linkUrl: { sel: ".latest-content a.card-link", attr: "href", label: "Link URL", type: "url" },
    },
  },
  {
    key: "library-academic",
    title: "Library - academic journals",
    pages: ["/library/academic.html"],
    container: "#academic-journals .library-resource-grid",
    item: "article.library-resource-card",
    slugFrom: "title",
    fields: {
      icon: { sel: ".library-resource-icon i", attr: "class", label: "Icon class", type: "text" },
      type: { sel: ".library-resource-type", label: "Type", type: "text" },
      meta: { sel: ".library-resource-meta", label: "Source / host", type: "text" },
      title: { sel: "h3", label: "Title", type: "text" },
      description: { sel: "p", label: "Description", type: "textarea" },
      linkText: { sel: ".library-resource-link", label: "Link text", type: "text" },
      linkUrl: { sel: ".library-resource-link", attr: "href", label: "Link URL", type: "url" },
    },
  },
  {
    key: "library-reports",
    title: "Library - reports",
    pages: ["/library/report.html"],
    container: "#reports .library-resource-grid",
    item: "article.library-resource-card",
    slugFrom: "title",
    fields: {
      icon: { sel: ".library-resource-icon i", attr: "class", label: "Icon class", type: "text" },
      type: { sel: ".library-resource-type", label: "Type", type: "text" },
      meta: { sel: ".library-resource-meta", label: "Source / host", type: "text" },
      title: { sel: "h3", label: "Title", type: "text" },
      description: { sel: "p", label: "Description", type: "textarea" },
      linkText: { sel: ".library-resource-link", label: "Link text", type: "text" },
      linkUrl: { sel: ".library-resource-link", attr: "href", label: "Link URL", type: "url" },
    },
  },
  {
    key: "library-books",
    title: "Library - books",
    pages: ["/library/books.html"],
    container: "#books .library-resource-grid",
    item: "article.library-resource-card",
    slugFrom: "title",
    fields: {
      icon: { sel: ".library-resource-icon i", attr: "class", label: "Icon class", type: "text" },
      type: { sel: ".library-resource-type", label: "Type", type: "text" },
      meta: { sel: ".library-resource-meta", label: "Source / host", type: "text" },
      title: { sel: "h3", label: "Title", type: "text" },
      description: { sel: "p", label: "Description", type: "textarea" },
      linkText: { sel: ".library-resource-link", label: "Link text", type: "text" },
      linkUrl: { sel: ".library-resource-link", attr: "href", label: "Link URL", type: "url" },
    },
  },
  {
    key: "education-masters",
    title: "Education - master's programmes",
    pages: ["/education/masters.html"],
    container: ".education-section .container",
    item: "article.training-card",
    slugFrom: "title",
    fields: {
      icon: { sel: ".training-card-icon i", attr: "class", label: "Icon class", type: "text" },
      category: { sel: ".training-category", label: "Country", type: "text" },
      title: { sel: ".training-card-content h3", label: "University", type: "text" },
      programme: { sel: ".training-card-content h4", label: "Programme", type: "text" },
      description: { sel: ".training-card-content > p", label: "Summary", type: "textarea" },
      degree: { sel: ".training-meta-item:nth-child(1) span", label: "Degree", type: "text" },
      duration: { sel: ".training-meta-item:nth-child(2) span", label: "Duration", type: "text" },
      location: { sel: ".training-meta-item:nth-child(3) span", label: "Location", type: "text" },
      details: { sel: ".training-details p", label: "Details", type: "textarea" },
      linkText: { sel: ".training-link", label: "Link text", type: "text" },
      linkUrl: { sel: ".training-link", attr: "href", label: "Link URL", type: "url" },
    },
  },
  {
    key: "education-phd",
    title: "Education - PhD opportunities",
    pages: ["/education/phd.html"],
    container: ".education-section .container",
    item: "article.training-card",
    slugFrom: "title",
    fields: {
      icon: { sel: ".training-card-icon i", attr: "class", label: "Icon class", type: "text" },
      category: { sel: ".training-category", label: "Country", type: "text" },
      title: { sel: ".training-card-content h3", label: "University", type: "text" },
      programme: { sel: ".training-card-content h4", label: "Programme / unit", type: "text" },
      description: { sel: ".training-card-content > p", label: "Summary", type: "textarea" },
      degree: { sel: ".training-meta-item:nth-child(1) span", label: "Degree", type: "text" },
      subject: { sel: ".training-meta-item:nth-child(2) span", label: "Subject", type: "text" },
      location: { sel: ".training-meta-item:nth-child(3) span", label: "Location", type: "text" },
      details: { sel: ".training-details p", label: "Details", type: "textarea" },
      linkText: { sel: ".training-link", label: "Link text", type: "text" },
      linkUrl: { sel: ".training-link", attr: "href", label: "Link URL", type: "url" },
    },
  },
  {
    key: "education-training",
    title: "Education - training programmes",
    pages: ["/education/traning.html"],
    container: ".education-section .container",
    item: "article.training-card",
    slugFrom: "title",
    fields: {
      icon: { sel: ".training-card-icon i", attr: "class", label: "Icon class", type: "text" },
      category: { sel: ".training-category", label: "Country", type: "text" },
      title: { sel: ".training-card-content h3", label: "Institution", type: "text" },
      programme: { sel: ".training-card-content h4", label: "Programme", type: "text" },
      description: { sel: ".training-card-content > p", label: "Summary", type: "textarea" },
      duration: { sel: ".training-meta-item:nth-child(1) span", label: "Duration", type: "text" },
      focus: { sel: ".training-meta-item:nth-child(2) span", label: "Focus", type: "text" },
      audience: { sel: ".training-meta-item:nth-child(3) span", label: "Audience", type: "text" },
      details: { sel: ".training-details p", label: "Details", type: "textarea" },
      linkText: { sel: ".training-link", label: "Link text", type: "text" },
      linkUrl: { sel: ".training-link", attr: "href", label: "Link URL", type: "url" },
    },
  },
  {
    key: "datahub-statistics",
    title: "Data hub - statistics links",
    pages: ["/datahub/statistics.html"],
    container: ".datahub-grid",
    item: "article.datahub-card",
    slugFrom: "title",
    fields: {
      iconClass: { sel: ".datahub-card-icon i", attr: "class", label: "Icon class (Font Awesome)", type: "text" },
      iconGlyph: { sel: ".database-card-icon", label: "Icon glyph (text)", type: "text" },
      title: { sel: "h3", label: "Title", type: "text" },
      description: { sel: "p", label: "Description", type: "textarea" },
      linkText: { sel: ".statistics-explore-btn", label: "Link text", type: "text" },
      linkUrl: { sel: ".statistics-explore-btn", attr: "href", label: "Link URL", type: "url" },
    },
  },
  {
    key: "datahub-portals",
    title: "Data hub - portals",
    pages: ["/datahub/dataPortal.html"],
    container: ".portal-grid",
    item: ".portal-card",
    slugFrom: "title",
    fields: {
      icon: { sel: ".database-card-icon", label: "Icon glyph", type: "text" },
      title: { sel: "h3", label: "Title", type: "text" },
      description: { sel: "p", label: "Description", type: "textarea" },
      linkText: { sel: ".portal-link", label: "Link text", type: "text" },
      linkUrl: { sel: ".portal-link", attr: "href", label: "Link URL", type: "url" },
    },
  },
  {
    key: "datahub-database",
    title: "Data hub - databases",
    pages: ["/datahub/database.html"],
    container: ".database-grid",
    item: "article.database-card",
    slugFrom: "title",
    fields: {
      icon: { sel: ".database-card-icon", label: "Icon glyph", type: "text" },
      title: { sel: "h3", label: "Title", type: "text" },
      description: { sel: "p", label: "Description", type: "textarea" },
      linkText: { sel: ".datahub-card-button", label: "Link text", type: "text" },
      linkUrl: { sel: ".datahub-card-button", attr: "href", label: "Link URL", type: "url" },
    },
  },
  {
    key: "media-newsroom",
    title: "Newsroom - featured coverage",
    pages: ["/media/newsroom.html"],
    container: ".newsroom-section",
    item: "article.newsroom-feature",
    slugFrom: "title",
    fields: {
      image: { sel: ".newsroom-feature-media img", attr: "src", label: "Image", type: "image" },
      imageAlt: { sel: ".newsroom-feature-media img", attr: "alt", label: "Image alt text", type: "text" },
      mediaTag: { sel: ".newsroom-media-tag", label: "Media tag", type: "text" },
      outlet: { sel: ".newsroom-meta span:nth-child(1)", label: "Publisher", type: "text" },
      date: { sel: ".newsroom-meta span:nth-child(2)", label: "Date", type: "text" },
      title: { sel: ".newsroom-feature-content h2", label: "Headline", type: "text" },
      lead: { sel: ".newsroom-lead", label: "Lead paragraph", type: "textarea" },
      highlight1: { sel: ".newsroom-highlights div:nth-child(1) span", label: "Highlight 1", type: "text" },
      highlight2: { sel: ".newsroom-highlights div:nth-child(2) span", label: "Highlight 2", type: "text" },
      highlight3: { sel: ".newsroom-highlights div:nth-child(3) span", label: "Highlight 3", type: "text" },
      linkText: { sel: ".newsroom-read", label: "Link text", type: "text" },
      linkUrl: { sel: ".newsroom-read", attr: "href", label: "Link URL", type: "url" },
    },
  },
  {
    key: "insights-latest",
    title: "Insights - section cards",
    pages: ["/insights/index.html"],
    container: ".latest-grid",
    item: "article.latest-card",
    slugFrom: "title",
    fields: {
      category: { sel: ".latest-content > span", label: "Category", type: "text" },
      title: { sel: ".latest-content h2", label: "Title", type: "text" },
      description: { sel: ".latest-content > p", label: "Description", type: "textarea" },
    },
  },
  {
    key: "home-hero-stats",
    title: "Home hero - pillars",
    pages: ["/index.html"],
    container: ".hero-stats",
    item: ".hero-stat",
    slugFrom: "label",
    fields: {
      label: { sel: "strong", label: "Label", type: "text" },
      caption: { sel: "span", label: "Caption", type: "text" },
    },
  },
];

/* Sections rendered from JS data objects (see js/events.js, js/app.js). */
const JS_COLLECTIONS = [
  {
    key: "events-upcoming",
    title: "Upcoming events",
    pages: ["/events/index.html", "/events/upcoming.html"],
    source: { file: "js/events.js", variable: "upcomingEvents", matchBy: "id" },
    container: "#upcomingEventsGrid",
    item: ".event-card",
    slugFrom: "title",
    fields: {
      id: { label: "Event id", type: "number" },
      type: { label: "Type", type: "text" },
      title: { label: "Title", type: "text" },
      date: { label: "Date", type: "text" },
      location: { label: "Location", type: "text" },
      image: { label: "Image", type: "image" },
      images: { label: "Gallery images", type: "list" },
      shortDescription: { label: "Card description", type: "textarea" },
      description: { label: "Full description", type: "textarea" },
      speakers: { label: "Speakers", type: "list" },
      programme: { label: "Programme", type: "textarea" },
      organizer: { label: "Organizer", type: "text" },
      registration: { label: "Registration link", type: "url" },
      module: { label: "Module link", type: "url" },
    },
  },
  {
    key: "team-advisory",
    title: "Team - advisory",
    pages: ["/pages/team.html"],
    source: { file: "js/app.js", variable: "teamData", path: "advisory", matchBy: "name" },
    container: "#advisoryGrid",
    item: ".member-card",
    slugFrom: "name",
    fields: {
      name: { label: "Name", type: "text" },
      role: { label: "Short role", type: "text" },
      fullRole: { label: "Full role", type: "textarea" },
      photo: { label: "Photo", type: "image" },
      bio: { label: "Bio", type: "textarea" },
    },
  },
  {
    key: "team-directors",
    title: "Team - board of directors",
    pages: ["/pages/team.html"],
    source: { file: "js/app.js", variable: "teamData", path: "directors", matchBy: "name" },
    container: "#directorsGrid",
    item: ".member-card",
    slugFrom: "name",
    fields: {
      name: { label: "Name", type: "text" },
      role: { label: "Short role", type: "text" },
      fullRole: { label: "Full role", type: "textarea" },
      photo: { label: "Photo", type: "image" },
      bio: { label: "Bio", type: "textarea" },
    },
  },
  {
    key: "team-operational",
    title: "Team - operational team",
    pages: ["/pages/team.html"],
    source: { file: "js/app.js", variable: "teamData", path: "operational", matchBy: "name" },
    container: "#operationalGrid",
    item: ".member-card",
    slugFrom: "name",
    fields: {
      name: { label: "Name", type: "text" },
      role: { label: "Role", type: "text" },
      fullRole: { label: "Full role", type: "textarea" },
      photo: { label: "Photo", type: "image" },
      bio: { label: "Bio", type: "textarea" },
    },
  },
];

/* ============================================================
   Remaining pages (see docs/AUDIT.md).

   The 22 sections above cover the original extract.  The helpers below add
   coverage for research/*, pages/*, get-involved/*, contact.html and media/*
   so the admin panel can manage every page listed in the navigation.

   - single texts          -> SCALARS
   - repeated cards/lists  -> HTML_COLLECTIONS
   Nothing is invented: every selector points at markup that exists today.
   ============================================================ */

function scalarGroup(page, keyPrefix, titlePrefix, defs) {
  return defs.map(([name, sel, label, type]) => ({
    key: `${keyPrefix}-${name}`,
    title: `${titlePrefix} - ${label}`,
    pages: [page],
    fields: {
      value: { sel, label, type: type || "textarea", slugFrom: true },
    },
  }));
}

function paragraphScalars(page, keyPrefix, titlePrefix, selBase, count) {
  const out = [];
  for (let i = 1; i <= count; i += 1) {
    out.push({
      key: `${keyPrefix}-paragraph-${i}`,
      title: `${titlePrefix} - Paragraph ${i}`,
      pages: [page],
      fields: {
        value: {
          sel: `${selBase}:nth-of-type(${i})`,
          label: `Paragraph ${i}`,
          type: "textarea",
          slugFrom: true,
        },
      },
    });
  }
  return out;
}

function collection(key, title, pages, container, item, slugFrom, fields) {
  return { key, title, pages, container, item, slugFrom, fields };
}

/* pages/mission.html, pages/vision.html, pages/Strategic-Objectives.html and
   pages/Founder.html share one template (page label, hero, profile card,
   message card with bio items). */
function aboutTemplateScalars(page, keyPrefix, titlePrefix, opts) {
  const defs = [
    ["page-label", ".about-page-label", "Page label", "text"],
    ["hero-heading", "h1", "Heading"],
    ["hero-intro", ".about-founder-intro", "Intro"],
    ["profile-title", ".about-founder-profile h2", "Profile title"],
  ];

  if (opts.profileDetails) {
    defs.push(
      ["profile-role", ".founder-role", "Profile role line", "text"],
      ["profile-affiliation", ".founder-affiliation", "Profile affiliation", "text"]
    );
  }

  defs.push(
    ["message-label", ".about-message-label", "Message label", "text"],
    ["message-heading", ".about-founder-message h2", "Message heading"],
    ["quote", ".about-founder-quote p", "Pull quote"]
  );

  if (opts.signature) {
    defs.push(
      ["signature-role", ".about-founder-signature strong", "Signature line 1", "text"],
      ["signature-organisation", ".about-founder-signature span", "Signature line 2", "text"]
    );
  }

  return [
    ...scalarGroup(page, keyPrefix, titlePrefix, defs),
    ...paragraphScalars(
      page,
      keyPrefix,
      titlePrefix,
      ".about-founder-message > p",
      opts.paragraphs
    ),
  ];
}

/* get-involved/<page>: hero (label + heading + intro), the section heading
   above the cards, the heading above the form and the two card lists. */
function involvedSubpage(page, keyPrefix, titlePrefix, opts) {
  const scalars = scalarGroup(page, keyPrefix, titlePrefix, [
    ["hero-label", `.${opts.labelClass}`, "Hero label", "text"],
    ["hero-heading", `.${opts.heroClass} h1`, "Hero heading"],
    ["hero-intro", `.${opts.textClass}`, "Hero intro"],
    ["section-heading", `.${opts.infoClass} h2`, "Section heading"],
    ["form-heading", `.${opts.formHeaderClass} h2`, "Form heading", "text"],
  ]);

  const items = collection(
    `${keyPrefix}-items`,
    `${titlePrefix} - cards`,
    [page],
    opts.listClass,
    opts.itemClass,
    "title",
    {
      icon: { sel: `.${opts.iconClass} i`, attr: "class", label: "Icon class", type: "text" },
      title: { sel: "h3", label: "Title", type: "text" },
      text: { sel: "p", label: "Description", type: "textarea" },
    }
  );

  const points = collection(
    `${keyPrefix}-points`,
    `${titlePrefix} - highlights`,
    [page],
    opts.pointsClass,
    opts.pointClass,
    "text",
    {
      text: { sel: "@", label: "Highlight", type: "text" },
    }
  );

  return { scalars, collections: [items, points] };
}

const EXTRA_SCALARS = [
  /* ---------------------------------------------- research/blog.html */
  ...scalarGroup("/research/blog.html", "blog", "Blog", [
    ["hero-label", ".blog-page-label", "Hero label", "text"],
    ["hero-heading", ".blog-hero h1", "Hero heading"],
    ["hero-intro", ".blog-hero-intro", "Hero intro"],
    ["submission-intro", ".blog-submission-section .submission-intro", "Submission intro"],
    ["closing-text", ".blog-final-section p", "Closing line"],
  ]),
  ...paragraphScalars("/research/blog.html", "blog-about", "Blog - about", "#about > p", 4),

  /* ------------------------------------------- research/journal.html */
  ...scalarGroup("/research/journal.html", "journal", "Journal", [
    ["hero-label", ".journal-hero-content .journal-eyebrow", "Hero label", "text"],
    ["hero-heading", ".journal-hero-content h1", "Hero heading"],
    ["hero-intro", ".journal-hero-content p", "Hero intro"],
    ["identity-paragraph-1", "#journal-identity .journal-identity-text p:nth-of-type(1)", "Identity paragraph 1"],
    ["identity-paragraph-2", "#journal-identity .journal-identity-text p:nth-of-type(2)", "Identity paragraph 2"],
    ["board-intro", ".journal-section-header p", "Editorial board intro"],
    ["submission-intro", "#submission-guidelines .submission-heading p", "Submission intro"],
    ["ethics-paragraph-1", "#publication-ethics .ethics-content p:nth-of-type(1)", "Ethics paragraph 1"],
    ["ethics-paragraph-2", "#publication-ethics .ethics-content p:nth-of-type(2)", "Ethics paragraph 2"],
    ["current-issue-intro", "#current-issue .journal-info-panel > div:first-child > p", "Current issue intro"],
    ["current-issue-note", "#current-issue .issue-status p", "Current issue status note"],
    ["archive-title", "#archive .journal-archive-card h3", "Archive card title", "text"],
    ["archive-text", "#archive .journal-archive-card p", "Archive card text"],
  ]),

  /* ------------------------------------- research/conference-proceedings.html
     Nothing to extract: the file is an unstyled nav-dropdown fragment with no
     headings, paragraphs or cards (see docs/AUDIT.md §1.2). */

  /* ------------------------------- forms/call-for-papers.html */
  ...scalarGroup("/forms/call-for-papers.html", "cfp", "Call for papers", [
    ["hero-label", ".cfp-eyebrow", "Hero label", "text"],
    ["hero-heading", ".cfp-hero h1", "Hero heading"],
    ["hero-intro", ".cfp-hero p", "Hero intro"],
  ]),

  /* ------------------------------------------------ pages/Founder.html */
  ...aboutTemplateScalars("/pages/Founder.html", "founder", "Founder", {
    paragraphs: 5,
    profileDetails: false,
    signature: true,
  }),

  /* ------------------------------------------------ pages/mission.html */
  ...aboutTemplateScalars("/pages/mission.html", "mission", "Mission", {
    paragraphs: 2,
    profileDetails: true,
    signature: false,
  }),

  /* -------------------------------------------------- pages/vision.html */
  ...aboutTemplateScalars("/pages/vision.html", "vision", "Vision", {
    paragraphs: 2,
    profileDetails: true,
    signature: false,
  }),

  /* ---------------------------------- pages/Strategic-Objectives.html */
  ...aboutTemplateScalars("/pages/Strategic-Objectives.html", "objectives", "Strategic objectives", {
    paragraphs: 2,
    profileDetails: true,
    signature: false,
  }),

  /* -------------------------------------------------- pages/about.html */
  ...scalarGroup("/pages/about.html", "about", "About", [
    ["hero-label", ".about-hero-content .about-eyebrow", "Hero label", "text"],
    ["hero-heading", ".about-hero-content h1", "Hero heading"],
    ["hero-intro", ".about-hero-content p", "Hero intro"],
    ["hero-line", ".about-hero-line small", "Hero line", "text"],
    ["who-heading", "#who-we-are h2", "Who we are heading", "text"],
    ["approach-heading", ".about-approach h2", "Approach heading", "text"],
    ["focus-heading", ".about-focus-section h2", "Focus heading", "text"],
    ["focus-text", ".about-focus-section p", "Focus intro"],
    ["network-heading", ".about-network h2", "Network heading", "text"],
    ["network-text", ".about-network p", "Network intro"],
  ]),
  ...paragraphScalars(
    "/pages/about.html",
    "about-who",
    "About - who we are",
    "#who-we-are .about-who-text p",
    4
  ),

  /* ------------------------------------------ get-involved/index.html */
  ...scalarGroup("/get-involved/index.html", "get-involved", "Get involved", [
    ["hero-label", ".involved-label", "Hero label", "text"],
    ["hero-heading", ".involved-hero h1", "Hero heading"],
    ["hero-intro", ".involved-hero-text", "Hero intro"],
    ["opportunities-eyebrow", ".involved-content > .section-intro .eyebrow", "Opportunities eyebrow", "text"],
    ["opportunities-heading", ".involved-content > .section-intro h2", "Opportunities heading", "text"],
    ["opportunities-intro", ".involved-content > .section-intro p", "Opportunities intro"],
    ["how-eyebrow", ".how-section .section-intro .eyebrow", "How it works eyebrow", "text"],
    ["how-heading", ".how-section .section-intro h2", "How it works heading", "text"],
    ["how-intro", ".how-section .section-intro p", "How it works intro"],
    ["cta-eyebrow", ".involved-cta .eyebrow", "Call to action eyebrow", "text"],
    ["cta-heading", ".involved-cta h2", "Call to action heading", "text"],
    ["cta-text", ".involved-cta p", "Call to action text"],
  ]),

  /* --------------------------------------------- contact.html */
  ...scalarGroup("/contact.html", "contact", "Contact", [
    ["hero-label", ".contact-badge", "Hero label", "text"],
    ["hero-heading", ".contact-hero-inner h1", "Hero heading"],
    ["hero-intro", ".contact-hero-inner p", "Hero intro"],
  ]),

  /* --------------------------------------- media/gallery.html */
  ...scalarGroup("/media/gallery.html", "gallery", "Gallery", [
    ["hero-label", ".media-gallery-eyebrow", "Hero label", "text"],
    ["hero-heading", ".media-gallery-hero h1", "Hero heading"],
    ["hero-intro", ".media-gallery-hero p", "Hero intro"],
  ]),

  /* ----------------------------------- media/promo-video.html */
  ...scalarGroup("/media/promo-video.html", "promo-video", "Promo video", [
    ["hero-label", ".section-label", "Section label", "text"],
    ["hero-heading", ".section-header h1", "Heading"],
    ["hero-intro", ".section-header p", "Intro"],
  ]),
];

const INVOLVED_SUBPAGES = [
  {
    page: "/get-involved/become-a-member.html",
    keyPrefix: "member",
    titlePrefix: "Membership",
    opts: {
      labelClass: "member-label",
      heroClass: "member-hero",
      textClass: "member-hero-text",
      infoClass: "member-info",
      formHeaderClass: "form-header",
      listClass: ".benefit-list",
      itemClass: ".benefit-item",
      iconClass: "benefit-icon",
      pointsClass: ".member-visual-points",
      pointClass: ".member-point",
    },
  },
  {
    page: "/get-involved/campus-fellow.html",
    keyPrefix: "fellow",
    titlePrefix: "Campus fellow",
    opts: {
      labelClass: "fellow-label",
      heroClass: "fellow-hero",
      textClass: "fellow-hero-text",
      infoClass: "fellow-info",
      formHeaderClass: "fellow-form-header",
      listClass: ".fellow-list",
      itemClass: ".fellow-item",
      iconClass: "fellow-item-icon",
      pointsClass: ".fellow-points",
      pointClass: ".fellow-point",
    },
  },
  {
    page: "/get-involved/internship-programme.html",
    keyPrefix: "internship",
    titlePrefix: "Internship",
    opts: {
      labelClass: "internship-label",
      heroClass: "internship-hero",
      textClass: "internship-hero-text",
      infoClass: "internship-info",
      formHeaderClass: "internship-form-header",
      listClass: ".internship-list",
      itemClass: ".internship-item",
      iconClass: "internship-item-icon",
      pointsClass: ".internship-points",
      pointClass: ".internship-point",
    },
  },
  {
    page: "/get-involved/partner-with-us.html",
    keyPrefix: "partner",
    titlePrefix: "Partnership",
    opts: {
      labelClass: "partner-label",
      heroClass: "partner-hero",
      textClass: "partner-hero-text",
      infoClass: "partner-info",
      formHeaderClass: "partner-form-header",
      listClass: ".partner-list",
      itemClass: ".partner-item",
      iconClass: "partner-item-icon",
      pointsClass: ".partner-points",
      pointClass: ".partner-point",
    },
  },
  {
    page: "/get-involved/volunteer-programme.html",
    keyPrefix: "volunteer",
    titlePrefix: "Volunteer",
    opts: {
      labelClass: "volunteer-label",
      heroClass: "volunteer-hero",
      textClass: "volunteer-hero-text",
      infoClass: "volunteer-info",
      formHeaderClass: "volunteer-form-header",
      listClass: ".volunteer-list",
      itemClass: ".volunteer-item",
      iconClass: "volunteer-item-icon",
      pointsClass: ".volunteer-points",
      pointClass: ".volunteer-point",
    },
  },
];

const EXTRA_COLLECTIONS = [
  /* ------------------------------------------- research/blog.html */
  collection("blog-themes", "Blog - themes of interest", ["/research/blog.html"],
    ".blog-theme-grid", ".blog-theme-card", "text", {
      icon: { sel: "i", attr: "class", label: "Icon class", type: "text" },
      text: { sel: "p", label: "Theme", type: "textarea" },
    }),
  collection("blog-contributors", "Blog - who may submit", ["/research/blog.html"],
    ".blog-submit-grid", ".blog-submit-card", "text", {
      icon: { sel: "i", attr: "class", label: "Icon class", type: "text" },
      text: { sel: "span", label: "Contributor", type: "text" },
    }),
  collection("blog-guidelines", "Blog - preparing your blog", ["/research/blog.html"],
    ".blog-guideline-list", ".blog-guideline-item", "title", {
      icon: { sel: "i", attr: "class", label: "Icon class", type: "text" },
      title: { sel: "strong", label: "Title", type: "text" },
      text: { sel: "p", label: "Description", type: "textarea" },
    }),
  collection("blog-editorial", "Blog - editorial team", ["/research/blog.html"],
    "#editorial-team", ".editorial-group", "name", {
      role: { sel: ".editorial-group-title h3", label: "Group", type: "text" },
      photo: { sel: ".editorial-placeholder img", attr: "src", label: "Photo", type: "image" },
      photoAlt: { sel: ".editorial-placeholder img", attr: "alt", label: "Photo alt text", type: "text" },
      label: { sel: ".editorial-placeholder span", label: "Role label", type: "text" },
      name: { sel: ".editorial-placeholder h3", label: "Name", type: "text" },
      affiliation: { sel: ".editorial-placeholder p", label: "Affiliation", type: "textarea" },
    }),

  /* ---------------------------------------- research/journal.html */
  collection("journal-leaders", "Journal - advisors", ["/research/journal.html"],
    "#editorial-board .journal-container", ".journal-leader-card", "name", {
      photo: { sel: ".journal-person-photo img", attr: "src", label: "Photo", type: "image" },
      photoAlt: { sel: ".journal-person-photo img", attr: "alt", label: "Photo alt text", type: "text" },
      role: { sel: ".person-role", label: "Role", type: "text" },
      name: { sel: "h3", label: "Name", type: "text" },
      bio: { sel: ".journal-person-content p", label: "Bio", type: "textarea" },
      country: { sel: ".person-country", label: "Country", type: "text" },
    }),
  collection("journal-editors", "Journal - editorial board", ["/research/journal.html"],
    ".journal-editors-grid", ".journal-editor-card", "name", {
      country: { sel: ".editor-card-top span", label: "Country", type: "text" },
      photo: { sel: ".journal-editor-photo img", attr: "src", label: "Photo", type: "image" },
      photoAlt: { sel: ".journal-editor-photo img", attr: "alt", label: "Photo alt text", type: "text" },
      name: { sel: "h3", label: "Name", type: "text" },
      affiliation: { sel: "p", label: "Affiliation", type: "textarea" },
    }),
  collection("journal-submission", "Journal - submission guidelines", ["/research/journal.html"],
    "#submission-guidelines .submission-list", ".submission-item", "text", {
      text: { sel: "p", label: "Guideline", type: "textarea" },
    }),

  /* ------------------------------ forms/call-for-papers.html */
  collection("cfp-themes", "Call for papers - themes", ["/forms/call-for-papers.html"],
    ".cfp-theme-list", ".cfp-theme-item", "text", {
      text: { sel: "p", label: "Theme", type: "textarea" },
    }),
  collection("cfp-guidelines", "Call for papers - guidelines", ["/forms/call-for-papers.html"],
    ".cfp-guidelines", ".cfp-guideline", "title", {
      title: { sel: "strong", label: "Title", type: "text" },
      text: { sel: "p", label: "Description", type: "textarea" },
    }),
  collection("cfp-timeline", "Call for papers - timeline", ["/forms/call-for-papers.html"],
    ".cfp-timeline", ".cfp-date", "label", {
      icon: { sel: ".cfp-date-marker i", attr: "class", label: "Icon class", type: "text" },
      label: { sel: ".cfp-date-content span", label: "Milestone", type: "text" },
      date: { sel: ".cfp-date-content strong", label: "Date", type: "text" },
      time: { sel: ".cfp-date-content small", label: "Time note", type: "text" },
    }),

  /* ------------------- pages/mission|vision|Strategic-Objectives */
  collection("mission-areas", "Mission - focus areas", ["/pages/mission.html"],
    ".founder-short-bio", ".bio-item", "label", {
      icon: { sel: ".bio-icon i", attr: "class", label: "Icon class", type: "text" },
      label: { sel: ".bio-label", label: "Label", type: "text" },
      text: { sel: "p", label: "Description", type: "textarea" },
    }),
  collection("vision-areas", "Vision - pillars", ["/pages/vision.html"],
    ".founder-short-bio", ".bio-item", "label", {
      icon: { sel: ".bio-icon i", attr: "class", label: "Icon class", type: "text" },
      label: { sel: ".bio-label", label: "Label", type: "text" },
      text: { sel: "p", label: "Description", type: "textarea" },
    }),
  collection("objectives-areas", "Strategic objectives - objectives", ["/pages/Strategic-Objectives.html"],
    ".founder-short-bio", ".bio-item", "label", {
      icon: { sel: ".bio-icon i", attr: "class", label: "Icon class", type: "text" },
      label: { sel: ".bio-label", label: "Label", type: "text" },
      text: { sel: "p", label: "Description", type: "textarea" },
    }),

  /* -------------------------------------------------- pages/about.html */
  collection("about-focus-cards", "About - focus cards", ["/pages/about.html"],
    ".about-focus", ".about-focus-card", "title", {
      number: { sel: ".about-focus-number", label: "Number", type: "text" },
      label: { sel: ".about-focus-label", label: "Label", type: "text" },
      title: { sel: "h3", label: "Title", type: "text" },
      text: { sel: "p", label: "Description", type: "textarea" },
    }),
  collection("about-approach-cards", "About - approach cards", ["/pages/about.html"],
    ".about-approach-grid", ".about-approach-card", "title", {
      icon: { sel: ".about-approach-icon i", attr: "class", label: "Icon class", type: "text" },
      number: { sel: "span", label: "Number", type: "text" },
      title: { sel: "h3", label: "Title", type: "text" },
      text: { sel: "p", label: "Description", type: "textarea" },
    }),
  collection("about-focus-rows", "About - focus list", ["/pages/about.html"],
    ".about-focus-list", ".about-focus-row", "title", {
      number: { sel: "span", label: "Number", type: "text" },
      title: { sel: "strong", label: "Label", type: "text" },
    }),

  /* ------------------------------------------ get-involved/index.html */
  collection("get-involved-opportunities", "Get involved - opportunities", ["/get-involved/index.html"],
    ".opportunities-grid", ".opportunity-card", "title", {
      icon: { sel: ".opportunity-icon i", attr: "class", label: "Icon class", type: "text" },
      number: { sel: ".opportunity-number", label: "Number", type: "text" },
      title: { sel: "h3", label: "Title", type: "text" },
      text: { sel: "p", label: "Description", type: "textarea" },
      linkText: { sel: ".opportunity-link", label: "Link text", type: "text" },
      linkUrl: { sel: ".opportunity-link", attr: "href", label: "Link URL", type: "url" },
    }),
  collection("get-involved-how", "Get involved - how it works", ["/get-involved/index.html"],
    ".how-grid", ".how-card", "title", {
      number: { sel: ".how-number", label: "Number", type: "text" },
      title: { sel: "h3", label: "Title", type: "text" },
      text: { sel: "p", label: "Description", type: "textarea" },
    }),

  /* --------------------------------------------- contact.html */
  collection("contact-details", "Contact - details", ["/contact.html"],
    ".contact-details", ".contact-detail", "label", {
      icon: { sel: ".contact-detail-icon i", attr: "class", label: "Icon class", type: "text" },
      label: { sel: "h3", label: "Label", type: "text" },
      value: { sel: "p", label: "Value", type: "textarea" },
    }),

  /* -------------------------------------- media/promo-video.html */
  collection("promo-video-cards", "Promo video - videos", ["/media/promo-video.html"],
    ".promo-video-grid", ".promo-video-card", "title", {
      videoUrl: { sel: ".video-frame iframe", attr: "src", label: "Embed URL", type: "url" },
      videoTitle: { sel: ".video-frame iframe", attr: "title", label: "Embed title", type: "text" },
      eyebrow: { sel: "div:nth-child(2) > span", label: "Eyebrow", type: "text" },
      title: { sel: "div:nth-child(2) > h2", label: "Title", type: "text" },
      description: { sel: "div:nth-child(2) > p", label: "Description", type: "textarea" },
    }),
];

for (const entry of INVOLVED_SUBPAGES) {
  const parts = involvedSubpage(entry.page, entry.keyPrefix, entry.titlePrefix, entry.opts);
  EXTRA_SCALARS.push(...parts.scalars);
  EXTRA_COLLECTIONS.push(...parts.collections);
}

module.exports = {
  SCALARS: SCALARS.concat(EXTRA_SCALARS),
  HTML_COLLECTIONS: HTML_COLLECTIONS.concat(EXTRA_COLLECTIONS),
  JS_COLLECTIONS,
};
