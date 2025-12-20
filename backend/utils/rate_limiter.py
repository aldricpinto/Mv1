from __future__ import annotations

import asyncio
import time
from collections import defaultdict, deque
from typing import Deque

from fastapi import HTTPException, Request, status


class RateLimiter:
    """Token bucket style limiter per client IP."""

    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window = window_seconds
        self._entries: dict[str, Deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

    async def __call__(self, request: Request) -> None:
        identifier = request.client.host if request.client else "anonymous"
        async with self._lock:
            now = time.time()
            queue = self._entries[identifier]
            while queue and now - queue[0] > self.window:
                queue.popleft()
            if len(queue) >= self.max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Muse is vibing too hard right now. Please try again shortly.",
                )
            queue.append(now)


__all__ = ["RateLimiter"]
