function initSearch() {
  const overlay = document.getElementById('searchOverlay');
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
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSearch();
    });
  }
}

function openSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  const input = overlay.querySelector('input[type="text"]');
  if (input) setTimeout(() => input.focus(), 100);
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}
export { closeSearch, initSearch, openSearch };

// Expose to global scope for inline HTML handlers
window.openSearch = openSearch;
window.closeSearch = closeSearch;
