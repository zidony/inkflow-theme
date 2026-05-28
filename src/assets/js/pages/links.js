function filterLinks(el, cat) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  document.querySelectorAll('[data-link-cat]').forEach(card => {
    const col = card.closest('.col-md-6, .col-12, [class*="col"]');
    if (!col) return;
    const visible = cat === 'all' || card.dataset.linkCat === cat;
    col.style.opacity   = visible ? '1' : '.2';
    col.style.transform = visible ? '' : 'scale(.97)';
  });
}

function toggleLinkApplyForm() {
  const form = document.getElementById('linkApplyForm');
  if (form) form.classList.toggle('show');
}
// Expose to global scope for inline HTML handlers
window.filterLinks = filterLinks;
window.toggleLinkApplyForm = toggleLinkApplyForm;
