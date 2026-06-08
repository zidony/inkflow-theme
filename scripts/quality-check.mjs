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

function checkHtml(file, source, issues) {
  const inlineStyles = source.match(/<[^>]+\sstyle\s*=/gi) || [];
  if (inlineStyles.length) addIssue(issues, file, `${inlineStyles.length} inline style attribute(s)`);

  const inlineHandlers = source.match(/<[^>]+\son[a-z]+\s*=/gi) || [];
  if (inlineHandlers.length) addIssue(issues, file, `${inlineHandlers.length} inline event handler(s)`);

  const duplicateClassAttrs = source.match(/<[^>]*\sclass="[^"]*"[^>]*\sclass="[^"]*"[^>]*>/gi) || [];
  if (duplicateClassAttrs.length) addIssue(issues, file, `${duplicateClassAttrs.length} duplicate class attribute(s)`);

  if (/[�]|[鍙嬫儏閾炬帴灞曪紑棣栭〉]/.test(source)) {
    addIssue(issues, file, 'possible mojibake or replacement character');
  }

  for (const match of source.matchAll(/<a\b[^>]*>/gi)) {
    const tag = match[0];
    const href = getAttribute(tag, 'href');

    if (href === '#') {
      const allowedPlaceholder =
        tag.includes('page-link');

      if (!allowedPlaceholder) {
        addIssue(issues, file, 'unexpected placeholder href="#" link');
      }
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
}

function checkJs(file, source, issues) {
  const customGlobalPattern = new RegExp(`window\\.(${bannedWindowGlobals.join('|')})\\b`, 'g');
  const customGlobals = source.match(customGlobalPattern) || [];
  if (customGlobals.length) addIssue(issues, file, `${customGlobals.length} banned custom window global reference(s)`);

  const inlineStyleTemplates = source.match(/style\s*=\s*["'`]|style=\\["'`]/g) || [];
  if (inlineStyleTemplates.length) addIssue(issues, file, `${inlineStyleTemplates.length} generated inline style string(s)`);
}

const files = await walk(srcDir);
const issues = [];

for (const file of files) {
  if (!/\.(html|js)$/.test(file)) continue;
  const source = await readFile(file, 'utf8');
  if (file.endsWith('.html')) checkHtml(file, source, issues);
  if (file.endsWith('.js')) checkJs(file, source, issues);
}

if (issues.length) {
  console.error('Quality check failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Quality check passed.');
