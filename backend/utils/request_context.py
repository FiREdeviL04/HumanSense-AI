import uuid
from contextvars import ContextVar

_request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")
_session_id_ctx: ContextVar[str] = ContextVar("session_id", default="")


def generate_id() -> str:
    return uuid.uuid4().hex


def set_request_context(request_id: str, session_id: str = "") -> None:
    _request_id_ctx.set(request_id)
    if session_id:
        _session_id_ctx.set(session_id)


def get_request_id() -> str:
    value = _request_id_ctx.get()
    return value or "-"


def get_session_id() -> str:
    value = _session_id_ctx.get()
    return value or "-"
