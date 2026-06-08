import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');

async function readDirSafe(dir) {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function addIssue(issues, file, message) {
  issues.push(`${file}: ${message}`);
}

function stripTags(source) {
  return source.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function getMetaContent(source, selector) {
  return source.match(selector)?.[1]?.trim() || '';
}

function checkLength(issues, file, label, value, min, max) {
  if (!value) {
    addIssue(issues, file, `missing ${label}`);
    return;
  }

  if (value.length < min || value.length > max) {
    addIssue(issues, file, `${label} length is ${value.length}, expected ${min}-${max}`);
  }
}

const entries = (await readDirSafe(srcDir))
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

const issues = [];
const titles = new Map();

for (const file of entries) {
  const source = await readFile(path.join(srcDir, file), 'utf8');
  const title = stripTags(getMetaContent(source, /<title>([\s\S]*?)<\/title>/i));
  const description = getMetaContent(source, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const ogTitle = getMetaContent(source, /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  const ogDescription = getMetaContent(source, /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
  const ogType = getMetaContent(source, /<meta\s+property=["']og:type["']\s+content=["']([^"']+)["']/i);
  const h1Count = [...source.matchAll(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi)].length;

  checkLength(issues, file, 'title', title, 8, 80);
  checkLength(issues, file, 'meta description', description, 40, 180);
  checkLength(issues, file, 'og:title', ogTitle, 8, 80);
  checkLength(issues, file, 'og:description', ogDescription, 30, 180);

  if (!ogType) addIssue(issues, file, 'missing og:type');
  if (h1Count !== 1) addIssue(issues, file, `expected exactly one h1, found ${h1Count}`);

  if (title) {
    const existing = titles.get(title) || [];
    existing.push(file);
    titles.set(title, existing);
  }
}

for (const [title, files] of titles) {
  if (files.length > 1) {
    addIssue(issues, files.join(', '), `duplicate title "${title}"`);
  }
}

if (issues.length) {
  console.error('SEO check failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`SEO check passed for ${entries.length} page entries.`);
