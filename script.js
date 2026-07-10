/* ==========================================================================
   PORTFOLIO SCRIPT.JS
   All interactivity: theme toggle, animations, form handling, etc.
   Organized into small, independent modules — each wrapped in its own
   function so one feature failing doesn't break the rest of the page.
   ========================================================================== */

/* ---------------------------------------------------------------------
   0. REPLACE THIS WITH YOUR OWN DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
   See README.md / setup instructions for how to generate this.
--------------------------------------------------------------------- */
const GOOGLE_SCRIPT_URL = " https://script.google.com/macros/s/AKfycbxdKsmCRHymffu5PP6gapepT1TtL8oGKMJsrn1M2wfh7oNJ8lFwe-WP1SGPx7ngM8zU0Q/exec";

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCustomCursor();
  initParticles();
  initNavbar();
  initThemeToggle();
  initTypingAnimation();
  initScrollReveal();
  initCounters();
  initSkillBars();
  initProjectFilter();
  initLightbox();
  initTestimonialSlider();
  initBackToTop();
  initContactForm();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* ---------------------------------------------------------------------
   1. PRELOADER — hides once the window has fully loaded
--------------------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader.classList.add('hidden'), 400);
  });
}

/* ---------------------------------------------------------------------
   2. CUSTOM CURSOR — a dot + trailing ring that follow the pointer
--------------------------------------------------------------------- */
function initCustomCursor() {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  // Smoothly ease the ring toward the cursor for a "lag" effect
  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Grow the ring over clickable elements
  document.querySelectorAll('a, button, input, textarea, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.style.transform = 'translate(-50%, -50%) scale(1.6)');
    el.addEventListener('mouseleave', () => ring.style.transform = 'translate(-50%, -50%) scale(1)');
  });
}

