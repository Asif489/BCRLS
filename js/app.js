/* =========================================================
   BCRLS TEAM
   Infinite Circular Team Carousel
   ========================================================= */

const teamData = {

    advisory: [

        {
            name: "Dr. Nakib Muhammad Nasrullah",
            role: "Vice-Chancellor",
            fullRole: "Vice-Chancellor, Islamic University, Bangladesh",
            photo: "",
            bio: ""
        },

        {
            name: "Professor Dr. Abdullah Al Faruque",
            role: "Professor & Former Dean",
            fullRole: "Professor, Former Dean, Faculty of Law, University of Chittagong",
            photo: "",
            bio: ""
        },

        {
            name: "Professor Dr. Muhammad Ekramul Haque",
            role: "Professor & Dean",
            fullRole: "Professor, Department of Law, Dean, Faculty of Law, University of Dhaka",
            photo: "",
            bio: ""
        },

        {
            name: "Professor Dr. Rakiba Nabi",
            role: "Professor & Chairman",
            fullRole: "Professor, Department of Law, University of Chittagong",
            photo: "",
            bio: ""
        },

        {
            name: "Professor Christine Richardson",
            role: "Professor",
            fullRole: "Professor, Department of Law and Land Administration, Jagannath University",
            photo: "",
            bio: ""
        },

        {
            name: "Professor Dr. Md. Rizwanul Islam",
            role: "Professor & Dean",
            fullRole: "Dean, SHSS, North South University",
            photo: "",
            bio: ""
        },

        {
            name: "Dr. Hassan Faruk Al Imran",
            role: "Associate Professor",
            fullRole: "Associate Professor (Law), Independent University Bangladesh",
            photo: "",
            bio: ""
        },

        {
            name: "Dr. Jobair Alam",
            role: "Lecturer in Law",
            fullRole: "Lecturer in Law, University of Staffordshire",
            photo: "",
            bio: ""
        },

        {
            name: "A.B.M. Imdadul Haque Khan",
            role: "Dean",
            fullRole: "Dean, Faculty of Law, Eastern University",
            photo: "",
            bio: ""
        }

    ],


    directors: [

        {
            name: "Sakhawat Sajjat Sejan",
            role: "Founder",
            fullRole: "Founder, BCRLS",
            photo: "../assets/images/founder.jpg",
            bio: "Sakhawat Sajjat Sejan is the Founder of BCRLS. He completed his LL.B. (Hons.) and LL.M. from the University of Chittagong. He is currently serving as an Assistant Professor in the Department of Law at University of Information Technology and Sciences."
        },

        {
            name: "Raspiatur Rashpi",
            role: "Director",
            fullRole: "Director, Head of Resource Management, Training & Development",
            photo: "",
            bio: ""
        },

        {
            name: "Niaz Mohammad",
            role: "Director",
            fullRole: "Director, Head of Research",
            photo: "",
            bio: ""
        },

        {
            name: "Md. Rahul Hasan Joy",
            role: "Director",
            fullRole: "Director, Head of Legal Affairs",
            photo: "",
            bio: ""
        },

        {
            name: "Mohammad Tawhidul Islam Hridoy",
            role: "Director",
            fullRole: "Director, Head of IT",
            photo: "",
            bio: ""
        },

        {
            name: "Sumaiya Islam",
            role: "Director",
            fullRole: "Director, Head of Public Relations",
            photo: "",
            bio: ""
        },

        {
            name: "Md. Omar Farque",
            role: "Executive Director",
            fullRole: "Executive Director",
            photo: "",
            bio: ""
        },

        {
            name: "Nabila Farhin",
            role: "Director",
            fullRole: "Director, Head of Programs",
            photo: "",
            bio: ""
        },

        {
            name: "Md. Riad Mahmud",
            role: "Director",
            fullRole: "Director of Administration and Finance",
            photo: "",
            bio: ""
        }

    ],


    operational: []

};


/* =========================================================
   SETTINGS
   ========================================================= */

const CARDS_DESKTOP = 4;
const CARDS_TABLET = 2;
const CARDS_MOBILE = 1;

