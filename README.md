# My Mastra App

このプロジェクトは、Mastraフレームワークを使用してURLの内容をパースし、AIエージェントによる高度な要約を提供するワークフローとエージェントを実装しています。

## 🚀 機能

### 1. URLパーサーツール
- 指定されたURLからWebページの内容を取得
- HTMLタグを除去してテキストを抽出
- ページタイトルと主要コンテンツを抽出

### 2. 高度なURLパーサーワークフロー
- URLの取得とパース
- コンテンツの基本分析
- **🆕 AIエージェントによる高度な要約作成**
- **🆕 重要ポイントの自動抽出**
- 文字数カウント
- 3段階のステップで構成

### 3. URLパーサーエージェント
- URLを提供すると自動的にパースツールを使用
- 日本語で分かりやすい要約を提供
- ページ内容に関する質問に回答
- 会話履歴を記憶

### 4. 🆕 AI要約エージェント
- Webページコンテンツの詳細な分析
- 構造化された要約の作成
- 重要ポイントの抽出と整理
- 自然な日本語での表現

### 5. 🔌 MCPサーバー対応
- **Model Context Protocol (MCP)** サーバーとしてツールとエージェントを公開
- CursorやClaude Desktopなどの外部MCPクライアントから利用可能
- 複数の接続方式をサポート：stdio、HTTP SSE、Streamable HTTP
- 自動的にエージェントをツール化（`ask_agentName`）
- ワークフローもツールとして利用可能（`run_workflowName`）

## 📦 インストール

```bash
npm install
```

## 🔧 設定

プロジェクトには以下の環境変数が必要です：

```bash
# .env ファイルを作成
OPENAI_API_KEY=your_openai_api_key
```

## 💻 使用方法

### 開発サーバーの起動

```bash
npm run dev
```

これにより、Mastraサーバーが `http://localhost:4111` で起動します。

### 🔌 MCPサーバーの起動

このプロジェクトはMCPサーバーとしても動作し、CursorやClaude Desktopなどの外部クライアントから利用できます。

#### 利用可能なコマンド

```bash
# 標準入出力モード（CLI/スクリプト用）
npm run mcp:stdio

# HTTP Server-Sent Events モード（ポート3001）
npm run mcp:http

# Streamable HTTP モード（ポート3002、推奨）
npm run mcp:streamable

# 開発用（HTTP、ポート3001）
npm run mcp:dev
```


#### 公開されるツール

MCPサーバーとして起動すると、以下のツールが利用可能になります：

- **weatherTool**: 天気情報の取得
- **urlParserTool**: URLの内容をパース
- **ask_weatherAgent**: 天気エージェントへの質問
- **ask_urlParserAgent**: URLパーサーエージェントへの質問
- **run_urlParserWorkflow**: URLパーサーワークフローの実行


### API経由でのエージェント使用

```bash
# URLパーサーエージェントを使用
curl -X POST http://localhost:4111/api/agents/urlParserAgent/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "https://docs.mastra.ai の内容を分析してください" }
    ]
  }'
```

### ワークフロー単体での使用

```bash
# ワークフローを直接実行（AI要約付き）
curl -X POST http://localhost:4111/api/workflows/urlParserWorkflow/run \
  -H "Content-Type: application/json" \
  -d '{
    "inputData": {
      "url": "https://docs.mastra.ai"
    }
  }'
```

## 📁 プロジェクト構造

```
src/mastra/
├── agents/
│   ├── weather-agent.ts      # 既存の天気エージェント
│   └── url-parser-agent.ts   # URLパーサーエージェント
├── tools/
│   ├── weather-tool.ts       # 既存の天気ツール
│   └── url-parser.ts         # URLパーサーツール
├── workflows/
│   └── url-parser-workflow.ts # 🆕 AI要約付きURLパーサーワークフロー
└── index.ts                  # Mastraインスタンス設定
```

## 🔄 ワークフローの詳細

URLパーサーワークフローは**3つのステップ**で構成されています：

1. **fetch-url**: URLからWebページの内容を取得し、HTMLをパース
2. **analyze-content**: 取得したコンテンツを分析し、基本的な要約と文字数を計算
3. **🆕 ai-summary**: AIエージェントを使用して高度な要約と重要ポイントを抽出

### 入力スキーマ
```typescript
{
  url: string // パースするWebページのURL
}
```

