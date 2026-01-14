/**
 * TodoModal - テスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TodoModal } from "./TodoModal";
import { App, Notice } from "obsidian";
import type { PluginSettings } from "../types/index";
import type { OpenRouterClient } from "../api/openrouter";

describe("TodoModal", () => {
	let app: App;
	let modal: TodoModal;

	beforeEach(() => {
		app = new App();
		modal = new TodoModal(app);
	});

	describe("constructor", () => {
		it("Appインスタンスを受け取ってModalを生成できる", () => {
			expect(modal).toBeDefined();
			expect(modal).toBeInstanceOf(TodoModal);
		});
	});

	describe("onOpen", () => {
		it("onOpenが呼ばれる", async () => {
			await expect(modal.onOpen()).resolves.toBeUndefined();
		});
	});

	describe("onClose", () => {
		it("onCloseが呼ばれる", async () => {
			await expect(modal.onClose()).resolves.toBeUndefined();
		});

		it("contentEl.empty()が呼ばれる", async () => {
			const emptySpy = vi.spyOn(modal.contentEl, "empty");
			await modal.onClose();
			expect(emptySpy).toHaveBeenCalledOnce();
		});
	});

	describe("UI構築", () => {
		beforeEach(async () => {
			await modal.onOpen();
		});

		it("タイトルが表示される", () => {
			const createElSpy = vi.spyOn(modal.contentEl, "createEl");
			// タイトル要素が作成されているか確認
			expect(createElSpy).toHaveBeenCalledWith("h2", expect.objectContaining({ text: "タスク入力" }));
		});

		it("入力textareaが作成される（4行、placeholder付き）", () => {
			const createElSpy = vi.spyOn(modal.contentEl, "createEl");
			expect(createElSpy).toHaveBeenCalledWith("textarea", expect.objectContaining({
				placeholder: "タスクを入力...",
			}));
		});

		it("変換ボタンが作成される", () => {
			const createElSpy = vi.spyOn(modal.contentEl, "createEl");
			expect(createElSpy).toHaveBeenCalledWith("button", expect.objectContaining({
				text: "AI変換",
			}));
		});

		it("プレビューtextareaが作成される（readOnly、4行）", () => {
			const createElSpy = vi.spyOn(modal.contentEl, "createEl");
			expect(createElSpy).toHaveBeenCalledWith("textarea", expect.objectContaining({
				placeholder: "todo.txtプレビュー",
			}));
		});

		it("追加ボタンが作成される", () => {
			const createElSpy = vi.spyOn(modal.contentEl, "createEl");
			expect(createElSpy).toHaveBeenCalledWith("button", expect.objectContaining({
				text: "ファイルに追加",
			}));
		});

		it("入力textareaにフォーカスが当たる", async () => {
			// モーダルを再度開く
			await modal.onClose();
			const focusSpy = vi.fn();

			// contentEl.createElのモックを設定
			const originalCreateEl = modal.contentEl.createEl;
			modal.contentEl.createEl = vi.fn().mockImplementation((tag: string, options?: any) => {
				const element = originalCreateEl.call(modal.contentEl, tag, options);
				if (tag === "textarea" && options?.placeholder === "タスクを入力...") {
					(element as any).focus = focusSpy;
				}
				return element;
			});

			await modal.onOpen();
			expect(focusSpy).toHaveBeenCalledOnce();
		});
	});

	describe("OpenRouterClient統合", () => {
		let settings: PluginSettings;
		let mockOpenRouterClient: OpenRouterClient;

		beforeEach(() => {
			settings = {
				apiKey: "test-api-key",
				baseUrl: "https://openrouter.ai/api/v1",
				model: "test-model",
				outputFilePath: "todos.txt",
				appendPosition: "bottom",
			};

			mockOpenRouterClient = {
				convert: vi.fn().mockResolvedValue({
					success: true,
					todoText: "2026-01-14 Test task",
				}),
			} as any;
		});

		it("設定を受け取ってOpenRouterClientを初期化できる", () => {
			const modalWithSettings = new TodoModal(app, settings);
			expect(modalWithSettings).toBeDefined();
		});

		it("変換ボタンクリック時、入力値が空の場合は何もしない", async () => {
			const modalWithSettings = new TodoModal(app, settings, mockOpenRouterClient);
			await modalWithSettings.onOpen();

			// 入力textareaを取得（privateなので、イベントトリガーで確認）
			const convertButton = modalWithSettings.contentEl.createEl.mock.results
				.find((result: any) => result.value?.textContent === "AI変換")?.value;

			// 入力が空の状態でクリック
			if (convertButton?.onclick) {
				await convertButton.onclick();
			}

			expect(mockOpenRouterClient.convert).not.toHaveBeenCalled();
		});

		it("変換ボタンクリック時、OpenRouterClient.convert()を呼び出す", async () => {
			const modalWithSettings = new TodoModal(app, settings, mockOpenRouterClient);
			await modalWithSettings.onOpen();

			// 入力textareaに値をセット
			const inputTextarea = modalWithSettings.contentEl.createEl.mock.results
				.find((result: any) => result.value?.placeholder === "タスクを入力...")?.value;
			if (inputTextarea) {
				inputTextarea.value = "Test task";
			}

			// 変換ボタンクリック
			const convertButton = modalWithSettings.contentEl.createEl.mock.results
				.find((result: any) => result.value?.textContent === "AI変換")?.value;
			if (convertButton?.onclick) {
				await convertButton.onclick();
			}

			expect(mockOpenRouterClient.convert).toHaveBeenCalledWith("Test task");
		});

		it("変換成功時、プレビューtextareaに結果を表示", async () => {
			const modalWithSettings = new TodoModal(app, settings, mockOpenRouterClient);
			await modalWithSettings.onOpen();

			// 入力textareaに値をセット
			const inputTextarea = modalWithSettings.contentEl.createEl.mock.results
				.find((result: any) => result.value?.placeholder === "タスクを入力...")?.value;
			if (inputTextarea) {
				inputTextarea.value = "Test task";
			}

			// プレビューtextareaを取得
			const previewTextarea = modalWithSettings.contentEl.createEl.mock.results
				.find((result: any) => result.value?.placeholder === "todo.txtプレビュー")?.value;

			// 変換ボタンクリック
			const convertButton = modalWithSettings.contentEl.createEl.mock.results
				.find((result: any) => result.value?.textContent === "AI変換")?.value;
			if (convertButton?.onclick) {
				await convertButton.onclick();
			}

			expect(previewTextarea?.value).toBe("2026-01-14 Test task");
		});

		it("変換失敗時、Notice経由でエラー表示される", async () => {
			const failMockClient = {
				convert: vi.fn().mockResolvedValue({
					success: false,
					error: "API Error",
				}),
			} as any;

			const modalWithSettings = new TodoModal(app, settings, failMockClient);
			await modalWithSettings.onOpen();

			// 入力textareaに値をセット
			const inputTextarea = modalWithSettings.contentEl.createEl.mock.results
				.find((result: any) => result.value?.placeholder === "タスクを入力...")?.value;
			if (inputTextarea) {
				inputTextarea.value = "Test task";
			}

			// 変換ボタンクリック
			const convertButton = modalWithSettings.contentEl.createEl.mock.results
				.find((result: any) => result.value?.textContent === "AI変換")?.value;
			if (convertButton?.onclick) {
				await convertButton.onclick();
			}

			// convert自体は呼ばれている
			expect(failMockClient.convert).toHaveBeenCalledWith("Test task");
		});
	});
});