const AUTO_DELAY = 3500;
const SLIDE_DURATION = 650;


/* =========================================================
   STATE
   ========================================================= */

const carouselState = {

    advisory: {
        current: 0,
        timer: null,
        moving: false
    },

    directors: {
        current: 0,
        timer: null,
        moving: false
    }

};


/* =========================================================
   DOM
   ========================================================= */

const grids = {

    advisory:
        document.getElementById(
            "advisoryGrid"
        ),

    directors:
        document.getElementById(
            "directorsGrid"
        ),

    operational:
        document.getElementById(
            "operationalGrid"
        )

};


const selectorButtons =
    document.querySelectorAll(
        ".team-selector-btn"
    );


const panels =
    document.querySelectorAll(
        ".team-panel"
    );


const profileModal =
    document.getElementById(
        "profileModal"
    );


const modalClose =
    document.getElementById(
        "modalClose"
    );


const modalContent =
    document.getElementById(
        "modalContent"
    );


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderTeam("advisory");

        renderTeam("directors");

        renderOperational();

        setupTeamSelector();

        setupModal();

        startCarousel("advisory");

        startCarousel("directors");

        setupPauseOnHover();

        setupResize();

    }
);


/* =========================================================
   RENDER NORMAL TEAM
   ========================================================= */

function renderTeam(type) {

    const container =
        grids[type];

    if (!container) {
        return;
    }


    const members =
        teamData[type] || [];


    container.innerHTML = "";


    if (!members.length) {

        renderEmptyState(
            container
        );

        return;

    }


    container.classList.add(
        "team-carousel"
    );


    /*
       Main track
    */

    const track =
        document.createElement(
            "div"
        );

    track.className =
        "team-track";


    /*
       IMPORTANT:

       We clone the first few cards
       at the beginning and end.

       This allows true infinite
       circular movement.
    */

    const visible =
        getVisibleCards();


    const before =
        members.slice(
            -visible
        );


    const after =
        members.slice(
            0,
            visible
        );


    const carouselMembers = [

        ...before,

        ...members,

        ...after

    ];


    carouselMembers.forEach(
        (member, index) => {

            const card =
                createMemberCard(
                    member,
                    index
                );


            if (
                index < visible ||
                index >=
                visible + members.length
            ) {

                card.classList.add(
                    "carousel-clone"
                );

            }


            track.appendChild(
                card
            );

        }
    );


    container.appendChild(
        track
    );


    /*
       Controls
    */

    const controls =
        createControls(
            type,
            members.length
        );


    container.appendChild(
        controls
    );


    /*
       Start at first REAL card.
    */

    carouselState[type].current =
        0;


    requestAnimationFrame(
        () => {

            positionCarousel(
                type,
                false
            );

        }
    );

}


/* =========================================================
   VISIBLE CARD COUNT
   ========================================================= */

function getVisibleCards() {

    if (
        window.innerWidth <= 560
    ) {

        return CARDS_MOBILE;

    }


    if (
        window.innerWidth <= 800
    ) {

        return CARDS_TABLET;

    }


    return CARDS_DESKTOP;

}


/* =========================================================
   CARD WIDTH
   ========================================================= */

function getCardWidth(
    container
) {

    const track =
        container.querySelector(
            ".team-track"
        );


    if (!track) {
        return 0;
    }


    const card =
        track.querySelector(
            ".member-card"
        );


    if (!card) {
        return 0;
    }


    return (
        card.getBoundingClientRect()
            .width
        +
        getTrackGap(track)
    );

}


/* =========================================================
   TRACK GAP
   ========================================================= */

function getTrackGap(
    track
) {

    const styles =
        window.getComputedStyle(
            track
        );


    return (
        parseFloat(
            styles.columnGap ||
            styles.gap ||
            0
        ) || 0
    );

}


/* =========================================================
   POSITION CAROUSEL
   ========================================================= */

