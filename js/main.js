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

    // ── Shopping Cart Logic ──────────────────────────────────
    let cart = [];
    try {
      const savedCart = localStorage.getItem('audrita-cart');
      if (savedCart) cart = JSON.parse(savedCart);
    } catch (e) {}

    const cartBackdrop = document.getElementById('cart-backdrop');
    const cartToggleBtns = document.querySelectorAll('.nav-cart-btn, .open-cart-btn');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartCountBadges = document.querySelectorAll('.cart-count-badge');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartEmptyNotice = document.getElementById('cart-empty-notice');
    const cartSubtotalEl = document.getElementById('cart-subtotal-val');

    function saveCart() {
      try {
        localStorage.setItem('audrita-cart', JSON.stringify(cart));
      } catch (e) {}
      updateCartUI();
    }

    function updateCartUI() {
      const totalCount = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
      cartCountBadges.forEach(badge => {
        badge.textContent = totalCount;
      });

      if (!cartItemsList) return;

      if (cart.length === 0) {
        cartItemsList.innerHTML = '';
        if (cartEmptyNotice) cartEmptyNotice.style.display = 'block';
        if (cartSubtotalEl) cartSubtotalEl.textContent = '₹0';
        return;
      }

      if (cartEmptyNotice) cartEmptyNotice.style.display = 'none';

      let total = 0;
      cartItemsList.innerHTML = cart.map((item, index) => {
        total += (item.price || 0) * (item.qty || 1);
        return `
          <div class="cart-item">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.title}</div>
              <div class="cart-item-meta">₹${item.price} × ${item.qty || 1}</div>
              <button class="cart-item-remove" data-index="${index}">remove</button>
            </div>
          </div>
        `;
      }).join('');

      if (cartSubtotalEl) cartSubtotalEl.textContent = '₹' + total.toLocaleString();

      cartItemsList.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function () {
          const idx = parseInt(this.getAttribute('data-index'), 10);
          cart.splice(idx, 1);
          saveCart();
        });
      });
    }

    function openCart() {
      if (cartBackdrop) cartBackdrop.classList.add('is-open');
    }

    function closeCart() {
      if (cartBackdrop) cartBackdrop.classList.remove('is-open');
    }

    cartToggleBtns.forEach(btn => btn.addEventListener('click', openCart));
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (cartBackdrop) {
      cartBackdrop.addEventListener('click', function (e) {
        if (e.target === cartBackdrop) closeCart();
      });
    }

    // Add to cart buttons
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const title = this.getAttribute('data-title') || 'Art Print';
        const price = parseInt(this.getAttribute('data-price') || '1200', 10);
        
        const existing = cart.find(item => item.title === title);
        if (existing) {
          existing.qty = (existing.qty || 1) + 1;
        } else {
          cart.push({ title, price, qty: 1 });
        }
        saveCart();
        openCart();
      });
    });

    updateCartUI();

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

