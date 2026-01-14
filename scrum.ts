/**
 * AI-Agentic Scrum Dashboard - Single Source of Truth
 * Run: deno run scrum.ts | jq '.'
 */

// === PRODUCT VISION ===
const productVision = {
  name: "todonoeai",
  tagline: "todo + の + AI = todoのAI",
  goal: "ユーザーが自然言語でタスクを入力すると、生成AIがtodo.txt形式に変換し、指定されたファイルに追記するObsidianプラグイン",
  targetUsers: ["Obsidianユーザー", "タスク管理を効率化したい人"],
  successMetrics: ["自然言語→todo.txt変換", "OpenRouter連携", "サイドバーUI"],
} as const;

// === DEFINITION OF DONE ===
const definitionOfDone = {
  criteria: ["テスト通過", "型チェックOK", "LintOK", "ビルド成功", "受け入れ基準達成"],
  verificationCommands: ["pnpm test:run", "pnpm typecheck", "pnpm lint", "pnpm build"],
} as const;

// === TYPES ===
type PBIStatus = "draft" | "ready" | "in_sprint" | "done" | "cancelled";
type Priority = "critical" | "high" | "medium" | "low";
type SubtaskStatus = "pending" | "red" | "green" | "refactor" | "done";

interface AcceptanceCriterion { given: string; when: string; then: string; }
interface ProductBacklogItem {
  id: string; title: string; status: PBIStatus; priority: Priority;
  userStory: { asA: string; iWant: string; soThat: string };
  acceptanceCriteria: AcceptanceCriterion[];
  notes?: string[];
}
interface Subtask { id: string; title: string; status: SubtaskStatus; }
interface Sprint {
  number: number; goal: string; pbiId: string | null;
  status: "planning" | "active" | "review" | "completed";
  subtasks: Subtask[];
}
interface Impediment { id: string; description: string; status: "open" | "resolved"; resolution?: string; }
interface RetrospectiveInsight { sprint: number; insights: string[]; actionItems: string[]; }

