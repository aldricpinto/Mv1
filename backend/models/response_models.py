from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class MoodProfile(BaseModel):
    primary_mood: str = Field(..., description="Dominant mood label")
    secondary_mood: Optional[str] = Field(None, description="Supporting mood label")
    playlist_title: Optional[str] = Field(None, description="Creative, unique title for the playlist")
    keywords: List[str] = Field(default_factory=list)
    narrative: str = Field(..., description="Describes the emotional arc")
    recommended_genres: List[str] = Field(default_factory=list)


class Track(BaseModel):
    title: str
    artist: str
    video_id: Optional[str] = Field(None, description="YouTube video identifier")
    duration: Optional[str] = None
    thumbnail_url: Optional[str] = None
    energy: Optional[str] = Field(None, description="Soft qualitative energy label")


class PlaylistSegment(BaseModel):
    intro: str
    focus: str
    transition: str


class PlaylistResponse(BaseModel):
    prompt: str
    mood: MoodProfile
    transitions: List[str]
    segments: List[PlaylistSegment]
    tracks: List[Track]
    history: List[MoodProfile] = Field(default_factory=list)
