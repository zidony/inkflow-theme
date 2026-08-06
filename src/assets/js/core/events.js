/**
 * Inkflow CustomEvent surface.
 *
 * The theme never imports CMS code; instead it emits `inkflow:*` CustomEvents
 * that a CMS adapter layer (or a demo module) may listen to. This keeps the
 * theme generic while still offering a stable integration contract.
 *
 * Example (CMS adapter):
 *   import { on } from './events.js';
 *   on(InkflowEvents.LIKE_TOGGLE, (e) => {
 *     // e.detail = { button, countEl } — issue the real API call here.
 *   });
 */
export const InkflowEvents = {
  THEME_CHANGE: 'inkflow:theme-change',
  SEARCH_OPEN: 'inkflow:search-open',
  SEARCH_CLOSE: 'inkflow:search-close',
  LIGHTBOX_OPEN: 'inkflow:lightbox-open',
  LIGHTBOX_CLOSE: 'inkflow:lightbox-close',
  TOAST: 'inkflow:toast',
  LIKE_TOGGLE: 'inkflow:like-toggle',
  AVATAR_CHANGE: 'inkflow:avatar-change',
  AUTH_CHANGE: 'inkflow:auth-change',
  INIT: 'inkflow:init',
  DESTROY: 'inkflow:destroy',
};

/**
 * Dispatch an inkflow event on the document (bubbles, cancelable via listeners
 * calling preventDefault is NOT supported — detail is informational only).
 * @param {string} name  Event name, e.g. InkflowEvents.SEARCH_OPEN.
 * @param {*}      detail Optional payload delivered on `event.detail`.
 * @returns {boolean} `false` if a listener called preventDefault(), else true.
 */
export function emit(name, detail = null) {
  return document.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
}

/** Subscribe to an inkflow event on the document. */
export function on(name, handler, options) {
  document.addEventListener(name, handler, options);
}

/** Unsubscribe from an inkflow event. */
export function off(name, handler) {
  document.removeEventListener(name, handler);
}
