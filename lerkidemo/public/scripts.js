(() => {
  const body = document.body;
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setNavState = (open) => {
    body.classList.toggle('nav-open', open);
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', String(open));
    }
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = body.classList.contains('nav-open');
      setNavState(!isOpen);
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setNavState(false));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) {
        setNavState(false);
      }
    });
  }

  const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));
  if (reduceMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const section = entry.target.closest('section');
          const siblings = section
            ? Array.from(section.querySelectorAll('[data-reveal]'))
            : revealItems;
          const index = Math.max(0, siblings.indexOf(entry.target));
          entry.target.style.transitionDelay = `${Math.min(index, 8) * 0.08}s`;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const form = document.getElementById('contact-form');
  if (form) {
    const status = form.querySelector('.form-status');
    const button = form.querySelector('button[type="submit"]');
    const setStatus = (message, isError) => {
      if (status) {
        status.textContent = message;
        status.style.color = isError ? '#a4483b' : '';
      }
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button) button.disabled = true;
      setStatus('Skickar...', false);

      try {
        const bodyData = new URLSearchParams(new FormData(form));
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: bodyData
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        const payload = await response.json().catch(() => ({}));
        setStatus(
          payload.message || 'Tack! Vi h\u00f6r av oss snart.',
          false
        );
        form.reset();
      } catch (error) {
        setStatus('N\u00e5got gick fel. Testa igen.', true);
      } finally {
        if (button) button.disabled = false;
      }
    });
  }

  document.querySelectorAll('[data-logo]').forEach((img) => {
    img.addEventListener('error', () => {
      const fallback = img.parentElement.querySelector('[data-logo-text]');
      if (fallback) {
        fallback.hidden = false;
      }
      img.hidden = true;
    });
  });

  window.addEventListener('load', () => {
    body.classList.add('is-loaded');
  });
})();
