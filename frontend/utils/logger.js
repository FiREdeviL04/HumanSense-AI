export function logError(scope, error, meta = {}) {
  // eslint-disable-next-line no-console
  console.error(`[${scope}]`, error, meta);
}

export function logPerf(scope, elapsedMs, meta = {}) {
  // eslint-disable-next-line no-console
  console.info(`[perf:${scope}] ${elapsedMs.toFixed(2)}ms`, meta);
}
