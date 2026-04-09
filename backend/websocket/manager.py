import asyncio
import json
import time
from collections import deque
from fastapi import WebSocket, WebSocketDisconnect
from ..services.model_service import run_intent_prediction, run_fusion_and_decision
from ..services.storage_service import insert_prediction_log
from ..utils.request_context import generate_id, set_request_context
from ..utils.metrics import metrics_store
from ..utils.observability import log_error, log_info


class LivePredictionManager:
    async def handle(self, websocket: WebSocket) -> None:
        await websocket.accept()
        metrics_store.inc_sessions()

        ping_outstanding = False
        last_message_at = time.monotonic()
        recent_messages = deque(maxlen=120)

        try:
            while True:
                try:
                    payload = await asyncio.wait_for(websocket.receive_text(), timeout=20.0)
                except asyncio.TimeoutError:
                    if ping_outstanding:
                        await websocket.close(code=1001)
                        break
                    await websocket.send_json({"type": "ping", "ts": int(time.time() * 1000)})
                    ping_outstanding = True
                    continue

                last_message_at = time.monotonic()
                data = json.loads(payload)

                now = time.monotonic()
                recent_messages.append(now)
                if len(recent_messages) >= 80 and (recent_messages[-1] - recent_messages[0]) < 10:
                    await websocket.close(code=1008)
                    break

                event_type = data.get("type", "prediction")
                if event_type == "heartbeat":
                    ping_outstanding = False
                    await websocket.send_json({"type": "heartbeat_ack", "ts": int(time.time() * 1000)})
                    continue

                request_id = data.get("request_id") or generate_id()
                session_id = data.get("session_id") or ""
                set_request_context(request_id=request_id, session_id=session_id)

                emotion = data.get("emotion", {"label": "neutral", "confidence": 0.0})
                behavior = data.get("behavior", {})
                text_emotion = data.get("textEmotion", {"label": "neutral", "confidence": 0.0})

                intent = await run_intent_prediction(behavior)
                fusion, action = await run_fusion_and_decision(emotion=emotion, intent=intent, text_emotion=text_emotion)

                await insert_prediction_log(
                    {
                        "emotion": fusion["emotion"],
                        "intent": fusion["intent"],
                        "action": action["key"],
                        "risk_score": fusion["risk"],
                        "metadata": {
                            "channel": "websocket",
                            "text_emotion": text_emotion.get("label", "neutral"),
                            "request_id": request_id,
                            "session_id": session_id,
                        },
                    }
                )

                await websocket.send_json(
                    {
                        "type": "prediction",
                        "request_id": request_id,
                        "session_id": session_id,
                        "intent": intent,
                        "fusion": fusion,
                        "action": action,
                    }
                )

                ping_outstanding = False

                if time.monotonic() - last_message_at > 60:
                    await websocket.close(code=1001)
                    break

        except WebSocketDisconnect:
            log_info("websocket_disconnected")
        except Exception as exc:
            log_error("websocket_manager_error", error=str(exc))
            try:
                await websocket.close(code=1011)
            except Exception:
                pass
        finally:
            metrics_store.dec_sessions()
