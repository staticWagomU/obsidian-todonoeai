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
		new Setting(containerEl).setName("OpenRouter").setHeading();

		// APIキー設定
		new Setting(containerEl)
			.setName("API key")
			.setDesc("Your OpenRouter API key")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					})
			);

		// Base URL設定
		new Setting(containerEl)
			.setName("Base URL")
			.setDesc("Base URL for OpenRouter API")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.baseUrl)
					.onChange(async (value) => {
						this.plugin.settings.baseUrl = value;
						await this.plugin.saveSettings();
					})
			);

		// モデル設定
		new Setting(containerEl)
			.setName("Model")
			.setDesc("Model name to use for AI generation")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
					})
			);

		// 出力設定セクション
		new Setting(containerEl).setName("Output").setHeading();

		// 出力ファイルパス設定
		new Setting(containerEl)
			.setName("File path")
			.setDesc("File path for todo.txt output")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.outputFilePath)
					.onChange(async (value) => {
						this.plugin.settings.outputFilePath = value;
						await this.plugin.saveSettings();
					})
			);

		// 追記位置設定
		new Setting(containerEl)
			.setName("Append position")
			.setDesc("Position to append new tasks")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("top", "Top")
					.addOption("bottom", "Bottom")
					.setValue(this.plugin.settings.appendPosition)
					.onChange(async (value) => {
						this.plugin.settings.appendPosition = value as "top" | "bottom";
						await this.plugin.saveSettings();
					})
			);

		// コンテキストキーワード設定セクション
		new Setting(containerEl).setName("Context keywords").setHeading();

		// 説明文
		containerEl.createEl("p", {
			text: "Configure custom context keyword mappings (add/delete functionality will be implemented in the future).",
		});
	}
}
