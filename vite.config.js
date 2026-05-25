import { defineConfig } from 'vite';
import { resolve } from 'path';

const srcDir = resolve(__dirname, 'src');

export default defineConfig({
  root: srcDir,
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(srcDir, 'index.html'),
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
        manualChunks: () => 'inkflow',
        entryFileNames: 'assets/js/inkflow.js',
        chunkFileNames: 'assets/js/inkflow.js',
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
