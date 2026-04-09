import time
from .queue_service import queue_service, QUEUE_BEHAVIOR, QUEUE_PREDICTION
from .storage_service import insert_behavior_log_direct, insert_prediction_log_direct
from ..utils.observability import log_error, log_info


async def flush_redis_queue(batch_size: int = 50) -> None:
    for queue_name, writer in (
        (QUEUE_BEHAVIOR, insert_behavior_log_direct),
        (QUEUE_PREDICTION, insert_prediction_log_direct),
    ):
        items = await queue_service.dequeue_batch(queue_name, batch_size=batch_size)

        for item in items:
            if float(item.get("next_attempt_at", 0.0)) > time.time():
                await queue_service.enqueue(
                    queue_name,
                    payload=item.get("payload", {}),
                    retries=int(item.get("retries", 0)),
                    next_attempt_at=float(item.get("next_attempt_at", 0.0)),
                )
                continue

            try:
                await writer(item.get("payload", {}))
            except Exception as exc:
                log_error("redis_queue_flush_item_failed", queue=queue_name, error=str(exc))
                await queue_service.requeue_with_backoff(queue_name, item)

    depths = await queue_service.get_depths()
    if any(depths.values()):
        log_info("redis_queue_depth", **depths)
