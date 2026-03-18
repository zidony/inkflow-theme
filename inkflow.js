/**
 * INKFLOW Blog Theme — Unified JavaScript
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
 * 11. Archive — Heatmap Generation
 * 12. Archive — Year Tab Switching
 * 13. Album — Filter Tabs
 * 14. Album — Lightbox
 * 15. Link List — Filter Tabs
 * 16. Post Detail — TOC Scroll Spy
 * 17. Post Detail — Reactions & Like
 * 18. Post Detail — Copy Code Block
 * 19. Post Detail — Share / Copy Link
 * 20. Post Detail — Scroll to Comments
 * 21. Hero Card Parallax (homepage only)
 * 22. Profile Page — Edit Mode Toggle
 * 23. Profile Page — Avatar Upload Preview
 * 24. Keyboard Shortcuts (Esc / Ctrl+K)
 *
 * 使用说明:
 * - 每个模块通过 initXxx() 函数封装，只有对应 DOM 存在时才执行
 * - 页面底部统一调用入口 initPage()
 * =========================================================
 */

'use strict';

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
  onScroll(); // 初始化状态
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

// 全局函数供内联 onclick 调用
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

  // 从 localStorage 恢复上次选择
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
   用法:
   - 未登录: #navLoginBtn 按钮显示 "登录"
   - 已登录: #navUserWrapper 显示用户头像 + 下拉菜单
   - 调用 inkflowAuth.setUser({name, initial}) 切换到已登录态
   - 调用 inkflowAuth.logout() 切换回未登录态
   ========================================================== */

const inkflowAuth = {
  /** 登录后调用，user = { name: '陈明远', initial: '陈' } */
  setUser(user) {
    const loginBtn  = document.getElementById('navLoginBtn');
    const userWrap  = document.getElementById('navUserWrapper');
    const avatar    = document.getElementById('navUserAvatar');
    const userName  = document.getElementById('navUserName');

    if (loginBtn)  loginBtn.style.display  = 'none';
    if (userWrap)  userWrap.style.display  = 'flex';
    if (avatar)    avatar.textContent       = user.initial || user.name.charAt(0);
    if (userName)  userName.textContent     = user.name;

    localStorage.setItem('inkflow-user', JSON.stringify(user));
  },

  /** 登出后调用 */
  logout() {
    const loginBtn  = document.getElementById('navLoginBtn');
    const userWrap  = document.getElementById('navUserWrapper');

    if (loginBtn)  loginBtn.style.display  = '';
    if (userWrap)  userWrap.style.display  = 'none';

    localStorage.removeItem('inkflow-user');
  },

  /** 页面加载时从 localStorage 恢复状态 */
  restore() {
    const raw = localStorage.getItem('inkflow-user');
    if (raw) {
      try { this.setUser(JSON.parse(raw)); } catch (e) { /* ignore */ }
    }
  }
};

function initUserAuth() {
  // 恢复登录状态
  inkflowAuth.restore();

  // 点击头像切换下拉菜单（移动端补充）
  const wrapper = document.getElementById('navUserWrapper');
  const avatar  = document.getElementById('navUserAvatar');
  if (wrapper && avatar) {
    avatar.addEventListener('click', () => {
      wrapper.classList.toggle('open');
    });
    // 点击其他地方收起
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
    });
  }

  // 登出按钮
  const logoutBtn = document.getElementById('navLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      inkflowAuth.logout();
      window.location.href = 'index.hmtl';
    });
  }
}


/* ==========================================================
   06. SEARCH OVERLAY
   ========================================================== */

function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;

  // 点击背景关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });
}

function openSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  // 聚焦搜索框（兼容两种 id）
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
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

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
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
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
  // 同组内互斥激活（查找最近的 d-flex / flex 容器）
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
    if (gridView) gridView.style.display = '';
    if (listView) listView.style.display = 'none';
  });

  listBtn.addEventListener('click', () => {
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
    if (listView) listView.style.display = '';
    if (gridView) gridView.style.display = 'none';
  });
}


/* ==========================================================
   11. ARCHIVE — Heatmap Generation
   ========================================================== */

function initHeatmap() {
  const container = document.getElementById('heatmapGrid');
  if (!container) return;

  const levels = [0, 0, 0, 1, 1, 2, 2, 3, 4]; // 权重分布

  for (let week = 0; week < 53; week++) {
    const weekEl = document.createElement('div');
    weekEl.className = 'heatmap-week';
    for (let day = 0; day < 7; day++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'heatmap-day';
      const lvl = levels[Math.floor(Math.random() * levels.length)];
      if (lvl > 0) dayEl.dataset.level = lvl;
      weekEl.appendChild(dayEl);
    }
    container.appendChild(weekEl);
  }
}


/* ==========================================================
   12. ARCHIVE — Year Tab Switching
   ========================================================== */

