/**
 * INKFLOW Blog Theme — Unified JavaScript v2.2
 * =========================================================
 * 模块说明 (Modules):
 *
 * 01. Navbar Scroll Effect
 * 02. Reading Progress Bar
 * 03. Back To Top Button
 * 04. Theme Toggle (Light / Dark)
 * 05. User Auth UI (Login button / User avatar dropdown)
 * 06. Search Overlay
 * 07. Scroll Reveal Animation (IntersectionObserver)
 * 08. Counter Animation (data-count)
 * 09. Tag / Filter Pills
 * 10. Post List — Grid / List View Toggle
 * 11. Archive — Heatmap Generation (setYear)
 * 12. Archive — Year Tab Switching
 * 13. Album — Filter Tabs
 * 14. Album — Lightbox
 * 15. Link List — Filter & Apply Form (toggleLinkApplyForm)
 * 16. Post Detail — TOC IntersectionObserver Scroll Spy (⚡ High Performance)
 * 17. Post Detail — Reactions & Like (⚡ Unified click & state handler)
 * 18. Post Detail — Copy Code Block
 * 19. Post Detail — Share / Copy Link
 * 20. Post Detail — Scroll to Comments
 * 21. Hero Card Parallax (⚡ GPU accelerated requestAnimationFrame)
 * 22. Profile Page — Edit Mode Toggle
 * 23. Profile Page — Avatar Upload Preview
 * 24. Profile Page — Streak Mini Activity Dots (⚡ Replaces document.write)
 * 25. Profile Page — Helpers (scrollToSection, confirmDelete)
 * 26. Keyboard Shortcuts (Esc / Ctrl+K)
 * 27. Login / Register — Auth Tabs
 * 28. Login — Password Toggle
 * 29. Login — Form Submit Handlers
 *
 * =========================================================
 */

'use strict';

(function(global) {

/* ==========================================================
   01. NAVBAR SCROLL EFFECT
   ========================================================== */

function initNavbar() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ==========================================================
   02. READING PROGRESS BAR
   ========================================================== */

function initReadingProgress() {
  const bar = document.getElementById('readingProgress');
  if (!bar) return;

  function updateProgress() {
    const doc = document.documentElement;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const pct = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
}


/* ==========================================================
   03. BACK TO TOP BUTTON
   ========================================================== */

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ==========================================================
   04. THEME TOGGLE (Light / Dark)
   ========================================================== */

function initThemeToggle() {
  const btn  = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!btn) return;

  const savedTheme = localStorage.getItem('inkflow-theme') || 'light';
  applyTheme(savedTheme, icon);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
    const next    = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, icon);
    localStorage.setItem('inkflow-theme', next);
    btn.style.transform = 'rotate(360deg)';
    setTimeout(() => { btn.style.transform = ''; }, 400);
  });
}

function applyTheme(theme, icon) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  if (icon) icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
}


/* ==========================================================
   05. USER AUTH UI
   ========================================================== */

const inkflowAuth = {
  setUser(user) {
    const loginBtn = document.getElementById('navLoginBtn');
    const userWrap = document.getElementById('navUserWrapper');
    const avatar   = document.getElementById('navUserAvatar');
    const userName = document.getElementById('navUserName');

    if (loginBtn)  loginBtn.style.display = 'none';
    if (userWrap)  userWrap.style.display = 'flex';
    if (avatar)    avatar.textContent      = user.initial || user.name.charAt(0);
    if (userName)  userName.textContent    = user.name;

    localStorage.setItem('inkflow-user', JSON.stringify(user));
  },

  logout() {
    const loginBtn = document.getElementById('navLoginBtn');
    const userWrap = document.getElementById('navUserWrapper');

    if (loginBtn)  loginBtn.style.display = '';
    if (userWrap)  userWrap.style.display = 'none';

    localStorage.removeItem('inkflow-user');
  },

  restore() {
    const raw = localStorage.getItem('inkflow-user');
    if (raw) {
      try { this.setUser(JSON.parse(raw)); } catch (e) { /* ignore */ }
    }
  }
};

function initUserAuth() {
  inkflowAuth.restore();

  const wrapper = document.getElementById('navUserWrapper');
  const avatar  = document.getElementById('navUserAvatar');
  if (wrapper && avatar) {
    avatar.addEventListener('click', () => wrapper.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
    });
  }

  const logoutBtn = document.getElementById('navLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      inkflowAuth.logout();
      window.location.href = 'index.html';
    });
  }
}


