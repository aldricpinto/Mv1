from __future__ import annotations

import asyncio
import time
from collections import deque
from dataclasses import dataclass
from typing import Any


@dataclass
class CacheEntry:
    key: str
    value: Any
    expires_at: float


class DeviceCache:
    """Simple TTL cache scoped per device for playlists and histories."""

    def __init__(self, ttl_seconds: int, max_entries: int) -> None:
        self.ttl = ttl_seconds
        self.max_entries = max_entries
        self._lock = asyncio.Lock()
        self._store: dict[str, deque[CacheEntry]] = {}

    async def remember(self, device_id: str, key: str, value: Any) -> None:
        async with self._lock:
            queue = self._store.setdefault(device_id, deque(maxlen=self.max_entries))
            queue.appendleft(CacheEntry(key=key, value=value, expires_at=time.time() + self.ttl))

    async def get_latest(self, device_id: str, key: str | None = None) -> Any | None:
        async with self._lock:
            self._prune(device_id)
            queue = self._store.get(device_id)
            if not queue:
                return None
            if key is None:
                return queue[0].value
            for entry in queue:
                if entry.key == key:
                    return entry.value
            return None

    async def history(self, device_id: str, key: str | None = None) -> list[CacheEntry]:
        async with self._lock:
            self._prune(device_id)
            queue = self._store.get(device_id)
            if not queue:
                return []
            if key is None:
                return list(queue)
            return [entry for entry in queue if entry.key == key]

    def _prune(self, device_id: str) -> None:
        queue = self._store.get(device_id)
        if not queue:
            return
        now = time.time()
        while queue and queue[-1].expires_at < now:
            queue.pop()


__all__ = ["DeviceCache", "CacheEntry"]
