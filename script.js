(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  // Theme preference is stored locally in this browser only.
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('jayapriya-portfolio-theme'); } catch (_) {}
  if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;
  updateThemeControl();

  function updateThemeControl() {
    const light = root.dataset.theme === 'light';
    themeIcon.textContent = light ? '☾' : '☼';
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  }

  themeToggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('jayapriya-portfolio-theme', root.dataset.theme); } catch (_) {}
    updateThemeControl();
  });

  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menuToggle.textContent = open ? '✕' : '☰';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
      menuToggle.textContent = '☰';
    });
  });

  // Reveal sections as they enter the viewport.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  // Active navigation follows the section currently in view.
  const sections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.querySelectorAll('a').forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // The filter works on the real project card only; no placeholder projects are added.
  const filterButtons = document.querySelectorAll('.filter-button');
  const projectCards = document.querySelectorAll('.project-card');
  const emptyState = document.getElementById('emptyState');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(item => item.classList.toggle('active', item === button));
      let visibleCount = 0;
      projectCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.hidden = !show;
        if (show) visibleCount += 1;
      });
      emptyState.hidden = visibleCount > 0;
    });
  });

  // Gentle 3D tilt for pointer devices.
  const tiltCard = document.querySelector('.tilt-card');
  if (tiltCard && window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tiltCard.addEventListener('pointermove', event => {
      const bounds = tiltCard.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      tiltCard.style.animationPlayState = 'paused';
      tiltCard.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg) rotate(3deg)`;
    });
    tiltCard.addEventListener('pointerleave', () => {
      tiltCard.style.animationPlayState = '';
      tiltCard.style.transform = '';
    });
  }

  // Click ripple effect for gradient and outlined action buttons.
  document.querySelectorAll('.ripple-target').forEach(button => {
    button.addEventListener('click', event => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${event.clientX - rect.left - diameter / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - diameter / 2}px`;
      button.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  });

  // Contact form is intentionally frontend-only: it validates, but never claims to send.
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('visitorName');
    const email = document.getElementById('visitorEmail');
    const message = document.getElementById('visitorMessage');
    formStatus.textContent = '';
    [name, email, message].forEach(field => field.removeAttribute('aria-invalid'));

    let invalidField = null;
    if (!name.value.trim()) invalidField = name;
    else if (!email.validity.valid || !email.value.trim()) invalidField = email;
    else if (!message.value.trim()) invalidField = message;

    if (invalidField) {
      invalidField.setAttribute('aria-invalid', 'true');
      invalidField.focus();
      formStatus.textContent = 'Please complete all fields with a valid email address.';
      return;
    }
    formStatus.textContent = 'Validation successful. This preview does not send messages; please use the email link to contact Jayapriya.';
  });
})();