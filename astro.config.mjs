// @ts-check
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  output: 'static',

  // Deployed origin (custom domain). Enables absolute URL generation for
  // canonical links, OpenGraph tags, sitemap, and RSS when those are added.
  site: 'https://westhoffswelt.de',

  devToolbar: {
    enabled: false
  },

  server: {
    port: 3000
  },

  integrations: [
    preact(),
    // astro-icon bundles every installed @iconify-json/* set in full into one
    // virtual module unless each collection is narrowed here. Left unbounded the
    // module reaches several MB, which overflows es-module-lexer's WASM memory in
    // Vite 8's dev import-analysis and 500s every page that renders an icon. So
    // we list exactly the icons used. Any new @iconify-json set must likewise be
    // listed (even as an empty array) or it bundles fully and breaks dev again.
    icon({
      include: {
        logos: ["github-icon", "google-gmail", "linkedin-icon", "twitch", "youtube-icon"],
      },
    }),
  ],

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