import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { analyzeFrameEmotion } from "../services/api";
import { useWebcam } from "../hooks/useWebcam";
import { useBehaviorTracking } from "../hooks/useBehaviorTracking";
import { useRealtimeAI } from "../hooks/useRealtimeAI";
import { useAnalysisSession, SESSION_STATE } from "../hooks/useAnalysisSession";
import EmotionDisplay from "../components/EmotionDisplay";
import Timer from "../components/Timer";
import { pageTransition } from "../animations/variants";
import { summarizeSession } from "../utils/sessionAnalytics";

export default function Analysis({ onComplete, duration = 15 }) {
  const { videoRef, isRunning, error, start, stop, captureFrameBase64 } = useWebcam();
  const [liveEmotion, setLiveEmotion] = useState({ label: "neutral", confidence: 0, source: "session" });
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [behaviorHistory, setBehaviorHistory] = useState([]);
  const [status, setStatus] = useState("Preparing AI modules...");

  const latestIntentRef = useRef("idle");
  const latestActionRef = useRef("none");

  const inferenceLock = useRef(false);
  const frameIntervalRef = useRef(null);
  const behaviorCollectRef = useRef(null);

  const session = useAnalysisSession({
    duration,
    onStartResources: useCallback(async () => {
      setStatus("Preparing AI modules...");
      setEmotionHistory([]);
      setBehaviorHistory([]);
      setLiveEmotion({ label: "neutral", confidence: 0, source: "session" });
      await start();
      setStatus("AI is analyzing...");
    }, [start]),
    onStopResources: useCallback(async () => {
      stop();
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      if (behaviorCollectRef.current) {
        clearInterval(behaviorCollectRef.current);
        behaviorCollectRef.current = null;
      }
    }, [stop]),
    onBuildResult: useCallback(async () => {
      setStatus("Finalizing session intelligence...");
      return summarizeSession({
        emotionHistory,
        behaviorHistory,
        latestIntent: latestIntentRef.current,
        latestAction: latestActionRef.current,
        duration,
      });
    }, [behaviorHistory, duration, emotionHistory]),
    onResult: onComplete,
  });

  const isAnalyzing = session.state === SESSION_STATE.ANALYZING;
  const behaviorSnapshot = useBehaviorTracking({ active: isAnalyzing, sampleMs: 500, debounceMs: 80 });
  const realtime = useRealtimeAI({
    behaviorSnapshot,
    webcamEmotion: liveEmotion,
    isActive: isAnalyzing,
    sendIntervalMs: 1100,
  });

  useEffect(() => {
    latestIntentRef.current = realtime.intent.label;
    latestActionRef.current = realtime.action.key;
  }, [realtime.action.key, realtime.intent.label]);

  useEffect(() => {
    session.startSession();
    return () => {
      session.abortSession();
    };
  }, []);

  useEffect(() => {
    if (!isAnalyzing || !isRunning) {
      return;
    }

    frameIntervalRef.current = setInterval(async () => {
      if (inferenceLock.current) {
        return;
      }

      const frame = captureFrameBase64();
      if (!frame) {
        return;
      }

      inferenceLock.current = true;
      try {
        const response = await analyzeFrameEmotion(frame);
        const emotion = response.data;
        setLiveEmotion(emotion);
        setEmotionHistory((prev) => [...prev.slice(-80), emotion]);
      } finally {
        inferenceLock.current = false;
      }
    }, 1300);

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, [captureFrameBase64, isAnalyzing, isRunning]);

  useEffect(() => {
    if (!isAnalyzing) {
      return;
    }

    behaviorCollectRef.current = setInterval(() => {
      setBehaviorHistory((prev) => [...prev.slice(-80), behaviorSnapshot]);
    }, 1000);

    return () => {
      if (behaviorCollectRef.current) {
        clearInterval(behaviorCollectRef.current);
        behaviorCollectRef.current = null;
      }
    };
  }, [behaviorSnapshot, isAnalyzing]);

  const distractionFreeClass = useMemo(
    () => (realtime.action.key === "guided_help" || realtime.action.key === "simplify_ui" ? "opacity-95" : "opacity-100"),
    [realtime.action.key]
  );

  return (
    <motion.section
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.45 }}
      className={`mx-auto max-w-6xl py-8 px-4 ${distractionFreeClass}`}
    >
      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Live Analysis Session</p>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold">AI Focus Mode Active</h2>
          <p className="text-slate-300">{status}</p>
          <div className="ai-dot mt-2">
            <span className="ai-dot-pulse" />
            <span>AI is analyzing...</span>
          </div>
        </div>

        <Timer remaining={session.remaining} progress={session.progress} duration={duration} />
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
        <div className="glass-card p-4 md:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Webcam Stream</p>
          <video ref={videoRef} muted playsInline className="w-full rounded-2xl border border-slate-700/70 min-h-64 bg-slate-900 object-cover" />
          {error ? <p className="text-rose-300 text-sm mt-2">{error}</p> : null}
        </div>

        <div className="space-y-4">
          <EmotionDisplay emotion={liveEmotion} />
          <div className="glass-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Intent Prediction</p>
            <p className="text-2xl font-display font-bold mt-2 capitalize">{realtime.intent.label.replace("_", " ")}</p>
            <p className="text-sm text-slate-300">Confidence: {Math.round((realtime.intent.confidence || 0) * 100)}%</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Adaptive Action</p>
            <p className="text-sm text-slate-200 mt-2">{realtime.action.message}</p>
            <p className="text-xs text-slate-400 mt-2">WS: {realtime.connectionState} | Session: {realtime.sessionId.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {session.error ? <p className="text-rose-300 text-sm mt-4">{session.error}</p> : null}
    </motion.section>
  );
}
