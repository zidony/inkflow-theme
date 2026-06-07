import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import purgecss from 'vite-plugin-purgecss';

import { resolve } from 'path';

const srcDir = resolve(__dirname, 'src');

export default defineConfig({
  root: srcDir,
  base: './',

  plugins: [
    handlebars({
      partialDirectory: resolve(srcDir, 'partials'),
    }),
    /* purgecss({
      safelist: ['scrolled', 'open', 'active', 'visible', 'ink-toast--visible', 'show', 'liked', 'd-none', 'danger', 'success', 'error', 'ink-toast--success', 'ink-toast--error'],
    }), */
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
        linkList: resolve(srcDir, 'link-list.html'),
        profile: resolve(srcDir, 'profile.html'),
        login: resolve(srcDir, 'login.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('.js') || id.includes('vite/modulepreload-polyfill')) {
            return 'inkflow';
          }
        },
        entryFileNames: 'assets/js/[name].js',
        chunkFileNames: 'assets/js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/inkflow.css';
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
