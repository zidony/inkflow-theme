# InkFlow Theme

> A modern frontend theme template tailored for independent blogs, fully embracing Vite engineering, out-of-the-box ready.

![Version](https://img.shields.io/badge/version-3.2.1-green)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-7952b3)
![Bootstrap Icons](https://img.shields.io/badge/Bootstrap%20Icons-1.13.1-7952b3)
![License](https://img.shields.io/badge/license-CC%20BY%204.0-blue)

**English README** | [中文说明书](README.md)

---

## 🌟 Live Demo

* 🌐 **InkFlow Theme Demo:** [https://zidony.github.io/inkflow-theme](https://zidony.github.io/inkflow-theme)
* ⚙️ **InkFlow Admin Demo:** [https://zidony.github.io/inkflow-admin](https://zidony.github.io/inkflow-admin)

---

## ✨ Core Philosophy (v3.2 Production Engineering Architecture)

INKFLOW uses "flowing ink" as its visual metaphor, pursuing a **content-first, restrained yet refined** design language. The primary color is a deep forest green (`#0a6640`), paired with the Playfair Display serif font for headings and DM Sans sans-serif for body text, striking a balance between technical precision and humanistic elegance.

Starting from v3.0, Inkflow has been fully upgraded to a modern frontend project powered by Vite:
- **Production-Ready Engineering**: Driven by Vite, featuring instant Hot Module Replacement (HMR) and highly optimized production builds.
- **Modern Architecture**: Deeply componentized source code utilizing BEM methodology combined with CSS Variables.
- **Automated Delivery**: Execute `npm run release` to automatically extract a clean, commercial-ready release package.
- **Cloud Deployment**: Built-in GitHub Actions for zero-configuration, one-click deployments to GitHub Pages.

---

## 📁 Directory Structure

```
inkflow-theme/
├── index.html             # Blog Home
├── post-list.html         # Post List
├── post-show.html         # Post Details
├── category-list.html     # Categories
├── tag-list.html          # Tags
├── archive-list.html      # Archives
├── album-list.html        # Albums
├── link-list.html         # Blogroll / Links
├── profile.html           # User Profile
├── login.html             # Login/Register
├── src/                   # (v3.0 New) Modern modular source directory
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css   # Main stylesheet entry
│   │   │   ├── base/      # Design tokens, Bootstrap overrides, typography
│   │   │   ├── components/# BEM component styles
│   │   │   └── pages/     # Page-level styles
│   │   └── js/
│   │       ├── inkflow.js # Modern ES Module script entry
│   │       ├── core/      # Global primitives
│   │       ├── components/# Reusable component behavior
│   │       └── pages/     # Page-level behavior
│   └── partials/          # Shared head/navbar/footer/search/scripts fragments
├── dist/                  # (v3.0 New) Production build output (for deployment)
└── vite.config.mjs        # Vite engineering configuration
```

---

## 🛠 Tech Stack

| Dependency | Version | Purpose |
|------------|---------|---------|
| [Vite](https://vitejs.dev/) | 8.0.x | Underlying build tool |
| [Bootstrap](https://getbootstrap.com/) | 5.3.8 | Responsive grid, base components |
| [Bootstrap Icons](https://icons.getbootstrap.com/) | 1.13.1 | Sitewide iconography |
| [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) | Google Fonts | Heading font |
| [DM Sans](https://fonts.google.com/specimen/DM+Sans) | Google Fonts | Body font |
| [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | Google Fonts | Code font |

---

## 🎨 Design System

### CSS Variables (Design Tokens)

From v3.0, all theme configurations are centralized in `src/assets/css/base/variables.css`, drastically reducing maintenance costs:

```css
/* Primary Colors */
--ink-primary:     #0a6640   /* Forest Green (Light Mode) */
--ink-accent:      #00c98d   /* Fluorescent Green (Highlight/Buttons) */

/* Typography */
--font-display:    'Playfair Display', serif
--font-body:       'DM Sans', sans-serif
--font-mono:       'JetBrains Mono', monospace

/* Border Radius */
--radius-sm:  6px
--radius-md:  12px
--radius-lg:  20px
--radius-xl:  32px
```

### Light/Dark Dual Themes

Toggle between themes via `<html data-bs-theme="light|dark">`. All color variables automatically adapt. The moon icon button on the right side of the navbar is driven by `initTheme()`, with theme preferences persistently stored in `localStorage`.

---

## 📄 Page Overview & Core Highlights

### index.html — Blog Home
The definitive landing page, showcasing the blog's content matrix and brand image:
- **Immersive Hero Banner** — Full-screen gradient background + typewriter slogan + post/read count badges, with a scroll indicator guiding users deeper.
- **Category Card Section** — 6 large gradient category cards that float on hover displaying post counts, clickable to corresponding categories.
- **Latest Posts** — Grid/List dual view toggle, each card featuring a cover placeholder, category tag, reading time, and author avatar.
- **Featured Quote Area** — Full-width dark card displaying the blogger's motto or selected text.
- **Deep Reading Sidebar** — Trending post leaderboard (numbered) + Newsletter subscription form + popular tag cloud.
- **Reading Progress Bar** — A thin line at the top displays real-time page reading progress as you scroll.
- **Global Search Overlay** — Triggered by keyboard shortcuts or the search button, supporting quick fill of popular search terms.

### post-list.html — Post List
The core page for content discovery and browsing, rich with interactive features:
- **Filter Toolbar** — Real-time keyword search input + Category Tab quick filtering + Sort dropdown (Latest/Hottest/Longest).
- **Grid/List View Toggle** — One-click toggle between grid cards and compact lists via icon buttons, with state saved in real-time.
- **Post Cards** — Cover color block + category badge + title + two-line abstract + meta info (author avatar/date/read time/views).
- **Sticky Right Sidebar** — Trending posts list (with views) + popular tags + quick year jump for archives.
- **Pagination** — Standard pagination component with page numbers and prev/next navigation.

### post-show.html — Post Details
The most feature-complete page in the theme:
- **Article Hero Cover** — Full-width gradient background + breadcrumbs + category tag + title + meta info + tag list.
- **Floating Action Bar (Left)** — Like (with counter) / Bookmark / Comment anchor / Search, sticky on scroll.
- **Sticky TOC (Right)** — Table of Contents automatically highlighting the currently read section, smooth scrolling on click.
- **Content Overflow Protection** — Auto word-wrap for long URLs, max-width constraints for images/videos/iframes, horizontal scrolling for wide tables and code blocks.
- **Code Blocks** — Dark theme + language tags + one-click copy button.
- **Callout Alerts** — Information (Blue) / Warning (Yellow) / Tip (Green) styles.
- **Reaction Bar** — End-of-article like/bookmark interaction area + social share buttons.
- **Author Card** — Avatar + bio + social buttons.
- **Prev/Next Navigation** — Two-column layout displaying previous/next post titles and cover colors.
- **Related Posts** — Three-column recommended post cards.
- **Comments Section** — Comment submission form + comment list (featuring a special author reply badge).

### category-list.html — Categories
- **Category Hero Cards** — Large gradient card for each category displaying name, description, post count, highlighted on hover.
- **Real-time Search** — Input field instantly filters category cards.
- **Standard Category Item** — Compact list layout featuring icon + name + post count + latest post title.

### tag-list.html — Tags
- **Statistics Banner** — Three key metrics: total tags, total posts, and new additions this month.
- **Colorful Word Cloud** — 24 tags dynamically rendered in different colors and font sizes (size correlates with popularity).
- **Three Sorting Modes** — Switch between Popularity, Alphabetical, and Recent, with animated transitions.
- **Real-time Search Filter** — Instantly filter tags in the word cloud as you type.
- **Grouped Tag List** — Tags grouped by technical direction, each group displaying tags and post counts.

### archive-list.html — Archives
- **Activity Heatmap** — GitHub Contributions-style heatmap displaying posting frequency by week/day, with hover tooltips for specific dates and counts.
- **Year Toggle** — Top tab buttons to switch heatmap data across different years.
- **Timeline** — Monthly grouped post timeline, each entry containing date, category tag, and reading time.

### album-list.html — Albums
- **Large Hero Album Card** — Features curated album covers above the fold with gradient overlays, titles, and photo counts.
- **Category Filters** — Tab buttons to filter albums by topic (Travel/Tech/Life/City).
- **Photo Masonry Grid** — Uneven masonry layout displaying photo thumbnails.
- **Lightbox Fullscreen Preview** — Click any photo to enter a fullscreen lightbox supporting left/right navigation, download, share, and ESC to close.

### link-list.html — Blogroll / Links
- **Featured Links Card** — Top area displaying 3 featured link cards, with a colored animated progress bar at the bottom.
- **Categorized Display** — Links grouped by "Tech Blogs", "Design Inspiration", "Useful Tools", etc., rendered in grid layouts.
- **Application Form** — Expandable/collapsible application card with inputs for site name, URL, description, and logo.
- **One-Click Copy Site Info** — Card displaying your site info with a convenient button to copy all fields at once.
- **Sidebar Statistics** — Digital dashboard for total links, new today, and pending review.

### profile.html — User Profile
- **Hero Profile Card** — Gradient background + editable avatar + metrics overview (posts/reads/likes).
- **Writing Streak** — Small card showing consecutive writing days and a 21-day activity bar chart.
- **Left Anchor Navigation** — Sticky sidebar to jump to Basic Info/Security/Notification/Danger Zone blocks.
- **Basic Info Editing** — View/edit toggle states, including avatar, nickname, email (with verified badge), bio, and personal website.
- **Security** — Password change + Two-Factor Authentication switch.
- **Notification Preferences** — Checkboxes for new posts/replies/newsletters driving color changes.
- **Danger Zone** — Red alert area containing the account deletion button, requiring secondary confirmation.

### login.html — Login / Register
- **Split Layout** — Left brand panel + right form area, gracefully degrading to a single column on mobile.
- **Login / Register Tabs** — Custom tab switching with smooth animations.
- **Social Login** — Google OAuth + GitHub OAuth buttons.
- **Password Visibility Toggle** — Eye icon inside the input field to toggle between clear text and masked password.

---

## 🚀 Quick Start (Vite Engineering)

Starting from v3.0, the project fully embraces modern engineering. Please use Vite to start the development server:

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server (with HMR support)
npm run dev
```

### Production Build & Automated Release

```bash
# Build optimized production code (Outputs highly compressed CSS/JS to dist/)
npm run build

# Static quality scan: blocks inline style/event, duplicate class, mojibake, custom window globals, etc.
npm run quality

# Full pre-release check: ESLint + static quality scan + production build
npm run check

# One-click automated release (Generates a clean zip archive in root, filtering out source code)
npm run release
```

### Deploy to Static Platforms

Because `vite.config.mjs` is configured with `base: './'`, you can directly host the generated `dist/` directory on any static platform (GitHub Pages / Vercel / Netlify).
**Highly Recommended:** `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, and `.github/workflows/release.yml` are pre-configured. Pull requests and pushes run `npm run check` plus `npm audit`, and deployment/release jobs pass through the same quality gate first.

---

## 🔧 JS Module Instructions

The frontend entry is `src/assets/js/inkflow.js`, with modules split by responsibility into `core`, `components`, and `pages`:

| Directory | Description |
|-----------|-------------|
| `core/` | Theme switching, scroll animation, shared utilities, keyboard shortcuts, clipboard fallback, and other foundation behavior |
| `components/` | Cross-page components such as navbar, search overlay, and user auth state |
| `pages/` | Page-level interactions for archive, album, post detail, profile, login, tag cloud, and links pages |

---

## 📝 Customization Guide

### Change Brand Colors

Edit the CSS variables at the top of `src/assets/css/base/variables.css`:

```css
:root {
  --ink-primary-rgb: 10, 102, 64;   /* Adjust Primary RGB value */
  --ink-accent:      #00c98d;        /* Adjust Accent Color */
}
```

### Replace Fonts

Modify the Google Fonts link in the `<head>` of HTML files, and update variables in `src/assets/css/base/variables.css`:

```css
--font-display: 'Your Heading Font', serif;
--font-body:    'Your Body Font', sans-serif;
```

---

## 📋 Version History

| Version | Key Updates |
|---------|-------------|
| **v3.2.1** | **Production Quality Patch**: Fixed module-scope runtime errors in login and search shortcuts; normalized shared partial usage; migrated page-level inline handlers into modular JS; restored corrupted Chinese text on the links page; upgraded Vite to 8.0.16 with a clean npm audit; enabled production minification and added `npm run check` for pre-release validation. |
| **v3.2.0** | **Zero-Dependency Architecture & Componentization Milestone**: Completely removed Python packaging dependencies by writing a custom Node.js native zero-dependency ZIP build script; finalized the global componentization and style unification of the `.ink-input` and `.ink-btn` systems; optimized the automated release pipeline. |
| **v3.1.0** | **Deep Layering & Single-Bundle Build Strategy**: Deeply reorganized all CSS files and directories using standard ITCSS architecture; modularized JS responsibilities (`core`, `components`, `pages`); rewrote Vite config and internal dynamic imports to bundle all frontend assets into a single `inkflow.js` and `inkflow.css` (zero-config plug-and-play integration); disabled production minification and introduced Prettier for auto-formatting. |
| **v3.0.0** | **Leap-forward Frontend Engineering Refactor**: Introduced Vite foundation and development HMR; deeply modularized the 120KB monolithic CSS into multiple components under `src/css`; rewrote entry points and build flows; added Python-based automated release script and GitHub Actions automated deployment pipelines. Fully aligned with international commercial theme architectures. |
| **v2.5** | Extreme performance & architecture optimization: eliminated FOIT, established a global Z-Index variable system, configured GPU hardware acceleration for animation components, normalized `profile-card` HTML tree structure. |
| **v2.4** | Deep CSS architecture refactor: introduced Logical Grouping formatting for 2400 lines of CSS, completely removed dead code, refactored Chinese comments to international standard English comments, refactored dynamic tag cloud to integrate CSS variables. |
| **v2.3** | Refactored the global `.u-tint-*` dual-track color component system, completely decoupled inline dynamic color contexts. |
| **v2.2** | WCAG 2.1 AA alignment, refactored TOC highlight to IntersectionObserver, optimized Home Parallax GPU hardware acceleration, removed document.write() and perfected A11y & JSON-LD SEO semantics. |
| **v2.1** | Unified avatar component system (.ink-avatar), consolidated 11 legacy classes. |
| **v2.0** | Extracted global inline styles to components (13 new CSS component classes), fixed FOIT flicker, HTML cleanup across 7 pages. |
| **v1.9** | Renamed static files (blog-theme→index, post-detail→post-show), restructured assets directory, upgraded to Bootstrap 5.3.8, added article-body overflow protection. |
| **v1.8** | Fixed Login Tab toggle, social-btn centering, article body overflow CSS. |
| **v1.7** | Fixed navbar-collapse PC width background bug, made mobile avatar dropdown clickable, consolidated redundant CSS classes. |
| **v1.6** | Restored search button, changed TFA toggle to checkbox implementation. |
| **v1.5** | Standardized navbar/footer sitewide, replaced massive inline styles with CSS classes on profile page. |
| **v1.4** | CSS deduplication, fixed JS viewToggle/toggleApplyForm bugs, restored colorful tag cloud. |
| **v1.3** | Extracted page-specific JS/CSS, added profile page, normalized CSS Design Tokens. |
| **v1.2** | 10-page full refactor, externalized inkflow.css/js, Bootstrap variable overrides, class-driven Toasts. |
| **v1.1** | Feature completion and minor fixes. |
| **v1.0** | Initial version, single-file prototype implementation. |

---

## 📄 License

This theme is released under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license. You are free to use, modify, and distribute it, provided that proper attribution is maintained.

---

*INKFLOW Theme · Built with Vite & Bootstrap 5.3.8*
