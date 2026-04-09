import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { subscribeToast } from "../utils/toastBus";

export default function ToastViewport() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToast((toast) => {
      setToasts((prev) => [...prev, toast].slice(-4));
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 3200);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-[320px] max-w-[90vw]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass-card p-3 text-sm"
          >
            <p className="text-slate-100">{toast.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
