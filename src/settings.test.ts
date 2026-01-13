import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "./settings";

describe("DEFAULT_SETTINGS", () => {
	it("DEFAULT_SETTINGS が正しくエクスポートされているべき", () => {
		expect(DEFAULT_SETTINGS).toBeDefined();
	});

	it("apiKey のデフォルト値は空文字列であるべき", () => {
		expect(DEFAULT_SETTINGS.apiKey).toBe("");
	});

	it("baseUrl のデフォルト値は OpenRouter の URL であるべき", () => {
		expect(DEFAULT_SETTINGS.baseUrl).toBe("https://openrouter.ai/api/v1");
	});

	it("model のデフォルト値は anthropic/claude-3.5-sonnet であるべき", () => {
		expect(DEFAULT_SETTINGS.model).toBe("anthropic/claude-3.5-sonnet");
	});

	it("outputFilePath のデフォルト値は todo.txt であるべき", () => {
		expect(DEFAULT_SETTINGS.outputFilePath).toBe("todo.txt");
	});

	it("appendPosition のデフォルト値は bottom であるべき", () => {
		expect(DEFAULT_SETTINGS.appendPosition).toBe("bottom");
	});

	it("contextKeywords のデフォルト値は空のオブジェクトであるべき", () => {
		expect(DEFAULT_SETTINGS.contextKeywords).toEqual({});
		expect(Object.keys(DEFAULT_SETTINGS.contextKeywords).length).toBe(0);
	});

	it("DEFAULT_SETTINGS は PluginSettings 型に準拠しているべき", () => {
		// 型チェックのみ。実行時には何もテストしない
		const keys = Object.keys(DEFAULT_SETTINGS);
		expect(keys).toContain("apiKey");
		expect(keys).toContain("baseUrl");
		expect(keys).toContain("model");
		expect(keys).toContain("outputFilePath");
		expect(keys).toContain("appendPosition");
		expect(keys).toContain("contextKeywords");
	});
});
