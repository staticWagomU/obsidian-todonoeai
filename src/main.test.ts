/**
 * TodonoeaiPlugin - テスト
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import TodonoeaiPlugin from "./main";
import { App } from "obsidian";

describe("TodonoeaiPlugin - コマンド登録", () => {
	let plugin: TodonoeaiPlugin;
	let app: App;

	beforeEach(async () => {
		app = new App();
		// workspaceのモックを追加
		(app as any).workspace = {
			detachLeavesOfType: vi.fn(),
			getLeavesOfType: vi.fn().mockReturnValue([]),
			getRightLeaf: vi.fn().mockReturnValue({
				setViewState: vi.fn().mockResolvedValue(undefined),
			}),
			revealLeaf: vi.fn(),
		};

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
		plugin.registerView = vi.fn();
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
					name: "Add todo",
				})
			);
		});
	});

	describe("addRibbonIcon - サイドバーパネル表示", () => {
		it("onload()でaddRibbonIcon()が呼ばれる", async () => {
			const addRibbonIconMock = plugin.addRibbonIcon as any;
			await plugin.onload();

			// addRibbonIconが'checkmark', 'TodoのAI'で呼ばれたことを確認
			expect(addRibbonIconMock).toHaveBeenCalledWith(
				"checkmark",
				"TodoのAI",
				expect.any(Function)
			);
		});
	});

	describe("registerView - SidebarViewの登録", () => {
		it("onload()でregisterView()が呼ばれる", async () => {
			// registerViewをモック
			plugin.registerView = vi.fn();

			await plugin.onload();

			// registerViewが'todonoeai-sidebar'で呼ばれたことを確認
			expect(plugin.registerView).toHaveBeenCalledWith(
				"todonoeai-sidebar",
				expect.any(Function)
			);
		});
	});

	describe("activateView - サイドバーパネル表示", () => {
		it("activateView()メソッドが存在する", () => {
			// activateView()メソッドが定義されていることを確認
			expect(plugin.activateView).toBeDefined();
			expect(typeof plugin.activateView).toBe("function");
		});

		it("activateView()を呼ぶとworkspace.detachLeavesOfType()が呼ばれる", async () => {
			await plugin.onload();

			// plugin.appを作成してworkspaceモックを設定
			const detachLeavesOfTypeMock = vi.fn();
			plugin.app = {
				workspace: {
					detachLeavesOfType: detachLeavesOfTypeMock,
					getRightLeaf: vi.fn().mockReturnValue({
						setViewState: vi.fn().mockResolvedValue(undefined),
					}),
					revealLeaf: vi.fn(),
				},
			} as any;

			await plugin.activateView();

			// detachLeavesOfTypeが呼ばれたことを確認
			expect(detachLeavesOfTypeMock).toHaveBeenCalledWith("todonoeai-sidebar");
		});

		it("activateView()を呼ぶとsetViewState()が呼ばれる", async () => {
			await plugin.onload();

			// plugin.appを作成してworkspaceモックを設定
			const setViewStateMock = vi.fn().mockResolvedValue(undefined);
			const mockLeaf = {
				setViewState: setViewStateMock,
			};
			plugin.app = {
				workspace: {
					detachLeavesOfType: vi.fn(),
					getRightLeaf: vi.fn().mockReturnValue(mockLeaf),
					revealLeaf: vi.fn(),
				},
			} as any;

			await plugin.activateView();

			// setViewStateが呼ばれたことを確認
			expect(setViewStateMock).toHaveBeenCalledWith({
				type: "todonoeai-sidebar",
				active: true,
			});
		});

		it("activateView()を呼ぶとrevealLeaf()が呼ばれる", async () => {
			await plugin.onload();

			// plugin.appを作成してworkspaceモックを設定
			const revealLeafMock = vi.fn();
			const mockLeaf = {
				setViewState: vi.fn().mockResolvedValue(undefined),
			};
			plugin.app = {
				workspace: {
					detachLeavesOfType: vi.fn(),
					getRightLeaf: vi.fn().mockReturnValue(mockLeaf),
					revealLeaf: revealLeafMock,
				},
			} as any;

			await plugin.activateView();

			// revealLeafが呼ばれたことを確認
			expect(revealLeafMock).toHaveBeenCalledWith(mockLeaf);
		});
	});
});
