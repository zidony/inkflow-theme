import { closeSearch, openSearch } from '../components/search.js';
import { closeLightbox } from '../pages/album.js';
import { initOnce } from './utils.js';

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn || !initOnce(btn, 'backToTop')) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initTagPills() {
  if (!document.querySelector('.tag-pill') || !initOnce(document.documentElement, 'tagPills')) return;

  document.addEventListener('click', (e) => {
    const pill = e.target.closest('.tag-pill');
    if (!pill) return;
    const group = pill.closest('[class*="flex"]') || pill.parentElement;
    if (group) group.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
}

function initViewToggle() {
  const gridBtn  = document.getElementById('gridBtn');
  const listBtn  = document.getElementById('listBtn');
  const gridView = document.getElementById('gridView');
  const listView = document.getElementById('listView');
  if (!gridBtn || !listBtn || !initOnce(gridBtn, 'viewToggle')) return;

  gridBtn.addEventListener('click', () => {
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
    if (gridView) gridView.classList.remove('d-none');
    if (listView) listView.classList.add('d-none');
  });

  listBtn.addEventListener('click', () => {
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
    if (listView) listView.classList.remove('d-none');
    if (gridView) gridView.classList.add('d-none');
  });
}

function initKeyboard() {
  if (!initOnce(document.documentElement, 'keyboard')) return;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearch();
      closeLightbox();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });
}
export { initBackToTop, initTagPills, initViewToggle, initKeyboard };
