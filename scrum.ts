/**
 * AI-Agentic Scrum Dashboard - Single Source of Truth
 *
 * This file is the central artifact for all Scrum activities.
 * All agents read from and write to this file.
 *
 * Run: deno run scrum.ts | jq '.'
 */

// ============================================================================
// PRODUCT VISION
// ============================================================================

const productVision = {
  name: "todonoeai",
  tagline: "todo + の + AI = todoのAI",
  goal: "ユーザーが自然言語でタスクを入力すると、生成AIがtodo.txt形式に変換し、指定されたファイルに追記するObsidianプラグイン",
  targetUsers: ["Obsidianユーザー", "タスク管理を効率化したい人"],
  successMetrics: [
    "自然言語入力からtodo.txt形式への正確な変換",
    "OpenRouter経由でのAI連携の安定動作",
    "直感的なサイドバーUIでのタスク入力体験",
  ],
} as const;

// ============================================================================
// DEFINITION OF DONE
// ============================================================================

const definitionOfDone = {
  description: "全てのPBIが満たすべき完了基準",
  criteria: [
    "全てのテストが通過している",
    "型チェックがエラーなし",
    "Lintがエラーなし",
    "ビルドが成功する",
    "受け入れ基準を全て満たしている",
  ],
  verificationCommands: [
    "pnpm test:run",
    "pnpm typecheck",
    "pnpm lint",
    "pnpm build",
  ],
} as const;

// ============================================================================
// PRODUCT BACKLOG
// ============================================================================

type PBIStatus = "draft" | "ready" | "in_sprint" | "done" | "cancelled";
type Priority = "critical" | "high" | "medium" | "low";

interface AcceptanceCriterion {
  given: string;
  when: string;
  then: string;
}

interface ProductBacklogItem {
  id: string;
  title: string;
  userStory: {
    asA: string;
    iWant: string;
    soThat: string;
  };
  acceptanceCriteria: AcceptanceCriterion[];
  status: PBIStatus;
  priority: Priority;
  notes?: string[];
}

