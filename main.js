/* ═══════════════════════════════════════════════════
   PRECISA WEDDING PLANNER — main.js
   Handles: Navbar, Hero, Scroll Effects, Gallery,
            Lightbox, Testimonials Slider, Stats Counter,
            Contact Form, Back-to-Top, WhatsApp
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. NAVBAR ──────────────────────────────────── */
  const navbar   = document.getElementById('navbar');
  const hamburger= document.getElementById('hamburger');
  const navMenu  = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll → sticky style
  const onNavScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  // Mobile menu toggle
  hamburger.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close menu on nav-link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu on outside click
  document.addEventListener('click', e => {
    if (navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const highlightNav = () => {
    const scrollY = window.scrollY;
    sections.forEach(sec => {
      const top    = sec.offsetTop - 100;
      const bottom = top + sec.offsetHeight;
      const id     = sec.getAttribute('id');
      const link   = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) link.classList.toggle('active', scrollY >= top && scrollY < bottom);
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });

  /* ─── 2. HERO BG ANIMATION ───────────────────────── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    setTimeout(() => heroBg.classList.add('loaded'), 200);
  }

  /* ─── 3. REVEAL ON SCROLL ───────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        let delay = 0;
        siblings.forEach((el, idx) => {
          if (el === entry.target) delay = idx * 80;
        });
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ─── 4. STATS COUNTER ──────────────────────────── */
  let statsTriggered = false;

  const animateCounter = (el, target, duration = 1800) => {
    const start   = performance.now();
    const update  = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    };
    requestAnimationFrame(update);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statsTriggered) {
      statsTriggered = true;
      document.querySelectorAll('.stat-number').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target, 10));
      });
    }
  }, { threshold: 0.4 });

  const statsSection = document.getElementById('estadisticas');
  if (statsSection) statsObserver.observe(statsSection);

  /* ─── 5. GALLERY FILTER + LIGHTBOX ─────────────── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose   = document.getElementById('lightbox-close');
  const lightboxPrev    = document.getElementById('lightbox-prev');
  const lightboxNext    = document.getElementById('lightbox-next');

  let lightboxImages = [];
  let currentLbIdx   = 0;

  // Collect visible images for lightbox
  const buildLightboxImages = () => {
    lightboxImages = [];
    document.querySelectorAll('.gallery-item:not(.hidden)').forEach(item => {
      lightboxImages.push({
        src: item.querySelector('img').src,
        alt: item.querySelector('img').alt,
        caption: item.querySelector('.gallery-overlay p').textContent
      });
    });
  };

  // Filter
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !show);
      });
      buildLightboxImages();
    });
  });
  buildLightboxImages();

  // Open lightbox
  const openLightbox = (idx) => {
    currentLbIdx = idx;
    const data = lightboxImages[idx];
    lightboxImg.src   = data.src;
    lightboxImg.alt   = data.alt;
    lightboxCaption.textContent = data.caption;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightbox.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  const showLbPrev = () => {
    currentLbIdx = (currentLbIdx - 1 + lightboxImages.length) % lightboxImages.length;
    openLightbox(currentLbIdx);
  };

  const showLbNext = () => {
    currentLbIdx = (currentLbIdx + 1) % lightboxImages.length;
    openLightbox(currentLbIdx);
  };

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      buildLightboxImages();
      const src = item.querySelector('img').src;
      const visIdx = lightboxImages.findIndex(i => i.src === src);
      openLightbox(visIdx >= 0 ? visIdx : 0);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showLbPrev);
  lightboxNext.addEventListener('click', showLbNext);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLbPrev();
    if (e.key === 'ArrowRight') showLbNext();
  });

  /* ─── 6. TESTIMONIALS SLIDER ────────────────────── */
  const track  = document.getElementById('testimonials-track');
  const tPrev  = document.getElementById('t-prev');
  const tNext  = document.getElementById('t-next');
  const tDots  = document.querySelectorAll('.t-dot');
  const cards  = track ? track.querySelectorAll('.testimonial-card') : [];

  let tIdx   = 0;
  let tAuto  = null;
  const tTotal = cards.length;

  const getVisible = () => {
    if (window.innerWidth >= 992) return 3;
    if (window.innerWidth >= 600) return 2;
    return 1;
  };

  const updateSlider = () => {
    if (!track) return;
    const visible = getVisible();
    const cardPct = 100 / visible;
    track.style.transform = `translateX(-${tIdx * cardPct}%)`;
    tDots.forEach((dot, i) => dot.classList.toggle('active', i === tIdx));
  };

  const nextSlide = () => {
    tIdx = (tIdx + 1) % tTotal;
    updateSlider();
  };
  const prevSlide = () => {
    tIdx = (tIdx - 1 + tTotal) % tTotal;
    updateSlider();
  };

  if (tNext) tNext.addEventListener('click', () => { nextSlide(); resetAuto(); });
  if (tPrev) tPrev.addEventListener('click', () => { prevSlide(); resetAuto(); });
  tDots.forEach((dot, i) => {
    dot.addEventListener('click', () => { tIdx = i; updateSlider(); resetAuto(); });
  });

  const startAuto = () => { tAuto = setInterval(nextSlide, 5000); };
  const resetAuto = () => { clearInterval(tAuto); startAuto(); };
  startAuto();
  window.addEventListener('resize', updateSlider);
  updateSlider();

  /* ─── 7. CONTACT FORM ───────────────────────────── */
  const form        = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = document.getElementById('form-submit');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Enviando...';

      // Simulate API call
      await new Promise(r => setTimeout(r, 1800));

      form.style.display = 'none';
      formSuccess.style.display = 'flex';
      formSuccess.style.flexDirection = 'column';
    });
  }

  /* ─── 8. BACK TO TOP ────────────────────────────── */
  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      backBtn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─── 9. CURRENT YEAR ───────────────────────────── */
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─── 10. PARALLAX EFFECT ───────────────────────── */
  const parallaxEls = document.querySelectorAll('.hero-bg, .process-bg, .contact-top-image');
  const onParallax  = () => {
    const scrollY = window.scrollY;
    parallaxEls.forEach(el => {
      const parent = el.closest('section') || el.parentElement;
      const top    = parent.offsetTop;
      const rel    = scrollY - top;
      if (Math.abs(rel) < window.innerHeight * 1.5) {
        const offset = rel * 0.25;
        el.style.backgroundPositionY = `calc(50% + ${offset}px)`;
      }
    });
  };
  window.addEventListener('scroll', onParallax, { passive: true });

  /* ─── 11. SMOOTH ANCHOR OFFSET ──────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH   = navbar.offsetHeight;
        const targetY= target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    });
  });

  /* ─── 12. TOUCH SWIPE FOR GALLERY ───────────────── */
  let touchStartX = 0;
  if (track) {
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
        resetAuto();
      }
    }, { passive: true });
  }

  /* ─── 13. WHATSAPP FLOAT PULSE ───────────────────── */
  const waFloat = document.getElementById('whatsapp-float');
  if (waFloat) {
    setInterval(() => {
      waFloat.style.transform = 'scale(1.12)';
      setTimeout(() => { waFloat.style.transform = ''; }, 300);
    }, 4000);
  }

});
