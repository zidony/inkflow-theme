import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { PurgeCSS } from 'purgecss';

import { resolve, basename, join, relative } from 'path';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const srcDir = resolve(__dirname, 'src');

/*
 * Asset delivery mode.
 * Default (self-hosted): Bootstrap, Bootstrap Icons and the web fonts are
 * bundled from node_modules into the local build — no external requests,
 * which matters most for mainland-China visitors where Google Fonts and
 * some CDNs are unreliable, and for GDPR (no third-party font calls).
 * Opt into CDN delivery with `INKFLOW_CDN=1 npm run build` when you would
 * rather serve these from jsDelivr / Google Fonts.
 */
const useCdn = process.env.INKFLOW_CDN === '1';

/*
 * Site-wide SEO configuration.
 * Replace `url` with your production origin (must end with a trailing slash).
 * This single source drives canonical links, og:url, og:image and JSON-LD
 * across every page — no per-file duplication.
 */
const site = {
  url: 'https://zidony.github.io/inkflow-theme/',
  name: 'INKFLOW',
  locale: 'zh_CN',
  twitter: '@inkflow',
  ogImage: 'og-cover.png',
};

function seoContext(pagePath) {
  const fileName = basename(pagePath.split('?')[0]);
  const isHome = fileName === 'index.html' || fileName === '';
  const canonical = isHome ? site.url : `${site.url}${fileName}`;
  return {
    site,
    canonical,
    cdn: useCdn,
    ogImageUrl: `${site.url}${site.ogImage}`,
  };
}

// Pages that belong in the public sitemap (auth pages are intentionally excluded).
const sitemapPages = [
  'index.html', 'post-list.html', 'post-show.html', 'category-list.html',
  'tag-list.html', 'archive-list.html', 'album-list.html', 'link-list.html',
];

/* Emits robots.txt and sitemap.xml at build time from the single `site` source. */
function seoFilesPlugin() {
  return {
    name: 'inkflow-seo-files',
    apply: 'build',
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const urls = sitemapPages.map((page) => {
        const loc = page === 'index.html' ? site.url : `${site.url}${page}`;
        const priority = page === 'index.html' ? '1.0' : '0.7';
        return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
      }).join('\n');

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
      const robots = `User-agent: *\nAllow: /\nDisallow: /login.html\n\nSitemap: ${site.url}sitemap.xml\n`;

      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
    },
  };
}

/*
 * CDN build mode (INKFLOW_CDN=1): strip the local vendor imports so Bootstrap,
 * its icons and the fonts are NOT bundled locally — the CDN tags in the head /
 * scripts partials deliver them instead. Path-agnostic (matches by module id
 * suffix) so it is robust across OS path separators.
 */
