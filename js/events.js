/* =========================================================
   BCRLS EVENTS
   events.js
   ========================================================= */


/* =========================================================
   EVENT DATA
   ========================================================= */

const upcomingEvents = [

    {
        id: 1,

        type: "CONFERENCE",

        title: "BCRLS Upcoming Conference",

        date: "To Be Announced",

        location: "Dhaka, Bangladesh",

        image: "../assets/images/events/event-01.jpg",

        shortDescription:
            "Conference details, programme, speakers and submission opportunities will be announced.",

        description:
            "The Bangladesh Center for Refugee Law Studies will organize an upcoming conference focusing on refugee law, human rights, displacement and related issues. Further information about the programme, speakers and participation opportunities will be announced soon.",

        speakers: [
            "Speakers will be announced"
        ],

        programme:
            "The detailed conference programme will be announced.",

        organizer:
            "Bangladesh Center for Refugee Law Studies (BCRLS)"
    },


    {
        id: 2,

        type: "LECTURE",

        title: "BCRLS Lecture Series",

        date: "To Be Announced",

        location: "Dhaka, Bangladesh",

        image: "../assets/images/events/event-02.jpg",

        shortDescription:
            "An academic lecture focusing on refugee law, human rights and displacement studies.",

        description:
            "The BCRLS Lecture Series will bring together academics, researchers and practitioners to discuss contemporary issues in refugee law, international protection, human rights and forced displacement.",

        speakers: [
            "Speaker information will be announced"
        ],

        programme:
            "The lecture programme and schedule will be announced.",

        organizer:
            "Bangladesh Center for Refugee Law Studies (BCRLS)"
    },


    {
        id: 3,

        type: "SEMINAR",

        title: "Refugee Law & Human Rights Seminar",

        date: "To Be Announced",

        location: "Dhaka, Bangladesh",

        image: "../assets/images/events/event-03.jpg",

        shortDescription:
            "A seminar exploring current legal and human rights issues related to refugees and displacement.",

        description:
            "This seminar will provide an academic platform for discussion on refugee protection, international refugee law, human rights and contemporary displacement challenges.",

        speakers: [
            "Speaker information will be announced"
        ],

        programme:
            "The seminar programme will be announced.",

        organizer:
            "Bangladesh Center for Refugee Law Studies (BCRLS)"
    }

];



/* =========================================================
   EVENT ARCHIVE DATA
   ========================================================= */

const archivedEvents = [

    {
        id: 101,

        type: "ARCHIVE",

        title: "BCRLS Previous Event",

        date: "Past Event",

        location: "Dhaka, Bangladesh",

        image: "../assets/images/events/archive-01.jpg",

        shortDescription:
            "A previous BCRLS event focusing on refugee law and related issues.",

        description:
            "Detailed information about this archived BCRLS event can be presented here.",

        speakers: [
            "Speaker information"
        ],

        programme:
            "Programme information",

        organizer:
            "Bangladesh Center for Refugee Law Studies (BCRLS)"
    },


    {
        id: 102,

        type: "ARCHIVE",

        title: "BCRLS Academic Seminar",

        date: "Past Event",

        location: "Dhaka, Bangladesh",

        image: "../assets/images/events/archive-02.jpg",

        shortDescription:
            "An academic event addressing refugee law, displacement and human rights.",

        description:
            "Detailed information about this archived academic seminar can be presented here.",

        speakers: [
            "Speaker information"
        ],

        programme:
            "Programme information",

        organizer:
            "Bangladesh Center for Refugee Law Studies (BCRLS)"
    },


    {
        id: 103,

        type: "ARCHIVE",

        title: "BCRLS Research Event",

        date: "Past Event",

        location: "Dhaka, Bangladesh",

        image: "../assets/images/events/archive-03.jpg",

        shortDescription:
            "A previous research-focused event organized by BCRLS.",

        description:
            "Detailed information about this archived research event can be presented here.",

        speakers: [
            "Speaker information"
        ],

        programme:
            "Programme information",

        organizer:
            "Bangladesh Center for Refugee Law Studies (BCRLS)"
    }

];



/* =========================================================
   GET ELEMENTS
   ========================================================= */

const upcomingEventsGrid =
    document.getElementById("upcomingEventsGrid");

const eventModal =
    document.getElementById("eventModal");

const eventModalClose =
    document.getElementById("eventModalClose");

const eventModalOverlay =
    document.querySelector(".event-modal-overlay");



/* =========================================================
   CREATE EVENT CARD
   ========================================================= */

