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

    // ── Intelligent Poetry Stanza Normalizer ────────────────────
    // Resolves Word paragraph artifacts (\n\n per line), rejoins orphaned punctuation (e.g. "?" on a newline),
    // and preserves authentic stanza groupings with identical structure to Favor on the left.
    function formatPoetryVerses(rawText) {
      if (!rawText) return '';
      // 1. Normalize line breaks
      let text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      // 2. Remove non-breaking spaces and invisible format characters
      text = text.replace(/[\u00A0\u2000-\u200B\u202F\u205F]/g, ' ');

      // 3. Fix space before punctuation e.g. "please ?" -> "please?"
      text = text.replace(/([^\s])\s+([?!.,:;’”\-)\]}]+)/g, '$1$2');

      // 4. Split into lines and trim each line
      let lines = text.split('\n').map(l => l.trim());

      // 5. Rejoin lines that consist only of punctuation: ? ! , . ; : ' " ” ’ etc.
      let rejoined = [];
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (!line) {
          rejoined.push('');
          continue;
        }
        // If line is just punctuation or starts with standalone punctuation attached to nothing
        if (/^[?!.,:;’”\-)\]}]+$/.test(line)) {
          let prevIdx = rejoined.length - 1;
          while (prevIdx >= 0 && rejoined[prevIdx] === '') {
            prevIdx--;
          }
          if (prevIdx >= 0) {
            rejoined[prevIdx] = (rejoined[prevIdx] + line).replace(/\s+([?!.,:;])/g, '$1');
            continue;
          }
        }
        rejoined.push(line);
      }

      text = rejoined.join('\n');

      // 6. Stanza grouping analysis:
      // In Word documents, each paragraph (<w:p>) produces \n\n in Mammoth.
      // If the author pressed an extra Enter between stanzas, Mammoth produces 3 or 4 newlines (\n\s*\n\s*\n+).
      const hasMultiBlanks = /\n\s*\n\s*\n/.test(text);

      if (hasMultiBlanks) {
        // Multi-newline clusters denote true stanza breaks!
        const stanzas = text.split(/\n\s*\n\s*\n+/);
        const formattedStanzas = stanzas.map(stanza => {
          // Inside a stanza, collapse single blank lines between verses so they are tightly adjacent
          const verses = stanza.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          return verses.join('\n');
        }).filter(s => s.length > 0);
        return formattedStanzas.join('\n\n');
      }

      // Check if almost every line is separated by an empty line (Word doc where each line was a <w:p>)
      const nonEmpties = lines.filter(l => l.length > 0);
      const emptyCount = lines.filter(l => l.length === 0).length;

      if (nonEmpties.length > 2 && emptyCount >= nonEmpties.length - 2) {
        // Double spaced throughout: collapse single blank lines between all lines
        return nonEmpties.join('\n');
      }

      // Collapse 3 or more newlines to a clean double newline (stanza break)
      return text.replace(/\n{3,}/g, '\n\n').trim();
    }

    // Format, classify, and plant the extracted verses into the archive
    function plantManuscriptPoem(rawText, fileName) {
      // Intelligently format stanzas like Favor on the left
      const normalizedText = formatPoetryVerses(rawText);
      const lines = normalizedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      let title = '';
      let verseBody = normalizedText;
      const baseName = fileName.replace(/\.[^/.]+$/, '').trim();

      // Check if the very first line can serve as the poem title
      if (lines.length > 1 && lines[0].length < 60 && !lines[0].endsWith(',') && !lines[0].endsWith(';') && !lines[0].includes('...')) {
        title = lines[0];
        const firstLineIdx = normalizedText.indexOf(lines[0]);
        verseBody = normalizedText.substring(firstLineIdx + lines[0].length).trim();
      } else {
        title = baseName || 'Untitled Verse';
      }

      // Re-normalize verseBody after title extraction
      verseBody = formatPoetryVerses(verseBody);

      // Devanagari script regex detects Hindi poetry automatically
      const isHindi = /[\u0900-\u097F]/.test(normalizedText);
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

      // 3. Render next to Favor / existing poems with identical layout and visible controls
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
      showToast(`❧ "${title}" quietly planted with structured stanzas`);

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

    // Helper to get customized canonical poems (Favor, Maktub customizations)
    const CANONICAL_CUSTOM_KEY = 'audrita_canonical_customizations_v1';
    function getCanonicalCustomizations() {
      try {
        const stored = localStorage.getItem(CANONICAL_CUSTOM_KEY);
        return stored ? JSON.parse(stored) : {};
      } catch (e) {
        return {};
      }
    }
    function saveCanonicalCustomizations(data) {
      try {
        localStorage.setItem(CANONICAL_CUSTOM_KEY, JSON.stringify(data));
      } catch (e) {}
    }

    // Apply any saved customizations to canonical Favor and Maktub on page load
    function applyCanonicalCustomizations() {
      const customMap = getCanonicalCustomizations();
      Object.keys(customMap).forEach(id => {
        const card = document.getElementById(id);
        if (!card) return;
        const item = customMap[id];
        if (item.title) {
          const titleEl = card.querySelector('.poem-card-title');
          if (titleEl) titleEl.textContent = item.title;
        }
        if (item.tag) {
          const tagEl = card.querySelector('.poem-card-tag');
          if (tagEl) tagEl.textContent = item.tag;
        }
        if (item.verse) {
          const verseEl = card.querySelector('.poem-verse-text');
          if (verseEl) verseEl.textContent = item.verse;
        }
        if (item.date) {
          const dateEl = card.querySelector('.poem-card-date');
          if (dateEl) dateEl.textContent = item.date;
        }
      });
    }
    applyCanonicalCustomizations();

    // Render a pristine poem card arranged identically to Favor with visible Edit and Remove buttons
    function renderPoemCard(poem, isPrepend = false) {
      const isHindi = poem.language === 'hindi';
      const targetGrid = isHindi ? document.getElementById('poems-grid-hindi') : document.getElementById('poems-grid-english');
      if (!targetGrid) return;

      const card = document.createElement('article');
      card.className = 'poem-card-clean filterable-item';
      card.setAttribute('data-category', poem.language);
      card.id = poem.id || `poem-custom-${Date.now()}`;

      // Clean, visible Edit and Remove controls in the card header
      const controlsHtml = `
        <div class="poem-card-controls">
          <button class="btn-poem-ctrl btn-poem-edit" data-id="${card.id}" title="Edit & Customize Verse">✎ Edit</button>
          <button class="btn-poem-ctrl btn-poem-remove" data-id="${card.id}" data-title="${escapeHTML(poem.title)}" title="Remove poem">✕ Remove</button>
        </div>
      `;

      card.innerHTML = `
        <div class="poem-card-header">
          <div class="poem-card-meta">
            <span class="poem-card-lang" ${isHindi ? 'style="color: var(--color-accent); font-weight: 500;"' : ''}>${isHindi ? 'हिंदी' : 'EN'}</span>
            <span class="poem-card-tag">${escapeHTML(poem.tag || (isHindi ? 'मक़्तूब & देहलीज़' : 'Memory & Solitude'))}</span>
          </div>
          ${controlsHtml}
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

    // ── Poetry Customization & Edit (Inline inside Poetry Archive) ─────────────────
    const inlinePoetryEditor = document.getElementById('inline-poetry-editor');
    const btnTogglePoetryEditor = document.getElementById('btn-toggle-poetry-editor');
    const btnCloseInlineEditor = document.getElementById('btn-close-inline-editor');
    const btnEditPoemCancel = document.getElementById('btn-edit-poem-cancel');
    const btnEditPoemSave = document.getElementById('btn-edit-poem-save');
    const btnAutocleanStanzas = document.getElementById('btn-autoclean-stanzas');
    const inlineEditorHeading = document.getElementById('inline-editor-heading');

    const editPoemIdInput = document.getElementById('edit-poem-id');
    const editPoemTitleInput = document.getElementById('edit-poem-title');
    const editPoemTagInput = document.getElementById('edit-poem-tag');
    const editPoemLangSelect = document.getElementById('edit-poem-lang');
    const editPoemDateInput = document.getElementById('edit-poem-date');
    const editPoemVersesTextarea = document.getElementById('edit-poem-verses');

    function openEditPoemEditor(poemId) {
      const card = document.getElementById(poemId) || document.getElementById('poem-favor');
      if (!card) return;

      const titleEl = card.querySelector('.poem-card-title');
      const tagEl = card.querySelector('.poem-card-tag');
      const langEl = card.querySelector('.poem-card-lang');
      const dateEl = card.querySelector('.poem-card-date');
      const verseEl = card.querySelector('.poem-verse-text');

      if (editPoemIdInput) editPoemIdInput.value = card.id;
      if (editPoemTitleInput) editPoemTitleInput.value = titleEl ? titleEl.textContent.trim() : '';
      if (editPoemTagInput) editPoemTagInput.value = tagEl ? tagEl.textContent.trim() : '';
      if (editPoemDateInput) editPoemDateInput.value = dateEl ? dateEl.textContent.trim() : '';
      if (editPoemVersesTextarea) editPoemVersesTextarea.value = verseEl ? verseEl.textContent.trim() : '';

      const isHindi = (langEl && langEl.textContent.includes('हिंदी')) || card.getAttribute('data-category') === 'hindi';
      if (editPoemLangSelect) {
        editPoemLangSelect.value = isHindi ? 'hindi' : 'english';
      }
      if (inlineEditorHeading) {
        inlineEditorHeading.textContent = `Customize & Edit: ${titleEl ? titleEl.textContent.trim() : 'Verse'}`;
      }

      if (inlinePoetryEditor) {
        inlinePoetryEditor.style.display = 'block';
        inlinePoetryEditor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (editPoemTitleInput) editPoemTitleInput.focus();
    }

    function closeEditPoemEditor() {
      if (inlinePoetryEditor) {
        inlinePoetryEditor.style.display = 'none';
      }
    }

    if (btnTogglePoetryEditor) {
      btnTogglePoetryEditor.addEventListener('click', function (e) {
        e.preventDefault();
        if (inlinePoetryEditor && inlinePoetryEditor.style.display !== 'none') {
          closeEditPoemEditor();
        } else {
          // Open for active visible poem (Hindi tab or English tab)
          const activeFilter = document.querySelector('.poetry-filter-bar .filter-pill.is-active');
          const isHindiTab = activeFilter && activeFilter.getAttribute('data-filter') === 'hindi';
          const defaultPoemId = isHindiTab ? 'poem-maktub' : 'poem-favor';
          openEditPoemEditor(defaultPoemId);
        }
      });
    }

    if (btnCloseInlineEditor) btnCloseInlineEditor.addEventListener('click', closeEditPoemEditor);
    if (btnEditPoemCancel) btnEditPoemCancel.addEventListener('click', closeEditPoemEditor);

    // Auto-clean stanzas button in modal
    if (btnAutocleanStanzas && editPoemVersesTextarea) {
      btnAutocleanStanzas.addEventListener('click', function () {
        const raw = editPoemVersesTextarea.value;
        const cleaned = formatPoetryVerses(raw);
        editPoemVersesTextarea.value = cleaned;
        showToast('✨ Stanzas auto-cleaned & structured like Favor');
      });
    }

    // Save changes from Edit Modal
    if (btnEditPoemSave) {
      btnEditPoemSave.addEventListener('click', function () {
        const poemId = editPoemIdInput.value;
        const newTitle = editPoemTitleInput.value.trim() || 'Untitled Verse';
        const newTag = editPoemTagInput.value.trim() || 'Memory & Solitude';
        const newLang = editPoemLangSelect.value;
        const newDate = editPoemDateInput.value.trim() || 'Audrita Mukherjee';
        const newVerses = formatPoetryVerses(editPoemVersesTextarea.value);

        const card = document.getElementById(poemId);
        if (card) {
          const titleEl = card.querySelector('.poem-card-title');
          const tagEl = card.querySelector('.poem-card-tag');
          const langEl = card.querySelector('.poem-card-lang');
          const dateEl = card.querySelector('.poem-card-date');
          const verseEl = card.querySelector('.poem-verse-text');

          if (titleEl) titleEl.textContent = newTitle;
          if (tagEl) tagEl.textContent = newTag;
          if (langEl) {
            langEl.textContent = newLang === 'hindi' ? 'हिंदी' : 'EN';
            langEl.style.color = newLang === 'hindi' ? 'var(--color-accent)' : '';
            langEl.style.fontWeight = newLang === 'hindi' ? '500' : '';
          }
          if (dateEl) dateEl.textContent = newDate;
          if (verseEl) {
            verseEl.textContent = newVerses;
            if (newLang === 'hindi') verseEl.classList.add('is-hindi');
            else verseEl.classList.remove('is-hindi');
          }
        }

        // Check if canonical poem (poem-favor, poem-maktub) or custom
        if (poemId === 'poem-favor' || poemId === 'poem-maktub') {
          const canonicalMap = getCanonicalCustomizations();
          canonicalMap[poemId] = {
            title: newTitle,
            tag: newTag,
            date: newDate,
            verse: newVerses,
            language: newLang
          };
          saveCanonicalCustomizations(canonicalMap);
        } else {
          // Custom poem
          const stored = getStoredPoems();
          const target = stored.find(p => p.id === poemId);
          if (target) {
            target.title = newTitle;
            target.tag = newTag;
            target.date = newDate;
            target.verse = newVerses;
            target.language = newLang;
            saveStoredPoems(stored);
          }
        }

        closeEditPoemEditor();
        showToast(`❧ "${newTitle}" headings & verses updated`);
      });
    }

    // Delegate click on Edit and Remove Poem buttons
    document.addEventListener('click', function (e) {
      // 1. Edit Poem Click
      const editBtn = e.target.closest('.btn-poem-edit');
      if (editBtn) {
        e.preventDefault();
        const poemId = editBtn.getAttribute('data-id');
        if (poemId) openEditPoemEditor(poemId);
        return;
      }

      // 2. Remove Poem Click
      const removeBtn = e.target.closest('.btn-poem-remove, .btn-remove-poem-icon, .btn-remove-poem');
      if (removeBtn) {
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
      p.isCustom = true;
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

    // ── Google Drive & Pinterest-Style Photo Album System ─────
    // Converts any public Google Drive share link into a direct high-speed CDN image URL
    // Solving local storage limits permanently for the long run.
    function convertGoogleDriveUrl(url) {
      if (!url) return '';
      const trimmed = url.trim();
      let match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (!match) match = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (!match) match = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        // High-resolution direct streaming endpoint from Google CDN
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
      return trimmed;
    }

    const PHOTO_STORAGE_KEY = 'audrita_custom_photos_v1';
    const albumAddBtn = document.getElementById('album-add-btn');
    const photoMasonryContainer = document.getElementById('photo-masonry-container');

    const modalAddPhoto = document.getElementById('modal-add-photo');
    const modalPhotoClose = document.getElementById('modal-photo-close');
    const btnPhotoCancel = document.getElementById('btn-photo-cancel');
    const btnPhotoSave = document.getElementById('btn-photo-save');
    const photoDriveUrlInput = document.getElementById('photo-drive-url');
    const albumModalFileInput = document.getElementById('album-modal-file-input');
    const photoNewTitleInput = document.getElementById('photo-new-title');
    const photoNewDateInput = document.getElementById('photo-new-date');

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

      const isDrive = photo.isDrive || (photo.src && photo.src.includes('googleusercontent.com'));
      const driveBadgeHtml = isDrive ? `<span class="badge-drive-storage">☁️ Google Drive</span>` : '';

      article.innerHTML = `
        <button class="btn-remove-photo" data-id="${photo.id}" data-title="${escapeHTML(photo.title)}" title="Remove photo" aria-label="Remove photo">✕</button>
        <div class="photo-card-img-wrap">
          <img src="${photo.src}" alt="${escapeHTML(photo.title)}" loading="lazy" />
        </div>
        <div class="photo-card-caption">
          <h3 class="photo-card-title">${escapeHTML(photo.title)}</h3>
          <span class="photo-card-date">${escapeHTML(photo.date || 'Planted in Album')}</span>
          ${driveBadgeHtml}
        </div>
      `;
      if (isPrepend) {
        photoMasonryContainer.prepend(article);
      } else {
        photoMasonryContainer.appendChild(article);
      }
    }

    function openPhotoModal() {
      if (!modalAddPhoto) return;
      if (photoDriveUrlInput) photoDriveUrlInput.value = '';
      if (albumModalFileInput) albumModalFileInput.value = '';
      if (photoNewTitleInput) photoNewTitleInput.value = '';
      if (photoNewDateInput) photoNewDateInput.value = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      modalAddPhoto.style.display = 'flex';
      modalAddPhoto.classList.add('is-active');
      modalAddPhoto.setAttribute('aria-hidden', 'false');
    }

    function closePhotoModal() {
      if (!modalAddPhoto) return;
      modalAddPhoto.classList.remove('is-active');
      modalAddPhoto.setAttribute('aria-hidden', 'true');
      modalAddPhoto.style.display = 'none';
    }

    if (albumAddBtn) {
      albumAddBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openPhotoModal();
      });
    }
    if (modalPhotoClose) modalPhotoClose.addEventListener('click', closePhotoModal);
    if (btnPhotoCancel) btnPhotoCancel.addEventListener('click', closePhotoModal);
    if (modalAddPhoto) {
      modalAddPhoto.addEventListener('click', (e) => {
        if (e.target === modalAddPhoto) closePhotoModal();
      });
    }

    // Save photo from Google Drive link or local upload
    if (btnPhotoSave) {
      btnPhotoSave.addEventListener('click', function () {
        const driveUrl = photoDriveUrlInput ? photoDriveUrlInput.value.trim() : '';
        const title = (photoNewTitleInput && photoNewTitleInput.value.trim()) ? photoNewTitleInput.value.trim() : 'Visual Memory';
        const date = (photoNewDateInput && photoNewDateInput.value.trim()) ? photoNewDateInput.value.trim() : 'Calcutta Memory';

        // 1. Google Drive Link provided
        if (driveUrl) {
          const directImgUrl = convertGoogleDriveUrl(driveUrl);
          const newPhoto = {
            id: 'photo-drive-' + Date.now(),
            src: directImgUrl,
            title: title,
            date: date,
            isDrive: true
          };
          const currentPhotos = getStoredPhotos();
          currentPhotos.unshift(newPhoto);
          saveStoredPhotos(currentPhotos);

          renderPhotoCard(newPhoto, true);
          closePhotoModal();
          showToast('☁️ Photo linked permanently from Google Drive');
          return;
        }

        // 2. Local device file uploaded
        if (albumModalFileInput && albumModalFileInput.files && albumModalFileInput.files[0]) {
          const file = albumModalFileInput.files[0];
          const reader = new FileReader();
          reader.onload = function (e) {
            // Compress using HTML5 Canvas to prevent browser localStorage quota limit
            const img = new Image();
            img.onload = function () {
              const canvas = document.createElement('canvas');
              const maxDim = 1200;
              let width = img.width;
              let height = img.height;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              const compressedSrc = canvas.toDataURL('image/jpeg', 0.82);

              const newPhoto = {
                id: 'photo-local-' + Date.now(),
                src: compressedSrc,
                title: title,
                date: date,
                isDrive: false
              };
              const currentPhotos = getStoredPhotos();
              currentPhotos.unshift(newPhoto);
              saveStoredPhotos(currentPhotos);

              renderPhotoCard(newPhoto, true);
              closePhotoModal();
              showToast('❧ Photo added to visual journal');
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
          return;
        }

        showToast('Please paste a Google Drive link or select a photo file.');
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

    // ── Voice Verses (Words In Voice) Hub & Add/Remove System ──
    const VOICE_STORAGE_KEY = 'audrita_voice_verses_v1';
    const voicePlaylistContainer = document.getElementById('voice-verses-playlist');
    const btnAddVoiceTrack = document.getElementById('btn-add-voice-track');
    const inlineVoicePanel = document.getElementById('inline-voice-panel');
    const btnCloseVoicePanel = document.getElementById('btn-close-voice-panel');
    const btnVoiceCancel = document.getElementById('btn-voice-cancel');
    const btnVoiceSave = document.getElementById('btn-voice-save');
    const voiceNewTitle = document.getElementById('voice-new-title');
    const voiceNewNarrator = document.getElementById('voice-new-narrator');
    const voiceFileInput = document.getElementById('voice-file-input');
    const voiceNewUrl = document.getElementById('voice-new-url');
    const globalVoiceAudio = document.getElementById('global-voice-audio');

    const defaultVoiceTracks = [
      {
        id: 'voice-track-favor-1',
        title: '01. Favor (Spoken Verse)',
        narrator: 'Audrita Mukherjee · Cello Accompaniment',
        url: '',
        isDefault: true
      }
    ];

    function getStoredVoiceTracks() {
      try {
        const stored = localStorage.getItem(VOICE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : defaultVoiceTracks;
      } catch (e) {
        return defaultVoiceTracks;
      }
    }

    function saveStoredVoiceTracks(list) {
      try {
        localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {}
    }

    let activeVoiceTrackId = null;

    function renderVoicePlaylist() {
      if (!voicePlaylistContainer) return;
      voicePlaylistContainer.innerHTML = '';
      const tracks = getStoredVoiceTracks();

      tracks.forEach(track => {
        const card = document.createElement('div');
        card.className = `voice-track-card ${activeVoiceTrackId === track.id ? 'is-playing' : ''}`;
        card.id = track.id;

        const removeBtnHtml = !track.isDefault ? `
          <button class="btn-remove-voice-track" data-id="${track.id}" data-title="${escapeHTML(track.title)}" title="Remove verse recording">✕</button>
        ` : '';

        card.innerHTML = `
          <div class="voice-track-info">
            <h4 class="voice-track-name">${escapeHTML(track.title)}</h4>
            <div class="voice-track-meta">
              <span>${escapeHTML(track.narrator)}</span>
            </div>
          </div>
          <div class="voice-track-controls">
            <button class="btn-track-play" data-id="${track.id}" data-url="${escapeHTML(track.url || '')}" aria-label="Play ${escapeHTML(track.title)}">
              ${activeVoiceTrackId === track.id ? '❚❚' : '▶'}
            </button>
            ${removeBtnHtml}
          </div>
        `;
        voicePlaylistContainer.appendChild(card);
      });
    }

    renderVoicePlaylist();

    function openVoicePanel() {
      if (!inlineVoicePanel) return;
      if (voiceNewTitle) voiceNewTitle.value = '';
      if (voiceNewNarrator) voiceNewNarrator.value = 'Audrita Mukherjee · Quiet Recording';
      if (voiceFileInput) voiceFileInput.value = '';
      if (voiceNewUrl) voiceNewUrl.value = '';
      inlineVoicePanel.style.display = 'block';
      inlineVoicePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (voiceNewTitle) voiceNewTitle.focus();
    }

    function closeVoicePanel() {
      if (!inlineVoicePanel) return;
      inlineVoicePanel.style.display = 'none';
    }

    if (btnAddVoiceTrack) {
      btnAddVoiceTrack.addEventListener('click', function (e) {
        e.preventDefault();
        if (inlineVoicePanel && inlineVoicePanel.style.display !== 'none') {
          closeVoicePanel();
        } else {
          openVoicePanel();
        }
      });
    }
    if (btnCloseVoicePanel) btnCloseVoicePanel.addEventListener('click', closeVoicePanel);
    if (btnVoiceCancel) btnVoiceCancel.addEventListener('click', closeVoicePanel);

    if (btnVoiceSave) {
      btnVoiceSave.addEventListener('click', function () {
        const title = (voiceNewTitle && voiceNewTitle.value.trim()) ? voiceNewTitle.value.trim() : 'Spoken Verse';
        const narrator = (voiceNewNarrator && voiceNewNarrator.value.trim()) ? voiceNewNarrator.value.trim() : 'Audrita Mukherjee';
        const urlInput = voiceNewUrl ? voiceNewUrl.value.trim() : '';
        const driveConvertedUrl = convertGoogleDriveUrl(urlInput);

        const newTrack = {
          id: 'voice-custom-' + Date.now(),
          title: title,
          narrator: narrator,
          url: driveConvertedUrl,
          isDefault: false
        };

        // If audio file selected, read as data URL
        if (voiceFileInput && voiceFileInput.files && voiceFileInput.files[0]) {
          const file = voiceFileInput.files[0];
          const reader = new FileReader();
          reader.onload = function (e) {
            newTrack.url = e.target.result;
            const currentList = getStoredVoiceTracks();
            currentList.push(newTrack);
            saveStoredVoiceTracks(currentList);
            renderVoicePlaylist();
            closeVoicePanel();
            showToast(`🎙 "${title}" added to Spoken Verses`);
          };
          reader.readAsDataURL(file);
          return;
        }

        const currentList = getStoredVoiceTracks();
        currentList.push(newTrack);
        saveStoredVoiceTracks(currentList);
        renderVoicePlaylist();
        closeVoicePanel();
        showToast(`🎙 "${title}" added to Spoken Verses`);
      });
    }

    // Playback and removal handling for voice verses
    document.addEventListener('click', function (e) {
      // 1. Play button
      const playBtn = e.target.closest('.btn-track-play');
      if (playBtn) {
        e.preventDefault();
        const trackId = playBtn.getAttribute('data-id');
        const trackUrl = playBtn.getAttribute('data-url');

        if (activeVoiceTrackId === trackId) {
          // Pause current track
          activeVoiceTrackId = null;
          if (globalVoiceAudio) globalVoiceAudio.pause();
          renderVoicePlaylist();
          showToast('Paused spoken verse');
        } else {
          // Play selected track
          activeVoiceTrackId = trackId;
          renderVoicePlaylist();
          if (trackUrl && globalVoiceAudio) {
            globalVoiceAudio.src = trackUrl;
            globalVoiceAudio.play().catch(err => {
              console.warn('Playback error:', err);
              showToast('Playing spoken verse · Audio stream active');
            });
          } else {
            showToast('Playing spoken verse · Ambient cello resonance');
          }
        }
        return;
      }

      // 2. Remove voice track button
      const removeTrackBtn = e.target.closest('.btn-remove-voice-track');
      if (removeTrackBtn) {
        e.preventDefault();
        const trackId = removeTrackBtn.getAttribute('data-id');
        const trackTitle = removeTrackBtn.getAttribute('data-title') || 'Voice Verse';
        if (!trackId) return;

        if (confirm(`Remove "${trackTitle}" from voice verses?`)) {
          if (activeVoiceTrackId === trackId && globalVoiceAudio) {
            globalVoiceAudio.pause();
            activeVoiceTrackId = null;
          }
          const tracks = getStoredVoiceTracks();
          const filtered = tracks.filter(t => t.id !== trackId);
          saveStoredVoiceTracks(filtered);
          renderVoicePlaylist();
          showToast(`❧ "${trackTitle}" removed from spoken verses`);
        }
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
