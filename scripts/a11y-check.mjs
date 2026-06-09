import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');

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

function stripTags(source) {
  return source.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function hasAccessibleName(tag, content = '') {
  if (/\b(?:aria-label|aria-labelledby|title)\s*=/.test(tag)) return true;
  return stripTags(content).length > 0;
}

function getAttribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'))?.[1] || '';
}

function checkDuplicateIds(file, source, issues) {
  const ids = new Map();
  for (const match of source.matchAll(/\bid=["']([^"']+)["']/g)) {
    const id = match[1];
    ids.set(id, (ids.get(id) || 0) + 1);
  }

  for (const [id, count] of ids) {
    if (count > 1) addIssue(issues, file, `duplicate id "${id}" appears ${count} times`);
  }
}

function checkImages(file, source, issues) {
  for (const match of source.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=/.test(match[0])) {
      addIssue(issues, file, 'image is missing alt attribute');
    }
  }
}

function checkIcons(file, source, issues) {
  for (const match of source.matchAll(/<i\b[^>]*\bclass=["'][^"']*\bbi\b[^"']*["'][^>]*>/gi)) {
    const tag = match[0];
    if (/\baria-hidden=["']true["']/.test(tag) || /\b(?:aria-label|role)\s*=/.test(tag)) continue;
    addIssue(issues, file, 'Bootstrap icon is missing aria-hidden="true" or an explicit semantic role');
  }
}

function checkButtons(file, source, issues) {
  for (const match of source.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const [, attrs, content] = match;
    if (!hasAccessibleName(attrs, content)) {
      addIssue(issues, file, 'button is missing an accessible name');
    }
    if (/\btitle\s*=/.test(attrs) && !/\b(?:aria-label|aria-labelledby)\s*=/.test(attrs) && stripTags(content).length === 0) {
      addIssue(issues, file, 'icon-only button with title is missing aria-label');
    }
  }
}

function checkLinks(file, source, issues) {
  for (const match of source.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const [, attrs, content] = match;
    if (!hasAccessibleName(attrs, content)) {
      addIssue(issues, file, 'link is missing an accessible name');
    }
  }
}

function checkFormControls(file, source, issues) {
  for (const match of source.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) {
    const [tag, element] = match;
    const type = getAttribute(tag, 'type').toLowerCase();
    if (['hidden', 'submit', 'button', 'reset'].includes(type)) continue;
    if (hasAccessibleName(tag)) continue;

    const id = getAttribute(tag, 'id');
    const hasLabel = id && new RegExp(`<label\\b[^>]*\\bfor=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(source);
    if (!hasLabel) addIssue(issues, file, `${element} is missing an accessible name`);
  }
}

function checkAuthLabels(file, source, issues) {
  for (const match of source.matchAll(/<label\b[^>]*\bclass=["'][^"']*\b(?:auth-label|profile-label)\b[^"']*["'][^>]*>/gi)) {
    const tag = match[0];
    if (!getAttribute(tag, 'for')) {
      addIssue(issues, file, 'form label is missing for attribute');
    }
  }
}

function checkPaginationNavs(file, source, issues) {
  for (const match of source.matchAll(/<nav\b([^>]*)>[\s\S]*?\bpagination\b[\s\S]*?<\/nav>/gi)) {
    const [, attrs] = match;
    if (!/\b(?:aria-label|aria-labelledby)\s*=/.test(attrs)) {
      addIssue(issues, file, 'pagination nav is missing an accessible label');
    }
  }
}

function extractIds(source) {
  return [...source.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
}

function checkAriaIdReferences(file, source, sharedIds, issues) {
  const ids = new Set([...extractIds(source), ...sharedIds]);
  const idRefAttributes = ['aria-controls', 'aria-describedby', 'aria-labelledby'];

  for (const attr of idRefAttributes) {
    for (const match of source.matchAll(new RegExp(`\\b${attr}=["']([^"']+)["']`, 'gi'))) {
      for (const id of match[1].trim().split(/\s+/)) {
        if (id && !ids.has(id)) {
          addIssue(issues, file, `${attr} references missing id "${id}"`);
        }
      }
    }
  }
}

const files = await walk(srcDir);
const issues = [];
const htmlFiles = files.filter(file => file.endsWith('.html'));
const sharedPartialIds = new Set();

for (const file of htmlFiles) {
  if (!relative(file).startsWith('src/partials/')) continue;
  const source = await readFile(file, 'utf8');
  for (const id of extractIds(source)) sharedPartialIds.add(id);
}

for (const file of htmlFiles) {
  const source = await readFile(file, 'utf8');
  checkDuplicateIds(file, source, issues);
  checkImages(file, source, issues);
  checkIcons(file, source, issues);
  checkButtons(file, source, issues);
  checkLinks(file, source, issues);
  checkFormControls(file, source, issues);
  checkAuthLabels(file, source, issues);
  checkPaginationNavs(file, source, issues);
  checkAriaIdReferences(file, source, sharedPartialIds, issues);
}

if (issues.length) {
  console.error('Accessibility check failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Accessibility check passed.');
