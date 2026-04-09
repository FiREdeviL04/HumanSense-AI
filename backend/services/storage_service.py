from datetime import datetime
import asyncio
import time
from bson import ObjectId
from ..utils.database import get_db
from ..utils.circuit_breaker import CircuitBreaker, CircuitBreakerConfig
from ..utils.observability import log_error
from ..utils.metrics import metrics_store
from .queue_service import queue_service, QUEUE_BEHAVIOR, QUEUE_PREDICTION


_MEM_BEHAVIOR_LOGS: list[dict] = []
_MEM_PREDICTION_LOGS: list[dict] = []

_db_breaker = CircuitBreaker(CircuitBreakerConfig(failure_threshold=2, recovery_timeout_sec=10.0, half_open_max_calls=1))


def get_breaker_state() -> str:
    return str(_db_breaker.state.value)


def _stamp(payload: dict) -> dict:
    stamped = dict(payload)
    stamped.setdefault("timestamp", datetime.utcnow().isoformat())
    return stamped


async def _db_insert_one(collection_name: str, payload: dict, timeout_sec: float = 1.4) -> str:
    if not _db_breaker.allow_request():
        raise RuntimeError("db-circuit-open")

    db = get_db()

    for attempt in range(3):
        started = time.perf_counter()
        try:
            op = db[collection_name].insert_one(payload)
            result = await asyncio.wait_for(op, timeout=timeout_sec)
            metrics_store.observe_db((time.perf_counter() - started) * 1000)
            _db_breaker.record_success()
            return str(result.inserted_id)
        except Exception as exc:
            metrics_store.observe_error()
            _db_breaker.record_failure()
            if attempt == 2:
                raise
            await asyncio.sleep(0.05 * (2 ** attempt))

    raise RuntimeError("db-insert-failed")


async def insert_behavior_log_direct(payload: dict) -> str:
    payload = _stamp(payload)
    return await _db_insert_one("behavior_logs", payload)


async def insert_prediction_log_direct(payload: dict) -> str:
    payload = _stamp(payload)
    return await _db_insert_one("prediction_logs", payload)


async def insert_behavior_log(payload: dict) -> None:
    payload = _stamp(payload)
    try:
        await _db_insert_one("behavior_logs", payload)
    except Exception as exc:
        metrics_store.observe_error()
        payload = {**payload, "id": str(ObjectId())}
        _MEM_BEHAVIOR_LOGS.append(payload)
        try:
            await queue_service.enqueue(QUEUE_BEHAVIOR, payload=payload)
        except Exception as redis_exc:
            log_error("behavior_queue_enqueue_failed", error=str(redis_exc))
        log_error("behavior_log_write_failed", error=str(exc), breaker_state=_db_breaker.state)


async def insert_prediction_log(payload: dict) -> str:
    payload = _stamp(payload)
    try:
        return await _db_insert_one("prediction_logs", payload)
    except Exception as exc:
        metrics_store.observe_error()
        record_id = str(ObjectId())
        payload = {**payload, "id": record_id}
        _MEM_PREDICTION_LOGS.append(payload)
        try:
            await queue_service.enqueue(QUEUE_PREDICTION, payload=payload)
        except Exception as redis_exc:
            log_error("prediction_queue_enqueue_failed", error=str(redis_exc))
        log_error("prediction_log_write_failed", error=str(exc), breaker_state=_db_breaker.state)
        return record_id


async def get_prediction_logs(limit: int = 50) -> list[dict]:
    try:
        if not _db_breaker.allow_request():
            return list(reversed(_MEM_PREDICTION_LOGS[-limit:]))

        db = get_db()
        logs = []
        started = time.perf_counter()
        cursor = db.prediction_logs.find().sort("timestamp", -1).limit(limit)
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", ObjectId()))
            doc.pop("_id", None)
            logs.append(doc)
        metrics_store.observe_db((time.perf_counter() - started) * 1000)
        _db_breaker.record_success()
        return logs
    except Exception as exc:
        metrics_store.observe_error()
        _db_breaker.record_failure()
        log_error("prediction_log_read_failed", error=str(exc), breaker_state=_db_breaker.state)
        return list(reversed(_MEM_PREDICTION_LOGS[-limit:]))


async def get_behavior_logs(limit: int = 120) -> list[dict]:
    try:
        if not _db_breaker.allow_request():
            return list(reversed(_MEM_BEHAVIOR_LOGS[-limit:]))

        db = get_db()
        logs = []
        started = time.perf_counter()
        cursor = db.behavior_logs.find().sort("timestamp", -1).limit(limit)
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", ObjectId()))
            doc.pop("_id", None)
            logs.append(doc)
        metrics_store.observe_db((time.perf_counter() - started) * 1000)
        _db_breaker.record_success()
        return logs
    except Exception as exc:
        metrics_store.observe_error()
        _db_breaker.record_failure()
        log_error("behavior_log_read_failed", error=str(exc), breaker_state=_db_breaker.state)
        return list(reversed(_MEM_BEHAVIOR_LOGS[-limit:]))
