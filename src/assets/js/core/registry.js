/**
 * Inkflow component registry.
 *
 * Initialization state is tracked per component and per DOM target. This is
 * important when two components share one target (for example `toast` and
 * `keyboard` both use `body`) and when a CMS inserts multiple component roots.
 * In-flight initialization promises are also shared, making concurrent
 * `Inkflow.init()` calls idempotent.
 *
 * A component definition:
 *   {
 *     selector: '#mainNavbar',        // queried when no explicit root is given
 *     init:     (target) => void,     // required
 *     destroy:  (target) => void,     // optional
 *     auto:     true,                 // false = only init via Inkflow.initComponent()
 *     multiple: false,                // true = initialize every selector match
 *   }
 */
const components = new Map();
const initializedByComponent = new Map();
const inFlightByComponent = new Map();

function initializedTargets(name) {
  if (!initializedByComponent.has(name)) initializedByComponent.set(name, new WeakSet());
  return initializedByComponent.get(name);
}

function inFlightTargets(name) {
  if (!inFlightByComponent.has(name)) inFlightByComponent.set(name, new WeakMap());
  return inFlightByComponent.get(name);
}

/** Register a component definition. */
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
    multiple: def.multiple === true,
  });
  return name;
}

/** True if a component with this name has been registered. */
export function hasComponent(name) {
  return components.has(name);
}

function resolveTarget(name, target) {
  if (target) return target;
  const def = components.get(name);
  if (!def) return null;
  if (!def.selector) return document;
  return document.querySelector(def.selector);
}

function findTargets(def, root) {
  if (!def.selector) return [root || document];

  const scope = root || document;
  const matches = [];
  if (scope instanceof Element && scope.matches(def.selector)) matches.push(scope);

  if (typeof scope.querySelectorAll === 'function') {
    const descendants = scope.querySelectorAll(def.selector);
    if (def.multiple) matches.push(...descendants);
    else if (!matches.length && descendants[0]) matches.push(descendants[0]);
  }

  return def.multiple ? [...new Set(matches)] : matches.slice(0, 1);
}

/** True if the named component is initialized on the given target. */
export function isInitialized(name, target) {
  const resolved = resolveTarget(name, target);
  return Boolean(resolved && initializedTargets(name).has(resolved));
}

/**
 * Initialize one named component. Concurrent calls for the same component and
 * target share one promise, so listeners and other side effects run once.
 */
export function initComponent(name, target) {
  const def = components.get(name);
  if (!def) return Promise.resolve(false);

  const resolved = resolveTarget(name, target);
  if (!resolved) return Promise.resolve(false);

  const initialized = initializedTargets(name);
  if (initialized.has(resolved)) return Promise.resolve(false);

  const inFlight = inFlightTargets(name);
  const existing = inFlight.get(resolved);
  if (existing) return existing;

  const task = Promise.resolve()
    .then(() => def.init(resolved))
    .then(() => {
      initialized.add(resolved);
      return true;
    })
    .catch((err) => {
      console.error(`Inkflow: failed to initialize component "${name}":`, err);
      return false;
    })
    .finally(() => inFlight.delete(resolved));

  inFlight.set(resolved, task);
  return task;
}

/** Destroy a component that provides a destroy hook. */
export function destroyComponent(name, target) {
  const def = components.get(name);
  if (!def || !def.destroy) return false;

  const resolved = resolveTarget(name, target);
  const initialized = initializedTargets(name);
  if (!resolved || !initialized.has(resolved)) return false;

  try {
    def.destroy(resolved);
    initialized.delete(resolved);
    return true;
  } catch (err) {
    console.error(`Inkflow: failed to destroy component "${name}":`, err);
    return false;
  }
}

/**
 * Initialize every registered auto component inside `root` (or the document).
 * Components marked `multiple` are initialized for every matching target;
 * singleton/page components use the first matching sentinel.
 */
export function initAll(root) {
  const tasks = [];
  for (const [name, def] of components) {
    if (!def.auto) continue;
    for (const target of findTargets(def, root)) {
      tasks.push(initComponent(name, target).then((ok) => ({ name, ok })));
    }
  }
  return Promise.all(tasks);
}
