const teamData = {
    advisory: [
        {
            name: "Dr. Nakib Muhammad Nasrullah",
            role: "Vice-Chancellor",
            fullRole: "Vice-Chancellor",
            photo: ""
        },
        {
            name: "Professor Dr. Abdullah Al Faruque",
            role: "Professor & Former Dean",
            fullRole: "Professor & Former Dean",
            photo: ""
        },
        {
            name: "Professor Dr. Muhammad Ekramul Haque",
            role: "Professor & Dean",
            fullRole: "Professor & Dean",
            photo: ""
        },
        {
            name: "Professor Dr. Rakiba Nabi",
            role: "Professor & Chairman",
            fullRole: "Professor & Chairman",
            photo: ""
        },
        {
            name: "Professor Christine Richardson",
            role: "Professor",
            fullRole: "Professor",
            photo: ""
        },
        {
            name: "Professor Dr. Md. Rizwanul Islam",
            role: "Professor & Dean",
            fullRole: "Professor & Dean",
            photo: ""
        },
        {
            name: "Dr. Hassan Faruk Al Imran",
            role: "Associate Professor",
            fullRole: "Associate Professor",
            photo: ""
        },
        {
            name: "Dr. Jobair Alam",
            role: "Lecturer in Law",
            fullRole: "Lecturer in Law",
            photo: ""
        },
        {
            name: "A.B.M. Imdadul Haque Khan",
            role: "Dean",
            fullRole: "Dean",
            photo: ""
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
            fullRole: "Director",
            photo: ""
        },
        {
            name: "Niaz Mohammad",
            role: "Director",
            fullRole: "Director",
            photo: ""
        },
        {
            name: "Md. Rahul Hasan Joy",
            role: "Director",
            fullRole: "Director",
            photo: ""
        },
        {
            name: "Mohammad Tawhidul Islam Hridoy",
            role: "Director",
            fullRole: "Director",
            photo: ""
        },
        {
            name: "Sumaiya Islam",
            role: "Director",
            fullRole: "Director",
            photo: ""
        },
        {
            name: "Md. Omar Farque",
            role: "Executive Director",
            fullRole: "Executive Director",
            photo: ""
        },
        {
            name: "Nabila Farhin",
            role: "Director",
            fullRole: "Director",
            photo: ""
        },
        {
            name: "Md. Riad Mahmud",
            role: "Director",
            fullRole: "Director",
            photo: ""
        }
    ],

    operational: []
};


const AUTO_TIME = 2000;
const SLIDE_TIME = 400;

const states = {
    advisory: {
        index: 0,
        timer: null,
        busy: false
    },

    directors: {
        index: 0,
        timer: null,
        busy: false
    }
};


document.addEventListener("DOMContentLoaded", function () {

    renderCarousel("advisory");
    renderCarousel("directors");
    renderOperational();

    setupTabs();
    setupModal();

    startAuto("advisory");
    startAuto("directors");

    setupResize();

});


function getVisibleCount() {

    if (window.innerWidth <= 560) {
        return 1;
    }

    if (window.innerWidth <= 800) {
        return 2;
    }

    return 4;
}


function renderCarousel(type) {

    const container = document.getElementById(
        type + "Grid"
    );

    if (!container) {
        return;
    }

    const members = teamData[type];

    if (!members || members.length === 0) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = "";

    container.classList.add("team-carousel");

    const viewport = document.createElement("div");
    viewport.className = "carousel-viewport";

    const track = document.createElement("div");
    track.className = "team-track";

    const visible = getVisibleCount();

    /*
        Clone last cards before original cards.
    */

    const before = [];

    for (let i = visible; i > 0; i--) {
        const index =
            (members.length - i) %
            members.length;

        before.push(members[index]);
    }


    /*
        Clone first cards after original cards.
    */

    const after = [];

    for (let i = 0; i < visible; i++) {
        after.push(
            members[i % members.length]
        );
    }


    const allMembers = [
        ...before,
        ...members,
        ...after
    ];


    allMembers.forEach(function (member) {

        track.appendChild(
            createCard(member)
        );

    });


    viewport.appendChild(track);

    container.appendChild(viewport);

    container.appendChild(
        createControls(type)
    );


    states[type].index = 0;

    requestAnimationFrame(function () {

        moveCarousel(
            type,
            false
        );

    });

}


