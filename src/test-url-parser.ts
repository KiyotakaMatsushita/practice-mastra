import { mastra } from './mastra';

async function testUrlParser() {
  try {
    console.log('🔄 URLパーサーエージェントをテスト中...\n');

    // エージェントを取得
    const agent = mastra.getAgent('urlParserAgent');

    // テスト用のURL（例：Wikipedia）
    const testUrl = 'https://ja.wikipedia.org/wiki/人工知能';

    console.log(`📡 URLを解析中: ${testUrl}\n`);

    // エージェントに質問
    const response = await agent.generate(
      `このURLの内容を分析して要約してください: ${testUrl}`,
      {
        resourceId: 'test-user',
        threadId: 'url-parser-test',
      }
    );

    console.log('🤖 エージェントの回答:');
    console.log(response.text);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

async function testWorkflow() {
  try {
    console.log('\n🔄 URLパーサーワークフローをテスト中...\n');

    // ワークフローを取得
    const workflow = mastra.getWorkflow('urlParserWorkflow');

    if (!workflow) {
      console.error('❌ ワークフローが見つかりません');
      return;
    }

    // テスト用のURL
    const testUrl = 'https://docs.mastra.ai';

    console.log(`📡 ワークフローでURLを処理中: ${testUrl}\n`);

    // ワークフローを実行
    const run = workflow.createRun();
    const result = await run.start({
      inputData: { url: testUrl }
    });

    if (result.status === 'success') {
      console.log('✅ ワークフローが正常に完了しました:');
      console.log('タイトル:', result.result.title);
      console.log('成功:', result.result.success);
      console.log('文字数:', result.result.wordCount);
      console.log('要約:', result.result.summary);
    } else if (result.status === 'failed') {
      console.error('❌ ワークフローが失敗しました:', result.error);
    } else {
      console.log('⏸️ ワークフローが中断されました');
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// テストを実行
async function runTests() {
  console.log('🚀 URLパーサーのテストを開始します\n');
  
  await testWorkflow();
  await testUrlParser();
  
  console.log('\n✨ テスト完了');
}

// スクリプトが直接実行された場合のみテストを実行
if (require.main === module) {
  runTests().catch(console.error);
}

export { testUrlParser, testWorkflow }; 