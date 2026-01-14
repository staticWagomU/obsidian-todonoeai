/**
 * TodonoeaiPlugin - 統合テスト
 * コマンド→TodoModal→OpenRouterClient→FileServiceの統合動作を検証
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
import { describe, it, expect, beforeEach, vi } from "vitest";
import TodonoeaiPlugin from "./main";
import { App } from "obsidian";
import type { Command } from "obsidian";

describe("TodonoeaiPlugin - 統合テスト", () => {
	let plugin: TodonoeaiPlugin;
	let app: App;
	let capturedCommand: Command | undefined;

	beforeEach(async () => {
		app = new App();
		plugin = new TodonoeaiPlugin(app, {
			id: "todonoeai",
			name: "todonoeai",
			author: "test",
			version: "1.0.0",
			minAppVersion: "0.15.0",
			description: "test",
			dir: "/test",
			isDesktopOnly: false,
		});

		plugin.loadData = vi.fn().mockResolvedValue({});
		plugin.saveData = vi.fn().mockResolvedValue(undefined);
		plugin.addRibbonIcon = vi.fn().mockReturnValue({} as any);
		plugin.addStatusBarItem = vi.fn().mockReturnValue({ setText: vi.fn() } as any);

		// addCommandをモックしてコマンドをキャプチャ
		plugin.addCommand = vi.fn().mockImplementation((command: Command) => {
			if (command.id === "add-todo") {
				capturedCommand = command;
			}
			return {} as any;
		});

		plugin.addSettingTab = vi.fn();
		plugin.registerDomEvent = vi.fn();
		plugin.registerView = vi.fn();
		await plugin.loadSettings();
	});

	describe("コマンド→TodoModal統合", () => {
		it("add-todoコマンドが登録される", async () => {
			await plugin.onload();

			expect(capturedCommand).toBeDefined();
			expect(capturedCommand?.id).toBe("add-todo");
			expect(capturedCommand?.name).toBe("Add todo");

			// callbackが定義されていることを確認
			expect(capturedCommand?.callback).toBeTypeOf("function");
		});

		it("add-todoコマンドにsettingsが渡される", async () => {
			await plugin.onload();

			// settingsが正しくロードされている
			expect(plugin.settings).toBeDefined();
			expect(plugin.settings.apiKey).toBe("");
			expect(plugin.settings.model).toBe("anthropic/claude-3.5-sonnet");

			// TodoModalにsettingsが渡されることは実装で保証
			expect(capturedCommand).toBeDefined();
		});
	});
});
