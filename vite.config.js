import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        album: resolve(__dirname, 'album-list.html'),
        archive: resolve(__dirname, 'archive-list.html'),
        category: resolve(__dirname, 'category-list.html'),
        link: resolve(__dirname, 'link-list.html'),
        login: resolve(__dirname, 'login.html'),
        postList: resolve(__dirname, 'post-list.html'),
        postShow: resolve(__dirname, 'post-show.html'),
        profile: resolve(__dirname, 'profile.html'),
        tagList: resolve(__dirname, 'tag-list.html')
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets'
  }
});
