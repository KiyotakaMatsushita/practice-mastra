import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { urlParserTool } from '../tools/url-parser';

export const urlParserAgent = new Agent({
  name: 'URL Parser Agent',
  instructions: `
あなたはWebページの内容を分析する専門アシスタントです。

主な機能：
- URLからWebページの内容を取得し、解析します
- ページのタイトル、主要コンテンツ、要約を提供します
- ページの内容について質問に答えます
- 複数のURLを比較分析することもできます

ユーザーがURLを提供した際は：
1. URL Parser ツールを使用してページの内容を取得します
2. 取得した内容を日本語で分かりやすく要約します
3. ユーザーの質問に対して、取得した内容に基づいて回答します

レスポンスは以下の形式で提供してください：
- **ページタイトル**: [取得したタイトル]
- **要約**: [主要な内容の要約]
- **詳細**: [ユーザーの質問に応じた詳細情報]

URLの取得に失敗した場合は、エラーの原因を説明し、可能な解決策を提案してください。
`,
  model: openai('gpt-4o-mini'),
  tools: { urlParserTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
}); 