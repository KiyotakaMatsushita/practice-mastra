import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const urlParserTool = createTool({
  id: 'url-parser',
  description: 'URLからWebページの内容を取得し、テキストとして抽出します',
  inputSchema: z.object({
    url: z.string().url().describe('パースするWebページのURL'),
  }),
  outputSchema: z.object({
    title: z.string().describe('ページのタイトル'),
    content: z.string().describe('ページの主要コンテンツ'),
    url: z.string().describe('元のURL'),
    success: z.boolean().describe('パースが成功したかどうか'),
  }),
  execute: async ({ context: { url } }) => {
    try {
      console.log(`URLをパースしています: ${url}`);

      // URLからHTMLを取得
      const response = await fetch(url, {
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

      // 最初の3000文字に制限
      if (content.length > 3000) {
        content = content.substring(0, 3000) + '...';
      }

      return {
        title,
        content,
        url,
        success: true,
      };
    } catch (error) {
      console.error(`URLパースエラー: ${error}`);
      return {
        title: 'エラー',
        content: `URLのパースに失敗しました: ${error instanceof Error ? error.message : String(error)}`,
        url,
        success: false,
      };
    }
  },
}); 