// Self-hosted Bootstrap JS (tree-shaken to the components actually used).
// Skipped automatically when the build injects the Bootstrap CDN bundle instead.
import './vendor.js';

import { registerComponent, initAll } from './core/registry.js';
import { attachInkflow } from './core/bootstrap.js';

import { initNavbar } from './components/navbar.js';
import { initThemeToggle } from './core/theme.js';
import { initUserAuth } from './components/auth.js';
import { initSearch } from './components/search.js';
import { initScrollReveal, initCounters } from './core/animations.js';
import { initBackToTop, initTagPills, initViewToggle, initKeyboard, initDemoActions } from './core/global.js';

// Page-specific modules (imported statically for the single-bundle build;
// G4 moves these to dynamic import() so pages only download what they need).
import * as ArchiveModule from './pages/archive.js';
import * as AlbumModule from './pages/album.js';
import * as PostModule from './pages/post.js';
import * as ParallaxModule from './pages/parallax.js';
import * as ProfileModule from './pages/profile.js';
import * as LoginModule from './pages/login.js';
import * as TagModule from './pages/tag.js';
import * as LinksModule from './pages/links.js';

// ---------------------------------------------------------------------------
// Component registration.
//
// Every component is registered with a selector + init function. The registry
// (core/registry.js) guarantees idempotent initialization keyed on the target
// element, so repeated `Inkflow.init()` calls or dynamic DOM re-scans are safe.
// ---------------------------------------------------------------------------

// Static, site-wide UI components.
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

// Page-specific components (guarded by their presence in the DOM).
registerComponent('archive', {
  selector: '#heatmapGrid',
  init: () => {
    ArchiveModule.initHeatmap();
    ArchiveModule.initArchiveTabs();
  },
});
registerComponent('lightbox', { selector: '#lightbox', init: () => AlbumModule.initLightbox() });
registerComponent('post', {
  selector: '.toc-list',
  init: () => {
    PostModule.initTocSpy();
    PostModule.initReadingProgress();
    PostModule.initReactions();
    PostModule.initPostActions();
  },
});
registerComponent('parallax', { selector: '.hero-gradient', init: () => ParallaxModule.initParallax() });
registerComponent('profile', {
  selector: '[data-profile-section]',
  init: () => {
    ProfileModule.initProfileEdit();
    ProfileModule.initAvatarUpload();
    ProfileModule.initProfileStreak();
    ProfileModule.initProfileActions();
  },
});
registerComponent('login', {
  selector: '.auth-tab-btn',
  init: () => {
    LoginModule.initAuthTabs();
    LoginModule.initPwdToggle();
    LoginModule.initLoginForm();
  },
});
registerComponent('tagCloud', { selector: '#tagCloudInner', init: () => TagModule.initTagCloud() });
registerComponent('links', { selector: '[data-link-filter]', init: () => LinksModule.initLinksPage() });

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
