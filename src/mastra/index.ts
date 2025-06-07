
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { MCPServer } from '@mastra/mcp';

import { weatherAgent } from './agents/weather-agent';
import { urlParserAgent } from './agents/url-parser-agent';
import { urlParserWorkflow } from './workflows/url-parser-workflow';
import { weatherTool } from './tools/weather-tool';
import { urlParserTool } from './tools/url-parser';

export const mastra = new Mastra({
  agents: { 
    weatherAgent,
    urlParserAgent,
  },
  workflows: {
    urlParserWorkflow,
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});

// MCPサーバーを作成
const mcpServer = new MCPServer({
  name: 'My Mastra App MCP Server',
  version: '1.0.0',
  description: 'Weather and URL parsing tools with AI agents and workflows',
  tools: {
    weatherTool,
    urlParserTool,
  },
  agents: {
    weatherAgent,
    urlParserAgent,
  },
  workflows: {
    urlParserWorkflow,
  },
});

export const serve = {
  // Stdio接続用（CLI/スクリプトから実行）
  stdio: async () => {
    console.log('Starting MCP Server with stdio transport...');
    await mcpServer.startStdio();
  },
  
  // HTTP SSE接続用（Webサーバーから実行）
  http: async (port: number = 3001) => {
    const http = await import('http');
    
    const server = http.createServer(async (req, res) => {
      // CORS設定
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      try {
        await mcpServer.startSSE({
          url: new URL(req.url || '', `http://localhost:${port}`),
          ssePath: '/mcp',
          messagePath: '/message',
          req,
          res,
        });
      } catch (error) {
        console.error('Error handling request:', error);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      }
    });

    server.listen(port, () => {
      console.log(`MCP Server running on http://localhost:${port}/mcp`);
      console.log('Available endpoints:');
      console.log(`  - SSE: http://localhost:${port}/mcp`);
      console.log(`  - Message: http://localhost:${port}/message`);
    });

    // プロセス終了時にサーバーを閉じる
    process.on('SIGINT', () => {
      console.log('\nShutting down MCP Server...');
      server.close(() => {
        process.exit(0);
      });
    });
  },

  // Streamable HTTP接続用（最新のHTTP transport）
  streamableHttp: async (port: number = 3002) => {
    const http = await import('http');
    
    const server = http.createServer(async (req, res) => {
      // CORS設定
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      try {
        await mcpServer.startHTTP({
          url: new URL(req.url || '', `http://localhost:${port}`),
          httpPath: '/mcp',
          req,
          res,
        });
      } catch (error) {
        console.error('Error handling request:', error);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      }
    });

    server.listen(port, () => {
      console.log(`MCP Server running on http://localhost:${port}/mcp`);
      console.log('Available endpoints:');
      console.log(`  - HTTP: http://localhost:${port}/mcp`);
      console.log(`  - Message: http://localhost:${port}/message`);
    });

    // プロセス終了時にサーバーを閉じる
    process.on('SIGINT', () => {
      console.log('\nShutting down MCP Server...');
      server.close(() => {
        process.exit(0);
      });
    });
  }
}