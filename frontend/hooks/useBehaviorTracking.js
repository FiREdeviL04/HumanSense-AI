import { useEffect, useRef, useState } from "react";

const MAX_TRAIL_POINTS = 120;

const now = () => performance.now();

export function useBehaviorTracking({ active = true, sampleMs = 1000, debounceMs = 80 } = {}) {
  const [snapshot, setSnapshot] = useState({
    mouseVelocity: 0,
    clickIntervalAvg: 0,
    scrollBurstScore: 0,
    typingLatencyAvg: 0,
    sessionDuration: 0,
    clickCount: 0,
    trail: []
  });

  const state = useRef({
    lastMouse: null,
    lastMoveAt: now(),
    velocities: [],
    clicks: [],
    scrolls: [],
    keydowns: [],
    sessionStart: Date.now(),
    trail: [],
    lastMouseEventAt: 0,
    lastScrollEventAt: 0,
    lastKeyEventAt: 0,
  });

  useEffect(() => {
    if (!active) {
      return;
    }

    state.current.sessionStart = Date.now();

    const onMouseMove = (event) => {
      if (event.timeStamp - state.current.lastMouseEventAt < debounceMs) {
        return;
      }
      state.current.lastMouseEventAt = event.timeStamp;

      const t = now();
      const point = { x: event.clientX, y: event.clientY, t };
      const last = state.current.lastMouse;

      if (last) {
        const dx = point.x - last.x;
        const dy = point.y - last.y;
        const dt = Math.max(1, point.t - last.t);
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;
        state.current.velocities.push(speed);
      }

      state.current.trail.push({ x: point.x, y: point.y, ts: Date.now() });
      if (state.current.trail.length > MAX_TRAIL_POINTS) {
        state.current.trail.shift();
      }

      state.current.lastMouse = point;
      state.current.lastMoveAt = t;
    };

    const onClick = () => {
      state.current.clicks.push(now());
      if (state.current.clicks.length > 120) {
        state.current.clicks.shift();
      }
    };

    const onScroll = () => {
      const t = now();
      if (t - state.current.lastScrollEventAt < debounceMs) {
        return;
      }
      state.current.lastScrollEventAt = t;
      state.current.scrolls.push(now());
      if (state.current.scrolls.length > 200) {
        state.current.scrolls.shift();
      }
    };

    const onKeyDown = () => {
      const t = now();
      if (t - state.current.lastKeyEventAt < debounceMs) {
        return;
      }
      state.current.lastKeyEventAt = t;
      state.current.keydowns.push(now());
      if (state.current.keydowns.length > 200) {
        state.current.keydowns.shift();
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown, { passive: true });

    const id = setInterval(() => {
      const velocities = state.current.velocities.slice(-50);
      const clicks = state.current.clicks.slice(-60);
      const scrolls = state.current.scrolls.slice(-100);
      const keydowns = state.current.keydowns.slice(-100);
      const currentNow = now();

      const mouseVelocity = velocities.length
        ? velocities.reduce((sum, value) => sum + value, 0) / velocities.length
        : 0;

      const clickIntervals = clicks.slice(1).map((value, index) => value - clicks[index]);
      const clickIntervalAvg = clickIntervals.length
        ? clickIntervals.reduce((sum, value) => sum + value, 0) / clickIntervals.length
        : 0;

      const scrollRecent = scrolls.filter((t) => currentNow - t < 2500).length;
      const scrollBurstScore = Math.min(1, scrollRecent / 20);

      const typingIntervals = keydowns.slice(1).map((value, index) => value - keydowns[index]);
      const typingLatencyAvg = typingIntervals.length
        ? typingIntervals.reduce((sum, value) => sum + value, 0) / typingIntervals.length
        : 0;

      setSnapshot({
        mouseVelocity,
        clickIntervalAvg,
        scrollBurstScore,
        typingLatencyAvg,
        sessionDuration: (Date.now() - state.current.sessionStart) / 1000,
        clickCount: clicks.length,
        trail: [...state.current.trail]
      });
    }, sampleMs);

    return () => {
      clearInterval(id);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, debounceMs, sampleMs]);

  return snapshot;
}
