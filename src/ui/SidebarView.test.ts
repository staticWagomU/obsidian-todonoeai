import { describe, expect, it, vi, beforeEach } from "vitest";
import type { App, WorkspaceLeaf, Vault } from "obsidian";
import { TodoSidebarView, VIEW_TYPE_TODO_SIDEBAR } from "./SidebarView";
import type { PluginSettings } from "../types/index";
import { DEFAULT_SETTINGS } from "../settings";

describe("TodoSidebarView", () => {
	let mockApp: App;
	let mockLeaf: WorkspaceLeaf;
	let mockSettings: PluginSettings;
	let mockVault: Vault;

	beforeEach(() => {
		// Mock Vault
		mockVault = {
			adapter: {
				read: vi.fn(),
				write: vi.fn(),
				exists: vi.fn().mockResolvedValue(false),
			},
		} as unknown as Vault;

		// Mock App
		mockApp = {
			vault: mockVault,
		} as unknown as App;

		// Mock WorkspaceLeaf
		mockLeaf = {
			view: null,
		} as unknown as WorkspaceLeaf;

		// Mock Settings
		mockSettings = { ...DEFAULT_SETTINGS };
	});

	describe("基本構造", () => {
		it("TodoSidebarView が正しくエクスポートされているべき", () => {
			expect(TodoSidebarView).toBeDefined();
		});

		it("VIEW_TYPE_TODO_SIDEBAR が正しく定義されているべき", () => {
			expect(VIEW_TYPE_TODO_SIDEBAR).toBe("todonoeai-sidebar");
		});

		it("インスタンスを作成できるべき", () => {
			const view = new TodoSidebarView(mockLeaf);
			expect(view).toBeDefined();
		});

		it("getViewType() が正しい値を返すべき", () => {
			const view = new TodoSidebarView(mockLeaf);
			expect(view.getViewType()).toBe(VIEW_TYPE_TODO_SIDEBAR);
		});

		it("getDisplayText() が正しい表示名を返すべき", () => {
			const view = new TodoSidebarView(mockLeaf);
			expect(view.getDisplayText()).toBe("TodoのAI");
		});

		it("getIcon() が正しいアイコン名を返すべき", () => {
			const view = new TodoSidebarView(mockLeaf);
			expect(view.getIcon()).toBe("checkmark");
		});
	});

	describe("UI要素構築", () => {
		it("onOpen()でcontainerEl.empty()が呼ばれるべき", async () => {
			const view = new TodoSidebarView(mockLeaf);
			const emptySpy = vi.spyOn(view.containerEl, "empty");

			await view.onOpen();

			expect(emptySpy).toHaveBeenCalled();
		});

		it("onOpen()でinputTextareaが作成されるべき", async () => {
			const view = new TodoSidebarView(mockLeaf);
			const createElSpy = vi.spyOn(view.containerEl, "createEl");

			await view.onOpen();

			// textarea要素が作成されること
			expect(createElSpy).toHaveBeenCalledWith("textarea", expect.objectContaining({
				placeholder: "タスクを入力...",
			}));
		});

		it("onOpen()でpreviewTextareaが作成されるべき", async () => {
			const view = new TodoSidebarView(mockLeaf);
			const createElSpy = vi.spyOn(view.containerEl, "createEl");

			await view.onOpen();

			// プレビュー用textarea要素が作成されること
			expect(createElSpy).toHaveBeenCalledWith("textarea", expect.objectContaining({
				placeholder: "todo.txtプレビュー",
			}));
		});

		it("onOpen()で変換ボタンが作成されるべき", async () => {
			const view = new TodoSidebarView(mockLeaf);
			const createElSpy = vi.spyOn(view.containerEl, "createEl");

			await view.onOpen();

			// 変換ボタンが作成されること
			expect(createElSpy).toHaveBeenCalledWith("button", expect.objectContaining({
				text: "AI変換",
			}));
		});

		it("onOpen()で追加ボタンが作成されるべき", async () => {
			const view = new TodoSidebarView(mockLeaf);
			const createElSpy = vi.spyOn(view.containerEl, "createEl");

			await view.onOpen();

			// 追加ボタンが作成されること
			expect(createElSpy).toHaveBeenCalledWith("button", expect.objectContaining({
				text: "ファイルに追加",
			}));
		});
	});

	describe("OpenRouterClient統合", () => {
		it("設定を受け取るコンストラクタをサポートすべき", () => {
			const view = new TodoSidebarView(mockLeaf, mockSettings);
			expect(view).toBeDefined();
		});

		it("変換ボタンクリック時にOpenRouterClient.convert()を呼ぶべき", async () => {
			const mockConvert = vi.fn().mockResolvedValue({
				success: true,
				todoText: "2026-01-14 タスクを完了する",
			});

			// OpenRouterClientをモック
			const { OpenRouterClient } = await import("../api/openrouter");
			vi.spyOn(OpenRouterClient.prototype, "convert").mockImplementation(mockConvert);

			const view = new TodoSidebarView(mockLeaf, mockSettings);
			await view.onOpen();

			// 入力テキストを設定
			if (view["inputTextarea"]) {
				view["inputTextarea"].value = "タスクを完了する";
			}

			// 変換ボタンをクリック
			if (view["convertButton"]) {
				view["convertButton"].click();
			}

			// 非同期処理を待つ
			await new Promise((resolve) => {
				setTimeout(resolve, 0);
			});

			// convert()が呼ばれたことを確認
			expect(mockConvert).toHaveBeenCalledWith("タスクを完了する");
		});

		it("変換成功時にプレビューエリアに結果を表示すべき", async () => {
			const mockConvert = vi.fn().mockResolvedValue({
				success: true,
				todoText: "2026-01-14 タスクを完了する",
			});

			const { OpenRouterClient } = await import("../api/openrouter");
			vi.spyOn(OpenRouterClient.prototype, "convert").mockImplementation(mockConvert);

			const view = new TodoSidebarView(mockLeaf, mockSettings);
			await view.onOpen();

			// 入力テキストを設定
			if (view["inputTextarea"]) {
				view["inputTextarea"].value = "タスクを完了する";
			}

			// 変換ボタンをクリック
			if (view["convertButton"]) {
				view["convertButton"].click();
			}

			// 非同期処理を待つ
			await new Promise((resolve) => {
				setTimeout(resolve, 0);
			});

			// プレビューエリアに結果が表示されること
			expect(view["previewTextarea"]?.value).toBe("2026-01-14 タスクを完了する");
		});
	});

	describe("FileService統合", () => {
		it("追加ボタンクリック時にFileService.appendToFile()を呼ぶべき", async () => {
			const view = new TodoSidebarView(mockLeaf, mockSettings, mockApp);
			await view.onOpen();

			// プレビューテキストを設定
			if (view["previewTextarea"]) {
				view["previewTextarea"].value = "2026-01-14 タスクを完了する";
			}

			// 追加ボタンをクリック
			if (view["addButton"]) {
				view["addButton"].click();
			}

			// 非同期処理を待つ
			await new Promise((resolve) => {
				setTimeout(resolve, 0);
			});

			// ファイルに書き込まれたことを確認
			// eslint-disable-next-line @typescript-eslint/unbound-method
			const writeMethod = mockVault.adapter.write;
			expect(writeMethod).toHaveBeenCalledWith(
				"todo.txt",
				"2026-01-14 タスクを完了する",
			);
		});

		it("追加成功時に入力欄とプレビュー欄をクリアすべき", async () => {
			const view = new TodoSidebarView(mockLeaf, mockSettings, mockApp);
			await view.onOpen();

			// 入力テキストとプレビューテキストを設定
			if (view["inputTextarea"]) {
				view["inputTextarea"].value = "タスクを完了する";
			}
			if (view["previewTextarea"]) {
				view["previewTextarea"].value = "2026-01-14 タスクを完了する";
			}

			// 追加ボタンをクリック
			if (view["addButton"]) {
				view["addButton"].click();
			}

			// 非同期処理を待つ
			await new Promise((resolve) => {
				setTimeout(resolve, 0);
			});

			// 入力欄とプレビュー欄がクリアされること
			expect(view["inputTextarea"]?.value).toBe("");
			expect(view["previewTextarea"]?.value).toBe("");
		});
	});

	describe("エラーハンドリングと通知", () => {
		it("変換エラー時にNoticeを作成すべき", async () => {
			const mockConvert = vi.fn().mockResolvedValue({
				success: false,
				error: "API Error: 401 Unauthorized",
			});

			const { OpenRouterClient } = await import("../api/openrouter");
			vi.spyOn(OpenRouterClient.prototype, "convert").mockImplementation(mockConvert);

			// Noticeのモック
			const obsidian = await import("obsidian");
			const NoticeMock = vi.fn();
			vi.spyOn(obsidian, "Notice").mockImplementation(NoticeMock as unknown as typeof obsidian.Notice);

			const view = new TodoSidebarView(mockLeaf, mockSettings, mockApp);
			await view.onOpen();

			// 入力テキストを設定
			if (view["inputTextarea"]) {
				view["inputTextarea"].value = "タスクを完了する";
			}

			// 変換ボタンをクリック
			if (view["convertButton"]) {
				view["convertButton"].click();
			}

			// 非同期処理を待つ
			await new Promise((resolve) => {
				setTimeout(resolve, 0);
			});

			// エラー通知が作成されること
			expect(NoticeMock).toHaveBeenCalledWith(expect.stringContaining("変換エラー"));
		});

		it("追加エラー時にNoticeを作成すべき", async () => {
			const mockWrite = vi.fn().mockRejectedValue(new Error("Write error"));
			mockVault.adapter.write = mockWrite;

			// Noticeのモック
			const obsidian = await import("obsidian");
			const NoticeMock = vi.fn();
			vi.spyOn(obsidian, "Notice").mockImplementation(NoticeMock as unknown as typeof obsidian.Notice);

			const view = new TodoSidebarView(mockLeaf, mockSettings, mockApp);
			await view.onOpen();

			// プレビューテキストを設定
			if (view["previewTextarea"]) {
				view["previewTextarea"].value = "2026-01-14 タスクを完了する";
			}

			// 追加ボタンをクリック
			if (view["addButton"]) {
				view["addButton"].click();
			}

			// 非同期処理を待つ
			await new Promise((resolve) => {
				setTimeout(resolve, 0);
			});

			// エラー通知が作成されること
			expect(NoticeMock).toHaveBeenCalledWith(expect.stringContaining("追加エラー"));
		});

		it("追加成功時にNoticeで成功通知すべき", async () => {
			// Noticeのモック
			const obsidian = await import("obsidian");
			const NoticeMock = vi.fn();
			vi.spyOn(obsidian, "Notice").mockImplementation(NoticeMock as unknown as typeof obsidian.Notice);

			const view = new TodoSidebarView(mockLeaf, mockSettings, mockApp);
			await view.onOpen();

			// プレビューテキストを設定
			if (view["previewTextarea"]) {
				view["previewTextarea"].value = "2026-01-14 タスクを完了する";
			}

			// 追加ボタンをクリック
			if (view["addButton"]) {
				view["addButton"].click();
			}

			// 非同期処理を待つ
			await new Promise((resolve) => {
				setTimeout(resolve, 0);
			});

			// 成功通知が作成されること
			expect(NoticeMock).toHaveBeenCalledWith("タスクを追加しました");
		});
	});
});
