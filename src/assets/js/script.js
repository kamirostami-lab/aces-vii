/* ==========================================================================
   Ace Strategies — Main Script
   Version: 2.1 | Search + Theme Toggle + Carousels + Mobile Menu Fixes
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initThemeToggling();
  initTeamCardFlip();
  initCarousels();
  initAccordion();
  initScrollPolish();
  initPollAnimation();
  initThemeToggle();
  initSearch();
  initIAAThemeToggle();
  initNewsletterSpamProtection();

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initCustomCursor();
    initHeroAnimations();
    initScrollReveals();
  } else {
    console.warn('GSAP not loaded — animations skipped, core features active.');
  }
});


/* =========================================
   1. NAVIGATION (with Mobile Menu Animation Fix)
   ========================================= */
function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;

  const open = () => {
    toggle.classList.add('active');
    menu.classList.add('active');
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');

    // Set focus to first menu item after animation starts
    const firstLink = menu.querySelector('.nav-link');
    setTimeout(() => firstLink && firstLink.focus(), 100);
  };

  const close = () => {
    toggle.classList.remove('active');
    menu.classList.remove('active');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    toggle.focus();
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle.classList.contains('active') ? close() : open();
  });

  // Close when clicking a nav link
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (toggle.classList.contains('active')) close();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.classList.contains('active')) {
      close();
    }
  });

  // Trap focus inside menu when open (Accessibility)
  menu.addEventListener('keydown', (e) => {
    if (!toggle.classList.contains('active')) return;

    const focusableElements = menu.querySelectorAll('a, button, [tabindex="0"]');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (toggle.classList.contains('active') &&
        !menu.contains(e.target) &&
        !toggle.contains(e.target)) {
      close();
    }
  });
}


/* =========================================
   2. THEME TOGGLING (Section Observer for Data-Theme)
   ========================================= */
function initThemeToggling() {
  const sections = document.querySelectorAll('[data-theme]');
  if (!sections.length) return;

  let current = '';

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const theme = entry.target.dataset.theme;
      if (theme === current) return;
      current = theme;
      document.body.classList.toggle('on-light-bg', theme === 'light');
      document.body.classList.toggle('on-dark-bg', theme !== 'light');
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
}


/* =========================================
   3. CUSTOM CURSOR (Desktop Only)
   ========================================= */
function initCustomCursor() {
  const cursor   = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');
  if (!cursor || !follower) return;

  if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024) {
    cursor.style.display   = 'none';
    follower.style.display = 'none';
    return;
  }

  gsap.set([cursor, follower], { xPercent: -50, yPercent: -50 });

  window.addEventListener('mousemove', (e) => {
    gsap.to(cursor,   { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power3' });
    gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.3, ease: 'power3' });
  });

  document.querySelectorAll('a, button, [role="button"], input, textarea, .service-bg-card, .team-card, .iaa-index-row').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); follower.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
  });
}


/* =========================================
   4. HERO ANIMATIONS (GSAP)
   ========================================= */
function initHeroAnimations() {
  const content = document.querySelector('.hero-content');
  if (!content) return;

  const tl    = gsap.timeline({ defaults: { ease: 'power3.out' } });
  const words = document.querySelectorAll('.hero-title .word span');

  if (words.length) {
    tl.from(words, { y: '110%', duration: 1.2, stagger: 0.15, delay: 0.2 })
        .from('.hero-subtitle', { y: 20, opacity: 0, duration: 1 }, '-=0.8');
  } else {
    tl.from('.hero-title',    { y: 40, opacity: 0, duration: 1.2, delay: 0.2 })
        .from('.hero-subtitle', { y: 20, opacity: 0, duration: 1 }, '-=0.4');
  }

  tl.from('.hero-cta-wrapper', { scale: 0.8, opacity: 0, duration: 0.8 }, '-=0.6');
}


/* =========================================
   5. SCROLL REVEALS (GSAP)
   ========================================= */
function initScrollReveals() {
  document.querySelectorAll('.section-header').forEach(el => {
    const anim = gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', paused: true });
    ScrollTrigger.create({ trigger: el, start: 'top 85%', onEnter: () => anim.play() });
  });

  document.querySelectorAll('.logo-section .logo-track, .membership-section .logo-track').forEach(track => {
    const anim = gsap.from(track, { opacity: 0, duration: 1.5, paused: true });
    ScrollTrigger.create({ trigger: track, start: 'top 85%', onEnter: () => anim.play(), once: true });
  });
}


