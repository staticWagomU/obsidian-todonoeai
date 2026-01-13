/**
 * Obsidian設定画面の実装
 *
 * PluginSettingTab を継承し、プラグインの設定UIを提供します。
 */

import { PluginSettingTab } from "obsidian";
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
	}
}
