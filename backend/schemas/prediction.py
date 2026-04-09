from pydantic import BaseModel, Field
from typing import Any, Dict, List


class WebcamFrameRequest(BaseModel):
    frame_base64: str


class TextEmotionRequest(BaseModel):
    text: str


class BehaviorSnapshot(BaseModel):
    mouseVelocity: float = 0.0
    clickIntervalAvg: float = 0.0
    scrollBurstScore: float = 0.0
    typingLatencyAvg: float = 0.0
    sessionDuration: float = 0.0
    clickCount: int = 0
    trail: List[Dict[str, Any]] = Field(default_factory=list)


class BehaviorLogRequest(BaseModel):
    behavior: BehaviorSnapshot
    emotion: Dict[str, Any] = Field(default_factory=dict)
    textEmotion: Dict[str, Any] = Field(default_factory=dict)
    requestId: str | None = None
    sessionId: str | None = None
