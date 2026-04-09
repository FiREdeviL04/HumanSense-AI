import json
import random
import time
from pathlib import Path

OUTPUT = Path("data/behavior_logs/synthetic_behavior_stream.jsonl")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)


def generate_event(ts: float) -> dict:
    return {
        "timestamp": ts,
        "mouseVelocity": round(random.uniform(0.05, 2.4), 4),
        "clickIntervalAvg": round(random.uniform(120, 3000), 2),
        "scrollBurstScore": round(random.uniform(0, 1), 3),
        "typingLatencyAvg": round(random.uniform(90, 900), 2),
        "sessionDuration": round(random.uniform(1, 1800), 2),
        "clickCount": random.randint(0, 60),
    }


def collect_synthetic_samples(sample_count=2000):
    with OUTPUT.open("w", encoding="utf-8") as file:
        for _ in range(sample_count):
            event = generate_event(time.time())
            file.write(json.dumps(event) + "\n")

    print(f"Saved {sample_count} synthetic samples to {OUTPUT}")


if __name__ == "__main__":
    collect_synthetic_samples()
