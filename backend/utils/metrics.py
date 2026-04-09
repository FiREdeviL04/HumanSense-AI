from collections import deque, defaultdict
from statistics import median
from typing import Deque


class MetricsStore:
    def __init__(self):
        self.api_latencies: dict[str, Deque[float]] = defaultdict(lambda: deque(maxlen=5000))
        self.inference_latencies: dict[str, Deque[float]] = defaultdict(lambda: deque(maxlen=5000))
        self.db_latencies: Deque[float] = deque(maxlen=5000)
        self.error_count: int = 0
        self.request_count: int = 0
        self.active_sessions: int = 0

    def observe_api(self, route: str, elapsed_ms: float) -> None:
        self.request_count += 1
        self.api_latencies[route].append(elapsed_ms)

    def observe_inference(self, operation: str, elapsed_ms: float) -> None:
        self.inference_latencies[operation].append(elapsed_ms)

    def observe_db(self, elapsed_ms: float) -> None:
        self.db_latencies.append(elapsed_ms)

    def observe_error(self) -> None:
        self.error_count += 1

    def inc_sessions(self) -> None:
        self.active_sessions += 1

    def dec_sessions(self) -> None:
        self.active_sessions = max(0, self.active_sessions - 1)


metrics_store = MetricsStore()


def _percentile(values: list[float], pct: float) -> float:
    if not values:
        return 0.0
    index = int((len(values) - 1) * pct)
    return float(sorted(values)[index])


def summarize_latencies(values: list[float]) -> dict:
    if not values:
        return {"p50": 0.0, "p95": 0.0, "p99": 0.0}
    return {
        "p50": round(_percentile(values, 0.50), 2),
        "p95": round(_percentile(values, 0.95), 2),
        "p99": round(_percentile(values, 0.99), 2),
    }


def get_metrics_snapshot(circuit_state: str, queue_depth: dict[str, int]) -> dict:
    all_api = [value for queue in metrics_store.api_latencies.values() for value in queue]
    all_inference = [value for queue in metrics_store.inference_latencies.values() for value in queue]
    db_lat = list(metrics_store.db_latencies)

    error_rate = 0.0
    if metrics_store.request_count:
        error_rate = metrics_store.error_count / metrics_store.request_count

    return {
        "circuit_breaker_state": circuit_state,
        "queue_depth": queue_depth,
        "api_latency_ms": summarize_latencies(all_api),
        "inference_latency_ms": summarize_latencies(all_inference),
        "db_latency_ms": summarize_latencies(db_lat),
        "error_rate": round(error_rate, 4),
        "active_sessions": metrics_store.active_sessions,
        "request_count": metrics_store.request_count,
        "error_count": metrics_store.error_count,
    }
