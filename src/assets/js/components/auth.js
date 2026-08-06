import { initOnce } from '../core/utils.js';
import { InkflowEvents, emit } from '../core/events.js';

// Demo-only UI auth state. Replace with server-backed auth in production.
// The theme itself never talks to a backend: `setUser`/`logout` update the
// demo UI and localStorage, then emit `inkflow:auth-change` so a CMS adapter
// can observe (or take over) the state transition.
function normalizeUser(user) {
  if (!user || typeof user !== 'object') return null;

  const name = typeof user.name === 'string' ? user.name.trim() : '';
  const initial = typeof user.initial === 'string' ? user.initial.trim() : '';
  if (!name) return null;

  return {
    name,
    initial: initial || name.charAt(0),
  };
}

const inkflowAuth = {
  setUser(user) {
    const normalized = normalizeUser(user);
    if (!normalized) return false;

    const loginBtn = document.getElementById('navLoginBtn');
    const userWrap = document.getElementById('navUserWrapper');
    const avatar   = document.getElementById('navUserAvatar');
    const userName = document.getElementById('navUserName');

    if (loginBtn) loginBtn.classList.add('d-none');
    if (userWrap) {
      userWrap.classList.remove('d-none');
      userWrap.classList.add('d-flex');
    }
    if (avatar) avatar.textContent = normalized.initial;
    if (userName) userName.textContent = normalized.name;

    try {
      localStorage.setItem('inkflow-user', JSON.stringify(normalized));
    } catch (e) {
      // Storage may be unavailable in restricted browser contexts.
    }

    emit(InkflowEvents.AUTH_CHANGE, { user: normalized });

    return true;
  },

  logout() {
    const loginBtn = document.getElementById('navLoginBtn');
    const userWrap = document.getElementById('navUserWrapper');

    if (loginBtn) loginBtn.classList.remove('d-none');
    if (userWrap) {
      userWrap.classList.add('d-none');
      userWrap.classList.remove('d-flex', 'open');
    }
    document.getElementById('navUserAvatar')?.setAttribute('aria-expanded', 'false');

    try {
      localStorage.removeItem('inkflow-user');
    } catch (e) {
      // Ignore storage failures; the visible UI has already been reset.
    }
    emit(InkflowEvents.AUTH_CHANGE, { user: null });
  },

  restore() {
    let raw = null;
    try {
      raw = localStorage.getItem('inkflow-user');
    } catch (e) {
      return;
    }
    if (raw) {
      try {
        if (!this.setUser(JSON.parse(raw))) this.logout();
      } catch (e) {
        this.logout();
      }
    }
  }
};

function initUserAuth() {
  const root = document.getElementById('navUserWrapper') || document.body;
  if (!initOnce(root, 'userAuth')) return;

  inkflowAuth.restore();

  const wrapper = document.getElementById('navUserWrapper');
  const avatar  = document.getElementById('navUserAvatar');
  if (wrapper && avatar) {
    const syncMenuState = (open) => {
      wrapper.classList.toggle('open', open);
      avatar.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    avatar.addEventListener('click', () => syncMenuState(!wrapper.classList.contains('open')));
    avatar.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      syncMenuState(false);
    });
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) syncMenuState(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !wrapper.classList.contains('open')) return;
      syncMenuState(false);
      avatar.focus();
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
export { inkflowAuth, initUserAuth };
