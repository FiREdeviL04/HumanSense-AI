import logging
import time
from .request_context import get_request_id, get_session_id

logger = logging.getLogger("humansense")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(name)s | %(message)s")


def log_error(message: str, **meta) -> None:
    meta = {**meta, "request_id": get_request_id(), "session_id": get_session_id()}
    logger.error("%s | meta=%s", message, meta)


def log_info(message: str, **meta) -> None:
    meta = {**meta, "request_id": get_request_id(), "session_id": get_session_id()}
    logger.info("%s | meta=%s", message, meta)


class PerfTimer:
    def __init__(self, operation: str):
        self.operation = operation
        self.start = 0.0

    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc, tb):
        elapsed_ms = (time.perf_counter() - self.start) * 1000
        logger.info("perf | op=%s | elapsed_ms=%.2f", self.operation, elapsed_ms)
