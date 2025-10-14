import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	css: {
		postcss: {
			plugins: [],
		},
	},
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./tests/setup.ts"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
});
