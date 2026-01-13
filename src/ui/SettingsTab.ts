/**
 * Obsidian設定画面の実装
 *
 * PluginSettingTab を継承し、プラグインの設定UIを提供します。
 */

import { PluginSettingTab, Setting } from "obsidian";
import type { App } from "obsidian";
import type TodonoeaiPlugin from "../main";

/**
 * Todonoeai プラグインの設定タブ
 */
export class TodonoeaiSettingsTab extends PluginSettingTab {
	plugin: TodonoeaiPlugin;

	constructor(app: App, plugin: TodonoeaiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// OpenRouter設定セクション
		containerEl.createEl("h2", { text: "OpenRouter Settings" });

		// APIキー設定
		new Setting(containerEl)
			.setName("API Key")
			.setDesc("OpenRouter API キー")
			.addText((text) =>
				text
					.setPlaceholder("sk-...")
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					})
			);

		// Base URL設定
		new Setting(containerEl)
			.setName("Base URL")
			.setDesc("OpenRouter API Base URL")
			.addText((text) =>
				text
					.setPlaceholder("https://openrouter.ai/api/v1")
					.setValue(this.plugin.settings.baseUrl)
					.onChange(async (value) => {
						this.plugin.settings.baseUrl = value;
						await this.plugin.saveSettings();
					})
			);

		// モデル設定
		new Setting(containerEl)
			.setName("Model")
			.setDesc("使用するモデル名")
			.addText((text) =>
				text
					.setPlaceholder("anthropic/claude-3.5-sonnet")
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
