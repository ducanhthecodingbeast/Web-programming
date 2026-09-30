document.addEventListener('DOMContentLoaded', () => {

  /* 1. Hamburger menu toggle */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* 2. Dark / light mode toggle (persisted) */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark) {
      root.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'light');
    } else {
      root.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'dark');
    }
  });

  /* 3. Smooth scroll + active nav link highlight */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const highlightNav = () => {
    let currentId = sections[0]?.id;
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  };

  /* 4. Character counter for message textarea */
  const messageInput = document.getElementById('message');
  const charCount = document.getElementById('charCount');

  messageInput.addEventListener('input', () => {
    charCount.textContent = messageInput.value.length;
  });

  /* 5. Contact form validation (multiple conditions) */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  const fields = {
    name: {
      input: document.getElementById('name'),
      error: document.getElementById('nameError'),
      validate: value => {
        if (!value.trim()) return 'Vui lòng nhập họ tên.';
        if (value.trim().length < 2) return 'Họ tên quá ngắn.';
        return '';
      }
    },
    email: {
      input: document.getElementById('email'),
      error: document.getElementById('emailError'),
      validate: value => {
        if (!value.trim()) return 'Vui lòng nhập email.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return 'Email không hợp lệ.';
        return '';
      }
    },
    phone: {
      input: document.getElementById('phone'),
      error: document.getElementById('phoneError'),
      validate: value => {
        if (!value.trim()) return 'Vui lòng nhập số điện thoại.';
        const phoneRegex = /^(0|\+84)[0-9]{9}$/;
        if (!phoneRegex.test(value.trim())) return 'Số điện thoại không hợp lệ (VD: 0912345678).';
        return '';
      }
    },
    message: {
      input: document.getElementById('message'),
      error: document.getElementById('messageError'),
      validate: value => {
        if (!value.trim()) return 'Vui lòng nhập lời nhắn.';
        if (value.trim().length < 10) return 'Lời nhắn cần ít nhất 10 ký tự.';
        return '';
      }
    }
  };

  const validateField = key => {
    const { input, error, validate } = fields[key];
    const message = validate(input.value);
    input.closest('.form-group').classList.toggle('invalid', Boolean(message));
    error.textContent = message;
    return !message;
  };

  Object.keys(fields).forEach(key => {
    fields[key].input.addEventListener('blur', () => validateField(key));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    formSuccess.hidden = true;

    const results = Object.keys(fields).map(key => validateField(key));
    const allValid = results.every(Boolean);

    if (allValid) {
      formSuccess.hidden = false;
      form.reset();
      charCount.textContent = '0';
      Object.keys(fields).forEach(key => {
        fields[key].input.closest('.form-group').classList.remove('invalid');
        fields[key].error.textContent = '';
      });
    }
  });

  /* 6. Project search / filter by keyword or tag */
  const projectSearch = document.getElementById('projectSearch');
  const tagButtons = document.querySelectorAll('.tag-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const noResults = document.getElementById('noResults');
  let activeTag = 'all';

  const applyFilter = () => {
    const keyword = projectSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    projectCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const tags = card.dataset.tags.toLowerCase();
      const matchesTag = activeTag === 'all' || tags.includes(activeTag);
      const matchesKeyword = !keyword || title.includes(keyword) || tags.includes(keyword);
      const visible = matchesTag && matchesKeyword;

      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    noResults.hidden = visibleCount !== 0;
  };

  projectSearch.addEventListener('input', applyFilter);

  tagButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tagButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTag = btn.dataset.tag;
      applyFilter();
    });
  });

  /* 7. Scroll reveal animation */
  const revealEls = document.querySelectorAll('.reveal, .skill-card');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* 8. Back-to-top button + scroll-driven nav highlight */
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 400);
    highlightNav();
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* 9. Current year in footer */
  document.getElementById('currentYear').textContent = new Date().getFullYear();

  highlightNav();
});
