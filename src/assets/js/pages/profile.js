import { escapeCssString, initOnce, trapFocus } from '../core/utils.js';
import { showToast } from '../components/toast.js';
import { InkflowEvents, emit } from '../core/events.js';

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const STREAK_PATTERN = [
  false, true, false, true, false, false, true,
  true, false, true, true, false, true, true,
  true, false, true, true, true, false, true
];
let accountDeleteModal;
let accountDeleteModalFallbackBackdrop;
let accountDeleteLastFocused = null;
let accountDeleteCloseTimer = 0;

function initProfileEdit() {
  const root = document.querySelector('[data-profile-section]');
  if (!initOnce(root || document.body, 'profileEdit')) return;

  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-profile-edit]');
    if (editBtn) {
      enableEdit(editBtn.dataset.profileEdit, true);
      return;
    }

    const cancelBtn = e.target.closest('[data-profile-cancel]');
    if (cancelBtn) {
      enableEdit(cancelBtn.dataset.profileCancel, false);
      return;
    }

    const saveBtn = e.target.closest('[data-profile-save]');
    if (saveBtn) {
      showToast('保存成功 ✓');
      enableEdit(saveBtn.dataset.profileSave, false);
    }
  });

  document.addEventListener('keydown', (e) => {
    const modalEl = document.getElementById('accountDeleteModal');
    if (!modalEl?.classList.contains('show')) return;
    if (e.key === 'Escape') {
      hideDeleteModal();
      return;
    }
    trapFocus(modalEl, e);
  });
}

function enableEdit(section, enable) {
  const container = document.querySelector(`[data-profile-section="${escapeCssString(section)}"]`);
  if (!container) return;
  container.querySelectorAll('.profile-input').forEach(input => {
    input.readOnly = !enable;
  });
  const editActions = container.querySelector('[data-edit-actions]');
  const viewActions = container.querySelector('[data-view-actions]');
  if (editActions) {
    editActions.classList.toggle('d-none', !enable);
    editActions.classList.toggle('d-flex', enable);
  }
  if (viewActions) {
    viewActions.classList.toggle('d-none', enable);
    viewActions.classList.toggle('d-flex', !enable);
  }
}

function initAvatarUpload() {
  const input   = document.getElementById('avatarInput');
  const preview = document.getElementById('profileAvatarEl');
  if (!input || !preview || !initOnce(input, 'avatarUpload')) return;

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-avatar-trigger]')) input.click();
  });

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;

    if (!AVATAR_ALLOWED_TYPES.has(file.type)) {
      showToast('请选择 PNG、JPG、WebP 或 GIF 图片', 'error');
      input.value = '';
      return;
    }

    if (file.size > AVATAR_MAX_BYTES) {
      showToast('头像图片不能超过 2MB', 'error');
      input.value = '';
      return;
    }

    // CMS adapters (e.g. YTCMS account_profile) listen to
    // `inkflow:avatar-change` and preventDefault() to take over the upload;
    // with no consumer the standalone preview shows a local readback.
    const consumed = !emit(InkflowEvents.AVATAR_CHANGE, { file, input, preview });
    if (consumed) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.style.setProperty('--avatar-image', `url(${e.target.result})`);
      preview.classList.add('profile-avatar-has-image');
      preview.textContent = '';
    };
    reader.onerror = () => {
      showToast('头像读取失败，请重新选择图片', 'error');
      input.value = '';
    };
    reader.readAsDataURL(file);
  });
}

function initProfileActions() {
  const root = document.querySelector('[data-profile-section]');
  if (!initOnce(root || document.body, 'profileActions')) return;

  document.addEventListener('click', (e) => {
    const sectionLink = e.target.closest('[data-scroll-section]');
    if (sectionLink) {
      e.preventDefault();
      scrollToSection(sectionLink.dataset.scrollSection);
      return;
    }

    if (e.target.closest('[data-confirm-delete]')) {
      confirmDelete();
      return;
    }

    const deleteSubmit = e.target.closest('[data-confirm-delete-submit]');
    if (deleteSubmit) {
      submitDeleteRequest();
      return;
    }

    if (e.target.closest('#accountDeleteModal [data-bs-dismiss="modal"]')) {
      if (!globalThis.bootstrap?.Modal) {
        hideDeleteModalFallback(document.getElementById('accountDeleteModal'));
      }
    }
  });

  initNotifySwitches();

  const accountDeleteModalEl = document.getElementById('accountDeleteModal');
  if (accountDeleteModalEl && initOnce(accountDeleteModalEl, 'deleteModalFocus')) {
    accountDeleteModalEl.addEventListener('keydown', (e) => {
      if (!accountDeleteModalEl.classList.contains('show') || e.key !== 'Tab') return;
      trapFocus(accountDeleteModalEl, e);
    }, true);
    accountDeleteModalEl.addEventListener('hidden.bs.modal', restoreDeleteModalFocus);
  }
}

