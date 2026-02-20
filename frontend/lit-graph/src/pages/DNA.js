import { useState } from "react";
import { Fingerprint, Clock } from "lucide-react";
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

const API = process.env.REACT_APP_API_URL;

export default function DNA() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showTimeTravel, setShowTimeTravel] = useState(false);
  const [selectedEraIndex, setSelectedEraIndex] = useState(0);

  const analyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setShowTimeTravel(false);

    try {
      const res = await fetch(`${API}/api/dna/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();
      setResult(data);
      setLoading(false);
    } catch (err) {
      setError("Backend not available. Please start the server.");
      setLoading(false);
    }
  };

  const handleStyleShift = () => {
    setShowTimeTravel(true);
    setSelectedEraIndex(0);
  };

  // Prepare radar chart data
  const getRadarData = (eraIndex = null) => {
    if (!result || !result.match) return [];

    const user = result.user || {
      vocab: 0,
      complexity: 0,
      pacing: 0,
      abstraction: 0
    };

    let matchStats;
    let _matchName;

    if (showTimeTravel && eraIndex !== null && result.eraMatches && result.eraMatches[eraIndex]) {
      const eraMatch = result.eraMatches[eraIndex];
      matchStats = eraMatch.match.dnastats;
      _matchName = eraMatch.match.name;
    } else {
      matchStats = result.match.dnastats || {
        vocab: 0,
        complexity: 0,
        pacing: 0,
        abstraction: 0
      };
      _matchName = result.match.name;
    }

    return [
      { metric: "Vocabulary", user: user.vocab, author: matchStats.vocab, fullMark: 100 },
      { metric: "Complexity", user: user.complexity, author: matchStats.complexity, fullMark: 100 },
      { metric: "Pacing", user: user.pacing, author: matchStats.pacing, fullMark: 100 },
      { metric: "Abstraction", user: user.abstraction, author: matchStats.abstraction, fullMark: 100 }
    ];
  };

  const getCurrentMatch = () => {
    if (!result) return null;
    
    if (showTimeTravel && result.eraMatches && result.eraMatches[selectedEraIndex]) {
      return result.eraMatches[selectedEraIndex];
    }
    
    return {
      match: result.match,
      score: result.score,
      eraName: result.match.era
    };
  };

  const currentMatch = getCurrentMatch();

  return (
    <div className="dna-page">
      <div className="dna-container">
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
                {/* Match Header */}
                <div className="match-header">
                  <div className="match-info">
                    {currentMatch.match.image ? (
                      <img 
                        src={currentMatch.match.image} 
                        alt={currentMatch.match.name}
                        className="match-image"
                      />
                    ) : (
                      <div className="match-avatar">
                        {currentMatch.match.name.split(' ').map(w => w[0]).join('')}
                      </div>
                    )}
                    <div>
                      <h3 className="match-title">
                        {showTimeTravel ? (
                          <>In the <span className="era-highlight">{currentMatch.eraName}</span> Era</>
                        ) : (
                          <>Best Match</>
                        )}
                      </h3>
                      <p className="match-name">{currentMatch.match.name}</p>
                      {currentMatch.match.birthYear && currentMatch.match.deathYear && (
                        <p className="match-years">
                          {currentMatch.match.birthYear}–{currentMatch.match.deathYear}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="match-score-badge">
                    <span className="score-value">{currentMatch.score}%</span>
                    <span className="score-label">Match</span>
                  </div>
                </div>

                {/* --- SWAPPED SECTION STARTS HERE --- */}

                {/* 1. Style Shift Button */}
                {!showTimeTravel && result.eraMatches && result.eraMatches.length > 1 && (
                  <button className="style-shift-button" onClick={handleStyleShift} style={{ marginBottom: '1.5rem', width: '100%' }}>
                    <Clock size={18} />
                    Explore Style Through Time
                  </button>
                )}

                {/* 2. Time Slider Controls */}
                {showTimeTravel && result.eraMatches && (
                  <div className="time-travel-section" style={{ marginBottom: '2rem' }}>
                    <h4 className="time-travel-title">Stylometric Time-Travel</h4>
                    <p className="time-travel-subtitle">
                      See how your writing would match authors across different literary eras
                    </p>
                    
                    <div className="era-slider">
                      <input
                        type="range"
                        min="0"
                        max={result.eraMatches.length - 1}
                        value={selectedEraIndex}
                        onChange={(e) => setSelectedEraIndex(parseInt(e.target.value))}
                        className="slider"
                      />
                      <div className="era-labels">
                        {result.eraMatches.map((em, index) => (
                          <button
                            key={em.eraId}
                            className={`era-label ${selectedEraIndex === index ? 'active' : ''}`}
                            onClick={() => setSelectedEraIndex(index)}
                          >
                            <span className="era-name">{em.eraName}</span>
                            <span className="era-period">{em.startYear}–{em.endYear}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Era Insights */}
                    <div className="era-insights">
                      <p className="era-insight-text">
                        In the <strong>{currentMatch.eraName}</strong> era, you would be most like{" "}
                        <strong>{currentMatch.match.name}</strong> with a {currentMatch.score}% similarity.
                      </p>
                      {currentMatch.match.shortDescription && (
                        <p className="era-author-description">
                          {currentMatch.match.shortDescription}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Radar Chart (Now at the bottom) */}
                <div className="radar-chart-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={getRadarData(selectedEraIndex)}>
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
                        name={currentMatch.match.name}
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

                {/* --- SWAPPED SECTION ENDS HERE --- */}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}