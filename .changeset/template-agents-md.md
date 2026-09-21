---
"@allons-y/template-actions": minor
---

Scaffolded actions now get their own `AGENTS.md`.

Repositories created from this template previously inherited the root `AGENTS.md`, which describes the template itself: the two-level layout, the rename CLI, and `scripts/template/`. None of that exists once `yarn rename` has run, so every new action started life with agent instructions about a repo it wasn't.

`scripts/template/AGENTS.md` is installed over the root during rename, with the same `{{ ACTION_NAME }}` / `{{ ACTION_DESCRIPTION }}` / `{{ OWNER }}` substitutions as the README. It documents the thing a new action actually is: the thin `index.js` over `src/main.js` split, that `dist/` is ncc output which is gitignored and built at release, that changing an input means updating `action.yml`, the README tables, and `main.js` together, and the manual `@actions/*` mocks.

No action needed on existing repositories.
