import { MCPServer } from "@mastra/mcp";
import { weatherTool } from "./src/mastra/tools/weather-tool"; // 独自ツールをインポート

const server = new MCPServer({
  name: "my-mcp-server",
  version: "1.0.0",
  tools: {
    weatherTool,
  },
});

server.startStdio().catch((error) => {
  console.error("Error running MCP server:", error);
  process.exit(1);
});