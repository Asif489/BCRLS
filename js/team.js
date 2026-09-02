/* =========================================================
   BCRLS TEAM PAGE JAVASCRIPT
   Works with the existing team.html design
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       HEADER / MOBILE MENU
    ===================================================== */

    setupMobileMenu();
    setupDropdowns();


    /* =====================================================
       TEAM TABS
    ===================================================== */

    setupTeamTabs();


    /* =====================================================
       EXISTING TEAM CAROUSELS
    ===================================================== */

    setupTeamCarousel("advisory");
    setupTeamCarousel("directors");


    /* =====================================================
       OPERATIONAL TEAM
    ===================================================== */

    setupOperational();


    /* =====================================================
       IMAGE HOVER / CARD INTERACTION
    ===================================================== */

    setupCardInteraction();


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener("resize", function () {

        clearTimeout(window.teamResizeTimer);

        window.teamResizeTimer = setTimeout(function () {

            refreshCarousel("advisory");
            refreshCarousel("directors");

        }, 250);

    });

});


/* =========================================================
   CONFIGURATION
========================================================= */

const TEAM_CONFIG = {

    advisory: {
        autoTime: 30000,
        currentIndex: 0,
        timer: null,
        moving: false
    },

    directors: {
        autoTime: 30000,
        currentIndex: 0,
        timer: null,
        moving: false
    }

};


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const menuButton = document.getElementById("mobileMenuBtn");
    const navigation = document.getElementById("mainNav");

    if (!menuButton || !navigation) {
        return;
    }


    menuButton.addEventListener("click", function () {

        const isOpen =
            navigation.classList.toggle("mobile-open");

        menuButton.classList.toggle("active", isOpen);

        menuButton.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation"
                : "Open navigation"
        );

    });


    /* Close menu when clicking a normal link */

    navigation.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            if (window.innerWidth <= 900) {

                navigation.classList.remove(
                    "mobile-open"
                );

                menuButton.classList.remove(
                    "active"
                );

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    });


    /* Reset mobile state on desktop */

    window.addEventListener("resize", function () {

        if (window.innerWidth > 900) {

            navigation.classList.remove(
                "mobile-open"
            );

            menuButton.classList.remove(
                "active"
            );

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

}


/* =========================================================
   NAVIGATION DROPDOWNS
========================================================= */

function setupDropdowns() {

    const dropdowns =
        document.querySelectorAll(".nav-dropdown");


    dropdowns.forEach(function (dropdown) {

        const button =
            dropdown.querySelector(".nav-dropdown-btn");

        const menu =
            dropdown.querySelector(".dropdown-menu");


        if (!button || !menu) {
            return;
        }


        button.setAttribute(
            "aria-expanded",
            "false"
        );


        button.addEventListener("click", function (event) {

            event.preventDefault();
            event.stopPropagation();


            const currentlyOpen =
                dropdown.classList.contains("open");


            /* Close other dropdowns */

            dropdowns.forEach(function (item) {

                item.classList.remove("open");

                const itemButton =
                    item.querySelector(".nav-dropdown-btn");

                if (itemButton) {

                    itemButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            });


            /* Open selected dropdown */

            if (!currentlyOpen) {

                dropdown.classList.add("open");

                button.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

        });

    });


    /* Close dropdown when clicking outside */

    document.addEventListener("click", function (event) {

        if (!event.target.closest(".nav-dropdown")) {

            dropdowns.forEach(function (dropdown) {

                dropdown.classList.remove("open");

                const button =
                    dropdown.querySelector(
                        ".nav-dropdown-btn"
                    );

                if (button) {

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            });

        }

    });

}


/* =========================================================
   TEAM TABS
========================================================= */

function setupTeamTabs() {

    const buttons =
        document.querySelectorAll(
            ".team-selector-btn"
        );

    const panels =
        document.querySelectorAll(
            ".team-panel"
        );


    if (!buttons.length || !panels.length) {
        return;
    }


    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const target =
                button.dataset.target;


            /* Remove active */

            buttons.forEach(function (item) {

                item.classList.remove("active");

            });


            panels.forEach(function (panel) {

                panel.classList.remove("active");

            });


            /* Activate selected */

            button.classList.add("active");


            const targetPanel =
                document.getElementById(target);


            if (targetPanel) {

                targetPanel.classList.add("active");

            }


            /* Start/stop carousel */

            if (target === "advisory") {

                startTeamAuto("advisory");

                stopTeamAuto("directors");

            }

            else if (target === "directors") {

                startTeamAuto("directors");

                stopTeamAuto("advisory");

            }

            else {

                stopTeamAuto("advisory");
                stopTeamAuto("directors");

            }

        });

    });

}


/* =========================================================
   FIND TEAM GRID
========================================================= */

function getTeamGrid(type) {

    const panel =
        document.getElementById(type);

    if (!panel) {
        return null;
    }


    return panel.querySelector(".team-grid");

}


/* =========================================================
   GET VISIBLE CARD COUNT
========================================================= */

function getVisibleCards() {

    const width =
        window.innerWidth;


    if (width <= 600) {

        return 1;

    }


    if (width <= 900) {

        return 2;

    }


    return 4;

}


/* =========================================================
   SETUP TEAM CAROUSEL
========================================================= */

function setupTeamCarousel(type) {

    const grid =
        getTeamGrid(type);


    if (!grid) {
        return;
    }


    const cards =
        Array.from(
            grid.querySelectorAll(
                ":scope > .member-card"
            )
        );


    if (!cards.length) {
        return;
    }


    /* Add carousel class */

    grid.classList.add(
        "team-carousel-ready"
    );


    /* Store original cards */

    grid.dataset.cardCount =
        cards.length;


    /*
       We don't destroy the existing HTML.
       We only control which cards are visible.
    */

    cards.forEach(function (card, index) {

        card.dataset.teamIndex =
            index;

    });


    /* Create navigation only if necessary */

    createCarouselControls(
        type,
        cards.length
    );


    refreshCarousel(type);


    /* Start automatic movement */

    startTeamAuto(type);


    /* Pause while mouse is over carousel */

    grid.addEventListener(
        "mouseenter",
        function () {

            stopTeamAuto(type);

        }
    );


    grid.addEventListener(
        "mouseleave",
        function () {

            startTeamAuto(type);

        }
    );

}


/* =========================================================
   CREATE CAROUSEL CONTROLS
========================================================= */

function createCarouselControls(
    type,
    totalCards
) {

    const panel =
        document.getElementById(type);


    if (!panel) {
        return;
    }


    /* Don't create twice */

    if (
        panel.querySelector(
            ".team-carousel-controls"
        )
    ) {

        return;

    }


    if (totalCards <= getVisibleCards()) {

        return;

    }


    const controls =
        document.createElement("div");

    controls.className =
        "team-carousel-controls";


    /* Previous */

    const previous =
        document.createElement("button");

    previous.type = "button";

    previous.className =
        "team-carousel-arrow";

    previous.setAttribute(
        "aria-label",
        "Previous"
    );

    previous.innerHTML =
        '<i class="fa-solid fa-arrow-left"></i>';


    previous.addEventListener(
        "click",
        function () {

            moveTeam(
                type,
                -1
            );

            restartTeamAuto(type);

        }
    );


    /* Dots */

    const dots =
        document.createElement("div");

    dots.className =
        "team-carousel-dots";


    const numberOfPositions =
        Math.max(
            1,
            totalCards - getVisibleCards() + 1
        );


    for (
        let i = 0;
        i < numberOfPositions;
        i++
    ) {

        const dot =
            document.createElement("button");

        dot.type = "button";

        dot.className =
            "team-carousel-dot";


        if (i === 0) {

            dot.classList.add(
                "active"
            );

        }


        dot.setAttribute(
            "aria-label",
            "Go to position " + (i + 1)
        );


        dot.addEventListener(
            "click",
            function () {

                goToTeam(
                    type,
                    i
                );

                restartTeamAuto(type);

            }
        );


        dots.appendChild(dot);

    }


    /* Next */

    const next =
        document.createElement("button");

    next.type = "button";

    next.className =
        "team-carousel-arrow";

    next.setAttribute(
        "aria-label",
        "Next"
    );

    next.innerHTML =
        '<i class="fa-solid fa-arrow-right"></i>';


    next.addEventListener(
        "click",
        function () {

            moveTeam(
                type,
                1
            );

            restartTeamAuto(type);

        }
    );


    controls.appendChild(previous);

    controls.appendChild(dots);

    controls.appendChild(next);


    panel.appendChild(controls);

}


/* =========================================================
   REFRESH CAROUSEL
========================================================= */

function refreshCarousel(type) {

    const grid =
        getTeamGrid(type);


    if (!grid) {
        return;
    }


    const cards =
        Array.from(
            grid.querySelectorAll(
                ":scope > .member-card"
            )
        );


    if (!cards.length) {
        return;
    }


    const visible =
        getVisibleCards();


    const maxIndex =
        Math.max(
            0,
            cards.length - visible
        );


    if (
        TEAM_CONFIG[type].currentIndex >
        maxIndex
    ) {

        TEAM_CONFIG[type].currentIndex =
            0;

    }


    /*
       Existing design is preserved.
       We simply hide cards outside
       the current visible range.
    */

    cards.forEach(function (card, index) {

        const start =
            TEAM_CONFIG[type].currentIndex;


        const end =
            start + visible;


        const shouldShow =
            index >= start &&
            index < end;


        card.classList.toggle(
            "carousel-hidden",
            !shouldShow
        );

    });


    updateCarouselDots(type);

}


/* =========================================================
   MOVE TEAM
========================================================= */

function moveTeam(
    type,
    direction
) {

    if (
        TEAM_CONFIG[type].moving
    ) {

        return;

    }


    const grid =
        getTeamGrid(type);


    if (!grid) {
        return;
    }


    const cards =
        Array.from(
            grid.querySelectorAll(
                ":scope > .member-card"
            )
        );


    const visible =
        getVisibleCards();


    const maxIndex =
        Math.max(
            0,
            cards.length - visible
        );


    if (maxIndex === 0) {
        return;
    }


    TEAM_CONFIG[type].moving =
        true;


    let newIndex =
        TEAM_CONFIG[type].currentIndex +
        direction;


    /*
       Infinite loop
    */

    if (newIndex > maxIndex) {

        newIndex = 0;

    }


    if (newIndex < 0) {

        newIndex = maxIndex;

    }


    TEAM_CONFIG[type].currentIndex =
        newIndex;


    /*
       Small animation
    */

    grid.classList.add(
        "team-sliding"
    );


    setTimeout(function () {

        refreshCarousel(type);

        grid.classList.remove(
            "team-sliding"
        );

        TEAM_CONFIG[type].moving =
            false;

    }, 350);

}


/* =========================================================
   GO TO SPECIFIC SLIDE
========================================================= */

function goToTeam(
    type,
    index
) {

    const grid =
        getTeamGrid(type);


    if (!grid) {
        return;
    }


    const cards =
        Array.from(
            grid.querySelectorAll(
                ":scope > .member-card"
            )
        );


    const visible =
        getVisibleCards();


    const maxIndex =
        Math.max(
            0,
            cards.length - visible
        );


    TEAM_CONFIG[type].currentIndex =
        Math.min(
            index,
            maxIndex
        );


    refreshCarousel(type);

}


/* =========================================================
   AUTO SLIDE
========================================================= */

function startTeamAuto(type) {

    stopTeamAuto(type);


    const grid =
        getTeamGrid(type);


    if (!grid) {
        return;
    }


    const cards =
        grid.querySelectorAll(
            ":scope > .member-card"
        );


    if (
        cards.length <=
        getVisibleCards()
    ) {

        return;

    }


    /*
       30 seconds
    */

    TEAM_CONFIG[type].timer =
        setInterval(
            function () {

                moveTeam(
                    type,
                    1
                );

            },
            TEAM_CONFIG[type].autoTime
        );

}


/* =========================================================
   STOP AUTO SLIDE
========================================================= */

function stopTeamAuto(type) {

    if (
        TEAM_CONFIG[type].timer
    ) {

        clearInterval(
            TEAM_CONFIG[type].timer
        );

        TEAM_CONFIG[type].timer =
            null;

    }

}


/* =========================================================
   RESTART AUTO SLIDE
========================================================= */

function restartTeamAuto(type) {

    stopTeamAuto(type);

    startTeamAuto(type);

}


/* =========================================================
   UPDATE DOTS
========================================================= */

function updateCarouselDots(type) {

    const panel =
        document.getElementById(type);


    if (!panel) {
        return;
    }


    const dots =
        panel.querySelectorAll(
            ".team-carousel-dot"
        );


    dots.forEach(function (dot, index) {

        dot.classList.toggle(
            "active",
            index ===
            TEAM_CONFIG[type].currentIndex
        );

    });

}


/* =========================================================
   CARD INTERACTION
========================================================= */

function setupCardInteraction() {

    const cards =
        document.querySelectorAll(
            ".member-card"
        );


    cards.forEach(function (card) {

        /*
           Existing hover effect remains untouched.
        */

        card.addEventListener(
            "mouseenter",
            function () {

                card.classList.add(
                    "is-hovered"
                );

            }
        );


        card.addEventListener(
            "mouseleave",
            function () {

                card.classList.remove(
                    "is-hovered"
                );

            }
        );

    });

}


/* =========================================================
   OPERATIONAL TEAM
========================================================= */

function setupOperational() {

    const panel =
        document.getElementById(
            "operational"
        );


    if (!panel) {
        return;
    }


    /*
       Do not overwrite existing content.
       The current HTML already contains the
       Operational Team placeholder.
    */

}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {
            return;
        }


        /* Close mobile menu */

        const navigation =
            document.getElementById(
                "mainNav"
            );


        const menuButton =
            document.getElementById(
                "mobileMenuBtn"
            );


        if (navigation) {

            navigation.classList.remove(
                "mobile-open"
            );

        }


        if (menuButton) {

            menuButton.classList.remove(
                "active"
            );

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }


        /* Close nav dropdowns */

        document
            .querySelectorAll(
                ".nav-dropdown"
            )
            .forEach(function (dropdown) {

                dropdown.classList.remove(
                    "open"
                );

            });

    }
);