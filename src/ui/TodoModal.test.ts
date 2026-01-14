/**
 * TodoModal - テスト
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TodoModal } from "./TodoModal";
import { App } from "obsidian";

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
});
