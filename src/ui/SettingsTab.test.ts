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
});