function createEventCard(event) {

    const article =
        document.createElement("article");

    article.className = "event-card";

    article.innerHTML = `

        <div class="event-card-image">

            <img
                src="${event.image}"
                alt="${event.title}"
                loading="lazy"
                onerror="this.parentElement.classList.add('placeholder'); this.style.display='none';"
            >

            <i
                class="fa-regular fa-calendar"
                style="display:none;"
            ></i>

        </div>


        <div class="event-card-body">

            <span class="event-card-type">
                ${event.type}
            </span>


            <h3 class="event-card-title">
                ${event.title}
            </h3>


            <div class="event-card-meta">

                <span class="event-card-meta-item">

                    <i class="fa-regular fa-calendar"></i>

                    ${event.date}

                </span>


                <span class="event-card-meta-item">

                    <i class="fa-solid fa-location-dot"></i>

                    ${event.location}

                </span>

            </div>


            <p class="event-card-description">
                ${event.shortDescription}
            </p>


            <button
                type="button"
                class="event-details-btn"
                data-event-id="${event.id}"
            >

                Event Details

                <i class="fa-solid fa-arrow-right"></i>

            </button>

        </div>

    `;


    const image =
        article.querySelector(".event-card-image img");

    const fallbackIcon =
        article.querySelector(".event-card-image i");


    image.addEventListener("error", function () {

        this.style.display = "none";

        article
            .querySelector(".event-card-image")
            .classList.add("placeholder");

        fallbackIcon.style.display = "block";

    });


    const detailsButton =
        article.querySelector(".event-details-btn");


    detailsButton.addEventListener("click", function () {

        const eventId =
            Number(this.dataset.eventId);

        openEventDetails(eventId);

    });


    return article;
}



/* =========================================================
   LOAD UPCOMING EVENTS
   ========================================================= */

function loadUpcomingEvents() {

    if (!upcomingEventsGrid) {
        return;
    }


    upcomingEventsGrid.innerHTML = "";


    if (upcomingEvents.length === 0) {

        upcomingEventsGrid.innerHTML = `

            <div class="events-empty">

                <i class="fa-regular fa-calendar"></i>

                <h3>
                    No Upcoming Events
                </h3>

                <p>
                    New events will be announced soon.
                </p>

            </div>

        `;

        return;
    }


    upcomingEvents.forEach(function (event) {

        const card =
            createEventCard(event);

        upcomingEventsGrid.appendChild(card);

    });

}



/* =========================================================
   OPEN EVENT DETAILS
   ========================================================= */

function openEventDetails(eventId) {

    const event =
        upcomingEvents.find(
            item => item.id === eventId
        );


    if (!event || !eventModal) {
        return;
    }


    const modalImage =
        document.getElementById("eventModalImage");

    const modalType =
        document.getElementById("eventModalType");

    const modalTitle =
        document.getElementById("eventModalTitle");

    const modalDate =
        document.getElementById("eventModalDate");

    const modalLocation =
        document.getElementById("eventModalLocation");

    const modalDescription =
        document.getElementById("eventModalDescription");

    const modalSpeakers =
        document.getElementById("eventModalSpeakers");

    const modalProgramme =
        document.getElementById("eventModalProgramme");

    const modalOrganizer =
        document.getElementById("eventModalOrganizer");

    const speakersWrapper =
        document.getElementById(
            "eventModalSpeakersWrapper"
        );

    const programmeWrapper =
        document.getElementById(
            "eventModalProgrammeWrapper"
        );

    const organizerWrapper =
        document.getElementById(
            "eventModalOrganizerWrapper"
        );



    /* Image */

    modalImage.src =
        event.image;

    modalImage.alt =
        event.title;



    /* Basic information */

    modalType.textContent =
        event.type;

    modalTitle.textContent =
        event.title;

    modalDate.textContent =
        event.date;

    modalLocation.textContent =
        event.location;

    modalDescription.textContent =
        event.description;



    /* Speakers */

    modalSpeakers.innerHTML = "";


    if (
        event.speakers &&
        event.speakers.length > 0
    ) {

        speakersWrapper.style.display =
            "block";


        event.speakers.forEach(function (speaker) {

            const li =
                document.createElement("li");

            li.textContent =
                speaker;

            modalSpeakers.appendChild(li);

        });

    } else {

        speakersWrapper.style.display =
            "none";

    }



    /* Programme */

    if (event.programme) {

        programmeWrapper.style.display =
            "block";

        modalProgramme.textContent =
            event.programme;

    } else {

        programmeWrapper.style.display =
            "none";

    }



    /* Organizer */

    if (event.organizer) {

        organizerWrapper.style.display =
            "block";

        modalOrganizer.textContent =
            event.organizer;

    } else {

        organizerWrapper.style.display =
            "none";

    }



    /* Open modal */

    eventModal.classList.add("active");

    eventModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}



/* =========================================================
   CLOSE EVENT DETAILS
   ========================================================= */

function closeEventDetails() {

    if (!eventModal) {
        return;
    }


    eventModal.classList.remove("active");

    eventModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}



/* =========================================================
   CLOSE BUTTON
   ========================================================= */

if (eventModalClose) {

    eventModalClose.addEventListener(
        "click",
        closeEventDetails
    );

}



/* =========================================================
   CLOSE BY OVERLAY
   ========================================================= */

if (eventModalOverlay) {

    eventModalOverlay.addEventListener(
        "click",
        closeEventDetails
    );

}



/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            eventModal &&
            eventModal.classList.contains("active")
        ) {

            closeEventDetails();

        }

    }
);



/* =========================================================
   LOAD PAGE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadUpcomingEvents();

    }
);