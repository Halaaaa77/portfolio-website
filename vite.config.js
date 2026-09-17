import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths keep the production build deployable under a GitHub Pages repo subpath.
  base: './',
});
