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
	containerEl: {
		empty: () => void;
		createEl: (tag: string, options?: { text?: string }) => HTMLElement;
		createDiv: (options?: { cls?: string }) => HTMLDivElement;
	};
	constructor(app: unknown, plugin: unknown) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = {
			empty: vi.fn(),
			createEl: vi.fn().mockReturnValue({} as HTMLElement),
			createDiv: vi.fn().mockReturnValue({} as HTMLDivElement),
		};
	}
}

export class Setting {
	setName = vi.fn().mockReturnThis();
	setDesc = vi.fn().mockReturnThis();
	addText = vi.fn((callback?: (text: TextComponent) => unknown) => {
		if (callback) {
			const textComponent = new TextComponent();
			callback(textComponent);
		}
		return this;
	});
	addDropdown = vi.fn().mockReturnThis();
	addButton = vi.fn().mockReturnThis();
	constructor(_containerEl: unknown) {}
}

export class TextComponent {
	setPlaceholder = vi.fn().mockReturnThis();
	setValue = vi.fn().mockReturnThis();
	onChange = vi.fn().mockReturnThis();
	inputEl: HTMLInputElement = {} as HTMLInputElement;
}

export class Modal {}
export class Notice {}
export class MarkdownView {}
export class Editor {}
