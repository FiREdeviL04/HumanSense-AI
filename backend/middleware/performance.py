import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from ..utils.metrics import metrics_store
from ..utils.observability import log_info


class PerformanceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        started = time.perf_counter()
        route = request.url.path

        try:
            response = await call_next(request)
        except Exception:
            elapsed_ms = (time.perf_counter() - started) * 1000
            metrics_store.observe_api(route, elapsed_ms)
            metrics_store.observe_error()
            raise

        elapsed_ms = (time.perf_counter() - started) * 1000
        metrics_store.observe_api(route, elapsed_ms)
        log_info("api_call", path=route, method=request.method, status=response.status_code, elapsed_ms=round(elapsed_ms, 2))

        if response.status_code >= 400:
            metrics_store.observe_error()

        return response
