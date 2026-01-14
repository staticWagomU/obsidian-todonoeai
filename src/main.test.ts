/**
 * TodonoeaiPlugin - テスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import TodonoeaiPlugin from "./main";
import { App } from "obsidian";

describe("TodonoeaiPlugin - コマンド登録", () => {
	let plugin: TodonoeaiPlugin;
	let app: App;

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
		// loadData/saveDataをモック
		plugin.loadData = vi.fn().mockResolvedValue({});
		plugin.saveData = vi.fn().mockResolvedValue(undefined);
		// Plugin APIをモック
		plugin.addRibbonIcon = vi.fn().mockReturnValue({} as any);
		plugin.addStatusBarItem = vi.fn().mockReturnValue({ setText: vi.fn() } as any);
		plugin.addCommand = vi.fn().mockReturnValue({} as any);
		plugin.addSettingTab = vi.fn();
		plugin.registerDomEvent = vi.fn();
		await plugin.loadSettings();
	});

	describe("addCommand - Add Todo", () => {
		it("onload()が正常に実行される", async () => {
			// onload()が例外を投げないことを確認
			await expect(plugin.onload()).resolves.not.toThrow();
		});

		it("id='add-todo'でaddCommand()が呼ばれる", async () => {
			const addCommandMock = plugin.addCommand as any;
			await plugin.onload();

			// addCommandが'add-todo'で呼ばれたことを確認
			expect(addCommandMock).toHaveBeenCalledWith(
				expect.objectContaining({
					id: "add-todo",
					name: "Add Todo",
				})
			);
		});
	});
});
