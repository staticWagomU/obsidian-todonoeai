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
	});
});
