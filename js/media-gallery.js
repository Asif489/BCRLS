(() => {
  const photos = [
    '../assets/gallery-drive/photo-01.jpg',
    '../assets/gallery-drive/photo-02.jpg',
    '../assets/gallery-drive/photo-03.jpg',
    '../assets/gallery-drive/photo-04.jpg',
    '../assets/gallery-drive/photo-05.jpg',
    '../assets/gallery-drive/photo-06.jpg',
    '../assets/gallery-drive/photo-07.jpg',
    '../assets/gallery-drive/photo-08.jpg',
    '../assets/gallery-drive/photo-09.jpg',
    '../assets/gallery-drive/photo-10.jpg',
    '../assets/gallery-drive/photo-11.jpg',
    '../assets/gallery-drive/photo-12.jpg',
    '../assets/gallery-drive/photo-13.jpg',
    '../assets/gallery-drive/photo-14.jpg',
    '../assets/gallery-drive/photo-15.jpg',
    '../assets/gallery-drive/photo-16.jpg',
    '../assets/gallery-drive/photo-17.jpg',
    '../assets/gallery-drive/photo-18.jpg',
    '../assets/gallery-drive/photo-19.jpg',
    '../assets/gallery-drive/photo-20.jpg',
    '../assets/gallery-drive/photo-21.jpg',
    '../assets/gallery-drive/photo-22.jpg',
    '../assets/gallery-drive/photo-23.jpg',
    '../assets/gallery-drive/photo-24.jpg',
    '../assets/gallery-drive/photo-25.jpg',
    '../assets/gallery-drive/photo-26.jpg',
    '../assets/gallery-drive/photo-27.jpg',
    '../assets/gallery-drive/photo-28.jpg',
    '../assets/gallery-drive/photo-29.jpg',
    '../assets/gallery-drive/photo-30.jpg',
    '../assets/gallery-drive/photo-31.jpg',
    '../assets/gallery-drive/photo-32.jpg',
    '../assets/gallery-drive/photo-33.jpg',
    '../assets/gallery-drive/photo-34.jpg',
    '../assets/gallery-drive/photo-35.jpg',
    '../assets/gallery-drive/photo-36.jpg',
    '../assets/gallery-drive/photo-37.jpg',
    '../assets/gallery-drive/photo-38.jpg',
    '../assets/gallery-drive/photo-39.jpg',
  ];
  const ROTATE_MS = 3000;
  const imageEl = document.getElementById('mediaSlideImage');
  const prevBtn = document.getElementById('mediaPrev');
  const nextBtn = document.getElementById('mediaNext');
  let current = 0;
  let timer;

  function show(index) {
    if (!photos.length || !imageEl) return;
    current = (index + photos.length) % photos.length;
    imageEl.src = photos[current];
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), ROTATE_MS);
  }

  prevBtn?.addEventListener('click', () => { show(current - 1); restart(); });
  nextBtn?.addEventListener('click', () => { show(current + 1); restart(); });
  show(0);
  restart();
})();
