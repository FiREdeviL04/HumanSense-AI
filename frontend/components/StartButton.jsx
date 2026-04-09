import { motion } from "framer-motion";

export default function StartButton({ onClick, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      animate={{ boxShadow: ["0 0 10px rgba(34,211,238,0.35)", "0 0 34px rgba(167,139,250,0.55)", "0 0 10px rgba(34,211,238,0.35)"] }}
      transition={{ duration: 2.6, repeat: Infinity }}
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl px-7 py-3 bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 text-slate-950 font-bold disabled:opacity-50"
    >
      Start Analysis
    </motion.button>
  );
}
