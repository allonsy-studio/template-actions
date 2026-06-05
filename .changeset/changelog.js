/**
 * Custom Changesets changelog generator.
 *
 * Changesets hardcodes the changelog *scaffold* — the `# package` title, the
 * `## version` headers, and the `### Major/Minor/Patch Changes` sections. This
 * module shapes only the *bullet lines* under those sections into clean,
 * human-readable markdown that renders as-is, with no post-processing:
 *
 *   - A short summary headline. ([#12](pr-link)) — thanks [@user](user-link)!
 *     Continuation paragraphs from the changeset body, indented to stay in the item.
 *
 * The description leads so entries read like a sentence; the PR/commit and
 * author links trail the headline so they stay out of the way. Single-line
 * entries form a compact (tight) list.
 *
 * Links are resolved from the commit that introduced the changeset via
 * `@changesets/get-github-info`, which needs `GITHUB_TOKEN` at `changeset
 * version` time (CI provides it; contributors don't run versioning locally).
 * Authors, and a specific PR or commit, can be overridden with magic lines in
 * the changeset summary:
 *
 *   pr: 123
 *   commit: a1b2c3d
 *   author: @octocat
 *
 * Config (.changeset/config.json):
 *   "changelog": ["./changelog.js", { "repo": "org/repo", "disableThanks": false }]
 *
 * @typedef {import('@changesets/types').ChangelogFunctions} ChangelogFunctions
 */

import { getInfo, getInfoFromPullRequest } from "@changesets/get-github-info";

const GITHUB_SERVER_URL = process.env.GITHUB_SERVER_URL || "https://github.com";

/**
 * Validate and return the required `repo` option, with a helpful message.
 *
 * @param {{ repo?: string } | null} options
 * @returns {string}
 */
function requireRepo(options) {
	if (!options || !options.repo) {
		throw new Error(
			'Please provide a repo to the changelog generator in .changeset/config.json:\n' +
				'"changelog": ["./changelog.js", { "repo": "org/repo" }]',
		);
	}
	return options.repo;
}

/**
 * Turn bare `#123` issue/PR references into links, leaving existing markdown
 * links untouched (the left alternative consumes them so the right only ever
 * matches a bare ref).
 *
 * @param {string} line
 * @param {string} repo
 * @returns {string}
 */
function linkifyIssueRefs(line, repo) {
	return line.replace(/\[.*?\]\(.*?\)|\B#([1-9]\d*)\b/g, (match, issue) =>
		issue ? `[#${issue}](${GITHUB_SERVER_URL}/${repo}/issues/${issue})` : match,
	);
}

/**
 * Pull `pr:` / `commit:` / `author:` override lines out of a changeset summary,
 * returning the cleaned summary plus whatever was found.
 *
 * @param {string} summary
 * @returns {{ cleaned: string, pr?: number, commit?: string, authors: string[] }}
 */
function extractMeta(summary) {
	let pr;
	let commit;
	const authors = [];
	const cleaned = summary
		.replace(/^[ \t]*(?:pr|pull|pull\s+request):\s*#?(\d+)[ \t]*$/im, (_match, n) => {
			pr = Number(n);
			return "";
		})
		.replace(/^[ \t]*commit:\s*(\S+)[ \t]*$/im, (_match, c) => {
			commit = c;
			return "";
		})
		.replace(/^[ \t]*(?:author|user):\s*@?(\S+)[ \t]*$/gim, (_match, u) => {
			authors.push(u);
			return "";
		})
		.trim();
	return { cleaned, pr, commit, authors };
}

/**
 * Resolve the trailing reference link (PR, else commit) and author links for a
 * changeset. Only hits the GitHub API when there's a PR or commit to look up.
 *
 * @param {string} repo
 * @param {{ pr?: number, commit?: string, authors: string[] }} meta
 * @param {string | undefined} changesetCommit
 * @returns {Promise<{ reference: string | null, authors: string[] }>}
 */
async function resolveLinks(repo, meta, changesetCommit) {
	let links = { pull: null, commit: null, user: null };
	if (meta.pr !== undefined) {
		({ links } = await getInfoFromPullRequest({ repo, pull: meta.pr }));
	} else {
		const commit = meta.commit || changesetCommit;
		if (commit) ({ links } = await getInfo({ repo, commit }));
	}
	// An explicit `commit:` override wins over a PR's merge commit.
	if (meta.commit) {
		const short = meta.commit.slice(0, 7);
		links = { ...links, commit: `[\`${short}\`](${GITHUB_SERVER_URL}/${repo}/commit/${meta.commit})` };
	}
	const authors = meta.authors.length
		? meta.authors.map((user) => `[@${user}](${GITHUB_SERVER_URL}/${user})`)
		: links.user
			? [links.user]
			: [];
	return { reference: links.pull || links.commit, authors };
}

/** @type {ChangelogFunctions} */
const changelogFunctions = {
	getReleaseLine: async (changeset, _type, options) => {
		const repo = requireRepo(options);
		const { cleaned, pr, commit, authors: authorOverrides } = extractMeta(changeset.summary);
		const { reference, authors } = await resolveLinks(repo, { pr, commit, authors: authorOverrides }, changeset.commit);

		const [headline, ...rest] = cleaned.split("\n").map((line) => line.trimEnd());

		let suffix = "";
		if (reference) suffix += ` (${reference})`;
		if (authors.length && !(options && options.disableThanks)) suffix += ` — thanks ${authors.join(", ")}!`;

		// Continuation lines are indented two spaces so multi-paragraph entries
		// stay inside the list item; blank lines are preserved as paragraph breaks.
		const body = rest.map((line) => (line ? `  ${linkifyIssueRefs(line, repo)}` : "")).join("\n");

		return `- ${linkifyIssueRefs(headline, repo)}${suffix}${body ? `\n${body}` : ""}`;
	},

	getDependencyReleaseLine: async (_changesets, dependenciesUpdated, options) => {
		requireRepo(options);
		if (dependenciesUpdated.length === 0) return "";
		const updated = dependenciesUpdated.map((dep) => `  - \`${dep.name}@${dep.newVersion}\``);
		return ["- Updated dependencies:", ...updated].join("\n");
	},
};

export default changelogFunctions;
