const listeners = new Set();

export function subscribeToast(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pushToast(message, level = "info") {
  listeners.forEach((listener) => listener({ id: `${Date.now()}-${Math.random()}`, message, level }));
}
