import { AnimatePresence, motion } from "framer-motion";

export default function GuidedHelpPopup({ action }) {
  const show = action?.key === "guided_help" || action?.key === "retention_popup";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          className="fixed bottom-8 right-8 max-w-sm panel p-5 z-40"
        >
          <h3 className="text-lg font-display font-extrabold">Smart Assist</h3>
          <p className="text-sm text-slate-200 mt-2">{action.message}</p>
          <button className="mt-4 rounded-lg bg-sky text-ink px-4 py-2 font-semibold hover:brightness-110">
            Open guided flow
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
