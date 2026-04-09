import pandas as pd
from pathlib import Path

INPUT = Path("data/behavior_logs/synthetic_behavior_stream.jsonl")
OUTPUT = Path("data/processed/behavior_labeled.csv")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)


def label_row(row):
    if row.mouseVelocity > 1.7 and row.clickIntervalAvg < 400:
        return "confusion"
    if row.scrollBurstScore > 0.7 and row.clickIntervalAvg > 2000:
        return "exit_intent"
    if 0.2 < row.mouseVelocity < 1.2 and 120 < row.typingLatencyAvg < 500:
        return "engagement"
    return "idle"


def label_behavior_dataset():
    df = pd.read_json(INPUT, lines=True)
    df["cursor_entropy"] = (df["mouseVelocity"] * 0.5).clip(0, 1)
    df["typing_focus"] = df["typingLatencyAvg"].apply(lambda x: 1.0 if 120 <= x <= 500 else 0.4)
    df["label"] = df.apply(label_row, axis=1)
    df.rename(columns={"mouseVelocity": "mouse_velocity", "clickIntervalAvg": "click_interval", "scrollBurstScore": "scroll_burst", "typingLatencyAvg": "typing_latency", "sessionDuration": "session_duration", "clickCount": "click_count"}, inplace=True)
    df.to_csv(OUTPUT, index=False)
    print(f"Labeled dataset written to {OUTPUT} with {len(df)} rows")


if __name__ == "__main__":
    label_behavior_dataset()
