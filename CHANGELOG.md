# @allons-y/template-actions

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
