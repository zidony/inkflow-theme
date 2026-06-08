import { copyText, initOnce, showToast } from '../core/utils.js';

function filterLinks(el, cat) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

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

function copySiteInfo() {
  const text = [
    '博客名称：INKFLOW',
    '地址：https://inkflow.dev',
    '介绍：关于技术、设计与人文的独立博客',
  ].join('\n');

  copyText(text)
    .then(() => showToast('站点信息已复制'))
    .catch(() => showToast('复制失败，请手动复制', 'error'));
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

    if (e.target.closest('[data-copy-site-info]')) {
      copySiteInfo();
    }
  });
}

export { initLinksPage };
