/**
 * TodoSidebarView - サイドバーパネルUI
 *
 * Obsidian ItemViewを継承してサイドバーパネルを提供します。
 */
import { ItemView, WorkspaceLeaf, type App, Notice } from "obsidian";
import type { PluginSettings } from "../types/index";
import { OpenRouterClient } from "../api/openrouter";
import { FileService } from "../services/fileService";

/**
 * View Type ID
 */
export const VIEW_TYPE_TODO_SIDEBAR = "todonoeai-sidebar";

/**
 * TodoSidebarView - タスク入力用サイドバーパネル
 */
export class TodoSidebarView extends ItemView {
	private inputTextarea?: HTMLTextAreaElement;
	private previewTextarea?: HTMLTextAreaElement;
	private convertButton?: HTMLButtonElement;
	private addButton?: HTMLButtonElement;
	private settings?: PluginSettings;
	private openRouterClient?: OpenRouterClient;
	private fileService?: FileService;

	constructor(leaf: WorkspaceLeaf, settings?: PluginSettings, app?: App) {
		super(leaf);
		this.settings = settings;

		if (settings) {
			this.openRouterClient = new OpenRouterClient({
				apiKey: settings.apiKey,
				baseUrl: settings.baseUrl,
				model: settings.model,
			});
		}

		if (settings && app) {
			this.fileService = new FileService({
				vault: app.vault,
				settings: settings,
			});
		}
	}

	/**
	 * View Type IDを取得
	 */
	getViewType(): string {
		return VIEW_TYPE_TODO_SIDEBAR;
	}

	/**
	 * 表示名を取得
	 */
	getDisplayText(): string {
		return "TodoのAI";
	}

	/**
	 * アイコン名を取得
	 */
	getIcon(): string {
		return "checkmark";
	}

	/**
	 * パネルを開いたときの処理
	 */
	async onOpen(): Promise<void> {
		const container = this.containerEl;
		container.empty();

		// タイトル
		container.createEl("h4", { text: "TodoのAI" });

		// 入力エリア
		this.inputTextarea = container.createEl("textarea", {
			placeholder: "タスクを入力...",
			cls: "todonoeai-input-textarea",
		});
		this.inputTextarea.rows = 4;

		// 変換ボタン
		this.convertButton = container.createEl("button", {
			text: "AI変換",
			cls: "todonoeai-convert-button",
		});
		this.convertButton.onclick = async () => {
			await this.handleConvert();
		};

		// プレビューエリア
		this.previewTextarea = container.createEl("textarea", {
			placeholder: "todo.txtプレビュー",
			cls: "todonoeai-preview-textarea",
		});
		this.previewTextarea.rows = 4;
		this.previewTextarea.readOnly = true;

		// 追加ボタン
		this.addButton = container.createEl("button", {
			text: "ファイルに追加",
		});
		this.addButton.onclick = async () => {
			await this.handleAdd();
		};
	}

	/**
	 * パネルを閉じたときの処理
	 */
	async onClose(): Promise<void> {
		// クリーンアップ
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
		} else {
			new Notice(`追加エラー: ${result.error || "Unknown error"}`);
		}
	}
}
