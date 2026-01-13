/**
 * FileService のテスト
 * 
 * todo.txtファイル追記機能のテストを提供します。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileService } from "./fileService";
import type { FileServiceConfig, AppendResult } from "./fileService";

describe("FileService", () => {
	describe("基本構造", () => {
		it("正常にインスタンス化できる", () => {
			const mockAdapter = {
				read: vi.fn(),
				write: vi.fn(),
				exists: vi.fn(),
			};

			const config: FileServiceConfig = {
				vault: { adapter: mockAdapter } as any,
				settings: {
					apiKey: "",
					baseUrl: "",
					model: "",
					outputFilePath: "todo.txt",
					appendPosition: "bottom",
					contextKeywords: {},
				},
			};

			const service = new FileService(config);
			expect(service).toBeInstanceOf(FileService);
		});
	});
});
