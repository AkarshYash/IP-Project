"""
Rate Limiter Middleware — Redis sliding window
Falls back to in-memory dict if Redis is unavailable.
"""
import time
import logging
from collections import defaultdict
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# In-memory fallback
_memory_store: dict = defaultdict(list)


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, redis_client=None):
        super().__init__(app)
        self.redis = redis_client
        self.limit = settings.rate_limit_requests
        self.window = settings.rate_limit_window  # seconds

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for static files and health checks
        path = request.url.path
        if path in ("/health", "/metrics") or path.startswith("/static") or path.startswith("/frontend"):
            return await call_next(request)

        ip = request.client.host if request.client else "unknown"
        key = f"rate:{ip}"

        try:
            if self.redis:
                count = await self._redis_check(key)
            else:
                count = self._memory_check(ip)

            if count > self.limit:
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Rate limit exceeded",
                        "detail": f"Max {self.limit} requests per {self.window}s",
                        "retry_after": self.window,
                    },
                )
        except Exception as e:
            logger.warning(f"Rate limiter error: {e} — allowing request")

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.limit)
        return response

    async def _redis_check(self, key: str) -> int:
        now = time.time()
        pipe = self.redis.pipeline()
        pipe.zadd(key, {str(now): now})
        pipe.zremrangebyscore(key, 0, now - self.window)
        pipe.zcard(key)
        pipe.expire(key, self.window)
        results = await pipe.execute()
        return results[2]

    def _memory_check(self, ip: str) -> int:
        now = time.time()
        window_start = now - self.window
        _memory_store[ip] = [t for t in _memory_store[ip] if t > window_start]
        _memory_store[ip].append(now)
        return len(_memory_store[ip])