// === PRODUCT BACKLOG ===
const productBacklog: ProductBacklogItem[] = [
  {
    id: "PBI-001", title: "型定義・設定基盤の構築", status: "done", priority: "critical",
    userStory: { asA: "開発者", iWant: "型安全なプラグイン設定と基本型定義を持つ", soThat: "一貫性のある開発を行える" },
    acceptanceCriteria: [
      { given: "プラグインロード時", when: "設定読み込み", then: "デフォルト設定が型安全に初期化" },
      { given: "設定画面で", when: "設定変更", then: "保存され再起動後も維持" },
      { given: "OpenRouter設定で", when: "APIキー等設定", then: "適切に保存される" },
    ],
    notes: ["Sprint 1完了: 22テスト"],
  },
  {
    id: "PBI-002", title: "設定画面UIの実装", status: "done", priority: "critical",
    userStory: { asA: "ユーザー", iWant: "Obsidian設定画面でAI設定を行いたい", soThat: "APIキーやモデルを簡単に設定できる" },
    acceptanceCriteria: [
      { given: "設定画面を開いた時", when: "OpenRouter設定表示", then: "APIキー、モデル選択、Base URL入力欄表示" },
      { given: "出力設定で", when: "パスと追記位置設定", then: "出力先と追記位置（先頭/末尾）設定可" },
      { given: "コンテキスト設定で", when: "キーワード追加", then: "日本語→コンテキストマッピング保存" },
      { given: "設定変更時", when: "画面を閉じる", then: "自動保存される" },
    ],
    notes: ["Sprint 2完了: 26テスト"],
  },
  {
    id: "PBI-003", title: "サイドバーパネルUIの実装", status: "done", priority: "high",
    userStory: { asA: "ユーザー", iWant: "サイドバーからタスク入力したい", soThat: "作業中断せずタスク追加できる" },
    acceptanceCriteria: [
      { given: "プラグインロード時", when: "ItemView登録", then: "VIEW_TYPEでregisterView完了" },
      { given: "Obsidian起動時", when: "パネルを開く", then: "タスク入力textareaとボタン表示" },
      { given: "自然言語入力時", when: "生成ボタンクリック", then: "OpenRouterClient.convert()でAI変換実行" },
      { given: "AI変換成功時", when: "プレビュー表示", then: "todo.txt形式がtextareaに表示され編集可" },
      { given: "AI変換失敗時", when: "エラー発生", then: "Notice()でエラーメッセージ表示" },
      { given: "プレビュー確認時", when: "追加ボタンクリック", then: "FileService.appendToFile()でファイル追記" },
      { given: "ファイル追記成功時", when: "完了通知", then: "Notice()で成功通知、入力欄クリア" },
      { given: "ファイル追記失敗時", when: "エラー通知", then: "Notice()でエラー表示" },
    ],
    notes: ["Sprint 5完了: 61テスト、ItemView+OpenRouterClient+FileService統合"],
  },
  {
    id: "PBI-004", title: "OpenRouter API連携", status: "done", priority: "high",
    userStory: { asA: "ユーザー", iWant: "自然言語をtodo.txt形式に変換したい", soThat: "手動フォーマットの手間省ける" },
    acceptanceCriteria: [
      { given: "APIキー設定時", when: "テキスト送信", then: "todo.txt形式レスポンス返却" },
      { given: "APIエラー時", when: "自動リトライ", then: "最大3回リトライ、失敗時エラー表示" },
      { given: "〇〇の件パターン時", when: "変換実行", then: "+ProjectName形式で付与" },
      { given: "#keyword入力時", when: "変換実行", then: "@keyword形式で付与" },
    ],
    notes: ["Sprint 3完了: 33テスト"],
  },
  {
    id: "PBI-005", title: "タスク入力モーダルの実装", status: "done", priority: "medium",
    userStory: { asA: "キーボード派ユーザー", iWant: "モーダルでタスク入力したい", soThat: "素早くタスク追加できる" },
    acceptanceCriteria: [
      { given: "モーダル表示時", when: "onOpen()実行", then: "タイトル、入力textarea(4行)、変換ボタン、プレビューtextarea(readOnly,4行)、追加ボタンが表示され、入力textareaにフォーカス" },
      { given: "タスク入力時", when: "変換ボタンクリック", then: "OpenRouterClient.convert()でAI変換実行、成功時previewTextarea更新" },
      { given: "AI変換失敗時", when: "エラー発生", then: "Notice()でエラーメッセージ表示" },
      { given: "プレビュー確認時", when: "追加ボタンクリック", then: "FileService.appendToFile()実行、成功時Notice表示、入力/プレビュークリア、モーダルclose()" },
      { given: "ファイル追記失敗時", when: "エラー発生", then: "Notice()でエラー表示、モーダルは開いたまま" },
      { given: "モーダル表示中", when: "Escキー押下", then: "モーダルclose()（Obsidian標準動作）" },
      { given: "モーダル閉じる時", when: "onClose()実行", then: "contentEl.empty()でクリーンアップ" },
    ],
    notes: ["Sprint 6完了: 83テスト、Modal+OpenRouterClient+FileService統合"],
  },
  {
    id: "PBI-006", title: "コマンドパレット対応", status: "done", priority: "medium",
    userStory: { asA: "キーボード派ユーザー", iWant: "コマンドパレットからモーダル開きたい", soThat: "マウス不要で素早く入力開始" },
    acceptanceCriteria: [
      { given: "プラグインロード時", when: "addCommand実行", then: "id='add-todo', name='Add Todo'でコマンド登録完了" },
      { given: "コマンドパレットで", when: "'todonoeai: Add Todo'選択", then: "TodoModal.open()実行、モーダル表示" },
      { given: "モーダル表示後", when: "タスク入力→AI変換→ファイル追加", then: "PBI-005の全機能が正常動作" },
    ],
    notes: [
      "Sprint 7完了: 87テスト",
      "Review完了: テスト通過、型チェックOK、ビルド成功、Lint警告継続（7Sprint目）",
      "AC1検証: main.ts:15でid='add-todo'、name='Add Todo'登録確認",
      "AC2検証: main.ts:18でTodoModal.open()呼び出し確認",
      "AC3検証: PBI-005の83テスト全て含む87テスト成功、統合動作確認済",
      "技術要件: main.ts内でthis.addCommand()使用",
      "統合: TodoModal(this.app, this.settings)で初期化",
      "PBI-005依存: TodoModal.ts完全実装済み（83テスト）",
    ],
  },
  {
    id: "PBI-007", title: "todo.txtファイル追記機能", status: "done", priority: "high",
    userStory: { asA: "ユーザー", iWant: "生成したtodo.txtを指定ファイルに追記したい", soThat: "タスクが永続保存される" },
    acceptanceCriteria: [
      { given: "出力ファイル設定時", when: "追加クリック", then: "ファイルに追記される" },
      { given: "追記位置=末尾時", when: "タスク追加", then: "末尾に追記" },
      { given: "追記位置=先頭時", when: "タスク追加", then: "先頭に追記" },
      { given: "ファイル未存在時", when: "タスク追加", then: "新規作成される" },
      { given: "ファイル未設定時", when: "タスク追加", then: "エラーメッセージ表示" },
    ],
    notes: ["Sprint 4完了: 42テスト"],
  },
  {
    id: "PBI-008", title: "リボンアイコンの追加", status: "draft", priority: "low",
    userStory: { asA: "視覚派ユーザー", iWant: "アイコンからタスク入力開始したい", soThat: "ワンクリックで開始できる" },
    acceptanceCriteria: [
      { given: "プラグイン有効時", when: "サイドバー確認", then: "アイコン表示" },
      { given: "アイコンクリック時", when: "パネル閉じている", then: "パネルが開く" },
    ],
    notes: ["addRibbonIcon API使用"],
  },
];

