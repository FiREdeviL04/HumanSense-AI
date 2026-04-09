export default function EmotionBadge({ label, confidence }) {
  const colorMap = {
    happy: "bg-lime/20 text-lime border-lime/60",
    sad: "bg-sky/20 text-sky border-sky/60",
    angry: "bg-coral/20 text-coral border-coral/60",
    stressed: "bg-amber/20 text-amber border-amber/60",
    neutral: "bg-slate-700/50 text-slate-100 border-slate-500"
  };

  const classes = colorMap[label] || colorMap.neutral;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${classes}`}>
      <span className="font-semibold capitalize">{label}</span>
      <span className="opacity-80">{Math.round((confidence || 0) * 100)}%</span>
    </div>
  );
}