/* ==========================================================
   06. SEARCH OVERLAY
   ========================================================== */

function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });
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


/* ==========================================================
   07. SCROLL REVEAL ANIMATION
   ========================================================== */

function initScrollReveal() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}


/* ==========================================================
   08. COUNTER ANIMATION (data-count)
   ========================================================== */

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCounter(el, target, suffix) {
    const duration  = 1800;
    const startTime = performance.now();
    function step(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + (suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}


/* ==========================================================
   09. TAG / FILTER PILLS
   ========================================================== */

function initTagPills() {
  document.querySelectorAll('.tag-pill').forEach(pill => {
    pill.addEventListener('click', function () {
      const group = this.closest('[class*="flex"]') || this.parentElement;
      if (group) group.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
    });
  });
}


/* ==========================================================
   10. POST LIST — Grid / List View Toggle
   ========================================================== */

function initViewToggle() {
  const gridBtn  = document.getElementById('gridBtn');
  const listBtn  = document.getElementById('listBtn');
  const gridView = document.getElementById('gridView');
  const listView = document.getElementById('listView');
  if (!gridBtn || !listBtn) return;

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


/* ==========================================================
   11. ARCHIVE — Heatmap Generation
   ========================================================== */

function initHeatmap() {
  const container = document.getElementById('heatmapGrid');
  if (!container) return;
  
  // 默认渲染2025年数据
  setYear(null, '2025');
}


/* ==========================================================
   12. ARCHIVE — Year Tab Switching
   ========================================================== */

function initArchiveTabs() {
  document.querySelectorAll('.archive-year-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.archive-year-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

/* year-btn switching for archive heatmap */
function setYear(el, year) {
  document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
  if (el) {
    el.classList.add('active');
  } else {
    // 如果是通过 init 调用的，激活默认年份按钮
    const defaultBtn = document.querySelector(`.year-btn[onclick*="'${year}'"]`);
    if (defaultBtn) defaultBtn.classList.add('active');
  }

  const grid = document.getElementById('heatmapGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const levels = [0, 0, 0, 1, 1, 2, 2, 3, 4];
  const seed = parseInt(year) % 100;
  
  for (let week = 0; week < 53; week++) {
    const weekEl = document.createElement('div');
    weekEl.className = 'heatmap-week';
    for (let day = 0; day < 7; day++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'heatmap-day';
      const rand = Math.abs(Math.sin(week * 7 + day + seed)) * levels.length | 0;
      const lvl = levels[Math.min(rand, levels.length - 1)];
      if (lvl > 0) dayEl.dataset.level = lvl;
      weekEl.appendChild(dayEl);
    }
    grid.appendChild(weekEl);
  }
}


/* ==========================================================
   13. ALBUM — Filter Tabs
   ========================================================== */

function filterAlbum(el, cat) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  document.querySelectorAll('#albumGrid [data-cat]').forEach(card => {
    const visible = cat === 'all' || card.dataset.cat === cat;
    card.style.opacity   = visible ? '1' : '.25';
    card.style.transform = visible ? '' : 'scale(.96)';
  });
}


/* ==========================================================
   14. ALBUM — Lightbox
   ========================================================== */

function openLightbox(key) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  const data  = (window.lightboxData && window.lightboxData[key]) || {};
  const imgEl = document.getElementById('lbImg');
  const capEl = document.getElementById('lbCaption');

  if (imgEl) {
    imgEl.style.background = data.bg || 'linear-gradient(135deg,#0a1a10,#1a5c2a)';
    imgEl.innerHTML = `<i class="bi ${data.icon || 'bi-image'}" style="font-size:6rem;color:rgba(255,255,255,.15)"></i>`;
  }
  if (capEl) capEl.textContent = data.caption || data.cap || '';

  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
  if (e && e.target !== document.getElementById('lightbox') && !e.target.closest('.lb-close')) return;
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('active');
  document.body.style.overflow = '';
}

function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.addEventListener('click', closeLightbox);
}


/* ==========================================================
   15. LINK LIST — Filter & Apply Form
   ========================================================== */

function filterLinks(el, cat) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  document.querySelectorAll('[data-link-cat]').forEach(card => {
    const col = card.closest('.col-md-6, .col-12, [class*="col"]');
    if (!col) return;
    const visible = cat === 'all' || card.dataset.linkCat === cat;
    col.style.opacity   = visible ? '1' : '.2';
    col.style.transform = visible ? '' : 'scale(.97)';
  });
}

function toggleLinkApplyForm() {
  const form = document.getElementById('linkApplyForm');
  if (form) form.classList.toggle('show');
}


/* ==========================================================
   16. POST DETAIL — TOC IntersectionObserver Scroll Spy (⚡ High Performance)
   ========================================================== */

function initTocSpy() {
  const tocLinks = document.querySelectorAll('.toc-list a');
  const headings = document.querySelectorAll('h2[id], h3[id]');
  if (!tocLinks.length || !headings.length) return;

  const activeClass = 'active';
  let currentActive = null;

  const observerOptions = {
    rootMargin: '-100px 0px -65% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const targetLink = document.querySelector(`.toc-list a[href="#${id}"]`);
        
        if (targetLink && targetLink !== currentActive) {
          if (currentActive) currentActive.classList.remove(activeClass);
          targetLink.classList.add(activeClass);
          currentActive = targetLink;
        }
      }
    });
  }, observerOptions);

  headings.forEach(h => observer.observe(h));
}


