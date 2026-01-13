import { describe, expect, it } from "vitest";
import type { AppendPosition, PluginSettings } from "./index";

describe("PluginSettings型定義", () => {
	it("PluginSettings型が正しくエクスポートされているべき", async () => {
		// 型定義ファイルが存在しない場合、このインポートはエラーになる
		const typesModule = await import("./index");

		// 型定義のみのモジュールなので、実行時には何もエクスポートされないが、
		// TypeScriptコンパイル時には型が利用可能であることを確認
		expect(typesModule).toBeDefined();
	});

	it("PluginSettings型が正しい構造を持つべき", () => {
		const settings: PluginSettings = {
			apiKey: "test-api-key",
			baseUrl: "https://openrouter.ai/api/v1",
			model: "anthropic/claude-3.5-sonnet",
			outputFilePath: "todo.txt",
			appendPosition: "bottom",
			contextKeywords: {
				"パソコン": "pc",
				"電話": "phone",
			},
		};

		expect(settings.apiKey).toBe("test-api-key");
		expect(settings.baseUrl).toBe("https://openrouter.ai/api/v1");
		expect(settings.model).toBe("anthropic/claude-3.5-sonnet");
		expect(settings.outputFilePath).toBe("todo.txt");
		expect(settings.appendPosition).toBe("bottom");
		expect(settings.contextKeywords).toEqual({
			"パソコン": "pc",
			"電話": "phone",
		});
	});

	it("appendPosition は 'top' を受け付けるべき", () => {
		const position: AppendPosition = "top";
		expect(position).toBe("top");
	});

	it("appendPosition は 'bottom' を受け付けるべき", () => {
		const position: AppendPosition = "bottom";
		expect(position).toBe("bottom");
	});

	it("contextKeywords は空のオブジェクトを許可すべき", () => {
		const settings: PluginSettings = {
			apiKey: "",
			baseUrl: "",
			model: "",
			outputFilePath: "",
			appendPosition: "bottom",
			contextKeywords: {},
		};

		expect(settings.contextKeywords).toEqual({});
		expect(Object.keys(settings.contextKeywords).length).toBe(0);
	});
});