function createCard(member) {

    const card =
        document.createElement("article");

    card.className = "member-card";


    const initials =
        getInitials(member.name);


    let photo;


    if (
        member.photo &&
        member.photo.trim() !== ""
    ) {

        photo = `
            <img
                src="${escapeHTML(member.photo)}"
                alt="${escapeHTML(member.name)}"
                class="member-photo"
            >
        `;

    } else {

        photo = `
            <div class="member-placeholder">
                ${initials}
            </div>
        `;

    }


    card.innerHTML = `

        <div class="member-image-wrap">
            ${photo}
        </div>

        <div class="member-info">

            <h3 class="member-name">
                ${escapeHTML(member.name)}
            </h3>

            <p class="member-role">
                ${escapeHTML(member.role)}
            </p>

        </div>

        <div class="view-profile">
            View Profile
            <span>→</span>
        </div>

    `;


    const image =
        card.querySelector(".member-photo");


    if (image) {

        image.addEventListener(
            "error",
            function () {

                const placeholder =
                    document.createElement("div");

                placeholder.className =
                    "member-placeholder";

                placeholder.textContent =
                    initials;

                image.replaceWith(
                    placeholder
                );

            }
        );

    }


    card.addEventListener(
        "click",
        function () {

            openProfile(member);

        }
    );


    return card;
}


function moveCarousel(
    type,
    animate = true
) {

    const container =
        document.getElementById(
            type + "Grid"
        );

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
        getVisibleCount();


    const card =
        track.querySelector(
            ".member-card"
        );

    if (!card) {
        return;
    }


    const cardWidth =
        card.getBoundingClientRect().width;


    const styles =
        window.getComputedStyle(track);


    const gap =
        parseFloat(
            styles.gap
        ) || 0;


    const position =
        visible +
        states[type].index;


    if (!animate) {

        track.style.transition =
            "none";

    } else {

        track.style.transition =
            `transform ${SLIDE_TIME}ms cubic-bezier(.22,.61,.36,1)`;

    }


    track.style.transform =
        `translateX(-${position * (cardWidth + gap)}px)`;

}


