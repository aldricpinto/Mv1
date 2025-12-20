from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse
import json
import asyncio

from pydantic import BaseModel
from ..models.request_models import PlaylistRequest
from ..models.response_models import MoodProfile, PlaylistResponse, Track
from ..services.gemini_client import GeminiClient
from ..services.muse_agent import MuseAgent
from ..services.user_store import UserStore
from ..services.youtube_music import YouTubeMusicService
from ..utils.cache import DeviceCache
from .dependencies import RateLimited

router = APIRouter(prefix="/playlists", tags=["playlists"])


@router.post("/generate/stream", dependencies=[RateLimited])
async def generate_playlist_stream(payload: PlaylistRequest, request: Request):
    gemini: GeminiClient = request.app.state.gemini_client
    youtube: YouTubeMusicService = request.app.state.youtube_service
    agent: MuseAgent = request.app.state.muse_agent
    cache: DeviceCache = request.app.state.device_cache
    user_store: UserStore = request.app.state.user_store

    async def event_generator():
        # 1. Stream Narrative & Mood Analysis
        mood = None
        current_narrative = ""
        
        async for chunk in gemini.analyze_mood_stream(payload.prompt):
            if chunk["type"] == "narrative_chunk":
                current_narrative += chunk["text"]
                # SSE Format: event: narrative\ndata: <text>\n\n
                yield f"event: narrative\ndata: {chunk['text']}\n\n"
            elif chunk["type"] == "json_full":
                try:
                    mood = MoodProfile(**chunk["data"])
                    # Fallback: if narrative was empty in stream but present in json
                    if not current_narrative and mood.narrative:
                         yield f"event: narrative\ndata: {mood.narrative}\n\n"
                except Exception as e:
                    yield f"event: error\ndata: Failed to validate mood profile: {str(e)}\n\n"
                    return
        
        if not mood:
            yield f"event: error\ndata: Failed to generate mood profile\n\n"
            return

        # 2. Search Tracks
        yield f"event: status\ndata: Scouring the crate for {mood.primary_mood} tracks...\n\n"
        
        agent.remember_prompt(payload.prompt)
        user_credentials = None
        if payload.user_id:
            user_credentials = await user_store.get_youtube_credentials(payload.user_id)

        tracks = await youtube.search_tracks(mood.keywords, limit=50, user_credentials=user_credentials)
        if not tracks:
            yield f"event: error\ndata: No tracks found on YouTube Music\n\n"
            return
        
        # 3. Curate
        yield f"event: status\ndata: Curating the perfect mix...\n\n"
        curated = await gemini.curate_playlist(mood, tracks)
        curated = curated or tracks[: request.app.state.settings.playlist_max_tracks]

        # 4. Finalize
        yield f"event: status\ndata: Finalizing tape...\n\n"
        transitions = agent.build_transitions(mood, curated)
        segments = agent.build_segments(mood)
        
        history_profiles: list[MoodProfile] = []
        if payload.device_id:
            try:
                history_entries = await cache.history(payload.device_id, key="playlist")
                history_profiles = [entry.value.mood for entry in history_entries if hasattr(entry.value, "mood")]
            except Exception:
                pass # ignore cache errors during stream

        response = PlaylistResponse(
            prompt=payload.prompt,
            mood=mood,
            transitions=transitions,
            segments=segments,
            tracks=curated,
            history=history_profiles,
        )

        if payload.device_id and payload.include_history:
            await cache.remember(payload.device_id, "playlist", response)
        
        if payload.user_id:
            await user_store.add_history(payload.user_id, response.model_dump())

        # Yield final result
        yield f"event: result\ndata: {response.model_dump_json()}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/generate", response_model=PlaylistResponse, dependencies=[RateLimited])
