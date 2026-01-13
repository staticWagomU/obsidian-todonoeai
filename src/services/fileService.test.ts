/**
 * FileService のテスト
 *
 * todo.txtファイル追記機能のテストを提供します。
 */
/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileService } from "./fileService";
import type { FileServiceConfig } from "./fileService";
import type { Vault } from "obsidian";

describe("FileService", () => {
	let mockVault: Vault;

	beforeEach(() => {
		mockVault = {
			adapter: {
				read: vi.fn(),
				write: vi.fn(),
				exists: vi.fn(),
			},
		} as unknown as Vault;
	});

	describe("基本構造", () => {
		it("正常にインスタンス化できる", () => {
			const config: FileServiceConfig = {
				vault: mockVault,
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
				vault: mockVault,
				settings: {
					apiKey: "",
					baseUrl: "",
					model: "",
					outputFilePath: "todo.txt",
					appendPosition: "bottom",
					contextKeywords: {},
				},
			};

			vi.mocked(mockVault.adapter.exists).mockResolvedValue(true);
			vi.mocked(mockVault.adapter.read).mockResolvedValue("existing content");

			const service = new FileService(config);
			const result = await service.appendToFile("new content");

			expect(result.success).toBe(true);
			expect(mockVault.adapter.exists).toHaveBeenCalledWith("todo.txt");
			expect(mockVault.adapter.read).toHaveBeenCalledWith("todo.txt");
			expect(mockVault.adapter.write).toHaveBeenCalledWith("todo.txt", "existing content\nnew content");
		});

		it("空ファイルの場合、改行なしで追記できる", async () => {
			const config: FileServiceConfig = {
				vault: mockVault,
				settings: {
					apiKey: "",
					baseUrl: "",
					model: "",
					outputFilePath: "todo.txt",
					appendPosition: "bottom",
					contextKeywords: {},
				},
			};

			vi.mocked(mockVault.adapter.exists).mockResolvedValue(true);
			vi.mocked(mockVault.adapter.read).mockResolvedValue("");

			const service = new FileService(config);
			const result = await service.appendToFile("new content");

			expect(result.success).toBe(true);
			expect(mockVault.adapter.write).toHaveBeenCalledWith("todo.txt", "new content");
		});
	});

	describe("appendToFile - 先頭追記", () => {
		it("ファイルが存在する場合、先頭に追記できる", async () => {
			const config: FileServiceConfig = {
				vault: mockVault,
				settings: {
					apiKey: "",
					baseUrl: "",
					model: "",
					outputFilePath: "todo.txt",
					appendPosition: "top",
					contextKeywords: {},
				},
			};

			vi.mocked(mockVault.adapter.exists).mockResolvedValue(true);
			vi.mocked(mockVault.adapter.read).mockResolvedValue("existing content");

			const service = new FileService(config);
			const result = await service.appendToFile("new content");

			expect(result.success).toBe(true);
			expect(mockVault.adapter.exists).toHaveBeenCalledWith("todo.txt");
			expect(mockVault.adapter.read).toHaveBeenCalledWith("todo.txt");
			expect(mockVault.adapter.write).toHaveBeenCalledWith("todo.txt", "new content\nexisting content");
		});

		it("空ファイルの場合、改行なしで追記できる", async () => {
			const config: FileServiceConfig = {
				vault: mockVault,
				settings: {
					apiKey: "",
					baseUrl: "",
					model: "",
					outputFilePath: "todo.txt",
					appendPosition: "top",
					contextKeywords: {},
				},
			};

			vi.mocked(mockVault.adapter.exists).mockResolvedValue(true);
			vi.mocked(mockVault.adapter.read).mockResolvedValue("");

			const service = new FileService(config);
			const result = await service.appendToFile("new content");

			expect(result.success).toBe(true);
			expect(mockVault.adapter.write).toHaveBeenCalledWith("todo.txt", "new content");
		});
	});

	describe("appendToFile - ファイル新規作成", () => {
		it("ファイルが存在しない場合、新規作成される", async () => {
			const config: FileServiceConfig = {
				vault: mockVault,
				settings: {
					apiKey: "",
					baseUrl: "",
					model: "",
					outputFilePath: "todo.txt",
					appendPosition: "bottom",
					contextKeywords: {},
				},
			};

			vi.mocked(mockVault.adapter.exists).mockResolvedValue(false);

			const service = new FileService(config);
			const result = await service.appendToFile("new content");

			expect(result.success).toBe(true);
			expect(mockVault.adapter.exists).toHaveBeenCalledWith("todo.txt");
			expect(mockVault.adapter.write).toHaveBeenCalledWith("todo.txt", "new content");
		});
	});

	describe("appendToFile - エラーハンドリング", () => {
		it("ファイル未設定の場合、エラーが返される", async () => {
			const config: FileServiceConfig = {
				vault: mockVault,
				settings: {
					apiKey: "",
					baseUrl: "",
					model: "",
					outputFilePath: "",
					appendPosition: "bottom",
					contextKeywords: {},
				},
			};

			const service = new FileService(config);
			const result = await service.appendToFile("new content");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Output file path is not set");
		});

		it("読み込みエラーの場合、エラーが返される", async () => {
			const config: FileServiceConfig = {
				vault: mockVault,
				settings: {
					apiKey: "",
					baseUrl: "",
					model: "",
					outputFilePath: "todo.txt",
					appendPosition: "bottom",
					contextKeywords: {},
				},
			};

			vi.mocked(mockVault.adapter.exists).mockResolvedValue(true);
			vi.mocked(mockVault.adapter.read).mockRejectedValue(new Error("Read error"));

			const service = new FileService(config);
			const result = await service.appendToFile("new content");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Read error");
		});

		it("書き込みエラーの場合、エラーが返される", async () => {
			const config: FileServiceConfig = {
				vault: mockVault,
				settings: {
					apiKey: "",
					baseUrl: "",
					model: "",
					outputFilePath: "todo.txt",
					appendPosition: "bottom",
					contextKeywords: {},
				},
			};

			vi.mocked(mockVault.adapter.exists).mockResolvedValue(true);
			vi.mocked(mockVault.adapter.read).mockResolvedValue("existing content");
			vi.mocked(mockVault.adapter.write).mockRejectedValue(new Error("Write error"));

			const service = new FileService(config);
			const result = await service.appendToFile("new content");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Write error");
		});
	});
});
