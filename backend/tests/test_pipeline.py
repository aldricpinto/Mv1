from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_playlist_pipeline(client):
    response = await client.post(
        "/playlists/generate",
        json={"prompt": "Need a chill focus sesh", "device_id": "device-1"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["mood"]["primary_mood"] == "uplifted"
    assert len(data["tracks"]) == 5
    assert data["transitions"]


@pytest.mark.asyncio
async def test_playlist_history(client):
    await client.post("/playlists/generate", json={"prompt": "first", "device_id": "device-2"})
    await client.post("/playlists/generate", json={"prompt": "second", "device_id": "device-2"})

    resp = await client.get("/playlists/history/device-2")
    assert resp.status_code == 200
    payload = resp.json()
    assert len(payload) == 2


@pytest.mark.asyncio
async def test_empty_youtube_response_returns_error(client, test_app):
    class EmptyYT:
        async def search_tracks(self, keywords, limit=20, user_credentials=None):
            return []

    test_app.state.youtube_service = EmptyYT()
    resp = await client.post("/playlists/generate", json={"prompt": "test", "device_id": "x"})
    assert resp.status_code == 502
