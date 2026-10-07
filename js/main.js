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
      if (href && (currentPath.endsWith(href) || currentPath.endsWith(href.replace('.html', '')))) {
        link.setAttribute('aria-current', 'page');
      }
    });

    // ── Toast Notifications ──────────────────────────────────
    let toastTimeout = null;
    function showToast(message) {
      let toast = document.getElementById('toast-notice');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notice';
        toast.className = 'toast-notice';
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.classList.add('is-visible');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('is-visible');
      }, 2600);
    }

    // ── Saved Poetry System (Local Persistence) ───────────────
    const SAVED_KEY = 'audrita-saved-poems';
    let savedPoems = [];
    try {
      const stored = localStorage.getItem(SAVED_KEY);
      if (stored) savedPoems = JSON.parse(stored);
    } catch (e) {}

    const savedDrawerBackdrop = document.getElementById('saved-drawer-backdrop');
    const savedToggleBtns = document.querySelectorAll('.nav-saved-btn, .open-saved-btn');
    const savedCloseBtn = document.getElementById('saved-drawer-close-btn');
    const savedCountBadges = document.querySelectorAll('.saved-count-badge');
    const savedItemsList = document.getElementById('saved-items-list');
    const savedEmptyNotice = document.getElementById('saved-empty-notice');

    function persistSavedPoems() {
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify(savedPoems));
      } catch (e) {}
      updateSavedUI();
    }

    function updateSavedUI() {
      // Update badges
      savedCountBadges.forEach(badge => {
        badge.textContent = savedPoems.length;
      });

      // Update button states in poem cards
      document.querySelectorAll('.btn-save-poem').forEach(btn => {
        const id = btn.getAttribute('data-id');
        const isSaved = savedPoems.some(p => p.id === id);
        if (isSaved) {
          btn.classList.add('is-saved');
          btn.innerHTML = '♥ Saved';
          btn.setAttribute('aria-label', 'Remove from saved');
        } else {
          btn.classList.remove('is-saved');
          btn.innerHTML = '♡ Save';
          btn.setAttribute('aria-label', 'Save poem to collection');
        }
      });

      if (!savedItemsList) return;

      if (savedPoems.length === 0) {
        savedItemsList.innerHTML = '';
        if (savedEmptyNotice) savedEmptyNotice.style.display = 'block';
        return;
      }

      if (savedEmptyNotice) savedEmptyNotice.style.display = 'none';

      savedItemsList.innerHTML = savedPoems.map((p, idx) => `
        <div class="saved-poem-item">
          <div class="saved-poem-title">${p.title}</div>
          <div class="saved-poem-snippet">${p.snippet}</div>
          <div class="saved-poem-actions">
            <button class="btn-icon-action btn-copy-saved" data-text="${encodeURIComponent(p.text)}">⎘ Copy</button>
            <button class="saved-poem-remove" data-id="${p.id}">remove</button>
          </div>
        </div>
      `).join('');

      // Wire remove buttons in drawer
      savedItemsList.querySelectorAll('.saved-poem-remove').forEach(btn => {
        btn.addEventListener('click', function () {
          const id = this.getAttribute('data-id');
          savedPoems = savedPoems.filter(p => p.id !== id);
          persistSavedPoems();
          showToast('Removed from saved verses');
        });
      });

      // Wire copy buttons in drawer
      savedItemsList.querySelectorAll('.btn-copy-saved').forEach(btn => {
        btn.addEventListener('click', function () {
          const text = decodeURIComponent(this.getAttribute('data-text'));
          navigator.clipboard.writeText(text).then(() => {
            showToast('Verse copied to clipboard ⎘');
          });
        });
      });
    }

    function openSavedDrawer() {
      if (savedDrawerBackdrop) savedDrawerBackdrop.classList.add('is-open');
    }

    function closeSavedDrawer() {
      if (savedDrawerBackdrop) savedDrawerBackdrop.classList.remove('is-open');
    }

    savedToggleBtns.forEach(btn => btn.addEventListener('click', openSavedDrawer));
    if (savedCloseBtn) savedCloseBtn.addEventListener('click', closeSavedDrawer);
    if (savedDrawerBackdrop) {
      savedDrawerBackdrop.addEventListener('click', function (e) {
        if (e.target === savedDrawerBackdrop) closeSavedDrawer();
      });
    }

    // Wire poem card save buttons
    document.querySelectorAll('.btn-save-poem').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const id = this.getAttribute('data-id');
        const title = this.getAttribute('data-title');
        const text = this.getAttribute('data-verse') || '';
        const snippet = text.split('\n').slice(0, 3).join('\n') + (text.split('\n').length > 3 ? '...' : '');

        const existingIdx = savedPoems.findIndex(p => p.id === id);
        if (existingIdx > -1) {
          savedPoems.splice(existingIdx, 1);
          showToast('Removed from saved verses');
        } else {
          savedPoems.push({ id, title, text, snippet });
          showToast('Poem saved to your collection ♡');
        }
        persistSavedPoems();
      });
    });

    // Wire copy buttons on cards
    document.querySelectorAll('.btn-copy-verse').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const verse = this.getAttribute('data-verse') || '';
        navigator.clipboard.writeText(verse).then(() => {
          showToast('Verse copied to clipboard ⎘');
        }).catch(() => {
          showToast('Could not copy to clipboard');
        });
      });
    });

    updateSavedUI();

    // ── Audio Player Simulation ──────────────────────────────
    const playBtn = document.getElementById('audio-play-btn');
    const audioComponent = document.querySelector('.audio-player-component');
    if (playBtn && audioComponent) {
      let isPlaying = false;
      playBtn.addEventListener('click', function () {
        isPlaying = !isPlaying;
        if (isPlaying) {
          audioComponent.classList.add('audio-playing');
          playBtn.innerHTML = '❚❚';
          playBtn.setAttribute('aria-label', 'Pause audio poem');
        } else {
          audioComponent.classList.remove('audio-playing');
          playBtn.innerHTML = '▶';
          playBtn.setAttribute('aria-label', 'Play audio poem');
        }
      });
    }

    // ── Generic Filter Pills (Books & Shop) ──────────────────
    document.querySelectorAll('.filter-container').forEach(container => {
      const pills = container.querySelectorAll('.filter-pill');
      const targetGrid = document.querySelector(container.getAttribute('data-target-grid'));
      if (!targetGrid) return;
      const items = targetGrid.querySelectorAll('.filterable-item');

      pills.forEach(pill => {
        pill.addEventListener('click', function () {
          pills.forEach(p => p.classList.remove('is-active'));
          this.classList.add('is-active');
          const filter = this.getAttribute('data-filter');

          items.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filter === 'all' || category === filter || (category && category.includes(filter))) {
              item.style.display = '';
            } else {
              item.style.display = 'none';
            }
          });
        });
      });
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

