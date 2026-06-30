# westhoffswelt.de

Personal portfolio site of Jakob Westhoff. A minimal, performance-focused
static site built with [Astro](https://astro.build), deployed to GitHub Pages
at [westhoffswelt.de](https://westhoffswelt.de).

## Stack

- **Astro 7** — static site generation (`output: 'static'`)
- **Preact** — islands for the few interactive components (`client:load`)
- **Tailwind CSS v4** — via the `@tailwindcss/vite` plugin (no config file)
- **TypeScript** — strict mode
- **Bun** — package manager and script runner

## Getting started

This project uses [Bun](https://bun.sh). Install it first, then:

```sh
bun install      # install dependencies
bun run dev      # dev server at http://localhost:3000
```

## Commands

| Command            | Action                                              |
| :----------------- | :-------------------------------------------------- |
| `bun install`      | Install dependencies                                |
| `bun run dev`      | Start the dev server at `localhost:3000`            |
| `bun run build`    | Type-check (`astro check`) and build to `./dist/`   |
| `bun run preview`  | Preview the production build locally                |
| `bun run lint`     | Lint with ESLint                                    |
| `bun run prettier` | Auto-fix formatting and lint issues (`eslint --fix`)|

## Structure

```text
src/
├── assets/       # images optimized at build time (avatar, slogan SVGs)
├── components/   # Preact islands + Astro components
├── layouts/      # shared BaseLayout
├── pages/        # file-based routes (index, projects, imprint)
└── styles/       # global CSS + Tailwind imports and custom animations
```

## Deployment

Building produces static files in `./dist/`, served via GitHub Pages.
The build optimizes images, inlines small assets and critical CSS, and
prefetches in-viewport links.
