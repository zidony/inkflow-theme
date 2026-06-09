export function showToast(message, type = 'success') {
  const existing = document.getElementById('inkToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'inkToast';
  toast.className = `ink-toast ink-toast--${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('ink-toast--visible'));

  setTimeout(() => {
    toast.classList.remove('ink-toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (e) {
      // Fall back for insecure contexts or denied clipboard permissions.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.className = 'visually-hidden';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    if (!document.execCommand('copy')) {
      throw new Error('Clipboard copy command failed');
    }
  } finally {
    textarea.remove();
  }
}

export function escapeCssString(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\a ')
    .replace(/\r/g, '\\d ')
    .replace(/\f/g, '\\c ');
}

export function trapFocus(container, event) {
  if (!container || event.key !== 'Tab') return;

  const focusable = [...container.querySelectorAll([
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(','))].filter(el => el.offsetParent !== null);

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function initOnce(target, key) {
  if (!target) return false;
  const normalizedKey = key.replace(/[^a-zA-Z0-9]/g, '');
  const flag = `inkflow${normalizedKey}Initialized`;
  if (target.dataset[flag] === 'true') return false;
  target.dataset[flag] = 'true';
  return true;
}

export function prefersReducedMotion() {
  return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}
