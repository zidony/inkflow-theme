import { initOnce } from '../core/utils.js';

function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay || !initOnce(overlay, 'search')) return;

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
  overlay.classList.add('active');
  document.body.classList.add('is-scroll-locked');
  const input = overlay.querySelector('input[type="text"]');
  if (input) setTimeout(() => input.focus(), 100);
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.classList.remove('is-scroll-locked');
}
export { closeSearch, initSearch, openSearch };
