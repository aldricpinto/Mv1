from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models.response_models import PlaylistResponse
from .routers import auth, moods, playlists
from .services.gemini_client import GeminiClient
from .services.google_auth import GoogleAuthService
from .services.muse_agent import MuseAgent
from .services.user_store import UserStore
from .services.youtube_music import YouTubeMusicService
from .utils.cache import DeviceCache
from .utils.config import Settings, get_settings
from .utils.logger import get_logger
from .utils.rate_limiter import RateLimiter

logger = get_logger()


def create_app(settings: Settings | None = None, *, bootstrap_clients: bool = True) -> FastAPI:
    settings = settings or get_settings()
    app = FastAPI(title=settings.app_name, version=settings.version)

    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_ORIGIN", "").rstrip("/"),
    ]
    allowed_origins = [origin for origin in allowed_origins if origin]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.state.settings = settings
    app.state.rate_limiter = RateLimiter(settings.rate_limit_requests, settings.rate_limit_window)
    app.state.device_cache = DeviceCache(settings.cache_ttl_seconds, settings.cache_max_entries)
    app.state.muse_agent = MuseAgent(settings.agent_memory)
    app.state.google_auth = GoogleAuthService(settings)
    app.state.user_store = UserStore()

    if bootstrap_clients:

        @app.on_event("startup")
        async def startup() -> None:
            logger.info("Starting Muse backend")
            app.state.gemini_client = GeminiClient(settings)
            app.state.youtube_service = YouTubeMusicService(settings)

        @app.on_event("shutdown")
        async def shutdown() -> None:
            logger.info("Shutting down Muse backend")
            if client := getattr(app.state, "gemini_client", None):
                await client.close()

    app.include_router(moods.router)
    app.include_router(playlists.router)
    app.include_router(auth.router)

    @app.get("/health", response_model=dict[str, str])
    async def healthcheck() -> dict[str, str]:
        return {"status": "ok", "version": settings.version}

    return app


app = create_app()
