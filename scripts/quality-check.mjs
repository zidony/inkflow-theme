import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');

const bannedWindowGlobals = [
  'showToast',
  'lightboxData',
  'openSearch',
  'closeSearch',
  'filterAlbum',
  'openLightbox',
  'closeLightbox',
  'filterLinks',
  'toggleLinkApplyForm',
  'toggleReact',
  'copyCode',
  'copyLink',
  'scrollToComments',
  'setYear',
  'scrollToTop',
];

async function walk(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function relative(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function addIssue(issues, file, message) {
  issues.push(`${relative(file)}: ${message}`);
}

function getAttribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'))?.[1] || '';
}

function hasClass(tag, className) {
  return getAttribute(tag, 'class').split(/\s+/).includes(className);
}

function getFileName(file) {
  return relative(file).split('/').pop();
}

function checkCdnIntegrity(file, source, issues) {
  for (const match of source.matchAll(/<(?:link|script)\b[^>]*(?:href|src)=["']https:\/\/cdn\.jsdelivr\.net\/[^"']+["'][^>]*>/gi)) {
    const tag = match[0];
    if (!getAttribute(tag, 'integrity')) {
      addIssue(issues, file, 'jsDelivr resource is missing SRI integrity');
    }

    if (getAttribute(tag, 'crossorigin') !== 'anonymous') {
      addIssue(issues, file, 'jsDelivr resource is missing crossorigin="anonymous"');
    }
  }
}

function checkTextEncoding(file, source, issues) {
  if (source.charCodeAt(0) === 0xfeff) {
    addIssue(issues, file, 'UTF-8 BOM is not allowed in source templates');
  }

  const mojibakePattern = /\uFFFD|\u951f|\u9366|\u95c1|\u6fb6\u5db6/;
  if (mojibakePattern.test(source)) {
    addIssue(issues, file, 'possible mojibake or replacement character');
  }
}

function checkHtml(file, source, issues) {
  checkTextEncoding(file, source, issues);
  const localIds = new Set([...source.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]));
  const relFile = relative(file);

  if (!relFile.startsWith('src/partials/') && source.includes('<body')) {
    if (!source.includes('{{> scripts }}')) {
      addIssue(issues, file, 'page entry should include the shared scripts partial');
    }
    if (/bootstrap@5\.3\.8\/dist\/js\/bootstrap\.bundle\.min\.js|\/assets\/js\/inkflow\.js/.test(source)) {
      addIssue(issues, file, 'page entry should not duplicate shared script tags');
    }
  }

  const inlineStyles = source.match(/<[^>]+\sstyle\s*=/gi) || [];
  if (inlineStyles.length) addIssue(issues, file, `${inlineStyles.length} inline style attribute(s)`);

  const inlineHandlers = source.match(/<[^>]+\son[a-z]+\s*=/gi) || [];
  if (inlineHandlers.length) addIssue(issues, file, `${inlineHandlers.length} inline event handler(s)`);

  const duplicateClassAttrs = source.match(/<[^>]*\sclass="[^"]*"[^>]*\sclass="[^"]*"[^>]*>/gi) || [];
  if (duplicateClassAttrs.length) addIssue(issues, file, `${duplicateClassAttrs.length} duplicate class attribute(s)`);

  const nonSemanticInteractiveSpans = source.match(/<span\b[^>]*\bdata-(?:album-filter|link-filter|tag-sort)=/gi) || [];
  if (nonSemanticInteractiveSpans.length) addIssue(issues, file, `${nonSemanticInteractiveSpans.length} non-semantic interactive span(s)`);

  const nonSemanticSearchTips = source.match(/<span\b[^>]*\bclass=["'][^"']*\bsearch-tip\b/gi) || [];
  if (nonSemanticSearchTips.length) addIssue(issues, file, `${nonSemanticSearchTips.length} non-semantic search tip span(s)`);

  const nonSemanticTagPills = source.match(/<span\b[^>]*\bclass=["'][^"']*\btag-pill\b(?![^"']*\btag-sm\b)[^"']*["']/gi) || [];
  if (nonSemanticTagPills.length) addIssue(issues, file, `${nonSemanticTagPills.length} non-semantic tag pill span(s)`);

  const roleButtonElements = source.match(/<(?!button\b)[a-z0-9-]+\b[^>]*\brole=["']button["']/gi) || [];
  if (roleButtonElements.length) addIssue(issues, file, `${roleButtonElements.length} non-native role="button" element(s)`);

  const nonAnchorSocialButtons = source.match(/<(?!a\b)[a-z0-9-]+\b[^>]*\bclass=["'][^"']*\bsocial-btn\b(?!-footer\b)[^"']*["'][^>]*>/gi) || [];
  if (nonAnchorSocialButtons.length) addIssue(issues, file, `${nonAnchorSocialButtons.length} non-anchor author social button(s)`);

  for (const match of source.matchAll(/<div\b[^>]*\bclass=["'][^"']*(?:album-card-hover|photo-item-overlay)[^"']*["'][^>]*>/gi)) {
    const tag = match[0];
    if (!hasClass(tag, 'album-card-hover') && !hasClass(tag, 'photo-item-overlay')) continue;

    if (getAttribute(tag, 'aria-hidden') !== 'true') {
      addIssue(issues, file, 'decorative album overlay is missing aria-hidden="true"');
    }
  }

  const nonButtonAvatarTriggers = source.match(/<(?!button\b)[a-z0-9-]+\b[^>]*\bdata-avatar-trigger\b/gi) || [];
  if (nonButtonAvatarTriggers.length) addIssue(issues, file, `${nonButtonAvatarTriggers.length} non-button avatar trigger(s)`);

  for (const match of source.matchAll(/<button\b[^>]*\bid=["']navUserAvatar["'][^>]*>/gi)) {
    const tag = match[0];
    if (!getAttribute(tag, 'aria-expanded')) addIssue(issues, file, 'user avatar menu button is missing aria-expanded');
    if (!getAttribute(tag, 'aria-controls')) addIssue(issues, file, 'user avatar menu button is missing aria-controls');
  }

  for (const match of source.matchAll(/<input\b[^>]*>/gi)) {
    const tag = match[0];
    const type = getAttribute(tag, 'type').toLowerCase();
    const autocomplete = getAttribute(tag, 'autocomplete').toLowerCase();
    const searchText = `${getAttribute(tag, 'aria-label')} ${getAttribute(tag, 'placeholder')}`;

    if (type === 'email' && autocomplete !== 'email') {
      addIssue(issues, file, 'email input is missing autocomplete="email"');
    }
    if (type === 'url' && autocomplete !== 'url') {
      addIssue(issues, file, 'URL input is missing autocomplete="url"');
    }
    if (type === 'tel' && autocomplete !== 'tel') {
      addIssue(issues, file, 'telephone input is missing autocomplete="tel"');
    }
    if (/搜索/.test(searchText)) {
      if (type !== 'search') addIssue(issues, file, 'search input should use type="search"');
      if (autocomplete !== 'off') addIssue(issues, file, 'search input is missing autocomplete="off"');
    }
  }

  for (const match of source.matchAll(/<button\b[^>]*\bclass=["'][^"']*\bnavbar-toggler\b[^"']*["'][^>]*>/gi)) {
    const tag = match[0];
    if (getAttribute(tag, 'aria-controls') !== 'navMenu') {
      addIssue(issues, file, 'navbar toggler is missing aria-controls="navMenu"');
    }
    if (!getAttribute(tag, 'aria-expanded')) {
      addIssue(issues, file, 'navbar toggler is missing aria-expanded');
    }
  }

  for (const match of source.matchAll(/<button\b[^>]*(?:data-toggle-react|data-toggle-bookmark|auth-pwd-toggle)[^>]*>/gi)) {
    const tag = match[0];
    if (!getAttribute(tag, 'aria-pressed')) {
      addIssue(issues, file, 'stateful button is missing aria-pressed');
    }
    if (tag.includes('auth-pwd-toggle') && !getAttribute(tag, 'aria-controls')) {
      addIssue(issues, file, 'password toggle is missing aria-controls');
    }
  }

  for (const match of source.matchAll(/<button\b[^>]*\bclass=["'][^"']*\bview-btn\b[^"']*["'][^>]*>/gi)) {
    if (!getAttribute(match[0], 'aria-pressed')) {
      addIssue(issues, file, 'view toggle button is missing aria-pressed');
    }
  }

  for (const match of source.matchAll(/<button\b[^>]*\bclass=["'][^"']*\b(?:filter-tab|sort-tab|year-btn)\b[^"']*["'][^>]*>/gi)) {
    if (!getAttribute(match[0], 'aria-pressed')) {
      addIssue(issues, file, 'segmented control button is missing aria-pressed');
    }
  }

  for (const match of source.matchAll(/<button\b[^>]*\brole=["']tab["'][^>]*>/gi)) {
    const tag = match[0];
    if (!getAttribute(tag, 'aria-selected')) addIssue(issues, file, 'tab button is missing aria-selected');
    if (!getAttribute(tag, 'aria-controls')) addIssue(issues, file, 'tab button is missing aria-controls');
    if (!getAttribute(tag, 'tabindex')) addIssue(issues, file, 'tab button is missing roving tabindex');
  }

  for (const match of source.matchAll(/<button\b[^>]*\bid=["']doLoginBtn["'][^>]*>/gi)) {
    if (!getAttribute(match[0], 'aria-busy')) {
      addIssue(issues, file, 'login submit button is missing aria-busy');
    }
  }

  for (const match of source.matchAll(/<ul\b[^>]*\bclass=["'][^"']*\btoc-list\b[^"']*["'][^>]*>[\s\S]*?<\/ul>/gi)) {
    if (!/\bclass=["'][^"']*\bactive\b[^"']*["'][^>]*\baria-current=["']location["']/.test(match[0])) {
      addIssue(issues, file, 'active table-of-contents link is missing aria-current="location"');
    }
  }

  for (const match of source.matchAll(/<button\b[^>]*\bdata-toggle-link-apply\b[^>]*>/gi)) {
    const tag = match[0];
    if (getAttribute(tag, 'aria-controls') !== 'linkApplyForm') {
      addIssue(issues, file, 'link apply toggle is missing aria-controls="linkApplyForm"');
    }
    if (!getAttribute(tag, 'aria-expanded')) {
      addIssue(issues, file, 'link apply toggle is missing aria-expanded');
    }
  }

  for (const match of source.matchAll(/<div\b[^>]*\bid=["']linkApplyForm["'][^>]*>/gi)) {
    if (!/\bhidden\b/i.test(match[0])) {
      addIssue(issues, file, 'link apply form is missing initial hidden state');
    }
  }

  for (const match of source.matchAll(/<button\b[^>]*\bdata-demo-action\b[^>]*>/gi)) {
    if (!getAttribute(match[0], 'data-demo-message')) {
      addIssue(issues, file, 'demo action is missing data-demo-message');
    }
  }

  if (source.includes('data-save-notify')) {
    addIssue(issues, file, 'notification save action should use shared demo feedback');
  }

  if (source.includes('data-auth-forgot')) {
    addIssue(issues, file, 'forgot password action should use shared demo feedback');
  }

  const registerButton = source.match(/<button\b[^>]*\bid=["']doRegisterBtn["'][^>]*>/i)?.[0];
  if (registerButton && !/\bdata-demo-action\b/.test(registerButton)) {
    addIssue(issues, file, 'register submit action should use shared demo feedback');
  }

  for (const match of source.matchAll(/<button\b[^>]*\bclass=["'][^"']*\bcomment-action\b[^"']*["'][^>]*>/gi)) {
    if (!/\bdata-demo-action\b/.test(match[0])) {
      addIssue(issues, file, 'comment action is missing demo feedback');
    }
  }

  for (const match of source.matchAll(/<button\b[^>]*\bclass=["'][^"']*\bpage-link\b[^"']*["'][^>]*>/gi)) {
    const tag = match[0];
    if (/\bdisabled\b/.test(tag)) continue;
    if (!/\bdata-demo-action\b/.test(tag)) {
      addIssue(issues, file, 'enabled pagination button is missing demo feedback');
    }
  }

  for (const match of source.matchAll(/<div\b[^>]*\bdata-profile-section=["'][^"']+["'][^>]*>([\s\S]*?)(?=<div class="ink-card ink-card-xl ink-card-shadow profile-card|<div class="danger-zone|<\/main>)/gi)) {
    const section = match[1];
    for (const control of section.matchAll(/<(?:input|textarea)\b[^>]*\bclass=["'][^"']*\bink-input\b[^"']*["'][^>]*>/gi)) {
      if (!/\bprofile-input\b/.test(control[0])) {
        addIssue(issues, file, 'profile editable control is missing profile-input class');
      }
    }
  }

  for (const match of source.matchAll(/<(?:div|section)\b[^>]*\b(?:class=["'][^"']*\b(?:search-overlay|lightbox)\b[^"']*["']|id=["'](?:searchOverlay|lightbox)["'])[^>]*>/gi)) {
    const tag = match[0];
    if (getAttribute(tag, 'aria-hidden') === 'true' && !/\binert\b/i.test(tag)) {
      addIssue(issues, file, 'hidden overlay dialog is missing inert');
    }
  }

  for (const match of source.matchAll(/<a\b[^>]*>/gi)) {
    const tag = match[0];
    const href = getAttribute(tag, 'href');

    if (href === '#') {
      addIssue(issues, file, 'unexpected placeholder href="#" link');
    }

    const samePageAnchor = href.match(/^#([^#?]+)$/)?.[1];
    const fileAnchor = href.match(/^([^#?]+\.html)#([^#?]+)$/);
    if (samePageAnchor && !localIds.has(samePageAnchor)) {
      addIssue(issues, file, `missing local anchor target "${samePageAnchor}"`);
    }
    if (fileAnchor && fileAnchor[1] === getFileName(file) && !localIds.has(fileAnchor[2])) {
      addIssue(issues, file, `missing local anchor target "${fileAnchor[2]}"`);
    }

    if (getAttribute(tag, 'target') !== '_blank') continue;

    if (href === '#') {
      addIssue(issues, file, 'target="_blank" link uses placeholder href="#"');
    }

    const rel = getAttribute(tag, 'rel').split(/\s+/);
    if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
      addIssue(issues, file, 'target="_blank" link missing rel="noopener noreferrer"');
    }
  }

  checkCdnIntegrity(file, source, issues);
}

function checkJs(file, source, issues) {
  checkTextEncoding(file, source, issues);
  const relFile = relative(file);

  const customGlobalPattern = new RegExp(`window\\.(${bannedWindowGlobals.join('|')})\\b`, 'g');
  const customGlobals = source.match(customGlobalPattern) || [];
  if (customGlobals.length) addIssue(issues, file, `${customGlobals.length} banned custom window global reference(s)`);

  const htmlInjectionApis = source.match(/\.(?:innerHTML|outerHTML|insertAdjacentHTML)\b/g) || [];
  if (htmlInjectionApis.length) addIssue(issues, file, `${htmlInjectionApis.length} HTML injection API reference(s)`);

  const unsafeSelectorTemplates = source.match(/querySelector(?:All)?\(`[^`]*\$\{(?!escapeCssString\()/g) || [];
  if (unsafeSelectorTemplates.length) addIssue(issues, file, `${unsafeSelectorTemplates.length} unescaped dynamic selector template(s)`);

  if (source.includes('Math.random(')) {
    addIssue(issues, file, 'non-deterministic Math.random() usage');
  }

  const nativeBlockingDialogs = source.match(/\b(?:alert|confirm|prompt)\s*\(/g) || [];
  if (nativeBlockingDialogs.length) addIssue(issues, file, `${nativeBlockingDialogs.length} native blocking dialog call(s)`);

  const inlineStyleTemplates = source.match(/style\s*=\s*["'`]|style=\\["'`]/g) || [];
  if (inlineStyleTemplates.length) addIssue(issues, file, `${inlineStyleTemplates.length} generated inline style string(s)`);

  if (relFile === 'src/assets/js/components/auth.js' && !source.includes('function normalizeUser(')) {
    addIssue(issues, file, 'auth restore should normalize stored demo user data');
  }
}

function checkCss(file, source, issues) {
  checkTextEncoding(file, source, issues);

  if (relative(file) === 'src/assets/css/main.css' && !source.includes('@import "./utils/reduced-motion.css";')) {
    addIssue(issues, file, 'main stylesheet is missing reduced-motion import');
  }

  if (relative(file) === 'src/assets/css/utils/reduced-motion.css' && !source.includes('prefers-reduced-motion: reduce')) {
    addIssue(issues, file, 'reduced-motion stylesheet is missing prefers-reduced-motion media query');
  }
}

const files = await walk(srcDir);
const issues = [];

for (const file of files) {
  if (!/\.(html|js|css)$/.test(file)) continue;
  const source = await readFile(file, 'utf8');
  if (file.endsWith('.html')) checkHtml(file, source, issues);
  if (file.endsWith('.js')) checkJs(file, source, issues);
  if (file.endsWith('.css')) checkCss(file, source, issues);
}

if (issues.length) {
  console.error('Quality check failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Quality check passed.');
