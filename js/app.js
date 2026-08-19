document.addEventListener("DOMContentLoaded", function () {

    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    const menuOverlay = document.getElementById("menuOverlay");
    const header = document.querySelector(".site-header");

    const dropdowns = document.querySelectorAll(".nav-dropdown");


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    function openMenu() {

        if (!mainNav || !menuToggle) return;

        mainNav.classList.add("active");
        menuToggle.classList.add("active");

        if (menuOverlay) {
            menuOverlay.classList.add("active");
        }

        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );

        document.body.classList.add("menu-open");
        document.body.style.overflow = "hidden";
    }


    function closeMenu() {

        if (!mainNav || !menuToggle) return;

        mainNav.classList.remove("active");
        menuToggle.classList.remove("active");

        if (menuOverlay) {
            menuOverlay.classList.remove("active");
        }

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        document.body.classList.remove("menu-open");
        document.body.style.overflow = "";

        closeAllDropdowns();
    }


    /* =====================================================
       DROPDOWN HELPERS
    ===================================================== */

    function closeAllDropdowns(except = null) {

        dropdowns.forEach(function (dropdown) {

            if (dropdown === except) return;

            dropdown.classList.remove("open");

            const toggle =
                dropdown.querySelector(
                    ".nav-dropdown-toggle"
                );

            if (toggle) {
                toggle.classList.remove("active");
                toggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }

        });

    }


    function resetDesktopDropdowns() {

        dropdowns.forEach(function (dropdown) {

            dropdown.classList.remove("open");

            const toggle =
                dropdown.querySelector(
                    ".nav-dropdown-toggle"
                );

            if (toggle) {
                toggle.classList.remove("active");
                toggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }

        });

    }


    /* =====================================================
       INITIAL DROPDOWN STATE
    ===================================================== */

    dropdowns.forEach(function (dropdown) {

        const toggle =
            dropdown.querySelector(
                ".nav-dropdown-toggle"
            );

        if (!toggle) return;

        toggle.setAttribute(
            "aria-expanded",
            "false"
        );

    });


    /* =====================================================
       MOBILE MENU BUTTON
    ===================================================== */

    if (menuToggle && mainNav) {

        menuToggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                if (
                    mainNav.classList.contains(
                        "active"
                    )
                ) {

                    closeMenu();

                } else {

                    openMenu();

                }

            }
        );

    }


    /* =====================================================
       DROPDOWN BUTTONS
    ===================================================== */

    dropdowns.forEach(function (dropdown) {

        const toggle =
            dropdown.querySelector(
                ".nav-dropdown-toggle"
            );

        if (!toggle) return;


        toggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();


                /* -----------------------------
                   DESKTOP
                   CSS handles hover dropdown
                ----------------------------- */

                if (window.innerWidth > 768) {

                    return;

                }


                /* -----------------------------
                   MOBILE
                ----------------------------- */

                const isOpen =
                    dropdown.classList.contains(
                        "open"
                    );


                /* Close all others */

                closeAllDropdowns(
                    dropdown
                );


                /* Close current */

                if (isOpen) {

                    dropdown.classList.remove(
                        "open"
                    );

                    toggle.classList.remove(
                        "active"
                    );

                    toggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }


                /* Open current */

                else {

                    dropdown.classList.add(
                        "open"
                    );

                    toggle.classList.add(
                        "active"
                    );

                    toggle.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }

            }
        );

    });


    /* =====================================================
       DROPDOWN LINKS
    ===================================================== */

    if (mainNav) {

        mainNav.addEventListener(
            "click",
            function (event) {

                const link =
                    event.target.closest(
                        ".dropdown-menu a"
                    );

                if (!link) return;


                if (window.innerWidth <= 768) {

                    closeMenu();

                }

            }
        );

    }


    /* =====================================================
       NORMAL NAV LINKS
    ===================================================== */

    if (mainNav) {

        mainNav.addEventListener(
            "click",
            function (event) {

                const link =
                    event.target.closest(
                        "a.nav-link"
                    );

                if (!link) return;


                if (window.innerWidth <= 768) {

                    closeMenu();

                }

            }
        );

    }


    /* =====================================================
       OVERLAY
    ===================================================== */

    if (menuOverlay) {

        menuOverlay.addEventListener(
            "click",
            function () {

                closeMenu();

            }
        );

    }


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeMenu();

            }

        }
    );


    /* =====================================================
       RESPONSIVE RESIZE
    ===================================================== */

    let previousWidth =
        window.innerWidth;


    window.addEventListener(
        "resize",
        function () {

            const currentWidth =
                window.innerWidth;


            /*
             * Crossing from mobile to desktop
             */

            if (
                previousWidth <= 768 &&
                currentWidth > 768
            ) {

                closeMenu();
                resetDesktopDropdowns();

            }


            /*
             * Crossing from desktop to mobile
             */

            if (
                previousWidth > 768 &&
                currentWidth <= 768
            ) {

                closeMenu();
                resetDesktopDropdowns();

            }


            previousWidth =
                currentWidth;

        }
    );


    /* =====================================================
       HEADER SCROLL
    ===================================================== */

    function updateHeader() {

        if (!header) return;

        if (window.scrollY > 30) {

            header.classList.add(
                "scrolled"
            );

        } else {

            header.classList.remove(
                "scrolled"
            );

        }

    }


    window.addEventListener(
        "scroll",
        updateHeader
    );

    updateHeader();


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const currentYear =
        document.getElementById(
            "currentYear"
        );

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       SMOOTH SCROLL
    ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const targetId =
                        this.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    const headerHeight =
                        header
                            ? header.offsetHeight
                            : 0;


                    const targetPosition =
                        target.getBoundingClientRect()
                            .top +
                        window.scrollY -
                        headerHeight -
                        15;


                    window.scrollTo({

                        top:
                            targetPosition,

                        behavior:
                            "smooth"

                    });


                    if (
                        window.innerWidth <= 768
                    ) {

                        closeMenu();

                    }

                }
            );

        });


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".reveal"
        );


    if (
        revealElements.length &&
        "IntersectionObserver" in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                function (entries) {

                    entries.forEach(
                        function (entry) {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "visible"
                                );

                                revealObserver.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(
            function (element) {

                revealObserver.observe(
                    element
                );

            }
        );

    }


    /* =====================================================
       FINAL STATUS
    ===================================================== */

    console.log(
        "BCRLS navigation loaded successfully"
    );

});