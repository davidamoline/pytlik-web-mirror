// Sidebar visibility: hide on homepage hero, show after scroll; always visible on interior pages
(() => {
  const homeHero = document.querySelector('.home-hero');
  const drBadges = document.querySelector('.dr-badges-bar');
  const drHero = document.querySelector('.dr-hero');
  const hero = homeHero || drHero;
  const logo = document.querySelector('.side-nav-logo');
  const rail = document.querySelector('.side-nav-rail');

  // Menu and CTA are always visible
  if (rail) rail.classList.add('is-visible');

  if (hero && logo) {
    // Pages with hero: only the logo toggles — hidden while hero visible, shown after scroll
    const observer = new IntersectionObserver(([entry]) => {
      logo.classList.toggle('is-visible', !entry.isIntersecting);
    }, { threshold: 0 });
    observer.observe(hero);
  } else {
    // Interior pages (no hero): logo always visible
    if (logo) logo.classList.add('is-visible');
  }
})();

// Table of contents scroll tracking
(() => {
  const links = document.querySelectorAll('.toc-link');
  if (!links.length) return;

  const sections = Array.from(links).map((link) => {
    const id = link.getAttribute('href').slice(1);
    return document.getElementById(id);
  }).filter(Boolean);

  const activate = (id) => {
    links.forEach((link) => {
      const isMatch = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isMatch);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        activate(entry.target.id);
      }
    }
  }, { rootMargin: '-20% 0px -60% 0px' });

  sections.forEach((section) => observer.observe(section));
})();

// Carousel: left/right arrow navigation
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  if (!track) return;

  const scrollBy = () => {
    const slide = track.firstElementChild;
    return slide.offsetWidth + 24; // card width + gap
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollBy(), behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollBy(), behavior: 'smooth' });
    });
  }
});

// Appointment time: generate next available Friday 1PM and Monday 8:30AM slots
(() => {
  const container = document.getElementById('appointment-time-options');
  if (!container) return;

  const days = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  function formatDate(d, time) {
    return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ' at ' + time;
  }

  function getNextDayOfWeek(start, dayOfWeek) {
    const d = new Date(start);
    d.setDate(d.getDate() + ((dayOfWeek + 7 - d.getDay()) % 7 || 7));
    return d;
  }

  const today = new Date();
  const slots = [];
  let fri = getNextDayOfWeek(today, 5);
  let mon = getNextDayOfWeek(today, 1);

  // Collect next 3 slots alternating Fri/Mon in chronological order
  const candidates = [];
  for (let i = 0; i < 4; i++) {
    candidates.push({ date: new Date(fri), time: '1:00 PM' });
    fri.setDate(fri.getDate() + 7);
    candidates.push({ date: new Date(mon), time: '8:30 AM' });
    mon.setDate(mon.getDate() + 7);
  }
  candidates.sort((a, b) => a.date - b.date);
  const topSlots = candidates.slice(0, 3);

  topSlots.forEach((slot, i) => {
    const label = formatDate(slot.date, slot.time);
    const val = slot.date.toISOString().split('T')[0] + '_' + slot.time.replace(/[: ]/g, '');
    container.innerHTML += `
      <label class="form-radio-option">
        <input type="radio" name="Preferred Time" value="${val}" ${i === 0 ? 'required' : ''}>
        <span>${label}</span>
      </label>`;
  });

  container.innerHTML += `
    <label class="form-radio-option">
      <input type="radio" name="Preferred Time" value="contact-me">
      <span>Contact me to schedule</span>
    </label>`;
})();

// AJAX form submission with success state
document.querySelectorAll('[data-form-ajax]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });
      const data = await res.json();

      if (data.success) {
        const card = form.closest('.form-card');
        const content = card.querySelector('.form-content');
        const success = card.querySelector('.form-success');
        if (content && success) {
          content.classList.add('hidden');
          success.classList.remove('hidden');
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        btn.textContent = 'Error — please try again';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Error — please try again';
      btn.disabled = false;
    }
  });
});

// Toggle visibility of insurance provider field based on radio selection
document.querySelectorAll('[data-toggle-target]').forEach((radio) => {
  const targetId = radio.dataset.toggleTarget;
  const target = document.getElementById(targetId);
  if (!target) return;

  const name = radio.name;
  document.querySelectorAll(`[name="${name}"]`).forEach((r) => {
    r.addEventListener('change', () => {
      if (radio.checked) {
        target.classList.remove('hidden');
      } else {
        target.classList.add('hidden');
      }
    });
  });
});

