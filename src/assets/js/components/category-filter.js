/**
 * Inkflow CategoryFilter component.
 *
 * Generic client-side category filtering with a declarative markup contract.
 */
import { initOnce } from '../core/utils.js';

function bindFilterClick(config) {
  const {
    triggerSelector,
    triggerDataKey,
    itemSelector,
    itemDataKey,
    statusId,
    resolveTarget = (item) => item,
    extraClass = '',
    countSuffix = '',
  } = config;

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest(triggerSelector);
    if (!trigger) return;

    const value = trigger.dataset[triggerDataKey];
    const scope = trigger.closest('[data-filter-scope]') || document;

    scope.querySelectorAll(triggerSelector).forEach((tab) => {
      const isActive = tab === trigger;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-pressed', String(isActive));
    });

    let visibleCount = 0;
    document.querySelectorAll(itemSelector).forEach((item) => {
      const target = resolveTarget(item);
      if (!target) return;
      if (extraClass) target.classList.add(extraClass);
      const visible = value === 'all' || item.dataset[itemDataKey] === value;
      if (visible) visibleCount += 1;
      target.classList.toggle('is-filtered-out', !visible);
    });

    const statusEl = document.getElementById(statusId);
    if (statusEl) {
      const label = trigger.textContent.trim() || '全部';
      statusEl.textContent = value === 'all'
        ? `显示全部 ${visibleCount} 个${countSuffix}`
        : `${label}分类显示 ${visibleCount} 个${countSuffix}`;
    }
  });
}

/** Factory for legacy filter markup (album/link list pages). */
export function createFilter(config) {
  return function initFilter() {
    bindFilterClick(config);
  };
}

function bindFilterScope(scope) {
  if (!scope || !initOnce(scope, 'filterScope')) return;

  scope.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-filter-value]');
    if (!trigger || !scope.contains(trigger)) return;
    const value = trigger.dataset.filterValue;

    scope.querySelectorAll('[data-filter-value]').forEach((tab) => {
      const isActive = tab === trigger;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-pressed', String(isActive));
    });

    let visibleCount = 0;
    scope.querySelectorAll('[data-filter-category]').forEach((item) => {
      const visible = value === 'all' || item.dataset.filterCategory === value;
      if (visible) visibleCount += 1;
      item.classList.toggle('is-filtered-out', !visible);
    });

    const statusEl = scope.querySelector('[data-filter-status]');
    if (statusEl) {
      const label = trigger.textContent.trim() || '全部';
      statusEl.textContent = value === 'all'
        ? `显示全部 ${visibleCount} 个`
        : `${label}分类显示 ${visibleCount} 个`;
    }
  });
}

/**
 * Initialize one explicit filter scope (registry/CMS usage), or all current
 * scopes when called without an argument through the public component API.
 */
export function initFilterScope(scope) {
  if (scope?.matches?.('[data-filter-scope]')) {
    bindFilterScope(scope);
    return;
  }
  document.querySelectorAll('[data-filter-scope]').forEach(bindFilterScope);
}
