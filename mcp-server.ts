#!/usr/bin/env npx tsx

import { serve } from './src/mastra/index';

// コマンドライン引数を解析
const args = process.argv.slice(2);
const transportType = args[0] || 'stdio';
const port = parseInt(args[1]) || undefined;

async function main() {
  console.log('🚀 Mastra MCP Server');
  console.log('===================');
  
  switch (transportType) {
    case 'stdio':
      console.log('📡 Starting with stdio transport (for CLI clients)...');
      await serve.stdio();
      break;
      
    case 'http':
    case 'sse':
      const httpPort = port || 3001;
      console.log(`🌐 Starting with SSE transport on port ${httpPort}...`);
      await serve.http(httpPort);
      break;
      
    case 'streamable':
    case 'streamable-http':
      const streamablePort = port || 3002;
      console.log(`⚡ Starting with Streamable HTTP transport on port ${streamablePort}...`);
      await serve.streamableHttp(streamablePort);
      break;
      
    default:
      console.error(`❌ Unknown transport type: ${transportType}`);
      console.log('\nUsage:');
      console.log('  npx tsx mcp-server.ts [transport] [port]');
      console.log('\nTransport types:');
      console.log('  stdio             - Standard input/output (default)');
      console.log('  http|sse          - HTTP with Server-Sent Events (port: 3001)');
      console.log('  streamable        - Streamable HTTP (port: 3002)');
      console.log('\nExamples:');
      console.log('  npx tsx mcp-server.ts stdio');
      console.log('  npx tsx mcp-server.ts http 3001');
      console.log('  npx tsx mcp-server.ts streamable 3002');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
}); 