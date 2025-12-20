from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, Optional


@dataclass
class UserProfile:
    user_id: str
    email: str
    name: str
    picture: Optional[str]
    joined_date: datetime = field(default_factory=datetime.utcnow)
    created_on: datetime = field(default_factory=datetime.utcnow)
    updated_on: datetime = field(default_factory=datetime.utcnow)
    youtube_credentials: Optional[Dict[str, Any]] = field(default=None)
    history: list[dict] = field(default_factory=list)


import json
import os
from dataclasses import asdict

class UserStore:
    def __init__(self, file_path: str = "data/users.json") -> None:
        self._store: Dict[str, UserProfile] = {}
        self._lock = asyncio.Lock()
        self._file_path = file_path
        self._load()

    def _load(self):
        if not os.path.exists(self._file_path):
            return
        try:
            with open(self._file_path, "r") as f:
                data = json.load(f)
                for user_id, profile_data in data.items():
                    # Convert datetime strings back to objects if needed, 
                    # but for simplicity we might keep them as strings or handle conversion.
                    # Pydantic/Dataclasses might need help.
                    # For now, let's just load dicts and rely on runtime to handle or convert.
                    # Actually, UserProfile expects datetimes.
                    # Let's keep it simple: We will just store the dicts in memory as UserProfile objects.
                    # We need to handle datetime conversion.
                    if "joined_date" in profile_data:
                        profile_data["joined_date"] = datetime.fromisoformat(profile_data["joined_date"])
                    if "created_on" in profile_data:
                        profile_data["created_on"] = datetime.fromisoformat(profile_data["created_on"])
                    if "updated_on" in profile_data:
                        profile_data["updated_on"] = datetime.fromisoformat(profile_data["updated_on"])
                    
                    self._store[user_id] = UserProfile(**profile_data)
        except Exception as e:
            print(f"Failed to load user store: {e}")

    def _save(self):
        # Synchronous save for simplicity, or async if preferred. 
        # Given low volume, sync write inside lock is okay-ish, but better to run in thread.
        # For this MVP, we'll just write directly.
        try:
            os.makedirs(os.path.dirname(self._file_path), exist_ok=True)
            data = {}
            for user_id, profile in self._store.items():
                p_dict = asdict(profile)
                # Serialize datetimes
                p_dict["joined_date"] = p_dict["joined_date"].isoformat()
                p_dict["created_on"] = p_dict["created_on"].isoformat()
                p_dict["updated_on"] = p_dict["updated_on"].isoformat()
                data[user_id] = p_dict
            
            with open(self._file_path, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Failed to save user store: {e}")

    async def upsert_profile(self, profile: UserProfile) -> UserProfile:
        async with self._lock:
            now = datetime.utcnow()
            existing = self._store.get(profile.user_id)
            if existing:
                existing.email = profile.email or existing.email
                existing.name = profile.name or existing.name
                existing.picture = profile.picture or existing.picture
                existing.updated_on = now
                self._save()
                return existing
            profile.joined_date = now
            profile.created_on = now
            profile.updated_on = now
            self._store[profile.user_id] = profile
            self._save()
            return profile

    async def set_youtube_credentials(self, user_id: str, credentials: Dict[str, Any]) -> None:
        async with self._lock:
            profile = self._store.get(user_id)
            if not profile:
                raise KeyError("user not registered")
            profile.youtube_credentials = credentials
            profile.updated_on = datetime.utcnow()
            self._save()

    async def add_history(self, user_id: str, playlist: dict) -> None:
        async with self._lock:
            profile = self._store.get(user_id)
            if not profile:
                return
            # Prepend new playlist
            profile.history.insert(0, playlist)
            # Keep only last 50
            if len(profile.history) > 50:
                profile.history = profile.history[:50]
            profile.updated_on = datetime.utcnow()
            self._save()

    async def remove_history_item(self, user_id: str, index: int) -> None:
        async with self._lock:
            profile = self._store.get(user_id)
            if not profile:
                return
            if 0 <= index < len(profile.history):
                profile.history.pop(index)
                profile.updated_on = datetime.utcnow()
                self._save()

    async def clear_history(self, user_id: str) -> None:
        async with self._lock:
            profile = self._store.get(user_id)
            if not profile:
                return
            profile.history = []
            profile.updated_on = datetime.utcnow()
            self._save()

    async def get_profile(self, user_id: str) -> Optional[UserProfile]:
        async with self._lock:
            return self._store.get(user_id)

    async def get_youtube_credentials(self, user_id: str) -> Optional[Dict[str, Any]]:
        profile = await self.get_profile(user_id)
        return profile.youtube_credentials if profile else None


__all__ = ["UserStore", "UserProfile"]
