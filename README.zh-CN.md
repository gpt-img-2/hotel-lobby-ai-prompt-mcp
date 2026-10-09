# Hotel Lobby AI Prompt MCP

一组确定性、只读的 MCP 工具和 OpenClaw Skill，用于编写原创橙色表演棚双人视频提示词、规划短视频分镜、诊断提示词问题，以及发现 AI Hotel Lobby 的官方资源。

本项目不会上传媒体、生成内容、调用 AI 供应商、访问账户、消耗积分或提交付款。只能使用你拥有或已获授权的图片、视频和音频。本项目为独立项目，与 COLORS、Quavo、Migos 或 Takeoff 不存在隶属或背书关系。

## 安装

```bash
npx -y github:gpt-img-2/hotel-lobby-ai-prompt-mcp
```

## 工具

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

Skill 源文件位于 [`openclaw/hotel-lobby-ai-prompt-director`](openclaw/hotel-lobby-ai-prompt-director/SKILL.md)。

## 开发

```bash
pnpm install
pnpm validate
```

产品官方资源：[aihotellobby.art/llms.txt](https://aihotellobby.art/llms.txt)