function positionCarousel(
    type,
    animate = true
) {

    const container =
        grids[type];

    if (!container) {
        return;
    }


    const track =
        container.querySelector(
            ".team-track"
        );

    if (!track) {
        return;
    }


    const visible =
        getVisibleCards();


    const cardWidth =
        getCardWidth(
            container
        );


    /*
       Clone cards are before
       the actual first member.
    */

    const realPosition =
        visible +
        carouselState[type].current;


    if (!animate) {

        track.style.transition =
            "none";

    } else {

        track.style.transition =
            `transform ${SLIDE_DURATION}ms cubic-bezier(.22,.61,.36,1)`;

    }


    track.style.transform =
        `translateX(-${realPosition * cardWidth}px)`;


    updateDots(
        type
    );

}


/* =========================================================
   NEXT
   ========================================================= */

function nextSlide(
    type
) {

    const state =
        carouselState[type];


    if (
        state.moving
    ) {

        return;

    }


    const members =
        teamData[type];


    if (
        !members ||
        members.length <= 1
    ) {

        return;

    }


    state.moving =
        true;


    state.current++;


    positionCarousel(
        type,
        true
    );


    /*
       When the real last card
       has moved out, jump back
       to the first real card
       without the user seeing it.
    */

    const visible =
        getVisibleCards();


    setTimeout(
        () => {

            if (
                state.current >=
                members.length
            ) {

                state.current = 0;


                positionCarousel(
                    type,
                    false
                );

            }


            state.moving =
                false;


            updateDots(
                type
            );

        },
        SLIDE_DURATION + 30
    );

}


/* =========================================================
   PREVIOUS
   ========================================================= */

function previousSlide(
    type
) {

    const state =
        carouselState[type];


    if (
        state.moving
    ) {

        return;

    }


    const members =
        teamData[type];


    if (
        !members ||
        members.length <= 1
    ) {

        return;

    }


    state.moving =
        true;


    state.current--;


    /*
       If we are before first,
       jump to last real card.
    */

    if (
        state.current < 0
    ) {

        state.current =
            members.length - 1;


        positionCarousel(
            type,
            false
        );


        /*
           Then move one step
           backwards visually.
        */

        requestAnimationFrame(
            () => {

                requestAnimationFrame(
                    () => {

                        state.current =
                            members.length - 2;

                        if (
                            state.current < 0
                        ) {

                            state.current =
                                0;

                        }


                        positionCarousel(
                            type,
                            true
                        );

                    }
                );

            }
        );

    } else {

        positionCarousel(
            type,
            true
        );

    }


    setTimeout(
        () => {

            state.moving =
                false;

            updateDots(
                type
            );

        },
        SLIDE_DURATION + 30
    );

}


/* =========================================================
   AUTO PLAY
   ========================================================= */

function startCarousel(
    type
) {

    stopCarousel(
        type
    );


    const members =
        teamData[type];


    if (
        !members ||
        members.length <= 1
    ) {

        return;

    }


    carouselState[type].timer =
        setInterval(
            () => {

                nextSlide(
                    type
                );

            },
            AUTO_DELAY
        );

}


/* =========================================================
   STOP AUTO PLAY
   ========================================================= */

function stopCarousel(
    type
) {

    const timer =
        carouselState[type].timer;


    if (timer) {

        clearInterval(
            timer
        );

        carouselState[type].timer =
            null;

    }

}


/* =========================================================
   RESTART
   ========================================================= */

function restartCarousel(
    type
) {

    stopCarousel(
        type
    );

    startCarousel(
        type
    );

}


/* =========================================================
   PAUSE ON HOVER
   ========================================================= */

function setupPauseOnHover() {

    Object.keys(
        carouselState
    ).forEach(
        type => {

            const container =
                grids[type];


            if (!container) {
                return;
            }


            container.addEventListener(
                "mouseenter",
                () => {

                    stopCarousel(
                        type
                    );

                }
            );


            container.addEventListener(
                "mouseleave",
                () => {

                    startCarousel(
                        type
                    );

                }
            );

        }
    );

}


/* =========================================================
   CONTROLS
   ========================================================= */

