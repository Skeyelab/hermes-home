# Hermes Home Agent Guide

This file is the first thing an agent should read before changing this repo.

## Goals
- Keep changes small, testable, and easy to review.
- Prefer simple implementations over clever ones.
- Preserve the existing product shape unless the task explicitly asks for a redesign.

## Workflow
1. Inspect the current branch and relevant files before editing.
2. Make the smallest change that solves the problem.
3. Add or update tests with the code change.
4. Run targeted verification first, then broader checks if the change is non-trivial.
5. Commit on a feature branch. Do not work directly on `main`.

## Required conventions
- Use **Yarn** for package management and scripts.
- Use **TDD** for new behavior and bug fixes.
- Keep repository changes focused; avoid drive-by refactors.
- Do not introduce Docker packaging or deployment machinery unless explicitly requested.
- Keep UI work calm and minimal; avoid noisy motion, heavy shadows, or gimmicks.
- Prefer structured content/data over ad hoc blobs.

## Verification expectations
- For logic changes, run the relevant Vitest files first.
- For TypeScript changes, run `yarn typecheck`.
- For user-facing changes, run `yarn build` when practical.
- If the change touches ingestion or Neon-backed persistence, verify the affected data path explicitly.

## Repo-specific notes
- The site is built with Next.js App Router.
- Draft generation and content persistence live under `src/content/` and `src/lib/`.
- Admin UI code lives under `src/app/admin/` and should stay protected.
- Static styles live in `src/app/globals.css`.
- The main scripts are:
  - `yarn dev`
  - `yarn test`
  - `yarn typecheck`
  - `yarn build`
  - `yarn ingest:signals`
  - `yarn draft:signals`

## Before shipping
- Check `git status` and `git diff`.
- Make sure tests pass.
- Keep the commit message clear and specific.
