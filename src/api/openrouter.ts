/**
 * OpenRouter API Client
 * 
 * 自然言語をtodo.txt形式に変換するためのAI API連携クライアント
 */

/**
 * OpenRouter APIリクエストメッセージ
 */
export interface OpenRouterMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

/**
 * OpenRouter APIリクエスト
 */
export interface OpenRouterRequest {
	model: string;
	messages: OpenRouterMessage[];
	temperature?: number;
	max_tokens?: number;
}

/**
 * OpenRouter APIレスポンスのチョイス
 */
export interface OpenRouterChoice {
	message: {
		role: string;
		content: string;
	};
	finish_reason: string;
}

/**
 * OpenRouter APIレスポンス
 */
export interface OpenRouterResponse {
	id: string;
	model: string;
	choices: OpenRouterChoice[];
}

/**
 * 変換結果
 */
export interface ConversionResult {
	success: boolean;
	todoText?: string;
	error?: string;
}

/**
 * OpenRouter Client設定
 */
export interface OpenRouterClientConfig {
	apiKey: string;
	baseUrl: string;
	model: string;
	maxRetries?: number;
	initialRetryDelay?: number;
}

/**
 * OpenRouter API Client
 */
export class OpenRouterClient {
	private config: OpenRouterClientConfig;
	private systemPrompt: string;

	constructor(config: OpenRouterClientConfig) {
		this.config = {
			maxRetries: 3,
			initialRetryDelay: 1000,
			...config,
		};

		// システムプロンプトの定義
		const currentDate = new Date().toISOString().split("T")[0];
		this.systemPrompt = `あなたはタスク管理の専門家です。ユーザーの自然言語入力をtodo.txt形式に変換してください。

## 変換ルール
1. 各タスクは1行で表現
2. 作成日は YYYY-MM-DD 形式で先頭に付与
3. プロジェクトは +ProjectName 形式
4. コンテキストは @context 形式
5. 期限は due:YYYY-MM-DD 形式

## プロジェクト判定
文頭が以下のパターンの場合、後続のタスクにプロジェクトを付与：
- 「〇〇についてです」
- 「〇〇の件」
- 「〇〇関連」

## コンテキスト判定
入力文末の #keyword を @keyword に変換

## 優先度判定
「緊急」「最優先」→ (A)
「重要」「優先」→ (B)
「急ぎ」→ (C)
それ以外は優先度なし

## 期限判定
相対的な日付表現を絶対日付に変換
今日の日付: ${currentDate}

## 出力形式
todo.txt形式のみを出力（説明不要）`;
	}

	/**
	 * 自然言語をtodo.txt形式に変換
	 */
	async convert(input: string): Promise<ConversionResult> {
		let lastError: string | undefined;

		for (let attempt = 0; attempt <= (this.config.maxRetries ?? 3); attempt++) {
			try {
				const request: OpenRouterRequest = {
					model: this.config.model,
					messages: [
						{
							role: "system",
							content: this.systemPrompt,
						},
						{
							role: "user",
							content: input,
						},
					],
				};

				// eslint-disable-next-line no-restricted-globals
				const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${this.config.apiKey}`,
					},
					body: JSON.stringify(request),
				});

				if (!response.ok) {
					lastError = `API Error: ${response.status} ${response.statusText}`;

					// リトライ対象のエラー: 5xx, 429
					if (response.status >= 500 || response.status === 429) {
						if (attempt < (this.config.maxRetries ?? 3)) {
							await this.sleep(this.getRetryDelay(attempt));
							continue;
						}
					}

					return {
						success: false,
						error: lastError,
					};
				}

				const data = (await response.json()) as OpenRouterResponse;
				const todoText = data.choices[0]?.message.content;

				return {
					success: true,
					todoText,
				};
			} catch (error) {
				lastError = error instanceof Error ? error.message : "Unknown error";

				// ネットワークエラーもリトライ対象
				if (attempt < (this.config.maxRetries ?? 3)) {
					await this.sleep(this.getRetryDelay(attempt));
					continue;
				}
			}
		}

		return {
			success: false,
			error: lastError ?? "Unknown error",
		};
	}

	/**
	 * Exponential backoffによるリトライ遅延を計算
	 */
	private getRetryDelay(attempt: number): number {
		const baseDelay = this.config.initialRetryDelay ?? 1000;
		return baseDelay * Math.pow(2, attempt);
	}

	/**
	 * 指定ミリ秒待機
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
