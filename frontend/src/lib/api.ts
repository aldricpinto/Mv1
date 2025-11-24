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
