import { closeSearch, openSearch } from '../components/search.js';
import { closeLightbox } from '../components/lightbox.js';
import { showToast } from '../components/toast.js';
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

  const setViewMode = (mode) => {
    const isGrid = mode === 'grid';
    gridBtn.classList.toggle('active', isGrid);
    listBtn.classList.toggle('active', !isGrid);
    gridBtn.setAttribute('aria-pressed', String(isGrid));
    listBtn.setAttribute('aria-pressed', String(!isGrid));
    if (gridView) gridView.classList.toggle('d-none', !isGrid);
    if (listView) listView.classList.toggle('d-none', isGrid);
  };

  setViewMode(gridBtn.classList.contains('active') ? 'grid' : 'list');
  gridBtn.addEventListener('click', () => setViewMode('grid'));
  listBtn.addEventListener('click', () => setViewMode('list'));
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

function initDemoActions() {
  if (!document.querySelector('[data-demo-action]') || !initOnce(document.documentElement, 'demoActions')) return;

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-demo-action]');
    if (!trigger) return;
    showToast(trigger.dataset.demoMessage || '该演示功能需要接入后端服务');
  });
}

export { initBackToTop, initTagPills, initViewToggle, initKeyboard, initDemoActions };
