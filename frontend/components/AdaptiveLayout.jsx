import { motion } from "framer-motion";

export default function AdaptiveLayout({ action, children }) {
  const simplify = action?.key === "simplify_ui" || action?.key === "guided_help";
  const reducedNoise = action?.key === "reduce_notifications";

  return (
    <motion.div
      animate={{
        paddingTop: simplify ? 36 : 16,
        filter: reducedNoise ? "saturate(0.85)" : "saturate(1)"
      }}
      transition={{ duration: 0.35 }}
      className={`mx-auto max-w-7xl ${simplify ? "space-y-4" : "space-y-6"}`}
    >
      <div className={`grid ${simplify ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-3"} gap-4`}>
        {children}
      </div>
    </motion.div>
  );
}
