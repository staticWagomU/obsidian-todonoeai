/**
 * FileService - todo.txtファイル追記機能
 * 
 * Obsidian Vault APIを使用してファイル操作を行います。
 */
import type { PluginSettings } from "../types/index";
import type { Vault } from "obsidian";

/**
 * 追記結果の型定義
 */
export interface AppendResult {
	success: boolean;
	error?: string;
}

/**
 * FileServiceの設定型定義
 */
export interface FileServiceConfig {
	vault: Vault;
	settings: PluginSettings;
}

/**
 * FileService - ファイル追記機能を提供
 */
export class FileService {
	private vault: Vault;
	private settings: PluginSettings;

	constructor(config: FileServiceConfig) {
		this.vault = config.vault;
		this.settings = config.settings;
	}

	/**
	 * ファイルに内容を追記する
	 *
	 * @param content - 追記する内容
	 * @returns 追記結果
	 */
	async appendToFile(content: string): Promise<AppendResult> {
		try {
			const filePath = this.settings.outputFilePath;

			// ファイルパス未設定チェック
			if (!filePath) {
				return {
					success: false,
					error: "Output file path is not set",
				};
			}

			const fileExists = await this.vault.adapter.exists(filePath);

			if (fileExists) {
				// 既存ファイルに追記
				const existingContent = await this.vault.adapter.read(filePath);
				const newContent = this.mergeContent(existingContent, content);
				await this.vault.adapter.write(filePath, newContent);
			} else {
				// 新規ファイル作成
				await this.vault.adapter.write(filePath, content);
			}

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * 既存内容と新規内容をマージする
	 *
	 * @param existingContent - 既存内容
	 * @param newContent - 新規内容
	 * @returns マージされた内容
	 */
	private mergeContent(existingContent: string, newContent: string): string {
		if (!existingContent) {
			return newContent;
		}

		if (this.settings.appendPosition === "bottom") {
			return `${existingContent}\n${newContent}`;
		} else {
			return `${newContent}\n${existingContent}`;
		}
	}
}
