import { showToast } from '../core/utils.js';
import { inkflowAuth } from '../components/auth.js';

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

export { initAuthTabs, initPwdToggle, initLoginForm };
