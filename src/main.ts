import { Plugin } from "obsidian";
import { loadSettings, saveSettings } from "./settings";
import type { PluginSettings } from "./types/index";
import { TodonoeaiSettingsTab } from "./ui/SettingsTab";
import { TodoModal } from "./ui/TodoModal";

export default class TodonoeaiPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		// Add Todo コマンド
		this.addCommand({
			id: "add-todo",
			name: "Add Todo",
			callback: () => {
				new TodoModal(this.app, this.settings).open();
			},
		});

		// 設定タブの追加
		this.addSettingTab(new TodonoeaiSettingsTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = await loadSettings(() => this.loadData());
	}

	async saveSettings() {
		await saveSettings((data) => this.saveData(data), this.settings);
	}
}
