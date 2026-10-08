/* ============================================================
   AUDRITA — THE QUIET GARDEN
   Global JavaScript & Sanctuary Writing Desk
   ============================================================ */

(function () {
  'use strict';

  // ── Theme Management ──────────────────────────────────────
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
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }

  initTheme();

  document.addEventListener('DOMContentLoaded', function () {

    // ── Theme toggle button ─────────────────────────────────
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        const current = html.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    }

    // ── Mobile menu drawer ──────────────────────────────────
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', function () {
        const isOpen = mobileDrawer.classList.toggle('is-open');
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        mobileDrawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      });

      mobileDrawer.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileDrawer.classList.remove('is-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileDrawer.setAttribute('aria-hidden', 'true');
        });
      });
    }

    // ── Nav logo mark animation ─────────────────────────────
    const logoMark = document.querySelector('.nav-logo-mark');
    const navLogo = document.querySelector('.nav-logo');
    if (logoMark && navLogo) {
      navLogo.addEventListener('mouseenter', function () {
        logoMark.textContent = '✦';
      });
      navLogo.addEventListener('mouseleave', function () {
        setTimeout(function () {
          logoMark.textContent = '·';
        }, 280);
      });
    }

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
      }, 3200);
    }

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
          showToast('Playing spoken verse · Cello resonance');
        } else {
          audioComponent.classList.remove('audio-playing');
          playBtn.innerHTML = '▶';
          playBtn.setAttribute('aria-label', 'Play audio poem');
        }
      });
    }

    // ── Poetry Filter Pills (Subsections & Category) ──────────
    const filterPills = document.querySelectorAll('.poetry-filter-bar .filter-pill');
    const englishSub = document.getElementById('english-poetry-sub');
    const hindiSub = document.getElementById('hindi-poetry-sub');
    const allPoemCards = document.querySelectorAll('.poem-card-clean');

    if (filterPills.length) {
      filterPills.forEach(pill => {
        pill.addEventListener('click', function () {
          filterPills.forEach(p => p.classList.remove('is-active'));
          this.classList.add('is-active');
          const filter = this.getAttribute('data-filter');

          if (filter === 'all') {
            if (englishSub) englishSub.style.display = '';
            if (hindiSub) hindiSub.style.display = '';
            document.querySelectorAll('.poem-card-clean').forEach(card => card.style.display = '');
            return;
          }

          if (filter === 'english') {
            if (englishSub) englishSub.style.display = '';
            if (hindiSub) hindiSub.style.display = 'none';
            document.querySelectorAll('#poems-grid-english .poem-card-clean').forEach(card => card.style.display = '');
            return;
          }

          if (filter === 'hindi') {
            if (englishSub) englishSub.style.display = 'none';
            if (hindiSub) hindiSub.style.display = '';
            document.querySelectorAll('#poems-grid-hindi .poem-card-clean').forEach(card => card.style.display = '');
            return;
          }

          // Category filter (e.g. love, silence)
          let visibleEnglish = 0;
          let visibleHindi = 0;

          document.querySelectorAll('#poems-grid-english .poem-card-clean').forEach(card => {
            const cat = card.getAttribute('data-category') || '';
            if (cat.includes(filter)) {
              card.style.display = '';
              visibleEnglish++;
            } else {
              card.style.display = 'none';
            }
          });

          document.querySelectorAll('#poems-grid-hindi .poem-card-clean').forEach(card => {
            const cat = card.getAttribute('data-category') || '';
            if (cat.includes(filter)) {
              card.style.display = '';
              visibleHindi++;
            } else {
              card.style.display = 'none';
            }
          });

          if (englishSub) englishSub.style.display = visibleEnglish > 0 ? '' : 'none';
          if (hindiSub) hindiSub.style.display = visibleHindi > 0 ? '' : 'none';
        });
      });
    }

    // ── Audrita's Writing Desk (Live Upload & Persistence) ────
    const POEMS_STORAGE_KEY = 'audrita_custom_poems_v1';
    const deskBackdrop = document.getElementById('writer-desk-backdrop');
    const openDeskBtn = document.getElementById('btn-open-desk');
    const closeDeskBtn = document.getElementById('writer-desk-close');
    const cancelDeskBtn = document.getElementById('writer-cancel-btn');
    const writerForm = document.getElementById('writer-form');
    const exportBtn = document.getElementById('writer-export-btn');
    const dateInput = document.getElementById('writer-date');

    // Pre-fill date with poetic formatting
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }

    function openDesk() {
      if (deskBackdrop) {
        deskBackdrop.classList.add('is-open');
        deskBackdrop.setAttribute('aria-hidden', 'false');
        const titleInput = document.getElementById('writer-title');
        if (titleInput) titleInput.focus();
      }
    }

    function closeDesk() {
      if (deskBackdrop) {
        deskBackdrop.classList.remove('is-open');
        deskBackdrop.setAttribute('aria-hidden', 'true');
      }
    }

    if (openDeskBtn) openDeskBtn.addEventListener('click', openDesk);
    if (closeDeskBtn) closeDeskBtn.addEventListener('click', closeDesk);
    if (cancelDeskBtn) cancelDeskBtn.addEventListener('click', closeDesk);

    if (deskBackdrop) {
      deskBackdrop.addEventListener('click', function (e) {
        if (e.target === deskBackdrop) closeDesk();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && deskBackdrop.classList.contains('is-open')) {
          closeDesk();
        }
      });
    }

    // Helper to get custom stored poems
    function getStoredPoems() {
      try {
        const stored = localStorage.getItem(POEMS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }

    // Helper to save custom poems
    function saveStoredPoems(list) {
      try {
        localStorage.setItem(POEMS_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {}
    }

    // Render a poem card into the DOM
    function renderPoemCard(poem, isPrepend = false) {
      const isHindi = poem.language === 'hindi';
      const targetGrid = isHindi ? document.getElementById('poems-grid-hindi') : document.getElementById('poems-grid-english');
      if (!targetGrid) return;

      const card = document.createElement('article');
      card.className = 'poem-card-clean filterable-item';
      card.setAttribute('data-category', `${poem.language} ${poem.tag.toLowerCase()}`);
      card.id = `poem-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      card.innerHTML = `
        <div class="poem-card-header">
          <div class="poem-card-meta">
            <span class="poem-card-lang" ${isHindi ? 'style="color: var(--color-accent); font-weight: 500;"' : ''}>${isHindi ? 'हिंदी' : 'EN'}</span>
            <span class="poem-card-tag">${poem.tag}</span>
          </div>
        </div>
        <h4 class="poem-card-title ${isHindi ? 'is-hindi' : ''}">${escapeHTML(poem.title)}</h4>
        <div class="poem-verse-text ${isHindi ? 'is-hindi' : ''}">${escapeHTML(poem.verse)}</div>
        <div class="poem-card-footer">
          <span class="poem-card-date">${escapeHTML(poem.date)}</span>
        </div>
      `;

      if (isPrepend) {
        targetGrid.prepend(card);
      } else {
        targetGrid.appendChild(card);
      }
    }

    function escapeHTML(str) {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Load initial stored poems on page load
    const existingCustomPoems = getStoredPoems();
    existingCustomPoems.forEach(p => renderPoemCard(p, false));

    // Update garden count display
    function updateCounterDisplay() {
      const counterEl = document.getElementById('garden-counter-display');
      if (counterEl) {
        const total = 6 + getStoredPoems().length;
        const totalStr = total < 10 ? `0${total}` : total;
        counterEl.textContent = `${totalStr} / 50`;
      }
    }
    updateCounterDisplay();

    // Handle form submission
    if (writerForm) {
      writerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const lang = document.getElementById('writer-lang').value;
        const tag = document.getElementById('writer-tag').value.trim() || 'Silence & Water';
        const title = document.getElementById('writer-title').value.trim();
        const date = document.getElementById('writer-date').value.trim() || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
        const verse = document.getElementById('writer-verse').value.trim();

        if (!title || !verse) {
          showToast('Please enter both a title and your verses');
          return;
        }

        const newPoem = {
          id: 'custom-' + Date.now(),
          language: lang,
          tag: tag,
          title: title,
          date: date,
          verse: verse,
          created_at: new Date().toISOString()
        };

        // 1. Save to local storage
        const currentList = getStoredPoems();
        currentList.unshift(newPoem);
        saveStoredPoems(currentList);

        // 2. Render immediately at the top of the grid
        renderPoemCard(newPoem, true);
        updateCounterDisplay();

        // 3. Post to backend API /api/poems (Vercel / Supabase sync)
        try {
          fetch('/api/poems', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPoem)
          }).then(res => res.json()).then(data => {
            console.log('Saved to cloud/backend:', data);
          }).catch(err => {
            console.warn('API sync deferred to local storage:', err);
          });
        } catch (err) {}

        // 4. Feedback and reset
        closeDesk();
        writerForm.reset();
        if (dateInput) {
          dateInput.value = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });
        }

        showToast('✦ Verse quietly planted in Audrita\'s archive');

        // Scroll gracefully to the newly added poem
        const targetSection = lang === 'hindi' ? document.getElementById('hindi-poetry-sub') : document.getElementById('english-poetry-sub');
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Handle export / backup
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        const stored = getStoredPoems();
        const payload = {
          author: 'Audrita Mukherjee',
          project: 'The Quiet Garden',
          backup_date: new Date().toISOString(),
          custom_poems: stored
        };

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `audrita_poetry_archive_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        showToast('Downloaded poetry backup JSON');
      });
    }

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
