import math


def engineer_behavior_features(behavior: dict) -> dict:
    mouse_velocity = float(behavior.get("mouseVelocity", 0.0))
    click_interval = float(behavior.get("clickIntervalAvg", 0.0))
    scroll_burst = float(behavior.get("scrollBurstScore", 0.0))
    typing_latency = float(behavior.get("typingLatencyAvg", 0.0))
    session_duration = float(behavior.get("sessionDuration", 0.0))
    click_count = int(behavior.get("clickCount", 0))

    return {
        "mouse_velocity": mouse_velocity,
        "click_interval": click_interval,
        "scroll_burst": scroll_burst,
        "typing_latency": typing_latency,
        "session_duration": session_duration,
        "click_count": click_count,
        "cursor_entropy": min(1.0, math.log1p(mouse_velocity * 20) / 5),
        "typing_focus": 1.0 if 120 <= typing_latency <= 500 else 0.4,
    }
