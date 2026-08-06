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
  ERROR: 'inkflow:error',
};

/**
 * Emit a normalized error event so adapters / debuggers can observe failures
 * across components without inspecting internals.
 * @param {string} component Component name (e.g. 'tag-cloud').
 * @param {string} operation Operation that failed (e.g. 'parse-data').
 * @param {*}      error     The original error (message is extracted).
 * @returns {boolean} `false` if a listener called preventDefault().
 */
export function emitError(component, operation, error) {
  return emit(InkflowEvents.ERROR, {
    component,
    operation,
    error: error instanceof Error ? error.message : String(error),
  });
}

/**
 * Dispatch an inkflow event on the document (bubbles, cancelable). Listeners
 * may call preventDefault() to take over an interaction — dispatchEvent then
 * resolves to false, which callers treat as "handled by an adapter".
 * @param {string} name  Event name, e.g. InkflowEvents.LIKE_TOGGLE.
 * @param {*}      detail Optional payload delivered on `event.detail`.
 * @returns {boolean} `false` if a listener called preventDefault(), else true.
 */
export function emit(name, detail = null) {
  return document.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, cancelable: true }));
}

/** Subscribe to an inkflow event on the document. */
export function on(name, handler, options) {
  document.addEventListener(name, handler, options);
}

/** Unsubscribe from an inkflow event. */
export function off(name, handler) {
  document.removeEventListener(name, handler);
}
