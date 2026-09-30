/* =========================================================
   BCRLS EVENTS — shared upcoming + archive event system
========================================================= */

const upcomingEvents = [
    {
        id: 4,
        type: "CERTIFICATE COURSE",
        title: "Certificate Course on Refugee Law and Statelessness: Foundation to Practice",
        date: "October–December 2026",
        location: "Hybrid — BCRLS / Online",
        image: "../assets/events/certificate.jpeg",
        images: ["../assets/events/certificate.jpeg"],
        shortDescription: "BCRLS inaugural certificate course on refugee law and statelessness, delivered through 20 substantive online lectures with Bangladesh/Rohingya and comparative case studies.",
        description: "BCRLS Launches Its Inaugural Certificate Course on Refugee Law and Statelessness: Foundation to Practice. The course is scheduled for October–December 2026 in hybrid format and includes 20 substantive lectures, interactive activities and a 100-mark online final examination.",
        speakers: ["International faculty and resource persons — see the course materials"],
        programme: "20 substantive topics covering refugee law, statelessness, international protection, displacement, legal frameworks and comparative crises. The Bangladesh/Rohingya situation is used as a primary case study.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
        registration: "https://docs.google.com/forms/d/1VrbHgG0045hvt0jbhkkIp1y5uTFRiRnbDLNKWZYFoQs/viewform?chromeless=1&edit_requested=true",
        module: "../assets/docs/BCRLS Module.pdf"
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


const archiveEventDetails = {
    1: {
        description: "The BCRLS inaugural lecture series featured three distinguished speakers addressing ethnography of refugees, global burden-sharing, and legal challenges of boat refugees, marking the beginning of BCRLS’s academic journey.",
        programme: "A three-speaker inaugural lecture series focused on refugee ethnography, global burden-sharing and the legal challenges faced by boat refugees.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
        speakers: ["Professor Dr. Nasir Uddin — Department of Anthropology, University of Chittagong", "Dr. Hassan Faruk Al Imran — Associate Professor (Law), Independent University Bangladesh", "Professor Dr. Rakiba Nabi — Chairman, Department of Law, University of Chittagong"],
        images: ["../assets/events/inargument.jpeg"]
    },
    2: {
        description: "An exclusive interactive session with Professor James C. Hathaway, focusing on fundamental questions on refugee status, rights, and global protection systems.",
        programme: "Interactive academic discussion on refugee status, refugee rights and global protection systems.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
        speakers: ["Professor James C. Hathaway"],
        images: ["../assets/events/qa_session_james.jpeg"]
    },
    3: {
        description: "A focused discussion on refugee litigation, access to justice, and community sponsorship, highlighting the role of courts and displaced voices in protection frameworks.",
        programme: "Discussion on refugee rights litigation, access to justice and community sponsorship.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
        speakers: ["Professor Kate Ogg"],
        images: ["../assets/events/lecture_series.jpeg"]
    },
    4: {
        description: "Session conducted by Naureen Rahim on “How to Write: IRL and Interdisciplinarity,” providing practical guidance and interdisciplinary research insights.",
        programme: "Practical guidance on writing and interdisciplinary approaches to international refugee law research.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
        speakers: ["Ms. Naureen Rahim — PhD Candidate, University of Oslo"],
        images: ["../assets/events/interdisciplinary.jpeg"]
    },
    5: {
        description: "An academic workshop led by Rutaban Yameen on pursuing research in international refugee law, aimed at strengthening research skills among participants.",
        programme: "Workshop on how to pursue research in international refugee law, with a focus on research skills and refugee-law scholarship.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
        speakers: ["Rutaban Yameen — PhD Candidate, University of New South Wales"],
        images: ["../assets/events/workshop.jpeg"]
    },
    6: {
        description: "Expert lecture by Dr. Meltem İneli Ciğer exploring legal foundations and applications of temporary protection in international refugee law.",
        programme: "Expert lecture and discussion on temporary protection in international refugee law.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
        speakers: ["Dr. Meltem İneli Ciğer — Associate Professor, Süleyman Demirel University; Associate, Migration Policy Centre, European University Institute"],
        images: ["../assets/events/temporary_protection.jpeg"]
    },
    7: {
        description: "An interactive session on climate-induced displacement, addressing legal and humanitarian challenges in the context of climate change.",
        programme: "Q&A and discussion on climate-induced displacement and related legal and humanitarian challenges.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
        speakers: ["Scientia Professor Jane McAdam"],
        images: ["../assets/events/qa_jeny.jpeg"]
    },
    8: {
        description: "An academic session featuring Dr. Nafees Ahmad. The discussion covered climate-induced displacement, statelessness, refugee protection gaps, and the intersection of artificial intelligence with migration governance, contributing to regional discourse on refugee law in South Asia.",
        programme: "Academic discussion on climate-induced displacement, statelessness, refugee protection gaps and AI in migration governance.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
        speakers: ["Dr. Nafees Ahmad — Associate Professor at South Asian University, New Delhi"],
        images: ["../assets/events/south_asia_nafees.jpeg"]
    },
    9: {
        description: "A BCRLS field visit to Bhasan Char conducted as part of the research project “Legal Aspects of Higher Education Access and Livelihood through Income-Generating Activities for the Rohingyas in Bangladesh.” The visit aimed to gather first-hand insights and empirical data on legal and practical challenges surrounding education access and livelihood opportunities for Rohingya refugees.",
        programme: "Field engagement in Bhasan Char focused on education access, livelihood opportunities, empirical research and evidence-based policy analysis.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
        speakers: ["BCRLS Directors and Executive Members"],
        images: ["../assets/events/Field_Visit-2.jpeg", "../assets/events/Field_Vist-1.jpeg"]
    },
    10: {
        description: "On 19 January 2026 at Jagannath University, BCRLS in collaboration with the Department of Law and Land Administration, Jagannath University, hosted the academic seminar “Foundations of Refugee Law: Principles, Protection, and Contemporary Challenges.”",
        programme: "Discussion on core principles of refugee law, evolving protection frameworks and contemporary challenges in refugee protection.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS), in collaboration with the Department of Law and Land Administration, Jagannath University",
        speakers: ["Sakhawat Sajjat Sejan — Speaker", "Honourable Christine Richardson — Chief Guest", "Meftahul Hasan — Special Guest, Assistant Professor, Department of Law, Jagannath University"],
        images: ["../assets/events/Foundations.jpeg"]
    },
    11: {
        description: "BCRLS, in collaboration with the NSU Center for Legal Research (NSU CLR), presented the special lecture “Asylum Under International Refugee Law and in South Asia: A Comparative Analysis.” The programme was held on 10 April 2026 from 10:00 AM to 12:00 PM at the Moot Court Room (NAC 616), North South University.",
        programme: "Comparative examination of asylum law in South Asia within the broader framework of international refugee law and international protection.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS) in collaboration with the NSU Center for Legal Research (NSU CLR)",
        speakers: ["Dr. Simon Behrman — Associate Professor, School of Law, University of Warwick"],
        images: ["../assets/events/Asylum Under International Refugee Law.jpeg"]
    },
    12: {
        description: "BCRLS convened a high-level academic dialogue with Professor Kjell Anderson of the University of Manitoba Law School (Canada), centering on evolving scholarship surrounding the Rohingya genocide. The discussion examined legal recognition, evidentiary challenges and international accountability, situating the Rohingya crisis within the wider theme of “Forgotten Genocides” in South Asia.",
        programme: "Scholarly discussion on the Rohingya genocide, legal recognition, evidentiary challenges and international accountability.",
        organizer: "Bangladesh Center for Refugee Law Studies (BCRLS)",
        speakers: ["Professor Kjell Anderson — University of Manitoba Law School, Canada"],
        images: ["../assets/events/Justice_Accountibi.jpeg"]
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
        const detail = archiveEventDetails[id] || {};
        return {
            id, type, title, date: meta[0] || "Past Event", location: meta[1] || "BCRLS",
            image: img, shortDescription: description,
            description: detail.description || description,
            images: detail.images || (card.dataset.eventImages || img).split("|").map(x => x.trim()).filter(Boolean),
            speakers: detail.speakers || [],
            programme: detail.programme || "Programme information is available in the event materials.",
            organizer: detail.organizer || "Bangladesh Center for Refugee Law Studies (BCRLS)",
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
    if (event.images?.length) article.dataset.eventImages = event.images.join("|");
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
                ${event.module ? `<a class="event-module-btn" href="${event.module}" target="_blank" rel="noopener"><i class="fa-regular fa-file-pdf"></i> Course Module</a>` : ""}
                ${event.registration ? `<a class="event-register-btn" href="${event.registration}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i> Registration</a>` : ""}
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
    "ICERPASA 2026": "2026-06-27",
    "Edges of Belonging: Migration, Statelessness and Refugeehood": "2026-05-22"
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
    const thumbs=document.getElementById("eventModalGalleryThumbs");
    const images=(event.images?.length ? event.images : [event.image]).filter(Boolean);
    if(image){ image.src=images[0]||""; image.alt=event.title||"BCRLS Event"; }
    if(thumbs){
        thumbs.innerHTML="";
        if(images.length>1){
            thumbs.style.display="flex";
            images.forEach((src,i)=>{
                const b=document.createElement("button");
                b.type="button"; b.className="event-modal-thumb"+(i===0?" active":"");
                b.innerHTML=`<img src="${src}" alt="${escapeText(event.title)} photo ${i+1}" loading="lazy">`;
                b.addEventListener("click",()=>{
                    image.src=src;
                    thumbs.querySelectorAll(".event-modal-thumb").forEach(x=>x.classList.remove("active"));
                    b.classList.add("active");
                });
                thumbs.appendChild(b);
            });
        } else thumbs.style.display="none";
    }
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
