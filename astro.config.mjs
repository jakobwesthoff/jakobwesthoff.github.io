// @ts-check
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  output: 'static',

  devToolbar: {
    enabled: false
  },

  server: {
    port: 3000
  },

  integrations: [preact(), icon()],

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Inline small assets (images, fonts) smaller than 10KB
      assetsInlineLimit: 10240,
      // Minify output
      minify: 'esbuild',
      // CSS code splitting for optimization
      cssCodeSplit: true,
      // Generate module preload for all imports
      modulePreload: {
        polyfill: true
      }
    }
  },

  build: {
    // Inline stylesheets smaller than 4KB automatically
    inlineStylesheets: 'auto',
  },

  // Prefetch links for faster navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});