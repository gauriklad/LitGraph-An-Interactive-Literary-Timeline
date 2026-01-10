import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function RadarChartView({ result }) {
  if (!result || !result.match) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
        <p>Enter text above to see your literary footprint.</p>
      </div>
    );
  }

  // Ensure data exists, fallback to 0 if missing
  const user = result.user || { vocab: 0, complexity: 0, pacing: 0, abstraction: 0 };
  const matchStats = result.match.dnastats || { vocab: 0, complexity: 0, pacing: 0, abstraction: 0 };

  const data = [
    { metric: "Vocabulary", user: user.vocab, author: matchStats.vocab, fullMark: 100 },
    { metric: "Complexity", user: user.complexity, author: matchStats.complexity, fullMark: 100 },
    { metric: "Pacing", user: user.pacing, author: matchStats.pacing, fullMark: 100 },
    { metric: "Abstraction", user: user.abstraction, author: matchStats.abstraction, fullMark: 100 }
  ];

  return (
    <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
      <h3 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>
        Match: <span style={{ color: "#3b82f6" }}>{result.match.name}</span>
      </h3>
      <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: "0.9rem" }}>
        Similarity Score: <strong>{result.score}%</strong>
      </p>
      
      <div style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#cbd5e1" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
            <Radar name="You" dataKey="user" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.5} />
            <Radar name={result.match.name} dataKey="author" stroke="#94a3b8" strokeWidth={2} fill="#94a3b8" fillOpacity={0.2} strokeDasharray="5 5" />
            <Legend wrapperStyle={{ paddingTop: "10px" }}/>
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}