function createControls(
    type,
    count
) {

    const controls =
        document.createElement(
            "div"
        );


    controls.className =
        "carousel-controls";


    const previous =
        document.createElement(
            "button"
        );


    previous.type =
        "button";


    previous.className =
        "carousel-arrow";


    previous.innerHTML =
        '<i class="fa-solid fa-arrow-left"></i>';


    previous.setAttribute(
        "aria-label",
        "Previous member"
    );


    previous.addEventListener(
        "click",
        () => {

            previousSlide(
                type
            );

            restartCarousel(
                type
            );

        }
    );


    const dots =
        document.createElement(
            "div"
        );


    dots.className =
        "carousel-dots";


    /*
       Dots represent member positions,
       not groups.

       Example:

       ● ○ ○ ○ ○ ○ ○ ○ ○

       Every click moves exactly
       one member.
    */

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const dot =
            document.createElement(
                "button"
            );


        dot.type =
            "button";


        dot.className =
            "carousel-dot";


        dot.dataset.index =
            i;


        dot.setAttribute(
            "aria-label",
            `Show member ${i + 1}`
        );


        if (i === 0) {

            dot.classList.add(
                "active"
            );

        }


        dot.addEventListener(
            "click",
            () => {

                goToSlide(
                    type,
                    i
                );

                restartCarousel(
                    type
                );

            }
        );


        dots.appendChild(
            dot
        );

    }


    const next =
        document.createElement(
            "button"
        );


    next.type =
        "button";


    next.className =
        "carousel-arrow";


    next.innerHTML =
        '<i class="fa-solid fa-arrow-right"></i>';


    next.setAttribute(
        "aria-label",
        "Next member"
    );


    next.addEventListener(
        "click",
        () => {

            nextSlide(
                type
            );

            restartCarousel(
                type
            );

        }
    );


    controls.appendChild(
        previous
    );


    controls.appendChild(
        dots
    );


    controls.appendChild(
        next
    );


    return controls;

}


/* =========================================================
   GO TO SLIDE
   ========================================================= */

function goToSlide(
    type,
    index
) {

    const state =
        carouselState[type];


    if (
        state.moving
    ) {

        return;

    }


    const members =
        teamData[type];


    if (
        !members ||
        index < 0 ||
        index >= members.length
    ) {

        return;

    }


    state.current =
        index;


    positionCarousel(
        type,
        true
    );

}


/* =========================================================
   DOT UPDATE
   ========================================================= */

function updateDots(
    type
) {

    const container =
        grids[type];


    if (!container) {
        return;
    }


    const dots =
        container.querySelectorAll(
            ".carousel-dot"
        );


    const current =
        carouselState[type].current;


    dots.forEach(
        (dot, index) => {

            dot.classList.toggle(
                "active",
                index === current
            );

        }
    );

}


/* =========================================================
   MEMBER CARD
   ========================================================= */

function createMemberCard(
    member,
    index
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "member-card";


    card.style.setProperty(
        "--delay",
        `${index * 50}ms`
    );


    const initials =
        getInitials(
            member.name
        );


    card.innerHTML = `

        <div class="member-image-wrap">

            ${createImageHTML(
                member,
                initials
            )}

        </div>


        <h3 class="member-name">

            ${escapeHTML(
                member.name
            )}

        </h3>


        <p class="member-role">

            ${escapeHTML(
                member.role
            )}

        </p>


        <div class="view-profile">

            View Profile
            <span>→</span>

        </div>

    `;


    const image =
        card.querySelector(
            ".member-photo"
        );


    if (image) {

        image.addEventListener(
            "error",
            () => {

                replaceBrokenImage(
                    image,
                    initials
                );

            }
        );

    }


    card.addEventListener(
        "click",
        () => {

            openProfile(
                member
            );

        }
    );


    return card;

}


/* =========================================================
   IMAGE HTML
   ========================================================= */

function createImageHTML(
    member,
    initials
) {

    if (
        !member.photo ||
        member.photo.trim() === ""
    ) {

        return `

            <div
                class="member-placeholder"
            >
                ${initials}
            </div>

        `;

    }


    return `

        <img
            class="member-photo"
            src="${escapeHTML(
                member.photo
            )}"
            alt="${escapeHTML(
                member.name
            )}"
            loading="lazy"
        >

    `;

}


