/// <reference types="vitest" />

import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: resolve(__dirname, "src/jdataview.js"),
			name: "jDataView",
			// the proper extensions will be added
			fileName: "jdataview",
			formats: ["es", "cjs", "umd"]
		},
	},
	test: {
		include: ["test/**\/*.{test,spec}.?(c|m)[jt]s?(x)"],
	},
});
