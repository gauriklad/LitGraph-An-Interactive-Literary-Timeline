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
        throw new Error("Request failed");
      }

      const data = await res.json();
      onResult(data);
    } catch (err) {
      setError("Backend not available. Please start the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Literary DNA Analyzer</h2>
      <p>
        Paste a short sample of your writing to analyze stylistic features and
        compare it with known literary patterns.
      </p>

      <textarea
        rows="6"
        placeholder="Paste your creative writing here (at least 2–3 sentences)..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {error && (
        <p style={{ color: "#b91c1c", marginTop: "10px" }}>{error}</p>
      )}

      <div className="dna-actions">
        <button onClick={analyze} disabled={loading || !text}>
          {loading ? "Analyzing..." : "Analyze Style"}
        </button>
      </div>
    </>
  );
}
