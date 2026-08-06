/* Inkflow theme pre-paint check — prevents FOUC (Flash of Unstyled Content).
 *
 * Loaded synchronously from <head> as a classic (non-module) script so it runs
 * before the first stylesheet paints. It is an external file on purpose: with a
 * strict Content-Security-Policy (no 'unsafe-inline') an inline script would be
 * blocked, silently breaking theme persistence. Keep this file dependency-free
 * and ES5-compatible — it must survive even the most conservative setup.
 */
(function () {
  'use strict';

  var savedTheme = null;
  try {
    savedTheme = localStorage.getItem('inkflow-theme');
  } catch (e) {
    savedTheme = null;
  }

  if (savedTheme !== 'light' && savedTheme !== 'dark') {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    savedTheme = prefersDark ? 'dark' : 'light';
  }

  document.documentElement.setAttribute('data-bs-theme', savedTheme);
})();
