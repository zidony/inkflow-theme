# Inkflow JS Architecture & Integration Guide

This document describes the JavaScript architecture of inkflow-theme, the
public `Inkflow` API, the declarative `data-*` contract and the `inkflow:*`
CustomEvent surface. It is the reference for CMS integrations (e.g. YTCMS) and
for anyone extending the theme.

---

## 1. Architecture & responsibilities

The theme is **CMS-agnostic**. It implements generic presentation and UI
interaction only; business logic (AJAX, CSRF, CMS endpoints, session state)
must live in the CMS or an adapter layer.

```
src/assets/js/
├── inkflow.js            entry: registers components, exposes Inkflow, boots
├── vendor.js             tree-shaken Bootstrap Modal (globalThis.bootstrap)
├── core/
│   ├── bootstrap.js      window.Inkflow global API assembly
│   ├── registry.js       component lifecycle (register/init/destroy)
│   ├── events.js         inkflow:* CustomEvent constants + emit/on/off
│   ├── utils.js          copyText / escapeCssString / trapFocus / initOnce / …
│   ├── global.js         back-to-top, tag pills, view toggle, keyboard, demo actions
│   ├── theme.js          light/dark theme toggle + persistence
│   └── animations.js     scroll reveal + counters (reduced-motion aware)
├── components/
│   ├── toast.js          themed toast + window.ink_toast legacy alias
│   ├── lightbox.js       generic image lightbox (real images or demo placeholders)
│   ├── search.js         search overlay (pure UI; submission via form action)
│   ├── tag-cloud.js      data-driven tag cloud
│   ├── category-filter.js generic data-filter filtering
│   ├── navbar.js         navbar collapse + active nav state
│   └── auth.js           demo-only auth UI state (CMS adapters take over via events)
└── pages/                per-page modules, loaded via dynamic import() on demand
```

### Build output

`npm run build` produces stable, well-named chunks in `dist/assets/js/`:

| File | Content | Loaded |
|---|---|---|
| `rolldown-runtime.js` | Rolldown shared runtime + modulepreload helpers | every page (via module graph) |
| `inkflow-vendor.js` | tree-shaken Bootstrap (Modal) | every page |
| `inkflow.js` | theme core: registry/events/layout/common components | every page |
| `events.js` / `utils.js` | shared chunks for page modules | as needed |
| `album.js` `archive.js` `links.js` `login.js` `parallax.js` `post.js` `profile.js` | page-specific modules | only the matching page |

**CMS integration**: reference only `inkflow.js` as a module script. Page
chunks are fetched automatically by the module graph — no per-page script tags
are needed in CMS templates.

---

## 2. `window.Inkflow` global API

| Member | Signature | Description |
|---|---|---|
| `version` | `string` | theme version, read from `package.json` |
| `init` | `init(root?) => Promise<Array>` | (re)initialize all registered auto components; pass a container to scan dynamic DOM |
| `initComponent` | `initComponent(name, root?) => Promise<boolean>` | initialize one component |
| `destroy` | `destroy(name, root?) => boolean` | teardown a component that opts in (via registry `destroy` hook) |
| `components.toast` | `{ show(message, type?) }` | show a themed toast |
| `components.lightbox` | `{ open(url, opts?), close(), setData(data) }` | image lightbox control |
| `components.tagCloud` | `{ render(list, query?), sort(type) }` | render/filter the tag cloud from data |
| `components.categoryFilter` | `{ initScope() }` | wire `[data-filter-scope]` blocks |
| `events` | `{ on(name, fn), off(name, fn), emit(name, detail) }` | CustomEvent helpers (see §4) |

Example:

```js
window.Inkflow.components.toast.show('Saved', 'success');
window.Inkflow.components.lightbox.open('https://example.com/photo.jpg', { title: 'Caption' });
window.Inkflow.components.tagCloud.render([{ name: 'JavaScript', count: 24 }]);
```

---

## 3. Declarative `data-*` contract

Components initialize automatically when their DOM contract is present. No
inline `on*` attributes are required — everything is delegated.

