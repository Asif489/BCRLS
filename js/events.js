/* =========================================================
   BCRLS EVENTS — shared upcoming + archive event system
========================================================= */

const upcomingEvents = [
    {
        id: 4,
        type: "CERTIFICATE COURSE",
        title: "Certificate Course on Refugee Law and Statelessness: Foundation to Practice",
        date: "Upcoming — Registration Details To Be Announced",
        location: "BCRLS / Online",
        image: "../assets/events/certificate.jpeg",
        shortDescription: "A professional certificate course covering refugee law, statelessness, international protection, displacement and practical legal research.",
        description: "BCRLS will offer a professional certificate course designed for students, researchers, lawyers, development practitioners and others working on refugee law and forced displacement. Course schedule, instructors, fees and registration information will be announced.",
        speakers: ["Course faculty and instructors will be announced"],
        programme: "Course outline and class schedule will be announced.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
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

function getArchiveEventsFromPage() {
    const cards = [...document.querySelectorAll("#event-archive .event-card")];
    return cards.map((card, i) => {
        const id = Number(card.dataset.eventId || i + 1);
        const title = card.querySelector(".event-card-title")?.textContent.trim() || `BCRLS Event ${id}`;
        const type = card.querySelector(".event-card-type")?.textContent.trim() || "ARCHIVE";
        const img = card.querySelector(".event-card-image img")?.getAttribute("src") || "";
        const meta = [...card.querySelectorAll(".event-card-meta span")].map(x => x.textContent.replace(/\s+/g," ").trim()).filter(Boolean);
        const description = card.querySelector(".event-card-description")?.textContent.replace(/\s+/g," ").trim() || "Archived BCRLS event.";
        return {
            id, type, title, date: meta[0] || "Past Event", location: meta[1] || "BCRLS",
            image: img, shortDescription: description, description,
            speakers: [], programme: "Programme information is available in the event materials.",
            organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
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
                <button type="button" class="event-details-btn" data-event-id="${event.id}">Event Details <i class="fa-solid fa-arrow-right"></i></button>
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
    const image=document.getElementById("eventModalImage");
    if(image){ image.src=event.image||""; image.alt=event.title||"BCRLS Event"; }
    set("eventModalType", event.type); set("eventModalTitle", event.title); set("eventModalDate", event.date); set("eventModalLocation", event.location); set("eventModalDescription", event.description);
    const speakers=document.getElementById("eventModalSpeakers"), sw=document.getElementById("eventModalSpeakersWrapper");
    if(sw && speakers){ speakers.innerHTML=""; if(event.speakers?.length){ sw.style.display="block"; event.speakers.forEach(x=>{const li=document.createElement("li");li.textContent=x;speakers.appendChild(li);}); } else sw.style.display="none"; }
    const pw=document.getElementById("eventModalProgrammeWrapper"), p=document.getElementById("eventModalProgramme"); if(pw&&p){pw.style.display=event.programme?"block":"none";p.textContent=event.programme||"";}
    const ow=document.getElementById("eventModalOrganizerWrapper"), o=document.getElementById("eventModalOrganizer"); if(ow&&o){ow.style.display=event.organizer?"block":"none";o.textContent=event.organizer||"";}
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
