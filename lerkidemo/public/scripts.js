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

  // Booking Modal
  const modal = document.getElementById('booking-modal');
  const closeModal = document.getElementById('close-modal');
  const bookingTriggers = document.querySelectorAll('.booking-trigger');
  let widgetLoaded = false;

  const openBookingModal = () => {
    if (modal) {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';

      // Load widget only once
      if (!widgetLoaded) {
        loadBookdWidget();
        widgetLoaded = true;
      }
    }
  };

  const closeBookingModal = () => {
    if (modal) {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  };

  const loadBookdWidget = () => {
    const container = document.getElementById('bookd-widget-08cf53ba');
    if (!container) return;

    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.bookd.se/book/08cf53ba?primary=fd8181&headerBg=ffffff&headerIcons=323232&layout=list&lang=swedish&textSize=big&prices=1&areaStep=0&config=%7B%22appearance%22%3A%7B%22logoUrl%22%3A%22%22%2C%22headerBg%22%3A%22%23ffffff%22%2C%22headerIcons%22%3A%22%23323232%22%2C%22hideBranding%22%3Afalse%2C%22primaryColor%22%3A%22%23fd8181%22%7D%2C%22content%22%3A%7B%22startHeading%22%3A%22Boka+nu%22%2C%22startText%22%3A%22Ange+din+adress+f%C3%B6r+att+forts%C3%A4tta.%22%2C%22categoryHeading%22%3A%22V%C3%A4lj+kategori%22%2C%22categoryText%22%3A%22%22%2C%22serviceHeading%22%3A%22V%C3%A4lj+tj%C3%A4nst%22%2C%22serviceText%22%3A%22%22%2C%22schedulingHeading%22%3A%22Datum+%26+tid%22%2C%22schedulingText%22%3A%22V%C3%A4lj+ett+datum+och+en+tid+som+passar+dig.%22%2C%22contactHeading%22%3A%22Snart+klart%22%2C%22contactText%22%3A%22Ange+kontaktuppgifter+f%C3%B6r+att+slutf%C3%B6ra+bokningen.%22%2C%22contactButton%22%3A%22Boka%22%2C%22confirmationHeading%22%3A%22Tack+f%C3%B6r+din+bokning%21%22%2C%22confirmationText%22%3A%22Vi+har+mottagit+din+bokning+och+skickat+en+bekr%C3%A4ftelse+till+din+e-post.%22%7D%2C%22general%22%3A%7B%22serviceArea%22%3A%22address%22%2C%22showServiceAreaStep%22%3Afalse%2C%22showEmployeeStep%22%3Atrue%2C%22layout%22%3A%22list%22%2C%22datePicker%22%3A%22available%22%2C%22language%22%3A%22Swedish%22%2C%22textSize%22%3A%22Big%22%2C%22showPrices%22%3Atrue%2C%22includeTax%22%3Atrue%2C%22autoAdvance%22%3Atrue%2C%22allowCoupons%22%3Atrue%2C%22showAllSteps%22%3Afalse%2C%22showDuration%22%3Afalse%2C%22limitAnimations%22%3Afalse%2C%22use24h%22%3Atrue%2C%22allowMulti%22%3Afalse%2C%22brandingLocked%22%3Atrue%7D%2C%22customQuestions%22%3A%5B%5D%2C%22employeeServices%22%3A%7B%7D%2C%22services%22%3A%5B%7B%22id%22%3A%22svc-319639ca-bbce-4dd2-adb0-0b9e7e2054ba%22%2C%22price%22%3A%221999+kr%22%2C%22title%22%3A%22Klippning%22%2C%22visible%22%3Atrue%2C%22duration%22%3A%221h%22%2C%22categoryId%22%3A%22cat-3ea69b3e-ace8-4639-b869-39ddf6edfac6%22%2C%22description%22%3A%22%22%7D%2C%7B%22id%22%3A%22svc-1e16eeff-e2f3-4b2a-ae8b-5c34bbbaaf3f%22%2C%22price%22%3A%226999+kr%22%2C%22title%22%3A%22F%C3%A4rgning%22%2C%22visible%22%3Atrue%2C%22duration%22%3A%226h%22%2C%22categoryId%22%3A%22cat-58ca0e64-b046-4899-ad37-ca64ab7cb4ea%22%2C%22description%22%3A%22%22%7D%2C%7B%22id%22%3A%22svc-413cdaa3-01c0-45ba-a0ad-914173299f25%22%2C%22price%22%3A%221999+kr%22%2C%22title%22%3A%22Klippning%22%2C%22visible%22%3Atrue%2C%22duration%22%3A%221h%22%2C%22categoryId%22%3A%22cat-58ca0e64-b046-4899-ad37-ca64ab7cb4ea%22%2C%22description%22%3A%22%22%7D%5D%2C%22categories%22%3A%5B%7B%22id%22%3A%22cat-3ea69b3e-ace8-4639-b869-39ddf6edfac6%22%2C%22name%22%3A%22Herr%22%2C%22visible%22%3Atrue%2C%22description%22%3A%22%22%7D%2C%7B%22id%22%3A%22cat-58ca0e64-b046-4899-ad37-ca64ab7cb4ea%22%2C%22name%22%3A%22Dam%22%2C%22visible%22%3Atrue%2C%22description%22%3A%22%22%7D%5D%2C%22territories%22%3A%5B%5D%7D&start=employee';
    iframe.style.width = '100%';
    iframe.style.height = '750px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.setAttribute('allow', 'fullscreen');

    iframe.addEventListener('load', function() {
      try {
        iframe.contentWindow.postMessage({
          type: 'bookd:config',
          slug: '08cf53ba',
          config: {"appearance":{"logoUrl":"","headerBg":"#ffffff","headerIcons":"#323232","hideBranding":false,"primaryColor":"#fd8181"},"content":{"startHeading":"Boka nu","startText":"Ange din adress för att fortsätta.","categoryHeading":"Välj kategori","categoryText":"","serviceHeading":"Välj tjänst","serviceText":"","schedulingHeading":"Datum & tid","schedulingText":"Välj ett datum och en tid som passar dig.","contactHeading":"Snart klart","contactText":"Ange kontaktuppgifter för att slutföra bokningen.","contactButton":"Boka","confirmationHeading":"Tack för din bokning!","confirmationText":"Vi har mottagit din bokning och skickat en bekräftelse till din e-post."},"general":{"serviceArea":"address","showServiceAreaStep":false,"showEmployeeStep":true,"layout":"list","datePicker":"available","language":"Swedish","textSize":"Big","showPrices":true,"includeTax":true,"autoAdvance":true,"allowCoupons":true,"showAllSteps":false,"showDuration":false,"limitAnimations":false,"use24h":true,"allowMulti":false,"brandingLocked":true},"customQuestions":[],"employeeServices":{},"services":[{"id":"svc-319639ca-bbce-4dd2-adb0-0b9e7e2054ba","price":"1999 kr","title":"Klippning","visible":true,"duration":"1h","categoryId":"cat-3ea69b3e-ace8-4639-b869-39ddf6edfac6","description":""},{"id":"svc-1e16eeff-e2f3-4b2a-ae8b-5c34bbbaaf3f","price":"6999 kr","title":"Färgning","visible":true,"duration":"6h","categoryId":"cat-58ca0e64-b046-4899-ad37-ca64ab7cb4ea","description":""},{"id":"svc-413cdaa3-01c0-45ba-a0ad-914173299f25","price":"1999 kr","title":"Klippning","visible":true,"duration":"1h","categoryId":"cat-58ca0e64-b046-4899-ad37-ca64ab7cb4ea","description":""}],"categories":[{"id":"cat-3ea69b3e-ace8-4639-b869-39ddf6edfac6","name":"Herr","visible":true,"description":""},{"id":"cat-58ca0e64-b046-4899-ad37-ca64ab7cb4ea","name":"Dam","visible":true,"description":""}],"territories":[]}
        }, '*');
      } catch (e) {
        console.error('Error posting message to iframe:', e);
      }
    });

    container.appendChild(iframe);
  };

  // Add event listeners to all booking triggers
  bookingTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal();
    });
  });

  // Close modal when clicking close button
  if (closeModal) {
    closeModal.addEventListener('click', closeBookingModal);
  }

  // Close modal when clicking overlay
  if (modal) {
    const overlay = modal.querySelector('.booking-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeBookingModal);
    }
  }

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeBookingModal();
    }
  });
})();
