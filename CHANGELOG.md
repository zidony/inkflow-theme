# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
