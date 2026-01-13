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
    notes: ["Sprint 1完了: TDD実装、22テスト通過"],
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
    notes: ["Sprint 2完了: TDD実装、26テスト通過"],
  },
  {
    id: "PBI-003", title: "サイドバーパネルUIの実装", status: "draft", priority: "high",
    userStory: { asA: "ユーザー", iWant: "サイドバーからタスク入力したい", soThat: "作業中断せずタスク追加できる" },
    acceptanceCriteria: [
      { given: "Obsidian起動時", when: "パネルを開く", then: "タスク入力エリア表示" },
      { given: "自然言語入力時", when: "生成ボタンクリック", then: "AI変換リクエスト送信" },
      { given: "AI変換完了時", when: "プレビュー表示", then: "todo.txt形式で編集可能表示" },
      { given: "プレビュー確認時", when: "追加ボタンクリック", then: "ファイルに追記される" },
    ],
    notes: ["ItemView API使用"],
  },
  {
    id: "PBI-004", title: "OpenRouter API連携", status: "in_sprint", priority: "high",
    userStory: { asA: "ユーザー", iWant: "自然言語をtodo.txt形式に変換したい", soThat: "手動フォーマットの手間省ける" },
    acceptanceCriteria: [
      { given: "APIキー設定時", when: "テキスト送信", then: "todo.txt形式レスポンス返却" },
      { given: "APIエラー時", when: "自動リトライ", then: "最大3回リトライ、失敗時エラー表示" },
      { given: "〇〇の件パターン時", when: "変換実行", then: "+ProjectName形式で付与" },
      { given: "#keyword入力時", when: "変換実行", then: "@keyword形式で付与" },
    ],
    notes: ["仕様書4.3システムプロンプト使用", "Exponential backoff", "タイムアウト30秒/リクエスト"],
  },
  {
    id: "PBI-005", title: "タスク入力モーダルの実装", status: "draft", priority: "medium",
    userStory: { asA: "キーボード派ユーザー", iWant: "モーダルでタスク入力したい", soThat: "素早くタスク追加できる" },
    acceptanceCriteria: [
      { given: "モーダル表示時", when: "入力エリア表示", then: "テキストエリア表示" },
      { given: "タスク入力時", when: "生成/Enter", then: "AI変換実行、プレビュー表示" },
      { given: "プレビュー確認時", when: "追加クリック", then: "ファイル追記、モーダル閉じる" },
      { given: "キャンセル時", when: "キャンセル/Esc", then: "破棄、モーダル閉じる" },
    ],
    notes: ["Modal API使用", "src/ui/TodoModal.ts"],
  },
  {
    id: "PBI-006", title: "コマンドパレット対応", status: "draft", priority: "medium",
    userStory: { asA: "キーボード派ユーザー", iWant: "コマンドパレットからモーダル開きたい", soThat: "マウス不要で素早く入力開始" },
    acceptanceCriteria: [
      { given: "コマンドパレットで", when: "todonoeai: Add Todo選択", then: "モーダルが開く" },
    ],
    notes: ["addCommand API使用", "PBI-005のモーダル呼出"],
  },
  {
    id: "PBI-007", title: "todo.txtファイル追記機能", status: "draft", priority: "high",
    userStory: { asA: "ユーザー", iWant: "生成したtodo.txtを指定ファイルに追記したい", soThat: "タスクが永続保存される" },
    acceptanceCriteria: [
      { given: "出力ファイル設定時", when: "追加クリック", then: "ファイルに追記される" },
      { given: "追記位置=末尾時", when: "タスク追加", then: "末尾に追記" },
      { given: "追記位置=先頭時", when: "タスク追加", then: "先頭に追記" },
      { given: "ファイル未存在時", when: "タスク追加", then: "新規作成される" },
      { given: "ファイル未設定時", when: "タスク追加", then: "エラーメッセージ表示" },
    ],
    notes: ["Vault API使用", "仕様書3.1.2/4.4.2参照"],
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

// === SPRINT ===
const sprint: Sprint = {
  number: 3,
  goal: "OpenRouter APIで自然言語をtodo.txt形式に変換できるようにする",
  pbiId: "PBI-004",
  status: "active",
  subtasks: [
    // Phase 1: OpenRouterClient基本構造
    { id: "ST-004-01", title: "OpenRouterClient型定義（APIリクエスト/レスポンス型）", status: "pending" },
    { id: "ST-004-02", title: "OpenRouterClient fetchラッパー基本実装", status: "pending" },
    { id: "ST-004-03", title: "OpenRouterClient基本テスト（RED）", status: "pending" },
    { id: "ST-004-04", title: "OpenRouterClient基本実装（GREEN）", status: "pending" },
    { id: "ST-004-05", title: "OpenRouterClient基本リファクタリング（REFACTOR）", status: "pending" },
    // Phase 2: リトライロジック
    { id: "ST-004-06", title: "リトライロジックテスト（RED: Exponential backoff、最大3回）", status: "pending" },
    { id: "ST-004-07", title: "リトライロジック実装（GREEN）", status: "pending" },
    { id: "ST-004-08", title: "リトライロジックリファクタリング（REFACTOR）", status: "pending" },
    // Phase 3: システムプロンプトと変換関数
    { id: "ST-004-09", title: "システムプロンプトテスト（RED: todo.txt形式変換）", status: "pending" },
    { id: "ST-004-10", title: "システムプロンプト実装（GREEN）", status: "pending" },
    { id: "ST-004-11", title: "システムプロンプトリファクタリング（REFACTOR）", status: "pending" },
    // Phase 4: パターンマッチング
    { id: "ST-004-12", title: "プロジェクト判定テスト（RED: 〇〇の件 → +ProjectName）", status: "pending" },
    { id: "ST-004-13", title: "プロジェクト判定実装（GREEN）", status: "pending" },
    { id: "ST-004-14", title: "コンテキスト判定テスト（RED: #keyword → @keyword）", status: "pending" },
    { id: "ST-004-15", title: "コンテキスト判定実装（GREEN）", status: "pending" },
    { id: "ST-004-16", title: "パターンマッチングリファクタリング（REFACTOR）", status: "pending" },
  ],
};

// === IMPEDIMENTS ===
const impediments: Impediment[] = [];

// === RETROSPECTIVES ===
const retrospectives: RetrospectiveInsight[] = [
  {
    sprint: 1,
    insights: ["Keep: TDDで型安全な設定基盤構築、22テスト通過", "Problem: scrum.tsのthenプロパティでLint警告"],
    actionItems: ["PBI-002のRefinement実施", "UI TDDアプローチ検討"],
  },
  {
    sprint: 2,
    insights: [
      "Keep: TDDでUI実装、Obsidian APIモック化、26テスト通過",
      "Problem: Lint警告未対処、コンテキストUIは基盤のみ",
    ],
    actionItems: ["Lint警告修正", "PBI-004/007のRefinement", "動的UI TDDパターン確立"],
  },
];

// === OUTPUT ===
console.log(JSON.stringify({
  productVision, definitionOfDone, productBacklog, sprint, impediments, retrospectives,
}, null, 2));
