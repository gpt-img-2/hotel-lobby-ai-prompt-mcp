import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { loadConfig } from "./config.js";
import {
  buildHotelLobbyPrompt,
  diagnoseHotelLobbyPrompt,
  getHotelLobbyResources,
  planHotelLobbyDuet,
} from "./toolkit.js";

const annotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};
const instructions = `Hotel Lobby AI Prompt MCP is a deterministic, read-only planning toolkit for original orange-booth duet prompts. Use build_hotel_lobby_prompt to draft, plan_hotel_lobby_duet to sequence beats, diagnose_hotel_lobby_prompt to find structural and rights issues, and get_hotel_lobby_ai_resources for canonical pages. Only use media the user owns or may use. Never reproduce an existing performance, song, people, setting, or sequence of frames. The server does not upload media, generate content, call providers, access accounts, spend credits, or submit payments.`;
const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});

const sourceMode = z.enum(["video", "photo", "text", "motion"]);

export function createServer() {
  const config = loadConfig();
  const server = new McpServer(
    { name: "hotel-lobby-ai-prompt-mcp", version: "1.0.0" },
    { instructions },
  );

  server.registerTool(
    "build_hotel_lobby_prompt",
    {
      title: "Build an original Hotel Lobby-style prompt",
      description:
        "Draft a structured orange-booth performance prompt with stable performer roles, reference boundaries, rights checks, and exclusions.",
      inputSchema: z.object({
        mode: sourceMode,
        subjectKind: z.enum(["people", "pets", "other"]),
        performerCount: z.union([z.literal(1), z.literal(2)]),
        performanceAction: z.string().min(1).max(1000),
        performerDirections: z.array(z.string().min(1).max(500)).max(6).optional(),
        cameraDirection: z.string().max(500).optional(),
        lightingAndStyle: z.string().max(500).optional(),
        audioDirection: z.string().max(500).optional(),
        referenceRoles: z.array(z.string().min(1).max(500)).max(8).optional(),
        exclusions: z.array(z.string().min(1).max(300)).max(12).optional(),
        rightsConfirmed: z.boolean(),
        originalSceneConfirmed: z.boolean(),
      }),
      annotations,
    },
    async (params) => text(buildHotelLobbyPrompt(params)),
  );

  server.registerTool(
    "plan_hotel_lobby_duet",
    {
      title: "Plan a Hotel Lobby-style duet shot sequence",
      description:
        "Turn a short duration into timed left/right performance beats while checking timing, aspect ratio, and visual continuity.",
      inputSchema: z.object({
        durationSeconds: z.number().positive().max(60),
        aspectRatio: z.string().min(3).max(20),
        beats: z
          .array(
            z.object({
              durationSeconds: z.number().positive().max(60),
              leftAction: z.string().min(1).max(500),
              rightAction: z.string().min(1).max(500),
              camera: z.string().max(500).optional(),
              transition: z.string().max(500).optional(),
            }),
          )
          .min(1)
          .max(12),
        continuityAnchors: z.array(z.string().min(1).max(500)).max(12).optional(),
      }),
      annotations,
    },
    async (params) => text(planHotelLobbyDuet(params)),
  );

  server.registerTool(
    "diagnose_hotel_lobby_prompt",
    {
      title: "Diagnose a Hotel Lobby-style prompt",
      description:
        "Audit a prompt for rights blockers, workflow mismatches, performer continuity, microphone, setting, camera, and audio direction.",
      inputSchema: z.object({
        prompt: z.string().max(20_000),
        mode: sourceMode,
        performerCount: z.union([z.literal(1), z.literal(2)]),
        imageReferenceCount: z.number().int().min(0).max(20),
        hasMotionReference: z.boolean(),
        hasAudioReference: z.boolean(),
        audioRequested: z.boolean(),
        durationSeconds: z.number().positive().max(60),
        aspectRatio: z.string().min(3).max(20),
        rightsConfirmed: z.boolean(),
      }),
      annotations,
    },
    async (params) => text(diagnoseHotelLobbyPrompt(params)),
  );

  server.registerTool(
    "get_hotel_lobby_ai_resources",
    {
      title: "Get canonical AI Hotel Lobby resources",
      description:
        "Return canonical creation, example, tutorial, pricing, or policy pages without fetching external content.",
      inputSchema: z.object({
        topic: z
          .enum(["all", "create", "examples", "tutorial", "pricing", "policy"])
          .default("all"),
      }),
      annotations,
    },
    async ({ topic }) =>
      text({
        topic,
        resources: getHotelLobbyResources(config.appBaseUrl, topic),
        rawSkillUrl: `${config.appBaseUrl}/skills/hotel-lobby-ai-prompt-director/SKILL.md`,
      }),
  );

  return server;
}
