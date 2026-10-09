/* ============================================================
   AUDRITA — THE QUIET GARDEN
   Global JavaScript, Document Ingestion & Poetry Archiving
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
        logoMark.textContent = '·';
      });
      navLogo.addEventListener('mouseleave', function () {
        logoMark.textContent = '·';
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
      }, 3800);
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
    // ── Poetry Filter Pills (English Poetry vs हिंदी कविता) ──
    const filterPills = document.querySelectorAll('.poetry-filter-bar .filter-pill');
    const englishSub = document.getElementById('english-poetry-sub');
    const hindiSub = document.getElementById('hindi-poetry-sub');

    function switchPoetryTab(targetLang) {
      filterPills.forEach(p => {
        if (p.getAttribute('data-filter') === targetLang) {
          p.classList.add('is-active');
        } else {
          p.classList.remove('is-active');
        }
      });

      if (targetLang === 'hindi') {
        if (hindiSub) hindiSub.style.display = '';
        if (englishSub) englishSub.style.display = 'none';
      } else {
        if (englishSub) englishSub.style.display = '';
        if (hindiSub) hindiSub.style.display = 'none';
      }
    }

    if (filterPills.length) {
      filterPills.forEach(pill => {
        pill.addEventListener('click', function () {
          const filter = this.getAttribute('data-filter');
          switchPoetryTab(filter);
        });
      });
    }

    // ── Direct Document Ingestion & Poetry Archiving System ────
    const POEMS_STORAGE_KEY = 'audrita_custom_poems_v2';
    const poetryFileInput = document.getElementById('poetry-file-input');
    const uploadButtons = document.querySelectorAll('#nav-upload-btn, #mobile-upload-btn, #archive-upload-btn');

    // Wire sleek upload buttons directly to native file picker
    uploadButtons.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (poetryFileInput) {
          poetryFileInput.click();
        } else {
          // If on a subpage without direct file input, redirect to poetry section on index
          window.location.href = 'index.html#poetry';
        }
      });
    });

    // Check if page loaded with #upload hash
    if (window.location.hash === '#upload' && poetryFileInput) {
      setTimeout(() => poetryFileInput.click(), 400);
      try { history.replaceState(null, null, 'index.html#poetry'); } catch (e) {}
    }

    // Listen for file selection
    if (poetryFileInput) {
      poetryFileInput.addEventListener('change', async function () {
        if (this.files && this.files.length > 0) {
          await processPoetryDocument(this.files[0]);
          this.value = ''; // Reset input so same file can be re-selected if updated
        }
      });
    }

    // Asynchronous document parsing (.docx, .pdf, .txt, .md)
    async function processPoetryDocument(file) {
      const fileName = file.name;
      const lower = fileName.toLowerCase();
      showToast(`Reading manuscript "${fileName}"...`);

      try {
        let extractedText = '';

        // 1. Word Document (.docx)
        if (lower.endsWith('.docx')) {
          const arrayBuffer = await file.arrayBuffer();
          if (window.mammoth) {
            const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            extractedText = result.value;
          } else {
            extractedText = new TextDecoder('utf-8').decode(arrayBuffer);
          }
        }
        // 2. PDF Document (.pdf)
        else if (lower.endsWith('.pdf')) {
          const arrayBuffer = await file.arrayBuffer();
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageStrings = textContent.items.map(item => item.str);
              fullText += pageStrings.join('\n') + '\n\n';
            }
            extractedText = fullText;
          } else {
            extractedText = await file.text();
          }
        }
        // 3. Text or Markdown (.txt, .md)
        else {
          extractedText = await file.text();
        }

        if (!extractedText || !extractedText.trim()) {
          showToast(`Manuscript "${fileName}" appears empty.`);
          return;
        }

        plantManuscriptPoem(extractedText, fileName);

      } catch (err) {
        console.error('Document parsing error:', err);
        showToast(`Could not read "${fileName}". Ensure it is a valid .docx, .pdf, or .txt file.`);
      }
    }

    // Format, classify, and plant the extracted verses into the archive
    function plantManuscriptPoem(rawText, fileName) {
      const cleanText = rawText.replace(/\r\n/g, '\n').trim();
      const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      let title = '';
      let verseBody = cleanText;
      const baseName = fileName.replace(/\.[^/.]+$/, '').trim();

      // Check if the very first line can serve as the poem title
      if (lines.length > 1 && lines[0].length < 60 && !lines[0].endsWith(',') && !lines[0].endsWith(';') && !lines[0].includes('...')) {
        title = lines[0];
        const firstLineIdx = cleanText.indexOf(lines[0]);
        verseBody = cleanText.substring(firstLineIdx + lines[0].length).trim();
      } else {
        title = baseName || 'Untitled Verse';
      }

      // Devanagari script regex detects Hindi poetry automatically
      const isHindi = /[\u0900-\u097F]/.test(cleanText);
      const language = isHindi ? 'hindi' : 'english';
      const defaultTag = isHindi ? 'मक़्तूब & देहलीज़' : 'Memory & Solitude';
      const authorDate = isHindi ? 'औद्रिता मुखर्जी' : 'Audrita Mukherjee';

      const newPoem = {
        id: 'custom-' + Date.now(),
        language: language,
        tag: defaultTag,
        title: title,
        date: authorDate,
        verse: verseBody,
        isCustom: true,
        created_at: new Date().toISOString()
      };

      // 1. Persist to localStorage
      const currentList = getStoredPoems();
      currentList.push(newPoem);
      saveStoredPoems(currentList);

      // 2. Switch tab to match the uploaded language
      switchPoetryTab(language);

      // 3. Render next to Favor / existing poems with identical layout
      renderPoemCard(newPoem, false);
      updateCounterDisplay();

      // 4. Post to backend API /api/poems (Vercel & Supabase sync)
      try {
        fetch('/api/poems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPoem)
        }).then(res => res.json()).then(data => {
          console.log('Synchronized to cloud/backend:', data);
        }).catch(err => {
          console.warn('API sync deferred to local storage:', err);
        });
      } catch (err) {}

      // 5. Poetic confirmation toast
      showToast(`❧ "${title}" quietly planted in Audrita's archive`);

      // 6. Scroll smoothly to the newly planted poem
      const targetSub = isHindi ? document.getElementById('hindi-poetry-sub') : document.getElementById('english-poetry-sub');
      if (targetSub) {
        const newlyRenderedCard = document.getElementById(newPoem.id);
        if (newlyRenderedCard) {
          setTimeout(() => {
            newlyRenderedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newlyRenderedCard.classList.add('is-newly-planted');
          }, 150);
        } else {
          targetSub.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
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

    // Render a pristine poem card arranged identically to Favor
    function renderPoemCard(poem, isPrepend = false) {
      const isHindi = poem.language === 'hindi';
      const targetGrid = isHindi ? document.getElementById('poems-grid-hindi') : document.getElementById('poems-grid-english');
      if (!targetGrid) return;

      const card = document.createElement('article');
      card.className = 'poem-card-clean filterable-item';
      card.setAttribute('data-category', poem.language);
      card.id = poem.id || `poem-custom-${Date.now()}`;

      const removeIconHtml = poem.isCustom ? `
        <button class="btn-remove-poem-icon" data-id="${poem.id}" data-title="${escapeHTML(poem.title)}" aria-label="Remove poem" title="Remove poem">✕</button>
      ` : '';

      card.innerHTML = `
        <div class="poem-card-header">
          <div class="poem-card-meta">
            <span class="poem-card-lang" ${isHindi ? 'style="color: var(--color-accent); font-weight: 500;"' : ''}>${isHindi ? 'हिंदी' : 'EN'}</span>
            <span class="poem-card-tag">${escapeHTML(poem.tag || (isHindi ? 'मक़्तूब & देहलीज़' : 'Memory & Solitude'))}</span>
          </div>
          ${removeIconHtml}
        </div>
        <h4 class="poem-card-title ${isHindi ? 'is-hindi' : ''}">${escapeHTML(poem.title)}</h4>
        <div class="poem-verse-text ${isHindi ? 'is-hindi' : ''}">${escapeHTML(poem.verse)}</div>
        <div class="poem-card-footer">
          <span class="poem-card-date">${escapeHTML(poem.date || (isHindi ? 'औद्रिता मुखर्जी' : 'Audrita Mukherjee'))}</span>
        </div>
      `;

      if (isPrepend) {
        targetGrid.prepend(card);
      } else {
        targetGrid.appendChild(card);
      }
    }

    // Listen for click on Remove Poem buttons (discreet minimalist icon)
    document.addEventListener('click', function (e) {
      const removeBtn = e.target.closest('.btn-remove-poem-icon, .btn-remove-poem');
      if (!removeBtn) return;
      e.preventDefault();

      const poemId = removeBtn.getAttribute('data-id');
      const poemTitle = removeBtn.getAttribute('data-title') || 'Verse';
      if (!poemId) return;

      if (window.confirm(`Do you wish to remove "${poemTitle}" from your poetry archive?`)) {
        const stored = getStoredPoems();
        const updated = stored.filter(p => p.id !== poemId);
        saveStoredPoems(updated);

        const card = document.getElementById(poemId);
        if (card) {
          card.style.transition = 'all 0.3s ease-out';
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.remove();
            updateCounterDisplay();
          }, 300);
        }
        showToast(`❧ "${poemTitle}" quietly removed from archive`);
      }
    });

    function escapeHTML(str) {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Load initial stored custom poems on page load
    const existingCustomPoems = getStoredPoems();
    existingCustomPoems.forEach(p => {
      p.isCustom = true; // allow removing previously uploaded custom poems
      renderPoemCard(p, false);
    });

    // Update garden count display (2 core canonical poems: Favor & Maktub + custom additions)
    function updateCounterDisplay() {
      const counterEl = document.getElementById('garden-counter-display');
      if (counterEl) {
        const total = 2 + getStoredPoems().length;
        const totalStr = total < 10 ? `0${total}` : total;
        counterEl.textContent = `${totalStr} / 50`;
      }
    }
    updateCounterDisplay();

    // ── Pinterest-Style Photo Album System (Add & Remove) ────
    const PHOTO_STORAGE_KEY = 'audrita_custom_photos_v1';
    const albumAddBtn = document.getElementById('album-add-btn');
    const albumFileInput = document.getElementById('album-file-input');
    const photoMasonryContainer = document.getElementById('photo-masonry-container');

    function getStoredPhotos() {
      try {
        const stored = localStorage.getItem(PHOTO_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }

    function saveStoredPhotos(list) {
      try {
        localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {}
    }

    function renderPhotoCard(photo, isPrepend = false) {
      if (!photoMasonryContainer) return;
      const article = document.createElement('article');
      article.className = 'photo-card is-custom-photo';
      article.id = photo.id;
      article.innerHTML = `
        <button class="btn-remove-photo" data-id="${photo.id}" data-title="${escapeHTML(photo.title)}" title="Remove photo" aria-label="Remove photo">✕</button>
        <div class="photo-card-img-wrap">
          <img src="${photo.src}" alt="${escapeHTML(photo.title)}" loading="lazy" />
        </div>
        <div class="photo-card-caption">
          <h3 class="photo-card-title">${escapeHTML(photo.title)}</h3>
          <span class="photo-card-date">${escapeHTML(photo.date || 'Planted in Album')}</span>
        </div>
      `;
      if (isPrepend) {
        photoMasonryContainer.prepend(article);
      } else {
        photoMasonryContainer.appendChild(article);
      }
    }

    if (albumAddBtn && albumFileInput) {
      albumAddBtn.addEventListener('click', () => albumFileInput.click());

      albumFileInput.addEventListener('change', function () {
        if (this.files && this.files.length > 0) {
          const file = this.files[0];
          const reader = new FileReader();
          reader.onload = function (e) {
            const imgSrc = e.target.result;
            const fileName = file.name.replace(/\.[^/.]+$/, '');
            const titlePrompt = prompt('Enter a caption for this photograph:', fileName);
            const title = titlePrompt && titlePrompt.trim() ? titlePrompt.trim() : (fileName || 'Visual Memory');

            const newPhoto = {
              id: 'photo-' + Date.now(),
              src: imgSrc,
              title: title,
              date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            };

            const currentPhotos = getStoredPhotos();
            currentPhotos.unshift(newPhoto);
            saveStoredPhotos(currentPhotos);

            renderPhotoCard(newPhoto, true);
            showToast(`❧ Photo added to visual journal`);
          };
          reader.readAsDataURL(file);
          this.value = '';
        }
      });
    }

    // Load custom photos on photo album page
    if (photoMasonryContainer) {
      const storedPhotos = getStoredPhotos();
      storedPhotos.forEach(p => renderPhotoCard(p, true));

      // Handle photo removal clicks
      document.addEventListener('click', function (e) {
        const removePhotoBtn = e.target.closest('.btn-remove-photo');
        if (!removePhotoBtn) return;
        e.preventDefault();

        const photoId = removePhotoBtn.getAttribute('data-id');
        const photoTitle = removePhotoBtn.getAttribute('data-title') || 'Photo';
        if (!photoId) return;

        if (confirm(`Remove "${photoTitle}" from photo album?`)) {
          const stored = getStoredPhotos();
          const updated = stored.filter(p => p.id !== photoId);
          saveStoredPhotos(updated);

          const card = document.getElementById(photoId);
          if (card) {
            card.style.transition = 'all 0.3s ease-out';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.92)';
            setTimeout(() => card.remove(), 300);
          }
          showToast(`❧ Photo removed from album`);
        }
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
