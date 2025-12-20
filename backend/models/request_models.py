from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator


class MoodRequest(BaseModel):
    prompt: str = Field(..., min_length=3, description="User provided vibe prompt")
    device_id: Optional[str] = Field(None, description="Opaque identifier for caching")

    @field_validator("prompt")
    @classmethod
    def normalize_prompt(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Prompt cannot be empty")
        return cleaned


class PlaylistRequest(MoodRequest):
    user_id: Optional[str] = Field(None, description="Muse auth user id")
    include_history: bool = Field(True, description="Whether to persist the journey in cache")
    preferred_energy_curve: Optional[str] = Field(
        None, description="Optional hint describing how the playlist energy should evolve."
    )