const productBacklog: ProductBacklogItem[] = [
  // ---- PBI-001: 型定義・設定基盤 ----
  {
    id: "PBI-001",
    title: "型定義・設定基盤の構築",
    userStory: {
      asA: "開発者",
      iWant: "型安全なプラグイン設定と基本型定義を持つ",
      soThat: "一貫性のある開発を行える",
    },
    acceptanceCriteria: [
      {
        given: "プラグインがロードされた時",
        when: "設定ファイルを読み込む",
        then: "デフォルト設定が型安全に初期化される",
      },
      {
        given: "設定画面を開いた時",
        when: "各設定項目を変更する",
        then: "変更が保存され、再起動後も維持される",
      },
      {
        given: "OpenRouter設定として",
        when: "APIキー、Base URL、モデル名を設定する",
        then: "それぞれが適切に保存される",
      },
    ],
    status: "draft",
    priority: "critical",
    notes: [
      "OpenRouterのみ対応（初期スコープ）",
      "src/types/index.ts に型定義を集約",
      "src/settings.ts に設定管理を実装",
    ],
  },

  // ---- PBI-002: 設定画面UI ----
  {
    id: "PBI-002",
    title: "設定画面UIの実装",
    userStory: {
      asA: "プラグインユーザー",
      iWant: "Obsidianの設定画面でAI設定を行いたい",
      soThat: "APIキーやモデルを簡単に設定できる",
    },
    acceptanceCriteria: [
      {
        given: "設定画面を開いた時",
        when: "OpenRouter設定セクションを表示する",
        then: "APIキー（パスワード形式）、モデル選択、Base URL入力欄が表示される",
      },
      {
        given: "出力設定セクションで",
        when: "出力ファイルパスを設定する",
        then: "todo.txtの出力先が設定できる",
      },
      {
        given: "設定を変更した時",
        when: "設定画面を閉じる",
        then: "変更が自動保存される",
      },
    ],
    status: "draft",
    priority: "critical",
    notes: ["ObsidianのPluginSettingTab APIを使用"],
  },

  // ---- PBI-003: サイドバーパネルUI ----
  {
    id: "PBI-003",
    title: "サイドバーパネルUIの実装",
    userStory: {
      asA: "タスク入力したいユーザー",
      iWant: "サイドバーに常駐するパネルからタスクを入力したい",
      soThat: "作業を中断せずにタスクを追加できる",
    },
    acceptanceCriteria: [
      {
        given: "Obsidianを起動した時",
        when: "サイドバーにtodonoeaiパネルを開く",
        then: "タスク入力エリアが表示される",
      },
      {
        given: "入力エリアに自然言語でタスクを入力した時",
        when: "生成ボタンをクリックする",
        then: "AI変換リクエストが送信される",
      },
      {
        given: "AI変換が完了した時",
        when: "プレビューエリアに結果が表示される",
        then: "todo.txt形式のテキストが編集可能な状態で表示される",
      },
      {
        given: "プレビューを確認した時",
        when: "追加ボタンをクリックする",
        then: "指定ファイルにtodo.txtが追記される",
      },
    ],
    status: "draft",
    priority: "high",
    notes: ["ItemView APIを使用", "仕様書2.4参照"],
  },

  // ---- PBI-004: OpenRouter連携 ----
  {
    id: "PBI-004",
    title: "OpenRouter API連携",
    userStory: {
      asA: "タスク入力したいユーザー",
      iWant: "自然言語入力をtodo.txt形式に変換したい",
      soThat: "手動でフォーマットする手間を省ける",
    },
    acceptanceCriteria: [
      {
        given: "APIキーが設定されている時",
        when: "自然言語テキストを送信する",
        then: "todo.txt形式のレスポンスが返される",
      },
      {
        given: "APIエラーが発生した時",
        when: "自動リトライが実行される",
        then: "最大3回までリトライし、失敗時はエラーメッセージを表示する",
      },
      {
        given: "プロジェクト判定パターン（〇〇の件）がある時",
        when: "変換を実行する",
        then: "+ProjectName形式でプロジェクトが付与される",
      },
      {
        given: "#keywordが入力にある時",
        when: "変換を実行する",
        then: "@keyword形式でコンテキストが付与される",
      },
    ],
    status: "draft",
    priority: "high",
    notes: [
      "仕様書4.3のシステムプロンプトを使用",
      "Exponential backoffでリトライ",
    ],
  },

  // ---- PBI-005: コマンドパレット対応 ----
  {
    id: "PBI-005",
    title: "コマンドパレットからのタスク追加",
    userStory: {
      asA: "キーボード操作を好むユーザー",
      iWant: "コマンドパレットからモーダルを開いてタスクを追加したい",
      soThat: "マウスを使わずに素早くタスクを入力できる",
    },
    acceptanceCriteria: [
      {
        given: "コマンドパレットを開いた時",
        when: "todonoeai: Add Todoを選択する",
        then: "タスク入力モーダルが開く",
      },
      {
        given: "モーダルでタスクを入力した時",
        when: "Enterキーまたは送信ボタンを押す",
        then: "AI変換が実行されプレビューが表示される",
      },
    ],
    status: "draft",
    priority: "medium",
    notes: ["Modal APIを使用"],
  },

  // ---- PBI-006: リボンアイコン ----
  {
    id: "PBI-006",
    title: "リボンアイコンの追加",
    userStory: {
      asA: "視覚的な操作を好むユーザー",
      iWant: "左サイドバーのアイコンからタスク入力を開始したい",
      soThat: "ワンクリックでタスク追加を始められる",
    },
    acceptanceCriteria: [
      {
        given: "プラグインが有効な時",
        when: "左サイドバーを見る",
        then: "todonoeaiのアイコンが表示されている",
      },
      {
        given: "アイコンをクリックした時",
        when: "サイドバーパネルが閉じている",
        then: "サイドバーパネルが開く",
      },
    ],
    status: "draft",
    priority: "low",
    notes: ["addRibbonIcon APIを使用"],
  },
];

// ============================================================================
// SPRINT
// ============================================================================

type SubtaskStatus = "pending" | "red" | "green" | "refactor" | "done";

interface Subtask {
  id: string;
  title: string;
  status: SubtaskStatus;
  testFile?: string;
  implementationFile?: string;
}

interface Sprint {
  number: number;
  goal: string;
  pbiId: string | null;
  status: "planning" | "active" | "review" | "completed";
  subtasks: Subtask[];
}

const sprint: Sprint = {
  number: 0,
  goal: "スプリント未開始",
  pbiId: null,
  status: "planning",
  subtasks: [],
};

// ============================================================================
// IMPEDIMENTS
// ============================================================================

interface Impediment {
  id: string;
  description: string;
  status: "open" | "resolved";
  resolution?: string;
}

const impediments: Impediment[] = [];

// ============================================================================
// RETROSPECTIVE INSIGHTS
// ============================================================================

interface RetrospectiveInsight {
  sprint: number;
  insights: string[];
  actionItems: string[];
}

const retrospectives: RetrospectiveInsight[] = [];

// ============================================================================
// DASHBOARD OUTPUT
// ============================================================================

const dashboard = {
  productVision,
  definitionOfDone,
  productBacklog,
  sprint,
  impediments,
  retrospectives,
};

console.log(JSON.stringify(dashboard, null, 2));