/* =========================================================
   BROKEN IMAGE
   ========================================================= */

function replaceBrokenImage(
    image,
    initials
) {

    const wrapper =
        image.parentElement;


    if (!wrapper) {
        return;
    }


    image.remove();


    const placeholder =
        document.createElement(
            "div"
        );


    placeholder.className =
        "member-placeholder";


    placeholder.textContent =
        initials;


    wrapper.appendChild(
        placeholder
    );

}


/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(
    name
) {

    if (!name) {
        return "B";
    }


    const words =
        name
            .replace(
                /[.,]/g,
                ""
            )
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (
        words.length === 1
    ) {

        return words[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (
        words[0].charAt(0) +
        words[
            words.length - 1
        ].charAt(0)
    ).toUpperCase();

}


/* =========================================================
   EMPTY OPERATIONAL
   ========================================================= */

function renderOperational() {

    const container =
        grids.operational;


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-team">

            <div class="empty-team-icon">

                <i class="fa-solid fa-users"></i>

            </div>


            <h3>
                Operational Team
            </h3>


            <p>
                Team members will be added here
                as the operational structure develops.
            </p>

        </div>

    `;

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function renderEmptyState(
    container
) {

    container.innerHTML = `

        <div class="empty-team">

            <div class="empty-team-icon">
                <i class="fa-solid fa-users"></i>
            </div>

            <h3>
                No Members Added Yet
            </h3>

            <p>
                Team member information will be
                updated here.
            </p>

        </div>

    `;

}


/* =========================================================
   TEAM SELECTOR
   ========================================================= */

function setupTeamSelector() {

    selectorButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const target =
                        button.dataset.target;


                    selectorButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    panels.forEach(
                        panel => {

                            panel.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    const targetPanel =
                        document.getElementById(
                            target
                        );


                    if (targetPanel) {

                        targetPanel.classList.add(
                            "active"
                        );

                    }


                    /*
                       Restart visible carousel.
                    */

                    if (
                        target ===
                        "advisory"
                    ) {

                        restartCarousel(
                            "advisory"
                        );

                    }


                    if (
                        target ===
                        "directors"
                    ) {

                        restartCarousel(
                            "directors"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   MODAL
   ========================================================= */

function setupModal() {

    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeProfile
        );

    }


    if (profileModal) {

        profileModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    profileModal
                ) {

                    closeProfile();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeProfile();

            }

        }
    );

}


/* =========================================================
   OPEN PROFILE
   ========================================================= */

function openProfile(
    member
) {

    if (
        !profileModal ||
        !modalContent
    ) {

        return;

    }


    const initials =
        getInitials(
            member.name
        );


    let photoHTML;


    if (
        member.photo &&
        member.photo.trim() !== ""
    ) {

        photoHTML = `

            <img
                class="modal-photo"
                src="${escapeHTML(
                    member.photo
                )}"
                alt="${escapeHTML(
                    member.name
                )}"
            >

        `;

    } else {

        photoHTML = `

            <div
                class="
                    member-placeholder
                    modal-photo
                "
            >
                ${initials}
            </div>

        `;

    }


    modalContent.innerHTML = `

        ${photoHTML}


        <h2 class="modal-name">

            ${escapeHTML(
                member.name
            )}

        </h2>


        <p class="modal-role">

            ${escapeHTML(
                member.fullRole ||
                member.role
            )}

        </p>


        <div class="modal-bio">

            ${
                member.bio &&
                member.bio.trim() !== ""

                ?

                escapeHTML(
                    member.bio
                )

                :

                "Profile details will be updated soon."
            }

        </div>

    `;


    const modalImage =
        modalContent.querySelector(
            ".modal-photo"
        );


    if (
        modalImage &&
        modalImage.tagName ===
        "IMG"
    ) {

        modalImage.addEventListener(
            "error",
            () => {

                const placeholder =
                    document.createElement(
                        "div"
                    );


                placeholder.className =
                    "member-placeholder modal-photo";


                placeholder.textContent =
                    initials;


                modalImage.replaceWith(
                    placeholder
                );

            }
        );

    }


    profileModal.classList.add(
        "show"
    );


    profileModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE PROFILE
   ========================================================= */

function closeProfile() {

    if (!profileModal) {
        return;
    }


    profileModal.classList.remove(
        "show"
    );


    profileModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   RESPONSIVE RESIZE
   ========================================================= */

function setupResize() {

    let resizeTimer;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    () => {

                        Object.keys(
                            carouselState
                        ).forEach(
                            type => {

                                const container =
                                    grids[type];


                                if (!container) {
                                    return;
                                }


                                const oldTrack =
                                    container.querySelector(
                                        ".team-track"
                                    );


                                if (!oldTrack) {
                                    return;
                                }


                                renderTeam(
                                    type
                                );


                                restartCarousel(
                                    type
                                );

                            }
                        );

                    },
                    250
                );

        }
    );

}


/* =========================================================
   DYNAMIC BACKEND FUNCTIONS
   ========================================================= */

function updateTeam(
    type,
    members
) {

    if (
        !Object.prototype.hasOwnProperty.call(
            teamData,
            type
        )
    ) {

        return;

    }


    stopCarousel(
        type
    );


    teamData[type] =
        Array.isArray(
            members
        )
            ? members
            : [];


    carouselState[type] = {

        current: 0,

        timer: null,

        moving: false

    };


    renderTeam(
        type
    );


    startCarousel(
        type
    );

}


/* =========================================================
   ADD MEMBER
   ========================================================= */

function addTeamMember(
    type,
    member
) {

    if (
        !teamData[type] ||
        !member ||
        !member.name
    ) {

        return;

    }


    teamData[type].push(
        member
    );


    updateTeam(
        type,
        teamData[type]
    );

}


/* =========================================================
   REMOVE MEMBER
   ========================================================= */

function removeTeamMember(
    type,
    memberName
) {

    if (
        !teamData[type]
    ) {

        return;

    }


    teamData[type] =
        teamData[type].filter(
            member =>
                member.name !==
                memberName
        );


    updateTeam(
        type,
        teamData[type]
    );

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
/* =========================================================
   MOBILE MENU
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const menuToggle =
        document.querySelector(".menu-toggle");

    const mainNav =
        document.querySelector(".main-nav");

    if (!menuToggle || !mainNav) {
        return;
    }


    /* =========================
       TOGGLE MENU
    ========================= */

    menuToggle.addEventListener("click", () => {

        const isOpen =
            mainNav.classList.contains("mobile-open");

        if (isOpen) {

            closeMobileMenu();

        } else {

            openMobileMenu();

        }

    });


    /* =========================
       OPEN
    ========================= */

    function openMobileMenu() {

        mainNav.classList.add("mobile-open");

        menuToggle.classList.add("active");

        document.body.classList.add("menu-open");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );
    }


    /* =========================
       CLOSE
    ========================= */

    function closeMobileMenu() {

        mainNav.classList.remove("mobile-open");

        menuToggle.classList.remove("active");

        document.body.classList.remove("menu-open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        document
            .querySelectorAll(".nav-dropdown.mobile-open")
            .forEach(dropdown => {

                dropdown.classList.remove(
                    "mobile-open"
                );

            });
    }


    /* =========================
       MOBILE DROPDOWNS
    ========================= */

    document
        .querySelectorAll(".nav-dropdown-toggle")
        .forEach(toggle => {

            toggle.addEventListener(
                "click",
                event => {

                    if (window.innerWidth <= 1200) {

                        event.preventDefault();

                        const dropdown =
                            toggle.closest(
                                ".nav-dropdown"
                            );

                        if (!dropdown) {
                            return;
                        }

                        dropdown.classList.toggle(
                            "mobile-open"
                        );

                    }

                }
            );

        });


    /* =========================
       CLOSE AFTER LINK CLICK
    ========================= */

    mainNav
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <= 1200
                    ) {

                        closeMobileMenu();

                    }

                }
            );

        });


    /* =========================
       RESIZE
    ========================= */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 1200
            ) {

                closeMobileMenu();

            }

        }
    );

});
