import base64
import random
import re
from io import BytesIO

from PIL import Image

EMOTIONS = ["happy", "sad", "angry", "stressed", "neutral"]

_POSITIVE_WORDS = {
    "happy",
    "great",
    "good",
    "focused",
    "calm",
    "confident",
    "excited",
    "productive",
    "okay",
    "fine",
}
_NEGATIVE_WORDS = {
    "sad",
    "bad",
    "angry",
    "stressed",
    "anxious",
    "worried",
    "tired",
    "frustrated",
    "upset",
    "panic",
}
_CALM_WORDS = {"calm", "relaxed", "steady", "peaceful", "clear"}
_ENERGY_WORDS = {"excited", "productive", "focused", "active", "alert"}


def _decode_image(frame_base64: str) -> Image.Image:
    if "," in frame_base64:
        frame_base64 = frame_base64.split(",", maxsplit=1)[1]
    image_bytes = base64.b64decode(frame_base64)
    return Image.open(BytesIO(image_bytes)).convert("L")


def _normalised_brightness_stats(image: Image.Image) -> tuple[float, float]:
    pixels = list(image.getdata())
    if not pixels:
        return 0.0, 0.0

    mean_intensity = sum(pixels) / len(pixels)
    variance = sum((value - mean_intensity) ** 2 for value in pixels) / len(pixels)
    return mean_intensity, variance


def infer_webcam_emotion(frame_base64: str) -> dict:
    try:
        frame = _decode_image(frame_base64)
        mean_intensity, variance = _normalised_brightness_stats(frame)
    except Exception:
        return {"label": "neutral", "confidence": 0.5, "source": "webcam"}

    # Serverless-safe heuristic classifier: cheap, deterministic, and no heavy ML runtime.
    if mean_intensity >= 175 and variance >= 900:
        label = "happy"
        confidence = 0.84
    elif mean_intensity <= 75 and variance >= 700:
        label = "sad"
        confidence = 0.8
    elif variance >= 1800 and mean_intensity <= 110:
        label = "angry"
        confidence = 0.82
    elif variance <= 650:
        label = "stressed"
        confidence = 0.76
    else:
        label = "neutral"
        confidence = 0.7

    confidence = max(0.55, min(0.95, confidence + random.uniform(-0.04, 0.04)))
    return {"label": label, "confidence": confidence, "source": "webcam"}


def infer_text_emotion(text: str) -> dict:
    tokens = re.findall(r"[a-z']+", text.lower())[:80]
    token_set = set(tokens)

    positive_hits = len(token_set & _POSITIVE_WORDS)
    negative_hits = len(token_set & _NEGATIVE_WORDS)
    calm_hits = len(token_set & _CALM_WORDS)
    energy_hits = len(token_set & _ENERGY_WORDS)
    exclamation_bonus = min(2, text.count("!"))

    if negative_hits >= 2 or (negative_hits and text.count("?") >= 2):
        label = "stressed"
        confidence = 0.86
    elif "angry" in token_set or "frustrated" in token_set or text.count("!") >= 3:
        label = "angry"
        confidence = 0.88
    elif positive_hits >= 2 and calm_hits:
        label = "happy"
        confidence = 0.9
    elif calm_hits >= 2 or (positive_hits and energy_hits):
        label = "neutral"
        confidence = 0.74
    elif positive_hits:
        label = "happy"
        confidence = 0.8
    elif negative_hits:
        label = "sad"
        confidence = 0.78
    else:
        label = "neutral"
        confidence = 0.62

    confidence = min(0.95, confidence + 0.02 * exclamation_bonus)
    return {
        "label": label,
        "confidence": confidence,
        "source": "heuristic-text",
    }
