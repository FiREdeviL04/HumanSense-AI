from fastapi import HTTPException
from ..schemas.prediction import WebcamFrameRequest, TextEmotionRequest
from ..services.model_service import run_emotion_from_frame, run_emotion_from_text
from ..utils.observability import log_info, log_error


async def webcam_emotion_controller(payload: WebcamFrameRequest) -> dict:
    try:
        result = await run_emotion_from_frame(payload.frame_base64)
        log_info("emotion_webcam_success", label=result.get("label", "neutral"))
        return result
    except Exception as exc:
        log_error("emotion_webcam_failure", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Webcam emotion inference failed: {exc}") from exc


async def text_emotion_controller(payload: TextEmotionRequest) -> dict:
    try:
        result = await run_emotion_from_text(payload.text)
        log_info("emotion_text_success", label=result.get("label", "neutral"))
        return result
    except Exception as exc:
        log_error("emotion_text_failure", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Text emotion inference failed: {exc}") from exc
