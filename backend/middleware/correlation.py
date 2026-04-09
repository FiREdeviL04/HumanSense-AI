from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from ..utils.request_context import generate_id, set_request_context


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("x-request-id") or generate_id()
        session_id = request.headers.get("x-session-id") or ""
        set_request_context(request_id=request_id, session_id=session_id)

        request.state.request_id = request_id
        request.state.session_id = session_id

        response = await call_next(request)
        response.headers["x-request-id"] = request_id
        if session_id:
            response.headers["x-session-id"] = session_id
        return response
