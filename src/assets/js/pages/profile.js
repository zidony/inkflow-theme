import { initOnce, showToast } from '../core/utils.js';

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
}

function enableEdit(section, enable) {
  const container = document.querySelector(`[data-profile-section="${section}"]`);
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
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.style.setProperty('--avatar-image', `url(${e.target.result})`);
      preview.classList.add('profile-avatar-has-image');
      preview.textContent = '';
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

    if (e.target.closest('[data-save-notify]')) {
      showToast('通知设置已保存 ✓');
      return;
    }

    if (e.target.closest('[data-confirm-delete]')) {
      confirmDelete();
    }
  });

  const tfaSwitch = document.getElementById('tfaSwitch');
  const tfaLabel = document.getElementById('tfaLabel');
  if (tfaSwitch && tfaLabel) {
    const syncTfaState = () => {
      tfaLabel.textContent = tfaSwitch.checked ? '已开启' : '未开启';
      tfaSwitch.setAttribute('aria-checked', tfaSwitch.checked ? 'true' : 'false');
    };
    syncTfaState();
    tfaSwitch.addEventListener('change', () => {
      syncTfaState();
    });
  }
}

function initProfileStreak() {
  const container = document.getElementById('streakDots');
  if (!container) return;
  
  const dotsHtml = Array.from({length: 21}, (_, i) => {
    const active = i > 12 ? Math.random() > 0.3 : Math.random() > 0.7;
    return `<div class="streak-dot${active ? ' active' : ''}"></div>`;
  }).join('');
  
  container.innerHTML = dotsHtml;
}

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
export { initProfileEdit, initAvatarUpload, initProfileStreak, initProfileActions };
