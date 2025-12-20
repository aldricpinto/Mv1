from __future__ import annotations

import asyncio
from typing import List

try:  # pragma: no cover
    from ytmusicapi import YTMusic  # type: ignore
except ImportError:  # pragma: no cover
    YTMusic = None  # type: ignore

from ..models.response_models import Track
from ..utils.config import Settings
from ..utils.logger import get_logger

logger = get_logger()


class YouTubeMusicService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._default_client = self._build_client(settings.youtube_oauth_json, None)

    def _build_client(self, auth_headers: str | dict | None, oauth_credentials: dict | None):
        if YTMusic is None:
            raise RuntimeError(
                "ytmusicapi is required for YouTube Music integration. Install it via `pip install ytmusicapi`."
            )
        if oauth_credentials:
            return YTMusic(oauth_credentials=oauth_credentials)
        if isinstance(auth_headers, dict):
            return YTMusic(auth=auth_headers)
        if auth_headers:
            return YTMusic(auth=auth_headers)
        return YTMusic()

    def _client_for(self, credentials: dict | None):
        if credentials:
            return self._build_client(None, credentials)
        return self._default_client

    async def search_tracks(
        self, keywords: List[str], limit: int = 20, user_credentials: dict | None = None
    ) -> List[Track]:
        query = " ".join(keywords) or "mood radio"
        logger.info("Searching Youtube Music: %s", query)

        def _search() -> List[Track]:
            client = self._client_for(user_credentials)
            results = client.search(query, filter="songs", limit=limit)
            tracks: List[Track] = []
            for item in results:
                video_id = item.get("videoId")
                artists = item.get("artists") or []
                artist_name = ", ".join(artist.get("name", "") for artist in artists if artist.get("name"))
                track = Track(
                    title=item.get("title", "Unknown"),
                    artist=artist_name or item.get("author", "Unknown"),
                    video_id=video_id,
                    duration=item.get("duration"),
                    thumbnail_url=(item.get("thumbnails") or [{}])[0].get("url"),
                )
                tracks.append(track)
            return tracks

        return await asyncio.to_thread(_search)

    async def refresh_auth(self) -> None:
        logger.info("Refreshing YouTube Music headers")
        self._default_client = self._build_client(self.settings.youtube_oauth_json, None)

    async def create_playlist(
        self, title: str, video_ids: List[str], auth_headers: dict | None = None
    ) -> str:
        logger.info("Creating playlist '%s' with %d tracks via Official API", title, len(video_ids))

        if not auth_headers or "Authorization" not in auth_headers:
            raise RuntimeError("Missing Authorization header for official API call")

        import httpx
        
        async with httpx.AsyncClient() as client:
            # 1. Create Playlist
            playlist_resp = await client.post(
                "https://www.googleapis.com/youtube/v3/playlists",
                params={"part": "snippet,status"},
                headers=auth_headers,
                json={
                    "snippet": {
                        "title": title,
                        "description": "Created by The Plug AI",
                    },
                    "status": {"privacyStatus": "private"},
                },
            )
            
            if playlist_resp.status_code != 200:
                logger.error("Failed to create playlist: %s", playlist_resp.text)
                raise RuntimeError(f"YouTube API Error: {playlist_resp.text}")
                
            playlist_data = playlist_resp.json()
            playlist_id = playlist_data["id"]
            logger.info("Created playlist ID: %s", playlist_id)

            # 2. Add Items (sequentially to avoid rate limits/ordering issues)
            for video_id in video_ids:
                try:
                    item_resp = await client.post(
                        "https://www.googleapis.com/youtube/v3/playlistItems",
                        params={"part": "snippet"},
                        headers=auth_headers,
                        json={
                            "snippet": {
                                "playlistId": playlist_id,
                                "resourceId": {
                                    "kind": "youtube#video",
                                    "videoId": video_id,
                                },
                            }
                        },
                    )
                    if item_resp.status_code != 200:
                        logger.warning("Failed to add video %s: %s", video_id, item_resp.text)
                except Exception as e:
                    logger.error("Error adding video %s: %s", video_id, e)

            return playlist_id
