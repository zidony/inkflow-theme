// Self-hosted Bootstrap JS (tree-shaken to the components actually used).
// Skipped automatically when the build injects the Bootstrap CDN bundle instead.
import './vendor.js';

import { registerComponent, initAll } from './core/registry.js';
import { attachInkflow, components as inkflowComponents } from './core/bootstrap.js';

import { initNavbar } from './components/navbar.js';
import { initThemeToggle } from './core/theme.js';
import { initUserAuth } from './components/auth.js';
import { initSearch } from './components/search.js';
import { initScrollReveal, initCounters } from './core/animations.js';
import { initBackToTop, initTagPills, initViewToggle, initKeyboard, initDemoActions } from './core/global.js';
import { initToast, showToast } from './components/toast.js';
import { initLightbox, lightboxApi } from './components/lightbox.js';
import { initTagCloud, tagCloudApi } from './components/tag-cloud.js';
import { initFilterScope } from './components/category-filter.js';

// ---------------------------------------------------------------------------
// Component registration.
//
// Every component is registered with a selector + init function. The registry
// (core/registry.js) guarantees idempotent initialization keyed on the target
// element, so repeated `Inkflow.init()` calls or dynamic DOM re-scans are safe.
//
// Page-specific components use dynamic import() so each page only downloads
// the module it needs (see the resulting per-page chunks in dist/assets/js/).
// ---------------------------------------------------------------------------

// Static, site-wide UI components.
registerComponent('toast', { selector: 'body', init: initToast });
registerComponent('navbar', { selector: '#mainNavbar', init: initNavbar });
registerComponent('backToTop', { selector: '#backToTop', init: initBackToTop });
registerComponent('themeToggle', { selector: '#themeToggle', init: initThemeToggle });
registerComponent('userAuth', { selector: '#navUserWrapper', init: initUserAuth });
registerComponent('search', { selector: '#searchOverlay', init: initSearch });
registerComponent('scrollReveal', { selector: '.fade-up', init: initScrollReveal });
registerComponent('counters', { selector: '[data-count]', init: initCounters });
registerComponent('tagPills', { selector: '.tag-pill', init: initTagPills });
registerComponent('viewToggle', { selector: '#gridBtn', init: initViewToggle });
registerComponent('demoActions', { selector: '[data-demo-action]', init: initDemoActions });
registerComponent('keyboard', { selector: 'body', init: initKeyboard });

// Generic components (available on any page whose DOM contract is present).
registerComponent('lightbox', { selector: '#lightbox', init: initLightbox });
registerComponent('tagCloud', { selector: '#tagCloudInner', init: initTagCloud });
registerComponent('filterScope', { selector: '[data-filter-scope]', init: initFilterScope });

// Page-specific components — modules are fetched on demand via dynamic import().
registerComponent('archive', {
  selector: '#heatmapGrid',
  init: async () => {
    const { initHeatmap, initArchiveTabs } = await import(/* webpackChunkName: "archive" */ './pages/archive.js');
    initHeatmap();
    initArchiveTabs();
  },
});
registerComponent('albumPage', {
  selector: '#albumGrid',
  init: async () => {
    const { initAlbumPage } = await import(/* webpackChunkName: "album" */ './pages/album.js');
    initAlbumPage();
  },
});
registerComponent('post', {
  selector: '.toc-list',
  init: async () => {
    const { initTocSpy, initReadingProgress, initReactions, initPostActions } = await import(/* webpackChunkName: "post" */ './pages/post.js');
    initTocSpy();
    initReadingProgress();
    initReactions();
    initPostActions();
  },
});
registerComponent('parallax', {
  selector: '.hero-gradient',
  init: async () => {
    const { initParallax } = await import(/* webpackChunkName: "parallax" */ './pages/parallax.js');
    initParallax();
  },
});
registerComponent('profile', {
  selector: '[data-profile-section]',
  init: async () => {
    const { initProfileEdit, initAvatarUpload, initProfileStreak, initProfileActions } = await import(/* webpackChunkName: "profile" */ './pages/profile.js');
    initProfileEdit();
    initAvatarUpload();
    initProfileStreak();
    initProfileActions();
  },
});
registerComponent('login', {
  selector: '.auth-tab-btn',
  init: async () => {
    const { initAuthTabs, initPwdToggle, initLoginForm } = await import(/* webpackChunkName: "login" */ './pages/login.js');
    initAuthTabs();
    initPwdToggle();
    initLoginForm();
  },
});
registerComponent('links', {
  selector: '[data-link-filter]',
  init: async () => {
    const { initLinksPage } = await import(/* webpackChunkName: "links" */ './pages/links.js');
    initLinksPage();
  },
});

// ---------------------------------------------------------------------------
// Public programmatic APIs.
// ---------------------------------------------------------------------------

inkflowComponents.toast = { show: showToast };
inkflowComponents.lightbox = lightboxApi;
inkflowComponents.tagCloud = tagCloudApi;
inkflowComponents.categoryFilter = { initScope: initFilterScope };

// Expose the Inkflow global API and initialize everything on DOM ready.
attachInkflow();

function initPage() {
  initAll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage, { once: true });
} else {
  initPage();
}
