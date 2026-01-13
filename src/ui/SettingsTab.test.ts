import { describe, expect, it, vi, beforeEach } from "vitest";
import { TodonoeaiSettingsTab } from "./SettingsTab";
import { DEFAULT_SETTINGS } from "../settings";

describe("TodonoeaiSettingsTab", () => {
	let mockApp: unknown;
	let mockPlugin: {
		settings: typeof DEFAULT_SETTINGS;
		saveSettings: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		// Mock App
		mockApp = {};

		// Mock Plugin
		mockPlugin = {
			settings: { ...DEFAULT_SETTINGS },
			saveSettings: vi.fn().mockResolvedValue(undefined),
		};
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
			expect(settingsTab.display).toBeDefined();
			expect(typeof settingsTab.display).toBe("function");
		});
	});

	describe("OpenRouter設定UI", () => {
		it("display を呼ぶと OpenRouter 設定セクションのヘッダーが作成されるべき", () => {
			const settingsTab = new TodonoeaiSettingsTab(mockApp, mockPlugin);
			const mockCreateEl = vi.fn();
			settingsTab.containerEl = {
				empty: vi.fn(),
				createEl: mockCreateEl,
			} as unknown as HTMLElement;

			settingsTab.display();

			expect(mockCreateEl).toHaveBeenCalledWith("h2", {
				text: "OpenRouter Settings",
			});
		});

		it("API Key、Base URL、Model の3つの設定項目が作成されるべき", async () => {
			const settingsTab = new TodonoeaiSettingsTab(mockApp, mockPlugin);

			// SettingクラスのインスタンスをカウントするためのSpy
			const obsidianModule = await import("obsidian");
			const SettingSpy = vi.spyOn(obsidianModule, "Setting");

			settingsTab.display();

			// Setting が 5回呼ばれること（OpenRouter×3 + 出力×2）
			expect(SettingSpy).toHaveBeenCalledTimes(5);
		});
	});

	describe("出力設定UI", () => {
		it("display を呼ぶと 出力設定セクションのヘッダーが作成されるべき", () => {
			const settingsTab = new TodonoeaiSettingsTab(mockApp, mockPlugin);
			const mockCreateEl = vi.fn();
			settingsTab.containerEl = {
				empty: vi.fn(),
				createEl: mockCreateEl,
			} as unknown as HTMLElement;

			settingsTab.display();

			expect(mockCreateEl).toHaveBeenCalledWith("h2", {
				text: "Output Settings",
			});
		});
	});
});
