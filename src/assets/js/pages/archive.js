import { initOnce } from '../core/utils.js';

function initHeatmap() {
  const container = document.getElementById('heatmapGrid');
  if (!container || !initOnce(container, 'heatmap')) return;
  
  // 默认渲染2025年数据
  setYear(null, '2025');
}

function initArchiveTabs() {
  const root = document.querySelector('[data-archive-year], .archive-year-tab')?.parentElement;
  if (!root || !initOnce(root, 'archiveTabs')) return;

  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-archive-year], .archive-year-tab');
    if (!tab) return;

    const year = tab.dataset.archiveYear;
    if (year) setYear(tab, year);
    else {
      document.querySelectorAll('.archive-year-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');
    }
  });
}

/* year-btn switching for archive heatmap */
function setYear(el, year) {
  document.querySelectorAll('.year-btn').forEach(b => {
    const isActive = el ? b === el : b.dataset.archiveYear === year;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-pressed', String(isActive));
  });

  const grid = document.getElementById('heatmapGrid');
  if (!grid) return;
  grid.replaceChildren();
  
  const levels = [0, 0, 0, 1, 1, 2, 2, 3, 4];
  const seed = parseInt(year) % 100;
  
  for (let week = 0; week < 53; week++) {
    const weekEl = document.createElement('div');
    weekEl.className = 'heatmap-week';
    for (let day = 0; day < 7; day++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'heatmap-day';
      const rand = Math.abs(Math.sin(week * 7 + day + seed)) * levels.length | 0;
      const lvl = levels[Math.min(rand, levels.length - 1)];
      if (lvl > 0) dayEl.dataset.level = lvl;
      weekEl.appendChild(dayEl);
    }
    grid.appendChild(weekEl);
  }
}
export { initHeatmap, initArchiveTabs };
