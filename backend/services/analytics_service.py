from datetime import datetime
from .storage_service import get_prediction_logs, get_behavior_logs


async def build_analytics_summary() -> dict:
    logs = await get_prediction_logs(limit=200)
    behavior_logs = await get_behavior_logs(limit=80)

    emotion_counts = {}
    timeline = []

    for log in logs:
        emotion_counts[log["emotion"]] = emotion_counts.get(log["emotion"], 0) + 1
        timeline.append(
            {
                "t": datetime.fromisoformat(log["timestamp"]).strftime("%H:%M:%S"),
                "confusion": 1 if log["intent"] == "confusion" else 0,
                "engagement": 1 if log["intent"] == "engagement" else 0,
                "exit_intent": 1 if log["intent"] == "exit_intent" else 0,
            }
        )

    emotion_distribution = [
        {"name": emotion, "value": count}
        for emotion, count in sorted(emotion_counts.items(), key=lambda x: x[0])
    ]

    heatmap_points = []
    for b in behavior_logs:
        trail = (b.get("behavior") or {}).get("trail", [])
        heatmap_points.extend(trail[-20:])

    return {
        "emotion_distribution": emotion_distribution,
        "intent_timeline": timeline[-40:],
        "behavior_heatmap": heatmap_points[-400:],
    }
