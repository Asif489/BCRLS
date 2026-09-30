/* =========================================================
   BCRLS EVENTS — shared upcoming + archive event system
========================================================= */

const upcomingEvents = [
    {
        id: 4,
        type: "CERTIFICATE COURSE",
        title: "Certificate Course on Refugee Law and Statelessness: Foundation to Practice",
        date: "October 2026 – December 2026",
        location: "Hybrid",
        image: "../assets/events/certificate.jpeg",
        shortDescription: "BCRLS launches its inaugural Certificate Course on Refugee Law and Statelessness, bringing together international scholars and practitioners for 20 lectures from October to December 2026.",
        description: "The Bangladesh Center for Refugee Law Studies (BCRLS) is delighted to announce its first-ever Certificate Course on Refugee Law and Statelessness: Foundation to Practice, scheduled to be conducted from October to December 2026. This flagship program is designed to provide participants with a comprehensive understanding of refugee law, statelessness, international protection frameworks, and emerging global challenges. Bringing together leading academics and practitioners from across the world, the course will offer both theoretical foundations and practical perspectives on contemporary refugee issues. The program will comprise 20 lectures delivered by distinguished scholars and experts from Germany, the United States, the United Kingdom, Australia, Canada, and beyond, creating a unique platform for global learning and engagement.",
        speakers: ["International scholars and practitioners from Germany, the United States, the United Kingdom, Australia, Canada, and beyond."],
        programme: "20 online lectures with interactive activities and online assessment. The course module covers 20 substantive topics, a 12–14 week structure, comparative refugee crises, and a 100-mark online final examination.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
        moduleLink: "../assets/events/BCRLS_Certificate_Course_Module.pdf",
        registrationLink: "https://docs.google.com/forms/d/1VrbHgG0045hvt0jbhkkIp1y5uTFRiRnbDLNKWZYFoQs/viewform?chromeless=1&edit_requested=true"
    }
];

const archiveTitles = [
    [1,"LECTURE SERIES","BCRLS Inaugural Lecture Series"],
    [2,"ACADEMIC SESSION","Session with Professor James C. Hathaway"],
    [3,"LECTURE","Lecture with Kate Ogg"],
    [4,"WORKSHOP","Workshop on Interdisciplinary Legal Writing"],
    [5,"WORKSHOP","Workshop on Refugee Law Research"],
    [6,"ACADEMIC SESSION","Session on Temporary Protection"],
    [7,"Q&A SESSION","Q&A with Jane McAdam"],
    [8,"ACADEMIC SESSION","Session with Nafees Ahmad"],
    [9,"FIELD VISIT","Field Visit to Bhasan Char"],
    [10,"SEMINAR","Seminar on Foundations of Refugee Law"],
    [11,"SPECIAL LECTURE","Asylum Under International Refugee Law and in South Asia"],
    [12,"ACADEMIC DIALOGUE","Academic Dialogue on the Rohingya Genocide"],
    [13,"CONFERENCE","ICERPASA 2026"]
];

