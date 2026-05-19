/* ══════════════════════════════════════════════════════════════════
   Portfolio Dome Gallery + Project Viewer — portfolio-gallery.js
   Loaded only on /portfolio (deferred, via layout-end conditional).
   Mobile ≤ 640px: CSS scroll-snap handles gallery navigation.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Load project data from safe JSON embed ── */
  var pviewData = [];
  try {
    var dataEl = document.getElementById('pgal-data');
    if (dataEl) pviewData = JSON.parse(dataEl.textContent || '[]');
  } catch (e) { /* silently fall back to card data-attributes */ }

  /* ── Gallery stage + cards (used on both mobile and desktop) ── */
  var stage = document.querySelector('[data-pgal-stage]');
  var cards = stage ? Array.from(stage.querySelectorAll('[data-pgal-card]')) : [];
  var count = cards.length;

  /* dragDelta is declared here so the click handler can read it on both paths */
  var dragDelta = 0;

  /* ════════════════════════════════════════════════════════════════
     PROJECT VIEWER MODAL
     ════════════════════════════════════════════════════════════════ */
  var pview         = document.getElementById('pview');
  var pviewImgEl    = pview && pview.querySelector('[data-pview-img]');
  var pviewCatEl    = pview && pview.querySelector('[data-pview-cat]');
  var pviewTitleEl  = pview && pview.querySelector('[data-pview-title]');
  var pviewDescEl   = pview && pview.querySelector('[data-pview-desc]');
  var pviewMetaEl   = pview && pview.querySelector('[data-pview-meta]');
  var pviewThumbsEl = pview && pview.querySelector('[data-pview-thumbs]');
  var pviewCtaEl    = pview && pview.querySelector('[data-pview-cta]');
  var pviewPrevBtn  = pview && pview.querySelector('[data-pview-prev]');
  var pviewNextBtn  = pview && pview.querySelector('[data-pview-next]');

  var pviewCurrentIdx = -1;
  var prevFocusEl     = null;

  /* Core populate + show function — used by both openPview and openPviewFromCard */
  function showModal(p, idx) {
    if (!pview || !p) return;
    pviewCurrentIdx = (typeof idx === 'number' && idx >= 0) ? idx : -1;

    var imgs    = (p.images && p.images.length) ? p.images : (p.image_url ? [p.image_url] : []);
    var mainSrc = imgs[0] || '';

    if (pviewImgEl) {
      pviewImgEl.style.opacity = '1';
      pviewImgEl.src = mainSrc;
      pviewImgEl.alt = p.title || '';
    }
    if (pviewCatEl)   pviewCatEl.textContent  = p.category    || '';
    if (pviewTitleEl) pviewTitleEl.textContent = p.title       || '';
    if (pviewDescEl)  pviewDescEl.textContent  = p.description || '';
    if (pviewCtaEl)   pviewCtaEl.href = '/portfolio/' + encodeURIComponent(String(p.id || ''));

    /* Meta rows */
    if (pviewMetaEl) {
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
    }

    /* Thumbnails */
    if (pviewThumbsEl) {
      pviewThumbsEl.innerHTML = '';
      if (imgs.length > 1) {
        imgs.forEach(function (src, ti) {
          var btn = document.createElement('button');
          btn.type      = 'button';
          btn.className = 'pview-thumb' + (ti === 0 ? ' is-active' : '');
          btn.setAttribute('aria-label', 'Image ' + (ti + 1));
          var img       = document.createElement('img');
          img.src       = src; img.alt = ''; img.loading = 'lazy';
          btn.appendChild(img);
          btn.addEventListener('click', function () { switchPviewImg(src, btn); });
          pviewThumbsEl.appendChild(btn);
        });
      }
    }

    /* Prev / Next button state */
    if (pviewPrevBtn) pviewPrevBtn.disabled = (pviewCurrentIdx <= 0);
    if (pviewNextBtn) pviewNextBtn.disabled = (pviewCurrentIdx < 0 || pviewCurrentIdx >= pviewData.length - 1);

    /* Show */
    prevFocusEl = document.activeElement;
    pview.setAttribute('aria-hidden', 'false');
    pview.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    setTimeout(function () {
      var closeBtn = pview.querySelector('[data-pview-close]');
      if (closeBtn) closeBtn.focus();
    }, 60);
  }

  /* Called by modal prev/next nav — index-based */
  function openPview(idx) {
    if (pviewData[idx]) showModal(pviewData[idx], idx);
  }

  /* Called by card click — reads pviewData first, falls back to data-attributes */
  function openPviewFromCard(card) {
    if (!card) return;

    var idx = parseInt(card.getAttribute('data-index'), 10);

    /* Primary: use pviewData (server-rendered, complete) */
    if (!isNaN(idx) && pviewData[idx]) {
      showModal(pviewData[idx], idx);
      return;
    }

    /* Fallback: read directly from the card's data-attributes */
    var images;
    try { images = JSON.parse(card.getAttribute('data-images') || '[]'); }
    catch (e) { images = []; }

    var p = {
      id:          card.getAttribute('data-project-id') || '',
      title:       card.getAttribute('data-title')       || '',
      category:    card.getAttribute('data-category')    || '',
      description: card.getAttribute('data-description') || '',
      tools:       card.getAttribute('data-tools')       || '',
      goal:        card.getAttribute('data-goal')        || '',
      result:      card.getAttribute('data-result')      || '',
      image_url:   images[0] || '',
      images:      images
    };

    /* If we have no usable data at all, let the href navigate */
    if (!p.title && !p.id) {
      var href = card.getAttribute('href');
      if (href) window.location.href = href;
      return;
    }

    showModal(p, -1); /* idx = -1 → prev/next disabled */
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
    }, 160);
    if (pviewThumbsEl) {
      Array.from(pviewThumbsEl.querySelectorAll('.pview-thumb')).forEach(function (t) {
        t.classList.toggle('is-active', t === thumbBtn);
      });
    }
  }

  /* ── Wire up pview controls ── */
  if (pview) {
    /* Backdrop click */
    var backdrop = pview.querySelector('[data-pview-backdrop]');
    if (backdrop) backdrop.addEventListener('click', closePview);

    /* Close button — direct listener (no bubbling dependency) */
    var closeBtnEl = pview.querySelector('[data-pview-close]');
    if (closeBtnEl) closeBtnEl.addEventListener('click', closePview);

    /* Prev / Next */
    if (pviewPrevBtn) {
      pviewPrevBtn.addEventListener('click', function () {
        if (pviewCurrentIdx > 0) openPview(pviewCurrentIdx - 1);
      });
    }
    if (pviewNextBtn) {
      pviewNextBtn.addEventListener('click', function () {
        if (pviewCurrentIdx >= 0 && pviewCurrentIdx < pviewData.length - 1) {
          openPview(pviewCurrentIdx + 1);
        }
      });
    }

    /* Keyboard: ESC close, ← → prev/next */
    document.addEventListener('keydown', function (e) {
      if (!pview.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        e.preventDefault(); closePview();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (pviewCurrentIdx > 0) openPview(pviewCurrentIdx - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (pviewCurrentIdx >= 0 && pviewCurrentIdx < pviewData.length - 1) {
          openPview(pviewCurrentIdx + 1);
        }
      }
    });

    /* Prevent click propagation inside dialog from closing modal */
    var dialogEl = pview.querySelector('.pview-dialog');
    if (dialogEl) {
      dialogEl.addEventListener('click', function (e) {
        /* Only stop propagation if NOT clicking the close button */
        if (!e.target.closest('[data-pview-close]') && !e.target.closest('[data-pview-backdrop]')) {
          e.stopPropagation();
        }
      });
    }
  }

  /* ════════════════════════════════════════════════════════════════
     CARD CLICK — event delegation
     Mobile (≤640px): any card click → open modal immediately.
     Desktop: handled again after dome init with center-card logic.
     ════════════════════════════════════════════════════════════════ */
  if (stage && window.innerWidth <= 640) {
    stage.addEventListener('click', function (e) {
      var card = e.target.closest('[data-pgal-card]');
      if (!card) return;
      e.preventDefault();
      openPviewFromCard(card);
    });
  }

  /* ════════════════════════════════════════════════════════════════
     DOME GALLERY (desktop only — mobile handled above + CSS snap)
     ════════════════════════════════════════════════════════════════ */
  if (window.innerWidth <= 640) return;
  if (!stage || !count) return;

  var offset  = Math.floor(count / 2);
  var rafId   = null;

  /* Drag state */
  var isDragging   = false;
  var dragStartX   = 0;
  var dragStartOff = 0;
  var lastX        = 0;
  var lastT        = 0;
  var velTracker   = 0;
  var inertiaVel   = 0;

  function getSpacing() {
    var w = window.innerWidth;
    if (w >= 1200) return 320;
    if (w >= 1000) return 290;
    if (w >=  800) return 258;
    return 228;
  }

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
      card.style.opacity       = op.toFixed(3);
      card.style.zIndex        = zi;
      /* Allow clicks for cards within 2 positions of center; block far cards */
      card.style.pointerEvents = (ad <= 2) ? 'auto' : 'none';

      var isCenter = (i === centerI);
      card.classList.toggle('is-center', isCenter);
    });

    Array.from(dots).forEach(function (dot, i) {
      var a = (i === centerI);
      dot.classList.toggle('is-active', a);
      dot.setAttribute('aria-selected', a ? 'true' : 'false');
    });
  }

  function animateTo(target) {
    cancelAnimationFrame(rafId);
    target = Math.max(0, Math.min(count - 1, target));
    if (noMotion) { offset = target; applyTransforms(); return; }
    (function tick() {
      offset += (target - offset) * 0.14;
      if (Math.abs(target - offset) < 0.002) { offset = target; applyTransforms(); return; }
      applyTransforms();
      rafId = requestAnimationFrame(tick);
    })();
  }

  function inertiaSnap() {
    cancelAnimationFrame(rafId);
    var snap = function () { animateTo(Math.round(Math.max(0, Math.min(count - 1, offset)))); };
    if (noMotion || Math.abs(inertiaVel) < 0.004) { snap(); return; }
    (function tick() {
      if (Math.abs(inertiaVel) < 0.005) { snap(); return; }
      offset    += inertiaVel;
      offset     = Math.max(-0.45, Math.min(count - 0.55, offset));
      inertiaVel *= 0.88;
      applyTransforms();
      rafId = requestAnimationFrame(tick);
    })();
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

  /* ── Desktop click delegation — navigate gallery or open modal ──
     Uses is-center class (not float offset) for reliable detection.
     dragDelta > 5 = drag gesture → block navigation, reset after 40ms. */
  stage.addEventListener('click', function (e) {
    if (Math.abs(dragDelta) > 5) { e.preventDefault(); return; }

    var card = e.target.closest('[data-pgal-card]');
    if (!card) return;

    var idx = parseInt(card.getAttribute('data-index'), 10);

    if (!card.classList.contains('is-center') && !isNaN(idx)) {
      /* Non-center card: navigate dome gallery to it */
      e.preventDefault();
      animateTo(idx);
    } else {
      /* Center card (or fallback): open project viewer modal */
      e.preventDefault();
      openPviewFromCard(card);
    }
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
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')  { animateTo(Math.round(offset) - 1); moved = true; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { animateTo(Math.round(offset) + 1); moved = true; }
    if (e.key === 'Home') { animateTo(0); moved = true; }
    if (e.key === 'End')  { animateTo(count - 1); moved = true; }
    if (e.key === 'Enter' || e.key === ' ') {
      var centerCard = cards[Math.round(offset)];
      if (centerCard) { e.preventDefault(); openPviewFromCard(centerCard); moved = true; }
    }
    if (moved) e.preventDefault();
  });

  /* ── Dots ── */
  document.querySelectorAll('[data-pgal-dot]').forEach(function (dot, i) {
    dot.addEventListener('click', function () { animateTo(i); });
  });

  /* ── Gallery prev / next buttons ── */
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
