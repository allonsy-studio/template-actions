# @allons-y/template-actions

A template repository for scaffolding new GitHub Actions. Nothing here ships as a
published action: the deliverable is what `yarn rename` leaves behind in a repo
created from this template.

ESM only, Node >= 24, Yarn 4.

## The two levels: read this first

The most common mistake in this repo is editing the wrong copy of a file.

| Level              | What it is                                                                 |
| ------------------ | -------------------------------------------------------------------------- |
| Repo root          | The template's *own* tooling: `eslint.config.js`, `jest.config.js`, workflows, `scripts/`. Used while developing the template. |
| `scripts/template/` | The **payload**. These files get rendered with the user's answers & installed over the root when `yarn rename` runs. |

So: fixing how a scaffolded action behaves means editing `scripts/template/`. Fixing
how *this* repo builds or tests itself means editing the root. A change to the
scaffolded README, `action.yml`, `package.json`, or `src/main.js` almost always
belongs in `scripts/template/`.

`yarn rename` ends by deleting the whole `scripts/` directory, so anything the
scaffolded repo needs must either live in `scripts/template/` or survive at the root
untouched.

## The rename CLI

- `scripts/rename.js`: the interactive shell (commander + @clack/prompts), collecting
  the action name, description, owner, author, and the input/output variables.
- `scripts/rename.core.js`: all the logic, and the only part that's tested
  (`scripts/rename.core.test.js`): replacement building, file renaming, template
  rendering, changeset clearing, git-config parsing.

Put logic in `rename.core.js`, prompts in `rename.js`. `yarn rename --dry-run`
previews every change without writing; use it to check any change to the rename path.

## Commands

```sh
yarn test      # jest, run with --experimental-vm-modules for native ESM
yarn coverage
yarn lint      # eslint across everything
yarn format    # yarn lint --fix
yarn rename    # the scaffolding CLI (--dry-run to preview)
```

## Testing

`@actions/core` and `@actions/github` resolve to hand-written manual mocks in
[`__mocks__/`](__mocks__/): don't reach for `jest.mock()` / `unstable_mockModule`
for those two.

## Conventions

- Keep code self-documenting. When a comment is warranted, keep it brief and explain
  only the *why* the code can't show: never restate what the code does.
- husky + lint-staged run on commit and commitlint checks the message. Don't bypass
  with `--no-verify`.
- `prepare` runs `envoy`, so a missing root `~/.env` is tolerated, not fatal.

## Commits, releases & pull requests

Conventional Commits. Releases run on Changesets: `yarn changeset` for anything that
changes what a scaffolded repo receives, since that's the consumer-visible surface.
Never hand-edit `CHANGELOG.md` or the `version` field in `package.json`.

Fill in [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md); see
[`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) for the full flow.

Never add AI attribution to a commit or a PR: no `Co-Authored-By` trailer, no
"Generated with …" footer, no session URLs.

## Prose style

Prose in this repo (README, commit bodies, PR descriptions) follows the
[studio style guide](https://github.com/allonsy-studio/.github/blob/main/AGENTS.md#style-guide):
sentence-case headings, `&` over "and", `:` over em dashes.