/* ---------------------------------------------------------------------
   3. PARTICLE BACKGROUND — lightweight canvas particle network
--------------------------------------------------------------------- */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const COUNT = Math.min(70, Math.floor((w * h) / 18000));

  function isLight() { return document.documentElement.getAttribute('data-theme') === 'light'; }

  class Particle {
    constructor() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.6 + 0.6;
    }
    move() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > w) this.vx *= -1;
      if (this.y < 0 || this.y > h) this.vy *= -1;
    }
  }
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const color = isLight() ? '16, 20, 42' : '148, 160, 190';
    particles.forEach(p => {
      p.move();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.5)`;
      ctx.fill();
    });
    // Connect nearby particles with faint lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${color}, ${0.12 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ---------------------------------------------------------------------
   4. NAVBAR — sticky background on scroll, mobile toggle, active link
--------------------------------------------------------------------- */
function initNavbar() {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    updateBackToTop();
  });

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu after a link is tapped
  links.forEach(link => link.addEventListener('click', () => {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  // Highlight the nav link matching the section currently in view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* ---------------------------------------------------------------------
   5. THEME TOGGLE — dark/light with localStorage persistence
--------------------------------------------------------------------- */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  const root = document.documentElement;
  const saved = localStorage.getItem('portfolio-theme');

  // Respect saved preference, otherwise default to dark
  if (saved === 'light') root.setAttribute('data-theme', 'light');

  toggleBtn.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) {
      root.removeAttribute('data-theme');
      localStorage.setItem('portfolio-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('portfolio-theme', 'light');
    }
  });
}

/* ---------------------------------------------------------------------
   6. TYPING ANIMATION — cycles through job titles in the hero
--------------------------------------------------------------------- */
function initTypingAnimation() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const phrases = [
    'Full-Stack Developer',
    'UI/UX Enthusiast',
    'Java Application Builder',
    'Database Designer'
  ];

  let phraseIndex = 0, charIndex = 0, deleting = false;

  function tick() {
    const current = phrases[phraseIndex];
    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1500); // pause at full phrase
        return;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 45 : 85);
  }
  tick();
}

/* ---------------------------------------------------------------------
   7. SCROLL REVEAL — fades/slides elements with [data-aos] into view
--------------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-aos]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-aos-delay') || 0;
        setTimeout(() => entry.target.classList.add('in-view'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => observer.observe(item));
}

/* ---------------------------------------------------------------------
   8. ANIMATED COUNTERS — counts up when the About section is visible
--------------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current;
      }, 25);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ---------------------------------------------------------------------
   9. SKILL PROGRESS BARS — animates width when scrolled into view
--------------------------------------------------------------------- */
function initSkillBars() {
  const bars = document.querySelectorAll('.progress-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.getAttribute('data-width') + '%';
        obs.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach(bar => observer.observe(bar));
}

/* ---------------------------------------------------------------------
   10. PROJECT FILTERING — shows/hides cards by data-category
--------------------------------------------------------------------- */
function initProjectFilter() {
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.project-card');
  if (!chips.length) return;

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected', 'false'); });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');

      const filter = chip.getAttribute('data-filter');
      cards.forEach(card => {
        const match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('hidden-card', !match);
      });
    });
  });
}

/* ---------------------------------------------------------------------
   11. IMAGE LIGHTBOX — click a project screenshot to view it larger
--------------------------------------------------------------------- */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  if (!lightbox) return;

  document.querySelectorAll('.lightbox-img, .zoom-btn').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const card = e.target.closest('.project-image');
      const img = card ? card.querySelector('img') : e.target;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });

  function close() { lightbox.classList.remove('open'); }
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* ---------------------------------------------------------------------
   12. TESTIMONIAL SLIDER — auto-playing + manual arrows/dots
--------------------------------------------------------------------- */
function initTestimonialSlider() {
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  if (!track) return;

  const slides = track.children;
  let index = 0;
  let autoTimer;

  // Build dots dynamically
  for (let i = 0; i < slides.length; i++) {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }
  const dots = dotsWrap.children;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    Array.from(dots).forEach((d, di) => d.classList.toggle('active', di === index));
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(index + 1), 5000);
  }
  function stopAuto() { clearInterval(autoTimer); }

  prevBtn.addEventListener('click', () => { goTo(index - 1); stopAuto(); startAuto(); });
  nextBtn.addEventListener('click', () => { goTo(index + 1); stopAuto(); startAuto(); });
  track.parentElement.addEventListener('mouseenter', stopAuto);
  track.parentElement.addEventListener('mouseleave', startAuto);

  startAuto();
}

/* ---------------------------------------------------------------------
   13. BACK TO TOP BUTTON
--------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
function updateBackToTop() {
  const btn = document.getElementById('backToTop');
  if (btn) btn.classList.toggle('visible', window.scrollY > 500);
}

/* ---------------------------------------------------------------------
   14. CONTACT FORM — validation + Google Sheets submission via
       Google Apps Script Web App (see Code.gs)
--------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('formStatus');

  const fields = {
    fullName: { el: document.getElementById('fullName'), label: 'Full name' },
    email: { el: document.getElementById('email'), label: 'Email' },
    phone: { el: document.getElementById('phone'), label: 'Phone' },
    subject: { el: document.getElementById('subject'), label: 'Subject' },
    message: { el: document.getElementById('message'), label: 'Message' }
  };

  // ---- Validation helpers ----
  function showError(key, msg) {
    fields[key].el.classList.toggle('invalid', !!msg);
    document.getElementById(`err-${key}`).textContent = msg || '';
  }

  function validate() {
    let valid = true;

    if (!fields.fullName.el.value.trim()) {
      showError('fullName', 'Please enter your full name.'); valid = false;
    } else showError('fullName', '');

    const emailVal = fields.email.el.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      showError('email', 'Please enter your email address.'); valid = false;
    } else if (!emailPattern.test(emailVal)) {
      showError('email', 'Please enter a valid email address.'); valid = false;
    } else showError('email', '');

    const phoneVal = fields.phone.el.value.trim();
    if (phoneVal && !/^[+()\-\s0-9]{7,20}$/.test(phoneVal)) {
      showError('phone', 'Please enter a valid phone number.'); valid = false;
    } else showError('phone', '');

    if (!fields.subject.el.value.trim()) {
      showError('subject', 'Please enter a subject.'); valid = false;
    } else showError('subject', '');

    if (!fields.message.el.value.trim()) {
      showError('message', 'Please write a short message.'); valid = false;
    } else if (fields.message.el.value.trim().length < 10) {
      showError('message', 'Message should be at least 10 characters.'); valid = false;
    } else showError('message', '');

    return valid;
  }

  // Clear individual field errors as the user types
  Object.keys(fields).forEach(key => {
    fields[key].el.addEventListener('input', () => showError(key, ''));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    if (!validate()) {
      statusEl.textContent = 'Please fix the highlighted fields above.';
      statusEl.classList.add('error');
      return;
    }

    const payload = {
      name: fields.fullName.el.value.trim(),
      email: fields.email.el.value.trim(),
      phone: fields.phone.el.value.trim(),
      subject: fields.subject.el.value.trim(),
      message: fields.message.el.value.trim()
    };

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      if (GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
        // Safety net so the demo doesn't silently fail before setup
        throw new Error('CONFIG_MISSING');
      }

      // Google Apps Script Web Apps expect a simple POST; using
      // 'text/plain' avoids a CORS pre-flight request that Apps Script
      // does not handle well.
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.result === 'success') {
        statusEl.textContent = 'Thank you! Your message has been sent successfully.';
        statusEl.classList.add('success');
        form.reset();
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      if (err.message === 'CONFIG_MISSING') {
        statusEl.textContent = 'Form is not connected yet — set GOOGLE_SCRIPT_URL in script.js (see README).';
      } else {
        statusEl.textContent = 'Something went wrong. Please try again or email me directly.';
      }
      statusEl.classList.add('error');
      console.error('Contact form submission error:', err);
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
}
