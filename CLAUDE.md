# CLAUDE.md

Guidance for Claude Code in this repository. Stack, commands, project
structure, and deployment live in [README.md](./README.md). This file only
records what isn't obvious from a glance at the code or the README.

## Package manager: Bun, never npm

This project uses [Bun](https://bun.sh) exclusively — note `bun.lock`, not a
`package-lock.json`. Use `bun install`, `bun add`, and `bun run <script>`.

`npm install` fails outright. The tree carries a peer conflict
(`eslint-plugin-jsx-a11y` wants ESLint <10 while the project is on ESLint 10)
that Bun resolves leniently but npm rejects. Do not paper over it with
`--legacy-peer-deps`; just use Bun.

## Before committing

Run all three from the project root and make sure they pass:

1. `bun run lint` — ESLint
2. `bun run prettier` — auto-fix pass. This runs `eslint --fix`, not Prettier
   standalone (Prettier is wired in as an ESLint plugin).
3. `bun run build` — `astro check` type validation, then the static build.

## Adding an astro-icon icon

`astro-icon` is configured with an explicit `include` allow-list in
`astro.config.mjs`. Any new `@iconify-json/*` set must be listed there (even
as an empty array) or the dev server 500s on every page that renders an icon.
The reasoning is in the comment at that config block.
