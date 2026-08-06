/**
 * Inkflow component registry.
 *
 * Replaces the ad-hoc per-module `initOnce` data-attribute markers with a
 * single registry that owns the init/destroy lifecycle. `initialized` is a
 * WeakSet keyed by the DOM element, so components can be re-initialized after
 * dynamic DOM changes without leaving `data-inkflow*Initialized` residue.
 *
 * A component definition:
 *   {
 *     selector: '#mainNavbar',        // queried when no explicit root is given
 *     init:     (root) => void,       // required
 *     destroy:  (root) => void | null,// optional
 *     auto:     true,                 // false = only init via Inkflow.init()
 *   }
 */
const components = new Map();
const initialized = new WeakSet();

/**
 * Register a component definition.
 * @param {string} name Unique component name (kebab-case).
 * @param {Object} def  { selector, init, destroy?, auto? }
 * @returns {string} the registered name.
 */
export function registerComponent(name, def) {
  if (!name || typeof name !== 'string') {
    throw new TypeError('registerComponent requires a component name');
  }
  if (!def || typeof def.init !== 'function') {
    throw new TypeError(`component "${name}" must define an init() function`);
  }
  components.set(name, {
    selector: def.selector || null,
    init: def.init,
    destroy: typeof def.destroy === 'function' ? def.destroy : null,
    auto: def.auto !== false,
  });
  return name;
}

/** True if a component with this name has been registered. */
export function hasComponent(name) {
  return components.has(name);
}

/** True if the component is currently initialized on the given target. */
export function isInitialized(name, target) {
  return initialized.has(resolveTarget(name, target));
}

function resolveTarget(name, root) {
  if (root) return root;
  const def = components.get(name);
  if (!def || !def.selector) return document;
  return document.querySelector(def.selector) || null;
}

/**
 * Initialize a single component. No-op if its target element is missing or it
 * is already initialized on that target. `init` may return a Promise (e.g. a
 * dynamically imported page module); the registry awaits it before marking the
 * component initialized.
 * @param {string} name
 * @param {Element} [root] Explicit element; falls back to the registered selector.
 * @returns {Promise<boolean>} resolves true when initialized.
 */
export async function initComponent(name, root) {
  const def = components.get(name);
  if (!def) return false;
  const target = resolveTarget(name, root);
  if (!target || initialized.has(target)) return false;
  try {
    await def.init(target);
    initialized.add(target);
    return true;
  } catch (err) {
    console.error(`Inkflow: failed to initialize component "${name}":`, err);
    return false;
  }
}

/**
 * Destroy a component (restores listeners/state if the component opts in).
 * @returns {boolean} true when destroyed.
 */
export function destroyComponent(name, root) {
  const def = components.get(name);
  if (!def || !def.destroy) return false;
  const target = resolveTarget(name, root);
  if (!target || !initialized.has(target)) return false;
  try {
    def.destroy(target);
    initialized.delete(target);
    return true;
  } catch (err) {
    console.error(`Inkflow: failed to destroy component "${name}":`, err);
    return false;
  }
}

/**
 * Initialize every registered auto component (or only those matching the
 * optional selector/root). Safe to call repeatedly; page components load their
 * modules via dynamic import() in parallel.
 * @param {Element} [root] Re-scan a container for dynamic content.
 * @returns {Promise<Array<{name: string, ok: boolean}>>} per-component results.
 */
export function initAll(root) {
  const tasks = [];
  for (const name of components.keys()) {
    const def = components.get(name);
    if (!def.auto) continue;
    const target = root ? (root.matches?.(def.selector || '*') ? root : root.querySelector(def.selector)) : resolveTarget(name);
    if (!target || initialized.has(target)) continue;
    tasks.push(initComponent(name, target).then((ok) => ({ name, ok })));
  }
  return Promise.all(tasks);
}
