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
