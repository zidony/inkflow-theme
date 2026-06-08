import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');
const distDir = path.join(root, 'dist');

const skipReferencePattern = /^(?:#|[a-z][a-z0-9+.-]*:|\/\/)/i;
const localReferencePattern = /\.(?:html|css|js)(?:[?#].*)?$/i;

function normalize(file) {
  return file.replaceAll(path.sep, '/');
}

function stripSuffix(reference) {
  return reference.split(/[?#]/, 1)[0];
}

function addIssue(issues, file, message) {
  issues.push(`${file}: ${message}`);
}

async function fileExists(file) {
  try {
    const details = await stat(file);
    return details.isFile();
  } catch {
    return false;
  }
}

async function readDirSafe(dir) {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function getSourceEntries() {
  const entries = await readDirSafe(srcDir);
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function getHtmlReferences(source) {
  const references = [];
  const pattern = /\b(?:href|src)=["']([^"']+)["']/gi;
  let match;

  while ((match = pattern.exec(source))) {
    references.push(match[1]);
  }

  return references;
}

async function checkHtmlReferences(file, source, issues) {
  const references = getHtmlReferences(source);
  const baseDir = path.dirname(path.join(distDir, file));

  for (const reference of references) {
    if (skipReferencePattern.test(reference)) continue;
    if (/(?:^|\/)src\//.test(reference) || reference.includes('src/assets/')) {
      addIssue(issues, file, `source directory reference leaked into dist: ${reference}`);
      continue;
    }

    if (!localReferencePattern.test(reference)) continue;

    const target = stripSuffix(reference);
    const targetPath = path.resolve(baseDir, target);
    const relativeTarget = normalize(path.relative(distDir, targetPath));

    if (relativeTarget.startsWith('..')) {
      addIssue(issues, file, `local reference escapes dist/: ${reference}`);
      continue;
    }

    if (!(await fileExists(targetPath))) {
      addIssue(issues, file, `missing local reference: ${reference}`);
    }
  }
}

async function checkBuiltPage(file, issues) {
  const fullPath = path.join(distDir, file);
  const source = await readFile(fullPath, 'utf8');

  if (source.includes('{{>') || source.includes('{{#') || source.includes('{{/')) {
    addIssue(issues, file, 'unresolved Handlebars template syntax');
  }

  await checkHtmlReferences(file, source, issues);
}

const issues = [];
const sourceEntries = await getSourceEntries();

if (!sourceEntries.length) {
  addIssue(issues, 'src', 'no HTML entry files found');
}

for (const entry of sourceEntries) {
  if (!(await fileExists(path.join(distDir, entry)))) {
    addIssue(issues, 'dist', `missing built HTML entry: ${entry}`);
  }
}

if (!(await fileExists(path.join(distDir, 'assets/css/inkflow.css')))) {
  addIssue(issues, 'dist', 'missing assets/css/inkflow.css');
}

if (!(await fileExists(path.join(distDir, 'assets/js/inkflow.js')))) {
  addIssue(issues, 'dist', 'missing assets/js/inkflow.js');
}

for (const entry of sourceEntries) {
  if (await fileExists(path.join(distDir, entry))) {
    await checkBuiltPage(entry, issues);
  }
}

if (issues.length) {
  console.error('Dist check failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Dist check passed for ${sourceEntries.length} page entries.`);
