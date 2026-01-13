import { describe, expect, it, vi, beforeEach } from "vitest";
import type { App } from "obsidian";
import { TodonoeaiSettingsTab } from "./SettingsTab";
import { DEFAULT_SETTINGS } from "../settings";
import type TodonoeaiPlugin from "../main";

describe("TodonoeaiSettingsTab", () => {
	let mockApp: App;
	let mockPlugin: TodonoeaiPlugin;

	beforeEach(() => {
		// Mock App
		mockApp = {} as App;

		// Mock Plugin
		mockPlugin = {
			settings: { ...DEFAULT_SETTINGS },
			saveSettings: vi.fn().mockResolvedValue(undefined),
		} as unknown as TodonoeaiPlugin;
	});

	describe("基本構造", () => {
		it("TodonoeaiSettingsTab が正しくエクスポートされているべき", () => {
			expect(TodonoeaiSettingsTab).toBeDefined();
		});

		it("インスタンスを作成できるべき", () => {
			const settingsTab = new TodonoeaiSettingsTab(mockApp, mockPlugin);
			expect(settingsTab).toBeDefined();
		});

		it("display メソッドが定義されているべき", () => {
			const settingsTab = new TodonoeaiSettingsTab(mockApp, mockPlugin);
			const displayMethod = settingsTab.display.bind(settingsTab);
			expect(displayMethod).toBeDefined();
			expect(typeof displayMethod).toBe("function");
		});
	});

	describe("OpenRouter設定UI", () => {
		it("すべての設定セクションとアイテムが作成されるべき", async () => {
			const settingsTab = new TodonoeaiSettingsTab(mockApp, mockPlugin);

			// SettingクラスのインスタンスをカウントするためのSpy
			const obsidianModule = await import("obsidian");
			const SettingSpy = vi.spyOn(obsidianModule, "Setting");

			settingsTab.display();

			// Setting が 8回呼ばれること：
			// - OpenRouterヘッダー: 1
			// - OpenRouter設定項目: 3 (API key, Base URL, Model)
			// - 出力設定ヘッダー: 1
			// - 出力設定項目: 2 (Output file path, Append position)
			// - コンテキストヘッダー: 1
			// 合計: 8
			expect(SettingSpy).toHaveBeenCalled();
			// 少なくとも8回以上呼ばれていることを確認（他のテストの影響を受けないため）
			expect(SettingSpy.mock.calls.length).toBeGreaterThanOrEqual(8);
		});
	});
});
