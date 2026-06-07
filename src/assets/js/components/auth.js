const inkflowAuth = {
  setUser(user) {
    const loginBtn = document.getElementById('navLoginBtn');
    const userWrap = document.getElementById('navUserWrapper');
    const avatar   = document.getElementById('navUserAvatar');
    const userName = document.getElementById('navUserName');

    if (loginBtn) loginBtn.classList.add('d-none');
    if (userWrap) {
      userWrap.classList.remove('d-none');
      userWrap.classList.add('d-flex');
    }
    if (avatar)    avatar.textContent      = user.initial || user.name.charAt(0);
    if (userName)  userName.textContent    = user.name;

    try {
      localStorage.setItem('inkflow-user', JSON.stringify(user));
    } catch (e) {
      // Storage may be unavailable in restricted browser contexts.
    }
  },

  logout() {
    const loginBtn = document.getElementById('navLoginBtn');
    const userWrap = document.getElementById('navUserWrapper');

    if (loginBtn) loginBtn.classList.remove('d-none');
    if (userWrap) {
      userWrap.classList.add('d-none');
      userWrap.classList.remove('d-flex', 'open');
    }

    try {
      localStorage.removeItem('inkflow-user');
    } catch (e) {
      // Ignore storage failures; the visible UI has already been reset.
    }
  },

  restore() {
    let raw = null;
    try {
      raw = localStorage.getItem('inkflow-user');
    } catch (e) {
      return;
    }
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
export { inkflowAuth, initUserAuth };
