import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

let mcpClient = null;

export async function getMcpClient() {
  if (mcpClient) return mcpClient;

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["--no-install", "a11y-mcp-server"]
  });

  mcpClient = new Client({
    name: "qa-agent-client",
    version: "1.0.0"
  }, {
    capabilities: {
      tools: {}
    }
  });

  await mcpClient.connect(transport);
  return mcpClient;
}
