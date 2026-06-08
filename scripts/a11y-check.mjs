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

function checkButtons(file, source, issues) {
  for (const match of source.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const [, attrs, content] = match;
    if (!hasAccessibleName(attrs, content)) {
      addIssue(issues, file, 'button is missing an accessible name');
    }
  }
}

const files = await walk(srcDir);
const issues = [];

for (const file of files) {
  if (!file.endsWith('.html')) continue;
  const source = await readFile(file, 'utf8');
  checkDuplicateIds(file, source, issues);
  checkImages(file, source, issues);
  checkButtons(file, source, issues);
}

if (issues.length) {
  console.error('Accessibility check failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log('Accessibility check passed.');
