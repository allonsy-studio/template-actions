// Read in assets array from package.json to be used as assets for the release
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

const here = dirname(fileURLToPath(import.meta.url));

const packageJson = readFileSync(join(here, "package.json"), "utf8");
const assets = JSON.parse(packageJson)?.files;
// Read in release categories from .github/release.yml to be used as sections for the release notes generator
const releaseCategories = parse(readFileSync(join(here, ".github/release.yml"), "utf8"))?.changelog?.categories;

const changelogFile = ".github/CHANGELOG.md";


/** @type {import('semantic-release').GlobalConfig} */
export default {
	plugins: [
		[
			"@semantic-release/commit-analyzer",
			{
				preset: "conventionalcommits",
				releaseRules: [
					{ type: "feat", release: "minor" },
					{ type: "fix", release: "patch" },
					{ type: "perf", release: "patch" },
					{ type: "revert", release: "patch" },
					{ breaking: true, release: "major" },
				],
			},
		],
		[
			"@semantic-release/release-notes-generator",
			{
				preset: "conventionalcommits",
				presetConfig: {
					types: [
						...(releaseCategories ?? []).map(category => ({
							section: category.title,
							type: category.labels?.[0],
							hidden: false,
						})),
					],
				},
				writerOpts: {
					commitPartial: `
*{{#if scope}} **{{scope}}:**{{~/if}}
{{~#if subject}}{{subject}}{{else}}{{header}}{{/if}}
{{~#if hash}}{{#if @root.linkReferences}} ([{{shortHash}}]({{@root.host}}/{{@root.owner}}/{{@root.repository}}/commit/{{hash}}))){{else}} {{shortHash}}{{/if}}{{/if}}
{{~#if references}}, closes{{#each references}} {{#if @root.linkReferences}}[#{{this.issue}}]({{@root.host}}/{{@root.owner}}/{{@root.repository}}/issues/{{this.id}}){{else}}#{{this.issue}}{{/if}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}`,
				},
			},
		],
		[
			"@semantic-release/changelog",
			{
				changelogFile: changelogFile,
				changelogTitle: "# Changelog\n\nAll notable changes to this project will be documented in this file. See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.",
			},
		],
		[
			"@semantic-release/github",
			{
				assets: [{ path: changelogFile, label: "Changelog" }],
			},
		],
		[
			"@semantic-release/git",
			{
				assets,
				message: "chore(release): <%= nextRelease.version %> [skip ci]\n\n<%= new Date().toLocaleDateString('en-GB', {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) %>\n<%= nextRelease.notes %>",
			},
		],
		[
			"@semantic-release/exec",
			{
				// Move the major-version tag (e.g. v1) onto each new release tag (e.g. v1.0.1)
				// so consumers can pin and receive every non-breaking update on that major line.
				successCmd: [
					'MAJOR="${nextRelease.gitTag.split(".")[0]}"',
					'git tag -f "$MAJOR" "${nextRelease.gitTag}"',
					'git remote set-url origin "https://x-access-token:$GH_TOKEN@github.com/$GITHUB_REPOSITORY.git"',
					'git push --force origin "refs/tags/$MAJOR"',
				].join(" && "),
			},
		],
	],
};
