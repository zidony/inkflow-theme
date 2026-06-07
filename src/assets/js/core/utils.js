export function showToast(message, type = 'success') {
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
