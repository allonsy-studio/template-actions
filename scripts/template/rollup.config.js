import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

// GitHub downloads this repository and runs dist/index.js directly — there is
// no `npm install` step, so every dependency (e.g. @actions/core,
// @actions/github) must be bundled in.
export default {
	input: "src/index.js",
	output: {
		esModule: true,
		file: "dist/index.js",
		format: "es",
		sourcemap: true,
	},
	plugins: [nodeResolve({ preferBuiltins: true }), commonjs()],
};
