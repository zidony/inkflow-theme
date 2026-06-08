import { initOnce } from '../core/utils.js';

let searchLastFocused = null;

function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay || !initOnce(overlay, 'search')) return;

  document.querySelectorAll('[data-open-search]').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'searchOverlay');
  });

  document.querySelectorAll('[data-open-search]').forEach(btn => {
    btn.addEventListener('click', openSearch);
  });
  document.querySelectorAll('[data-close-search]').forEach(btn => {
    btn.addEventListener('click', closeSearch);
  });
  document.querySelectorAll('.search-tip').forEach(tip => {
    tip.addEventListener('click', () => {
      const input = document.getElementById('searchInput');
      if (input) input.value = tip.textContent.trim();
    });
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });
}

function openSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  searchLastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  overlay.classList.add('active');
  overlay.removeAttribute('inert');
  overlay.setAttribute('aria-hidden', 'false');
  document.querySelectorAll('[data-open-search]').forEach(btn => {
    btn.setAttribute('aria-expanded', 'true');
  });
  document.body.classList.add('is-scroll-locked');
  const input = overlay.querySelector('input[type="text"]');
  if (input) setTimeout(() => input.focus(), 100);
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  const wasActive = overlay.classList.contains('active');
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('inert', '');
  document.querySelectorAll('[data-open-search]').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
  });
  document.body.classList.remove('is-scroll-locked');
  if (wasActive && searchLastFocused?.isConnected) searchLastFocused.focus();
}
export { closeSearch, initSearch, openSearch };
