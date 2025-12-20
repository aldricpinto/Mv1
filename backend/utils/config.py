from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache

from pathlib import Path

from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


@dataclass(slots=True)
class Settings:
    """Application configuration loaded from environment variables."""

    app_name: str = os.getenv("MUSE_APP_NAME", "Muse AI DJ")
    version: str = os.getenv("MUSE_APP_VERSION", "0.1.0")

    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    gemini_base_url: str = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")

    youtube_oauth_json: str | None = os.getenv("YTMUSIC_OAUTH_JSON")
    google_client_id: str | None = os.getenv("GOOGLE_CLIENT_ID")
    google_client_secret: str | None = os.getenv("GOOGLE_CLIENT_SECRET")
    google_redirect_uri: str = os.getenv("GOOGLE_REDIRECT_URI", "postmessage")
    google_scopes: tuple[str, ...] = tuple(
        os.getenv(
            "GOOGLE_SCOPES",
            "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube",
        ).split()
    )

    http_timeout: float = float(os.getenv("HTTP_TIMEOUT_SECONDS", "30"))
    playlist_min_tracks: int = int(os.getenv("PLAYLIST_MIN_TRACKS", "8"))
    playlist_max_tracks: int = int(os.getenv("PLAYLIST_MAX_TRACKS", "15"))

    rate_limit_requests: int = int(os.getenv("RATE_LIMIT_REQUESTS", "20"))
    rate_limit_window: int = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))

    cache_ttl_seconds: int = int(os.getenv("CACHE_TTL_SECONDS", "1800"))
    cache_max_entries: int = int(os.getenv("CACHE_MAX_ENTRIES", "20"))

    agent_memory: int = int(os.getenv("AGENT_MEMORY", "10"))


@lru_cache(1)
def get_settings() -> Settings:
    return Settings()
