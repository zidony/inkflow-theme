/**
 * Inkflow Lightbox component.
 *
 * A generic, CMS-agnostic image lightbox driven by declarative triggers and a
 * small programmatic API:
 *
 *   [data-lightbox-url]     click to preview a real image
 *   [data-lightbox-title]   optional caption/title for the trigger
 *   [data-lightbox-key]     demo mode: looks up a gradient/icon placeholder in
 *                           the data supplied via setLightboxData()
 *
 * DOM contract (unchanged from v3.3.x so existing pages/CMS templates keep
 * working): `#lightbox` + `.active` class + `#lbImg` / `#lbCaption` /
 * `.lb-close` / `[data-lightbox-close]` / `[data-close-lightbox]` (legacy).
 *
 * Emits `inkflow:lightbox-open` / `inkflow:lightbox-close`.
 */
import { initOnce, trapFocus } from '../core/utils.js';
import { InkflowEvents, emit } from '../core/events.js';

let lightboxLastFocused = null;
let lightboxDemoData = null;

function lightboxElement() {
  return document.getElementById('lightbox');
}

/**
 * Register demo placeholder data for `data-lightbox-key` triggers. Kept out of
 * the generic component so the theme ships no hard-coded gallery content; the
 * demo page module calls this with its own showcase data.
 * @param {Object} data { key: { icon, bg, caption } }
 */
export function setLightboxData(data) {
  lightboxDemoData = data && typeof data === 'object' ? data : null;
}

function getSafeBootstrapIcon(icon) {
  return /^bi-[a-z0-9-]+$/i.test(icon || '') ? icon : 'bi-image';
}

function openDemoPlaceholder(imgEl, capEl, key, title) {
  const data = (lightboxDemoData && lightboxDemoData[key]) || {};
  if (imgEl) {
    imgEl.replaceChildren();
    imgEl.style.setProperty('--lightbox-bg', data.bg || 'linear-gradient(135deg,#0a1a10,#1a5c2a)');
    const icon = document.createElement('i');
    icon.className = `bi ${getSafeBootstrapIcon(data.icon)} u-lightbox-active-icon`;
    icon.setAttribute('aria-hidden', 'true');
    imgEl.appendChild(icon);
  }
  if (capEl) capEl.textContent = title || data.caption || '';
}

/**
 * Open the lightbox with a real image URL, or a demo placeholder when `url`
 * is falsy and a `key` is given.
 * @param {string} [url] Image URL (http/https; protocol-checked).
 * @param {Object} [options] { title, key }
 * @returns {boolean} true when the lightbox opened.
 */
export function openLightbox(url, options = {}) {
  const lb = lightboxElement();
  if (!lb) return false;

  let safeUrl = null;
  if (url) {
    try {
      const parsed = new URL(String(url), window.location.origin);
      if (['http:', 'https:'].includes(parsed.protocol)) safeUrl = parsed.href;
    } catch (err) {
      safeUrl = null;
    }
  }

  lightboxLastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const imgEl = document.getElementById('lbImg');
  const capEl = document.getElementById('lbCaption');

  if (safeUrl) {
    if (imgEl) {
      imgEl.replaceChildren();
      imgEl.style.removeProperty('--lightbox-bg');
      const img = document.createElement('img');
      img.src = safeUrl;
      img.alt = options.title || '';
      img.className = 'lb-image';
      img.setAttribute('loading', 'lazy');
      imgEl.appendChild(img);
    }
    if (capEl) capEl.textContent = options.title || '';
  } else {
    openDemoPlaceholder(imgEl, capEl, options.key || '', options.title);
  }

  lb.classList.add('active');
  lb.removeAttribute('inert');
  lb.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-scroll-locked');
  lb.querySelector('.lb-close')?.focus();
  emit(InkflowEvents.LIGHTBOX_OPEN, { url: safeUrl, title: options.title || '' });
  return true;
}

/**
 * Close the lightbox and restore focus to the previously focused trigger.
 * @returns {boolean} true when the lightbox was active and got closed.
 */
export function closeLightbox() {
  const lb = lightboxElement();
  if (!lb) return false;
  const wasActive = lb.classList.contains('active');

  lb.classList.remove('active');
  lb.setAttribute('aria-hidden', 'true');
  lb.setAttribute('inert', '');
  document.body.classList.remove('is-scroll-locked');

  if (wasActive && lightboxLastFocused?.isConnected) lightboxLastFocused.focus();
  if (wasActive) emit(InkflowEvents.LIGHTBOX_CLOSE);
  return true;
}

/**
 * Initialize the lightbox component: binds delegated triggers and focus trap.
 * `data-lightbox-key` triggers only respond when demo data has been registered
 * via setLightboxData() (the generic component stays CMS-agnostic).
 */
export function initLightbox() {
  const lb = lightboxElement();
  if (!lb || !initOnce(lb, 'lightbox')) return;

  document.addEventListener('click', (e) => {
    const urlTrigger = e.target.closest('[data-lightbox-url]');
    if (urlTrigger) {
      e.preventDefault();
      openLightbox(urlTrigger.dataset.lightboxUrl, { title: urlTrigger.dataset.lightboxTitle || '' });
      return;
    }

    const keyTrigger = e.target.closest('[data-lightbox-key]');
    if (keyTrigger && lightboxDemoData) {
      e.preventDefault();
      openLightbox(null, { key: keyTrigger.dataset.lightboxKey, title: keyTrigger.dataset.lightboxTitle || '' });
      return;
    }

    // Close only on backdrop click or an explicit close button. Note that
    // `#lightbox` itself carries data-lightbox-close (legacy markup), so a
    // bare closest() match would close on every inner button click.
    if (e.target === lb || e.target.closest('.lb-close')) {
      closeLightbox();
    }
  });

  lb.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('active')) return;
    trapFocus(lb, e);
  });
}

export const lightboxApi = {
  open: openLightbox,
  close: closeLightbox,
  setData: setLightboxData,
};
