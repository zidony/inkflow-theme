/**
 * Inkflow Toast component.
 *
 * A single, theme-styled toast implementation replaces the previous ad-hoc
 * `#inkToast` helper and gives CMS adapters a stable hook:
 *
 *   Inkflow.components.toast.show(message, type)   programmatic API
 *   window.ink_toast(message, type)                legacy alias (YTCMS inkflow-layout)
 *   [data-toast="message"] buttons                 declarative trigger
 *
 * Every show emits `inkflow:toast` so adapters can track or replace the visual.
 */
import { InkflowEvents, emit } from '../core/events.js';

const TOAST_DURATION = 2200;
const TOAST_ANIMATION_MS = 300;

/**
 * Show a themed toast notification.
 * @param {string} message Plain-text message (rendered via textContent).
 * @param {('success'|'error')} [type]
 */
export function showToast(message, type = 'success') {
  const existing = document.getElementById('inkToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'inkToast';
  toast.className = `ink-toast ink-toast--${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('ink-toast--visible'));
  emit(InkflowEvents.TOAST, { message, type });

  setTimeout(() => {
    toast.classList.remove('ink-toast--visible');
    setTimeout(() => toast.remove(), TOAST_ANIMATION_MS);
  }, TOAST_DURATION);
}

/**
 * Legacy alias matching the `window.ink_toast(message, type)` convention used
 * by YTCMS's inkflow-layout.js, so existing adapters keep working unchanged
 * after an upgrade. Bootstrap-style types are mapped to the themed ones.
 * @param {string} message
 * @param {string} [type] 'success' | 'danger' | 'error' | ...
 */
export function inkToast(message, type) {
  showToast(message, type === 'danger' || type === 'error' ? 'error' : 'success');
}

/**
 * Bind `[data-toast="message"]` triggers (used by the YTCMS profile page) and
 * install the legacy `window.ink_toast` alias if nothing overrides it yet.
 */
export function initToast() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-toast]');
    if (!trigger) return;
    showToast(trigger.dataset.toast || '', 'success');
  });

  if (typeof globalThis.ink_toast !== 'function') {
    globalThis.ink_toast = inkToast;
  }
}
