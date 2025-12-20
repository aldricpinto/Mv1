from __future__ import annotations

from fastapi import APIRouter, Request

from ..models.request_models import MoodRequest
from ..models.response_models import MoodProfile
from ..services.gemini_client import GeminiClient
from ..services.muse_agent import MuseAgent
from ..utils.cache import DeviceCache
from .dependencies import RateLimited

router = APIRouter(prefix="/moods", tags=["moods"])


@router.post("/analyze", response_model=MoodProfile, dependencies=[RateLimited])
async def analyze_mood(payload: MoodRequest, request: Request) -> MoodProfile:
    gemini: GeminiClient = request.app.state.gemini_client
    agent: MuseAgent = request.app.state.muse_agent
    cache: DeviceCache = request.app.state.device_cache

    agent.remember_prompt(payload.prompt)
    mood = await gemini.analyze_mood(payload.prompt)

    if payload.device_id:
        await cache.remember(payload.device_id, "mood", mood)

    return mood
