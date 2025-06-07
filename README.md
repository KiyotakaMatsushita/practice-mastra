# My Mastra App

このプロジェクトは、Mastraフレームワークを使用してURLの内容をパースし、分析するワークフローとエージェントを実装しています。

## 🚀 機能

### 1. URLパーサーツール
- 指定されたURLからWebページの内容を取得
- HTMLタグを除去してテキストを抽出
- ページタイトルと主要コンテンツを抽出

### 2. URLパーサーワークフロー
- URLの取得とパース
- コンテンツの分析と要約作成
- 文字数カウント
- 2段階のステップで構成

### 3. URLパーサーエージェント
- URLを提供すると自動的にパースツールを使用
- 日本語で分かりやすい要約を提供
- ページ内容に関する質問に回答
- 会話履歴を記憶

## 📦 インストール

```bash
npm install
```

## 🔧 設定

プロジェクトには以下の環境変数が必要です：

```bash
# .env ファイルを作成
GOOGLE_VERTEX_AI_PROJECT_ID=your_project_id
GOOGLE_VERTEX_AI_LOCATION=your_location
```

## 💻 使用方法

### 開発サーバーの起動

```bash
npm run dev
```

これにより、Mastraサーバーが `http://localhost:4111` で起動します。

### エージェントとワークフローのテスト

```bash
npx tsx src/test-url-parser.ts
```

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
# ワークフローを直接実行
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
│   └── url-parser-workflow.ts # URLパーサーワークフロー
└── index.ts                  # Mastraインスタンス設定
```

## 🔄 ワークフローの詳細

URLパーサーワークフローは2つのステップで構成されています：

1. **fetch-url**: URLからWebページの内容を取得し、HTMLをパース
2. **analyze-content**: 取得したコンテンツを分析し、要約と文字数を計算

### 入力スキーマ
```typescript
{
  url: string // パースするWebページのURL
}
```

### 出力スキーマ
```typescript
{
  title: string,      // ページタイトル
  content: string,    // パースされたテキスト内容
  summary: string,    // 要約（最初の200文字）
  wordCount: number,  // 文字数
  url: string,        // 元のURL
  success: boolean    // パースの成功/失敗
}
```

## 🤖 エージェントの特徴

URLパーサーエージェントは以下の機能を提供します：

- **自動URL認識**: メッセージ内のURLを自動的に検出
- **ツール使用**: URLパーサーツールを自動的に実行
- **日本語対応**: 日本語での要約と説明を提供
- **エラーハンドリング**: URLアクセスエラーの適切な処理
- **メモリ機能**: 過去の会話履歴を記憶

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

## 📝 例

### 基本的な使用例

```typescript
// エージェントを使用
const agent = mastra.getAgent('urlParserAgent');
const response = await agent.generate(
  'https://example.com の内容を要約してください'
);

// ワークフローを使用
const workflow = mastra.getWorkflow('urlParserWorkflow');
const run = workflow.createRun();
const result = await run.start({
  inputData: { url: 'https://example.com' }
});
```

## 🔍 トラブルシューティング

### よくある問題

1. **URLアクセスエラー**: プロキシやファイアウォールの設定を確認
2. **メモリエラー**: 大きなページの場合は文字数制限を調整
3. **文字化け**: 文字エンコーディングの問題の場合はHTTPヘッダーを確認

### デバッグ

ログレベルを `debug` に設定してより詳細な情報を取得：

```typescript
logger: new PinoLogger({
  name: 'Mastra',
  level: 'debug',
}),
```

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します。

## �� ライセンス

MIT License # practice-mastra
