import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "./settings";
import type { PluginSettings } from "./types/index";

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

describe("loadSettings", () => {
	it("loadSettings が正しくエクスポートされているべき", () => {
		expect(loadSettings).toBeDefined();
		expect(typeof loadSettings).toBe("function");
	});

	it("保存されたデータがない場合、デフォルト設定を返すべき", async () => {
		const mockLoadData = vi.fn().mockResolvedValue(null);
		const settings = await loadSettings(mockLoadData);

		expect(settings).toEqual(DEFAULT_SETTINGS);
		expect(mockLoadData).toHaveBeenCalledTimes(1);
	});

	it("保存されたデータがある場合、デフォルト設定とマージして返すべき", async () => {
		const savedData: Partial<PluginSettings> = {
			apiKey: "test-key",
			model: "gpt-4",
		};
		const mockLoadData = vi.fn().mockResolvedValue(savedData);
		const settings = await loadSettings(mockLoadData);

		expect(settings).toEqual({
			...DEFAULT_SETTINGS,
			apiKey: "test-key",
			model: "gpt-4",
		});
		expect(mockLoadData).toHaveBeenCalledTimes(1);
	});

	it("部分的な設定でも正しくマージされるべき", async () => {
		const savedData: Partial<PluginSettings> = {
			appendPosition: "top",
		};
		const mockLoadData = vi.fn().mockResolvedValue(savedData);
		const settings = await loadSettings(mockLoadData);

		expect(settings.appendPosition).toBe("top");
		expect(settings.apiKey).toBe(DEFAULT_SETTINGS.apiKey);
		expect(settings.baseUrl).toBe(DEFAULT_SETTINGS.baseUrl);
	});
});

describe("saveSettings", () => {
	it("saveSettings が正しくエクスポートされているべき", () => {
		expect(saveSettings).toBeDefined();
		expect(typeof saveSettings).toBe("function");
	});

	it("設定を保存できるべき", async () => {
		const mockSaveData = vi.fn().mockResolvedValue(undefined);
		const settings: PluginSettings = {
			...DEFAULT_SETTINGS,
			apiKey: "new-key",
		};

		await saveSettings(mockSaveData, settings);

		expect(mockSaveData).toHaveBeenCalledTimes(1);
		expect(mockSaveData).toHaveBeenCalledWith(settings);
	});

	it("設定の保存に失敗した場合、エラーをスローすべき", async () => {
		const mockSaveData = vi.fn().mockRejectedValue(new Error("Save failed"));
		const settings: PluginSettings = DEFAULT_SETTINGS;

		await expect(saveSettings(mockSaveData, settings)).rejects.toThrow("Save failed");
	});
});
