document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector("[data-home-event-slider]");
    if (!slider) return;

    const track = slider.querySelector(".home-event-track");
    const originalSlides = [...track.querySelectorAll(".home-event-slide")];
    if (!track || originalSlides.length < 2) return;

    // Clone the first and last slides for a seamless infinite carousel.
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");
    track.appendChild(firstClone);
    track.insertBefore(lastClone, originalSlides[0]);

    const total = originalSlides.length;
    let index = 1;
    let timer = null;
    let isAnimating = false;

    function render(animate = true) {
        track.style.transition = animate
            ? "transform .55s cubic-bezier(.22,.61,.36,1)"
            : "none";
        track.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
    }

    function goTo(nextIndex) {
        if (isAnimating) return;
        index = nextIndex;
        isAnimating = true;
        render(true);
    }

    track.addEventListener("transitionend", () => {
        if (index === 0) {
            index = total;
            render(false);
        } else if (index === total + 1) {
            index = 1;
            render(false);
        }
        isAnimating = false;
    });

    function start() {
        stop();
        timer = window.setInterval(() => {
            if (!isAnimating) goTo(index + 1);
        }, 2000);
    }

    function stop() {
        if (timer) window.clearInterval(timer);
        timer = null;
    }

    // Pause while the user is viewing the carousel.
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    let touchStartX = 0;
    slider.addEventListener("touchstart", e => {
        touchStartX = e.changedTouches[0].clientX;
        stop();
    }, { passive: true });

    slider.addEventListener("touchend", e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 45) {
            goTo(index + (dx < 0 ? 1 : -1));
        }
        start();
    }, { passive: true });

    render(false);
    start();
});
