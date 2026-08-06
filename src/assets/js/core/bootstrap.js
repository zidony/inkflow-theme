/**
 * Inkflow global API bootstrap.
 *
 * Exposes a small, stable programmatic surface for CMS integration while the
 * theme itself stays CMS-agnostic:
 *
 *   Inkflow.init()                       re-scan/init registered components
 *   Inkflow.init(root)                   initialize components inside a container
 *   Inkflow.destroy('lightbox')          teardown a component (opt-in)
 *   Inkflow.components.<name>            per-component programmatic APIs
 *   Inkflow.events.on/off/emit           CustomEvent helpers (see core/events.js)
 *
 * The `version` field is read from package.json so the runtime always matches
 * the shipped release.
 */
import pkg from '../../../../package.json';
import { initAll, initComponent, destroyComponent } from './registry.js';
import * as InkflowEvents from './events.js';

/** Per-component programmatic APIs (populated by the entry point). */
export const components = {};

export const Inkflow = {
  version: pkg.version,
  components,

  /** CustomEvent helpers (`Inkflow.events.on('inkflow:toast', fn)`). */
  events: InkflowEvents,

  /**
   * Initialize all registered auto components, optionally scoped to a container
   * (useful after dynamic DOM insertion). Idempotent.
   */
  init(root) {
    return initAll(root || undefined);
  },

  /** Initialize a single named component on its registered selector/root. */
  initComponent(name, root) {
    return initComponent(name, root);
  },

  /** Destroy a component (no-op for components without a destroy hook). */
  destroy(name, root) {
    return destroyComponent(name, root);
  },
};

/**
 * Attach the Inkflow API to the global scope. Called once by the entry point;
 * guarded so re-entry is harmless.
 */
export function attachInkflow(api = Inkflow) {
  if (typeof globalThis !== 'undefined' && !globalThis.Inkflow) {
    globalThis.Inkflow = api;
  }
  return api;
}
