/**
 * プラグインの設定型定義
 * 
 * OpenRouter用の設定を含む、型安全な設定管理を提供します。
 */

/**
 * 追記位置の型定義
 */
export type AppendPosition = "top" | "bottom";

/**
 * プラグインの設定インターフェース
 * 
 * @property apiKey - OpenRouter API キー
 * @property baseUrl - OpenRouter Base URL
 * @property model - 使用するモデル名
 * @property outputFilePath - todo.txt の出力先ファイルパス
 * @property appendPosition - 追記位置（先頭/末尾）
 * @property contextKeywords - カスタムコンテキストのマッピング
 */
export interface PluginSettings {
	apiKey: string;
	baseUrl: string;
	model: string;
	outputFilePath: string;
	appendPosition: AppendPosition;
	contextKeywords: Record<string, string>;
}
