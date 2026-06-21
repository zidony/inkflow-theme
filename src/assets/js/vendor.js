/*
 * Self-hosted Bootstrap JS (default build), tree-shaken to the only component
 * the theme relies on: Modal (account-deletion dialog on the profile page).
 * Navbar, tabs, search overlay, dropdown and lightbox are all hand-rolled
 * vanilla JS, so the full bundle is unnecessary.
 *
 * Exposed on globalThis.bootstrap so existing feature-detection
 * (globalThis.bootstrap?.Modal) keeps working unchanged. The page also has a
 * complete no-Bootstrap fallback, so this import is a progressive enhancement.
 */
import Modal from 'bootstrap/js/dist/modal';

globalThis.bootstrap = globalThis.bootstrap || {};
globalThis.bootstrap.Modal = Modal;
