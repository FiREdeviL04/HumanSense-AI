def fuse_predictions(emotion: dict, intent: dict, text_emotion: dict | None = None) -> dict:
    webcam_label = emotion.get("label", "neutral")
    webcam_conf = float(emotion.get("confidence", 0.0))
    intent_label = intent.get("label", "idle")
    intent_conf = float(intent.get("confidence", 0.0))

    text_label = "neutral"
    text_conf = 0.0
    if text_emotion:
        text_label = text_emotion.get("label", "neutral")
        text_conf = float(text_emotion.get("confidence", 0.0))

    dominant_emotion = webcam_label if webcam_conf >= text_conf else text_label

    risk = 0.0
    if dominant_emotion in {"angry", "stressed"}:
        risk += 0.42
    if intent_label in {"confusion", "exit_intent"}:
        risk += 0.36
    risk += (webcam_conf * 0.1) + (intent_conf * 0.12)

    return {
        "emotion": dominant_emotion,
        "intent": intent_label,
        "risk": min(1.0, risk),
        "sources": {
            "webcam": {"label": webcam_label, "confidence": webcam_conf},
            "text": {"label": text_label, "confidence": text_conf},
            "intent": {"label": intent_label, "confidence": intent_conf},
        },
    }
