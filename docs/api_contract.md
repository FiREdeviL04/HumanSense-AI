# API Contract

## REST

### POST /api/emotion/webcam
Request:
{
  "frame_base64": "data:image/jpeg;base64,..."
}

Response:
{
  "label": "stressed",
  "confidence": 0.83,
  "source": "webcam"
}

### POST /api/emotion/text
Request:
{
  "text": "I am overwhelmed by this page"
}

Response:
{
  "label": "stressed",
  "confidence": 0.88,
  "source": "text-transformer"
}

### POST /api/behavior/log
Request:
{
  "behavior": {
    "mouseVelocity": 1.8,
    "clickIntervalAvg": 260,
    "scrollBurstScore": 0.2,
    "typingLatencyAvg": 300,
    "sessionDuration": 92,
    "clickCount": 7,
    "trail": []
  },
  "emotion": { "label": "stressed", "confidence": 0.81 },
  "textEmotion": { "label": "stressed", "confidence": 0.75 }
}

Response:
{
  "intent": { "label": "confusion", "confidence": 0.86 },
  "fusion": { "emotion": "stressed", "intent": "confusion", "risk": 0.89 },
  "action": { "key": "guided_help", "message": "..." }
}

### GET /api/analytics/summary
Response:
{
  "emotion_distribution": [{ "name": "stressed", "value": 17 }],
  "intent_timeline": [{ "t": "11:20:16", "confusion": 1, "engagement": 0, "exit_intent": 0 }]
}

### GET /api/analytics/prediction-logs
Response:
{
  "logs": [{ "id": "...", "emotion": "stressed", "intent": "confusion", "action": "guided_help", "risk_score": 0.89, "timestamp": "..." }]
}

### GET /api/analytics/behavior-heatmap
Response:
{
  "points": [{ "x": 440, "y": 260, "ts": 1712644205000 }]
}

## WebSocket

### WS /ws/live
Client -> server message:
{
  "emotion": { "label": "stressed", "confidence": 0.84 },
  "textEmotion": { "label": "neutral", "confidence": 0.61 },
  "behavior": { "mouseVelocity": 1.9, "clickIntervalAvg": 220, "scrollBurstScore": 0.14, "typingLatencyAvg": 340, "sessionDuration": 66, "clickCount": 8, "trail": [] }
}

Server -> client message:
{
  "type": "prediction",
  "intent": { "label": "confusion", "confidence": 0.86 },
  "fusion": { "emotion": "stressed", "intent": "confusion", "risk": 0.9 },
  "action": { "key": "guided_help", "message": "...", "adaptive_flags": { "simplify_ui": true, "show_tutorial": true } }
}
