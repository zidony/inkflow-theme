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

// Shared canonical/social tags are provided by the head partial (DRY).
const headPartial = await readFile(path.join(srcDir, 'partials', 'head.html'), 'utf8').catch(() => '');
const headProvides = {
  canonical: /<link\s+rel=["']canonical["']/i.test(headPartial),
  ogUrl: /<meta\s+property=["']og:url["']/i.test(headPartial),
  ogImage: /<meta\s+property=["']og:image["']/i.test(headPartial),
  twitterCard: /<meta\s+name=["']twitter:card["']/i.test(headPartial),
  themeColor: /<meta\s+name=["']theme-color["']/i.test(headPartial),
};
for (const [key, present] of Object.entries(headProvides)) {
  if (!present) addIssue(issues, 'src/partials/head.html', `head partial is missing shared ${key} tag`);
}

function checkJsonLd(file, source) {
  for (const match of source.matchAll(/<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/gi)) {
    // Strip Handlebars expressions before validating JSON structure.
    const json = match[1].replace(/\{\{[^}]*\}\}/g, 'x');
    try {
      const parsed = JSON.parse(json);
      if (!parsed['@context'] || !parsed['@type']) {
        addIssue(issues, file, 'JSON-LD block is missing @context or @type');
      }
    } catch {
      addIssue(issues, file, 'JSON-LD block is not valid JSON');
    }
  }
}

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

  // Every page entry must pull in the shared head partial (canonical/og:image/icons).
  if (!/\{\{>\s*head\s*\}\}/.test(source)) {
    addIssue(issues, file, 'page entry is missing the shared head partial');
  }

  checkJsonLd(file, source);

  // Article pages should ship BlogPosting structured data for rich results.
  if (ogType === 'article' && !/"@type":\s*"BlogPosting"/.test(source)) {
    addIssue(issues, file, 'article page is missing BlogPosting JSON-LD');
  }

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
