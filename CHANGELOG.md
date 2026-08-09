# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.5.0] - 2026-08-09

### Added
- `photo.html` standalone photo-detail template with breadcrumb navigation,
  lightbox preview, EXIF-style metadata, story, licensing/actions, and previous/next
  photo navigation.
- `pages/photo.css` responsive styles for the photo-detail layout.
- Chromium smoke tests in CI, including album/photo navigation, lightbox behavior,
  concurrent component initialization, dynamic multi-scope filters, and mobile/tablet/desktop layouts.
- Build-manifest self-verification through `manifestHash`, current-HEAD validation,
  and detection of unlisted files in `dist/`.

### Changed
- Component initialization state is now tracked per component and DOM target;
  concurrent `Inkflow.init()` calls share one in-flight promise.
- `Inkflow.init(root)` supports every matching target for components registered
  with `multiple: true`, enabling safe CMS insertion of multiple filter scopes.
- Album list, album detail, and photo detail now form a three-level navigation
  path: album list → album → photo.
- Featured albums, album cards, album photos, and recent photos use the same
  accessible hover/focus action layer with separate preview and detail actions.
- `album.html` and `photo.html` are included in the public sitemap.

### Fixed
- Album-detail preview links no longer reload `album.html`; all Dali demo photos
  now initialize the shared lightbox data correctly.
- `toast` and `keyboard` can both initialize on `body` without one component
  suppressing the other.
- Dynamic category-filter scopes no longer receive duplicate click listeners.
- Removed the obsolete recent-photo overlay markup that rendered the zoom label
  in normal document flow on `album-list.html`.
- Invisible hover action layers no longer block clicks on the underlying photo-detail link.

## [3.4.0] - 2026-08-06

### Added
- `core/registry.js`: component registration table with a `WeakSet` guard against
  double initialization (no `data-initialized` markers in the DOM).
- `core/events.js`: centralized `inkflow:*` CustomEvent constants plus `emit` /
  `on` / `off` helpers; `emit` dispatches cancelable events, so adapters can
  `preventDefault()` to take over an interaction.
- `window.Inkflow` global API: `init` / `initComponent` / `destroy`,
  `components.toast` / `lightbox` / `tagCloud` / `categoryFilter`, `events`,
  `version`. Exposed by `core/bootstrap.js`.
- `components/toast.js`: themed toast component + legacy `window.ink_toast`
  alias (API-compatible drop-in).
- `components/lightbox.js`: generic lightbox — real images via
  `[data-lightbox-url]` or demo placeholders via `[data-lightbox-key]`;
  keeps the `#lightbox.active` DOM contract.
- `components/tag-cloud.js`: tag cloud driven by a `application/json` data
  script (CSP-safe), with `Inkflow.components.tagCloud.render()`.
- `components/category-filter.js`: generic `[data-filter-scope]` filtering
  factory shared by album and links pages.
- Per-page code-splitting: page modules (album/archive/links/login/parallax/
  post/profile) are loaded with dynamic `import()` only when needed; stable
  chunk names (no hashes) keep the build deterministic.
- `inkflow-theme-check.js` moved out of `<head>` into a standalone classic
  script: theme persistence is now fully CSP-compatible (no inline script, no
  `'unsafe-inline'`).
- `docs/inkflow-js-api.md`: public API, `data-*` contract, CustomEvent surface,
  CSP notes and CMS integration checklist.
- `tests/components.spec.mjs`: Playwright DOM tests for the Inkflow API, CSP
  readiness, tag cloud, lightbox, toast, adapter event consumption and the
  category filter.

### Changed
- `inkflow.js` is now a registration entry point; all components declare
  themselves against the registry instead of being imperatively wired.
- Demo-only behaviors (fake login, streak dots, demo like toggling, local
  avatar preview) are isolated behind events: CMS adapters take over by
  listening to `inkflow:like-toggle` / `inkflow:avatar-change` and calling
  `preventDefault()`.
- Build: Bootstrap vendor split into its own `inkflow-vendor.js` chunk; the
  main bundle dropped from ~62 KB to ~23 KB (gzip 7.7 KB).
- Lightbox images are constrained (`max-height: 72vh; object-fit: contain`) so
  oversized CMS images cannot push the close button off-screen.

### Security
- Fixed `events.js` `emit()` not dispatching cancelable CustomEvents, which
  silently broke the adapter takeover contract for `inkflow:like-toggle` and
  `inkflow:avatar-change`.

### Added
- `src/album.html`: new demo album detail page (vite entry; 11 pages total).
- `.photo-actions` / `.photo-action-btn`: unified hover action layer for album
  and photo cards — two round buttons (zoom lightbox via `data-lightbox-key` /
  `data-lightbox-url`, enter child page) fade in on hover / `focus-within`;
  keyboard reachable, `focus-visible` outline provided.
- `scripts/ytcms-integration.mjs`: committed live integration check for the
  YTCMS standard theme (14 UI assertions).
- Lightbox focus-trap regression test: Tab stays inside the lightbox, Escape
  closes it, focus returns to the triggering element.

