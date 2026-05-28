import { showToast } from './utils.js';

function initProfileEdit() {
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
  if (editActions) editActions.style.display = enable ? 'flex' : 'none';
  if (viewActions) viewActions.style.display = enable ? 'none' : 'flex';
}

function initAvatarUpload() {
  const input   = document.getElementById('avatarInput');
  const preview = document.getElementById('profileAvatarEl');
  if (!input || !preview) return;

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.style.backgroundImage = `url(${e.target.result})`;
      preview.style.backgroundSize  = 'cover';
      preview.textContent = '';
    };
    reader.readAsDataURL(file);
  });
}

function initProfileStreak() {
  const container = document.getElementById('streakDots');
  if (!container) return;
  
  const dotsHtml = Array.from({length: 21}, (_, i) => {
    const active = i > 12 ? Math.random() > 0.3 : Math.random() > 0.7;
    return `<div style="flex:1;height:8px;border-radius:2px;background:${active ? 'rgba(0,201,141,.7)' : 'rgba(255,255,255,.1)'}"></div>`;
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
export { initProfileEdit, initAvatarUpload, initProfileStreak };

// Expose to global scope for inline HTML handlers
window.scrollToSection = scrollToSection;
window.confirmDelete = confirmDelete;
