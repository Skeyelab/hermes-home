# Hermes Signal

A signal-based AI and automation content site built with Next.js, Vitest, and Neon.

## What’s in here

- `src/lib/` — signal scoring and draft generation logic
- `src/content/` — publishable content records
- `src/app/` — Next.js app router pages and styles
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow

## Run locally

```bash
yarn install
yarn dev
```

## Test

```bash
yarn vitest run
```

## Build

```bash
yarn build
```

The site is configured for static export so it can deploy to GitHub Pages.
