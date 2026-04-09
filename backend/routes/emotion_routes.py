from fastapi import APIRouter
from ..schemas.prediction import WebcamFrameRequest, TextEmotionRequest
from ..controllers.emotion_controller import webcam_emotion_controller, text_emotion_controller

router = APIRouter(prefix="/api/emotion", tags=["emotion"])


@router.post("/webcam")
async def webcam_emotion(payload: WebcamFrameRequest):
    return await webcam_emotion_controller(payload)


@router.post("/text")
async def text_emotion(payload: TextEmotionRequest):
    return await text_emotion_controller(payload)
