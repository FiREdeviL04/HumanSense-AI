import sys
from pathlib import Path
import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from backend.routes.emotion_routes import router as emotion_router
from backend.routes.intent_routes import router as intent_router
from backend.routes.analytics_routes import router as analytics_router
from backend.websocket.manager import LivePredictionManager
from backend.utils.config import settings
from backend.utils.database import mongo
from backend.services.storage_service import get_breaker_state
from backend.services.queue_service import queue_service
from backend.services.queue_worker import flush_redis_queue
from backend.utils.observability import log_info
from backend.utils.metrics import get_metrics_snapshot
from backend.middleware.correlation import CorrelationIdMiddleware
from backend.middleware.performance import PerformanceMiddleware
from backend.middleware.rate_limiter import RateLimiterMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI(title=settings.app_name, version="1.0.0")
manager = LivePredictionManager()
flush_task: asyncio.Task | None = None

origins = [origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(PerformanceMiddleware)
app.add_middleware(RateLimiterMiddleware, max_requests=240, window_sec=60)

app.include_router(emotion_router)
app.include_router(intent_router)
app.include_router(analytics_router)


@app.on_event("startup")
async def startup_event() -> None:
    global flush_task
    mongo.client = AsyncIOMotorClient(
        settings.mongo_uri,
        serverSelectionTimeoutMS=1200,
        connectTimeoutMS=1200,
        socketTimeoutMS=1200,
    )

    try:
        await queue_service.connect()
        log_info("redis_connected")
    except Exception:
        log_info("redis_unavailable_fallback")

    async def _flush_worker() -> None:
        while True:
            try:
                await flush_redis_queue(batch_size=50)
            except Exception:
                pass
            await asyncio.sleep(2.0)

    flush_task = asyncio.create_task(_flush_worker())
    log_info("startup_complete")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    global flush_task
    if flush_task:
        flush_task.cancel()
        flush_task = None
    try:
        await queue_service.close()
    except Exception:
        pass
    if mongo.client:
        mongo.client.close()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "humansense-backend"}


@app.get("/metrics")
async def metrics() -> dict:
    queue_depth = await queue_service.get_depths()
    return get_metrics_snapshot(circuit_state=get_breaker_state(), queue_depth=queue_depth)


@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.handle(websocket)
