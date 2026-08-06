/*
 * Self-hosted Bootstrap JS (demo pages; default self-hosted build),
 * tree-shaken to the only component the theme relies on: Modal — consumed by
 * profile.js via feature detection (globalThis.bootstrap?.Modal) with a
 * complete no-Bootstrap fallback.
 *
 * When a host CMS already ships its own Bootstrap bundle (YTCMS loads
 * bootstrap.bundle.min.js in the layout, v5.3.8), bootstrap.Modal is already
 * exposed and this module skips the dynamic import entirely — CMS pages never
 * download the vendor chunk, keeping a single Bootstrap implementation in
 * play. Demo pages (no bundle) load the tree-shaken Modal chunk on demand.
 */
if (!globalThis.bootstrap?.Modal) {
  const { default: Modal } = await import('bootstrap/js/dist/modal');
  globalThis.bootstrap = globalThis.bootstrap || {};
  globalThis.bootstrap.Modal = Modal;
}
