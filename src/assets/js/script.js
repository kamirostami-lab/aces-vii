/* ==========================================================================
   Ace Strategies — Main Script
   Version: 2.0 | Search + Theme Toggle + Carousels
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
   1. NAVIGATION
   ========================================= */
function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;

  const open = () => {
    toggle.classList.add('active');
    menu.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    document.body.style.overflow = 'hidden';
    const first = menu.querySelector('a');
    setTimeout(() => first && first.focus(), 10);
  };

  const close = () => {
    toggle.classList.remove('active');
    menu.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
    setTimeout(() => toggle.focus(), 10);
  };

  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    toggle.classList.contains('active') ? close() : open();
  });

  menu.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      if (toggle.classList.contains('active')) close();
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && toggle.classList.contains('active')) close();
  });

  document.addEventListener('click', function(e) {
    if (toggle.classList.contains('active') &&
        !menu.contains(e.target) &&
        !toggle.contains(e.target)) {
      close();
    }
  });
}


/* =========================================
   2. THEME TOGGLING (Section Observer)
   ========================================= */
function initThemeToggling() {
  var sections = document.querySelectorAll('[data-theme]');
  if (!sections.length) return;

  var current = '';

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var theme = entry.target.dataset.theme;
      if (theme === current) return;
      current = theme;
      document.body.classList.toggle('on-light-bg', theme === 'light');
      document.body.classList.toggle('on-dark-bg',  theme !== 'light');
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

  sections.forEach(function(s) { observer.observe(s); });
}


/* =========================================
   3. CUSTOM CURSOR (desktop only)
   ========================================= */
function initCustomCursor() {
  var cursor   = document.querySelector('.cursor');
  var follower = document.querySelector('.cursor-follower');
  if (!cursor || !follower) return;

  if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024) {
    cursor.style.display   = 'none';
    follower.style.display = 'none';
    return;
  }

  gsap.set([cursor, follower], { xPercent: -50, yPercent: -50 });

  window.addEventListener('mousemove', function(e) {
    gsap.to(cursor,   { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power3' });
    gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.3, ease: 'power3' });
  });

  document.querySelectorAll('a, button, [role="button"], input, textarea, .service-bg-card, .team-card').forEach(function(el) {
    el.addEventListener('mouseenter', function() { cursor.classList.add('hover');    follower.classList.add('hover'); });
    el.addEventListener('mouseleave', function() { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
  });
}


/* =========================================
   4. HERO ANIMATIONS
   ========================================= */
function initHeroAnimations() {
  var content = document.querySelector('.hero-content');
  if (!content) return;

  var tl    = gsap.timeline({ defaults: { ease: 'power3.out' } });
  var words = document.querySelectorAll('.hero-title .word span');

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
   5. SCROLL REVEALS
   ========================================= */
function initScrollReveals() {
  document.querySelectorAll('.section-header').forEach(function(el) {
    var anim = gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', paused: true });
    ScrollTrigger.create({ trigger: el, start: 'top 85%', onEnter: function() { anim.play(); } });
  });

  document.querySelectorAll('.logo-section .logo-track, .membership-section .logo-track').forEach(function(track) {
    var anim = gsap.from(track, { opacity: 0, duration: 1.5, paused: true });
    ScrollTrigger.create({ trigger: track, start: 'top 85%', onEnter: function() { anim.play(); }, once: true });
  });
}


/* =========================================
   6. SCROLL NAV POLISH
   ========================================= */
function initScrollPolish() {
  var nav = document.querySelector('.nav');
  if (!nav) return;

  window.addEventListener('scroll', function() {
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
   7. CAROUSEL SYSTEM
   ========================================= */
function initCarousels() {
  var configs = [
    { track: 'capabilities-carousel', prev: 'cap-prev',  next: 'cap-next',  dots: 'cap-dots'  },
    { track: 'testimonials-carousel', prev: 'test-prev', next: 'test-next', dots: 'test-dots' },
    { track: 'news-carousel',         prev: 'news-prev', next: 'news-next', dots: 'news-dots' },
  ];

  configs.forEach(function(cfg) { setupCarousel(cfg); });
}

function setupCarousel(cfg) {
  var viewport = document.getElementById(cfg.track);
  var prevBtn = document.getElementById(cfg.prev);
  var nextBtn = document.getElementById(cfg.next);

  if (!viewport || !prevBtn || !nextBtn) return;

  var track = viewport.querySelector('.iaa-carousel-track, .carousel-track, .services-carousel-track, .testimonials-track, .news-carousel-track');
  var items = track ? Array.from(track.children) : Array.from(viewport.children);
  if (!items.length) return;

  var dotsContainer = cfg.dots ? document.getElementById(cfg.dots) : null;
  var dots = [];
  var snapPoints = [];

  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    dots = [];
    snapPoints = [];

    var maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    if (maxScroll <= 0) return;

    var itemWidth = items[0].getBoundingClientRect().width;
    var gap = parseFloat(window.getComputedStyle(track || viewport).gap) || 0;
    var itemsPerPage = Math.max(1, Math.floor(viewport.clientWidth / (itemWidth + gap)));

    for (var i = 0; i < items.length; i += itemsPerPage) {
      var targetScroll = items[i].offsetLeft - (track ? track.offsetLeft : 0);
      if (targetScroll >= maxScroll) {
        snapPoints.push(maxScroll);
        break;
      }
      snapPoints.push(targetScroll);
    }

    if (snapPoints[snapPoints.length - 1] < maxScroll - 10) {
      snapPoints.push(maxScroll);
    }

    snapPoints.forEach(function(point, i) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'go to view ' + (i + 1));
      dot.addEventListener('click', function() {
        viewport.scrollTo({ left: point, behavior: 'smooth' });
      });
      dotsContainer.appendChild(dot);
      dots.push(dot);
    });
  }

  function getScrollAmount() {
    var itemWidth = items[0].getBoundingClientRect().width;
    var gap = parseFloat(window.getComputedStyle(track || viewport).gap) || 0;
    var itemsPerPage = Math.max(1, Math.floor(viewport.clientWidth / (itemWidth + gap)));
    return (itemWidth + gap) * itemsPerPage;
  }

  prevBtn.addEventListener('click', function() {
    viewport.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', function() {
    viewport.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  });

  function updateState() {
    var max = viewport.scrollWidth - viewport.clientWidth;
    var atStart = viewport.scrollLeft <= 5;
    var atEnd = viewport.scrollLeft >= max - 5;

    prevBtn.style.opacity = atStart ? '0.3' : '1';
    nextBtn.style.opacity = atEnd ? '0.3' : '1';
    prevBtn.style.pointerEvents = atStart ? 'none' : '';
    nextBtn.style.pointerEvents = atEnd ? 'none' : '';

    if (dots.length > 0) {
      var currentScroll = viewport.scrollLeft;
      var activeIndex = 0;
      var minDiff = Infinity;

      snapPoints.forEach(function(point, i) {
        var diff = Math.abs(currentScroll - point);
        if (diff < minDiff) {
          minDiff = diff;
          activeIndex = i;
        }
      });

      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === activeIndex);
      });
    }
  }

  viewport.addEventListener('scroll', updateState, { passive: true });
  window.addEventListener('resize', function() {
    renderDots();
    updateState();
  }, { passive: true });

  setTimeout(function() {
    renderDots();
    updateState();
  }, 150);

  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); viewport.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' }); }
    if (e.key === 'ArrowRight') { e.preventDefault(); viewport.scrollBy({ left:  getScrollAmount(), behavior: 'smooth' }); }
  });

  var dragStartX = null;
  var dragging = false;
  var startScroll;

  viewport.addEventListener('mousedown', function(e) {
    dragStartX = e.clientX;
    startScroll = viewport.scrollLeft;
    dragging = false;
    viewport.style.cursor = 'grabbing';
    viewport.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', function(e) {
    if (dragStartX === null) return;
    var delta = dragStartX - e.clientX;
    if (Math.abs(delta) > 4) dragging = true;
    if (dragging) viewport.scrollLeft = startScroll + delta;
  });

  window.addEventListener('mouseup', function() {
    dragStartX = null;
    viewport.style.cursor = '';
    viewport.style.userSelect = '';
    setTimeout(function() { dragging = false; }, 50);
  });

  viewport.addEventListener('click', function(e) {
    if (dragging) e.stopPropagation();
  }, true);
}


