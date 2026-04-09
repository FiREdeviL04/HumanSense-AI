import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const SESSION_STATE = {
  IDLE: "IDLE",
  STARTING: "STARTING",
  ANALYZING: "ANALYZING",
  STOPPING: "STOPPING",
  RESULTS: "RESULTS",
};

export function useAnalysisSession({
  duration = 15,
  startTimeoutMs = 4000,
  onStartResources,
  onStopResources,
  onBuildResult,
  onResult,
} = {}) {
  const [state, setState] = useState(SESSION_STATE.IDLE);
  const [remaining, setRemaining] = useState(duration);
  const [error, setError] = useState("");

  const activeSessionRef = useRef(false);
  const intervalRef = useRef(null);
  const resultRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const hardCleanup = useCallback(async () => {
    clearTimer();
    try {
      await onStopResources?.();
    } catch {
      // Ignore cleanup failures to avoid deadlocking session transitions.
    }
    activeSessionRef.current = false;
  }, [clearTimer, onStopResources]);

  const startSession = useCallback(() => {
    if (activeSessionRef.current || state === SESSION_STATE.STARTING || state === SESSION_STATE.ANALYZING || state === SESSION_STATE.STOPPING) {
      return;
    }
    activeSessionRef.current = true;
    setError("");
    resultRef.current = null;
    setRemaining(duration);
    setState(SESSION_STATE.STARTING);
  }, [duration, state]);

  const stopSession = useCallback(() => {
    if (!activeSessionRef.current || state === SESSION_STATE.STOPPING || state === SESSION_STATE.RESULTS) {
      return;
    }
    setState(SESSION_STATE.STOPPING);
  }, [state]);

  const abortSession = useCallback(() => {
    clearTimer();
    activeSessionRef.current = false;
    setRemaining(duration);
    setState(SESSION_STATE.IDLE);

    Promise.resolve(onStopResources?.()).catch(() => {
      // Ignore cleanup failures during abort/reset paths.
    });
  }, [clearTimer, duration, onStopResources]);

  const resetSession = useCallback(() => {
    abortSession();
  }, [abortSession]);

  useEffect(() => {
    if (state !== SESSION_STATE.STARTING) {
      return;
    }

    let cancelled = false;

    const startupWithTimeout = async () => {
      if (!onStartResources) {
        return;
      }

      await Promise.race([
        onStartResources(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("start-timeout")), startTimeoutMs);
        }),
      ]);
    };

    async function boot() {
      try {
        await startupWithTimeout();
        if (cancelled) {
          return;
        }
        setState(SESSION_STATE.ANALYZING);
      } catch {
        if (!cancelled) {
          // Keep session timer-driven even when resource startup fails/hangs.
          setError("Camera initialization delayed. Running timer-only analysis.");
          setState(SESSION_STATE.ANALYZING);
        }
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [onStartResources, startTimeoutMs, state]);

  useEffect(() => {
    if (state !== SESSION_STATE.STARTING && state !== SESSION_STATE.ANALYZING) {
      clearTimer();
      return;
    }

    if (intervalRef.current) {
      clearTimer();
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          setState(SESSION_STATE.STOPPING);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimer();
  }, [clearTimer, state]);

  useEffect(() => {
    if (state !== SESSION_STATE.STOPPING) {
      return;
    }

    let cancelled = false;

    async function finalize() {
      await hardCleanup();

      if (cancelled) {
        return;
      }

      const result = await onBuildResult?.();
      resultRef.current = result || null;
      onResult?.(resultRef.current);
      setState(SESSION_STATE.RESULTS);
    }

    finalize();
    return () => {
      cancelled = true;
    };
  }, [hardCleanup, onBuildResult, onResult, state]);

  useEffect(() => {
    return () => {
      void hardCleanup();
    };
  }, [hardCleanup]);

  const progress = useMemo(() => (duration - remaining) / duration, [duration, remaining]);

  return {
    state,
    remaining,
    progress,
    error,
    isAnalyzing: state === SESSION_STATE.ANALYZING,
    result: resultRef.current,
    startSession,
    stopSession,
    abortSession,
    resetSession,
  };
}
