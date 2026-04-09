import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import EmotionBadge from "../components/EmotionBadge";
import IntentBadge from "../components/IntentBadge";
import AdaptiveLayout from "../components/AdaptiveLayout";
import GuidedHelpPopup from "../components/GuidedHelpPopup";
import BehaviorHeatmap from "../components/BehaviorHeatmap";
import { useBehaviorTracking } from "../hooks/useBehaviorTracking";
import { useRealtimeAI } from "../hooks/useRealtimeAI";
import { useWebcamEmotion } from "../hooks/useWebcamEmotion";

export default function DashboardPage() {
  const [inputText, setInputText] = useState("");
  const behaviorSnapshot = useBehaviorTracking();
  const { videoRef, emotion, error: webcamError } = useWebcamEmotion();
  const ai = useRealtimeAI({ behaviorSnapshot, webcamEmotion: emotion });

  const statusText = useMemo(() => {
    if (ai.action.key === "guided_help") {
      return "System detected stress + confusion. Guided experience activated.";
    }
    if (ai.action.key === "retention_popup") {
      return "Exit intent detected. Retention flow enabled.";
    }
    return "Adaptive intelligence active.";
  }, [ai.action.key]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-extrabold">HumanSense AI Control Surface</h1>
        <p className="text-slate-300">{statusText}</p>
      </header>

      <div className="panel p-4 flex flex-wrap items-center gap-3">
        <EmotionBadge label={emotion.label} confidence={emotion.confidence} />
        <EmotionBadge label={ai.textEmotion.label} confidence={ai.textEmotion.confidence} />
        <IntentBadge label={ai.intent.label} confidence={ai.intent.confidence} />
        <span className="ml-auto text-xs text-slate-300">Fusion risk score: {ai.fusion.risk.toFixed(2)}</span>
      </div>

      <AdaptiveLayout action={ai.action}>
        <motion.section className="metric-card space-y-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-semibold">Webcam Emotion Stream</h2>
          <video ref={videoRef} className="rounded-xl border border-slate-700 w-full max-h-64 object-cover" muted playsInline />
          {webcamError && <p className="text-amber text-sm">{webcamError}</p>}
        </motion.section>

        <motion.section className="metric-card space-y-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-semibold">Text Emotion Probe</h2>
          <textarea
            className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 min-h-32"
            placeholder="Type a message so the transformer text emotion model can infer tone"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
          />
          <button
            className="rounded-lg bg-sky text-ink px-4 py-2 font-semibold hover:brightness-110"
            onClick={() => ai.analyzeInputText(inputText)}
          >
            Analyze text emotion
          </button>
        </motion.section>

        <motion.section className="metric-card space-y-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-semibold">Live Behavior Features</h2>
          <p className="text-sm">Mouse velocity: {behaviorSnapshot.mouseVelocity.toFixed(3)}</p>
          <p className="text-sm">Click interval avg (ms): {behaviorSnapshot.clickIntervalAvg.toFixed(1)}</p>
          <p className="text-sm">Scroll burst score: {behaviorSnapshot.scrollBurstScore.toFixed(2)}</p>
          <p className="text-sm">Typing latency avg (ms): {behaviorSnapshot.typingLatencyAvg.toFixed(1)}</p>
          <p className="text-sm">Session duration: {Math.floor(behaviorSnapshot.sessionDuration)}s</p>
        </motion.section>

        <BehaviorHeatmap points={behaviorSnapshot.trail} />
      </AdaptiveLayout>

      <GuidedHelpPopup action={ai.action} />
    </div>
  );
}
