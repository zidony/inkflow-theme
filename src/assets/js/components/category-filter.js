/**
 * Inkflow CategoryFilter component.
 *
 * Generic client-side category filtering with a declarative markup contract:
 *
 *   <div data-filter-scope>
 *     <button data-filter-value="all">全部</button>
 *     <button data-filter-value="kyoto">京都</button>
 *     ...
 *     <div class="card" data-filter-category="kyoto">…</div>
 *     <output data-filter-status role="status" aria-live="polite"></output>
 *   </div>
 *
 * The `createFilter()` factory adapts legacy pages (album/link lists) that use
 * their own data attributes and status element ids, so no HTML changes are
 * required to adopt the component.
 *
 * Filtered-out items receive the `.is-filtered-out` class; the active trigger
 * gets `.active` + `aria-pressed` (mutually exclusive within its scope).
 */

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

/**
 * Factory for legacy filter markup (album list, link list pages).
 * @param {Object} config See bindFilterClick for the option shape.
 * @returns {() => void} init function suitable for the component registry.
 */
export function createFilter(config) {
  return function initFilter() {
    bindFilterClick(config);
  };
}

/**
 * Standard `data-filter-*` auto-init for new pages / CMS templates.
 * Triggers `[data-filter-value]`, items `[data-filter-category]`, status
 * `[data-filter-status]`, all scoped by the nearest `[data-filter-scope]`.
 */
export function initFilterScope() {
  const scopes = document.querySelectorAll('[data-filter-scope]');
  if (!scopes.length) return;

  scopes.forEach((scope) => {
    scope.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-filter-value]');
      if (!trigger) return;
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
  });
}
