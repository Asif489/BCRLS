document.addEventListener("DOMContentLoaded", () => {
  const image = document.getElementById("galleryMainImage");
  const caption = document.getElementById("galleryCaption");
  const prev = document.getElementById("galleryPrev");
  const next = document.getElementById("galleryNext");
  const thumbs = document.getElementById("galleryThumbs");
  const progress = document.getElementById("galleryProgress");
  if (!image || !thumbs) return;

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
    ["../assets/events/lecture_series.jpeg", "BCRLS Lecture Series"],
    ["../assets/events/workshop.jpeg", "BCRLS Workshop"]
  ];

  let index = 0;
  let elapsed = 0;
  const duration = 2000;

  photos.forEach(([src, text], i) => {
    const btn = document.createElement("button");
    btn.className = "media-slide-thumb";
    btn.type = "button";
    btn.setAttribute("aria-label", `Show photo ${i + 1}`);
    btn.innerHTML = `<img src="${src}" alt="" loading="lazy">`;
    btn.addEventListener("click", () => show(i));
    thumbs.appendChild(btn);
  });

  const thumbEls = [...thumbs.children];

  function show(i) {
    index = (i + photos.length) % photos.length;
    image.classList.add("is-changing");
    window.setTimeout(() => {
      image.src = photos[index][0];
      image.alt = photos[index][1];
      caption.textContent = photos[index][1];
      image.onload = () => image.classList.remove("is-changing");
    }, 180);
    thumbEls.forEach((el, n) => el.classList.toggle("active", n === index));
    elapsed = 0;
  }

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  const stage = document.querySelector(".media-slide-stage");

  let touchX = null;
  stage.addEventListener("touchstart", e => { touchX = e.changedTouches[0].clientX; }, {passive:true});
  stage.addEventListener("touchend", e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) show(index + (dx < 0 ? 1 : -1));
    touchX = null;
  }, {passive:true});

  function tick(now) {
    elapsed += now - last;
    last = now;
    progress.style.width = `${Math.min(100, (elapsed / duration) * 100)}%`;
    if (elapsed >= duration) show(index + 1);
    requestAnimationFrame(tick);
  }

  last = performance.now();
  show(0);
  requestAnimationFrame(tick);
});