function stripVendorPlugin() {
  return {
    name: 'inkflow-strip-vendor',
    enforce: 'pre',
    transform(code, id) {
      const normalized = id.replace(/\\/g, '/');
      if (normalized.endsWith('assets/js/inkflow.js')) {
        return { code: code.replace(/^\s*import\s+['"]\.\/vendor\.js['"];?\s*$/m, ''), map: null };
      }
      if (normalized.endsWith('assets/css/main.css')) {
        return { code: code.replace(/^\s*@import\s+["']\.\/vendor\.css["'];?\s*$/m, ''), map: null };
      }
      return null;
    },
  };
}

/*
 * Removes unused CSS at build time using the maintained purgecss core directly
 * (the vite-plugin-purgecss wrapper was dropped — it bundled a vulnerable, stale
 * Vite/js-yaml). Scans the EMITTED HTML and JS so rendered partials and string
 * literals in the bundle are seen. The safelist covers classes added/constructed
 * dynamically at runtime that never appear verbatim in the scanned content.
 */
function purgeCssPlugin() {
  return {
    name: 'inkflow-purgecss',
    apply: 'build',
    enforce: 'post',
    async generateBundle(_options, bundle) {
      const content = [];
      let cssFile;
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (fileName.endsWith('.html') && asset.type === 'asset') {
          content.push({ raw: String(asset.source), extension: 'html' });
        } else if (fileName.endsWith('.js') && asset.type === 'chunk') {
          content.push({ raw: asset.code, extension: 'js' });
        } else if (fileName.endsWith('.css') && asset.type === 'asset') {
          cssFile = asset;
        }
      }
      if (!cssFile) return;

      const [result] = await new PurgeCSS().purge({
        content,
        css: [{ raw: String(cssFile.source) }],
        // Keep Chinese tokens and Bootstrap word boundaries intact.
        defaultExtractor: (text) => text.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: {
          standard: [
            'show', 'fade', 'active', 'collapsed', 'collapsing', 'modal-open',
            'd-none', 'd-flex', 'visible', 'open', 'scrolled', 'liked',
            'is-filtered-out', 'is-parallax-ready', 'is-pressed', 'is-spinning',
            'is-scroll-locked', 'link-filter-item', 'profile-avatar-has-image',
            'modal-backdrop', 'visually-hidden',
          ],
          greedy: [
            /^bi-/, /^ink-toast/, /^streak-dot/, /^u-lightbox/,
            /^modal/, /^offcanvas/, /^dropdown/, /^collapse/, /^carousel/,
            /^tooltip/, /^popover/, /^toast/, /data-bs-theme/,
          ],
        },
      });

      cssFile.source = result.css;
    },
  };
}

/* Emits dist/assets/js/manifest.json at build end: package version, source Git
 * SHA, build date and a per-file SHA-256 map. Gives CMS sync scripts a
 * machine-readable record of which dist files belong to which build, so
 * artifacts can be verified (and traceable) instead of trusted by copy-paste.
 * Not part of the page payload — build metadata only. */
function buildManifestPlugin() {
  return {
    name: 'inkflow-build-manifest',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const files = {};
      const walk = (dir) => {
        for (const entry of readdirSync(dir)) {
          const full = join(dir, entry);
          const st = statSync(full);
          if (st.isDirectory()) {
            walk(full);
          } else {
            const rel = relative(distDir, full).split('\\').join('/');
            const digest = createHash('sha256').update(readFileSync(full)).digest('hex');
            files[rel] = `sha256-${digest}`;
          }
        }
      };
      walk(distDir);

      let gitSha = null;
      try {
        gitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      } catch (e) {
        gitSha = null;
      }

      const pkgPath = join(__dirname, 'package.json');
      const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')) : {};

      const manifest = {
        name: pkg.name || 'inkflow-theme',
        version: pkg.version || '0.0.0',
        gitSha,
        buildDate: new Date().toISOString(),
        entry: 'assets/js/inkflow.js',
        runtimeDeps: ['assets/js/rolldown-runtime.js'],
        files,
      };
      writeFileSync(join(distDir, 'assets', 'js', 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    },
  };
}

export default defineConfig({
  root: srcDir,
  base: './',

  plugins: [
    ...(useCdn ? [stripVendorPlugin()] : []),
    handlebars({
      partialDirectory: resolve(srcDir, 'partials'),
      context: seoContext,
    }),
    seoFilesPlugin(),
    purgeCssPlugin(),
    buildManifestPlugin(),
  ],
  build: {
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      input: {
        index: resolve(srcDir, 'index.html'),
        postList: resolve(srcDir, 'post-list.html'),
        postShow: resolve(srcDir, 'post-show.html'),
        categoryList: resolve(srcDir, 'category-list.html'),
        tagList: resolve(srcDir, 'tag-list.html'),
        archiveList: resolve(srcDir, 'archive-list.html'),
        albumList: resolve(srcDir, 'album-list.html'),
        albumShow: resolve(srcDir, 'album.html'),
        linkList: resolve(srcDir, 'link-list.html'),
        profilePage: resolve(srcDir, 'profile.html'),
        loginPage: resolve(srcDir, 'login.html')
      },
      output: {
        manualChunks(id) {
          // Tree-shaken Bootstrap vendor bundle lives in its own stable chunk so
          // the theme core stays small; page chunks (dynamic import()) are then
          // emitted naturally by Rolldown per page module.
          if (id.includes('node_modules/bootstrap')) {
            return 'inkflow-vendor';
          }
          return undefined;
        },
        entryFileNames: 'assets/js/[name].js',
        chunkFileNames: 'assets/js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/inkflow.css';
          }
          // Fonts (woff, woff2, ttf, eot) go to assets/fonts/
          if (assetInfo.name && /\.(woff2?|ttf|eot)$/i.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[ext]/[name]-[hash][extname]';
        }
      }
    },
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    assetsDir: 'assets',
    cssCodeSplit: false
  }
});
