import { createWorkflow, createStep } from '@mastra/core/workflows';
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// 要約エージェントを作成
const summaryAgent = new Agent({
  name: 'URL Content Scraper',
  instructions: `あなたは優秀なコンテンツのスクレイピング専門家です。
与えられたWebページのコンテンツを分析し、以下の要件に従って内容を抽出してください：

1. 概要について、読みやすく構造化された要約を作成する
2. ページ内に出現する単語について、すべてを網羅的に単語リストを作成する
3. 重要な詳細やデータは保持する
4. 日本語で自然な文章で表現する
5. 内容が不完全や理解困難な場合はその旨を明記する`,
  model: openai('gpt-4o-mini'),
  defaultGenerateOptions: {
    maxTokens: 16384,
    temperature: 0
  },
});

// URLを取得してパースするステップ
const fetchUrlStep = createStep({
  id: 'fetch-url',
  description: 'URLからWebページの内容を取得する',
  inputSchema: z.object({
    url: z.string().url().describe('パースするURL'),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    url: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    try {
      console.log(`URLを取得中: ${inputData.url}`);

      // URLからHTMLを取得
      const response = await fetch(inputData.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MastraBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const html = await response.text();

      // 基本的なHTMLパース
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'タイトルなし';

      // HTML タグを除去してテキストを抽出
      let content = html
        // script、styleタグとその中身を削除
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        // HTMLタグを削除
        .replace(/<[^>]*>/g, ' ')
        // HTMLエンティティをデコード
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // 連続する空白文字を単一のスペースに
        .replace(/\s+/g, ' ')
        .trim();

      return {
        title,
        content,
        url: inputData.url,
        success: true,
      };
    } catch (error) {
      console.error(`URLパースエラー: ${error}`);
      return {
        title: 'エラー',
        content: `URLのパースに失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        url: inputData.url,
        success: false,
      };
    }
  },
});

// コンテンツを分析・整理するステップ
const analyzeContentStep = createStep({
  id: 'analyze-content',
  description: 'パースされたコンテンツを分析し、要約を作成する',
  inputSchema: z.object({
    title: z.string(),
    content: z.string(),
    url: z.string(),
    success: z.boolean(),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    summary: z.string(),
    wordCount: z.number(),
    url: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData.success) {
      return {
        ...inputData,
        summary: 'コンテンツの取得に失敗したため、分析できませんでした。',
        wordCount: 0,
      };
    }

    console.log(`コンテンツを分析中: ${inputData.title}`);

    // 単語数を計算（日本語と英語を考慮）
    const wordCount = inputData.content.length;

    // 簡単な要約を作成（最初の200文字）
    const summary = inputData.content.length > 200 
      ? inputData.content.substring(0, 200) + '...' 
      : inputData.content;

    return {
      title: inputData.title,
      content: inputData.content,
      summary,
      wordCount,
      url: inputData.url,
      success: inputData.success,
    };
  },
});

// エージェントを使った高度な要約ステップ
const aiSummaryStep = createStep({
  id: 'ai-summary',
  description: 'AIエージェントを使用してコンテンツの高度な要約を作成する',
  inputSchema: z.object({
    title: z.string(),
    content: z.string(),
    summary: z.string(),
    wordCount: z.number(),
    url: z.string(),
    success: z.boolean(),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    basicSummary: z.string(),
    aiSummary: z.string(),
    keyPoints: z.array(z.string()),
    wordList: z.array(z.object({
      kanji: z.string(),
      reading: z.string(),
      meaning: z.string(),
    })),
    wordCount: z.number(),
    url: z.string(),
    success: z.boolean(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData.success) {
      return {
        ...inputData,
        basicSummary: inputData.summary,
        aiSummary: 'コンテンツの取得に失敗したため、AI要約を作成できませんでした。',
        keyPoints: [],
        wordList: [],
      };
    }

    console.log(`AI要約を作成中: ${inputData.title}`);

    try {
      // エージェントに要約を依頼
      const prompt = `以下のWebページの内容を抽出してください：

タイトル: ${inputData.title}
URL: ${inputData.url}
コンテンツ: ${inputData.content}

以下の形式でJSON形式で返答してください：
{
  "summary": "コンテンツの詳細な要約（3-5文で）",
  "keyPoints": ["重要なポイント1", "重要なポイント2", "重要なポイント3"],
  "wordList": [{"kanji": "漢字表記", "reading": "読み方", "meaning": "単語の意味"}]
}`;

      const response = await summaryAgent.generate([
        { role: 'user', content: prompt }
      ], {
        output: z.object({
          summary: z.string(),
          keyPoints: z.array(z.string()),
          wordList: z.array(z.object({
            kanji: z.string(),
            reading: z.string(),
            meaning: z.string(),
          })),
        }),
      });

      return {
        title: inputData.title,
        content: inputData.content,
        basicSummary: inputData.summary,
        aiSummary: response.object.summary,
        keyPoints: response.object.keyPoints,
        wordList: response.object.wordList,
        wordCount: inputData.wordCount,
        url: inputData.url,
        success: inputData.success,
      };
    } catch (error) {
      console.error(`AI要約エラー: ${error}`);
      return {
        title: inputData.title,
        content: inputData.content,
        basicSummary: inputData.summary,
        aiSummary: `AI要約の作成に失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        keyPoints: [],
        wordList: [],
        wordCount: inputData.wordCount,
        url: inputData.url,
        success: inputData.success,
      };
    }
  },
});

// URLパーサーワークフローを作成
export const urlParserWorkflow = createWorkflow({
  id: 'url-parser-workflow',
  description: 'URLからWebページの内容を取得し、分析・AI要約するワークフロー',
  inputSchema: z.object({
    url: z.string().url().describe('パースするWebページのURL'),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    basicSummary: z.string(),
    aiSummary: z.string(),
    keyPoints: z.array(z.string()),
    wordList: z.array(z.object({
      kanji: z.string(),
      reading: z.string(),
      meaning: z.string(),
    })),
    wordCount: z.number(),
    url: z.string(),
    success: z.boolean(),
  }),
  steps: [fetchUrlStep, analyzeContentStep, aiSummaryStep],
})
  .then(fetchUrlStep)
  .then(analyzeContentStep)
  .then(aiSummaryStep)
  .commit(); 