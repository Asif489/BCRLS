document.addEventListener("DOMContentLoaded", () => {
  const image = document.getElementById("galleryMainImage");
  const caption = document.getElementById("galleryCaption");
  const prev = document.getElementById("galleryPrev");
  const next = document.getElementById("galleryNext");
  const progress = document.getElementById("galleryProgress");
  if (!image || !caption || !progress) return;

  const photos = [
    ["../assets/events/du_1.jpeg", "University of Dhaka — BCRLS panel discussion"],
    ["../assets/events/du_02.jpeg", "University of Dhaka — Academic discussion"],
    ["../assets/events/du_03.jpeg", "University of Dhaka — Participants"],
    ["../assets/events/canadian_uni_1.jpeg", "Canadian University — Refugee law seminar"],
    ["../assets/events/canadian_uni_2.jpeg", "Canadian University — Seminar session"],
    ["../assets/events/online_01.jpeg", "BCRLS Online Lecture Series"],
    ["../assets/events/online_02.jpeg", "BCRLS Online Lecture Series — Lecture"],
    ["../assets/events/online_03.jpeg", "BCRLS Online Lecture Series — Participants"],
    ["../assets/events/Conference.jpeg", "BCRLS Conference"],
    ["../assets/events/Conference-23.jpeg", "BCRLS Conference — Session"],
    ["../assets/events/inargument.jpeg", "BCRLS Inaugural Lecture Series"],
    ["../assets/events/qa_session_james.jpeg", "Session with Professor James C. Hathaway"],
    ["../assets/events/lecture_series.jpeg", "Lecture with Kate Ogg"],
    ["../assets/events/interdisciplinary.jpeg", "Workshop on Interdisciplinary Legal Writing"],
    ["../assets/events/workshop.jpeg", "Workshop on Refugee Law Research"],
    ["../assets/events/temporary_protection.jpeg", "Session on Temporary Protection"],
    ["../assets/events/qa_jeny.jpeg", "Q&A with Jane McAdam"],
    ["../assets/events/south_asia_nafees.jpeg", "Session with Nafees Ahmad"],
    ["../assets/events/Field_Visit-2.jpeg", "Field Visit to Bhasan Char"],
    ["../assets/events/Field_Vist-1.jpeg", "Field Visit to Bhasan Char — field activity"],
    ["../assets/events/Foundations.jpeg", "Seminar on Foundations of Refugee Law"],
    ["../assets/events/Asylum Under International Refugee Law.jpeg", "Special Lecture — Asylum Under International Refugee Law"],
    ["../assets/events/Justice_Accountibi.jpeg", "Academic Dialogue on the Rohingya Genocide"]
  ];

  let index = 0;
  const duration = 2000;
  let elapsed = 0;
  let last = performance.now();
  let timer;

  function show(i) {
    index = (i + photos.length) % photos.length;
    image.classList.add("is-changing");
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      image.src = photos[index][0];
      image.alt = photos[index][1];
      caption.textContent = photos[index][1];
      image.onload = () => image.classList.remove("is-changing");
      image.classList.remove("is-changing");
    }, 120);
    elapsed = 0;
  }

  prev?.addEventListener("click", () => show(index - 1));
  next?.addEventListener("click", () => show(index + 1));

  const stage = document.querySelector(".media-slide-stage");
  if (stage) {
    let touchX = null;
    stage.addEventListener("touchstart", e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  }

  function tick(now) {
    elapsed += now - last;
    last = now;
    progress.style.width = `${Math.min(100, (elapsed / duration) * 100)}%`;
    if (elapsed >= duration) show(index + 1);
    requestAnimationFrame(tick);
  }

  show(0);
  requestAnimationFrame(tick);
});
