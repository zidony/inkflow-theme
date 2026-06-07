import { initOnce, showToast } from '../core/utils.js';

function initProfileEdit() {
  const root = document.querySelector('[data-profile-section]');
  if (!initOnce(root || document.body, 'profileEdit')) return;

  document.querySelectorAll('[data-profile-edit]').forEach(btn => {
    btn.addEventListener('click', () => enableEdit(btn.dataset.profileEdit, true));
  });
  document.querySelectorAll('[data-profile-cancel]').forEach(btn => {
    btn.addEventListener('click', () => enableEdit(btn.dataset.profileCancel, false));
  });
  document.querySelectorAll('[data-profile-save]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('保存成功 ✓');
      enableEdit(btn.dataset.profileSave, false);
    });
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

  document.querySelectorAll('[data-avatar-trigger]').forEach(btn => {
    btn.addEventListener('click', () => input.click());
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

  document.querySelectorAll('[data-scroll-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToSection(link.dataset.scrollSection);
    });
  });

  document.querySelectorAll('[data-save-notify]').forEach(btn => {
    btn.addEventListener('click', () => showToast('通知设置已保存 ✓'));
  });

  document.querySelectorAll('[data-confirm-delete]').forEach(btn => {
    btn.addEventListener('click', confirmDelete);
  });

  const tfaSwitch = document.getElementById('tfaSwitch');
  const tfaLabel = document.getElementById('tfaLabel');
  if (tfaSwitch && tfaLabel) {
    tfaSwitch.addEventListener('change', () => {
      tfaLabel.textContent = tfaSwitch.checked ? '已开启' : '未开启';
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
