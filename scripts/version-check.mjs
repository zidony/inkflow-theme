import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const expectedVersionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function resolveRoot(file) {
  return path.join(root, file);
}

function addIssue(issues, file, message) {
  issues.push(`${file}: ${message}`);
}

async function readJson(file, issues) {
  try {
    return JSON.parse(await readFile(resolveRoot(file), 'utf8'));
  } catch (error) {
    addIssue(issues, file, `could not read valid JSON (${error.message})`);
    return null;
  }
}

async function readText(file, issues) {
  try {
    return await readFile(resolveRoot(file), 'utf8');
  } catch (error) {
    addIssue(issues, file, `could not read file (${error.message})`);
    return '';
  }
}

function checkReadmeBadge(file, source, version, issues) {
  const badgePattern = /https:\/\/img\.shields\.io\/badge\/version-([^-)]+)-green/;
  const match = source.match(badgePattern);

  if (!match) {
    addIssue(issues, file, 'missing version badge');
    return;
  }

  if (match[1] !== version) {
    addIssue(issues, file, `version badge is ${match[1]}, expected ${version}`);
  }
}

function checkReleaseScript(source, packageName, version, issues) {
  const requiredPatterns = [
    {
      pattern: 'const zipFilename = `${name}-v${version}.zip`;',
      message: 'ZIP filename should be derived from package name and version',
    },
    {
      pattern: 'const topFolder = `${name}-v${version}`;',
      message: 'ZIP top folder should be derived from package name and version',
    },
  ];

  for (const { pattern, message } of requiredPatterns) {
    if (!source.includes(pattern)) addIssue(issues, 'scripts/release.mjs', message);
  }

  if (!source.includes("const packageJsonPath = path.join(rootDir, 'package.json');")) {
    addIssue(issues, 'scripts/release.mjs', 'release metadata should be read from package.json');
  }

  if (!packageName || !version) return;
}

const issues = [];
const pkg = await readJson('package.json', issues);
const lock = await readJson('package-lock.json', issues);
const readme = await readText('README.md', issues);
const readmeEn = await readText('README.en.md', issues);
const releaseScript = await readText('scripts/release.mjs', issues);

if (pkg) {
  if (!pkg.name) addIssue(issues, 'package.json', 'missing package name');
  if (!pkg.version) {
    addIssue(issues, 'package.json', 'missing package version');
  } else if (!expectedVersionPattern.test(pkg.version)) {
    addIssue(issues, 'package.json', `version ${pkg.version} is not valid semver`);
  }
}

if (pkg && lock) {
  if (lock.name !== pkg.name) {
    addIssue(issues, 'package-lock.json', `root name is ${lock.name}, expected ${pkg.name}`);
  }

  if (lock.version !== pkg.version) {
    addIssue(issues, 'package-lock.json', `top-level version is ${lock.version}, expected ${pkg.version}`);
  }

  const rootPackage = lock.packages?.[''];
  if (!rootPackage) {
    addIssue(issues, 'package-lock.json', 'missing root packages[""] entry');
  } else {
    if (rootPackage.name !== pkg.name) {
      addIssue(issues, 'package-lock.json', `root package name is ${rootPackage.name}, expected ${pkg.name}`);
    }

    if (rootPackage.version !== pkg.version) {
      addIssue(issues, 'package-lock.json', `root package version is ${rootPackage.version}, expected ${pkg.version}`);
    }
  }
}

if (pkg?.version) {
  checkReadmeBadge('README.md', readme, pkg.version, issues);
  checkReadmeBadge('README.en.md', readmeEn, pkg.version, issues);
}

checkReleaseScript(releaseScript, pkg?.name, pkg?.version, issues);

if (issues.length) {
  console.error('Version consistency check failed:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Version consistency check passed for v${pkg.version}.`);