/* ==========================================================
   17. POST DETAIL — Reactions & Like (⚡ Unified Handler)
   ========================================================== */

function initReactions() {
  const likeBtn   = document.getElementById('likeBtn');
  const likeCount = document.getElementById('likeCount');
  if (likeBtn && likeCount) {
    let liked = false;
    likeBtn.addEventListener('click', () => {
      liked = !liked;
      likeBtn.classList.toggle('active', liked);
      likeBtn.classList.toggle('liked', liked);
      
      const icon = likeBtn.querySelector('i');
      if (icon) {
        icon.className = liked ? 'bi bi-heart-fill text-danger' : 'bi bi-heart';
      }

      const countVal = parseInt(likeCount.textContent) || 0;
      likeCount.textContent = liked ? countVal + 1 : Math.max(0, countVal - 1);
      
      likeBtn.style.transform = 'scale(1.25)';
      setTimeout(() => { likeBtn.style.transform = ''; }, 200);
    });
  }
}

function toggleReact(el) {
  el.classList.toggle('active');
  const span = el.querySelector('.count');
  if (span) span.textContent = parseInt(span.textContent) + (el.classList.contains('active') ? 1 : -1);
}


/* ==========================================================
   18. POST DETAIL — Copy Code Block
   ========================================================== */

function copyCode(btn) {
  const code = btn.closest('pre')?.querySelector('code');
  if (!code) return;

  navigator.clipboard.writeText(code.textContent).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>已复制';
    setTimeout(() => { btn.innerHTML = orig; }, 1500);
  });
}


/* ==========================================================
   19. POST DETAIL — Share / Copy Link
   ========================================================== */

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.querySelector('.share-btn.link-copy');
    if (!btn) return;
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> 已复制';
    setTimeout(() => { btn.innerHTML = orig; }, 1500);
  });
}


/* ==========================================================
   20. POST DETAIL — Scroll to Comments
   ========================================================== */

function scrollToComments() {
  const comments = document.getElementById('comments');
  if (comments) comments.scrollIntoView({ behavior: 'smooth' });
}


/* ==========================================================
   21. HERO CARD PARALLAX (⚡ GPU Accelerated with requestAnimationFrame)
   ========================================================== */

function initParallax() {
  const hero = document.querySelector('.hero-gradient');
  const card = document.querySelector('.hero-card');
  if (!hero || !card) return;

  // 设置 3D 渲染上下文
  const wrapper = card.parentElement;
  if (wrapper) {
    wrapper.style.perspective = '1000px';
  }
  card.style.willChange = 'transform';
  card.style.transition = 'transform 0.15s ease-out';

  // 缓存 layout 高度以避免 mousemove 回调中触发重排
  let heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
  window.addEventListener('resize', () => {
    heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
  }, { passive: true });

  let mouseX = 0;
  let mouseY = 0;
  let ticking = false;

  document.addEventListener('mousemove', (e) => {
    if (e.pageY > heroBottom) return;

    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  function updateParallax() {
    const x = (mouseX / window.innerWidth  - 0.5) * 12;
    const y = (mouseY / window.innerHeight - 0.5) * 8;
    card.style.transform = `translate3d(0, -4px, 0) rotateY(${x * 0.3}deg) rotateX(${-y * 0.3}deg)`;
    ticking = false;
  }

  hero.addEventListener('mouseleave', () => {
    card.style.transform = 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)';
  });
}


/* ==========================================================
   22. PROFILE PAGE — Edit Mode Toggle
   ========================================================== */

function initProfileEdit() {
  document.querySelectorAll('[data-profile-edit]').forEach(btn => {
    btn.addEventListener('click', () => enableEdit(btn.dataset.profileEdit, true));
  });
  document.querySelectorAll('[data-profile-cancel]').forEach(btn => {
    btn.addEventListener('click', () => enableEdit(btn.dataset.profileCancel, false));
  });
  document.querySelectorAll('[data-profile-save]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('保存成功 ✓');
      enableEdit(btn.dataset.profileSave, false);
    });
  });
}

