import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const expectedTools = [
  "build_hotel_lobby_prompt",
  "plan_hotel_lobby_duet",
  "diagnose_hotel_lobby_prompt",
  "get_hotel_lobby_ai_resources",
];
const command = process.env.MCP_SMOKE_COMMAND || "node";
const args = process.env.MCP_SMOKE_ARGS_JSON
  ? JSON.parse(process.env.MCP_SMOKE_ARGS_JSON)
  : ["bin/hotel-lobby-ai-prompt-mcp.js"];
const client = new Client({ name: "hotel-lobby-ai-smoke", version: "1.0.0" });
const transport = new StdioClientTransport({ command, args, cwd: process.cwd() });

try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  const names = tools.map((tool) => tool.name);
  assert.deepEqual([...names].sort(), [...expectedTools].sort());
  const result = await client.callTool({
    name: "get_hotel_lobby_ai_resources",
    arguments: { topic: "create" },
  });
  const first = result.content?.[0];
  assert.equal(first?.type, "text");
  assert.match(first?.type === "text" ? first.text : "", /aihotellobby\.art/);
  console.log(`MCP smoke passed: ${names.join(", ")}`);
} finally {
  await client.close();
}
