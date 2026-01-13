/**
 * OpenRouter API Client テスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenRouterClient } from "./openrouter";
import type { OpenRouterClientConfig } from "./openrouter";

// グローバルfetchをモック化（Obsidianのため）
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("OpenRouterClient", () => {
	let config: OpenRouterClientConfig;
	let client: OpenRouterClient;

	beforeEach(() => {
		vi.clearAllMocks();
		config = {
			apiKey: "test-api-key",
			baseUrl: "https://openrouter.ai/api/v1",
			model: "anthropic/claude-3.5-sonnet",
		};
		client = new OpenRouterClient(config);
	});

	describe("基本的なAPI呼び出し", () => {
		it("正常なAPIレスポンスでtodo.txt形式のテキストを返す", async () => {
			const mockResponse = {
				id: "test-id",
				model: "anthropic/claude-3.5-sonnet",
				choices: [
					{
						message: {
							role: "assistant",
							content: "2026-01-14 テストタスク @test",
						},
						finish_reason: "stop",
					},
				],
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await client.convert("テストタスク #test");

			expect(result.success).toBe(true);
			expect(result.todoText).toBe("2026-01-14 テストタスク @test");
			expect(result.error).toBeUndefined();
		});

		it("4xxエラー時にリトライせずにエラーメッセージを返す", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				statusText: "Bad Request",
			});

			const result = await client.convert("テストタスク");

			expect(result.success).toBe(false);
			expect(result.todoText).toBeUndefined();
			expect(result.error).toBeDefined();
			expect(mockFetch).toHaveBeenCalledTimes(1); // リトライしない
		});
	});

	describe("リトライロジック", () => {
		it(
			"一時的なエラーで最大3回リトライする",
			async () => {
				// maxRetriesを小さくしてテスト時間を短縮
				const testClient = new OpenRouterClient({
					...config,
					maxRetries: 2,
					initialRetryDelay: 10, // 10msに短縮
				});

				const mockResponse = {
					id: "test-id",
					model: "anthropic/claude-3.5-sonnet",
					choices: [
						{
							message: {
								role: "assistant",
								content: "2026-01-14 テストタスク",
							},
							finish_reason: "stop",
						},
					],
				};

				// 最初の2回は失敗、3回目で成功
				mockFetch
					.mockResolvedValueOnce({
						ok: false,
						status: 500,
						statusText: "Internal Server Error",
					})
					.mockResolvedValueOnce({
						ok: false,
						status: 500,
						statusText: "Internal Server Error",
					})
					.mockResolvedValueOnce({
						ok: true,
						json: async () => mockResponse,
					});

				const result = await testClient.convert("テストタスク");

				expect(result.success).toBe(true);
				expect(result.todoText).toBe("2026-01-14 テストタスク");
				expect(mockFetch).toHaveBeenCalledTimes(3);
			},
			10000,
		);

		it("Exponential backoffで遅延が増加する", async () => {
			vi.useFakeTimers();

			const testClient = new OpenRouterClient({
				...config,
				maxRetries: 3,
				initialRetryDelay: 1000,
			});

			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
			});

			const promise = testClient.convert("テストタスク");

			// 初回: すぐに実行
			expect(mockFetch).toHaveBeenCalledTimes(1);

			// 1秒後: 1回目のリトライ
			await vi.advanceTimersByTimeAsync(1000);
			expect(mockFetch).toHaveBeenCalledTimes(2);

			// さらに2秒後: 2回目のリトライ
			await vi.advanceTimersByTimeAsync(2000);
			expect(mockFetch).toHaveBeenCalledTimes(3);

			// さらに4秒後: 3回目のリトライ
			await vi.advanceTimersByTimeAsync(4000);
			expect(mockFetch).toHaveBeenCalledTimes(4);

			const result = await promise;
			expect(result.success).toBe(false);

			vi.useRealTimers();
		});

		it(
			"最大リトライ回数を超えたらエラーを返す",
			async () => {
				const testClient = new OpenRouterClient({
					...config,
					maxRetries: 2,
					initialRetryDelay: 10,
				});

				mockFetch.mockResolvedValue({
					ok: false,
					status: 500,
					statusText: "Internal Server Error",
				});

				const result = await testClient.convert("テストタスク");

				expect(result.success).toBe(false);
				expect(mockFetch).toHaveBeenCalledTimes(3); // 初回 + 2回リトライ
			},
			10000,
		);
	});

	describe("システムプロンプト", () => {
		it("システムプロンプトを含むリクエストを送信する", async () => {
			const mockResponse = {
				id: "test-id",
				model: "anthropic/claude-3.5-sonnet",
				choices: [
					{
						message: {
							role: "assistant",
							content: "2026-01-14 テストタスク",
						},
						finish_reason: "stop",
					},
				],
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			await client.convert("テストタスク");

			// fetchの引数を確認
			const fetchCall = mockFetch.mock.calls[0];
			expect(fetchCall).toBeDefined();
			if (!fetchCall) return;

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			const requestBody = JSON.parse(fetchCall[1].body as string) as {
				messages: Array<{ role: string; content: string }>;
			};

			// システムプロンプトが含まれているか確認
			expect(requestBody.messages).toHaveLength(2);
			expect(requestBody.messages[0]?.role).toBe("system");
			expect(requestBody.messages[0]?.content).toContain("todo.txt形式");
			expect(requestBody.messages[1]?.role).toBe("user");
			expect(requestBody.messages[1]?.content).toBe("テストタスク");
		});

		it("システムプロンプトに変換ルールが含まれる", async () => {
			const mockResponse = {
				id: "test-id",
				model: "anthropic/claude-3.5-sonnet",
				choices: [
					{
						message: {
							role: "assistant",
							content: "2026-01-14 テストタスク",
						},
						finish_reason: "stop",
					},
				],
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			await client.convert("テストタスク");

			const fetchCall = mockFetch.mock.calls[0];
			expect(fetchCall).toBeDefined();
			if (!fetchCall) return;

			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			const requestBody = JSON.parse(fetchCall[1].body as string) as {
				messages: Array<{ role: string; content: string }>;
			};
			const systemPrompt = requestBody.messages[0]?.content;

			// 変換ルールのキーワードが含まれているか確認
			expect(systemPrompt).toContain("YYYY-MM-DD");
			expect(systemPrompt).toContain("+ProjectName");
			expect(systemPrompt).toContain("@context");
		});
	});
});
