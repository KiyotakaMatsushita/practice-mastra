
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