### 🆕 更新された出力スキーマ
```typescript
{
  title: string,         // ページタイトル
  content: string,       // パースされたテキスト内容
  basicSummary: string,  // 基本的な要約（最初の200文字）
  aiSummary: string,     // 🆕 AIエージェントによる詳細要約
  keyPoints: string[],   // 🆕 重要ポイントの配列
  wordCount: number,     // 文字数
  url: string,          // 元のURL
  success: boolean      // パースの成功/失敗
}
```

## 🤖 エージェントの特徴

### URLパーサーエージェント
- **自動URL認識**: メッセージ内のURLを自動的に検出
- **ツール使用**: URLパーサーツールを自動的に実行
- **日本語対応**: 日本語での要約と説明を提供
- **エラーハンドリング**: URLアクセスエラーの適切な処理
- **メモリ機能**: 過去の会話履歴を記憶

### 🆕 AI要約エージェント
- **高度な要約**: GPT-4o-miniを使用した詳細なコンテンツ分析
- **構造化出力**: 要約と重要ポイントを分離
- **日本語最適化**: 自然で読みやすい日本語での出力
- **エラー回復**: AI処理失敗時の適切なフォールバック

## 🛠️ カスタマイズ

### 新しいパース機能の追加

`src/mastra/tools/url-parser.ts` を編集して、以下のような機能を追加できます：

- より高度なHTMLパース（Beautiful Soup的な機能）
- 画像やリンクの抽出
- メタデータの取得
- PDFファイルの対応

### ワークフローの拡張

`src/mastra/workflows/url-parser-workflow.ts` に新しいステップを追加できます：

- 翻訳ステップ
- 感情分析ステップ
- キーワード抽出ステップ
- 関連URL検索ステップ
- **🆕 カテゴリ分類ステップ**
- **🆕 リーダビリティ分析ステップ**

### AI要約の調整

要約エージェントの指示を変更して、以下のようにカスタマイズできます：

- 要約の長さ調整
- 専門分野に特化した要約
- 特定のフォーマットでの出力
- 多言語対応

## 📝 例

### 基本的な使用例

```typescript
// エージェントを使用
const agent = mastra.getAgent('urlParserAgent');
const response = await agent.generate(
  'https://example.com の内容を要約してください'
);

// ワークフローを使用（AI要約付き）
const workflow = mastra.getWorkflow('urlParserWorkflow');
const run = workflow.createRun();
const result = await run.start({
  inputData: { url: 'https://example.com' }
});

// 🆕 結果の活用
console.log('AI要約:', result.aiSummary);
console.log('重要ポイント:', result.keyPoints);
```

### 🆕 AI要約結果の例

```json
{
  "title": "Mastra Documentation",
  "basicSummary": "Mastraは現代的なAIアプリケーション...",
  "aiSummary": "Mastraは、エージェント、ワークフロー、ツールを統合したAI開発フレームワークです。開発者が複雑なAIアプリケーションを効率的に構築できるよう設計されており、メモリ管理、音声機能、外部API統合などの機能を提供します。",
  "keyPoints": [
    "統合型AI開発フレームワーク",
    "エージェント、ワークフロー、ツールの組み合わせ",
    "メモリ管理と会話履歴の保持",
    "多様な外部API統合サポート",
    "音声機能（STT/TTS）の内蔵"
  ]
}
```

## 🔍 トラブルシューティング

### よくある問題

1. **URLアクセスエラー**: プロキシやファイアウォールの設定を確認
2. **メモリエラー**: 大きなページの場合は文字数制限を調整
3. **文字化け**: 文字エンコーディングの問題の場合はHTTPヘッダーを確認
4. **🆕 OpenAI APIエラー**: API키 設定とクォータ制限を確認
5. **🆕 AI要約失敗**: ネットワーク接続とAPI利用状況を確認

### デバッグ

ログレベルを `debug` に設定してより詳細な情報を取得：

```typescript
logger: new PinoLogger({
  name: 'Mastra',
  level: 'debug',
}),
```

## 🆕 新機能の利点

### AI要約機能
- **精度向上**: 単純な文字数制限ではなく、意味のある要約
- **構造化**: 要約と重要ポイントの分離により情報整理が容易
- **一貫性**: AIによる一貫した要約品質
- **拡張性**: プロンプト調整により様々な要約スタイルに対応

### 開発効率
- **再利用可能**: 要約エージェントは他のワークフローでも使用可能
- **モジュール設計**: 各ステップが独立しており、個別テストが可能
- **エラー処理**: 各段階での適切なエラーハンドリング

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します。特に以下の分野での貢献をお待ちしています：

- 新しいパース機能の実装
- AI要約の品質向上
- 多言語対応の拡張
- パフォーマンスの最適化

## 📄 ライセンス

MIT License
