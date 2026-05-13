(function () {
  const doc = document;
  const root = doc.documentElement;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (doc.readyState !== 'loading') fn();
    else doc.addEventListener('DOMContentLoaded', fn);
  }

  ready(() => {
    doc.body.classList.add('motion-ready');
    createProgressBar();
    createAmbientPointer();
    markRevealElements();
    setupRevealObserver();
    setupNavScroll();
    setupMagneticButtons();
    setupTiltCards();
    setupImageParallax();
    setupContactCardSheen();
    setupPageLoadAnimation();
  });

  function createProgressBar() {
    if (doc.querySelector('.scroll-progress')) return;
    const bar = doc.createElement('div');
    bar.className = 'scroll-progress';
    doc.body.prepend(bar);

    const update = () => {
      const scrollable = doc.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable <= 0 ? 0 : window.scrollY / scrollable;
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  function createAmbientPointer() {
    if (reduceMotion) return;
    const glow = doc.createElement('div');
    glow.className = 'pointer-glow';
    doc.body.appendChild(glow);

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    window.addEventListener('pointermove', (event) => {
      tx = event.clientX;
      ty = event.clientY;
      root.style.setProperty('--mouse-x', `${event.clientX}px`);
      root.style.setProperty('--mouse-y', `${event.clientY}px`);
    }, { passive: true });

    const tick = () => {
      x += (tx - x) * 0.1;
      y += (ty - y) * 0.1;
      glow.style.transform = `translate3d(${x - 220}px, ${y - 220}px, 0)`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  function markRevealElements() {
    const selectors = [
      '.hero-copy', '.hero-showcase', '.section-heading', '.featured-card', '.service-pro-card',
      '.fivem-spotlight', '.process-grid article', '.cta-panel', '.project-card', '.portfolio-card',
      '.contact-channel-card', '.contact-polished-cta', '.about-card', '.skill-row', '.admin-panel',
      '.admin-section', '.stat-strip span', '.section-band span'
    ];
    selectors.forEach((selector) => {
      doc.querySelectorAll(selector).forEach((element, index) => {
        element.classList.add('motion-reveal');
        element.style.setProperty('--reveal-delay', `${Math.min(index * 45, 280)}ms`);
      });
    });
  }

  function setupRevealObserver() {
    const items = Array.from(doc.querySelectorAll('.motion-reveal'));
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -70px 0px' });

    items.forEach((item) => observer.observe(item));
  }

  function setupNavScroll() {
    const nav = doc.querySelector('.nav');
    if (!nav) return;
    const update = () => nav.classList.toggle('nav-scrolled', window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function setupMagneticButtons() {
    if (reduceMotion) return;
    doc.querySelectorAll('.btn, .channel-button, .text-link').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.setProperty('--magnet-x', `${x * 0.12}px`);
        button.style.setProperty('--magnet-y', `${y * 0.18}px`);
      });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--magnet-x', '0px');
        button.style.setProperty('--magnet-y', '0px');
      });
    });
  }

  function setupTiltCards() {
    if (reduceMotion) return;
    const cards = doc.querySelectorAll('.featured-card, .project-card, .service-pro-card, .contact-channel-card, .hero-showcase');
    cards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`);
        card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  function setupImageParallax() {
    if (reduceMotion) return;
    doc.querySelectorAll('.featured-card img, .project-image-link img, .gallery-main').forEach((image) => {
      const parent = image.closest('.featured-card, .project-card, .project-image-link') || image.parentElement;
      if (!parent) return;
      parent.addEventListener('pointermove', (event) => {
        const rect = parent.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
        image.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.06)`;
      });
      parent.addEventListener('pointerleave', () => {
        image.style.transform = '';
      });
    });
  }

  function setupContactCardSheen() {
    doc.querySelectorAll('.contact-channel-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--shine-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--shine-y', `${event.clientY - rect.top}px`);
      });
    });
  }

  function setupPageLoadAnimation() {
    if (reduceMotion) return;
    const anime = window.anime;
    const heroTitle = doc.querySelector('.hero h1, .contact-hero-simple h1, .about-hero h1, .portfolio-hero h1');

    if (anime && heroTitle && !heroTitle.dataset.splitAnimated) {
      heroTitle.dataset.splitAnimated = 'true';
      const text = heroTitle.textContent.trim();
      const words = text.split(/\s+/);
      heroTitle.innerHTML = words.map((word) => `<span class="word-reveal">${escapeHtml(word)}</span>`).join(' ');
      anime({
        targets: heroTitle.querySelectorAll('.word-reveal'),
        translateY: [40, 0],
        opacity: [0, 1],
        filter: ['blur(10px)', 'blur(0px)'],
        delay: anime.stagger(70),
        duration: 850,
        easing: 'easeOutExpo'
      });
    }

    if (anime) {
      anime({
        targets: '.nav',
        translateY: [-24, 0],
        opacity: [0, 1],
        duration: 700,
        easing: 'easeOutExpo'
      });
      anime({
        targets: '.section-band span',
        opacity: [0, 1],
        translateY: [18, 0],
        delay: anime.stagger(80, { start: 500 }),
        duration: 650,
        easing: 'easeOutExpo'
      });
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
