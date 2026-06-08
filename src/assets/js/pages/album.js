import { initOnce } from '../core/utils.js';

let lightboxLastFocused = null;

const LIGHTBOX_DATA = {
  kyoto: {
    icon: 'bi-tree-fill',
    bg: 'linear-gradient(135deg,#0a2517,#0d6b3f)',
    caption: '四月京都 · 樱花季'
  },
  shanghai: {
    icon: 'bi-buildings-fill',
    bg: 'linear-gradient(135deg,#041b35,#0891b2)',
    caption: '外滩霓虹 · 城市夜色'
  },
  yunnan: {
    icon: 'bi-flower1',
    bg: 'linear-gradient(135deg,#330516,#be185d)',
    caption: '云南花海 · 高原春日'
  },
  zhangjiajie: {
    icon: 'bi-cloud-fog2-fill',
    bg: 'linear-gradient(135deg,#0a2517,#10b981)',
    caption: '张家界云海 · 山间晨雾'
  },
  tokyo: {
    icon: 'bi-lamp-fill',
    bg: 'linear-gradient(135deg,#1b0e3a,#7c3aed)',
    caption: '东京街角 · 夜行散步'
  },
  beijing: {
    icon: 'bi-bank2',
    bg: 'linear-gradient(135deg,#301b02,#d97706)',
    caption: '北京胡同 · 城市肌理'
  },
  daily: {
    icon: 'bi-cup-hot-fill',
    bg: 'linear-gradient(135deg,#041b35,#0d6ecc)',
    caption: '日常片段 · 慢生活'
  },
  sea: {
    icon: 'bi-water',
    bg: 'linear-gradient(135deg,#082933,#0891b2)',
    caption: '海边日记 · 蓝色时刻'
  },
  dunhuang: {
    icon: 'bi-sunrise-fill',
    bg: 'linear-gradient(135deg,#351302,#ea580c)',
    caption: '敦煌沙丘 · 日落余晖'
  },
  chengdu: {
    icon: 'bi-emoji-smile-fill',
    bg: 'linear-gradient(135deg,#0a2517,#0d6b3f)',
    caption: '成都午后 · 市井烟火'
  },
  p1: { icon: 'bi-tree', bg: 'linear-gradient(135deg,#0a2517,#0d6b3f)', caption: '旅行随拍 · 林间光影' },
  p2: { icon: 'bi-buildings', bg: 'linear-gradient(135deg,#041b35,#0d6ecc)', caption: '城市随拍 · 建筑轮廓' },
  p3: { icon: 'bi-flower2', bg: 'linear-gradient(135deg,#330516,#be185d)', caption: '自然随拍 · 花与风' },
  p4: { icon: 'bi-sunrise', bg: 'linear-gradient(135deg,#301b02,#d97706)', caption: '旅途随拍 · 日出时刻' },
  p5: { icon: 'bi-lamp', bg: 'linear-gradient(135deg,#1b0e3a,#7c3aed)', caption: '城市随拍 · 夜灯' },
  p6: { icon: 'bi-water', bg: 'linear-gradient(135deg,#041b35,#0d6ecc)', caption: '海边随拍 · 水面' },
  p7: { icon: 'bi-cloud-fog2', bg: 'linear-gradient(135deg,#0a2517,#10b981)', caption: '山间随拍 · 雾气' },
  p8: { icon: 'bi-moon-stars', bg: 'linear-gradient(135deg,#380e0e,#ef4444)', caption: '夜色随拍 · 星月' },
  p9: { icon: 'bi-cup-hot', bg: 'linear-gradient(135deg,#041b35,#0d6ecc)', caption: '生活随拍 · 咖啡时间' },
  p10: { icon: 'bi-bank', bg: 'linear-gradient(135deg,#351302,#ea580c)', caption: '城市随拍 · 老建筑' },
  p11: { icon: 'bi-stars', bg: 'linear-gradient(135deg,#082933,#0891b2)', caption: '夜景随拍 · 星光' },
  p12: { icon: 'bi-tree-fill', bg: 'linear-gradient(135deg,#0a2517,#0d6b3f)', caption: '自然随拍 · 绿意' }
};

function getSafeBootstrapIcon(icon) {
  return /^bi-[a-z0-9-]+$/i.test(icon || '') ? icon : 'bi-image';
}

function filterAlbum(el, cat) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  document.querySelectorAll('#albumGrid [data-cat]').forEach(card => {
    const visible = cat === 'all' || card.dataset.cat === cat;
    card.classList.toggle('is-filtered-out', !visible);
  });
}

function openLightbox(key) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lightboxLastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const data  = LIGHTBOX_DATA[key] || {};
  const imgEl = document.getElementById('lbImg');
  const capEl = document.getElementById('lbCaption');

  if (imgEl) {
    imgEl.style.setProperty('--lightbox-bg', data.bg || 'linear-gradient(135deg,#0a1a10,#1a5c2a)');
    const icon = document.createElement('i');
    icon.className = `bi ${getSafeBootstrapIcon(data.icon)} u-lightbox-active-icon`;
    icon.setAttribute('aria-hidden', 'true');
    imgEl.replaceChildren(icon);
  }
  if (capEl) capEl.textContent = data.caption || data.cap || '';

  lb.classList.add('active');
  lb.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-scroll-locked');
  lb.querySelector('.lb-close')?.focus();
}

function closeLightbox(e) {
  if (e && e.target !== document.getElementById('lightbox') && !e.target.closest('.lb-close')) return;
  const lb = document.getElementById('lightbox');
  const wasActive = lb?.classList.contains('active');
  if (lb) {
    lb.classList.remove('active');
    lb.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('is-scroll-locked');
  if (wasActive && lightboxLastFocused?.isConnected) lightboxLastFocused.focus();
}

function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb || !initOnce(lb, 'lightbox')) return;

  document.addEventListener('click', (e) => {
    const filterTab = e.target.closest('[data-album-filter]');
    if (filterTab) {
      filterAlbum(filterTab, filterTab.dataset.albumFilter);
      return;
    }

    const lightboxTrigger = e.target.closest('[data-lightbox-key]');
    if (lightboxTrigger) {
      e.preventDefault();
      openLightbox(lightboxTrigger.dataset.lightboxKey);
      return;
    }

    if (e.target === lb || e.target.closest('[data-lightbox-close]')) {
      closeLightbox(e);
    }
  });
}
export { closeLightbox, initLightbox };
