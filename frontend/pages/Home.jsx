import { motion } from "framer-motion";
import StartButton from "../components/StartButton";
import { pageTransition } from "../animations/variants";

export default function Home({ onStart }) {
  return (
    <motion.section
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.45 }}
      className="mx-auto max-w-4xl text-center py-14 px-4"
    >
      <p className="text-xs tracking-[0.45em] uppercase text-cyan-300 mb-4">HumanSense AI</p>
      <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-tight">
        Real-Time Emotion and Intent Intelligence
      </h1>
      <p className="mt-5 text-slate-300 text-base md:text-lg max-w-2xl mx-auto">
        Start a controlled 15-second AI analysis. The system reads emotional cues and interaction behavior,
        then reveals actionable recommendations in a premium insight report.
      </p>

      <div className="mt-10 flex justify-center">
        <StartButton onClick={onStart} />
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
        <div className="glass-card p-4">
          <p className="text-xs tracking-[0.2em] uppercase text-slate-400">Step 1</p>
          <p className="font-semibold mt-1">Start Analysis</p>
          <p className="text-sm text-slate-300 mt-1">Activate webcam and behavior capture.</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs tracking-[0.2em] uppercase text-slate-400">Step 2</p>
          <p className="font-semibold mt-1">Live AI Scan</p>
          <p className="text-sm text-slate-300 mt-1">Emotion and intent signals update in real-time.</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs tracking-[0.2em] uppercase text-slate-400">Step 3</p>
          <p className="font-semibold mt-1">Result Intelligence</p>
          <p className="text-sm text-slate-300 mt-1">See dominant emotion, behavior scores, and guidance.</p>
        </div>
      </div>
    </motion.section>
  );
}
