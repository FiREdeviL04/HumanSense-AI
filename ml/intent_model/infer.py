from .features import engineer_behavior_features


INTENTS = ["exit_intent", "confusion", "engagement", "idle"]


def infer_intent(behavior: dict) -> dict:
    f = engineer_behavior_features(behavior)

    if f["mouse_velocity"] > 1.8 and f["click_interval"] < 350:
        label = "confusion"
        confidence = 0.86
    elif f["session_duration"] > 120 and f["click_count"] < 2:
        label = "idle"
        confidence = 0.8
    elif f["scroll_burst"] > 0.7 and f["click_interval"] > 2200:
        label = "exit_intent"
        confidence = 0.82
    elif 0.2 < f["mouse_velocity"] < 1.2 and f["typing_focus"] > 0.8:
        label = "engagement"
        confidence = 0.78
    else:
        label = "idle"
        confidence = 0.62

    return {"label": label, "confidence": confidence, "features": f}
