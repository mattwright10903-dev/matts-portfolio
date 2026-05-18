/* ══════════════════════════════════════════════════════════════════
   Portfolio Dome Gallery — portfolio-gallery.js
   Curved-arc draggable carousel. Loaded only on /portfolio.
   Mobile (≤ 640px) uses CSS scroll-snap — this script returns early.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Guards ── */
  var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.innerWidth <= 640) return; // mobile: CSS handles scroll

  var stage = document.querySelector('[data-pgal-stage]');
  if (!stage) return;

  var cards = Array.from(stage.querySelectorAll('[data-pgal-card]'));
  if (!cards.length) return;

  var count   = cards.length;
  var offset  = Math.floor(count / 2); // start centered on middle card
  var rafId   = null;

  /* Drag state */
  var isDragging     = false;
  var dragStartX     = 0;
  var dragStartOff   = 0;
  var dragDelta      = 0;
  var lastX          = 0;
  var lastT          = 0;
  var velTracker     = 0;
  var inertiaVel     = 0;

  /* ── Responsive spacing ── */
  function getSpacing() {
    var w = window.innerWidth;
    if (w >= 1200) return 320;
    if (w >= 1000) return 290;
    if (w >=  800) return 258;
    return 228;
  }

  function getCardW() {
    var w = window.innerWidth;
    if (w >= 1200) return 256;
    if (w >=  900) return 220;
    return 200;
  }

  /* ── Core transform computation ── */
  function applyTransforms(off) {
    off = (off !== undefined) ? off : offset;
    var sp      = getSpacing();
    var centerI = Math.round(Math.max(0, Math.min(count - 1, off)));
    var dots    = document.querySelectorAll('[data-pgal-dot]');

    cards.forEach(function (card, i) {
      var d  = i - off;
      var ad = Math.abs(d);

      /* Horizontal spread */
      var tx = d * sp;

      /* Downward arc from center — quadratic falloff */
      var ty = Math.min(ad * ad * 16, 92);

      /* Depth: center is largest */
      var sc = Math.max(0.56, 1 - ad * 0.115);

      /* Gentle Y-axis rotation for dome perspective */
      var ry = Math.max(-26, Math.min(26, d * -9));

      /* Opacity: fade distant cards */
      var op = Math.max(0.22, 1 - ad * 0.22);

      /* Stacking order: center on top */
      var zi = Math.max(0, Math.round(20 - ad * 3));

      card.style.transform =
        'translateX(' + tx.toFixed(1) + 'px)' +
        ' translateY(' + ty.toFixed(1) + 'px)' +
        ' scale(' + sc.toFixed(3) + ')' +
        ' rotateY(' + ry.toFixed(1) + 'deg)';

      card.style.opacity = op.toFixed(3);
      card.style.zIndex  = zi;

      var isCenter = (i === centerI);
      card.classList.toggle('is-center', isCenter);

      /* Only allow pointer interaction on center + immediate neighbours */
      card.style.pointerEvents = (ad < 1.5) ? 'auto' : 'none';
    });

    /* Sync navigation dots */
    Array.from(dots).forEach(function (dot, i) {
      var isActive = (i === centerI);
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  /* ── Animate to target index (lerp) ── */
  function animateTo(target) {
    cancelAnimationFrame(rafId);
    target = Math.max(0, Math.min(count - 1, target));

    if (noMotion) {
      offset = target;
      applyTransforms();
      return;
    }

    function tick() {
      offset += (target - offset) * 0.14;
      if (Math.abs(target - offset) < 0.002) {
        offset = target;
        applyTransforms();
        return;
      }
      applyTransforms();
      rafId = requestAnimationFrame(tick);
    }
    tick();
  }

  /* ── Inertia + snap ── */
  function inertiaSnap() {
    cancelAnimationFrame(rafId);

    if (noMotion || Math.abs(inertiaVel) < 0.004) {
      animateTo(Math.round(Math.max(0, Math.min(count - 1, offset))));
      return;
    }

    function tick() {
      if (Math.abs(inertiaVel) < 0.005) {
        animateTo(Math.round(Math.max(0, Math.min(count - 1, offset))));
        return;
      }
      offset    += inertiaVel;
      offset     = Math.max(-0.45, Math.min(count - 0.55, offset));
      inertiaVel *= 0.88; // friction
      applyTransforms();
      rafId = requestAnimationFrame(tick);
    }
    tick();
  }

  /* ── Pointer events (drag) ── */
  stage.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    cancelAnimationFrame(rafId);
    isDragging   = true;
    dragStartX   = e.clientX;
    dragStartOff = offset;
    dragDelta    = 0;
    lastX        = e.clientX;
    lastT        = performance.now();
    velTracker   = 0;
    inertiaVel   = 0;
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('is-dragging');
  });

  stage.addEventListener('pointermove', function (e) {
    if (!isDragging) return;
    var dx = e.clientX - dragStartX;
    dragDelta = dx;
    offset    = dragStartOff - dx / getSpacing();
    offset    = Math.max(-0.45, Math.min(count - 0.55, offset));

    /* Rolling velocity (pixels per 16ms frame) */
    var now = performance.now();
    var dt  = now - lastT;
    if (dt > 0 && dt < 120) {
      velTracker = (lastX - e.clientX) / getSpacing() / (dt / 16.67);
    }
    lastX = e.clientX;
    lastT = now;

    applyTransforms();
  });

  function onRelease() {
    if (!isDragging) return;
    isDragging = false;
    stage.classList.remove('is-dragging');

    /* Tiny movement = no inertia, just snap */
    if (Math.abs(dragDelta) < 6) {
      inertiaVel = 0;
      inertiaSnap();
      return;
    }
    /* Clamp inertia so it doesn't fly too far */
    inertiaVel = Math.max(-0.55, Math.min(0.55, velTracker * 0.55));
    inertiaSnap();

    /* Reset dragDelta after a tick so click handler fires correctly */
    setTimeout(function () { dragDelta = 0; }, 40);
  }

  stage.addEventListener('pointerup',     onRelease);
  stage.addEventListener('pointercancel', onRelease);

  /* Prevent following link if we actually dragged */
  stage.addEventListener('click', function (e) {
    if (Math.abs(dragDelta) > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  /* Click on non-center card → navigate to it (don't follow link yet) */
  cards.forEach(function (card, i) {
    card.addEventListener('click', function (e) {
      if (Math.abs(dragDelta) > 5) return;
      if (Math.round(offset) !== i) {
        e.preventDefault();
        animateTo(i);
      }
      /* If it IS the center card and no drag, link follows normally */
    });
  });

  /* ── Trackpad / mouse-wheel horizontal swipe ── */
  var wheelTimer;
  stage.addEventListener('wheel', function (e) {
    /* Only handle primarily-horizontal scrolls */
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    cancelAnimationFrame(rafId);

    offset += e.deltaX / getSpacing() * 0.38;
    offset  = Math.max(0, Math.min(count - 1, offset));
    applyTransforms();

    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () { inertiaSnap(); }, 80);
  }, { passive: false });

  /* ── Keyboard ── */
  stage.setAttribute('tabindex', '0');
  stage.addEventListener('keydown', function (e) {
    var moved = false;
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { animateTo(Math.round(offset) - 1); moved = true; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { animateTo(Math.round(offset) + 1); moved = true; }
    if (e.key === 'Home')  { animateTo(0);         moved = true; }
    if (e.key === 'End')   { animateTo(count - 1); moved = true; }
    if (e.key === 'Enter' || e.key === ' ') {
      /* Follow link of center card */
      var centerCard = stage.querySelector('.pgal-card.is-center');
      if (centerCard) { centerCard.click(); moved = true; }
    }
    if (moved) e.preventDefault();
  });

  /* ── Dots ── */
  document.querySelectorAll('[data-pgal-dot]').forEach(function (dot, i) {
    dot.addEventListener('click', function () { animateTo(i); });
  });

  /* ── Prev / Next buttons ── */
  var prevBtn = document.querySelector('[data-pgal-prev]');
  var nextBtn = document.querySelector('[data-pgal-next]');
  if (prevBtn) prevBtn.addEventListener('click', function () { animateTo(Math.round(offset) - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { animateTo(Math.round(offset) + 1); });

  /* ── Resize ── */
  var resizeTimer;
  window.addEventListener('resize', function () {
    /* If viewport drops to mobile, bail — CSS takes over */
    if (window.innerWidth <= 640) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { applyTransforms(); }, 120);
  }, { passive: true });

  /* ── Init ── */
  applyTransforms();

})();
