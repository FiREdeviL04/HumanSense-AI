import time
from dataclasses import dataclass
from enum import Enum


class BreakerState(str, Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


@dataclass
class CircuitBreakerConfig:
    failure_threshold: int = 3
    recovery_timeout_sec: float = 12.0
    half_open_max_calls: int = 2


class CircuitBreaker:
    def __init__(self, config: CircuitBreakerConfig | None = None):
        self.config = config or CircuitBreakerConfig()
        self.state: BreakerState = BreakerState.CLOSED
        self.failure_count = 0
        self.last_failure_at = 0.0
        self.half_open_calls = 0

    def _now(self) -> float:
        return time.monotonic()

    def allow_request(self) -> bool:
        if self.state == BreakerState.CLOSED:
            return True

        if self.state == BreakerState.OPEN:
            elapsed = self._now() - self.last_failure_at
            if elapsed >= self.config.recovery_timeout_sec:
                self.state = BreakerState.HALF_OPEN
                self.half_open_calls = 0
                return True
            return False

        if self.state == BreakerState.HALF_OPEN:
            if self.half_open_calls < self.config.half_open_max_calls:
                self.half_open_calls += 1
                return True
            return False

        return True

    def record_success(self) -> None:
        self.failure_count = 0
        self.half_open_calls = 0
        self.state = BreakerState.CLOSED

    def record_failure(self) -> None:
        self.failure_count += 1
        self.last_failure_at = self._now()

        if self.state == BreakerState.HALF_OPEN:
            self.state = BreakerState.OPEN
            return

        if self.failure_count >= self.config.failure_threshold:
            self.state = BreakerState.OPEN
