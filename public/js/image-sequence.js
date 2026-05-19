(function () {
  'use strict';

  var section = document.getElementById('create-sequence');
  if (!section) return;

  var img = section.querySelector('.sequence-frame');
  if (!img) return;

  var FRAME_COUNT = 65;
  var FRAME_PATH = '/images/sequence/create/frame_';
  var FRAME_EXT = '.jpg';

  function getFrameSrc(index) {
    return FRAME_PATH + String(index).padStart(4, '0') + FRAME_EXT;
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  // Reduced motion: set frame 1, no animation
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    img.src = getFrameSrc(1);
    return;
  }

  // Mobile (<768px): static display, no scroll animation
  if (window.innerWidth < 768) {
    img.src = getFrameSrc(1);
    return;
  }

  var currentFrame = 1;
  var rafPending = false;
  var preloadCache = {};
  var lastGoodSrc = getFrameSrc(1);

  // Set initial frame
  img.src = lastGoodSrc;

  // Graceful fallback: if a frame fails to load, restore the last good frame
  img.addEventListener('load', function () {
    img.style.visibility = '';
    lastGoodSrc = img.src;
  });
  img.addEventListener('error', function () {
    if (img.src !== lastGoodSrc) {
      img.src = lastGoodSrc;
    } else {
      // Even frame 1 is missing — hide to avoid broken icon
      img.style.visibility = 'hidden';
    }
  });

  function preloadFrame(index) {
    if (index < 1 || index > FRAME_COUNT) return;
    if (preloadCache[index]) return;
    var im = new Image();
    im.src = getFrameSrc(index);
    preloadCache[index] = im;
  }

  // Preload first 15 frames immediately for a fast start
  for (var i = 1; i <= Math.min(15, FRAME_COUNT); i++) {
    preloadFrame(i);
  }

  // Preload remaining frames after a short delay to avoid blocking initial load
  setTimeout(function () {
    for (var j = 16; j <= FRAME_COUNT; j++) {
      preloadFrame(j);
    }
  }, 1000);

  function updateFrame() {
    rafPending = false;

    var rect = section.getBoundingClientRect();
    var scrollable = rect.height - window.innerHeight;
    if (scrollable <= 0) return;

    var progress = clamp(-rect.top / scrollable, 0, 1);
    var frame = Math.max(1, Math.min(FRAME_COUNT, Math.floor(progress * (FRAME_COUNT - 1)) + 1));

    if (frame === currentFrame) return;

    // Preload frames around current position on demand
    for (var k = Math.max(1, frame - 4); k <= Math.min(FRAME_COUNT, frame + 8); k++) {
      preloadFrame(k);
    }

    img.src = getFrameSrc(frame);
    currentFrame = frame;
  }

  function onScroll() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateFrame);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial draw in case section is already in view
  updateFrame();

  // Re-evaluate on resize (e.g. orientation change to landscape)
  window.addEventListener('resize', function () {
    if (window.innerWidth < 768) return;
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateFrame);
    }
  }, { passive: true });
})();
