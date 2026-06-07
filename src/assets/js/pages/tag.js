import { initOnce } from '../core/utils.js';

const TAGS = [
  { name: 'JavaScript', count: 24, color: '#f7df1e', bg: 'rgba(247,223,30,.12)', border: 'rgba(247,223,30,.3)' },
  { name: 'React', count: 18, color: '#61dafb', bg: 'rgba(97,218,251,.12)', border: 'rgba(97,218,251,.3)' },
  { name: 'TypeScript', count: 15, color: '#3178c6', bg: 'rgba(49,120,198,.12)', border: 'rgba(49,120,198,.3)' },
  { name: 'AI / LLM', count: 19, color: '#00c98d', bg: 'rgba(0,201,141,.12)', border: 'rgba(0,201,141,.3)' },
  { name: '设计系统', count: 11, color: '#a855f7', bg: 'rgba(168,85,247,.12)', border: 'rgba(168,85,247,.3)' },
  { name: 'Docker', count: 12, color: '#0ea5e9', bg: 'rgba(14,165,233,.12)', border: 'rgba(14,165,233,.3)' },
  { name: 'PostgreSQL', count: 8, color: '#336791', bg: 'rgba(51,103,145,.12)', border: 'rgba(51,103,145,.3)' },
  { name: 'Node.js', count: 14, color: '#6cc24a', bg: 'rgba(108,194,74,.12)', border: 'rgba(108,194,74,.3)' },
  { name: 'Python', count: 10, color: '#ffd43b', bg: 'rgba(255,212,59,.12)', border: 'rgba(255,212,59,.3)' },
  { name: '性能优化', count: 9, color: '#f97316', bg: 'rgba(249,115,22,.12)', border: 'rgba(249,115,22,.3)' },
  { name: 'Web 安全', count: 7, color: '#ef4444', bg: 'rgba(239,68,68,.12)', border: 'rgba(239,68,68,.3)' },
  { name: '架构设计', count: 6, color: '#8b5cf6', bg: 'rgba(139,92,246,.12)', border: 'rgba(139,92,246,.3)' },
  { name: '产品思维', count: 13, color: '#10b981', bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.3)' },
  { name: '个人成长', count: 11, color: '#06b6d4', bg: 'rgba(6,182,212,.12)', border: 'rgba(6,182,212,.3)' },
  { name: '读书笔记', count: 8, color: '#ec4899', bg: 'rgba(236,72,153,.12)', border: 'rgba(236,72,153,.3)' },
  { name: 'DevOps', count: 7, color: '#0891b2', bg: 'rgba(8,145,178,.12)', border: 'rgba(8,145,178,.3)' },
  { name: 'CSS', count: 9, color: '#1572b6', bg: 'rgba(21,114,182,.12)', border: 'rgba(21,114,182,.3)' },
  { name: 'Git', count: 5, color: '#f05032', bg: 'rgba(240,80,50,.12)', border: 'rgba(240,80,50,.3)' },
  { name: 'Prompt', count: 8, color: '#00c98d', bg: 'rgba(0,201,141,.08)', border: 'rgba(0,201,141,.2)' },
  { name: '职业发展', count: 6, color: '#d97706', bg: 'rgba(217,119,6,.12)', border: 'rgba(217,119,6,.3)' },
  { name: 'Kubernetes', count: 4, color: '#3069de', bg: 'rgba(48,105,222,.12)', border: 'rgba(48,105,222,.3)' },
  { name: 'Redis', count: 5, color: '#dc382d', bg: 'rgba(220,56,45,.12)', border: 'rgba(220,56,45,.3)' },
  { name: 'GraphQL', count: 3, color: '#e535ab', bg: 'rgba(229,53,171,.12)', border: 'rgba(229,53,171,.3)' },
  { name: '随笔', count: 11, color: '#84cc16', bg: 'rgba(132,204,22,.12)', border: 'rgba(132,204,22,.3)' },
];

function renderCloud(list) {
  const container = document.getElementById('tagCloudInner');
  if (!container) return;

  const max = Math.max(...list.map(t => t.count));
  const min = Math.min(...list.map(t => t.count));
  container.innerHTML = '';

  list.forEach(tag => {
    const ratio = (tag.count - min) / (max - min || 1);
    const size = 0.78 + ratio * 0.6;
    const pad = `${0.3 + ratio * 0.15}rem ${0.7 + ratio * 0.3}rem`;
    const el = document.createElement('a');
    const icon = document.createElement('i');
    const count = document.createElement('span');

    el.href = 'post-list.html';
    el.className = 'tag-cloud-item';
    el.style.setProperty('--tag-color', tag.color);
    el.style.setProperty('--tag-bg', tag.bg);
    el.style.setProperty('--tag-border', tag.border);
    el.style.setProperty('--tag-size', `${size}rem`);
    el.style.setProperty('--tag-padding', pad);

    icon.className = 'bi bi-hash tag-cloud-hash';
    count.className = 'tag-count';
    count.textContent = tag.count;

    el.append(icon, document.createTextNode(tag.name), count);
    container.appendChild(el);
  });
}

function sortTags(type, activeTab) {
  document.querySelectorAll('.sort-tab').forEach(tab => tab.classList.remove('active'));
  if (activeTab) activeTab.classList.add('active');

  const sorted = [...TAGS];
  if (type === 'count') sorted.sort((a, b) => b.count - a.count);
  else if (type === 'alpha') sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
  else sorted.sort(() => Math.random() - 0.5);

  renderCloud(sorted);
}

function initTagCloud() {
  const container = document.getElementById('tagCloudInner');
  if (!container || !initOnce(container, 'tagCloud')) return;

  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tag-sort]');
    if (tab) sortTags(tab.dataset.tagSort, tab);
  });

  const tagSearch = document.getElementById('tagSearch');
  if (tagSearch) {
    tagSearch.addEventListener('input', function () {
      const q = this.value.toLowerCase();
      renderCloud(q ? TAGS.filter(t => t.name.toLowerCase().includes(q)) : TAGS);
    });
  }

  renderCloud(TAGS);
}

export { initTagCloud };
