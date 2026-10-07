# Audrita — The Quiet Garden

A quiet, literary digital garden for Audrita Mukherjee. A private-first space for poetry, reflections, fragments, and thoughts — designed to grow slowly and become richer over time.

---

## What this is

This is Audrita's personal writing website. It is not a blog, not a portfolio, and not a content platform. It is a literary home — a place to write, to notice how writing changes, and eventually, to share what feels ready.

The site is designed private-first. The first fifty writings are primarily for Audrita herself.

---

## Tech Stack

- **HTML** — semantic, accessible, hand-authored
- **CSS** — vanilla, token-based design system (no frameworks)
- **JavaScript** — minimal, vanilla (no libraries)
- **Hosting** — Vercel (static deployment)
- **Fonts** — Cormorant Garamond (serif), Inter (sans), Noto Serif Bengali

No database. No CMS. No build step required. Content lives as HTML files.

---

## How to run locally

Open `index.html` in any browser. For proper URL handling:

```bash
# Using Python (built into macOS/Linux)
python3 -m http.server 8000

# Using Node.js (if installed)
npx serve .

# Then open http://localhost:8000
```

---

## How to add a new writing

1. Create a new file in `writings/` following the naming pattern:
   `writings/title-in-lowercase-with-hyphens.html`

2. Copy the structure from an existing writing file (e.g. `writings/the-river-knows.html`)

3. Fill in:
   - `<title>` tag
   - `<h1>` — the writing title
   - Writing type (Poem / Reflection / Fragment / Essay / Letter / Journal / Note / Draft)
   - Date in `datetime="YYYY-MM-DD"` format
   - Language (English / Bengali / Mixed)
   - Tags
   - The writing itself inside `.poem-body` or `.prose-body`
   - Location note

4. Add the entry to `writings.html` in the correct date order

5. Update the counter (e.g. `06 / 50`) in `writings.html` and `index.html`

6. Update `prev/next` navigation links in the adjacent writing files

---

## Writing frontmatter convention

Each writing file should begin with an HTML comment describing its metadata:

```html
<!--
  title: "The River Knows"
  date: 2026-10-07
  type: poem
  language: English
  status: private
  tags: nature, silence, becoming
  location: Bengaluru
-->
```

**Status values:**
- `private` — not indexed, not shared. Default for all early writings.
- `unlisted` — accessible via direct link, not listed publicly.
- `public` — listed, shareable, index-allowed. Update `robots.txt` when set.

---

## How to add a Bengali writing

Use the class `text-bengali` on any element, or add `lang="bn"` to the containing element:

```html
<p class="poem-body text-bengali" lang="bn">
  বৃষ্টি আসার আগেই<br />
  আমি প্রস্তুত ছিলাম না।
</p>
```

The Noto Serif Bengali font is already loaded.

---

## For a mixed-language writing

```html
<div class="poem-body">
  <p>The rain arrived before I was ready.<br />
  <span class="text-bengali" lang="bn">বৃষ্টি আসার আগেই আমি প্রস্তুত ছিলাম না।</span>
  </p>
</div>
```

---

## How to change colours / fonts

All design values live in `css/tokens.css`. Open that file to change:

- **Colours** — light mode in `:root {}`, dark mode in `[data-theme="dark"] {}`
- **Fonts** — `--font-serif`, `--font-sans`, `--font-bengali`
- **Spacing** — `--space-*` variables
- **Typography sizes** — `--text-*` variables

Never scatter values across individual CSS files. Change tokens only.

---

## How visibility works

Currently the site is **private-first**:

- `robots.txt` disallows crawlers from `/writings/` and `/garden.html`
- Writing pages have `<meta name="robots" content="noindex, nofollow" />`
- No public sitemap is generated

**To make a writing public:**
1. Remove the `noindex` meta tag from that writing's `<head>`
2. Change the HTML comment status to `public`
3. Add the URL to a sitemap if desired
4. Remove that path from `robots.txt` Disallow

**To make the entire site public (later phase):**
1. Update `robots.txt` to `Allow: /`
2. Remove `noindex` from pages you want indexed
3. Create `sitemap.xml`
4. Add proper OpenGraph images

---

## Where images live

Put any images in `/public/images/`. Reference them as `/public/images/filename.jpg`.

Prefer: nature photographs, Audrita's own images, quiet textures.
Avoid: generic stock, large hero images, decorative illustrations.

---

## Where site copy lives

All editable site copy is in the HTML files directly:
- Hero statement: `index.html` — inside `.hero-heading`
- Hero sub-text: `index.html` — inside `.hero-sub`
- Footer tagline: every page — inside `.footer-tagline`
- Closing line: `index.html` — inside `.closing-line`
- About text: `about.html` — inside `.about-body`, `.about-subjects`, `.about-belief`
- Currently section: `about.html` — inside `.currently-grid`

---

## How to deploy to Vercel

**First time:**
1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Framework: **Other** (or leave as Static)
4. No build command needed
5. Output directory: leave blank (root)
6. Deploy

**After that:**
Every `git push` to `main` will auto-deploy.

`vercel.json` is already configured with:
- Clean URLs (no `.html` in the browser address bar)
- Security headers
- CSS/JS caching
- Smart redirects

---

## The First Garden — 01 / 50

The first fifty writings are Audrita's private practice. The counter on the homepage and writings page tracks this progress. Update it manually as writings are added.

The purpose of the first fifty is to observe:
- How vocabulary changes
- How themes evolve
- What subjects return
- What kind of writer is emerging

---

## Writing types supported

`poem` · `reflection` · `essay` · `fragment` · `letter` · `journal` · `note` · `draft` · `translation`

Use the `data-type` attribute on writing list items for filtering.

---

## Design philosophy (one line)

> The typography, spacing, and writing hierarchy carry the experience.  
> Decoration is allowed only where it serves the writing.

---

*Made slowly. Written honestly. Kept here.*