| Component | Selector / trigger | Contract |
|---|---|---|
| Search | `[data-open-search]` / `[data-close-search]` / `.search-tip` | overlay `#searchOverlay` with `#searchInput`; Ctrl/Cmd+K opens; Esc closes |
| Lightbox | `[data-lightbox-url]` (+ `[data-lightbox-title]`) | opens `#lightbox` with a real image; `#lbImg`/`#lbCaption`/`.lb-close`; `.active` class toggles visibility |
| Lightbox (demo) | `[data-lightbox-key]` | placeholder gradient/icon mode; data registered via `Inkflow.components.lightbox.setData()` |
| Photo hover actions | `.photo-actions` > `.photo-action-btn` (an `<a>`) | unified album/photo card hover layer: zoom link carries `data-lightbox-url`/`data-lightbox-key` (+`data-lightbox-title`) — delegation calls `preventDefault()` and opens the lightbox; the enter link has no handler and bubbles to its own `href` (child page). Buttons are hidden until hover/`focus-within`; keyboard focus reaches them via Tab |
| Lazy photo background (CMS adapter) | `.photo-ph[data-bg="url"]` | adapter observes the cards and swaps `background-image` in when the card is within 300px of the viewport; placeholder tint gradient shows until then and when JS is absent |
| Tag cloud | `#tagCloudInner` + `#inkflow-tagcloud-data` JSON script | renders cloud; `[data-tag-sort]` buttons; `#tagSearch` filters; `#tagResultStatus` announces results |
| Tag cloud (custom source) | `data-tag-cloud-source="some-id"` on `#tagCloudInner` | reads JSON from the given script id instead |
| Category filter | `[data-filter-scope]` > `[data-filter-value]` buttons + `[data-filter-category]` items + `[data-filter-status]` output | mutual-exclusive tabs, `.is-filtered-out` hiding, aria-live count |
| Toast | `[data-toast="message"]` | shows a themed toast on click |
| Theme | `#themeToggle` | toggles `data-bs-theme`, persists to `localStorage['inkflow-theme']` |
| Navbar | `#mainNavbar` / `.navbar-toggler` / `#navMenu` | collapse state, scroll shadow, `[data-nav-page]` active state |
| Back to top | `#backToTop` | shows after 400px scroll |
| View toggle | `#gridBtn` / `#listBtn` | switches `#gridView` / `#listView` |
| Demo actions | `[data-demo-action]` (+ `data-demo-message`) | placeholder feedback toast (demo pages only) |

### Data script pattern (CSP-safe)

Server data must be delivered via JSON script tags (never inline JS):

```html
<script type="application/json" id="inkflow-tagcloud-data">
  [{"name":"JavaScript","count":24,"url":"https://example.com/tags/js","recent":"2025-02-20"}]
</script>
```

---

## 4. `inkflow:*` CustomEvent surface

All events are dispatched on `document` with `bubbles: true`. A listener that
calls `event.preventDefault()` **takes over** the interaction — the theme then
performs no default action. Use `Inkflow.events.on(name, handler)`.

| Event | detail | Default when unhandled |
|---|---|---|
| `inkflow:theme-change` | `{ theme }` | — (informational) |
| `inkflow:search-open` / `inkflow:search-close` | — | — |
| `inkflow:lightbox-open` | `{ url, title }` | — |
| `inkflow:lightbox-close` | — | — |
| `inkflow:toast` | `{ message, type }` | — |
| `inkflow:like-toggle` | `{ button, countEl, liked }` | demo toggle (preview only). CMS: `preventDefault()` and issue the real like API, then update the UI itself |
| `inkflow:avatar-change` | `{ file, input, preview }` | local preview (preview only). CMS: `preventDefault()` and upload the file |
| `inkflow:auth-change` | `{ user }` or `{ user: null }` | — (informational) |
| `inkflow:init` / `inkflow:destroy` | — | — |

Example adapter (YTCMS):

```js
Inkflow.events.on('inkflow:like-toggle', (e) => {
  e.preventDefault();                       // take over
  YtcmsCommon.yt_like_post(button.dataset.postId, (res) => { /* update UI */ });
});
```

---

## 5. CSP compatibility

- No inline event handlers (`onclick=` etc.) anywhere in the theme.
- The only head script is the **external** `inkflow-theme-check.js` (classic,
  synchronous, FOUC prevention) — no `'unsafe-inline'` needed.
- Server data travels in `application/json` script tags, which CSP does not
  execute.
- Text is always rendered via `textContent` / `createElement` — no `innerHTML`.
- URLs passed to the lightbox are protocol-checked (`http:`/`https:`).

---

## 6. Integration checklist for a CMS

1. Reference `inkflow.js` as the only module script (`<script type="module" src="…/js/inkflow.js"></script>`).
2. Copy the whole `dist/assets/js/` directory (inkflow.js + chunks + runtime).
3. Keep the documented DOM contracts (`#searchOverlay`, `#lightbox`, `#themeToggle`, …).
4. Listen to `inkflow:*` events instead of re-implementing interactions.
5. Serve data via JSON script tags; never patch the minified bundle.
6. Serve `inkflow-theme-check.js` from `<head>` for FOUC prevention.
