function filterAlbum(el, cat) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  document.querySelectorAll('#albumGrid [data-cat]').forEach(card => {
    const visible = cat === 'all' || card.dataset.cat === cat;
    card.style.opacity   = visible ? '1' : '.25';
    card.style.transform = visible ? '' : 'scale(.96)';
  });
}

function openLightbox(key) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  const data  = (window.lightboxData && window.lightboxData[key]) || {};
  const imgEl = document.getElementById('lbImg');
  const capEl = document.getElementById('lbCaption');

  if (imgEl) {
    imgEl.style.background = data.bg || 'linear-gradient(135deg,#0a1a10,#1a5c2a)';
    imgEl.innerHTML = `<i class="bi ${data.icon || 'bi-image'}" style="font-size:6rem;color:rgba(255,255,255,.15)"></i>`;
  }
  if (capEl) capEl.textContent = data.caption || data.cap || '';

  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
  if (e && e.target !== document.getElementById('lightbox') && !e.target.closest('.lb-close')) return;
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('active');
  document.body.style.overflow = '';
}

function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  document.querySelectorAll('[data-album-filter]').forEach(tab => {
    tab.addEventListener('click', () => filterAlbum(tab, tab.dataset.albumFilter));
  });

  document.querySelectorAll('[data-lightbox-key]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(trigger.dataset.lightboxKey);
    });
  });

  document.querySelectorAll('[data-lightbox-close]').forEach(trigger => {
    trigger.addEventListener('click', closeLightbox);
  });

  lb.addEventListener('click', closeLightbox);
}
export { initLightbox };

// Expose to global scope for inline HTML handlers
window.filterAlbum = filterAlbum;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
