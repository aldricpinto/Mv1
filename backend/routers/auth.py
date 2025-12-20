from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status

from ..models.auth_models import GoogleAuthRequest, GoogleAuthResponse, SessionResponse, YoutubeAuthRequest
from ..services.google_auth import GoogleAuthService, GoogleProfile
from ..services.user_store import UserProfile, UserStore
from .dependencies import RateLimited

router = APIRouter(prefix="/auth", tags=["auth"], dependencies=[RateLimited])


def get_services(request: Request) -> tuple[GoogleAuthService, UserStore]:
    return request.app.state.google_auth, request.app.state.user_store


@router.post("/google", response_model=GoogleAuthResponse)
async def google_sign_in(payload: GoogleAuthRequest, request: Request) -> GoogleAuthResponse:
    google_auth, store = get_services(request)
    profile: GoogleProfile = google_auth.verify_id_token(payload.id_token)
    stored = await store.upsert_profile(
        UserProfile(
            user_id=profile.user_id,
            email=profile.email,
            name=profile.name,
            picture=profile.picture,
        )
    )
    return GoogleAuthResponse(
        user_id=stored.user_id,
        email=stored.email,
        name=stored.name,
        picture=stored.picture,
        joined_date=stored.joined_date,
        created_on=stored.created_on,
        updated_on=stored.updated_on,
        has_youtube_auth=stored.youtube_credentials is not None,
    )


@router.post("/youtube", response_model=SessionResponse)
async def attach_youtube(payload: YoutubeAuthRequest, request: Request) -> SessionResponse:
    google_auth, store = get_services(request)
    profile = await store.get_profile(payload.user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not registered")
    credentials = google_auth.exchange_code(payload.code)
    await store.set_youtube_credentials(payload.user_id, credentials)
    profile = await store.get_profile(payload.user_id)
    return SessionResponse(
        user_id=profile.user_id,
        email=profile.email,
        name=profile.name,
        picture=profile.picture,
        joined_date=profile.joined_date,
        created_on=profile.created_on,
        updated_on=profile.updated_on,
        has_youtube_auth=True,
    )


@router.get("/session/{user_id}", response_model=SessionResponse)
async def session(user_id: str, request: Request) -> SessionResponse:
    _, store = get_services(request)
    profile = await store.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session missing")
    return SessionResponse(
        user_id=profile.user_id,
        email=profile.email,
        name=profile.name,
        picture=profile.picture,
        joined_date=profile.joined_date,
        created_on=profile.created_on,
        updated_on=profile.updated_on,
        has_youtube_auth=profile.youtube_credentials is not None,
    )
