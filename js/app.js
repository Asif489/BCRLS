/* =========================================================
   BCRLS TEAM
   Infinite Circular Team Carousel
   ========================================================= */

const teamData = {

    advisory: [
        {
            name: "Dr. Nakib Muhammad Nasrullah",
            role: "Former Vice-Chancellor",
            fullRole: "Former Vice-Chancellor, Islamic University, Bangladesh; Professor, Department of Law, University of Dhaka",
            photo: "../assets/Advisors/Nakib.png",
            bio: "Former Vice-Chancellor, Islamic University, Bangladesh. Professor, Department of Law, University of Dhaka."
        },
        {
            name: "Professor Dr. Abdullah Al Faruque",
            role: "Professor & Former Dean",
            fullRole: "Professor, Former Dean, Faculty of Law, University of Chittagong",
            photo: "../assets/Advisors/Al Faruque.png",
            bio: "Professor, Former Dean, Faculty of Law, University of Chittagong."
        },
        {
            name: "Professor Dr. Muhammad Ekramul Haque",
            role: "Professor & Dean (Acting)",
            fullRole: "Professor, Department of Law; Dean (Acting), Faculty of Law, University of Dhaka",
            photo: "../assets/Advisors/Ekramul Haque.png",
            bio: "Professor, Department of Law, Dean (Acting), Faculty of Law, University of Dhaka."
        },
        {
            name: "Professor Dr. Rakiba Nabi",
            role: "Professor & Chairman",
            fullRole: "Chairman, Department of Law, University of Chittagong",
            photo: "../assets/Advisors/Nabi.png",
            bio: "Chairman, Department of Law, University of Chittagong."
        },
        {
            name: "Professor Christine Richardson",
            role: "Professor",
            fullRole: "Professor, Department of Law and Land Administration, Jagannath University",
            photo: "../assets/Advisors/Christine.png",
            bio: "Professor, Department of Law and Land Administration, Jagannath University."
        },
        {
            name: "Professor Dr. Md. Rizwanul Islam",
            role: "Dean",
            fullRole: "Dean, SHSS, North South University",
            photo: "../assets/Advisors/Rizwanul Islam.jpg",
            bio: "Dean, SHSS, North South University."
        },
        {
            name: "Dr. Hassan Faruk Al Imran",
            role: "Associate Professor (Law)",
            fullRole: "Associate Professor (Law), Independent University Bangladesh",
            photo: "../assets/Advisors/Al Imran.png",
            bio: "Associate Professor (Law), Independent University Bangladesh."
        },
        {
            name: "Dr. Jobair Alam",
            role: "Lecturer in Law",
            fullRole: "Lecturer in Law, University of Staffordshire",
            photo: "../assets/Advisors/Jobair.png",
            bio: "Lecturer in Law, University of Staffordshire."
        },
        {
            name: "A.B.M. Imdadul Haque Khan",
            role: "Dean",
            fullRole: "Dean, Faculty of Law, Eastern University",
            photo: "../assets/Advisors/imdad.png",
            bio: "Dean, Faculty of Law, Eastern University."
        }
    ],

    directors: [
        {
            name: "Sakhawat Sajjat Sejan",
            role: "Founder",
            fullRole: "Founder, BCRLS",
            photo: "../assets/Directors/Sejan.jpg",
            bio: "Sakhawat Sajjat Sejan is the Founder of BCRLS. He completed his LL.B. (Hons.) and LL.M. from the University of Chittagong. He is currently serving as an Assistant Professor in the Department of Law at University of Information Technology and Sciences. Previously, he worked as an Assistant Professor of Law at the Bangladesh University of Bangladesh and Feni University, where he also served as Head of the Department. He is an active researcher and writer on refugee law and protection."
        },
        {
            name: "Raspiatur Rashpi",
            role: "Director",
            fullRole: "Director, Head of Resource Management, Training & Development",
            photo: "../assets/Directors/Rashpi.jpg",
            bio: "Raspiatur Rashpi is currently working as a lecturer, Department of Law, University of Chittagong. She was also the former lecturer in Law, Bangladesh Army International University of Science and Technology. She completed her LLB (Honours) and LLM from Department of Law, University of Chittagong. Her research area of interest includes Climate Change and Environmental laws, Human Rights law, Constitutional law, Refugee law etc."
        },
        {
            name: "Niaz Mohammad",
            role: "Director",
            fullRole: "Director, Head of Research",
            photo: "../assets/Directors/Niaz.jpg",
            bio: "Niaz Mohammad is currently working as an Associate Legal Counsel at BRAC and serves as the Director of Research at BCRLS. He previously worked as a Legal Research Assistant at the Centre for Peace and Justice, where he focused on refugee law, including access to justice for Rohingyas in Bangladesh. He completed his LL.B. with distinction from BRAC University and holds a Diploma in Economic, Social and Development Rights from Kathmandu School of Law."
        },
        {
            name: "Md. Rahul Hasan Joy",
            role: "Director",
            fullRole: "Director, Head of Legal Affairs",
            photo: "../assets/Directors/Joy.jpg",
            bio: "Md. Rahul Hasan Joy completed his BA.LL.B. (Hons.) from Aligarh Muslim University, India, and his LL.M. in International Law from the University of Rajshahi. He is currently a Lecturer in the Department of Law at the University of Information Technology and Sciences (UITS). Previously, he served as a Lecturer of Law at Feni University. He is also an enrolled Advocate with the Bangladesh Bar Council."
        },
        {
            name: "Mohammad Tawhidul Islam Hridoy",
            role: "Director",
            fullRole: "Director, Head of IT",
            photo: "../assets/Directors/Tawhidul Islam.jpg",
            bio: "Mohammad Tawhidul Islam is a Lecturer in the Department of Law at the State University of Bangladesh and currently serves as Director of IT at BCRLS. He previously taught at Feni University and worked at US-Bangla Airlines in Company Secretary and Legal Affairs. He completed his LL.B. and LL.M. from Jahangirnagar University and obtained another LL.M. from South Asian University, New Delhi. His interests include teaching, research, and academic engagement activities."
        },
        {
            name: "Nabila Farhin",
            role: "Director",
            fullRole: "Director, Head of Programs",
            photo: "../assets/Directors/Nabila.jpg",
            bio: "Nabila Farhin completed her LL.B. (Hons.) and LL.M. (Thesis) from the University of Chittagong, where she ranked among the top students of her class. She also earned an MSS in Industrial Relations and Labour Studies from the University of Dhaka and a Diploma in Economic, Social and Development Rights from Kathmandu School of Law, Nepal. She is currently a Senior Lecturer at East West University and an Advocate of the Supreme Court of Bangladesh. Previously, she served as Staff Captain in the Judge Advocate General’s Office of the Bangladesh Army and worked as a consultant with TIB, ILO, and BLAST. Her research focuses on labour rights, gender justice, and climate justice."
        },
        {
            name: "Md. Riad Mahmud",
            role: "Director",
            fullRole: "Director of Administration and Finance",
            photo: "../assets/Directors/Riad.jpg",
            bio: "Md. Riad Mahmud is currently serving as a Senior Lecturer in the Department of Law at East West University. He is also an Erasmus Mundus Scholar and serves as an Advisor to Jessup Bangladesh. With experience in legal education, research, and international academic collaboration, he brings strong leadership to BCRLS. As Director of Administration and Finance, he contributes to strengthening the organization’s administrative structure, financial governance, and institutional development."
        },
        {
            name: "Sumaiya Islam",
            role: "Director",
            fullRole: "Director, Head of Public Relations",
            photo: "../assets/Directors/Sumaiya Islam.jpg",
            bio: "Sumaiya Islam completed her LL.B. (Hons.) and LL.M. from Southern University Bangladesh and an additional LL.M. from South Asian University. She is currently a Lecturer in the Department of Law at Manarat International University. She contributes to public engagement, awareness-building, and institutional networking at BCRLS."
        },
        {
            name: "Md. Omar Farque",
            role: "Executive Director",
            fullRole: "Executive Director",
            photo: "../assets/Directors/Omar Farque.jpg",
            bio: "Md. Omar Farque completed both his LL.B. (Hons.) and LL.M. from Eastern University, where he achieved outstanding academic results, including a Gold Medal in his LL.M. He is currently a Lecturer in Law at Eastern University. Previously, he served as a Lecturer in Law at the European University of Bangladesh. He also works as a Senior Research Associate at I. H. Khan & Associates and as an Assistant Editor at Revival Press. His research interests include Public International Law, Refugee Law, Climate Law, and Islamic Law."
        },
    ],

    operational: [
        {
            name: "Kazi Muhibul Haque",
            role: "Associate Head of IT",
            fullRole: "Associate Head of IT",
            photo: "",
            bio: "Associate Head of IT at BCRLS, supporting digital infrastructure, website operations, data management and technical initiatives."
        },
        {
            name: "Syed Md. Alamgir Hussain",
            role: "IT Officer",
            fullRole: "IT Officer",
            photo: "",
            bio: "IT Officer at BCRLS, supporting the organization's website, digital platforms and day-to-day technical operations."
        }
    ]
};


