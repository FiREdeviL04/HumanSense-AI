function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now()}${Math.random().toString(16).slice(2)}`;
}

const SESSION_KEY = "humansense_session_id";

export function getSessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }
  const id = randomId();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

export function createRequestId() {
  return randomId();
}
