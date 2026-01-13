/**
 * Vitest テストセットアップ / Obsidian API モック
 */
import { vi } from "vitest";

// Obsidian API のモッククラス・関数
export class App {}
export class Plugin {}
export class PluginSettingTab {
	app: unknown;
	plugin: unknown;
	containerEl: { empty: () => void };
	constructor(app: unknown, plugin: unknown) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = { empty: vi.fn() };
	}
}
export class Setting {}
export class Modal {}
export class Notice {}
export class MarkdownView {}
export class Editor {}
