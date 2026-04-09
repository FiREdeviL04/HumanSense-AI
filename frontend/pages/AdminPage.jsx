import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { fetchAnalytics, fetchBehaviorHeatmap, fetchLiveLogs } from "../services/api";
import { useWebSocketStatus } from "../hooks/useWebSocketStatus";
import BehaviorHeatmap from "../components/BehaviorHeatmap";
import { pushToast } from "../utils/toastBus";

const pieColors = ["#64d2ff", "#9be564", "#ff6b6b", "#ffbe0b", "#a8b3cf"];

function SkeletonCard() {
  return <div className="panel p-4 h-80 animate-pulse bg-slate-900/40" />;
}

export default function AdminPage() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const wsStatus = useWebSocketStatus({ reconnectMs: 1800 });

  const load = useCallback(async () => {
    try {
      setError("");
      const [summaryRes, logsRes, heatmapRes] = await Promise.all([
        fetchAnalytics(),
        fetchLiveLogs(),
        fetchBehaviorHeatmap(),
      ]);
      setSummary(summaryRes.data);
      setLogs(logsRes.data.logs || []);
      setHeatmapPoints(heatmapRes.data.points || summaryRes.data.behavior_heatmap || []);
      setLoading(false);
    } catch {
      setLoading(false);
      setError("Unable to load analytics right now. Please retry.");
      pushToast("Admin analytics request failed");
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      if (!active) {
        return;
      }
      await load();
    }

    init();
    const id = setInterval(() => {
      void load();
    }, 6000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [load]);

  const isEmpty = useMemo(
    () => !loading && !error && summary && (summary.emotion_distribution?.length || 0) === 0,
    [error, loading, summary]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="panel p-4">Loading analytics...</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-300">Analytics Error</p>
        <h3 className="text-2xl font-display font-bold mt-2">Dashboard unavailable</h3>
        <p className="text-slate-300 mt-2">{error}</p>
        <button onClick={() => void load()} className="mt-4 rounded-xl bg-cyan-400 text-slate-950 px-4 py-2 font-bold">
          Retry
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="glass-card p-6 text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">No Analytics Yet</p>
        <h3 className="text-2xl font-display font-bold mt-2">Waiting for session data</h3>
        <p className="text-slate-300 mt-2">Run at least one analysis session to populate admin insights.</p>
        <button onClick={() => void load()} className="mt-4 rounded-xl border border-slate-600 px-4 py-2">Refresh</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-3xl font-display font-extrabold">Admin Intelligence Dashboard</h2>
        <span className={`text-xs rounded-full px-3 py-1 border ${wsStatus === "connected" ? "border-emerald-400 text-emerald-300" : "border-amber-400 text-amber-300"}`}>
          WS: {wsStatus}
        </span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-4 h-80">
          <h3 className="font-semibold mb-2">Emotion Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie dataKey="value" data={summary.emotion_distribution} outerRadius={95} label>
                {summary.emotion_distribution.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="panel p-4 h-80">
          <h3 className="font-semibold mb-2">Intent Trend</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={summary.intent_timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="t" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="confusion" stroke="#ffbe0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="engagement" stroke="#9be564" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="exit_intent" stroke="#ff6b6b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel p-4">
        <h3 className="font-semibold mb-3">Latest Prediction Logs</h3>
        <div className="space-y-2 max-h-72 overflow-auto">
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-slate-700 p-3 text-sm bg-slate-900/50">
              <p>Time: {new Date(log.timestamp).toLocaleTimeString()}</p>
              <p>Emotion: {log.emotion} | Intent: {log.intent} | Action: {log.action}</p>
              <p className="text-slate-300">Session: {log?.metadata?.session_id || "-"} | Request: {log?.metadata?.request_id || "-"}</p>
              <p className="text-slate-300">Risk score: {Number(log.risk_score || 0).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <BehaviorHeatmap points={heatmapPoints} />
    </div>
  );
}
