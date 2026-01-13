/**
 * FileService のテスト
 * 
 * todo.txtファイル追記機能のテストを提供します。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileService } from "./fileService";
import type { FileServiceConfig, AppendResult } from "./fileService";

describe("FileService", () => {
	let mockAdapter: {
		read: ReturnType<typeof vi.fn>;
		write: ReturnType<typeof vi.fn>;
		exists: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		mockAdapter = {
			read: vi.fn(),
			write: vi.fn(),
			exists: vi.fn(),
		};
	});

	describe("基本構造", () => {
		it("正常にインスタンス化できる", () => {
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

	describe("appendToFile - 末尾追記", () => {
		it("ファイルが存在する場合、末尾に追記できる", async () => {
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

			mockAdapter.exists.mockResolvedValue(true);
			mockAdapter.read.mockResolvedValue("existing content");

			const service = new FileService(config);
			const result = await service.appendToFile("new content");

			expect(result.success).toBe(true);
			expect(mockAdapter.exists).toHaveBeenCalledWith("todo.txt");
			expect(mockAdapter.read).toHaveBeenCalledWith("todo.txt");
			expect(mockAdapter.write).toHaveBeenCalledWith("todo.txt", "existing content\nnew content");
		});

		it("空ファイルの場合、改行なしで追記できる", async () => {
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

			mockAdapter.exists.mockResolvedValue(true);
			mockAdapter.read.mockResolvedValue("");

			const service = new FileService(config);
			const result = await service.appendToFile("new content");

			expect(result.success).toBe(true);
			expect(mockAdapter.write).toHaveBeenCalledWith("todo.txt", "new content");
		});
	});
});
