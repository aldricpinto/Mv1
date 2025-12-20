from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class GoogleAuthRequest(BaseModel):
    id_token: str = Field(..., description="Google Identity Services ID token")


class GoogleAuthResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str]
    joined_date: datetime
    created_on: datetime
    updated_on: datetime
    has_youtube_auth: bool = False


class YoutubeAuthRequest(BaseModel):
    user_id: str = Field(..., description="Muse user identifier")
    code: str = Field(..., description="Authorization code for YouTube scopes")


class SessionResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str]
    joined_date: datetime
    created_on: datetime
    updated_on: datetime
    has_youtube_auth: bool = False
