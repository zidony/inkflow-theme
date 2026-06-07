function initThemeToggle() {
  const btn  = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!btn) return;

  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem('inkflow-theme') || 'light';
  } catch (e) {
    savedTheme = 'light';
  }
  applyTheme(savedTheme, icon);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
    const next    = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, icon);
    try {
      localStorage.setItem('inkflow-theme', next);
    } catch (e) {
      // Theme still applies for the current page even when storage is blocked.
    }
    btn.classList.add('is-spinning');
    setTimeout(() => { btn.classList.remove('is-spinning'); }, 400);
  });
}

function applyTheme(theme, icon) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  if (icon) icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
}
export { initThemeToggle };
