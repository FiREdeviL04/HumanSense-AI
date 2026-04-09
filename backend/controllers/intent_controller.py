from fastapi import HTTPException
from ..schemas.prediction import BehaviorLogRequest
from ..services.model_service import run_intent_prediction, run_fusion_and_decision
from ..services.storage_service import insert_behavior_log, insert_prediction_log
from ..utils.observability import log_info, log_error


async def behavior_log_controller(payload: BehaviorLogRequest) -> dict:
    behavior_data = payload.behavior.model_dump()
    emotion_data = payload.emotion or {"label": "neutral", "confidence": 0.0}
    text_emotion_data = payload.textEmotion or {"label": "neutral", "confidence": 0.0}

    await insert_behavior_log(
        {
            "behavior": behavior_data,
            "emotion": emotion_data,
            "textEmotion": text_emotion_data,
            "request_id": payload.requestId,
            "session_id": payload.sessionId,
        }
    )

    intent = await run_intent_prediction(behavior_data)
    fusion, action = await run_fusion_and_decision(emotion=emotion_data, intent=intent, text_emotion=text_emotion_data)

    await insert_prediction_log(
        {
            "emotion": fusion["emotion"],
            "intent": fusion["intent"],
            "action": action["key"],
            "risk_score": fusion["risk"],
            "metadata": {
                "emotion_confidence": emotion_data.get("confidence", 0.0),
                "intent_confidence": intent.get("confidence", 0.0),
                "request_id": payload.requestId,
                "session_id": payload.sessionId,
            },
        }
    )

    log_info("intent_pipeline_success", intent=intent.get("label", "idle"), action=action.get("key", "none"))

    return {"intent": intent, "fusion": fusion, "action": action}


async def predict_from_behavior_controller(payload: BehaviorLogRequest) -> dict:
    try:
        return await behavior_log_controller(payload)
    except Exception as exc:
        log_error("intent_pipeline_failure", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Intent pipeline failed: {exc}") from exc
