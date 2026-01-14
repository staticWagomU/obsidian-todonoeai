/**
 * TodoModal - タスク入力モーダル
 *
 * Obsidian Modalを継承してタスク入力モーダルを提供します。
 */
import { Modal, Notice, type App } from "obsidian";
import type { PluginSettings } from "../types/index";
import { OpenRouterClient } from "../api/openrouter";
import { FileService } from "../services/fileService";

/**
 * TodoModal - タスク入力用モーダル
 */
export class TodoModal extends Modal {
	private inputTextarea?: HTMLTextAreaElement;
	private previewTextarea?: HTMLTextAreaElement;
	private convertButton?: HTMLButtonElement;
	private addButton?: HTMLButtonElement;
	private settings?: PluginSettings;
	private openRouterClient?: OpenRouterClient;
	private fileService?: FileService;

	constructor(
		app: App,
		settings?: PluginSettings,
		openRouterClient?: OpenRouterClient,
		fileService?: FileService
	) {
		super(app);
		this.settings = settings;

		if (openRouterClient) {
			this.openRouterClient = openRouterClient;
		} else if (settings) {
			this.openRouterClient = new OpenRouterClient({
				apiKey: settings.apiKey,
				baseUrl: settings.baseUrl,
				model: settings.model,
			});
		}

		if (fileService) {
			this.fileService = fileService;
		} else if (settings) {
			this.fileService = new FileService({
				vault: app.vault,
				settings: settings,
			});
		}
	}

	/**
	 * モーダルを開いたときの処理
	 */
	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();

		// タイトル
		contentEl.createEl("h2", { text: "タスク入力" });

		// 入力エリア
		this.inputTextarea = contentEl.createEl("textarea", {
			placeholder: "タスクを入力...",
		});
		this.inputTextarea.rows = 4;

		// 変換ボタン
		this.convertButton = contentEl.createEl("button", {
			text: "AI変換",
		});
		this.convertButton.onclick = async () => {
			await this.handleConvert();
		};

		// プレビューエリア
		this.previewTextarea = contentEl.createEl("textarea", {
			placeholder: "todo.txtプレビュー",
		});
		this.previewTextarea.rows = 4;
		this.previewTextarea.readOnly = true;

		// 追加ボタン
		this.addButton = contentEl.createEl("button", {
			text: "ファイルに追加",
		});
		this.addButton.onclick = async () => {
			await this.handleAdd();
		};

		// 入力textareaにフォーカス
		this.inputTextarea.focus();
	}

	/**
	 * モーダルを閉じたときの処理
	 */
	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}

	/**
	 * 変換ボタンクリック時の処理
	 */
	private async handleConvert(): Promise<void> {
		if (!this.openRouterClient) {
			return;
		}

		const inputText = this.inputTextarea?.value || "";
		if (!inputText) {
			return;
		}

		const result = await this.openRouterClient.convert(inputText);

		if (result.success && result.todoText && this.previewTextarea) {
			this.previewTextarea.value = result.todoText;
		} else if (!result.success) {
			new Notice(`変換エラー: ${result.error || "Unknown error"}`);
		}
	}

	/**
	 * 追加ボタンクリック時の処理
	 */
	private async handleAdd(): Promise<void> {
		if (!this.fileService) {
			return;
		}

		const todoText = this.previewTextarea?.value || "";
		if (!todoText) {
			return;
		}

		const result = await this.fileService.appendToFile(todoText);

		if (result.success) {
			new Notice("タスクを追加しました");
			// 成功時は入力欄とプレビュー欄をクリア
			if (this.inputTextarea) {
				this.inputTextarea.value = "";
			}
			if (this.previewTextarea) {
				this.previewTextarea.value = "";
			}
			// モーダルを閉じる
			this.close();
		} else {
			new Notice(`追加エラー: ${result.error || "Unknown error"}`);
		}
	}
}
