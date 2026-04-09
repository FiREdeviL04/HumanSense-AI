from fastapi import APIRouter
from ..services.analytics_service import build_analytics_summary
from ..services.storage_service import get_prediction_logs, get_behavior_logs
from bson import ObjectId

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def _to_json_safe(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, dict):
        return {k: _to_json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_to_json_safe(v) for v in value]
    return value


@router.get("/summary")
async def summary():
    return await build_analytics_summary()


@router.get("/prediction-logs")
async def prediction_logs():
    logs = await get_prediction_logs(limit=120)
    return {"logs": _to_json_safe(logs)}


@router.get("/behavior-heatmap")
async def behavior_heatmap():
    logs = await get_behavior_logs(limit=80)
    points = []
    for item in logs:
        trail = (item.get("behavior") or {}).get("trail", [])
        points.extend(trail[-20:])
    return {"points": points[-400:]}
