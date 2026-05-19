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
  } catch (e) { /* fall back to card data-attributes on click */ }

  /* ── Gallery elements ── */
  var stage = document.querySelector('[data-pgal-stage]');
  var cards = stage ? Array.from(stage.querySelectorAll('[data-pgal-card]')) : [];
  var count = cards.length;

  /* ── Drag distance — read by the document click handler ──
     Reset on every pointerdown; updated on pointermove.
     A value > 8 means the user dragged rather than clicked. */
  var dragDelta = 0;

  /* ── Dome offset — set by dome init, used by click handler ── */
  var domeOffset = null; /* null = dome not initialised (mobile) */

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

  /* ── Read project data from pviewData or card data-attributes ──
     Returns null if no usable data is found. */
  function getProjectData(card) {
    var idx = parseInt(card.getAttribute('data-index'), 10);

    /* Primary source: server-rendered pviewData JSON (complete & sanitised) */
    if (!isNaN(idx) && pviewData[idx]) {
      return { _idx: idx, _data: pviewData[idx] };
    }

    /* Fallback: data-attributes on the card element */
    var images;
    try { images = JSON.parse(card.getAttribute('data-images') || '[]'); }
    catch (e) { images = []; }

    var title = card.getAttribute('data-title') || '';
    var id    = card.getAttribute('data-project-id') || '';
    if (!title && !id) return null; /* no usable data — let link navigate */

    return {
      _idx: -1,
      _data: {
        id:          id,
        title:       title,
        category:    card.getAttribute('data-category')    || '',
        description: card.getAttribute('data-description') || '',
        tools:       card.getAttribute('data-tools')       || '',
        goal:        card.getAttribute('data-goal')        || '',
        result:      card.getAttribute('data-result')      || '',
        image_url:   images[0] || '',
        images:      images
      }
    };
  }

  /* ── Populate + show the modal ── */
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
    if (pviewNextBtn) pviewNextBtn.disabled =
      (pviewCurrentIdx < 0 || pviewCurrentIdx >= pviewData.length - 1);

    /* Show */
    prevFocusEl = document.activeElement;
    pview.setAttribute('aria-hidden', 'false');
    pview.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    setTimeout(function () {
      var btn = pview.querySelector('[data-pview-close]');
      if (btn) btn.focus();
    }, 60);
  }

  /* Called by modal prev/next — index into pviewData */
  function openPview(idx) {
    if (pviewData[idx]) showModal(pviewData[idx], idx);
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

  /* ── Wire up modal controls ── */
  if (pview) {
    /* Backdrop */
    var backdropEl = pview.querySelector('[data-pview-backdrop]');
    if (backdropEl) backdropEl.addEventListener('click', closePview);

    /* Close button — direct listener, not delegated */
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

    /* ESC + arrow keys */
    document.addEventListener('keydown', function (e) {
      if (!pview.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        e.preventDefault(); closePview();
      } else if (e.key === 'ArrowLeft' && pviewCurrentIdx > 0) {
        e.preventDefault(); openPview(pviewCurrentIdx - 1);
      } else if (e.key === 'ArrowRight' &&
                 pviewCurrentIdx >= 0 &&
                 pviewCurrentIdx < pviewData.length - 1) {
        e.preventDefault(); openPview(pviewCurrentIdx + 1);
      }
    });

    /* Clicking directly on the pview overlay (outside dialog) also closes */
    pview.addEventListener('click', function (e) {
      if (e.target === pview || e.target === backdropEl) closePview();
    });
  }

  /* ════════════════════════════════════════════════════════════════
     DOCUMENT-LEVEL CLICK DELEGATION
     Works regardless of pointer-events on any intermediate element.
     Targets `.js-project-preview` — only showcase cards have this class.
     ════════════════════════════════════════════════════════════════ */
  document.addEventListener('click', function (e) {
    /* Let browser handle modifier-key clicks (open in new tab, etc.) */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var card = e.target.closest('.js-project-preview');
    if (!card) return;

    /* If user was dragging the carousel, suppress the resulting click */
    if (Math.abs(dragDelta) > 8) return;

    /* On desktop with dome active: non-centre carousel card → navigate carousel
       (data-pgal-card distinguishes carousel cards from grid cards) */
    if (domeOffset !== null && card.hasAttribute('data-pgal-card') && !card.classList.contains('is-center')) {
      var navIdx = parseInt(card.getAttribute('data-index'), 10);
      if (!isNaN(navIdx)) {
        e.preventDefault();
        domeAnimateTo(navIdx);
        return;
      }
    }

    /* Read project data */
    var result = getProjectData(card);

    /* No data → allow default link navigation (fallback to case study) */
    if (!result) return;

    /* Data found → prevent default and open modal */
    e.preventDefault();
    showModal(result._data, result._idx);
  });

  /* ════════════════════════════════════════════════════════════════
     DOME GALLERY — desktop only (> 640px)
     Below 640px, CSS scroll-snap handles everything.
     ════════════════════════════════════════════════════════════════ */
  if (window.innerWidth <= 640) return;
  if (!stage || !count) return;

  /* domeOffset is both the runtime scroll position and the "dome is ready" flag */
  domeOffset = Math.floor(count / 2);

  var rafId        = null;
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
    off = (off !== undefined) ? off : domeOffset;
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
      /* Allow pointer events on cards ≤ 2 positions from centre.
         Far cards are invisible/tiny so blocking them is correct UX. */
      card.style.pointerEvents = (ad <= 2) ? 'auto' : 'none';

      card.classList.toggle('is-center', i === centerI);
    });

    Array.from(dots).forEach(function (dot, i) {
      var a = (i === centerI);
      dot.classList.toggle('is-active', a);
      dot.setAttribute('aria-selected', a ? 'true' : 'false');
    });
  }

  /* Exposed via closure so the document click handler can call it */
  function domeAnimateTo(target) {
    cancelAnimationFrame(rafId);
    target = Math.max(0, Math.min(count - 1, target));
    if (noMotion) { domeOffset = target; applyTransforms(); return; }
    (function tick() {
      domeOffset += (target - domeOffset) * 0.14;
      if (Math.abs(target - domeOffset) < 0.002) {
        domeOffset = target; applyTransforms(); return;
      }
      applyTransforms();
      rafId = requestAnimationFrame(tick);
    })();
  }

  function inertiaSnap() {
    cancelAnimationFrame(rafId);
    var snap = function () {
      domeAnimateTo(Math.round(Math.max(0, Math.min(count - 1, domeOffset))));
    };
    if (noMotion || Math.abs(inertiaVel) < 0.004) { snap(); return; }
    (function tick() {
      if (Math.abs(inertiaVel) < 0.005) { snap(); return; }
      domeOffset  += inertiaVel;
      domeOffset   = Math.max(-0.45, Math.min(count - 0.55, domeOffset));
      inertiaVel  *= 0.88;
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
    dragStartOff = domeOffset;
    dragDelta    = 0;           /* reset drag distance on every new press */
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
    dragDelta  = dx;            /* track total drag distance */
    domeOffset = dragStartOff - dx / getSpacing();
    domeOffset = Math.max(-0.45, Math.min(count - 0.55, domeOffset));
    var now = performance.now(), dt = now - lastT;
    if (dt > 0 && dt < 120) {
      velTracker = (lastX - e.clientX) / getSpacing() / (dt / 16.67);
    }
    lastX = e.clientX; lastT = now;
    applyTransforms();
  });

  function onRelease() {
    if (!isDragging) return;
    isDragging = false;
    stage.classList.remove('is-dragging');
    if (Math.abs(dragDelta) < 6) {
      /* Tap / click — do NOT snap, just let the document click fire */
      inertiaVel = 0; inertiaSnap(); return;
    }
    /* Real drag — apply inertia, reset dragDelta after click fires */
    inertiaVel = Math.max(-0.55, Math.min(0.55, velTracker * 0.55));
    inertiaSnap();
    setTimeout(function () { dragDelta = 0; }, 50);
  }
  stage.addEventListener('pointerup',     onRelease);
  stage.addEventListener('pointercancel', onRelease);

  /* ── Trackpad / wheel horizontal swipe ── */
  var wheelTimer;
  stage.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    cancelAnimationFrame(rafId);
    domeOffset += e.deltaX / getSpacing() * 0.38;
    domeOffset  = Math.max(0, Math.min(count - 1, domeOffset));
    applyTransforms();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(inertiaSnap, 80);
  }, { passive: false });

  /* ── Keyboard ── */
  stage.setAttribute('tabindex', '0');
  stage.addEventListener('keydown', function (e) {
    var moved = false;
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { domeAnimateTo(Math.round(domeOffset) - 1); moved = true; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { domeAnimateTo(Math.round(domeOffset) + 1); moved = true; }
    if (e.key === 'Home') { domeAnimateTo(0); moved = true; }
    if (e.key === 'End')  { domeAnimateTo(count - 1); moved = true; }
    if (e.key === 'Enter' || e.key === ' ') {
      var ci = Math.round(domeOffset);
      var centreCard = cards[ci];
      if (centreCard) {
        e.preventDefault();
        var r = getProjectData(centreCard);
        if (r) showModal(r._data, r._idx);
        moved = true;
      }
    }
    if (moved) e.preventDefault();
  });

  /* ── Navigation dots ── */
  document.querySelectorAll('[data-pgal-dot]').forEach(function (dot, i) {
    dot.addEventListener('click', function () { domeAnimateTo(i); });
  });

  /* ── Gallery prev / next buttons ── */
  var prevBtn = document.querySelector('[data-pgal-prev]');
  var nextBtn = document.querySelector('[data-pgal-next]');
  if (prevBtn) prevBtn.addEventListener('click', function () { domeAnimateTo(Math.round(domeOffset) - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { domeAnimateTo(Math.round(domeOffset) + 1); });

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