function enableEdit(section, enable) {
  const container = document.querySelector(`[data-profile-section="${section}"]`);
  if (!container) return;
  container.querySelectorAll('.profile-input').forEach(input => {
    input.readOnly = !enable;
  });
  const editActions = container.querySelector('[data-edit-actions]');
  const viewActions = container.querySelector('[data-view-actions]');
  if (editActions) editActions.style.display = enable ? 'flex' : 'none';
  if (viewActions) viewActions.style.display = enable ? 'none' : 'flex';
}


/* ==========================================================
   23. PROFILE PAGE — Avatar Upload Preview
   ========================================================== */

function initAvatarUpload() {
  const input   = document.getElementById('avatarInput');
  const preview = document.getElementById('profileAvatarEl');
  if (!input || !preview) return;

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.style.backgroundImage = `url(${e.target.result})`;
      preview.style.backgroundSize  = 'cover';
      preview.textContent = '';
    };
    reader.readAsDataURL(file);
  });
}


/* ==========================================================
   24. PROFILE PAGE — Streak Mini Activity Dots (⚡ Replaces document.write)
   ========================================================== */

function initProfileStreak() {
  const container = document.getElementById('streakDots');
  if (!container) return;
  
  const dotsHtml = Array.from({length: 21}, (_, i) => {
    const active = i > 12 ? Math.random() > 0.3 : Math.random() > 0.7;
    return `<div style="flex:1;height:8px;border-radius:2px;background:${active ? 'rgba(0,201,141,.7)' : 'rgba(255,255,255,.1)'}"></div>`;
  }).join('');
  
  container.innerHTML = dotsHtml;
}


/* ==========================================================
   25. PROFILE PAGE — Helpers (scrollToSection, confirmDelete)
   ========================================================== */

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  return false;
}

function confirmDelete() {
  if (confirm('确认要永久注销账号吗？此操作无法撤销，所有数据将被清除。')) {
    showToast('账号注销申请已提交，请检查邮箱确认');
  }
}


/* ==========================================================
   26. KEYBOARD SHORTCUTS
   ========================================================== */

function initKeyboard() {
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


/* ==========================================================
   27. LOGIN / REGISTER — Auth Tabs
   ========================================================== */

function initAuthTabs() {
  const tabBtns = document.querySelectorAll('.auth-tab-btn');
  if (!tabBtns.length) return;

  const activeBtn = document.querySelector('.auth-tab-btn.active') || tabBtns[0];
  const activeTarget = activeBtn?.dataset.authTab;
  
  document.querySelectorAll('.auth-tab-pane').forEach(pane => {
    pane.classList.remove('d-none');
    pane.style.display = pane.id === activeTarget ? 'block' : 'none';
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.authTab;
      tabBtns.forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.auth-tab-pane').forEach(pane => {
        pane.style.display = pane.id === target ? 'block' : 'none';
      });
    });
  });

  document.querySelectorAll('[data-auth-switch]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.authSwitch;
      const btn = document.querySelector(`.auth-tab-btn[data-auth-tab="${target}"]`);
      if (btn) btn.click();
    });
  });
}


/* ==========================================================
   28. LOGIN — Password Toggle
   ========================================================== */

function initPwdToggle() {
  document.querySelectorAll('.auth-pwd-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrap  = btn.closest('.auth-input-icon-wrap');
      const input = wrap && wrap.querySelector('input');
      if (!input) return;
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      const icon = btn.querySelector('i');
      if (icon) icon.className = isText ? 'bi bi-eye' : 'bi bi-eye-slash';
    });
  });
}


/* ==========================================================
   29. LOGIN — Form Submit Handlers
   ========================================================== */

