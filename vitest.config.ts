import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "src/**/*.test.ts"],
		},
	},
	resolve: {
		alias: {
			obsidian: new URL("./src/test-setup.ts", import.meta.url).pathname,
		},
	},
});
