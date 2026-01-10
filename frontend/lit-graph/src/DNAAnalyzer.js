import { useState } from "react";

export default function DNAAnalyzer({ onResult }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        throw new Error(`Server Error: ${res.status}`);
      }

      const data = await res.json();
      onResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze text. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{ color: "#1e293b" }}>DNA Analyzer</h2>
      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "10px" }}>
        Paste a sample of your writing to find your literary stylistic match.
      </p>
      
      <textarea
        rows="6"
        style={{ 
          width: "100%", 
          padding: "12px", 
          borderRadius: "8px", 
          border: "1px solid #cbd5e1",
          fontFamily: "serif",
          fontSize: "1rem",
          resize: "vertical"
        }}
        placeholder="Paste your creative writing here (at least 2-3 sentences)..."
        value={text}
        onChange={e => setText(e.target.value)}
      />
      
      {error && <p style={{ color: "#ef4444", fontSize: "0.9rem", marginTop: "5px" }}>{error}</p>}

      <div style={{ marginTop: "12px" }}>
        <button 
          onClick={analyze} 
          disabled={loading || !text}
          style={{
            backgroundColor: loading ? "#94a3b8" : "#3b82f6",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            transition: "background 0.2s"
          }}
        >
          {loading ? "Calculating Vectors..." : "Analyze Style"}
        </button>
      </div>
    </div>
  );
}