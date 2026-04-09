import json
import time
from typing import Any
import redis.asyncio as redis
from ..utils.config import settings
from ..utils.observability import log_error


QUEUE_BEHAVIOR = "humansense:queue:behavior"
QUEUE_PREDICTION = "humansense:queue:prediction"
QUEUE_DLQ = "humansense:queue:dlq"


class RedisQueueService:
    def __init__(self, url: str):
        self.url = url
        self.client: redis.Redis | None = None

    async def connect(self) -> None:
        self.client = redis.from_url(self.url, encoding="utf-8", decode_responses=True)
        await self.client.ping()

    async def close(self) -> None:
        if self.client is not None:
            await self.client.aclose()
            self.client = None

    async def enqueue(self, queue_name: str, payload: dict[str, Any], retries: int = 0, next_attempt_at: float = 0.0) -> None:
        if not self.client:
            raise RuntimeError("Redis queue client not connected")
        envelope = {
            "payload": payload,
            "retries": retries,
            "next_attempt_at": next_attempt_at,
            "queued_at": time.time(),
        }
        await self.client.rpush(queue_name, json.dumps(envelope))

    async def dequeue_batch(self, queue_name: str, batch_size: int = 50) -> list[dict[str, Any]]:
        if not self.client:
            return []

        items = []
        for _ in range(batch_size):
            raw = await self.client.lpop(queue_name)
            if raw is None:
                break
            try:
                items.append(json.loads(raw))
            except Exception:
                await self.client.rpush(QUEUE_DLQ, raw)
        return items

    async def requeue_with_backoff(self, queue_name: str, item: dict[str, Any], max_retries: int = 6) -> None:
        if not self.client:
            return

        retries = int(item.get("retries", 0)) + 1
        payload = item.get("payload", {})
        if retries > max_retries:
            await self.client.rpush(QUEUE_DLQ, json.dumps(item))
            return

        backoff = min(60.0, 0.5 * (2 ** retries))
        await self.enqueue(queue_name, payload=payload, retries=retries, next_attempt_at=time.time() + backoff)

    async def get_depths(self) -> dict[str, int]:
        if not self.client:
            return {"behavior": 0, "prediction": 0, "dead_letter": 0}
        try:
            behavior = int(await self.client.llen(QUEUE_BEHAVIOR))
            prediction = int(await self.client.llen(QUEUE_PREDICTION))
            dlq = int(await self.client.llen(QUEUE_DLQ))
            return {"behavior": behavior, "prediction": prediction, "dead_letter": dlq}
        except Exception as exc:
            log_error("redis_queue_depth_failed", error=str(exc))
            return {"behavior": 0, "prediction": 0, "dead_letter": 0}


queue_service = RedisQueueService(settings.redis_url)