function nextSlide(type) {

    const state =
        states[type];


    if (state.busy) {
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


    state.busy = true;

    state.index++;


    moveCarousel(
        type,
        true
    );


    setTimeout(function () {

        if (
            state.index >=
            members.length
        ) {

            state.index = 0;

            moveCarousel(
                type,
                false
            );

        }


        state.busy = false;

        updateDots(type);

    }, SLIDE_TIME + 40);

}


function previousSlide(type) {

    const state =
        states[type];


    if (state.busy) {
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


    state.busy = true;


    if (state.index === 0) {

        /*
            Jump silently to the last
            real position.
        */

        state.index =
            members.length;

        moveCarousel(
            type,
            false
        );


        requestAnimationFrame(function () {

            requestAnimationFrame(function () {

                state.index =
                    members.length - 1;

                moveCarousel(
                    type,
                    true
                );

            });

        });

    } else {

        state.index--;

        moveCarousel(
            type,
            true
        );

    }


    setTimeout(function () {

        state.busy = false;

        updateDots(type);

    }, SLIDE_TIME + 40);

}


function createControls(type) {

    const controls =
        document.createElement("div");

    controls.className =
        "carousel-controls";


    const previous =
        document.createElement("button");

    previous.className =
        "carousel-arrow";

    previous.type =
        "button";

    previous.innerHTML =
        '<i class="fa-solid fa-arrow-left"></i>';

    previous.addEventListener(
        "click",
        function () {

            previousSlide(type);

            restartAuto(type);

        }
    );


    const dots =
        document.createElement("div");

    dots.className =
        "carousel-dots";


    teamData[type].forEach(
        function (_, index) {

            const dot =
                document.createElement("button");

            dot.className =
                "carousel-dot";

            dot.type =
                "button";

            if (index === 0) {

                dot.classList.add(
                    "active"
                );

            }


            dot.addEventListener(
                "click",
                function () {

                    goToSlide(
                        type,
                        index
                    );

                    restartAuto(type);

                }
            );


            dots.appendChild(dot);

        }
    );


    const next =
        document.createElement("button");

    next.className =
        "carousel-arrow";

    next.type =
        "button";

    next.innerHTML =
        '<i class="fa-solid fa-arrow-right"></i>';


    next.addEventListener(
        "click",
        function () {

            nextSlide(type);

            restartAuto(type);

        }
    );


    controls.appendChild(previous);

    controls.appendChild(dots);

    controls.appendChild(next);


    return controls;
}


function goToSlide(
    type,
    index
) {

    const state =
        states[type];


    if (state.busy) {
        return;
    }


    state.index =
        index;


    moveCarousel(
        type,
        true
    );


    updateDots(type);

}


function updateDots(type) {

    const container =
        document.getElementById(
            type + "Grid"
        );

    if (!container) {
        return;
    }


    const dots =
        container.querySelectorAll(
            ".carousel-dot"
        );


    dots.forEach(
        function (dot, index) {

            dot.classList.toggle(
                "active",
                index ===
                states[type].index
            );

        }
    );

}


function startAuto(type) {

    stopAuto(type);


    if (
        !teamData[type] ||
        teamData[type].length <= 1
    ) {
        return;
    }


    states[type].timer =
        setInterval(
            function () {

                nextSlide(type);

            },
            AUTO_TIME
        );

}


function stopAuto(type) {

    if (
        states[type].timer
    ) {

        clearInterval(
            states[type].timer
        );

        states[type].timer =
            null;

    }

}


function restartAuto(type) {

    stopAuto(type);

    startAuto(type);

}


/* =========================================================
   PAUSE WHILE HOVERING
========================================================= */

function setupHoverPause() {

    ["advisory", "directors"].forEach(
        function (type) {

            const container =
                document.getElementById(
                    type + "Grid"
                );

            if (!container) {
                return;
            }


            container.addEventListener(
                "mouseenter",
                function () {

                    stopAuto(type);

                }
            );


            container.addEventListener(
                "mouseleave",
                function () {

                    startAuto(type);

                }
            );

        }
    );

}


setupHoverPause();


/* =========================================================
   TABS
========================================================= */

function setupTabs() {

    const buttons =
        document.querySelectorAll(
            ".team-selector-btn"
        );


    const panels =
        document.querySelectorAll(
            ".team-panel"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const target =
                        button.dataset.target;


                    buttons.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    panels.forEach(
                        function (panel) {

                            panel.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    const panel =
                        document.getElementById(
                            target
                        );


                    if (panel) {

                        panel.classList.add(
                            "active"
                        );

                    }


                    if (
                        target ===
                        "advisory"
                    ) {

                        restartAuto(
                            "advisory"
                        );

                    }


                    if (
                        target ===
                        "directors"
                    ) {

                        restartAuto(
                            "directors"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   OPERATIONAL
========================================================= */

function renderOperational() {

    const container =
        document.getElementById(
            "operationalGrid"
        );


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
   PROFILE MODAL
========================================================= */

function setupModal() {

    const close =
        document.getElementById(
            "modalClose"
        );


    const modal =
        document.getElementById(
            "profileModal"
        );


    if (close) {

        close.addEventListener(
            "click",
            closeProfile
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    modal
                ) {

                    closeProfile();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeProfile();

            }

        }
    );

}


function openProfile(member) {

    const modal =
        document.getElementById(
            "profileModal"
        );


    const content =
        document.getElementById(
            "modalContent"
        );


    if (!modal || !content) {
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
                src="${escapeHTML(
                    member.photo
                )}"
                alt="${escapeHTML(
                    member.name
                )}"
                class="modal-photo"
            >

        `;

    } else {

        photoHTML = `

            <div class="
                member-placeholder
                modal-photo
            ">
                ${initials}
            </div>

        `;

    }


    content.innerHTML = `

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
                member.bio
                ?
                escapeHTML(member.bio)
                :
                "Profile details will be updated soon."
            }

        </div>

    `;


    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


function closeProfile() {

    const modal =
        document.getElementById(
            "profileModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {

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
            .split(/\s+/);


    if (
        words.length === 1
    ) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

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
   RESIZE
========================================================= */

let resizeTimer;

window.addEventListener(
    "resize",
    function () {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                function () {

                    renderCarousel(
                        "advisory"
                    );

                    renderCarousel(
                        "directors"
                    );

                    startAuto(
                        "advisory"
                    );

                    startAuto(
                        "directors"
                    );

                },
                300
            );

    }
);