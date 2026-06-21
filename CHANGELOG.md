# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
