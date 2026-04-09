def decide_action(fusion: dict) -> dict:
    emotion = fusion.get("emotion", "neutral")
    intent = fusion.get("intent", "idle")

    if emotion == "stressed" and intent == "confusion":
        return {
            "key": "guided_help",
            "message": "You seem stressed and uncertain. I can switch to a step-by-step guided mode.",
            "adaptive_flags": {"simplify_ui": True, "show_tutorial": True},
        }

    if intent == "exit_intent":
        return {
            "key": "retention_popup",
            "message": "Before you leave, here is a quick shortcut and an assisted completion option.",
            "adaptive_flags": {"show_offer": True},
        }

    if emotion == "angry":
        return {
            "key": "reduce_notifications",
            "message": "Reducing noise by minimizing non-essential alerts.",
            "adaptive_flags": {"reduce_distractions": True},
        }

    if fusion.get("risk", 0.0) > 0.7:
        return {
            "key": "simplify_ui",
            "message": "High cognitive load detected. Activating simplified interface.",
            "adaptive_flags": {"simplify_ui": True},
        }

    return {
        "key": "none",
        "message": "No adaptation needed right now.",
        "adaptive_flags": {},
    }
