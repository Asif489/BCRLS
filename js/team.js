/* =========================================================
   BCRLS MAIN APP
   Mobile Navigation
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    const menuOverlay = document.getElementById("menuOverlay");

    /* =========================================
       MOBILE MENU
    ========================================= */

    function openMenu() {

        if (!menuToggle || !mainNav) return;

        menuToggle.classList.add("active");
        mainNav.classList.add("active");

        if (menuOverlay) {
            menuOverlay.classList.add("active");
        }

        document.body.classList.add("menu-open");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );
    }


    function closeMenu() {

        if (!menuToggle || !mainNav) return;

        menuToggle.classList.remove("active");
        mainNav.classList.remove("active");

        if (menuOverlay) {
            menuOverlay.classList.remove("active");
        }

        document.body.classList.remove("menu-open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        closeDropdowns();
    }


    /* =========================================
       THREE LINE BUTTON
    ========================================= */

    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                if (
                    mainNav &&
                    mainNav.classList.contains("active")
                ) {
                    closeMenu();
                } else {
                    openMenu();
                }

            }
        );

    }


    /* =========================================
       OVERLAY
    ========================================= */

    if (menuOverlay) {

        menuOverlay.addEventListener(
            "click",
            function () {
                closeMenu();
            }
        );

    }


    /* =========================================
       DROPDOWN
    ========================================= */

    const dropdowns =
        document.querySelectorAll(
            ".nav-dropdown"
        );


    function closeDropdowns() {

        dropdowns.forEach(
            function (dropdown) {

                dropdown.classList.remove("open");

                const button =
                    dropdown.querySelector(
                        ".nav-dropdown-toggle"
                    );

                if (button) {

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );

    }


    dropdowns.forEach(
        function (dropdown) {

            const button =
                dropdown.querySelector(
                    ".nav-dropdown-toggle"
                );

            if (!button) return;


            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    const isOpen =
                        dropdown.classList.contains(
                            "open"
                        );


                    closeDropdowns();


                    if (!isOpen) {

                        dropdown.classList.add(
                            "open"
                        );

                        button.setAttribute(
                            "aria-expanded",
                            "true"
                        );

                    }

                }
            );

        }
    );


    /* =========================================
       CLOSE AFTER NORMAL LINK
    ========================================= */

    if (mainNav) {

        mainNav
            .querySelectorAll(
                "a.nav-link"
            )
            .forEach(
                function (link) {

                    link.addEventListener(
                        "click",
                        function () {

                            closeMenu();

                        }
                    );

                }
            );

    }


    /* =========================================
       ESC KEY
    ========================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeMenu();
            }

        }
    );


    /* =========================================
       RESIZE
    ========================================= */

    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth > 768
            ) {
                closeMenu();
            }

        }
    );


    /* =========================================
       CURRENT YEAR
    ========================================= */

    const currentYear =
        document.getElementById(
            "currentYear"
        );

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }

});