### Changed
- Photo/album cards now use a plain `<div>` outer container with `<a>` action
  buttons: the previous nested `<button>` inside `<button>`/`<a>` was invalid
  HTML and the parser ejected the action icons outside the card. Zoom links
  keep progressive enhancement (no-JS opens the original image).
- `.photo-ph` renders `background-size: cover` / `center` plus a non-`!important`
  placeholder gradient, so CMS adapters can lazy-load real images via
  `data-bg` + IntersectionObserver.
- Login page vertical centering fix (`flex-start` + `margin: auto`) so tall
  content scrolls instead of being clipped by the `100vh` flex centering bug.
- Album-list cards link into the new album.html detail page; lightbox preview
  opens via the zoom button (preview does not leave the page).
- Demo lightbox prev/next buttons now show placeholder toasts instead of being
  silent.

### Fixed
- Search input border invisible on light surfaces: `ink-input-ghost` →
  `ink-input-gray` (ghost is a dark-background-only variant).
- Stray action buttons left inside album.html by an earlier reparse fix
  (regex truncation) — removed; browser-parse check confirms zero stray nodes.

## [3.3.2] - 2026-06-22

### Changed
- **Font subset optimization**: Removed `latin-ext` character set from all web fonts (DM Sans, Playfair Display, JetBrains Mono), retaining only `latin` subset sufficient for English and Chinese content.
- Reduced font files from 36 to 20 (-16 files, ~100-120 KB savings in total font payload).

### Breaking
- Central and Eastern European language special characters (Polish ą, Czech ř, Vietnamese ư, etc.) are no longer supported. Latin alphabet, digits, and standard punctuation remain fully functional.

## [3.3.1] - 2026-06-22

### Fixed
- Tag pill font-size inheritance issue: removed `font: inherit` from `.tag-pill:is(a, button)` that was overriding the base `font-size` declaration, causing tags to display larger than intended.
- Link application form layout: added `mb-3` spacing to all input fields for proper vertical rhythm.
- Footer link accessibility: added `pointer-events: none` to `.site-footer::before` decorative gradient to prevent it from blocking clicks on nearby links.

### Changed
- Normalized `<head>` tag order across all pages: `<meta charset>` now appears first, and JSON-LD structured data moved to the end, following HTML5 best practices and improving parser performance.
- Consolidated font assets: all `.woff` and `.woff2` files now output to `assets/fonts/` instead of separate `assets/woff/` and `assets/woff2/` directories for better organization.

## [3.3.0] - 2026-06-21

### Added
- Skip-to-content link and `<main id="main-content">` landmarks on every page for keyboard/screen-reader navigation (WCAG 2.4.1).
- Production SEO surface: per-page `canonical`/`og:url`, Open Graph image, Twitter Card, `theme-color`, favicons, apple-touch-icon and web app manifest, all driven from a single `site` config in `vite.config.mjs`.
- Structured data: `WebSite`/`SearchAction` JSON-LD on the home page and `BlogPosting` + `BreadcrumbList` on the article page.
- Build-time `robots.txt` and `sitemap.xml` generation from the same `site` source.
- Dependency-free brand icon generator (`npm run icons`) producing `apple-touch-icon.png`, `og-cover.png` and `favicon.ico`; ships `favicon.svg` and `site.webmanifest`.
- Self-hosted Bootstrap, Bootstrap Icons and web fonts by default (no jsDelivr / Google Fonts requests); opt into CDN delivery with `INKFLOW_CDN=1 npm run build`.
- CSS linting via stylelint (`npm run style:lint` / `style:fix`), wired into `npm run check`.
- New accessibility (`<main>`, skip-link, heading hierarchy) and SEO (head-include, shared tags, JSON-LD) quality gates.
- `CHANGELOG.md`, `SECURITY.md`, and Dependabot configuration.

### Changed
- First paint now honours `prefers-color-scheme` when no theme preference is stored.
- Brand colours are single-sourced from `--ink-*` design tokens; Bootstrap `--bs-*` variables and component overrides reference them, so dark mode follows the tokens consistently.
- Enabled purgecss with a safelist for dynamic classes; production CSS reduced from ~406 KB to ~242 KB (gzip ~61 KB → ~42 KB) before self-hosted vendor CSS.
- Replaced the unmaintained `vite-plugin-purgecss` wrapper with the maintained `purgecss` core run via an inline build plugin, removing bundled-dependency vulnerabilities; `npm audit` is clean at the moderate level.
- Strengthened ESLint rules (`eqeqeq`, `no-var`, `prefer-const`, `no-implicit-globals`, and more).

### Fixed
- Dark mode `--ink-primary-rgb` / `--ink-accent-rgb` now shift correctly (focus-ring colour was previously stuck on the light value in dark mode).
- Removed deprecated CSS (`word-wrap`, redundant `word-break`), duplicate selectors, and empty rulesets.

## [3.2.12] - Prior releases

See the Git history and GitHub Releases for changes up to and including v3.2.12.
