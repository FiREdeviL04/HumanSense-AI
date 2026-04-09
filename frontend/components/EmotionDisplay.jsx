import { motion, AnimatePresence } from "framer-motion";

const styleMap = {
  happy: "text-emerald-300",
  sad: "text-sky-300",
  angry: "text-rose-300",
  stressed: "text-amber-300",
  neutral: "text-slate-200",
};

export default function EmotionDisplay({ emotion }) {
  const label = emotion?.label || "neutral";
  const confidence = Math.round((emotion?.confidence || 0) * 100);

  return (
    <div className="glass-card p-4 min-w-[220px]">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Live Emotion</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`text-3xl font-display font-extrabold capitalize ${styleMap[label] || styleMap.neutral}`}
        >
          {label}
        </motion.div>
      </AnimatePresence>
      <p className="text-xs text-slate-400 mt-1">Confidence: {confidence}%</p>
    </div>
  );
}
