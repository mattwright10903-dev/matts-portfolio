/* ══════════════════════════════════════════════════════════════════
   Portfolio Dome Gallery + Project Viewer — portfolio-gallery.js
   Loaded only on /portfolio (deferred, via layout-end conditional).
   Mobile ≤ 640px: CSS scroll-snap handles gallery, JS skips dome.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Utilities ── */
  var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Load project data ── */
  var pviewData = [];
  try {
    var dataEl = document.getElementById('pgal-data');
    if (dataEl) pviewData = JSON.parse(dataEl.textContent || '[]');
  } catch (e) { /* data unavailable — modal won't open */ }

  /* ════════════════════════════════════════════════════════════════
     PROJECT VIEWER MODAL
     ════════════════════════════════════════════════════════════════ */
  var pview           = document.getElementById('pview');
  var pviewImgEl      = pview && pview.querySelector('[data-pview-img]');
  var pviewCatEl      = pview && pview.querySelector('[data-pview-cat]');
  var pviewTitleEl    = pview && pview.querySelector('[data-pview-title]');
  var pviewDescEl     = pview && pview.querySelector('[data-pview-desc]');
  var pviewMetaEl     = pview && pview.querySelector('[data-pview-meta]');
  var pviewThumbsEl   = pview && pview.querySelector('[data-pview-thumbs]');
  var pviewCtaEl      = pview && pview.querySelector('[data-pview-cta]');
  var pviewPrevBtn    = pview && pview.querySelector('[data-pview-prev]');
  var pviewNextBtn    = pview && pview.querySelector('[data-pview-next]');

  var pviewCurrentIdx = -1; // index into pviewData
  var prevFocusEl     = null;

  function openPview(idx) {
    if (!pview || !pviewData[idx]) return;
    pviewCurrentIdx = idx;
    var p = pviewData[idx];

    /* Image */
    pviewImgEl.src = p.image_url || '';
    pviewImgEl.alt = p.title;

    /* Text */
    pviewCatEl.textContent   = p.category;
    pviewTitleEl.textContent = p.title;
    pviewDescEl.textContent  = p.description;

    /* CTA link */
    pviewCtaEl.href = '/portfolio/' + p.id;

    /* Meta rows */
    pviewMetaEl.innerHTML = '';
    [
      { label: 'Tools',  val: p.tools  },
      { label: 'Goal',   val: p.goal   },
      { label: 'Result', val: p.result }
    ].forEach(function (row) {
      if (!row.val) return;
      var el = document.createElement('div');
      el.className = 'pview-meta-row';
      el.innerHTML =
        '<span class="pview-meta-label">' + escHtml(row.label) + '</span>' +
        '<span class="pview-meta-val">'   + escHtml(row.val)   + '</span>';
      pviewMetaEl.appendChild(el);
    });

    /* Thumbnails */
    pviewThumbsEl.innerHTML = '';
    var imgs = p.images && p.images.length ? p.images : (p.image_url ? [p.image_url] : []);
    if (imgs.length > 1) {
      imgs.forEach(function (src, ti) {
        var btn = document.createElement('button');
        btn.type      = 'button';
        btn.className = 'pview-thumb' + (ti === 0 ? ' is-active' : '');
        btn.setAttribute('aria-label', 'Image ' + (ti + 1));
        var img       = document.createElement('img');
        img.src       = src;
        img.alt       = '';
        img.loading   = 'lazy';
        btn.appendChild(img);
        btn.addEventListener('click', function () { switchPviewImg(src, btn); });
        pviewThumbsEl.appendChild(btn);
      });
    }

    /* Prev/Next button state */
    if (pviewPrevBtn) pviewPrevBtn.disabled = (idx <= 0);
    if (pviewNextBtn) pviewNextBtn.disabled = (idx >= pviewData.length - 1);

    /* Show overlay */
    prevFocusEl = document.activeElement;
    pview.setAttribute('aria-hidden', 'false');
    pview.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    /* Focus the close button for keyboard users */
    setTimeout(function () {
      var closeBtn = pview.querySelector('[data-pview-close]');
      if (closeBtn) closeBtn.focus();
    }, 60);
  }

  function closePview() {
    if (!pview) return;
    pview.setAttribute('aria-hidden', 'true');
    pview.classList.remove('is-open');
    document.body.style.overflow = '';
    if (prevFocusEl && prevFocusEl.focus) prevFocusEl.focus();
  }

  function switchPviewImg(src, thumbBtn) {
    if (!pviewImgEl) return;
    pviewImgEl.style.opacity = '0';
    setTimeout(function () {
      pviewImgEl.src = src;
      pviewImgEl.style.opacity = '1';
    }, 170);
    pviewThumbsEl && Array.from(pviewThumbsEl.querySelectorAll('.pview-thumb')).forEach(function (t) {
      t.classList.toggle('is-active', t === thumbBtn);
    });
  }

  /* Wire up pview controls */
  if (pview) {
    /* Close buttons (including backdrop) */
    pview.addEventListener('click', function (e) {
      if (e.target.closest('[data-pview-close]') || e.target === pview.querySelector('[data-pview-backdrop]')) {
        closePview();
      }
    });

    /* Prev/Next */
    if (pviewPrevBtn) pviewPrevBtn.addEventListener('click', function () { openPview(pviewCurrentIdx - 1); });
    if (pviewNextBtn) pviewNextBtn.addEventListener('click', function () { openPview(pviewCurrentIdx + 1); });

    /* Keyboard */
    document.addEventListener('keydown', function (e) {
      if (!pview.classList.contains('is-open')) return;
      if (e.key === 'Escape')      { e.preventDefault(); closePview(); }
      if (e.key === 'ArrowLeft')   { e.preventDefault(); if (pviewCurrentIdx > 0) openPview(pviewCurrentIdx - 1); }
      if (e.key === 'ArrowRight')  { e.preventDefault(); if (pviewCurrentIdx < pviewData.length - 1) openPview(pviewCurrentIdx + 1); }
    });

    /* Prevent click propagation inside dialog */
    var dialog = pview.querySelector('.pview-dialog');
    if (dialog) dialog.addEventListener('click', function (e) { e.stopPropagation(); });

    /* Backdrop click */
    var backdrop = pview.querySelector('[data-pview-backdrop]');
    if (backdrop) backdrop.addEventListener('click', closePview);
  }

  /* ════════════════════════════════════════════════════════════════
     DOME GALLERY
     Skip on mobile — CSS scroll-snap handles scroll there.
     ════════════════════════════════════════════════════════════════ */
  if (window.innerWidth <= 640) return;

  var stage = document.querySelector('[data-pgal-stage]');
  if (!stage) return;

  var cards = Array.from(stage.querySelectorAll('[data-pgal-card]'));
  if (!cards.length) return;

  var count      = cards.length;
  var offset     = Math.floor(count / 2);
  var rafId      = null;

  /* Drag state */
  var isDragging   = false;
  var dragStartX   = 0;
  var dragStartOff = 0;
  var dragDelta    = 0;
  var lastX        = 0;
  var lastT        = 0;
  var velTracker   = 0;
  var inertiaVel   = 0;

  /* ── Responsive spacing ── */
  function getSpacing() {
    var w = window.innerWidth;
    if (w >= 1200) return 320;
    if (w >= 1000) return 290;
    if (w >=  800) return 258;
    return 228;
  }

  /* ── Apply dome transforms ── */
  function applyTransforms(off) {
    off = (off !== undefined) ? off : offset;
    var sp      = getSpacing();
    var centerI = Math.round(Math.max(0, Math.min(count - 1, off)));
    var dots    = document.querySelectorAll('[data-pgal-dot]');

    cards.forEach(function (card, i) {
      var d  = i - off;
      var ad = Math.abs(d);

      var tx = d * sp;
      var ty = Math.min(ad * ad * 16, 92);
      var sc = Math.max(0.56, 1 - ad * 0.115);
      var ry = Math.max(-26, Math.min(26, d * -9));
      var op = Math.max(0.22, 1 - ad * 0.22);
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
      card.style.pointerEvents = (ad < 1.5) ? 'auto' : 'none';
    });

    Array.from(dots).forEach(function (dot, i) {
      var a = (i === centerI);
      dot.classList.toggle('is-active', a);
      dot.setAttribute('aria-selected', a ? 'true' : 'false');
    });
  }

  /* ── Animate to integer index (lerp) ── */
  function animateTo(target) {
    cancelAnimationFrame(rafId);
    target = Math.max(0, Math.min(count - 1, target));
    if (noMotion) { offset = target; applyTransforms(); return; }
    function tick() {
      offset += (target - offset) * 0.14;
      if (Math.abs(target - offset) < 0.002) { offset = target; applyTransforms(); return; }
      applyTransforms();
      rafId = requestAnimationFrame(tick);
    }
    tick();
  }

  /* ── Inertia + snap ── */
  function inertiaSnap() {
    cancelAnimationFrame(rafId);
    if (noMotion || Math.abs(inertiaVel) < 0.004) { animateTo(Math.round(Math.max(0, Math.min(count - 1, offset)))); return; }
    function tick() {
      if (Math.abs(inertiaVel) < 0.005) { animateTo(Math.round(Math.max(0, Math.min(count - 1, offset)))); return; }
      offset    += inertiaVel;
      offset     = Math.max(-0.45, Math.min(count - 0.55, offset));
      inertiaVel *= 0.88;
      applyTransforms();
      rafId = requestAnimationFrame(tick);
    }
    tick();
  }

  /* ── Pointer drag ── */
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
    var now = performance.now(), dt = now - lastT;
    if (dt > 0 && dt < 120) velTracker = (lastX - e.clientX) / getSpacing() / (dt / 16.67);
    lastX = e.clientX; lastT = now;
    applyTransforms();
  });

  function onRelease() {
    if (!isDragging) return;
    isDragging = false;
    stage.classList.remove('is-dragging');
    if (Math.abs(dragDelta) < 6) { inertiaVel = 0; inertiaSnap(); return; }
    inertiaVel = Math.max(-0.55, Math.min(0.55, velTracker * 0.55));
    inertiaSnap();
    setTimeout(function () { dragDelta = 0; }, 40);
  }
  stage.addEventListener('pointerup',     onRelease);
  stage.addEventListener('pointercancel', onRelease);

  /* Prevent link if dragged */
  stage.addEventListener('click', function (e) {
    if (Math.abs(dragDelta) > 5) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* Card click: non-center → navigate gallery; center → open viewer */
  cards.forEach(function (card, i) {
    card.addEventListener('click', function (e) {
      if (Math.abs(dragDelta) > 5) return;
      var centerI = Math.round(offset);
      if (centerI !== i) {
        /* Not center — navigate gallery to this card */
        e.preventDefault();
        animateTo(i);
      } else if (pviewData.length > i) {
        /* Center card — open popup viewer */
        e.preventDefault();
        openPview(i);
      }
      /* Fallback: if no pviewData, let href work normally */
    });
  });

  /* ── Trackpad / wheel horizontal swipe ── */
  var wheelTimer;
  stage.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    cancelAnimationFrame(rafId);
    offset += e.deltaX / getSpacing() * 0.38;
    offset  = Math.max(0, Math.min(count - 1, offset));
    applyTransforms();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(inertiaSnap, 80);
  }, { passive: false });

  /* ── Keyboard ── */
  stage.setAttribute('tabindex', '0');
  stage.addEventListener('keydown', function (e) {
    var moved = false;
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { animateTo(Math.round(offset) - 1); moved = true; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { animateTo(Math.round(offset) + 1); moved = true; }
    if (e.key === 'Home')  { animateTo(0); moved = true; }
    if (e.key === 'End')   { animateTo(count - 1); moved = true; }
    if ((e.key === 'Enter' || e.key === ' ') && pviewData.length > Math.round(offset)) {
      e.preventDefault();
      openPview(Math.round(offset));
      moved = true;
    }
    if (moved) e.preventDefault();
  });

  /* ── Dots ── */
  document.querySelectorAll('[data-pgal-dot]').forEach(function (dot, i) {
    dot.addEventListener('click', function () { animateTo(i); });
  });

  /* ── Prev / Next gallery buttons ── */
  var prevBtn = document.querySelector('[data-pgal-prev]');
  var nextBtn = document.querySelector('[data-pgal-next]');
  if (prevBtn) prevBtn.addEventListener('click', function () { animateTo(Math.round(offset) - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { animateTo(Math.round(offset) + 1); });

  /* ── Resize ── */
  var resizeTimer;
  window.addEventListener('resize', function () {
    if (window.innerWidth <= 640) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyTransforms, 120);
  }, { passive: true });

  /* ── Init ── */
  applyTransforms();

})();
