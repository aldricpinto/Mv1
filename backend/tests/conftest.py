from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest
from httpx import AsyncClient

BASE_DIR = Path(__file__).resolve().parents[1]
ROOT = BASE_DIR.parent
sys.path.append(str(ROOT))

os.environ.setdefault("GOOGLE_CLIENT_ID", "test-client-id.apps.googleusercontent.com")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-secret")

from backend.app import create_app
from backend.models.response_models import MoodProfile, Track
from backend.utils.config import Settings


class FakeGeminiClient:
    async def analyze_mood(self, prompt: str) -> MoodProfile:
        return MoodProfile(
            primary_mood="uplifted",
            secondary_mood="reflective",
            keywords=["uplifting", "reflective", prompt[:6]],
            narrative="A gentle progression into brighter energy.",
            recommended_genres=["indie", "electronica"],
        )

    async def curate_playlist(self, mood: MoodProfile, tracks: list[Track]) -> list[Track]:
        return tracks[:5]


class FakeYouTubeMusicService:
    def __init__(self) -> None:
        self.invocations = 0

    async def search_tracks(
        self, keywords: list[str], limit: int = 20, user_credentials: dict | None = None
    ) -> list[Track]:
        self.invocations += 1
        return [
            Track(
                title=f"Song {i}",
                artist="Muse",
                video_id=f"vid{i}",
                duration="3:3{i}",
                thumbnail_url="https://img.youtube.com/vi/dummy/default.jpg",
            )
            for i in range(8)
        ]


@pytest.fixture
def settings() -> Settings:
    return Settings(
        gemini_api_key="test-key",
        google_client_id="test-client-id.apps.googleusercontent.com",
        google_client_secret="test-secret",
    )


@pytest.fixture
async def test_app(settings: Settings):
    app = create_app(settings, bootstrap_clients=False)
    app.state.gemini_client = FakeGeminiClient()
    app.state.youtube_service = FakeYouTubeMusicService()
    yield app


@pytest.fixture
async def client(test_app):
    async with AsyncClient(app=test_app, base_url="http://test") as client:
        yield client
