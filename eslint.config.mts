import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import { globalIgnores } from "eslint/config";

// eslint-plugin-obsidianmd のみを有効化
// 一般的なルール（no-unused-vars等）は Oxlint で実行
export default tseslint.config(
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'eslint.config.mts',
						'manifest.json'
					]
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json']
			},
		},
	},
	...obsidianmd.configs.recommended,
	{
		// Oxlint に任せるルールを無効化（obsidianmd.configs.recommended の後に適用）
		rules: {
			"no-undef": "off",
			"no-console": "off",
		},
	},
	{
		files: ["src/ui/SettingsTab.ts"],
		rules: {
			// 固有名詞（OpenRouter, API, URL等）のsentence caseチェックを無効化
			"obsidianmd/ui/sentence-case": "off",
		},
	},
	globalIgnores([
		"node_modules",
		"dist",
		"vite.config.ts",
		"vitest.config.ts",
		"version-bump.mjs",
		"versions.json",
		"main.js",
		"scrum.ts",
	]),
);