const archiveEnhancements = {
    14: {
        type: "PANEL DISCUSSION",
        title: "From Norms to Ground Realities: Citizenship, Justice and the Rohingya Integration Dilemma",
        date: "University of Dhaka",
        location: "Centre for Advanced Studies in Humanities, Theatre Hall, University of Dhaka",
        description: "BCRLS organized a panel discussion bringing together academics, researchers, students and practitioners to critically engage with refugee protection, citizenship, justice and the Rohingya integration dilemma in Bangladesh. The discussion focused on practical and policy-oriented pathways for protection, dignified and regulated livelihood opportunities, burden-sharing, and conditions for safe, voluntary and sustainable repatriation.",
        speakers: [
            "Mr. Md Abu Bakar Siddique — discussion on refugee protection in non-signatory states",
            "Mr. Nafiz Ahmed — citizenship law and local integration of Rohingya refugees",
            "Mr. Riad Mahmud — Session Moderator, Director (Admin & Finance), BCRLS",
            "Ms. Nabila Farhin — Opening Remarks, Director of Programs, BCRLS",
            "Mr. Sakhawat Sajjat Sejan — Closing Remarks, Executive Director, BCRLS"
        ],
        programme: "Panel discussion connecting legal norms with ground realities, citizenship, justice, livelihood opportunities, burden-sharing and sustainable repatriation.",
        gallery: [
            "../assets/events/du_1.jpeg",
            "../assets/events/du_02.jpeg",
            "../assets/events/du_03.jpeg"
        ]
    },
    15: {
        type: "SEMINAR",
        title: "Administrative and Judicial Governance of Refugees: Protection, Non-Refoulement, Arrest, Detention and Administrative Challenges in Bangladesh",
        date: "Canadian University of Bangladesh",
        location: "Department of Law, Canadian University of Bangladesh",
        description: "BCRLS, in collaboration with the Department of Law, Canadian University of Bangladesh, organized a seminar on refugee protection, non-refoulement, arrest, detention and administrative challenges within Bangladesh's legal framework. The session featured meaningful academic discussion with participation from more than 50 participants.",
        speakers: [
            "Dr. Md. Rizwanul Islam — Chief Guest",
            "Ahmad Ibrahim — Guest, Advisor, Displacement and Climate Justice, BLAST",
            "Mohammad Sunzad Sheikh — Special Guest, Assistant Professor & Head, Department of Law, Canadian University of Bangladesh",
            "Md. Riad Mahmud — Session Moderator, Senior Lecturer, East West University"
        ],
        programme: "Seminar discussion on refugee protection, non-refoulement, detention and administrative governance in Bangladesh.",
        gallery: [
            "../assets/events/canadian_uni_1.jpeg",
            "../assets/events/canadian_uni_2.jpeg"
        ]
    },
    16: {
        type: "ONLINE LECTURE SERIES",
        title: "BCRLS Online Lecture Series: Edges of Belonging: Migration, Statelessness and Refugeehood",
        date: "11 April – 22 May 2026",
        location: "Online",
        description: "At the intersection of law, identity and displacement, this lecture series brings together leading global scholars to critically engage with the evolving landscape of migration, statelessness and refugee protection, exploring the legal, political and human dimensions of belonging.",
        speakers: [
            "Dr. Nafees Ahmad",
            "Dr. Jobair Alam",
            "Rutaban Yameen",
            "Susan Kneebone",
            "Dr. Laura Smith-Khan",
            "Dr. David Cantor",
            "Dr. Jaya Ramji-Nogales",
            "Dr. Kirsten McConnachie"
        ],
        programme: "Eight scheduled lectures covering IDPs and international refugee law; UK responses to refugees and stateless persons; foundations of international refugee law; Article 1C; refugee credibility assessments; war refugees and international humanitarian law; global migration law and the Global South; and humanitarian access to IDPs.",
        gallery: [
            "../assets/events/online_01.jpeg",
            "../assets/events/online_02.jpeg",
            "../assets/events/online_03.jpeg"
        ]
    }
};

function getArchiveEventsFromPage() {
    const cards = [...document.querySelectorAll("#event-archive .event-card")];
    return cards.map((card, i) => {
        const id = Number(card.dataset.eventId || i + 1);
        const title = card.querySelector(".event-card-title")?.textContent.trim() || `BCRLS Event ${id}`;
        const type = card.querySelector(".event-card-type")?.textContent.trim() || "ARCHIVE";
        const img = card.querySelector(".event-card-image img")?.getAttribute("src") || "";
        const meta = [...card.querySelectorAll(".event-card-meta span")].map(x => x.textContent.replace(/\s+/g," ").trim()).filter(Boolean);
        const description = card.querySelector(".event-card-description")?.textContent.replace(/\s+/g," ").trim() || "Archived BCRLS event.";
        const extra = archiveEnhancements[id] || {};
        return {
            id,
            type: extra.type || type,
            title: extra.title || title,
            date: extra.date || meta[0] || "Past Event",
            location: extra.location || meta[1] || "BCRLS",
            image: extra.gallery?.[0] || img,
            gallery: extra.gallery || (img ? [img] : []),
            shortDescription: extra.description || description,
            description: extra.description || description,
            speakers: extra.speakers || [],
            programme: extra.programme || "Programme information is available in the event materials.",
            organizer: extra.organizer || "Bangladesh Center for Refugee Law Studies (BCRLS)",
            card
        };
    });
}


