import { motion } from "framer-motion";
import { cardReveal } from "../animations/variants";

export default function ResultCard({ title, value, hint, accent = "from-cyan-400 to-violet-500" }) {
  return (
    <motion.article variants={cardReveal} className="glass-card p-5 relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-display font-bold text-slate-100">{value}</p>
      <p className="mt-1 text-sm text-slate-300">{hint}</p>
    </motion.article>
  );
}
