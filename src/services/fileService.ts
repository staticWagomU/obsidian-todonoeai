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
}