// Show "Other Reason" textarea when "Other" is selected in referral reason dropdown
(() => {
  const select = document.getElementById('ref-reason');
  const other = document.getElementById('other-reason-group');
  if (!select || !other) return;
  select.addEventListener('change', () => {
    if (select.value === 'Other') {
      other.classList.remove('hidden');
    } else {
      other.classList.add('hidden');
    }
  });
})();

// Publication carousel: click to show detail panel + arrow navigation
(() => {
  const carousel = document.querySelector('[data-pub-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('.pub-track');
  const cards = carousel.querySelectorAll('[data-pub]');
  const section = carousel.closest('section') || carousel.parentElement;
  const details = section.querySelectorAll('[data-pub-detail]');
  const prevBtn = carousel.querySelector('[data-pub-prev]');
  const nextBtn = carousel.querySelector('[data-pub-next]');

  // Click card to show detail
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const idx = card.dataset.pub;
      cards.forEach((c) => c.classList.remove('is-active'));
      card.classList.add('is-active');
      details.forEach((d) => d.classList.remove('is-active'));
      const detail = section.querySelector(`[data-pub-detail="${idx}"]`);
      if (detail) detail.classList.add('is-active');
    });
  });

  // Arrow navigation
  const scrollAmount = () => {
    const card = track.firstElementChild;
    return card ? card.offsetWidth + 12 : 120;
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount() * 3, behavior: 'smooth' });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount() * 3, behavior: 'smooth' });
    });
  }
})();

// ===== MOBILE TOPBAR HIDE ON SCROLL =====
(() => {
  const topbar = document.querySelector('.site-topbar');
  if (!topbar || window.innerWidth >= 1024) return;

  let lastScrollY = 0;
  const THRESHOLD = 100;

  window.addEventListener('scroll', () => {
    if (window.innerWidth >= 1024) return;
    const currentY = window.scrollY;
    if (currentY > THRESHOLD && currentY > lastScrollY) {
      topbar.classList.add('is-hidden');
    } else {
      topbar.classList.remove('is-hidden');
    }
    lastScrollY = currentY;
  }, { passive: true });
})();

// ===== MOBILE BOTTOM BAR =====
(() => {
  const bar = document.getElementById('mobile-bottom-bar');
  if (!bar) return;

  const SCROLL_THRESHOLD = 500;
  const DESKTOP_BREAKPOINT = 1024;

  function update() {
    if (window.innerWidth >= DESKTOP_BREAKPOINT) {
      bar.classList.remove('is-visible');
      bar.setAttribute('aria-hidden', 'true');
    } else if (window.scrollY > SCROLL_THRESHOLD) {
      bar.classList.add('is-visible');
      bar.setAttribute('aria-hidden', 'false');
    } else {
      bar.classList.remove('is-visible');
      bar.setAttribute('aria-hidden', 'true');
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

// ===== MOBILE MENU MODAL =====
(() => {
  const overlay = document.getElementById('mobile-menu-overlay');
  if (!overlay) return;

  const openBtns = document.querySelectorAll('[data-open-mobile-menu]');
  const closeBtns = document.querySelectorAll('[data-close-mobile-menu]');

  function open() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  });

  closeBtns.forEach((btn) => {
    btn.addEventListener('click', close);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      close();
    }
  });

  // Close menu when a navigation link is clicked
  overlay.querySelectorAll('.mobile-menu-link').forEach((link) => {
    link.addEventListener('click', () => {
      close();
    });
  });
})();

// ===== MOBILE MENU ACCORDION =====
(() => {
  document.querySelectorAll('[data-mobile-accordion]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const item = btn.closest('.mobile-menu-item');
      if (item) item.classList.toggle('is-expanded');
    });
  });
})();

// Date field auto-tab: move to next field when maxlength reached
document.querySelectorAll('[data-date-next]').forEach((input) => {
  input.addEventListener('input', (e) => {
    const val = e.target.value.replace(/\D/g, '');
    e.target.value = val;
    if (val.length >= parseInt(e.target.maxLength)) {
      const next = document.getElementById(e.target.dataset.dateNext);
      if (next) next.focus();
    }
  });
});
