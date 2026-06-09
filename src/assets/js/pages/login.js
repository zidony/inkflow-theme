import { initOnce, showToast } from '../core/utils.js';
import { inkflowAuth } from '../components/auth.js';

function initAuthTabs() {
  const tabBtns = document.querySelectorAll('.auth-tab-btn');
  const root = document.querySelector('.auth-card');
  if (!tabBtns.length || !initOnce(root || tabBtns[0], 'authTabs')) return;

  const activateTab = (target) => {
    tabBtns.forEach(btn => {
      const isActive = btn.dataset.authTab === target;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    document.querySelectorAll('.auth-tab-pane').forEach(pane => {
      const isActive = pane.id === target;
      pane.classList.toggle('d-none', !isActive);
      pane.hidden = !isActive;
    });
  };

  const activeBtn = document.querySelector('.auth-tab-btn.active') || tabBtns[0];
  activateTab(activeBtn?.dataset.authTab);

  (root || document).addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.auth-tab-btn');
    if (tabBtn) {
      activateTab(tabBtn.dataset.authTab);
      return;
    }

    const switchLink = e.target.closest('[data-auth-switch]');
    if (switchLink) {
      e.preventDefault();
      activateTab(switchLink.dataset.authSwitch);
    }
  });

  (root || document).addEventListener('keydown', (e) => {
    const current = e.target.closest('.auth-tab-btn');
    if (!current || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    const tabs = [...tabBtns];
    const currentIndex = tabs.indexOf(current);
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(currentIndex + dir + tabs.length) % tabs.length];
    next.focus();
    activateTab(next.dataset.authTab);
  });
}

function initPwdToggle() {
  const root = document.querySelector('.auth-card');
  if (!initOnce(root || document.body, 'passwordToggle')) return;

  (root || document).addEventListener('click', (e) => {
    const btn = e.target.closest('.auth-pwd-toggle');
    if (!btn) return;

    const wrap  = btn.closest('.ink-input-wrap');
    const input = wrap && wrap.querySelector('input');
    if (!input) return;
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.setAttribute('aria-pressed', isText ? 'false' : 'true');
    btn.setAttribute('aria-label', isText ? '显示密码' : '隐藏密码');
    const icon = btn.querySelector('i');
    if (icon) icon.className = isText ? 'bi bi-eye' : 'bi bi-eye-slash';
  });
}

function initLoginForm() {
  const loginBtn = document.getElementById('doLoginBtn');
  if (!loginBtn || !initOnce(loginBtn, 'loginForm')) return;

  document.addEventListener('click', (e) => {
    if (e.target.closest('#doRegisterBtn')) {
      showToast('注册功能开发中，敬请期待');
      return;
    }

    if (e.target.closest('[data-auth-forgot]')) {
      showToast('密码找回功能开发中，敬请期待');
      return;
    }

    if (!e.target.closest('#doLoginBtn')) return;

    const email = document.getElementById('loginEmail')?.value;
    const pwd   = document.getElementById('loginPassword')?.value;

    if (!email || !pwd) { showToast('请填写邮箱和密码', 'error'); return; }

    const icon = document.createElement('i');
    icon.className = 'bi bi-hourglass-split me-1';
    icon.setAttribute('aria-hidden', 'true');
    loginBtn.replaceChildren(icon, document.createTextNode(' 登录中…'));
    loginBtn.disabled  = true;

    setTimeout(() => {
      inkflowAuth.setUser({ name: '陈明远', initial: '陈' });
      showToast('登录成功，正在跳转…');
      setTimeout(() => { window.location.href = 'index.html'; }, 800);
    }, 1200);
  });
}

export { initAuthTabs, initPwdToggle, initLoginForm };
