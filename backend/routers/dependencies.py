from __future__ import annotations

from fastapi import Depends, Request

from ..utils.rate_limiter import RateLimiter


async def enforce_rate_limit(request: Request) -> None:
    limiter: RateLimiter = request.app.state.rate_limiter
    await limiter(request)


RateLimited = Depends(enforce_rate_limit)
