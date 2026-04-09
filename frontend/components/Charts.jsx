import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { motion } from "framer-motion";
import { cardReveal } from "../animations/variants";

const colors = ["#22d3ee", "#38bdf8", "#a78bfa", "#fb7185", "#fbbf24"];

export default function Charts({ emotionDistribution, behaviorScores }) {
  const radarData = [
    { metric: "Confusion", value: Math.round((behaviorScores.confusion || 0) * 100) },
    { metric: "Engagement", value: Math.round((behaviorScores.engagement || 0) * 100) },
    { metric: "Exit", value: Math.round((behaviorScores.exitProbability || 0) * 100) },
  ];

  return (
    <motion.div variants={cardReveal} className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="glass-card p-4 h-72">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">Emotion Distribution</p>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie data={emotionDistribution} dataKey="value" nameKey="name" innerRadius={45} outerRadius={88} label>
              {emotionDistribution.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-4 h-72">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-2">Behavior Insights</p>
        <ResponsiveContainer width="100%" height="90%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="metric" stroke="#cbd5e1" />
            <PolarRadiusAxis angle={20} domain={[0, 100]} stroke="#94a3b8" />
            <Radar dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