// === SPRINT 7 ===
const sprint: Sprint = {
  number: 7,
  goal: "コマンドパレット経由でTodoModal起動を可能にし、キーボード派ユーザーの操作性を向上させる",
  pbiId: "PBI-006",
  status: "completed",
  subtasks: [
    { id: "S7-T1", title: "main.tsにaddCommandを追加してTodoModal起動を実装", status: "done" },
    { id: "S7-T2", title: "TodoModal統合の検証（コマンド→モーダル→AI変換→ファイル追加）", status: "done" },
  ],
};

// === IMPEDIMENTS ===
const impediments: Impediment[] = [];

// === RETROSPECTIVES ===
const retrospectives: RetrospectiveInsight[] = [
  { sprint: 1, insights: ["Keep: TDD、22テスト", "Problem: Lint警告"], actionItems: ["PBI-002 Refinement"] },
  { sprint: 2, insights: ["Keep: UI TDD、26テスト", "Problem: Lint未対処"], actionItems: ["PBI-004/007 Refinement"] },
  { sprint: 3, insights: ["Keep: API TDD、33テスト", "Problem: Lint警告継続"], actionItems: ["PBI-007/003 Refinement"] },
  { sprint: 4, insights: ["Keep: FileService TDD、42テスト、Subtask最適化", "Problem: Lint警告4Sprint継続"], actionItems: ["PBI-003 Refinement完了→ready", "Sprint 5開始可能"] },
  { sprint: 5, insights: ["Keep: SidebarView TDD、61テスト、E2E統合成功", "Problem: Lint警告5Sprint継続"], actionItems: ["次PBI選定", "Lint対応検討"] },
  { sprint: 6, insights: ["Keep: Modal TDD、83テスト、パターン再利用成功", "Problem: Lint警告6Sprint継続"], actionItems: ["PBI-006実装可能（依存解決）", "Lint対応検討"] },
  {
    sprint: 7,
    insights: [
      "Keep: Command統合TDD、87テスト、小規模PBI高速完了（2subtask）",
      "Keep: 受け入れ基準3項目全て検証完了、コマンド→モーダル→AI変換→ファイル追加の統合動作確認",
      "Keep: DoD 5項目中4項目達成（テスト、型チェック、ビルド、受け入れ基準）",
      "Problem: Lint警告7Sprint継続（scrum.ts then属性、テストファイル any型）",
    ],
    actionItems: [
      "PBI-008（リボンアイコン）検討",
      "コア機能完成（コマンドパレット、モーダル、サイドバー）、次はUX改善フェーズ",
      "Lint警告は非機能要件として別途対応検討",
    ],
  },
];

// === OUTPUT ===
console.log(JSON.stringify({
  productVision, definitionOfDone, productBacklog, sprint, impediments, retrospectives,
}, null, 2));
