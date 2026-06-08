import { initOnce } from '../core/utils.js';

function initNavbar() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar || !initOnce(navbar, 'navbar')) return;
  const navToggler = navbar.querySelector('.navbar-toggler');
  const navMenu = navbar.querySelector('#navMenu');

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navbar.querySelectorAll('[data-nav-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.navPage === currentPage);
  });

  function setNavMenuExpanded(expanded) {
    if (!navToggler || !navMenu) return;

    navMenu.classList.toggle('show', expanded);
    navToggler.classList.toggle('collapsed', !expanded);
    navToggler.setAttribute('aria-expanded', String(expanded));
  }

  navToggler?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setNavMenuExpanded(!navMenu?.classList.contains('show'));
  });

  navMenu?.addEventListener('click', (e) => {
    if (e.target.closest('[data-nav-page]')) {
      setNavMenuExpanded(false);
    }
  });

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
export { initNavbar };