/* =========================================
   8. TEAM CARD FLIP (touch)
   ========================================= */
function initTeamCardFlip() {
  if (!window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.team-card').forEach(function(card) {
    card.addEventListener('click', function() {
      card.classList.toggle('flipped');
    });
  });
}


/* =========================================
   9. ACCORDION
   ========================================= */
function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item    = btn.closest('.accordion-item');
      var content = item && item.querySelector('.accordion-content');
      var inner   = item && item.querySelector('.accordion-inner');
      if (!item || !content) return;

      var isOpen = item.classList.contains('active');

      document.querySelectorAll('.accordion-item.active').forEach(function(open) {
        if (open === item) return;
        open.classList.remove('active');
        var c = open.querySelector('.accordion-content');
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
  var bars = document.querySelectorAll('.poll-bar-segment[data-value]');
  if (!bars.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var bar = entry.target;
      bar.style.width = (bar.dataset.value || '0') + '%';
      observer.unobserve(bar);
    });
  }, { threshold: 0.3 });

  bars.forEach(function(bar) { observer.observe(bar); });
}


/* =========================================
   11. MATERIAL DESIGN 3 — THEME TOGGLE
   ========================================= */
function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  const body = document.body;
  const STORAGE_KEY = 'ace-theme-preference';

  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultTheme = savedTheme || (prefersDark ? 'dark' : 'dark');

  body.classList.toggle('theme-light', defaultTheme === 'light');
  body.classList.toggle('theme-dark', defaultTheme === 'dark');
  toggle.setAttribute('aria-checked', defaultTheme === 'light');

  toggle.addEventListener('click', function(e) {
    e.preventDefault();
    const isLight = body.classList.contains('theme-light');
    const newTheme = isLight ? 'dark' : 'light';

    body.classList.toggle('theme-light', newTheme === 'light');
    body.classList.toggle('theme-dark', newTheme === 'dark');
    toggle.setAttribute('aria-checked', newTheme === 'light');

    localStorage.setItem(STORAGE_KEY, newTheme);
  });

  toggle.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle.click();
    }
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const newTheme = e.matches ? 'dark' : 'light';
      body.classList.toggle('theme-light', newTheme === 'light');
      body.classList.toggle('theme-dark', newTheme === 'dark');
      toggle.setAttribute('aria-checked', newTheme === 'light');
    }
  });
}


/* =========================================
   12. SEARCH FUNCTIONALITY (PAGEFIND)
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