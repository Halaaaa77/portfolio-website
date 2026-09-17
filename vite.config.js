import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const source = resolve('assets');
      const target = resolve('dist/assets');

      if (!existsSync(source)) return;
      mkdirSync(target, { recursive: true });
      cpSync(source, target, { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  // Keep generated URLs relative so the site works under the GitHub Pages
  // repository path (for example /portfolio-website/).
  base: './',
  plugins: [copyStaticAssets()],
});