/* =========================================
   6. SCROLL NAV POLISH
   ========================================= */
function initScrollPolish() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      nav.style.padding   = '8px 24px';
      nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)';
    } else {
      nav.style.padding   = '';
      nav.style.boxShadow = '';
    }
  }, { passive: true });
}


/* =========================================
   7. CAROUSEL SYSTEM (Capabilities, Testimonials, News)
   ========================================= */
function initCarousels() {
  const configs = [
    { track: 'capabilities-carousel', prev: 'cap-prev', next: 'cap-next', dots: 'cap-dots' },
    { track: 'testimonials-carousel', prev: 'test-prev', next: 'test-next', dots: 'test-dots' },
    { track: 'news-carousel',         prev: 'news-prev', next: 'news-next', dots: 'news-dots' }
  ];

  configs.forEach(cfg => setupCarousel(cfg));
}

function setupCarousel(cfg) {
  const viewport = document.getElementById(cfg.track);
  const prevBtn = document.getElementById(cfg.prev);
  const nextBtn = document.getElementById(cfg.next);

  if (!viewport || !prevBtn || !nextBtn) return;

  const track = viewport.querySelector('.iaa-carousel-track, .carousel-track, .services-carousel-track, .testimonials-track, .news-carousel-track');
  const items = track ? Array.from(track.children) : Array.from(viewport.children);
  if (!items.length) return;

  const dotsContainer = cfg.dots ? document.getElementById(cfg.dots) : null;
  let dots = [];
  let snapPoints = [];

  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    dots = [];
    snapPoints = [];

    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    if (maxScroll <= 0) return;

    const itemWidth = items[0].getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track || viewport).gap) || 0;
    const itemsPerPage = Math.max(1, Math.floor(viewport.clientWidth / (itemWidth + gap)));

    for (let i = 0; i < items.length; i += itemsPerPage) {
      const targetScroll = items[i].offsetLeft - (track ? track.offsetLeft : 0);
      if (targetScroll >= maxScroll) {
        snapPoints.push(maxScroll);
        break;
      }
      snapPoints.push(targetScroll);
    }

    if (snapPoints[snapPoints.length - 1] < maxScroll - 10) {
      snapPoints.push(maxScroll);
    }

    snapPoints.forEach((point, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to view ${i + 1}`);
      dot.addEventListener('click', () => {
        viewport.scrollTo({ left: point, behavior: 'smooth' });
      });
      dotsContainer.appendChild(dot);
      dots.push(dot);
    });
  }

  function getScrollAmount() {
    const itemWidth = items[0].getBoundingClientRect().width;
    const gap = parseFloat(window.getComputedStyle(track || viewport).gap) || 0;
    const itemsPerPage = Math.max(1, Math.floor(viewport.clientWidth / (itemWidth + gap)));
    return (itemWidth + gap) * itemsPerPage;
  }

  prevBtn.addEventListener('click', () => {
    viewport.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    viewport.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  });

  function updateState() {
    const max = viewport.scrollWidth - viewport.clientWidth;
    const atStart = viewport.scrollLeft <= 5;
    const atEnd = viewport.scrollLeft >= max - 5;

    prevBtn.style.opacity = atStart ? '0.3' : '1';
    nextBtn.style.opacity = atEnd ? '0.3' : '1';
    prevBtn.style.pointerEvents = atStart ? 'none' : '';
    nextBtn.style.pointerEvents = atEnd ? 'none' : '';

    if (dots.length > 0) {
      const currentScroll = viewport.scrollLeft;
      let activeIndex = 0;
      let minDiff = Infinity;

      snapPoints.forEach((point, i) => {
        const diff = Math.abs(currentScroll - point);
        if (diff < minDiff) {
          minDiff = diff;
          activeIndex = i;
        }
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
      });
    }
  }

  viewport.addEventListener('scroll', updateState, { passive: true });
  window.addEventListener('resize', () => {
    renderDots();
    updateState();
  }, { passive: true });

  setTimeout(() => {
    renderDots();
    updateState();
  }, 150);

  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); viewport.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' }); }
    if (e.key === 'ArrowRight') { e.preventDefault(); viewport.scrollBy({ left:  getScrollAmount(), behavior: 'smooth' }); }
  });

  // Drag to scroll
  let dragStartX = null;
  let dragging = false;
  let startScroll;

  viewport.addEventListener('mousedown', (e) => {
    dragStartX = e.clientX;
    startScroll = viewport.scrollLeft;
    dragging = false;
    viewport.style.cursor = 'grabbing';
    viewport.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (dragStartX === null) return;
    const delta = dragStartX - e.clientX;
    if (Math.abs(delta) > 4) dragging = true;
    if (dragging) viewport.scrollLeft = startScroll + delta;
  });

  window.addEventListener('mouseup', () => {
    dragStartX = null;
    viewport.style.cursor = '';
    viewport.style.userSelect = '';
    setTimeout(() => { dragging = false; }, 50);
  });

  viewport.addEventListener('click', (e) => {
    if (dragging) e.stopPropagation();
  }, true);
}


/* =========================================
   8. TEAM CARD FLIP (Touch Devices)
   ========================================= */
function initTeamCardFlip() {
  if (!window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}


/* =========================================
   9. ACCORDION (About Page)
   ========================================= */
function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const item    = btn.closest('.accordion-item');
      const content = item && item.querySelector('.accordion-content');
      const inner   = item && item.querySelector('.accordion-inner');
      if (!item || !content) return;

      const isOpen = item.classList.contains('active');

      // Close others
      document.querySelectorAll('.accordion-item.active').forEach(open => {
        if (open === item) return;
        open.classList.remove('active');
        const c = open.querySelector('.accordion-content');
        if (c) { c.style.height = '0'; c.style.opacity = '0'; }
      });

      if (isOpen) {
        item.classList.remove('active');
        content.style.height  = '0';
        content.style.opacity = '0';
      } else {
        item.classList.add('active');
        content.style.height  = inner ? (inner.offsetHeight + 'px') : 'auto';
        content.style.opacity = '1';
      }
    });
  });
}


/* =========================================
   10. POLL BAR ANIMATION
   ========================================= */
function initPollAnimation() {
  const bars = document.querySelectorAll('.poll-bar-segment[data-value]');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      bar.style.width = (bar.dataset.value || '0') + '%';
      observer.unobserve(bar);
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
}


/* =========================================
   11. MATERIAL DESIGN 3 — MAIN THEME TOGGLE
   ========================================= */
function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  const body = document.body;
  const STORAGE_KEY = 'ace-theme-preference';

  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  body.classList.toggle('theme-light', defaultTheme === 'light');
  body.classList.toggle('theme-dark', defaultTheme === 'dark');
  toggle.setAttribute('aria-checked', defaultTheme === 'light');

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const isLight = body.classList.contains('theme-light');
    const newTheme = isLight ? 'dark' : 'light';

    body.classList.toggle('theme-light', newTheme === 'light');
    body.classList.toggle('theme-dark', newTheme === 'dark');
    toggle.setAttribute('aria-checked', newTheme === 'light');

    localStorage.setItem(STORAGE_KEY, newTheme);
  });

  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle.click();
    }
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const newTheme = e.matches ? 'dark' : 'light';
      body.classList.toggle('theme-light', newTheme === 'light');
      body.classList.toggle('theme-dark', newTheme === 'dark');
      toggle.setAttribute('aria-checked', newTheme === 'light');
    }
  });
}


/* =========================================
   12. IAA ALLIANCE — THEME TOGGLE (Standalone)
   ========================================= */
function initIAAThemeToggle() {
  const toggle = document.querySelector('.iaa-theme-toggle');
  if (!toggle) return;

  const body = document.body;
  const STORAGE_KEY = 'iaa-theme-preference';

  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  body.classList.toggle('theme-light', defaultTheme === 'light');
  body.classList.toggle('theme-dark', defaultTheme === 'dark');
  toggle.setAttribute('aria-checked', defaultTheme === 'light');

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const isLight = body.classList.contains('theme-light');
    const newTheme = isLight ? 'dark' : 'light';

    body.classList.toggle('theme-light', newTheme === 'light');
    body.classList.toggle('theme-dark', newTheme === 'dark');
    toggle.setAttribute('aria-checked', newTheme === 'light');

    localStorage.setItem(STORAGE_KEY, newTheme);
  });

  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle.click();
    }
  });
}


/* =========================================
   13. SEARCH FUNCTIONALITY (PAGEFIND)
   ========================================= */
function initSearch() {
  const toggle = document.querySelector('.search-toggle');
  const modal = document.querySelector('.search-modal');
  const close = document.querySelector('.search-close');
  const overlay = document.querySelector('.search-modal__overlay');
  const input = document.getElementById('search-input');
  const clear = document.getElementById('search-clear');
  const results = document.getElementById('search-results');

  if (!toggle || !modal) return;

  let pagefind = null;
  let selectedIndex = -1;
  let searchResults = [];

  async function loadPagefind() {
    if (pagefind) return pagefind;
    try {
      pagefind = await import('/pagefind/pagefind.js');
      await pagefind.options({ excerptLength: 30 });
      return pagefind;
    } catch (e) {
      console.warn('Pagefind not available');
      return null;
    }
  }

  function openModal() {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 100);
    loadPagefind();
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    input.value = '';
    clear.style.display = 'none';
    selectedIndex = -1;
    showPlaceholder();
  }

  function showPlaceholder() {
    results.innerHTML = `
      <div class="search-placeholder">
        <span class="material-symbols-outlined">search</span>
        <p>Start typing to search case studies, news, services, and team members...</p>
      </div>
    `;
  }

  async function performSearch(query) {
    if (!query || query.length < 2) {
      showPlaceholder();
      clear.style.display = 'none';
      return;
    }

    clear.style.display = 'flex';

    const pf = await loadPagefind();
    if (!pf) {
      results.innerHTML = '<div class="search-no-results">Search unavailable</div>';
      return;
    }

    const search = await pf.search(query);
    searchResults = search.results;

    if (!searchResults.length) {
      results.innerHTML = '<div class="search-no-results">No results found</div>';
      return;
    }

    let html = '';
    for (let i = 0; i < Math.min(searchResults.length, 10); i++) {
      const result = searchResults[i];
      const data = await result.data();

      let icon = 'description';
      if (data.url.includes('/services/')) icon = 'business_center';
      else if (data.url.includes('/cases/')) icon = 'work';
      else if (data.url.includes('/news/')) icon = 'newspaper';
      else if (data.url.includes('/team/')) icon = 'person';
      else if (data.url.includes('/about/')) icon = 'info';
      else if (data.url.includes('/alliance/')) icon = 'handshake';

      let category = 'Page';
      if (data.url.includes('/services/')) category = 'Service';
      else if (data.url.includes('/cases/')) category = 'Case Study';
      else if (data.url.includes('/news/')) category = 'News';
      else if (data.url.includes('/team/')) category = 'Team';
      else if (data.url.includes('/alliance/')) category = 'Alliance';

      html += `
        <a href="${data.url}" class="search-result-item" data-index="${i}">
          <span class="material-symbols-outlined search-result-icon">${icon}</span>
          <div class="search-result-content">
            <div class="search-result-meta">${category}</div>
            <div class="search-result-title">${data.meta?.title || 'Untitled'}</div>
            ${data.excerpt ? `<div class="search-result-excerpt">${data.excerpt}</div>` : ''}
          </div>
        </a>
      `;
    }

    results.innerHTML = html;
    selectedIndex = -1;
  }

  function updateSelection() {
    const items = results.querySelectorAll('.search-result-item');
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === selectedIndex);
      if (i === selectedIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  toggle.addEventListener('click', openModal);
  close.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  let debounceTimer;
  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => performSearch(e.target.value.trim()), 200);
  });

  clear.addEventListener('click', () => {
    input.value = '';
    clear.style.display = 'none';
    showPlaceholder();
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    const items = results.querySelectorAll('.search-result-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        items[selectedIndex].click();
      } else if (items.length > 0) {
        items[0].click();
      }
    } else if (e.key === 'Escape') {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openModal();
    }
  });
}


/* =========================================
   15. NEWSLETTER SPAM PROTECTION
   ========================================= */
function initNewsletterSpamProtection() {
  const forms = document.querySelectorAll('form[action*="convertkit.com"]');
  if (!forms.length) return;

  const pageLoadTime = Date.now();

  forms.forEach(form => {
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = '_gotcha';
    honeypot.setAttribute('style', 'display:none;position:absolute;left:-9999px;');
    honeypot.tabIndex = -1;
    honeypot.autocomplete = 'off';
    form.appendChild(honeypot);

    form.addEventListener('submit', (e) => {
      if (honeypot.value || Date.now() - pageLoadTime < 3000) {
        e.preventDefault();
      }
    });
  });
}