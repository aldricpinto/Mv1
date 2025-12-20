import type { MuseSession, PlaylistResponse } from "@/types/muse";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "The Plug backend unavailable");
  }
  return res.json() as Promise<T>;
}

export async function requestPlaylist(
  prompt: string,
  deviceId: string,
  preferredEnergyCurve?: string,
  userId?: string
) {
  return handleResponse<PlaylistResponse>(
    await fetch(`${API_BASE}/playlists/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        device_id: deviceId,
        preferred_energy_curve: preferredEnergyCurve,
        user_id: userId,
      }),
    })
  );
}

export async function fetchHistory(deviceId: string) {
  return handleResponse<PlaylistResponse[]>(
    await fetch(`${API_BASE}/playlists/history/${deviceId}`)
  );
}

export async function registerGoogle(idToken: string) {
  return handleResponse<MuseSession>(
    await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    })
  );
}

export async function attachYoutubeAuth(userId: string, code: string) {
  return handleResponse<MuseSession>(
    await fetch(`${API_BASE}/auth/youtube`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, code }),
    })
  );
}

export async function fetchSession(userId: string) {
  return handleResponse<MuseSession>(await fetch(`${API_BASE}/auth/session/${userId}`));
}

export async function getHistory(userId: string) {
  return handleResponse<PlaylistResponse[]>(
    await fetch(`${API_BASE}/playlists/user/history?user_id=${userId}`)
  );
}

export async function clearHistory(userId: string) {
  return handleResponse<{ status: string }>(
    await fetch(`${API_BASE}/playlists/user/history?user_id=${userId}`, {
      method: "DELETE",
    })
  );
}

export async function createPlaylist(userId: string, title: string, videoIds: string[]) {
  return handleResponse<{ playlist_id: string }>(
    await fetch(`${API_BASE}/playlists/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, title, video_ids: videoIds }),
    })
  );
}

export async function deleteHistoryItem(userId: string, index: number) {
  return handleResponse<{ status: string; index: number }>(
    await fetch(`${API_BASE}/playlists/user/history/${index}?user_id=${userId}`, {
      method: "DELETE",
    })
  );
}

export async function streamPlaylist(
  prompt: string,
  deviceId: string,
  onEvent: (type: "narrative" | "status" | "result" | "error", data: any) => void,
  userId?: string
) {
  const response = await fetch(`${API_BASE}/playlists/generate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      device_id: deviceId,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to start stream");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error("ReadableStream not supported");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n\n");

    for (const line of lines) {
      if (line.startsWith("event:")) {
        const [eventLine, dataLine] = line.split("\n");
        const eventType = eventLine.replace("event: ", "").trim();
        const data = dataLine?.replace("data: ", "").trim();

        if (eventType && data) {
          onEvent(eventType as any, data);
        }
      }
    }
  }
}
