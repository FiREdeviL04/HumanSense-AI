from fastapi import APIRouter
from ..schemas.prediction import BehaviorLogRequest
from ..controllers.intent_controller import behavior_log_controller, predict_from_behavior_controller

router = APIRouter(prefix="/api/behavior", tags=["behavior"])


@router.post("/log")
async def log_behavior(payload: BehaviorLogRequest):
    return await behavior_log_controller(payload)


@router.post("/predict")
async def predict_behavior(payload: BehaviorLogRequest):
    return await predict_from_behavior_controller(payload)