function escapeText(value) {
    return String(value || "").replace(/[&<>"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[ch]));
}

function createEventCard(event) {
    const article = document.createElement("article");
    article.className = "event-card";
    article.dataset.eventId = event.id;
    article.innerHTML = `
        <div class="event-card-image">
            <img src="${event.image}" alt="${escapeText(event.title)}" loading="lazy">
            <div class="event-image-fallback" aria-hidden="true"><i class="fa-regular fa-calendar"></i></div>
        </div>
        <div class="event-card-body">
            <span class="event-card-type">${escapeText(event.type)}</span>
            <h3 class="event-card-title">${escapeText(event.title)}</h3>
            <div class="event-card-meta">
                <span><i class="fa-regular fa-calendar"></i>${escapeText(event.date)}</span>
                <span><i class="fa-solid fa-location-dot"></i>${escapeText(event.location)}</span>
            </div>
            <p class="event-card-description">${escapeText(event.shortDescription)}</p>
            <div class="event-card-actions">
                <button type="button" class="event-details-btn" data-event-id="${event.id}"><i class="fa-regular fa-circle-info"></i> Event Details <i class="fa-solid fa-arrow-right"></i></button>
                ${event.moduleLink ? `<a class="event-module-btn" href="${event.moduleLink}" target="_blank" rel="noopener"><i class="fa-regular fa-file-pdf"></i> Course Module</a>` : ""}
                ${event.registrationLink ? `<a class="event-register-btn" href="${event.registrationLink}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Registration</a>` : ""}
            </div>
        </div>`;
    const img = article.querySelector("img");
    const fallback = article.querySelector(".event-image-fallback");
    img.addEventListener("error", () => { img.style.display="none"; fallback.classList.add("show"); });
    article.querySelector(".event-details-btn").addEventListener("click", () => openEventDetails(event));
    return article;
}

function loadUpcomingEvents() {
    const grid = document.getElementById("upcomingEventsGrid");
    if (!grid) return;
    grid.innerHTML = "";
    upcomingEvents.forEach(event => grid.appendChild(createEventCard(event)));
}

const archiveDateByTitle = {
    "BCRLS Inaugural Lecture Series": "2025-10-07",
    "Session with Professor James C. Hathaway": "2025-10-22",
    "Lecture with Kate Ogg": "2025-11-27",
    "Workshop on Interdisciplinary Legal Writing": "2025-12-05",
    "Workshop on Refugee Law Research": "2025-12-13",
    "Session on Temporary Protection": "2025-01-14",
    "Q&A with Jane McAdam": "2026-02-25",
    "Session with Nafees Ahmad": "2026-02-21",
    "Field Visit to Bhasan Char": "2025-11-24",
    "Seminar on Foundations of Refugee Law": "2026-01-19",
    "Asylum Under International Refugee Law and in South Asia": "2026-04-10",
    "Academic Dialogue on the Rohingya Genocide": "2026-08-25",
    "ICERPASA 2026": "2026-06-27"
};

function sortArchiveCardsByDate() {
    const grid = document.querySelector("#event-archive .events-grid");
    if (!grid) return;
    const cards = [...grid.querySelectorAll(":scope > .event-card")];
    cards.forEach((card, index) => {
        const title = card.querySelector(".event-card-title")?.textContent.replace(/\s+/g, " ").trim() || "";
        let iso = archiveDateByTitle[title] || "";
        if (!iso) {
            // Handle the multiline title stored in the HTML.
            const normalized = title.replace(/\s+/g, " ").trim();
            iso = Object.entries(archiveDateByTitle).find(([key]) => key.replace(/\s+/g, " ").trim() === normalized)?.[1] || "";
        }
        card.dataset.eventDate = iso;
        card.dataset.archiveOrder = String(index);
        const meta = card.querySelector(".event-card-meta span");
        if (iso && meta) {
            const d = new Date(`${iso}T00:00:00`);
            const formatted = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
            meta.innerHTML = `<i class="fa-regular fa-calendar"></i>${formatted}`;
        }
    });
    cards.sort((a, b) => {
        const da = a.dataset.eventDate || "";
        const db = b.dataset.eventDate || "";
        if (da && db) return db.localeCompare(da); // newest first
        if (da && !db) return -1;
        if (!da && db) return 1;
        return Number(a.dataset.archiveOrder) - Number(b.dataset.archiveOrder);
    });
    cards.forEach(card => grid.appendChild(card));
}

function bindArchiveCards() {
    document.querySelectorAll("#event-archive .event-card-image img").forEach(img => {
        if (img.dataset.fallbackBound) return;
        img.dataset.fallbackBound = "1";
        img.addEventListener("error", () => {
            img.style.display = "none";
            const box = img.parentElement;
            if (box && !box.querySelector(".event-image-fallback")) {
                const fallback = document.createElement("div");
                fallback.className = "event-image-fallback show";
                fallback.innerHTML = '<i class="fa-regular fa-calendar"></i><span>BCRLS Event</span>';
                box.appendChild(fallback);
            }
        });
    });
    const events = getArchiveEventsFromPage();
    events.forEach(event => {
        const button = event.card.querySelector(".event-details-btn");
        if (!button) return;
        button.dataset.eventId = event.id;
        button.addEventListener("click", () => openEventDetails(event));
        if (!event.card.querySelector(".event-card-actions")) {
            const actions = document.createElement("div");
            actions.className = "event-card-actions";
            actions.appendChild(button);
            event.card.querySelector(".event-card-body").appendChild(actions);
        }
    });
    return events;
}

function openEventDetails(event) {
    const modal = document.getElementById("eventModal");
    if (!modal) return;
    const set = (id, value) => { const el=document.getElementById(id); if(el) el.textContent=value||""; };
    const gallery = event.gallery?.length ? event.gallery : (event.image ? [event.image] : []);
    const image=document.getElementById("eventModalImage");
    if(image){ image.src=gallery[0]||""; image.alt=event.title||"BCRLS Event"; }

    const galleryWrap = document.getElementById("eventModalGallery");
    if (galleryWrap) {
        galleryWrap.innerHTML = "";
        if (gallery.length > 1) {
            gallery.forEach((src, index) => {
                const thumb = document.createElement("button");
                thumb.type = "button";
                thumb.className = "event-gallery-thumb" + (index === 0 ? " active" : "");
                thumb.innerHTML = `<img src="${src}" alt="${escapeText(event.title)} image ${index + 1}">`;
                thumb.addEventListener("click", () => {
                    image.src = src;
                    galleryWrap.querySelectorAll(".event-gallery-thumb").forEach(x => x.classList.remove("active"));
                    thumb.classList.add("active");
                });
                galleryWrap.appendChild(thumb);
            });
            galleryWrap.style.display = "grid";
        } else {
            galleryWrap.style.display = "none";
        }
    }

    set("eventModalType", event.type); set("eventModalTitle", event.title); set("eventModalDate", event.date); set("eventModalLocation", event.location); set("eventModalDescription", event.description);

    const speakers=document.getElementById("eventModalSpeakers"), sw=document.getElementById("eventModalSpeakersWrapper");
    if(sw && speakers){ speakers.innerHTML=""; if(event.speakers?.length){ sw.style.display="block"; event.speakers.forEach(x=>{const li=document.createElement("li");li.textContent=x;speakers.appendChild(li);}); } else sw.style.display="none"; }
    const pw=document.getElementById("eventModalProgrammeWrapper"), p=document.getElementById("eventModalProgramme"); if(pw&&p){pw.style.display=event.programme?"block":"none";p.textContent=event.programme||"";}
    const ow=document.getElementById("eventModalOrganizerWrapper"), o=document.getElementById("eventModalOrganizer"); if(ow&&o){ow.style.display=event.organizer?"block":"none";o.textContent=event.organizer||"";}

    const actions=document.getElementById("eventModalActions");
    if(actions){
        actions.innerHTML = "";
        if(event.moduleLink) actions.innerHTML += `<a class="event-module-btn" href="${event.moduleLink}" target="_blank" rel="noopener"><i class="fa-regular fa-file-pdf"></i> View Course Module</a>`;
        if(event.registrationLink) actions.innerHTML += `<a class="event-register-btn" href="${event.registrationLink}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Registration</a>`;
        actions.style.display = actions.innerHTML ? "flex" : "none";
    }

    modal.classList.add("active"); modal.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden";
}

function closeEventDetails(){const modal=document.getElementById("eventModal");if(!modal)return;modal.classList.remove("active");modal.setAttribute("aria-hidden","true");document.body.style.overflow="";}

function syncHomeEventArchive(){
    const strip=document.querySelector("#event-archive .gallery-strip");
    if(!strip) return;
    const source=[...document.querySelectorAll("#event-archive .event-card")];
    if(!source.length) return;
    // Only replace the old static gallery with the same archive image sources when available.
    strip.innerHTML=source.slice(0,4).map((card,i)=>{
        const img=card.querySelector("img"); const title=card.querySelector(".event-card-title")?.textContent.trim()||`BCRLS Event ${i+1}`;
        const src=img?.getAttribute("src")||"";
        return `<div class="gallery-item"><img src="${src}" alt="${escapeText(title)}" loading="lazy"><span class="gallery-item-label">${escapeText(title)}</span></div>`;
    }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    loadUpcomingEvents();
    sortArchiveCardsByDate();
    const archiveEvents = bindArchiveCards();
    if (document.querySelector(".home-event-archive-grid") && archiveEvents.length) syncHomeEventArchive();
    const close=document.getElementById("eventModalClose"), overlay=document.querySelector(".event-modal-overlay");
    if(close) close.addEventListener("click",closeEventDetails); if(overlay) overlay.addEventListener("click",closeEventDetails);
    document.addEventListener("keydown",e=>{if(e.key==="Escape")closeEventDetails();});
});
