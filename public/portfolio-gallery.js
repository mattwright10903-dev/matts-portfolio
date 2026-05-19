/* ══════════════════════════════════════════════════════════════════
   Portfolio Page — portfolio-gallery.js
   Loaded only on /portfolio (deferred, via layout-end conditional).
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }

  /* ── Load all project data ── */
  var portData = [];
  try {
    var dataEl = document.getElementById('port-data');
    if (dataEl) portData = JSON.parse(dataEl.textContent || '[]');
  } catch (e) { /* fall back to card data-attributes */ }

  /* ════════════════════════════════════════════════════════════════
     PROJECT PREVIEW MODAL
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

    /* Meta rows (tools / goal / result) */
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
          var img = document.createElement('img');
          img.src = src; img.alt = ''; img.loading = 'lazy';
          btn.appendChild(img);
          btn.addEventListener('click', function () { switchPviewImg(src, btn); });
          pviewThumbsEl.appendChild(btn);
        });
      }
    }

    /* Prev / next state */
    if (pviewPrevBtn) pviewPrevBtn.disabled = (pviewCurrentIdx <= 0);
    if (pviewNextBtn) pviewNextBtn.disabled =
      (pviewCurrentIdx < 0 || pviewCurrentIdx >= portData.length - 1);

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

  function openPview(idx) {
    if (portData[idx]) showModal(portData[idx], idx);
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

  /* Wire modal controls */
  if (pview) {
    var backdropEl = pview.querySelector('[data-pview-backdrop]');
    if (backdropEl) backdropEl.addEventListener('click', closePview);

    var closeBtnEl = pview.querySelector('[data-pview-close]');
    if (closeBtnEl) closeBtnEl.addEventListener('click', closePview);

    if (pviewPrevBtn) {
      pviewPrevBtn.addEventListener('click', function () {
        if (pviewCurrentIdx > 0) openPview(pviewCurrentIdx - 1);
      });
    }
    if (pviewNextBtn) {
      pviewNextBtn.addEventListener('click', function () {
        if (pviewCurrentIdx >= 0 && pviewCurrentIdx < portData.length - 1) {
          openPview(pviewCurrentIdx + 1);
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!pview.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        e.preventDefault(); closePview();
      } else if (e.key === 'ArrowLeft' && pviewCurrentIdx > 0) {
        e.preventDefault(); openPview(pviewCurrentIdx - 1);
      } else if (e.key === 'ArrowRight' &&
                 pviewCurrentIdx >= 0 &&
                 pviewCurrentIdx < portData.length - 1) {
        e.preventDefault(); openPview(pviewCurrentIdx + 1);
      }
    });

    pview.addEventListener('click', function (e) {
      if (e.target === pview || e.target === backdropEl) closePview();
    });
  }

  /* ── Get project data from portData or element data-attributes ── */
  function getProjectData(el) {
    var idx = parseInt(el.getAttribute('data-index'), 10);
    if (!isNaN(idx) && portData[idx]) return { _idx: idx, _data: portData[idx] };

    /* Fallback: element attributes */
    var images;
    try { images = JSON.parse(el.getAttribute('data-images') || '[]'); }
    catch (e) { images = []; }
    var title = el.getAttribute('data-title') || '';
    var id    = el.getAttribute('data-project-id') || '';
    if (!title && !id) return null;
    return {
      _idx: -1,
      _data: {
        id:          id,
        title:       title,
        category:    el.getAttribute('data-category')    || '',
        description: el.getAttribute('data-description') || '',
        tools:       el.getAttribute('data-tools')       || '',
        goal:        el.getAttribute('data-goal')        || '',
        result:      el.getAttribute('data-result')      || '',
        image_url:   images[0] || '',
        images:      images
      }
    };
  }

  /* ════════════════════════════════════════════════════════════════
     DRAG TRACKING — shared by rail and spotlight
     ════════════════════════════════════════════════════════════════ */
  var dragDelta  = 0;
  var dragStartX = 0;
  var isDragging = false;

  var rail = document.querySelector('[data-port-rail]');
  if (rail) {
    rail.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      isDragging = true; dragStartX = e.clientX; dragDelta = 0;
      rail.classList.add('is-grabbing');
    });
    rail.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      dragDelta = e.clientX - dragStartX;
    });
    function onRailRelease() {
      isDragging = false;
      rail.classList.remove('is-grabbing');
      setTimeout(function () { dragDelta = 0; }, 50);
    }
    rail.addEventListener('pointerup',     onRailRelease);
    rail.addEventListener('pointercancel', function () {
      isDragging = false; rail.classList.remove('is-grabbing'); dragDelta = 0;
    });
  }

  /* ════════════════════════════════════════════════════════════════
     DOCUMENT-LEVEL CLICK DELEGATION
     Handles: [data-quick-view] buttons + .js-project-preview links
     ════════════════════════════════════════════════════════════════ */
  document.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    /* Quick View buttons (data-quick-view="<idx>") */
    var qvEl = e.target.closest('[data-quick-view]');
    if (qvEl) {
      var qvIdx = parseInt(qvEl.getAttribute('data-quick-view'), 10);
      if (!isNaN(qvIdx) && portData[qvIdx]) {
        e.preventDefault();
        showModal(portData[qvIdx], qvIdx);
        return;
      }
    }

    /* js-project-preview cards (rail + spotlight image) */
    var card = e.target.closest('.js-project-preview');
    if (!card) return;

    /* Suppress after rail drag */
    if (Math.abs(dragDelta) > 8) return;

    var result = getProjectData(card);
    if (!result) return;   /* no data → allow default link navigation */
    e.preventDefault();
    showModal(result._data, result._idx);
  });

  /* ════════════════════════════════════════════════════════════════
     RAIL — ARROWS
     ════════════════════════════════════════════════════════════════ */
  function getScrollAmount() {
    if (!rail) return 320;
    var firstCard = rail.querySelector('.prl-card');
    if (!firstCard) return 320;
    var gap = parseFloat(getComputedStyle(rail).gap || '0') || 0;
    return firstCard.offsetWidth + gap;
  }

  var railPrevBtn = document.querySelector('[data-rail-prev]');
  var railNextBtn = document.querySelector('[data-rail-next]');

  if (railPrevBtn && rail) {
    railPrevBtn.addEventListener('click', function () {
      rail.scrollBy({ left: -getScrollAmount(), behavior: noMotion ? 'auto' : 'smooth' });
    });
  }
  if (railNextBtn && rail) {
    railNextBtn.addEventListener('click', function () {
      rail.scrollBy({ left: getScrollAmount(), behavior: noMotion ? 'auto' : 'smooth' });
    });
  }

  /* ── Rail dots (IntersectionObserver) ── */
  var railDots  = Array.from(document.querySelectorAll('[data-rail-dot]'));
  var railCards = rail ? Array.from(rail.querySelectorAll('.prl-card')) : [];

  if (rail && railDots.length && railCards.length) {
    var dotObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.intersectionRatio >= 0.5) {
          var ci = railCards.indexOf(entry.target);
          if (ci < 0) return;
          railDots.forEach(function (d, di) {
            var a = di === ci;
            d.classList.toggle('is-active', a);
            d.setAttribute('aria-selected', a ? 'true' : 'false');
          });
        }
      });
    }, { root: rail, threshold: 0.5 });

    railCards.forEach(function (c) { dotObs.observe(c); });

    railDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (!railCards[i]) return;
        railCards[i].scrollIntoView({
          behavior: noMotion ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     CATEGORY FILTER
     ════════════════════════════════════════════════════════════════ */
  var filterBar   = document.querySelector('[data-filter-bar]');
  var projectGrid = document.querySelector('[data-project-grid]');

  if (filterBar && projectGrid) {
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      var f = btn.getAttribute('data-filter');
      Array.from(filterBar.querySelectorAll('[data-filter]')).forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      Array.from(projectGrid.querySelectorAll('[data-category]')).forEach(function (card) {
        var match = f === 'all' || card.getAttribute('data-category') === f;
        card.classList.toggle('port-hidden', !match);
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════
     SCROLL REVEAL (.port-reveal)
     Content is always visible without JS; JS adds hidden state then
     reveals on intersection via js-enabled body class.
     ════════════════════════════════════════════════════════════════ */
  if (!noMotion && 'IntersectionObserver' in window) {
    document.body.classList.add('js-enabled');
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObs.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -16px 0px' });

    Array.from(document.querySelectorAll('.port-reveal')).forEach(function (el) {
      revealObs.observe(el);
    });
  }

})();
