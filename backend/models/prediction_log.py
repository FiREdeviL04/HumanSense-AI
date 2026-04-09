from pydantic import BaseModel, Field
from datetime import datetime


class PredictionLog(BaseModel):
    id: str = Field(default="")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    emotion: str
    intent: str
    action: str
    risk_score: float
    metadata: dict = Field(default_factory=dict)
