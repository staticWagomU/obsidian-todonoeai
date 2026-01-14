/**
 * TodoModal - タスク入力モーダル
 * 
 * Obsidian Modalを継承してタスク入力モーダルを提供します。
 */
import { Modal, type App } from "obsidian";

/**
 * TodoModal - タスク入力用モーダル
 */
export class TodoModal extends Modal {
	private inputTextarea?: HTMLTextAreaElement;
	private previewTextarea?: HTMLTextAreaElement;
	private convertButton?: HTMLButtonElement;
	private addButton?: HTMLButtonElement;

	constructor(app: App) {
		super(app);
	}

	/**
	 * モーダルを開いたときの処理
	 */
	async onOpen(): Promise<void> {
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

		// 入力textareaにフォーカス
		this.inputTextarea.focus();
	}

	/**
	 * モーダルを閉じたときの処理
	 */
	async onClose(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();
	}
}
