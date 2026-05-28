import './components/utils.js'; // Attach showToast
import { initNavbar } from './components/navbar.js';
import { initThemeToggle } from './components/theme.js';
import { initUserAuth } from './components/auth.js';
import { initSearch } from './components/search.js';
import { initScrollReveal, initCounters } from './components/animations.js';
import { initBackToTop, initTagPills, initViewToggle, initKeyboard } from './components/global.js';

// Static global initialization
const staticModules = [
  { selector: '#mainNavbar', init: initNavbar },
  { selector: '#backToTop', init: initBackToTop },
  { selector: '#themeToggle', init: initThemeToggle },
  { selector: '#navUserWrapper', init: initUserAuth },
  { selector: '#searchOverlay', init: initSearch },
  { selector: '.fade-up', init: initScrollReveal },
  { selector: '[data-count]', init: initCounters },
  { selector: '.tag-pill', init: initTagPills },
  { selector: '#gridBtn', init: initViewToggle },
  { selector: 'body', init: initKeyboard }
];

// Dynamic imports map
const dynamicModules = [
  { selector: '#heatmapGrid', load: () => import('./components/archive.js').then(m => { m.initHeatmap(); m.initArchiveTabs(); }) },
  { selector: '#lightbox', load: () => import('./components/album.js').then(m => m.initLightbox()) },
  { selector: '.toc-list', load: () => import('./components/post.js').then(m => { m.initTocSpy(); m.initReadingProgress(); m.initReactions(); }) },
  { selector: '.hero-gradient', load: () => import('./components/parallax.js').then(m => m.initParallax()) },
  { selector: '[data-profile-section]', load: () => import('./components/page-profile.js').then(m => { m.initProfileEdit(); m.initAvatarUpload(); m.initProfileStreak(); }) },
  { selector: '.auth-tab-btn', load: () => import('./components/page-login.js').then(m => { m.initAuthTabs(); m.initPwdToggle(); m.initLoginForm(); }) },
  { selector: '#linkApplyForm', load: () => import('./components/links.js') } // filterLinks and toggleLinkApplyForm are bound to window inside
];

function initPage() {
  // 1. Run static modules
  staticModules.forEach(({ selector, init }) => {
    if (document.querySelector(selector)) {
      try { init(); } catch (err) { console.error(err); }
    }
  });

  // 2. Load dynamic modules
  dynamicModules.forEach(({ selector, load }) => {
    if (document.querySelector(selector)) {
      load().catch(err => console.error(`Failed to load dynamic module for ${selector}:`, err));
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
