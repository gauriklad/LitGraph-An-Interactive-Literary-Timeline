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
      <div className="radar-placeholder">
        <p>Enter text above to see your literary footprint.</p>
      </div>
    );
  }

  const user = result.user || {
    vocab: 0,
    complexity: 0,
    pacing: 0,
    abstraction: 0
  };

  const matchStats = result.match.dnastats || {
    vocab: 0,
    complexity: 0,
    pacing: 0,
    abstraction: 0
  };

  const data = [
    { metric: "Vocabulary", user: user.vocab, author: matchStats.vocab, fullMark: 100 },
    { metric: "Complexity", user: user.complexity, author: matchStats.complexity, fullMark: 100 },
    { metric: "Pacing", user: user.pacing, author: matchStats.pacing, fullMark: 100 },
    { metric: "Abstraction", user: user.abstraction, author: matchStats.abstraction, fullMark: 100 }
  ];

  return (
    <div className="radar-container">
      <h3 className="radar-title">
        Match: <span>{result.match.name}</span>
      </h3>

      <p className="radar-score">
        Similarity Score: <strong>{result.score}%</strong>
      </p>

      <div className="radar-chart-wrapper">
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
            <Radar
              name="You"
              dataKey="user"
              stroke="#8b5cf6"
              strokeWidth={3}
              fill="#8b5cf6"
              fillOpacity={0.5}
            />
            <Radar
              name={result.match.name}
              dataKey="author"
              stroke="#94a3b8"
              strokeWidth={2}
              fill="#94a3b8"
              fillOpacity={0.2}
              strokeDasharray="5 5"
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