/* =========================================================
   SETTINGS
   ========================================================= */

const CARDS_DESKTOP = 4;
const CARDS_TABLET = 2;
const CARDS_MOBILE = 1;

const AUTO_DELAY = 3000;
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
        "memberModal"
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

    const track = container.querySelector(".team-track");
    if (!track) return 0;

    const visible = getVisibleCards();
    const gap = getTrackGap(track);
    const viewportWidth = container.clientWidth;

    if (!viewportWidth || !visible) return 0;

    // Calculate the exact width from the real viewport so the first
    // founder card always starts flush with the left edge.
    const cardWidth =
        (viewportWidth - gap * (visible - 1)) / visible;

    track.querySelectorAll(".member-card").forEach(card => {
        card.style.flexBasis = `${cardWidth}px`;
        card.style.width = `${cardWidth}px`;
    });

    return cardWidth + gap;
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


        <div class="member-card-hint" aria-hidden="true">
            <span>Profile</span>
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
                        button.dataset.team ||
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
    if (modalClose) modalClose.addEventListener("click", closeProfile);
    if (profileModal) profileModal.addEventListener("click", e => {
        if (e.target === profileModal || e.target.classList.contains("member-modal-overlay")) closeProfile();
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeProfile(); });
}

function openProfile(member) {
    if (!profileModal) return;
    const nameEl=document.getElementById("modalMemberName");
    const roleEl=document.getElementById("modalMemberRole");
    const detailsEl=document.getElementById("modalMemberDetails");
    const imageEl=document.getElementById("modalMemberImage");
    if(nameEl) nameEl.textContent=member.name||"";
    if(roleEl) roleEl.textContent=member.fullRole||member.role||"";
    if(detailsEl) detailsEl.textContent=member.bio&&member.bio.trim()?member.bio:"Profile details will be updated soon.";
    if(imageEl){
        const initials=getInitials(member.name);
        imageEl.alt=member.name||"BCRLS Team Member";
        imageEl.src=member.photo||""; imageEl.style.display=member.photo?"block":"none";
        imageEl.onerror=()=>{imageEl.style.display="none";const w=imageEl.parentElement;if(w&&!w.querySelector(".modal-member-placeholder")){const d=document.createElement("div");d.className="member-placeholder modal-member-placeholder";d.textContent=initials;w.appendChild(d);}};
    }
    profileModal.classList.add("active"); profileModal.setAttribute("aria-hidden","false"); document.body.style.overflow="hidden";
}

function closeProfile() {
    if(!profileModal)return; profileModal.classList.remove("active"); profileModal.setAttribute("aria-hidden","true"); document.body.style.overflow="";
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