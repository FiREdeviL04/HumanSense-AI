import time
from collections import defaultdict, deque
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 120, window_sec: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_sec = window_sec
        self.hits: dict[str, deque] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        # Keep health endpoints and metrics unrestricted.
        if request.url.path in {"/health", "/metrics"}:
            return await call_next(request)

        ip = request.client.host if request.client else "unknown"
        now = time.time()
        dq = self.hits[ip]

        while dq and now - dq[0] > self.window_sec:
            dq.popleft()

        if len(dq) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded", "retry_after_sec": self.window_sec},
            )

        dq.append(now)
        return await call_next(request)
