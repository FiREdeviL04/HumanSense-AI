export default function BehaviorHeatmap({ points = [] }) {
  return (
    <div className="panel p-4">
      <h4 className="font-semibold mb-3">Behavior Trajectory</h4>
      <div className="relative h-52 rounded-xl bg-slate-950 border border-slate-700 overflow-hidden">
        {points.map((point, index) => (
          <div
            key={`${point.ts}-${index}`}
            className="absolute w-2 h-2 rounded-full bg-sky/60"
            style={{ left: `${(point.x / window.innerWidth) * 100}%`, top: `${(point.y / window.innerHeight) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
