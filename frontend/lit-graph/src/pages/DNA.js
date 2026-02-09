import { useState } from "react";
import { Fingerprint } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend
} from "recharts";
import "../ui/DNA.css";

export default function DNA() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/dna/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Backend not available. Please start the server.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare radar chart data
  const getRadarData = () => {
    if (!result || !result.match) return [];

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

    return [
      { metric: "Vocabulary", user: user.vocab, author: matchStats.vocab, fullMark: 100 },
      { metric: "Complexity", user: user.complexity, author: matchStats.complexity, fullMark: 100 },
      { metric: "Pacing", user: user.pacing, author: matchStats.pacing, fullMark: 100 },
      { metric: "Abstraction", user: user.abstraction, author: matchStats.abstraction, fullMark: 100 }
    ];
  };

  return (
    <div className="dna-page">
      {/* Header Badge */}
      <div className="dna-container">
        <Fingerprint size={16} />
        <span>DNA — Stylistic Identity</span>
      </div>

      {/* Main Title */}
      <h1 className="dna-title">Literary DNA</h1>
      <p className="dna-subtitle">
        Discover your literary fingerprint. Our stylometric analysis compares your
        writing style to the great authors of history.
      </p>

      {/* Main Content Grid */}
      <div className="dna-grid">
        {/* Left Side - Input */}
        <div className="dna-input-section">
          <h2 className="section-title">Your Text</h2>
          <p className="section-description">
            Paste a sample of your creative writing (at least 20 words)
          </p>

          <textarea
            className="dna-textarea"
            placeholder="Paste a short sample of your creative writing here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
          />

          {error && (
            <p className="error-message">{error}</p>
          )}

          <button 
            className="analyze-button" 
            onClick={analyze} 
            disabled={loading || !text.trim()}
          >
            <Fingerprint size={18} />
            {loading ? "Analyzing..." : "Analyze Literary DNA"}
          </button>
        </div>

        {/* Right Side - Results */}
        <div className="dna-results-section">
          {!result ? (
            <div className="results-placeholder">
              <Fingerprint size={80} className="placeholder-icon" />
              <h3 className="placeholder-title">Awaiting textual input</h3>
              <p className="placeholder-text">
                Your stylometric analysis will appear here
              </p>
            </div>
          ) : (
            <div className="results-content">
              <div className="match-header">
                <h3 className="match-title">
                  Match: <span className="match-name">{result.match.name}</span>
                </h3>
                <p className="match-score">
                  Similarity Score: <strong>{result.score}%</strong>
                </p>
              </div>

              <div className="radar-chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={getRadarData()}>
                    <PolarGrid stroke="#d1d5db" />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={false}
                    />
                    <Radar
                      name="You"
                      dataKey="user"
                      stroke="#a78bfa"
                      strokeWidth={3}
                      fill="#a78bfa"
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
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}