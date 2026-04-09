import random


class QLearningAdapter:
    def __init__(self, alpha=0.1, gamma=0.9, epsilon=0.1):
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.q = {}
        self.actions = ["none", "guided_help", "retention_popup", "simplify_ui", "reduce_notifications"]

    def _key(self, state: dict) -> tuple:
        return (state.get("emotion", "neutral"), state.get("intent", "idle"), round(state.get("risk", 0.0), 1))

    def choose_action(self, state: dict) -> str:
        key = self._key(state)
        if random.random() < self.epsilon or key not in self.q:
            return random.choice(self.actions)
        return max(self.q[key], key=self.q[key].get)

    def update(self, state: dict, action: str, reward: float, next_state: dict):
        s = self._key(state)
        ns = self._key(next_state)

        self.q.setdefault(s, {a: 0.0 for a in self.actions})
        self.q.setdefault(ns, {a: 0.0 for a in self.actions})

        current_q = self.q[s][action]
        best_next = max(self.q[ns].values())
        self.q[s][action] = current_q + self.alpha * (reward + self.gamma * best_next - current_q)
