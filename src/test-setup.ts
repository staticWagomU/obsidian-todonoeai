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
	setHeading = vi.fn().mockReturnThis();
	addText = vi.fn((callback?: (text: TextComponent) => unknown) => {
		if (callback) {
			const textComponent = new TextComponent();
			callback(textComponent);
		}
		return this;
	});
	addDropdown = vi.fn((callback?: (dropdown: DropdownComponent) => unknown) => {
		if (callback) {
			const dropdownComponent = new DropdownComponent();
			callback(dropdownComponent);
		}
		return this;
	});
	addButton = vi.fn().mockReturnThis();
	constructor(_containerEl: unknown) {}
}

export class TextComponent {
	setPlaceholder = vi.fn().mockReturnThis();
	setValue = vi.fn().mockReturnThis();
	onChange = vi.fn().mockReturnThis();
	inputEl: HTMLInputElement = {} as HTMLInputElement;
}

export class DropdownComponent {
	addOption = vi.fn().mockReturnThis();
	setValue = vi.fn().mockReturnThis();
	onChange = vi.fn().mockReturnThis();
	selectEl: HTMLSelectElement = {} as HTMLSelectElement;
}

export class Modal {
	contentEl: {
		empty: () => void;
		createEl: <K extends keyof HTMLElementTagNameMap>(
			tag: K,
			options?: unknown,
		) => HTMLElementTagNameMap[K];
	};

	constructor(public app: unknown) {
		this.contentEl = {
			empty: vi.fn(),
			createEl: vi.fn().mockImplementation((tag: string, options?: any) => {
				if (tag === "textarea") {
					return {
						rows: 0,
						style: {},
						readOnly: false,
						value: "",
						placeholder: options?.placeholder || "",
						focus: vi.fn(),
					} as unknown as HTMLTextAreaElement;
				}
				if (tag === "button") {
					return {
						style: {},
						textContent: options?.text || "",
						onclick: null as (() => void) | null,
						click: vi.fn(function (this: { onclick: (() => void) | null }) {
							if (this.onclick) {
								this.onclick();
							}
						}),
					} as unknown as HTMLButtonElement;
				}
				if (tag === "h2") {
					return {
						textContent: options?.text || "",
					} as unknown as HTMLHeadingElement;
				}
				return {
					style: {},
				} as HTMLElement;
			}),
		};
	}

	open(): void {
		// mock
	}

	close(): void {
		// mock
	}
}
export class Notice {
	constructor(public message: string) {}
}
export class MarkdownView {}
export class Editor {}

export class ItemView {
	leaf: unknown;
	containerEl: {
		empty: () => void;
		createEl: <K extends keyof HTMLElementTagNameMap>(
			tag: K,
			options?: unknown,
		) => HTMLElementTagNameMap[K];
		createDiv: (options?: { cls?: string }) => HTMLDivElement;
	};

	constructor(leaf: unknown) {
		this.leaf = leaf;
		this.containerEl = {
			empty: vi.fn(),
			createEl: vi.fn().mockImplementation((tag: string) => {
				// タグに応じた最小限のモックを返す
				if (tag === "textarea") {
					return {
						rows: 0,
						style: {},
						readOnly: false,
						value: "",
					} as HTMLTextAreaElement;
				}
				if (tag === "button") {
					const button = {
						style: {},
						onclick: null as (() => void) | null,
						click: vi.fn(function (this: { onclick: (() => void) | null }) {
							if (this.onclick) {
								this.onclick();
							}
						}),
					};
					return button as unknown as HTMLButtonElement;
				}
				return {
					style: {},
				} as HTMLElement;
			}),
			createDiv: vi.fn().mockReturnValue({} as HTMLDivElement),
		};
	}

	getViewType(): string {
		return "";
	}

	getDisplayText(): string {
		return "";
	}

	getIcon(): string {
		return "";
	}

	async onOpen(): Promise<void> {
		// mock
	}

	async onClose(): Promise<void> {
		// mock
	}
}

export class WorkspaceLeaf {}

// Vault Mock for testing
export interface Vault {
	adapter: {
		read: (path: string) => Promise<string>;
		write: (path: string, data: string) => Promise<void>;
		exists: (path: string) => Promise<boolean>;
	};
}