async def generate_playlist(payload: PlaylistRequest, request: Request) -> PlaylistResponse:
    gemini: GeminiClient = request.app.state.gemini_client
    youtube: YouTubeMusicService = request.app.state.youtube_service
    agent: MuseAgent = request.app.state.muse_agent
    cache: DeviceCache = request.app.state.device_cache
    user_store: UserStore = request.app.state.user_store

    mood = await gemini.analyze_mood(payload.prompt)
    agent.remember_prompt(payload.prompt)

    user_credentials = None
    if payload.user_id:
        user_credentials = await user_store.get_youtube_credentials(payload.user_id)

    tracks = await youtube.search_tracks(mood.keywords, limit=50, user_credentials=user_credentials)
    if not tracks:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="No tracks returned from YouTube Music")

    curated = await gemini.curate_playlist(mood, tracks)
    curated = curated or tracks[: request.app.state.settings.playlist_max_tracks]

    transitions = agent.build_transitions(mood, curated)
    segments = agent.build_segments(mood)

    history_profiles: list[MoodProfile] = []
    if payload.device_id:
        history_entries = await cache.history(payload.device_id, key="playlist")
        history_profiles = [entry.value.mood for entry in history_entries if hasattr(entry.value, "mood")]

    response = PlaylistResponse(
        prompt=payload.prompt,
        mood=mood,
        transitions=transitions,
        segments=segments,
        tracks=curated,
        history=history_profiles,
    )

    if payload.device_id and payload.include_history:
        await cache.remember(payload.device_id, "playlist", response)
    
    if payload.user_id:
        await user_store.add_history(payload.user_id, response.model_dump())

    return response


@router.get("/history/{device_id}", response_model=list[PlaylistResponse], dependencies=[RateLimited])
async def playlist_history(device_id: str, request: Request) -> list[PlaylistResponse]:
    # Try user history first if user_id is passed as query param (not ideal but quick fix)
    # Better: Add a separate endpoint or header. For now, we stick to device_id for anonymous
    # and add a new endpoint for user history.
    cache: DeviceCache = request.app.state.device_cache
    entries = await cache.history(device_id, key="playlist")
    return [entry.value for entry in entries if isinstance(entry.value, PlaylistResponse)]


@router.get("/user/history", response_model=list[PlaylistResponse], dependencies=[RateLimited])
async def user_history(user_id: str, request: Request) -> list[PlaylistResponse]:
    user_store: UserStore = request.app.state.user_store
    profile = await user_store.get_profile(user_id)
    if not profile:
        # User might not be in store yet (e.g. after restart). Return empty history.
        return []
    # Convert dicts back to PlaylistResponse
    return [PlaylistResponse(**item) for item in profile.history]


@router.delete("/user/history", dependencies=[RateLimited])
async def clear_user_history(user_id: str, request: Request):
    user_store: UserStore = request.app.state.user_store
    await user_store.clear_history(user_id)
    return {"status": "cleared"}


@router.delete("/user/history/{index}", dependencies=[RateLimited])
async def delete_user_history_item(index: int, user_id: str, request: Request):
    user_store: UserStore = request.app.state.user_store
    await user_store.remove_history_item(user_id, index)
    return {"status": "deleted", "index": index}


class CreatePlaylistRequest(BaseModel):
    user_id: str
    title: str
    video_ids: list[str]


@router.post("/create", dependencies=[RateLimited])
async def create_yt_playlist(payload: CreatePlaylistRequest, request: Request):
    user_store: UserStore = request.app.state.user_store
    youtube: YouTubeMusicService = request.app.state.youtube_service

    creds = await user_store.get_youtube_credentials(payload.user_id)
    if not creds:
        raise HTTPException(status_code=400, detail="User not connected to YouTube Music")

    # Manually refresh token to ensure valid auth
    google_auth = request.app.state.google_auth
    try:
        access_token = google_auth.refresh_access_token(creds)
        auth_headers = {"Authorization": f"Bearer {access_token}"}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Failed to refresh YouTube Music token: {str(e)}")

    playlist_id = await youtube.create_playlist(payload.title, payload.video_ids, auth_headers=auth_headers)
    return {"playlist_id": playlist_id}
