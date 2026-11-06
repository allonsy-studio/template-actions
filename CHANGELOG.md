# @allons-y/template-actions

## 1.1.0

### Minor Changes

- Scaffolded actions now get their own `AGENTS.md`. ([#6](https://github.com/allonsy-studio/template-actions/pull/6))

    Repositories created from this template previously inherited the root `AGENTS.md`, which describes the template itself: the two-level layout, the rename CLI, and `scripts/template/`. None of that exists once `yarn rename` has run, so every new action started life with agent instructions about a repo it wasn't.

    `scripts/template/AGENTS.md` is installed over the root during rename, with the same `{{ ACTION_NAME }}` / `{{ ACTION_DESCRIPTION }}` / `{{ OWNER }}` substitutions as the README. It documents the thing a new action actually is: the thin `index.js` over `src/main.js` split, that `dist/` is ncc output which is gitignored and built at release, that changing an input means updating `action.yml`, the README tables, and `main.js` together, and the manual `@actions/*` mocks.

    No action needed on existing repositories.

## 1.0.0

### Major Changes

- Scaffold the GitHub Action template: ships `action.yml`, an example handler, Jest ([#2](https://github.com/allonsy-studio/template-actions/pull/2))
  with manual `@actions/*` mocks, ESLint/Prettier, Renovate, issue/PR templates, and
  an interactive `yarn rename` setup CLI that wires the placeholders to your action
  ([#1](https://github.com/allonsy-studio/template-actions/pull/1)).

### Minor Changes

- Migrate release tooling from semantic-release to Changesets. Versions and the ([#2](https://github.com/allonsy-studio/template-actions/pull/2))
  changelog are now driven by changeset files (`yarn changeset`) instead of commit
  messages; commitlint is retained for commit-message hygiene but no longer gates
  releases. The release workflow opens a "Version Packages" PR and, on merge, tags
  the release and moves the floating major (`vN`) tag.
