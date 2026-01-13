/**
 * プラグイン設定管理
 *
 * DEFAULT_SETTINGS の定義と設定の読み込み・保存機能を提供します。
 */

import type { PluginSettings } from "./types/index";

/**
 * デフォルト設定値
 *
 * プラグイン初回起動時または設定が存在しない場合に使用されます。
 */
export const DEFAULT_SETTINGS: PluginSettings = {
	apiKey: "",
	baseUrl: "https://openrouter.ai/api/v1",
	model: "anthropic/claude-3.5-sonnet",
	outputFilePath: "todo.txt",
	appendPosition: "bottom",
	contextKeywords: {},
};

/**
 * データ読み込み関数の型定義
 */
export type LoadDataFn = () => Promise<unknown>;

/**
 * データ保存関数の型定義
 */
export type SaveDataFn = (data: PluginSettings) => Promise<void>;

/**
 * 設定を読み込む
 *
 * @param loadDataFn - Obsidian Plugin の loadData 関数
 * @returns 読み込まれた設定（デフォルト設定とマージ済み）
 */
export async function loadSettings(loadDataFn: LoadDataFn): Promise<PluginSettings> {
	const savedData = (await loadDataFn()) as Partial<PluginSettings> | null;

	return {
		...DEFAULT_SETTINGS,
		...savedData,
	};
}

/**
 * 設定を保存する
 *
 * @param saveDataFn - Obsidian Plugin の saveData 関数
 * @param settings - 保存する設定
 */
export async function saveSettings(
	saveDataFn: SaveDataFn,
	settings: PluginSettings,
): Promise<void> {
	await saveDataFn(settings);
}
