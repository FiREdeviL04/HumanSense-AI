import asyncio
import time
from ml.emotion_model.infer import infer_webcam_emotion, infer_text_emotion
from ml.intent_model.infer import infer_intent
from ml.fusion_engine.fuser import fuse_predictions
from ml.fusion_engine.decision_engine import decide_action
from ..utils.metrics import metrics_store


emotion_semaphore = asyncio.Semaphore(6)
intent_semaphore = asyncio.Semaphore(10)
fusion_semaphore = asyncio.Semaphore(20)


async def _measure_inference(name: str, fn, *args):
    started = time.perf_counter()
    result = await asyncio.to_thread(fn, *args)
    metrics_store.observe_inference(name, (time.perf_counter() - started) * 1000)
    return result


async def run_emotion_from_frame(frame_base64: str) -> dict:
    async with emotion_semaphore:
        return await _measure_inference("emotion_frame", infer_webcam_emotion, frame_base64)


async def run_emotion_from_text(text: str) -> dict:
    async with emotion_semaphore:
        return await _measure_inference("emotion_text", infer_text_emotion, text)


async def run_intent_prediction(behavior: dict) -> dict:
    async with intent_semaphore:
        return await _measure_inference("intent", infer_intent, behavior)


async def run_fusion_and_decision(emotion: dict, intent: dict, text_emotion: dict | None = None) -> tuple[dict, dict]:
    async with fusion_semaphore:
        started = time.perf_counter()
        fusion = await asyncio.to_thread(fuse_predictions, emotion=emotion, intent=intent, text_emotion=text_emotion)
        action = await asyncio.to_thread(decide_action, fusion)
        metrics_store.observe_inference("fusion", (time.perf_counter() - started) * 1000)
        return fusion, action
