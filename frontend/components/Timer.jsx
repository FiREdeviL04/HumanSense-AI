import { motion } from "framer-motion";

export default function Timer({ remaining, progress, duration }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative w-36 h-36 grid place-items-center">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} className="stroke-slate-700/50" strokeWidth="10" fill="transparent" />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          strokeWidth="10"
          fill="transparent"
          className="stroke-cyan-300"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ ease: "easeOut", duration: 0.5 }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-display font-extrabold">{remaining}</p>
        <p className="text-xs text-slate-300">seconds</p>
      </div>
      <p className="absolute -bottom-7 text-xs text-slate-300">{Math.round(progress * 100)}% analyzed</p>
    </div>
  );
}
