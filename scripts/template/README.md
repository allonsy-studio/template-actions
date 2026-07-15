# {{ ACTION_NAME }}

> {{ ACTION_DESCRIPTION }}

## Usage

```yaml
- uses: {{ OWNER }}/{{ ACTION_NAME }}@v1{{ ACTION_USAGE }}
```

## Inputs

{{ ACTION_INPUTS_TABLE }}

## Outputs

{{ ACTION_OUTPUTS_TABLE }}

## Development

```sh
yarn lint      # eslint
yarn test      # jest
yarn coverage  # jest with the 80% coverage threshold
yarn build     # bundle src/index.js into dist/index.js
```

### Architecture

```text
src/
  index.js       # entry shell: reads the `token` input, builds the octokit
                  # client, calls main(), and maps a thrown error to
                  # core.setFailed()
  main.js         # the action's actual logic — edit this
  main.test.js    # jest coverage for main.js
dist/
  index.js        # generated — the bundled, dependency-free file action.yml
                   # actually runs
rollup.config.js  # bundles src/index.js (+ dependencies) into dist/index.js
```

GitHub downloads the repository and runs `dist/index.js` directly — it does
not install dependencies at action runtime — so `src/` is bundled with its
`node_modules` dependencies into a single `dist/index.js` and that bundle is
committed. Run `yarn build` after changing anything under `src/` and commit
the updated `dist/`; CI fails the build if `dist/` doesn't match the source.

---

_Scaffolded using [`@allons-y/template-actions`](https://github.com/allonsy-studio/template-actions)._
