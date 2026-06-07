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

function toggleLinkApplyForm() {
  const form = document.getElementById('linkApplyForm');
  if (form) form.classList.toggle('show');
}

function copySiteInfo() {
  const text = [
    '博客名称：INKFLOW',
    '地址：https://inkflow.dev',
    '介绍：关于技术、设计与人文的独立博客',
  ].join('\n');

  navigator.clipboard?.writeText(text).then(() => {
    window.showToast?.('站点信息已复制');
  });
}

function initLinksPage() {
  document.querySelectorAll('[data-link-filter]').forEach(tab => {
    tab.addEventListener('click', () => filterLinks(tab, tab.dataset.linkFilter));
  });

  document.querySelectorAll('[data-toggle-link-apply]').forEach(btn => {
    btn.addEventListener('click', toggleLinkApplyForm);
  });

  document.querySelectorAll('[data-copy-site-info]').forEach(btn => {
    btn.addEventListener('click', copySiteInfo);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLinksPage);
} else {
  initLinksPage();
}

// Expose to global scope for inline HTML handlers
window.filterLinks = filterLinks;
window.toggleLinkApplyForm = toggleLinkApplyForm;