function initNotifySwitches() {
  document.querySelectorAll('.notify-toggle').forEach(toggle => {
    const syncSwitchState = () => {
      toggle.setAttribute('aria-checked', toggle.checked ? 'true' : 'false');
      if (toggle.id === 'tfaSwitch') {
        const tfaLabel = document.getElementById('tfaLabel');
        if (tfaLabel) tfaLabel.textContent = toggle.checked ? '已开启' : '未开启';
      }
    };

    syncSwitchState();
    toggle.addEventListener('change', syncSwitchState);
  });
}

function initProfileStreak() {
  const container = document.getElementById('streakDots');
  if (!container) return;

  // Server-rendered dots (CMS pages) take precedence; the demo pattern only
  // fills an empty container so real activity data is never overwritten.
  if (container.children.length > 0) return;

  const dots = STREAK_PATTERN.map((active) => {
    const dot = document.createElement('div');
    dot.className = `streak-dot${active ? ' active' : ''}`;
    return dot;
  });

  container.replaceChildren(...dots);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  return false;
}

function confirmDelete() {
  const modalEl = document.getElementById('accountDeleteModal');
  const Modal = globalThis.bootstrap?.Modal;
  accountDeleteLastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (!modalEl || !Modal) {
    showDeleteModalFallback(modalEl);
    return;
  }

  accountDeleteModal = accountDeleteModal || Modal.getOrCreateInstance(modalEl);
  accountDeleteModal.show();
}

function submitDeleteRequest() {
  hideDeleteModal();
  showToast('账号注销申请已提交，请检查邮箱确认');
}

function hideDeleteModal() {
  const modalEl = document.getElementById('accountDeleteModal');
  const Modal = globalThis.bootstrap?.Modal;

  clearTimeout(accountDeleteCloseTimer);
  if (modalEl && Modal) {
    (accountDeleteModal || Modal.getInstance(modalEl))?.hide();
    accountDeleteCloseTimer = setTimeout(() => {
      if (modalEl.classList.contains('show')) hideDeleteModalFallback(modalEl);
    }, 350);
    return;
  }

  hideDeleteModalFallback(modalEl);
}

function showDeleteModalFallback(modalEl) {
  if (!modalEl) {
    showToast('请接入账号注销确认流程', 'error');
    return;
  }

  modalEl.classList.add('show');
  modalEl.removeAttribute('aria-hidden');
  modalEl.setAttribute('aria-modal', 'true');
  modalEl.setAttribute('role', 'dialog');
  modalEl.style.display = 'block';
  document.body.classList.add('modal-open');

  accountDeleteModalFallbackBackdrop?.remove();
  accountDeleteModalFallbackBackdrop = document.createElement('div');
  accountDeleteModalFallbackBackdrop.className = 'modal-backdrop fade show';
  document.body.appendChild(accountDeleteModalFallbackBackdrop);
  modalEl.querySelector('[data-confirm-delete-submit]')?.focus();
}

function hideDeleteModalFallback(modalEl) {
  if (!modalEl) return;

  modalEl.classList.remove('show');
  modalEl.setAttribute('aria-hidden', 'true');
  modalEl.removeAttribute('aria-modal');
  modalEl.removeAttribute('role');
  modalEl.style.display = '';
  document.body.classList.remove('modal-open');
  accountDeleteModalFallbackBackdrop?.remove();
  accountDeleteModalFallbackBackdrop = null;
  restoreDeleteModalFocus();
}

function restoreDeleteModalFocus() {
  if (accountDeleteLastFocused?.isConnected) accountDeleteLastFocused.focus();
  accountDeleteLastFocused = null;
}
export { initProfileEdit, initAvatarUpload, initProfileStreak, initProfileActions };
