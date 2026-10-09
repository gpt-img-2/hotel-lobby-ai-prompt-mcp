export type HotelLobbyConfig = { appBaseUrl: string };

function parseBaseUrl(value: string | undefined) {
  const candidate = (value || "https://aihotellobby.art")
    .trim()
    .replace(/\/+$/, "");
  const url = new URL(candidate);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("AI Hotel Lobby base URL must use http or https.");
  }
  return url.toString().replace(/\/+$/, "");
}

export function loadConfig(): HotelLobbyConfig {
  return { appBaseUrl: parseBaseUrl(process.env.AI_HOTEL_LOBBY_BASE_URL) };
}
