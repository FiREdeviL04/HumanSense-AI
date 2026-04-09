import { lazy, Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, cardReveal, pageTransition } from "../animations/variants";
import ResultCard from "../components/ResultCard";

const Charts = lazy(() => import("../components/Charts"));

export default function Results({ result, onRetry, onOpenAdmin }) {
  const behavior = result?.behaviorScores || { confusion: 0, engagement: 0, exitProbability: 0 };

  const summaryText = useMemo(
    () => `${result.duration}s analyzed with ${result.observations.length} key observations captured.`,
    [result.duration, result.observations.length]
  );

  return (
    <motion.section
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.45 }}
      className="mx-auto max-w-6xl py-8 px-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Session Intelligence Report</p>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold mt-2">Dominant Emotion: <span className="text-cyan-300 capitalize">{result.dominantEmotion}</span></h2>
          <p className="text-slate-300 mt-3">{result.recommendation}</p>
        </div>

        <div className="flex gap-2">
          <button onClick={onOpenAdmin} className="rounded-xl border border-slate-600 px-4 py-2 text-sm hover:border-cyan-300">Admin Analytics</button>
          <button onClick={onRetry} className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 px-4 py-2 text-sm font-bold">Retry Analysis</button>
        </div>
      </div>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <ResultCard title="Confusion Level" value={`${Math.round(behavior.confusion * 100)}%`} hint="Interaction uncertainty estimate." accent="from-amber-300 to-rose-400" />
        <ResultCard title="Engagement Score" value={`${Math.round(behavior.engagement * 100)}%`} hint="Attention and focus estimate." accent="from-emerald-300 to-cyan-400" />
        <ResultCard title="Exit Probability" value={`${Math.round(behavior.exitProbability * 100)}%`} hint="Likelihood of session drop-off." accent="from-violet-400 to-cyan-400" />
      </motion.div>

      <motion.div variants={cardReveal} initial="initial" animate="animate" className="mt-5">
        <Suspense fallback={<div className="glass-card p-6 h-72 animate-pulse text-slate-400">Loading AI charts...</div>}>
          <Charts emotionDistribution={result.emotionDistribution} behaviorScores={behavior} />
        </Suspense>
      </motion.div>

      <motion.div variants={cardReveal} initial="initial" animate="animate" className="glass-card p-5 mt-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Session Summary</p>
        <p className="text-slate-200 mt-2">{summaryText}</p>
        <ul className="mt-3 space-y-1 text-sm text-slate-300">
          {result.observations.map((item, index) => (
            <li key={`${item}-${index}`}>• {item}</li>
          ))}
        </ul>
      </motion.div>
    </motion.section>
  );
}
