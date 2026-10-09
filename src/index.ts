import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createServer } from "./server.js";

serveStdio(() => createServer(), {
  onerror: (error) => console.error("Hotel Lobby AI Prompt MCP error:", error),
});
