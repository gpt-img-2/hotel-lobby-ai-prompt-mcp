#!/usr/bin/env node

import("../dist/index.js").catch((error) => {
  console.error("Hotel Lobby AI Prompt MCP failed to start:", error);
  process.exit(1);
});
