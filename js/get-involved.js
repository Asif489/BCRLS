/* =========================================================
   BCRLS — GET INVOLVED.JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuToggle =
        document.getElementById("menuToggle");

    const mainNav =
        document.getElementById("mainNav");

    const menuOverlay =
        document.getElementById("menuOverlay");


    function openMenu() {

        if (!mainNav || !menuToggle) return;

        mainNav.classList.add("active");

        menuToggle.classList.add("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        if (menuOverlay) {

            menuOverlay.classList.add("active");

        }

        document.body.classList.add(
            "menu-open"
        );
    }


    function closeMenu() {

        if (!mainNav || !menuToggle) return;

        mainNav.classList.remove("active");

        menuToggle.classList.remove("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        if (menuOverlay) {

            menuOverlay.classList.remove("active");

        }

        document.body.classList.remove(
            "menu-open"
        );

        closeDropdowns();

    }


    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            (event) => {

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


    if (menuOverlay) {

        menuOverlay.addEventListener(
            "click",
            closeMenu
        );

    }


    /* =====================================================
       GET INVOLVED DROPDOWNS
    ===================================================== */

    const dropdowns =
        document.querySelectorAll(
            ".nav-dropdown"
        );


    function closeDropdowns(
        except = null
    ) {

        dropdowns.forEach(
            (dropdown) => {

                if (
                    except &&
                    dropdown === except
                ) {

                    return;

                }

                dropdown.classList.remove(
                    "open"
                );

            }
        );

    }


    dropdowns.forEach(
        (dropdown) => {

            const button =
                dropdown.querySelector(
                    ".nav-dropdown-toggle"
                );

            if (!button) return;


            button.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    event.stopPropagation();


                    /*
                     * Only use click dropdown
                     * behaviour on mobile.
                     */

                    if (
                        window.innerWidth > 850
                    ) {

                        return;

                    }


                    const isOpen =
                        dropdown.classList.contains(
                            "open"
                        );


                    closeDropdowns(
                        dropdown
                    );


                    if (!isOpen) {

                        dropdown.classList.add(
                            "open"
                        );

                    }

                }
            );

        }
    );


    /* =====================================================
       CLOSE MOBILE MENU AFTER LINK CLICK
    ===================================================== */

    if (mainNav) {

        const navLinks =
            mainNav.querySelectorAll(
                ".dropdown-menu a, .nav-link"
            );


        navLinks.forEach(
            (link) => {

                link.addEventListener(
                    "click",
                    () => {

                        if (
                            window.innerWidth <= 850
                        ) {

                            closeMenu();

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                closeMenu();

            }

        }
    );


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 850
            ) {

                closeMenu();

            }

        }
    );


    /* =====================================================
       ACTIVE GET INVOLVED PAGE
    ===================================================== */

    const currentFile =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const getInvolvedLinks =
        document.querySelectorAll(
            ".nav-dropdown .dropdown-menu a"
        );


    getInvolvedLinks.forEach(
        (link) => {

            const href =
                link.getAttribute("href");

            if (!href) return;


            const fileName =
                href
                    .split("#")[0]
                    .split("?")[0]
                    .split("/")
                    .pop()
                    .toLowerCase();


            if (
                fileName === currentFile
            ) {

                link.classList.add(
                    "active"
                );


                const parent =
                    link.closest(
                        ".nav-dropdown"
                    );


                if (parent) {

                    parent.classList.add(
                        "current"
                    );

                }

            }

        }
    );


    /* =====================================================
       GET INVOLVED CARD ANIMATION
    ===================================================== */

    const cards =
        document.querySelectorAll(
            ".opportunity-card"
        );


    cards.forEach(
        (card) => {

            card.addEventListener(
                "mouseenter",
                () => {

                    card.classList.add(
                        "is-hovered"
                    );

                }
            );


            card.addEventListener(
                "mouseleave",
                () => {

                    card.classList.remove(
                        "is-hovered"
                    );

                }
            );

        }
    );


    /* =====================================================
       FORM HANDLING
       FRONTEND ONLY
    ===================================================== */

    const forms =
        document.querySelectorAll(
            ".partner-form, .member-form, .fellow-form, .volunteer-form, .internship-form"
        );


    forms.forEach(
        (form) => {

            form.addEventListener(
                "submit",
                (event) => {

                    event.preventDefault();


                    if (
                        !form.checkValidity()
                    ) {

                        form.reportValidity();

                        return;

                    }


                    const message =
                        form.querySelector(
                            ".form-message"
                        );


                    if (message) {

                        message.textContent =
                            "Thank you. Your application has been submitted successfully. The BCRLS backend will be connected later.";

                        message.classList.add(
                            "show"
                        );


                        message.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                    }

                }
            );

        }
    );


    /* =====================================================
       CURRENT YEAR
    ===================================================== */

    const year =
        document.getElementById(
            "currentYear"
        );


    if (year) {

        year.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       SMOOTH INTERNAL LINKS
    ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(
            (link) => {

                link.addEventListener(
                    "click",
                    (event) => {

                        const targetId =
                            link.getAttribute(
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


                        if (!target) return;


                        event.preventDefault();


                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }
                );

            }
        );


    /* =====================================================
       APPLICATION FILE VALIDATION
    ===================================================== */

    const fileInputs =
        document.querySelectorAll(
            'input[type="file"]'
        );


    fileInputs.forEach(
        (input) => {

            input.addEventListener(
                "change",
                () => {

                    const file =
                        input.files[0];


                    if (!file) return;


                    const allowedTypes = [

                        "application/pdf",

                        "application/msword",

                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

                    ];


                    if (
                        !allowedTypes.includes(
                            file.type
                        )
                    ) {

                        alert(
                            "Please upload a PDF, DOC or DOCX file."
                        );

                        input.value = "";

                        return;

                    }


                    /*
                     * Maximum 5 MB
                     */

                    const maxSize =
                        5 * 1024 * 1024;


                    if (
                        file.size > maxSize
                    ) {

                        alert(
                            "File size must be 5 MB or less."
                        );

                        input.value = "";

                    }

                }
            );

        }
    );

});