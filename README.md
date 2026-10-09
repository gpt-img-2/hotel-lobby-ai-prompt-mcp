# Hotel Lobby AI Prompt MCP

Deterministic, read-only MCP tools and an OpenClaw Skill for drafting original orange-booth duet prompts, planning short shot sequences, diagnosing prompt issues, and discovering canonical AI Hotel Lobby resources.

This project does not upload media, generate content, call an AI provider, access accounts, spend credits, or submit payments. Use only media and audio you own or have permission to use. It is an independent project and is not affiliated with or endorsed by COLORS, Quavo, Migos, or Takeoff.

## Install

```bash
npx -y github:gpt-img-2/hotel-lobby-ai-prompt-mcp
```

## Tools

- `build_hotel_lobby_prompt`
- `plan_hotel_lobby_duet`
- `diagnose_hotel_lobby_prompt`
- `get_hotel_lobby_ai_resources`

## OpenClaw

```bash
openclaw mcp add hotel-lobby-ai \
  --command npx \
  --arg -y \
  --arg github:gpt-img-2/hotel-lobby-ai-prompt-mcp
```

The Skill source is in [`openclaw/hotel-lobby-ai-prompt-director`](openclaw/hotel-lobby-ai-prompt-director/SKILL.md).

## Development

```bash
pnpm install
pnpm validate
```

Canonical product resources: [aihotellobby.art/llms.txt](https://aihotellobby.art/llms.txt)
