import { initOnce } from '../core/utils.js';

function initNavbar() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar || !initOnce(navbar, 'navbar')) return;

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navbar.querySelectorAll('[data-nav-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.navPage === currentPage);
  });

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
export { initNavbar };
