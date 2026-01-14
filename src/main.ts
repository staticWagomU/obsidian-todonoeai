import { Plugin } from "obsidian";
import { loadSettings, saveSettings } from "./settings";
import type { PluginSettings } from "./types/index";
import { TodonoeaiSettingsTab } from "./ui/SettingsTab";
import { TodoModal } from "./ui/TodoModal";
import { TodoSidebarView, VIEW_TYPE_TODO_SIDEBAR } from "./ui/SidebarView";

export default class TodonoeaiPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		// SidebarViewの登録
		this.registerView(VIEW_TYPE_TODO_SIDEBAR, (leaf) => {
			return new TodoSidebarView(leaf, this.settings, this.app);
		});

		// Add Todo コマンド
		this.addCommand({
			id: "add-todo",
			name: "Add todo",
			callback: () => {
				new TodoModal(this.app, this.settings).open();
			},
		});

		// リボンアイコンの追加
		this.addRibbonIcon("checkmark", "TodoのAI", () => {
			void this.activateView();
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

	async activateView(): Promise<void> {
		const { workspace } = this.app;

		// 既存のビューをデタッチ
		workspace.detachLeavesOfType(VIEW_TYPE_TODO_SIDEBAR);

		// 右サイドバーにビューを作成
		const leaf = workspace.getRightLeaf(false);
		await leaf?.setViewState({
			type: VIEW_TYPE_TODO_SIDEBAR,
			active: true,
		});

		// ビューを表示
		if (leaf) {
			void workspace.revealLeaf(leaf);
		}
	}
}
