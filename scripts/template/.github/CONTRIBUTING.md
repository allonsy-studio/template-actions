# Contributing

Thanks for considering a contribution! This project is small and friendly — here's what you need to know.

## Development setup

```bash
nvm use            # Node 24 (see .nvmrc)
corepack enable    # Yarn 4
yarn install
```

## Common commands

| Command         | What it does                                      |
| --------------- | -------------------------------------------------- |
| `yarn test`     | Run the Jest test suite.                          |
| `yarn coverage` | Run tests with coverage. Locally, prints a table. |
| `yarn lint`     | Run prettier, eslint, and markdownlint.           |
| `yarn format`   | Auto-fix lint and formatting issues.               |
| `yarn build`    | Bundle `src/index.js` into `dist/index.mjs` (local smoke-test only). |

## Architecture

Developer code lives in `src/`; `dist/index.mjs` is a generated, dependency-free bundle produced by `yarn build` (see the `build` script). GitHub runs compiled assets with no install step for `uses: {{OWNER}}/{{ACTION_NAME}}@vX`. Compiled assets are not committed to `main`. PR CI (`linting.yml`) runs `yarn build` to confirm the bundle still compiles; the release workflow (`release.yml`) is the only place that commits it, and only to a commit reachable by the release tag (`main` never sees it). The same bundle ships in the npm tarball via `package.json`'s `files` allowlist, independent of `.gitignore`.

- `src/index.js` — entry shell: reads the `token` input, builds the octokit client, calls `main()`, maps a thrown error to `core.setFailed()`.
- `src/main.js` — the action's actual logic.
- `src/main.test.js` — jest coverage for `main.js`.

The `.mjs` extension is load-bearing, not stylistic: this package is `"type": "module"`, and `.mjs` forces ESM regardless of the nearest `package.json`'s `"type"` field, so the bundle doesn't depend on (or need) ncc's auxiliary `dist/package.json` — the build script deletes it after renaming the bundle.

## Commit conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint via a pre-commit hook. This keeps the history readable — but commit types no longer drive releases; versioning is handled by changesets (see below).

## Releasing with changesets

Releases are managed by [Changesets](https://github.com/changesets/changesets). When you make a change that affects how the action behaves for consumers, add a changeset:

```bash
yarn changeset
```

Pick the bump type when prompted, write a short summary, and commit the generated file in `.changeset/` alongside your code:

- **patch** — bug fixes
- **minor** — new, backwards-compatible features
- **major** — breaking changes

Changes that don't affect consumers (docs, tests, CI, internal refactors) don't need a changeset.

## Pull requests

- Open an issue first for substantive changes — small fixes can skip this.
- Keep PRs focused. One change per PR is easier to review.
- Update tests for any behavior change.
- Add a changeset if your change affects consumers.
- The CI workflow runs build, lint, and the full test suite — make sure it's green.
- Releases are automatic: once a PR merges to `main`, changesets opens (or updates) a "Version Packages" PR that applies the pending bumps and updates the changelog. Merging that PR publishes the package to npm via [OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers) (no token), tags the release, and moves the floating `vN` major tag.
  - One-time setup: do an initial manual `npm publish` to create the package, then register this repo as a [trusted publisher](https://docs.npmjs.com/trusted-publishers) on npmjs.com (GitHub Actions → this repo → workflow `release.yml`).

## Questions

Stuck on something? Start a thread in [Discussions](https://github.com/{{OWNER}}/{{ACTION_NAME}}/discussions). The issue tracker is for bugs and feature requests.
