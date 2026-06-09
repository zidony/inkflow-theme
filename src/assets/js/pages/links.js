import { copyText, initOnce, showToast } from '../core/utils.js';

function filterLinks(el, cat) {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    const isActive = tab === el;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-pressed', String(isActive));
  });

  document.querySelectorAll('[data-link-cat]').forEach(card => {
    const col = card.closest('.col-md-6, .col-12, [class*="col"]');
    if (!col) return;
    const visible = cat === 'all' || card.dataset.linkCat === cat;
    col.classList.add('link-filter-item');
    col.classList.toggle('is-filtered-out', !visible);
  });
}

function setLinkApplyFormState(form, expanded) {
  form.classList.toggle('show', expanded);
  form.hidden = !expanded;

  document.querySelectorAll('[data-toggle-link-apply][aria-controls="linkApplyForm"]').forEach(button => {
    button.setAttribute('aria-expanded', String(expanded));
  });

  if (expanded) {
    form.querySelector('input, textarea, select, button')?.focus();
  }
}

function toggleLinkApplyForm() {
  const form = document.getElementById('linkApplyForm');
  if (!form) return;

  setLinkApplyFormState(form, !form.classList.contains('show'));
}

function getCopySiteButtonState(btn) {
  if (!btn) return;

  return {
    label: btn.getAttribute('aria-label') || '复制本站信息',
    nodes: [...btn.childNodes].map(node => node.cloneNode(true)),
  };
}

function setCopySiteButtonFeedback(btn, state) {
  if (!btn) return;

  const icon = document.createElement('i');
  const isSuccess = state === 'success';
  icon.className = `bi ${isSuccess ? 'bi-check-lg' : 'bi-exclamation-triangle'} me-1`;
  icon.setAttribute('aria-hidden', 'true');
  btn.replaceChildren(icon, document.createTextNode(isSuccess ? '已复制本站信息' : '复制失败'));
  btn.setAttribute('aria-label', isSuccess ? '本站信息已复制' : '本站信息复制失败');
}

function restoreCopySiteButton(btn, state) {
  if (!btn || !state) return;

  setTimeout(() => {
    btn.replaceChildren(...state.nodes.map(node => node.cloneNode(true)));
    btn.setAttribute('aria-label', state.label);
    btn.setAttribute('aria-busy', 'false');
    btn.disabled = false;
  }, 1500);
}

function copySiteInfo(btn) {
  if (btn?.disabled) return;
  const buttonState = getCopySiteButtonState(btn);
  if (btn) {
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
  }

  const text = [
    '博客名称：INKFLOW',
    '地址：https://inkflow.dev',
    '介绍：关于技术、设计与人文的独立博客',
  ].join('\n');

  copyText(text)
    .then(() => {
      setCopySiteButtonFeedback(btn, 'success');
      showToast('站点信息已复制');
    })
    .catch(() => {
      setCopySiteButtonFeedback(btn, 'error');
      showToast('复制失败，请手动复制', 'error');
    })
    .finally(() => {
      restoreCopySiteButton(btn, buttonState);
    });
}

function initLinksPage() {
  const root = document.querySelector('[data-link-filter]')?.closest('.container') || document.body;
  if (!initOnce(root, 'links')) return;

  root.addEventListener('click', (e) => {
    const filterTab = e.target.closest('[data-link-filter]');
    if (filterTab) {
      filterLinks(filterTab, filterTab.dataset.linkFilter);
      return;
    }

    if (e.target.closest('[data-toggle-link-apply]')) {
      toggleLinkApplyForm();
      return;
    }

    const copySiteInfoBtn = e.target.closest('[data-copy-site-info]');
    if (copySiteInfoBtn) {
      copySiteInfo(copySiteInfoBtn);
    }
  });
}

export { initLinksPage };
