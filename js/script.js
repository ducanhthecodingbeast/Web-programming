document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Mobile menu */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');

  const setMenu = open => {
    nav.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  hamburger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* 2. Theme toggle (persisted, follows system by default) */
  const themeToggle = document.getElementById('themeToggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const applyTheme = theme => {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#100f0d' : '#f4f0e8');
    window.dispatchEvent(new Event('themechange'));
  };

  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
  });

  /* 3. Smooth scroll + active nav link */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  const highlightNav = () => {
    let currentId = sections[0]?.id;
    const scrollPos = window.scrollY + 160;
    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) currentId = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  };

  /* 4. Message character counter */
  const messageInput = document.getElementById('message');
  const charCount = document.getElementById('charCount');
  messageInput.addEventListener('input', () => { charCount.textContent = messageInput.value.length; });

  /* 5. Contact form validation */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  const fields = {
    name: {
      input: document.getElementById('name'),
      error: document.getElementById('nameError'),
      validate: v => {
        if (!v.trim()) return 'Please enter your name.';
        if (v.trim().length < 2) return 'Your name is too short.';
        return '';
      }
    },
    email: {
      input: document.getElementById('email'),
      error: document.getElementById('emailError'),
      validate: v => {
        if (!v.trim()) return 'Please enter your email.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'That email address looks invalid.';
        return '';
      }
    },
    phone: {
      input: document.getElementById('phone'),
      error: document.getElementById('phoneError'),
      validate: v => {
        if (!v.trim()) return 'Please enter your phone number.';
        if (!/^(0|\+84)[0-9]{9}$/.test(v.trim())) return 'Invalid phone number (e.g. 0912345678).';
        return '';
      }
    },
    message: {
      input: document.getElementById('message'),
      error: document.getElementById('messageError'),
      validate: v => {
        if (!v.trim()) return 'Please enter a message.';
        if (v.trim().length < 10) return 'Your message needs at least 10 characters.';
        return '';
      }
    }
  };

  const validateField = key => {
    const { input, error, validate } = fields[key];
    const message = validate(input.value);
    input.closest('.form-group').classList.toggle('invalid', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    error.textContent = message;
    return !message;
  };

  Object.keys(fields).forEach(key => {
    fields[key].input.addEventListener('blur', () => validateField(key));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    formSuccess.hidden = true;

    const allValid = Object.keys(fields).map(validateField).every(Boolean);
    if (!allValid) return;

    const val = key => fields[key].input.value.trim();
    const body = `${val('message')}\n\n— ${val('name')}\n${val('email')} · ${val('phone')}`;
    const mailto = `mailto:ducanhdn.ptit@gmail.com?subject=${encodeURIComponent(`Portfolio message from ${val('name')}`)}&body=${encodeURIComponent(body)}`;

    formSuccess.hidden = false;
    window.location.href = mailto;

    form.reset();
    charCount.textContent = '0';
    Object.keys(fields).forEach(key => {
      fields[key].input.closest('.form-group').classList.remove('invalid');
      fields[key].input.removeAttribute('aria-invalid');
      fields[key].error.textContent = '';
    });
  });

  /* 6. Project search / filter */
  const projectSearch = document.getElementById('projectSearch');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const noResults = document.getElementById('noResults');
  let activeTag = 'all';

  const applyFilter = () => {
    const keyword = projectSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    projectCards.forEach(card => {
      const haystack = `${card.querySelector('h3').textContent} ${card.dataset.tags} ${card.querySelector('.chips').textContent}`.toLowerCase();
      const matchesTag = activeTag === 'all' || card.dataset.tags.split(' ').includes(activeTag);
      const visible = matchesTag && (!keyword || haystack.includes(keyword));
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    noResults.hidden = visibleCount !== 0;
  };

  projectSearch.addEventListener('input', applyFilter);

  tagButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tagButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      activeTag = btn.dataset.tag;
      applyFilter();
    });
  });

  /* 7. Scroll reveal */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = el.closest('.hero') ? `${i * 70}ms` : '';
      observer.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* 8. Back-to-top + scroll-driven nav highlight */
  const backToTop = document.getElementById('backToTop');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      backToTop.classList.toggle('show', window.scrollY > 500);
      highlightNav();
      ticking = false;
    });
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* 9. Footer year */
  document.getElementById('currentYear').textContent = new Date().getFullYear();

  /* 10. Hero "embedding space" canvas */
  const canvas = document.getElementById('fieldCanvas');
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('hero');
  let w = 0, h = 0, dpr = 1, points = [], running = false, rafId = 0;
  const pointer = { x: -9999, y: -9999 };
  const LINK_DIST = 120;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round(Math.min(90, Math.max(28, (w * h) / 14000)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.4 + 0.7
    }));
    draw();
  };

  const draw = () => {
    const rgb = getComputedStyle(root).getPropertyValue('--field-dot').trim() || '23, 20, 15';
    const accent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#d93f22';
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < LINK_DIST) {
          ctx.strokeStyle = `rgba(${rgb}, ${(1 - d / LINK_DIST) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      const near = Math.hypot(p.x - pointer.x, p.y - pointer.y) < 140;
      ctx.fillStyle = near ? accent : `rgba(${rgb}, 0.55)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, near ? p.r + 1.2 : p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const step = () => {
    points.forEach(p => {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140 && dist > 0) {
        p.vx += (dx / dist) * 0.02;
        p.vy += (dy / dist) * 0.02;
      }
      p.vx *= 0.995;
      p.vy *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    });
    draw();
    rafId = requestAnimationFrame(step);
  };

  const start = () => { if (!running && !reduceMotion) { running = true; rafId = requestAnimationFrame(step); } };
  const stop = () => { running = false; cancelAnimationFrame(rafId); };

  if (ctx) {
    resize();
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
    window.addEventListener('themechange', draw);
    hero.addEventListener('pointermove', e => {
      const rect = hero.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    });
    hero.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(hero);
    } else {
      start();
    }
  }

  highlightNav();
});
