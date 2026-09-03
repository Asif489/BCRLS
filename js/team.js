document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       TEAM DATA
    ===================================================== */

    const advisoryData = [

        {
            name: "Dr. Nakib Muhammad Nasrullah",

            role:
                "Former Vice-Chancellor, Islamic University, Bangladesh",

            details:
                "Professor, Department of Law, University of Dhaka",

            image:
                "../assets/Advisors/Nakib.png"
        },


        {
            name:
                "Professor Dr. Abdullah Al Faruque",

            role:
                "Professor, Former Dean, Faculty of Law, University of Chittagong",

            details:
                "Professor, Former Dean Faculty of Law, University of Chittagong",

            image:
                "../assets/Advisors/Al Faruque.png"
        },


        {
            name:
                "Professor Dr. Muhammad Ekramul Haque",

            role:
                "Professor, Department of Law, Dean (Acting), Faculty of Law, University of Dhaka",

            details:
                "Professor, Department of Law, Dean (Acting), Faculty of Law, University of Dhaka",

            image:
                "../assets/Advisors/Ekramul Haque.png"
        },


        {
            name:
                "Professor Dr. Rakiba Nabi",

            role:
                "Chairman, Department of Law, University of Chittagong",

            details:
                "Chairman, Department of Law, University of Chittagong",

            image:
                "../assets/Advisors/Nabi.png"
        },


        {
            name:
                "Professor Christine Richardson",

            role:
                "Professor, Department of Law and Land Administration, Jagannath University",

            details:
                "Professor, Department of Law and Land Administration, Jagannath University",

            image:
                "../assets/Advisors/Christine.png"
        },


        {
            name:
                "Professor Dr. Md. Rizwanul Islam",

            role:
                "Dean, SHSS, North South University",

            details:
                "Dean, SHSS, North South University",

            image:
                "../assets/Advisors/Rizwanul Islam.jpg"
        },


        {
            name:
                "Dr. Hassan Faruk Al Imran",

            role:
                "Associate Professor (Law), Independent University Bangladesh",

            details:
                "Associate Professor (Law), Independent University Bangladesh",

            image:
                "../assets/Advisors/Al Imran.png"
        },


        {
            name:
                "Dr. Jobair Alam",

            role:
                "Lecturer in Law, University of Staffordshire",

            details:
                "Lecturer in Law, University of Staffordshire",

            image:
                "../assets/Advisors/Jobair.png"
        },


        {
            name:
                "A.B.M. Imdadul Haque Khan",

            role:
                "Dean, Faculty of Law, Eastern University",

            details:
                "Dean, Faculty of Law, Eastern University",

            image:
                "../assets/Advisors/imdad.png"
        }

    ];


    /* =====================================================
       DIRECTORS
    ===================================================== */

    const directorsData = [

        {
            name:
                "Sakhawat Sajjat Sejan",

            role:
                "Founder",

            details:
                "Sakhawat Sajjat Sejan is the Founder of BCRLS. He completed his LL.B. (Hons.) and LL.M. from the University of Chittagong. He is currently serving as an Assistant Professor in the Department of Law at University of Information Technology and Sciences. Previously, he worked as an Assistant Professor of Law at the Bangladesh University of Bangladesh and Feni University, where he also served as Head of the Department. He is an active researcher and writer on refugee law and protection.",

            image:
                "../assets/Directors/Sejan.jpg"
        },


        {
            name:
                "Raspiatur Rashpi",

            role:
                "Director, Head of Resource Management, Training & Development",

            details:
                "Raspiatur Rashpi is currently working as a lecturer, Department of Law, University of Chittagong. She was also the former lecturer in Law, Bangladesh Army International University of Science and Technology. She completed her LLB (Honours) and LLM from Department of Law, University of Chittagong. Her research area of interest includes Climate Change and Environmental laws, Human Rights law, Constitutional law, Refugee law etc.",

            image:
                "../assets/Directors/Rashpi.jpg"
        },


        {
            name:
                "Niaz Mohammad",

            role:
                "Director, Head of Research",

            details:
                "Niaz Mohammad is currently working as an Associate Legal Counsel at BRAC and serves as the Director of Research at BCRLS. He previously worked as a Legal Research Assistant at the Centre for Peace and Justice, where he focused on refugee law, including access to justice for Rohingyas in Bangladesh. He completed his LL.B. with distinction from BRAC University and holds a Diploma in Economic, Social and Development Rights from Kathmandu School of Law.",

            image:
                "../assets/Directors/Niaz.jpg"
        },


        {
            name:
                "Md. Rahul Hasan Joy",

            role:
                "Director, Head of Legal Affairs",

            details:
                "Md. Rahul Hasan Joy completed his BA.LL.B. (Hons.) from Aligarh Muslim University, India, and his LL.M. in International Law from the University of Rajshahi. He is currently a Lecturer in the Department of Law at the University of Information Technology and Sciences (UITS). Previously, he served as a Lecturer of Law at Feni University. He is also an enrolled Advocate with the Bangladesh Bar Council.",

            image:
                "../assets/Directors/Joy.jpg"
        },


        {
            name:
                "Mohammad Tawhidul Islam Hridoy",

            role:
                "Director, Head of IT",

            details:
                "Mohammad Tawhidul Islam is a Lecturer in the Department of Law at the State University of Bangladesh and currently serves as Director of IT at BCRLS. He previously taught at Feni University and worked at US-Bangla Airlines in Company Secretary and Legal Affairs. He completed his LL.B. and LL.M. from Jahangirnagar University and obtained another LL.M. from South Asian University, New Delhi. His interests include teaching, research, and academic engagement activities.",

            image:
                "../assets/Directors/Tawhidul Islam.jpg"
        },


        {
            name:
                "Sumaiya Islam",

            role:
                "Director, Head of Public Relations",

            details:
                "Sumaiya Islam completed her LL.B. (Hons.) and LL.M. from Southern University Bangladesh and an additional LL.M. from South Asian University. She is currently a Lecturer in the Department of Law at Manarat International University. She contributes to public engagement, awareness-building, and institutional networking at BCRLS.",

            image:
                "../assets/Directors/Sumaiya Islam.jpg"
        },


        {
            name:
                "Md. Omar Farque",

            role:
                "Executive Director",

            details:
                "Md. Omar Farque completed both his LL.B. (Hons.) and LL.M. from Eastern University, where he achieved outstanding academic results, including a Gold Medal in his LL.M. He is currently a Lecturer in Law at Eastern University. Previously, he served as a Lecturer in Law at the European University of Bangladesh. He also works as a Senior Research Associate at I. H. Khan & Associates and as an Assistant Editor at Revival Press. His research interests include Public International Law, Refugee Law, Climate Law, and Islamic Law.",

            image:
                "../assets/Directors/Omar Farque.jpg"
        },


        {
            name:
                "Nabila Farhin",

            role:
                "Director, Head of Programs",

            details:
                "Nabila Farhin completed her LL.B. (Hons.) and LL.M. (Thesis) from the University of Chittagong, where she ranked among the top students of her class. She also earned an MSS in Industrial Relations and Labour Studies from the University of Dhaka and a Diploma in Economic, Social and Development Rights from Kathmandu School of Law, Nepal. She is currently a Senior Lecturer at East West University and an Advocate of the Supreme Court of Bangladesh. Previously, she served as Staff Captain in the Judge Advocate General’s Office of the Bangladesh Army and worked as a consultant with TIB, ILO, and BLAST. Her research focuses on labour rights, gender justice, and climate justice.",

            image:
                "../assets/Directors/Nabila.jpg"
        },


        {
            name:
                "Md. Riad Mahmud",

            role:
                "Director of Administration and Finance",

            details:
                "Md. Riad Mahmud is currently serving as a Senior Lecturer in the Department of Law at East West University. He is also an Erasmus Mundus Scholar and serves as an Advisor to Jessup Bangladesh. With experience in legal education, research, and international academic collaboration, he brings strong leadership to BCRLS. As Director of Administration and Finance, he contributes to strengthening the organization’s administrative structure, financial governance, and institutional development.",

            image:
                "../assets/Directors/Riad.jpg"
        }

    ];


    /* =====================================================
       HELPER
    ===================================================== */

    function escapeHTML(value) {

        return String(value).replace(
            /[&<>"']/g,

            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            })[character]
        );

    }


    /* =====================================================
       NUMBER OF CARDS
    ===================================================== */

    function cardsPerSlide() {

        if (window.innerWidth <= 640) {
            return 1;
        }

        if (window.innerWidth <= 900) {
            return 2;
        }

        return 3;

    }


    /* =====================================================
       CREATE SLIDER
    ===================================================== */

    function createSlider(container, data) {

        if (!container || !data.length) {
            return;
        }


        container.innerHTML = "";


        const slider =
            document.createElement("div");

        slider.className =
            "team-slider";


        const viewport =
            document.createElement("div");

        viewport.className =
            "team-slider-viewport";


        const track =
            document.createElement("div");

        track.className =
            "team-slider-track";


        viewport.appendChild(track);

        slider.appendChild(viewport);


        /* CONTROLS */

        const controls =
            document.createElement("div");

        controls.className =
            "team-slider-controls";


        const prev =
            document.createElement("button");

        prev.type = "button";

        prev.className =
            "team-slider-arrow";

        prev.setAttribute(
            "aria-label",
            "Previous team members"
        );

        prev.innerHTML =
            '<i class="fa-solid fa-chevron-left"></i>';


        const dots =
            document.createElement("div");

        dots.className =
            "team-slider-dots";


        const next =
            document.createElement("button");

        next.type = "button";

        next.className =
            "team-slider-arrow";

        next.setAttribute(
            "aria-label",
            "Next team members"
        );

        next.innerHTML =
            '<i class="fa-solid fa-chevron-right"></i>';


        controls.append(
            prev,
            dots,
            next
        );

        slider.appendChild(
            controls
        );

        container.appendChild(
            slider
        );


        let current = 0;

        let groups = [];

        let timer = null;

        let touchStartX = 0;


        /* =================================================
           BUILD GROUPS
        ================================================= */

        function buildGroups() {

            const count =
                cardsPerSlide();


            groups = [];


            for (
                let i = 0;
                i < data.length;
                i += count
            ) {

                groups.push(
                    data.slice(
                        i,
                        i + count
                    )
                );

            }


            track.innerHTML = "";


            groups.forEach(
                (group, groupIndex) => {

                    const slide =
                        document.createElement(
                            "div"
                        );

                    slide.className =
                        "team-slide";


                    group.forEach(
                        member => {

                            const card =
                                document.createElement(
                                    "article"
                                );

                            card.className =
                                "member-card";

                            card.tabIndex = 0;

                            card.setAttribute(
                                "role",
                                "button"
                            );

                            card.setAttribute(
                                "aria-label",
                                `Open profile of ${member.name}`
                            );


                            card.innerHTML = `

                                <div class="member-image-wrap">

                                    <img
                                        class="member-photo"
                                        src="${escapeHTML(member.image)}"
                                        alt="${escapeHTML(member.name)}"
                                        loading="${
                                            groupIndex === 0
                                                ? "eager"
                                                : "lazy"
                                        }"
                                    >

                                </div>


                                <div class="member-info">

                                    <h3 class="member-name">
                                        ${escapeHTML(member.name)}
                                    </h3>

                                    <p class="member-role">
                                        ${escapeHTML(member.role)}
                                    </p>

                                </div>

                            `;


                            const open =
                                () =>
                                    openModal(
                                        member
                                    );


                            card.addEventListener(
                                "click",
                                open
                            );


                            card.addEventListener(
                                "keydown",
                                event => {

                                    if (
                                        event.key ===
                                            "Enter" ||
                                        event.key ===
                                            " "
                                    ) {

                                        event.preventDefault();

                                        open();

                                    }

                                }
                            );


                            slide.appendChild(
                                card
                            );

                        }
                    );


                    track.appendChild(
                        slide
                    );

                }
            );


            /* DOTS */

            dots.innerHTML = "";


            groups.forEach(
                (_, index) => {

                    const dot =
                        document.createElement(
                            "button"
                        );

                    dot.type = "button";

                    dot.className =
                        "team-slider-dot";

                    dot.setAttribute(
                        "aria-label",
                        `Go to slide ${index + 1}`
                    );


                    dot.addEventListener(
                        "click",
                        () => goTo(index)
                    );


                    dots.appendChild(
                        dot
                    );

                }
            );


            current =
                Math.min(
                    current,
                    Math.max(
                        groups.length - 1,
                        0
                    )
                );


            update();

        }


        /* =================================================
           UPDATE
        ================================================= */

        function update() {

            track.style.transform =
                `translateX(-${current * 100}%)`;


            [
                ...dots.children
            ].forEach(
                (dot, index) => {

                    dot.classList.toggle(
                        "active",
                        index === current
                    );

                }
            );

        }


        /* =================================================
           GO TO
        ================================================= */

        function goTo(index) {

            if (!groups.length) {
                return;
            }


            current =
                (index + groups.length)
                % groups.length;


            update();

            restartTimer();

        }


        /* =================================================
           NEXT / PREVIOUS
        ================================================= */

        function nextSlide() {

            goTo(
                current + 1
            );

        }


        function prevSlide() {

            goTo(
                current - 1
            );

        }


        /* =================================================
           TIMER
        ================================================= */

        function restartTimer() {

            clearInterval(timer);

            timer =
                setInterval(
                    nextSlide,
                    30000
                );

        }


        /* =================================================
           BUTTONS
        ================================================= */

        prev.addEventListener(
            "click",
            prevSlide
        );


        next.addEventListener(
            "click",
            nextSlide
        );


        /* =================================================
           HOVER PAUSE
        ================================================= */

        viewport.addEventListener(
            "mouseenter",
            () => clearInterval(timer)
        );


        viewport.addEventListener(
            "mouseleave",
            restartTimer
        );


        /* =================================================
           TOUCH SWIPE
        ================================================= */

        viewport.addEventListener(
            "touchstart",
            event => {

                touchStartX =
                    event.changedTouches[0]
                        .screenX;

                clearInterval(timer);

            },
            {
                passive: true
            }
        );


        viewport.addEventListener(
            "touchend",
            event => {

                const diff =
                    event.changedTouches[0]
                        .screenX
                    -
                    touchStartX;


                if (
                    Math.abs(diff) > 45
                ) {

                    diff < 0
                        ? nextSlide()
                        : prevSlide();

                }
                else {

                    restartTimer();

                }

            },
            {
                passive: true
            }
        );


        /* =================================================
           RESIZE
        ================================================= */

        let resizeTimeout;


        window.addEventListener(
            "resize",
            () => {

                clearTimeout(
                    resizeTimeout
                );


                resizeTimeout =
                    setTimeout(
                        buildGroups,
                        150
                    );

            }
        );


        buildGroups();

        restartTimer();

    }


    /* =====================================================
       MODAL ELEMENTS
    ===================================================== */

    const modal =
        document.getElementById(
            "memberModal"
        );


    const modalOverlay =
        document.getElementById(
            "modalOverlay"
        );


    const modalClose =
        document.getElementById(
            "modalClose"
        );


    const modalImage =
        document.getElementById(
            "modalMemberImage"
        );


    const modalName =
        document.getElementById(
            "modalMemberName"
        );


    const modalRole =
        document.getElementById(
            "modalMemberRole"
        );


    const modalDetails =
        document.getElementById(
            "modalMemberDetails"
        );


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    function openModal(member) {

        if (!modal) {
            return;
        }


        modalImage.src =
            member.image;


        modalImage.alt =
            member.name;


        modalName.textContent =
            member.name;


        modalRole.textContent =
            member.role;


        modalDetails.textContent =
            member.details;


        modal.classList.add(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "modal-open"
        );


        modalClose?.focus();

    }


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeModal() {

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "modal-open"
        );

    }


    modalClose?.addEventListener(
        "click",
        closeModal
    );


    modalOverlay?.addEventListener(
        "click",
        closeModal
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal?.classList.contains(
                    "active"
                )
            ) {

                closeModal();

            }

        }
    );


    /* =====================================================
       TEAM SELECTOR
    ===================================================== */

    const selectorButtons =
        document.querySelectorAll(
            ".team-selector-btn"
        );


    const panels =
        document.querySelectorAll(
            ".team-panel"
        );


    selectorButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const target =
                        button.dataset.team;


                    selectorButtons.forEach(
                        btn => {

                            btn.classList.toggle(
                                "active",
                                btn === button
                            );

                        }
                    );


                    panels.forEach(
                        panel => {

                            panel.classList.toggle(
                                "active",
                                panel.id === target
                            );

                        }
                    );

                }
            );

        }
    );


    /* =====================================================
       CREATE SLIDERS
    ===================================================== */

    createSlider(
        document.getElementById(
            "advisoryGrid"
        ),
        advisoryData
    );


    createSlider(
        document.getElementById(
            "directorsGrid"
        ),
        directorsData
    );


    /* =====================================================
       OPERATIONAL TEAM
    ===================================================== */

    const operationalGrid =
        document.getElementById(
            "operationalGrid"
        );


    if (operationalGrid) {

        operationalGrid.innerHTML = `

            <div class="operational-empty">

                Operational Team profiles will be added
                here once the official member information
                and photographs are finalized.

            </div>

        `;

    }


    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );


    const mainNav =
        document.getElementById(
            "mainNav"
        );


    const menuOverlay =
        document.getElementById(
            "menuOverlay"
        );


    function closeMobileMenu() {

        document.body.classList.remove(
            "nav-open"
        );


        mainNav?.classList.remove(
            "active"
        );


        menuOverlay?.classList.remove(
            "active"
        );


        menuToggle?.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    menuToggle?.addEventListener(
        "click",
        () => {

            const isOpen =
                mainNav?.classList.toggle(
                    "active"
                );


            document.body.classList.toggle(
                "nav-open",
                isOpen
            );


            menuOverlay?.classList.toggle(
                "active",
                isOpen
            );


            menuToggle.setAttribute(
                "aria-expanded",
                String(
                    Boolean(isOpen)
                )
            );

        }
    );


    menuOverlay?.addEventListener(
        "click",
        closeMobileMenu
    );


    document.querySelectorAll(
        ".main-nav a"
    ).forEach(
        link => {

            link.addEventListener(
                "click",
                closeMobileMenu
            );

        }
    );


    /* =====================================================
       MOBILE DROPDOWN
    ===================================================== */

    document.querySelectorAll(
        ".nav-dropdown-toggle"
    ).forEach(
        toggle => {

            toggle.addEventListener(
                "click",
                event => {

                    if (
                        window.innerWidth <= 900
                    ) {

                        event.preventDefault();


                        const dropdown =
                            toggle.closest(
                                ".nav-dropdown"
                            );


                        const wasOpen =
                            dropdown.classList.contains(
                                "open"
                            );


                        document
                            .querySelectorAll(
                                ".nav-dropdown.open"
                            )
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "open"
                                    );

                                }
                            );


                        if (!wasOpen) {

                            dropdown.classList.add(
                                "open"
                            );

                        }

                    }

                }
            );

        }
    );

});