function initArchiveTabs() {
  document.querySelectorAll('.archive-year-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.archive-year-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      // 实际项目中这里通过 AJAX / 过滤 DOM 切换数据
    });
  });
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

// 数据由各页面内联 data 对象提供，这里仅提供 open/close 方法
function openLightbox(key) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  // 尝试读取全局定义的 lightboxData（各页面可自定义）
  const data = (window.lightboxData && window.lightboxData[key]) || {};
  const imgEl   = document.getElementById('lbImg');
  const capEl   = document.getElementById('lbCaption');

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
   15. LINK LIST — Filter Tabs
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

function toggleApplyForm() {
  const form = document.getElementById('applyForm');
  if (form) form.classList.toggle('show');
}


/* ==========================================================
   16. POST DETAIL — TOC Scroll Spy
   ========================================================== */

function initTocSpy() {
  const tocLinks = document.querySelectorAll('.toc-list a');
  const headings = document.querySelectorAll('h2[id], h3[id]');
  if (!tocLinks.length || !headings.length) return;

  function updateTOC() {
    let current = '';
    headings.forEach(h => {
      if (h.getBoundingClientRect().top < 120) current = h.id;
    });
    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  }

  window.addEventListener('scroll', updateTOC, { passive: true });
}


/* ==========================================================
   17. POST DETAIL — Reactions & Like
   ========================================================== */

function initReactions() {
  // Floating like button
  const likeBtn   = document.getElementById('likeBtn');
  const likeCount = document.getElementById('likeCount');
  if (likeBtn && likeCount) {
    let liked = false;
    likeBtn.addEventListener('click', () => {
      liked = !liked;
      likeCount.textContent = parseInt(likeCount.textContent) + (liked ? 1 : -1);
      likeBtn.classList.toggle('liked', liked);
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
   21. HERO CARD PARALLAX (homepage only)
   ========================================================== */

function initParallax() {
  const hero = document.querySelector('.hero-gradient');
  const card = document.querySelector('.hero-card');
  if (!hero || !card) return;

  document.addEventListener('mousemove', (e) => {
    if (e.clientY > hero.getBoundingClientRect().bottom) return;
    const x = (e.clientX / window.innerWidth  - 0.5) * 12;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    card.style.transform = `translateY(-4px) rotateY(${x * 0.3}deg) rotateX(${-y * 0.3}deg)`;
  });

  hero.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
}


/* ==========================================================
   22. PROFILE PAGE — Edit Mode Toggle
   ========================================================== */

function initProfileEdit() {
  const editBtns   = document.querySelectorAll('[data-profile-edit]');
  const cancelBtns = document.querySelectorAll('[data-profile-cancel]');
  const saveBtns   = document.querySelectorAll('[data-profile-save]');

  editBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.profileEdit;
      enableEdit(section, true);
    });
  });

  cancelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.profileCancel;
      enableEdit(section, false);
    });
  });

  saveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.profileSave;
      // 这里可接入真实 API
      showToast('保存成功 ✓');
      enableEdit(section, false);
    });
  });
}

function enableEdit(section, enable) {
  const container = document.querySelector(`[data-profile-section="${section}"]`);
  if (!container) return;
  container.querySelectorAll('.profile-input').forEach(input => {
    input.readOnly = !enable;
    input.style.opacity = enable ? '1' : '';
    input.style.cursor  = enable ? '' : '';
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
   UTILITY: Toast notification
   ========================================================== */

function showToast(message, type = 'success') {
  const existing = document.getElementById('inkToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'inkToast';
  toast.style.cssText = `
    position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(20px);
    background:${type === 'success' ? 'var(--ink-primary)' : '#ef4444'};
    color:#fff; padding:.7rem 1.5rem; border-radius:99px;
    font-size:.88rem; font-weight:600; z-index:9999;
    box-shadow:0 4px 20px rgba(0,0,0,.2);
    transition:all .3s; opacity:0;
    font-family:var(--font-body);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}


/* ==========================================================
   24. KEYBOARD SHORTCUTS
   ========================================================== */

function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Esc — 关闭所有 overlay
    if (e.key === 'Escape') {
      closeSearch();
      closeLightbox();
    }
    // Ctrl / Cmd + K — 打开搜索
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });
}


/* ==========================================================
   PAGE INIT — 统一入口
   在 DOMContentLoaded 后调用，按需初始化各模块
   ========================================================== */

function initPage() {
  initNavbar();
  initReadingProgress();
  initBackToTop();
  initThemeToggle();
  initUserAuth();
  initSearch();
  initScrollReveal();
  initCounters();
  initTagPills();
  initViewToggle();
  initHeatmap();
  initArchiveTabs();
  initLightbox();
  initTocSpy();
  initReactions();
  initParallax();
  initProfileEdit();
  initAvatarUpload();
  initKeyboard();
}

// DOM Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}
