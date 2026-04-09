import { lazy, Suspense, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";

const Results = lazy(() => import("./pages/Results"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

export default function App() {
  const [stage, setStage] = useState("home");
  const [sessionResult, setSessionResult] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startSession = useCallback(() => {
    setStage("analysis");
  }, []);

  const completeSession = useCallback((result) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSessionResult(result);
      setStage("results");
      setIsTransitioning(false);
    }, 650);
  }, []);

  const retrySession = useCallback(() => {
    setSessionResult(null);
    setStage("analysis");
  }, []);

  return (
    <main className="min-h-screen px-3 py-4 md:px-8 lg:px-12 futuristic-bg">
      <div className="mx-auto max-w-7xl">
        <header className="flex justify-between items-center mb-4">
          <button
            onClick={() => setStage("home")}
            className="text-sm rounded-xl border border-slate-700 px-3 py-2 hover:border-cyan-300"
          >
            Home
          </button>
          <button
            onClick={() => setStage("admin")}
            className="text-sm rounded-xl border border-slate-700 px-3 py-2 hover:border-cyan-300"
          >
            Admin Analytics
          </button>
        </header>

        {isTransitioning ? (
          <div className="glass-card p-6 text-center text-slate-300">Preparing premium insights...</div>
        ) : null}

        <AnimatePresence mode="wait">
          {stage === "home" && <Home key="home" onStart={startSession} />}

          {stage === "analysis" && <Analysis key="analysis" onComplete={completeSession} duration={15} />}

          {stage === "results" && sessionResult && (
            <Suspense key="results" fallback={<div className="glass-card p-6 animate-pulse">Rendering result dashboard...</div>}>
              <Results result={sessionResult} onRetry={retrySession} onOpenAdmin={() => setStage("admin")} />
            </Suspense>
          )}

          {stage === "admin" && (
            <Suspense key="admin" fallback={<div className="glass-card p-6 animate-pulse">Loading admin intelligence...</div>}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <AdminPage />
              </motion.div>
            </Suspense>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