function initLoginForm() {
  const loginBtn = document.getElementById('doLoginBtn');
  if (!loginBtn) return;

  loginBtn.addEventListener('click', () => {
    const email = document.getElementById('loginEmail')?.value;
    const pwd   = document.getElementById('loginPassword')?.value;

    if (!email || !pwd) { showToast('请填写邮箱和密码', 'error'); return; }

    loginBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> 登录中…';
    loginBtn.disabled  = true;

    setTimeout(() => {
      inkflowAuth.setUser({ name: '陈明远', initial: '陈' });
      showToast('登录成功，正在跳转…');
      setTimeout(() => { window.location.href = 'index.html'; }, 800);
    }, 1200);
  });

  const regBtn = document.getElementById('doRegisterBtn');
  if (regBtn) {
    regBtn.addEventListener('click', () => showToast('注册功能开发中，敬请期待'));
  }
}


/* ==========================================================
   UTILITY: Toast notification
   ========================================================== */

function showToast(message, type = 'success') {
  const existing = document.getElementById('inkToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'inkToast';
  toast.className = `ink-toast ink-toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('ink-toast--visible'));

  setTimeout(() => {
    toast.classList.remove('ink-toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}


/* ==========================================================
   PAGE INIT — 统一路由/节点按需探测加载重构
   ========================================================== */

const moduleRegistry = [
  { selector: '#mainNavbar', init: initNavbar },
  { selector: '#readingProgress', init: initReadingProgress },
  { selector: '#backToTop', init: initBackToTop },
  { selector: '#themeToggle', init: initThemeToggle },
  { selector: '#navUserWrapper', init: initUserAuth },
  { selector: '#searchOverlay', init: initSearch },
  { selector: '.fade-up', init: initScrollReveal },
  { selector: '[data-count]', init: initCounters },
  { selector: '.tag-pill', init: initTagPills },
  { selector: '#gridBtn', init: initViewToggle },
  { selector: '#heatmapGrid', init: initHeatmap },
  { selector: '.archive-year-tab', init: initArchiveTabs },
  { selector: '#lightbox', init: initLightbox },
  { selector: '.toc-list', init: initTocSpy },
  { selector: '#likeBtn', init: initReactions },
  { selector: '.hero-gradient', init: initParallax },
  { selector: '[data-profile-section]', init: initProfileEdit },
  { selector: '#avatarInput', init: initAvatarUpload },
  { selector: '#streakDots', init: initProfileStreak },
  { selector: '.auth-pwd-toggle', init: initPwdToggle },
  { selector: '.auth-tab-btn', init: initAuthTabs },
  { selector: '#doLoginBtn', init: initLoginForm },
  { selector: 'body', init: initKeyboard }
];

function initPage() {
  moduleRegistry.forEach(({ selector, init }) => {
    if (document.querySelector(selector)) {
      try {
        init();
      } catch (err) {
        console.error(`Module failed to init for selector [${selector}]:`, err);
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

// Expose handlers to global scope
global.scrollToTop = typeof scrollToTop !== 'undefined' ? scrollToTop : null;
global.openSearch = typeof openSearch !== 'undefined' ? openSearch : null;
global.closeSearch = typeof closeSearch !== 'undefined' ? closeSearch : null;
global.openLightbox = typeof openLightbox !== 'undefined' ? openLightbox : null;
global.closeLightbox = typeof closeLightbox !== 'undefined' ? closeLightbox : null;
global.setYear = typeof setYear !== 'undefined' ? setYear : null;
global.filterLinks = typeof filterLinks !== 'undefined' ? filterLinks : null;
global.toggleLinkApplyForm = typeof toggleLinkApplyForm !== 'undefined' ? toggleLinkApplyForm : null;
global.toggleLike = typeof toggleLike !== 'undefined' ? toggleLike : null;
global.scrollToComments = typeof scrollToComments !== 'undefined' ? scrollToComments : null;
global.copyCode = typeof copyCode !== 'undefined' ? copyCode : null;
global.toggleReact = typeof toggleReact !== 'undefined' ? toggleReact : null;
global.copyLink = typeof copyLink !== 'undefined' ? copyLink : null;
global.scrollToSection = typeof scrollToSection !== 'undefined' ? scrollToSection : null;
global.showToast = typeof showToast !== 'undefined' ? showToast : null;
global.confirmDelete = typeof confirmDelete !== 'undefined' ? confirmDelete : null;

})(window);
