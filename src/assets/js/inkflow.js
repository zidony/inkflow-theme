import './core/utils.js'; // Attach showToast
import { initNavbar } from './components/navbar.js';
import { initThemeToggle } from './core/theme.js';
import { initUserAuth } from './components/auth.js';
import { initSearch } from './components/search.js';
import { initScrollReveal, initCounters } from './core/animations.js';
import { initBackToTop, initTagPills, initViewToggle, initKeyboard } from './core/global.js';

// Import page-specific scripts for single bundling
import * as ArchiveModule from './pages/archive.js';
import * as AlbumModule from './pages/album.js';
import * as PostModule from './pages/post.js';
import * as ParallaxModule from './pages/parallax.js';
import * as ProfileModule from './pages/profile.js';
import * as LoginModule from './pages/login.js';
import * as TagModule from './pages/tag.js';
import * as LinksModule from './pages/links.js';

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

// Page-specific initialization (synchronous now, but conditionally executed based on DOM)
const pageModules = [
  { selector: '#heatmapGrid', init: () => { ArchiveModule.initHeatmap(); ArchiveModule.initArchiveTabs(); } },
  { selector: '#lightbox', init: () => AlbumModule.initLightbox() },
  { selector: '.toc-list', init: () => { PostModule.initTocSpy(); PostModule.initReadingProgress(); PostModule.initReactions(); PostModule.initPostActions(); } },
  { selector: '.hero-gradient', init: () => ParallaxModule.initParallax() },
  { selector: '[data-profile-section]', init: () => { ProfileModule.initProfileEdit(); ProfileModule.initAvatarUpload(); ProfileModule.initProfileStreak(); ProfileModule.initProfileActions(); } },
  { selector: '.auth-tab-btn', init: () => { LoginModule.initAuthTabs(); LoginModule.initPwdToggle(); LoginModule.initLoginForm(); } },
  { selector: '#tagCloudInner', init: () => TagModule.initTagCloud() },
  { selector: '[data-link-filter]', init: () => LinksModule.initLinksPage() }
];

function initPage() {
  // 1. Run global UI modules
  staticModules.forEach(({ selector, init }) => {
    if (document.querySelector(selector)) {
      try { init(); } catch (err) { console.error(err); }
    }
  });

  // 2. Run page-specific modules (conditionally)
  pageModules.forEach(({ selector, init }) => {
    if (document.querySelector(selector)) {
      try { init(); } catch (err) { console.error(`Failed to init page module for ${selector}:`, err); }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
