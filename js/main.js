/* ============================================================
   AUDRITA — THE QUIET GARDEN
   Global JavaScript
   ============================================================ */

(function () {
  'use strict';

  // ── Theme Toggle ──────────────────────────────────────────
  const THEME_KEY = 'audrita-theme';
  const html = document.documentElement;

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }

  function initTheme() {
    const stored = getStoredTheme();
    if (stored) {
      setTheme(stored);
      return;
    }
    // Respect system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }

  initTheme();

  document.addEventListener('DOMContentLoaded', function () {

    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        const current = html.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    }

    // ── Mobile menu ───────────────────────────────────────
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', function () {
        const isOpen = mobileDrawer.classList.toggle('is-open');
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        mobileDrawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      });

      // Close on link click
      mobileDrawer.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileDrawer.classList.remove('is-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileDrawer.setAttribute('aria-hidden', 'true');
        });
      });
    }

    // ── Nav logo mark animation ───────────────────────────
    const logoMark = document.querySelector('.nav-logo-mark');
    const navLogo = document.querySelector('.nav-logo');
    if (logoMark && navLogo) {
      navLogo.addEventListener('mouseenter', function () {
        logoMark.textContent = '✦';
      });
      navLogo.addEventListener('mouseleave', function () {
        // Delay restoring so the rotation animation completes
        setTimeout(function () {
          logoMark.textContent = '·';
        }, 280);
      });
    }

    // ── Writing filter (writings page) ────────────────────
    const filterPills = document.querySelectorAll('.filter-pill');
    const writingItems = document.querySelectorAll('.writing-item[data-type]');

    if (filterPills.length && writingItems.length) {
      filterPills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          const filter = pill.getAttribute('data-filter');

          // Update active state
          filterPills.forEach(function (p) { p.classList.remove('is-active'); });
          pill.classList.add('is-active');

          // Filter items
          writingItems.forEach(function (item) {
            const type = item.getAttribute('data-type');
            if (filter === 'all' || type === filter) {
              item.style.display = '';
            } else {
              item.style.display = 'none';
            }
          });

          // Show/hide year headers
          document.querySelectorAll('.archive-year').forEach(function (yearEl) {
            const sibling = yearEl.nextElementSibling;
            // Check if any visible items follow this year header
            let yearVisible = false;
            let el = yearEl.nextElementSibling;
            while (el && !el.classList.contains('archive-year')) {
              if (el.style.display !== 'none') {
                yearVisible = true;
                break;
              }
              el = el.nextElementSibling;
            }
            yearEl.style.display = yearVisible ? '' : 'none';
          });
        });
      });
    }

    // ── Active nav link ───────────────────────────────────
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(function (link) {
      const href = link.getAttribute('href');
      if (href && currentPath.endsWith(href.replace('.html', ''))) {
        link.setAttribute('aria-current', 'page');
      }
      // Home
      if ((href === 'index.html' || href === '/') &&
          (currentPath === '/' || currentPath.endsWith('index.html'))) {
        // Don't mark home nav link specially
      }
    });

  });

  // ── System theme change listener ──────────────────────────
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!getStoredTheme()) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

})();
