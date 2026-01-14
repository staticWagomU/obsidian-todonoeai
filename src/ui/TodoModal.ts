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
	constructor(app: App) {
		super(app);
	}

	/**
	 * モーダルを開いたときの処理
	 */
	async onOpen(): Promise<void> {
		// 最小限の実装
	}

	/**
	 * モーダルを閉じたときの処理
	 */
	async onClose(): Promise<void> {
		// 最小限の実装
	}
}
