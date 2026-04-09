import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useTimer({ duration = 15, onComplete, autoStart = false } = {}) {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setIsRunning(false);
          completeRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  const start = useCallback(() => {
    setRemaining(duration);
    setIsRunning(true);
  }, [duration]);

  const stop = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setRemaining(duration);
  }, [duration]);

  const progress = useMemo(() => (duration - remaining) / duration, [duration, remaining]);

  return { remaining, isRunning, progress, start, stop, reset, duration };
}
