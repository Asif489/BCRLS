document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.querySelector(".main-nav");

    if (menuToggle && mainNav) {

        const menuOverlay = document.createElement("div");
        menuOverlay.className = "menu-overlay";

        document.body.appendChild(menuOverlay);

        function openMenu() {
            menuToggle.classList.add("active");
            mainNav.classList.add("active");
            menuOverlay.classList.add("active");

            document.body.style.overflow = "hidden";
        }

        function closeMenu() {
            menuToggle.classList.remove("active");
            mainNav.classList.remove("active");
            menuOverlay.classList.remove("active");

            document.body.style.overflow = "";
        }

        menuToggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (mainNav.classList.contains("active")) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        menuOverlay.addEventListener("click", closeMenu);


        /* Close menu when normal link is clicked */

        const navLinks = mainNav.querySelectorAll(
            "a:not(.nav-dropdown-toggle)"
        );

        navLinks.forEach(link => {

            link.addEventListener("click", () => {

                if (window.innerWidth <= 900) {
                    closeMenu();
                }

            });

        });


        /* Close menu when screen becomes desktop */

        window.addEventListener("resize", () => {

            if (window.innerWidth > 900) {
                closeMenu();
            }

        });

    }


    /* =====================================================
       MOBILE DROPDOWNS
    ===================================================== */

    const dropdowns = document.querySelectorAll(".nav-dropdown");

    dropdowns.forEach(dropdown => {

        const toggle = dropdown.querySelector(
            ".nav-dropdown-toggle"
        );

        if (!toggle) return;

        toggle.addEventListener("click", (e) => {

            if (window.innerWidth <= 900) {

                e.preventDefault();

                dropdowns.forEach(otherDropdown => {

                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove("open");
                    }

                });

                dropdown.classList.toggle("open");

            }

        });

    });


    /* =====================================================
       HEADER SCROLL EFFECT
    ===================================================== */

    const header = document.querySelector(".site-header");

    function handleHeaderScroll() {

        if (!header) return;

        if (window.scrollY > 30) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    }

    window.addEventListener("scroll", handleHeaderScroll);

    handleHeaderScroll();


    /* =====================================================
       SCROLL REVEAL
    ===================================================== */

    const revealElements = document.querySelectorAll(".reveal");

    if (revealElements.length) {

        const observer = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12
            }
        );

        revealElements.forEach(element => {
            observer.observe(element);
        });

    }


    /* =====================================================
       SMOOTH ANCHOR SCROLL
    ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", function(e) {

            const targetId = this.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            e.preventDefault();

            const headerHeight =
                document.querySelector(".site-header")?.offsetHeight || 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                15;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

        });

    });


    /* =====================================================
       ESC KEY CLOSE MENU
    ===================================================== */

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            const menu = document.querySelector(".main-nav");
            const toggle = document.querySelector(".menu-toggle");
            const overlay = document.querySelector(".menu-overlay");

            if (menu) menu.classList.remove("active");
            if (toggle) toggle.classList.remove("active");
            if (overlay) overlay.classList.remove("active");

            document.body.style.overflow = "";

        }

    });

});