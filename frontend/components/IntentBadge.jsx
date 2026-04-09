export default function IntentBadge({ label, confidence }) {
  const palette = {
    confusion: "bg-amber/20 text-amber border-amber/50",
    exit_intent: "bg-coral/20 text-coral border-coral/50",
    engagement: "bg-lime/20 text-lime border-lime/50",
    idle: "bg-slate-700/40 text-slate-100 border-slate-500"
  };

  const classes = palette[label] || palette.idle;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${classes}`}>
      <span className="font-semibold">{label.replace("_", " ")}</span>
      <span>{Math.round((confidence || 0) * 100)}%</span>
    </div>
  );
}
