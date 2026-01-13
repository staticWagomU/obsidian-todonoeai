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

		// 出力設定セクション
		containerEl.createEl("h2", { text: "Output Settings" });

		// 出力ファイルパス設定
		new Setting(containerEl)
			.setName("Output File Path")
			.setDesc("todo.txt 出力先ファイルパス")
			.addText((text) =>
				text
					.setPlaceholder("todo.txt")
					.setValue(this.plugin.settings.outputFilePath)
					.onChange(async (value) => {
						this.plugin.settings.outputFilePath = value;
						await this.plugin.saveSettings();
					})
			);

		// 追記位置設定
		new Setting(containerEl)
			.setName("Append Position")
			.setDesc("タスクの追記位置")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("top", "Top (先頭)")
					.addOption("bottom", "Bottom (末尾)")
					.setValue(this.plugin.settings.appendPosition)
					.onChange(async (value) => {
						this.plugin.settings.appendPosition = value as "top" | "bottom";
						await this.plugin.saveSettings();
					})
			);
	}
}
