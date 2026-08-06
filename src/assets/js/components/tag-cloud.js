/**
 * Inkflow TagCloud component.
 *
 * Data-driven tag cloud rendering. The theme ships no hard-coded tag list —
 * data comes from a JSON script (CSP-safe) or the programmatic API:
 *
 *   <script type="application/json" id="inkflow-tagcloud-data">
 *     [{ "name": "JavaScript", "count": 24, "url": "...", "recent": "2025-02-20" }]
 *   </script>
 *
 * The script id may be overridden with `data-tag-cloud-source="other-id"` on
 * the `#tagCloudInner` container (lets CMS adapters keep their own script id).
 * Markup contract: `#tagCloudInner`, `[data-tag-sort]` buttons, `#tagSearch`,
 * `#tagResultStatus` (role=status, aria-live=polite).
 *
 * API: Inkflow.components.tagCloud.render(list, query)
 */
import { initOnce } from '../core/utils.js';

const DEFAULT_HREF = 'post-list.html';
const SIZE_MIN = 0.78;
const SIZE_RANGE = 0.6;
const PAD_MIN = [0.3, 0.7];
const PAD_RANGE = [0.15, 0.3];

function resolveTagUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(String(value), window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch (err) {
    return null;
  }
}

function tagStatus(list, query = '') {
  const status = document.getElementById('tagResultStatus');
  if (!status) return;
  const queryText = query.trim();
  status.textContent = queryText
    ? list.length
      ? `找到 ${list.length} 个匹配标签`
      : `未找到与“${queryText}”匹配的标签`
    : `共 ${list.length} 个标签`;
}

function renderEmpty(query) {
  const empty = document.createElement('p');
  empty.className = 'text-muted mb-0';
  empty.textContent = `未找到与“${query.trim()}”匹配的标签`;
  return empty;
}

function renderCloud(list, query = '') {
  const container = document.getElementById('tagCloudInner');
  if (!container) return;

  container.replaceChildren();
  tagStatus(list, query);

  if (!list.length) {
    container.appendChild(renderEmpty(query));
    return;
  }

  const max = Math.max(...list.map((tag) => tag.count));
  const min = Math.min(...list.map((tag) => tag.count));

  for (const tag of list) {
    const ratio = (tag.count - min) / (max - min || 1);
    const size = SIZE_MIN + ratio * SIZE_RANGE;
    const pad = `${PAD_MIN[0] + ratio * PAD_RANGE[0]}rem ${PAD_MIN[1] + ratio * PAD_RANGE[1]}rem`;
    const safeUrl = resolveTagUrl(tag.url) || DEFAULT_HREF;

    const el = document.createElement('a');
    el.href = safeUrl;
    el.className = 'tag-cloud-item';
    el.style.setProperty('--tag-color', tag.color || 'var(--ink-accent)');
    el.style.setProperty('--tag-bg', tag.bg || 'rgba(128,128,128,.12)');
    el.style.setProperty('--tag-border', tag.border || 'rgba(128,128,128,.3)');
    el.style.setProperty('--tag-size', `${size}rem`);
    el.style.setProperty('--tag-padding', pad);

    const icon = document.createElement('i');
    icon.className = 'bi bi-hash tag-cloud-hash';
    icon.setAttribute('aria-hidden', 'true');
    const count = document.createElement('span');
    count.className = 'tag-count';
    count.textContent = String(tag.count);

    el.append(icon, document.createTextNode(String(tag.name)), count);
    container.appendChild(el);
  }
}

function sortTags(type, activeTab) {
  document.querySelectorAll('.sort-tab').forEach((tab) => {
    const isActive = tab === activeTab;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-pressed', String(isActive));
  });
  if (typeof tagCloudState.list === 'undefined') return;
  renderCloud(sortList(tagCloudState.list, type), tagCloudState.query);
}

function sortList(list, type) {
  const sorted = [...list];
  if (type === 'count') sorted.sort((a, b) => b.count - a.count);
  else if (type === 'alpha') sorted.sort((a, b) => String(a.name).localeCompare(String(b.name), 'zh'));
  else if (type === 'recent') {
    sorted.sort((a, b) => String(b.recent || '').localeCompare(String(a.recent || '')));
  }
  return sorted;
}

const tagCloudState = { list: [], query: '', sort: 'count' };

/**
 * Render a tag list (programmatic API / CMS adapter entry point).
 * @param {Array<{name: string, count: number, url?: string, recent?: string}>} list
 * @param {string} [query] current filter query
 */
export function renderTagCloud(list, query = '') {
  const safeList = Array.isArray(list) ? list.filter((tag) => tag && tag.name) : [];
  tagCloudState.list = safeList;
  tagCloudState.query = query;
  renderCloud(sortList(safeList, tagCloudState.sort), query);
}

function readScriptData(container) {
  const sourceId = container?.dataset?.tagCloudSource;
  const script = document.getElementById(sourceId || 'inkflow-tagcloud-data');
  if (!script) return [];
  try {
    const parsed = JSON.parse(script.textContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

/**
 * Initialize the tag cloud: read the JSON script (if present) or render
 * whatever was passed via renderTagCloud(), then wire sort + search controls.
 */
export function initTagCloud() {
  const container = document.getElementById('tagCloudInner');
  if (!container || !initOnce(container, 'tagCloud')) return;

  const scriptData = readScriptData(container);

  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tag-sort]');
    if (!tab) return;
    tagCloudState.sort = tab.dataset.tagSort;
    sortTags(tab.dataset.tagSort, tab);
  });

  const tagSearch = document.getElementById('tagSearch');
  if (tagSearch) {
    tagSearch.addEventListener('input', () => {
      const q = tagSearch.value.trim();
      const normalized = q.toLowerCase();
      const filtered = scriptData.length
        ? scriptData.filter((tag) => String(tag.name).toLowerCase().includes(normalized))
        : tagCloudState.list.filter((tag) => String(tag.name).toLowerCase().includes(normalized));
      renderTagCloud(filtered, q);
    });
  }

  if (scriptData.length) {
    renderTagCloud(scriptData);
  } else if (tagCloudState.list.length) {
    renderTagCloud(tagCloudState.list);
  }
}

export const tagCloudApi = {
  render: renderTagCloud,
  sort: (type) => {
    const activeTab = [...document.querySelectorAll('[data-tag-sort]')]
      .find((tab) => tab.dataset.tagSort === type) || null;
    sortTags(type, activeTab);
  },
};
