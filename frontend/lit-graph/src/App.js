import { useState } from "react";
import DNAAnalyzer from "./DNAAnalyzer";
import RadarChartView from "./RadarChartView";
import InfluenceGraph from "./InfluenceGraph";

function App() {
  const [result, setResult] = useState(null);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Chronos & Logos – Test Console</h1>

      <DNAAnalyzer onResult={setResult} />
      <hr />
      <RadarChartView result={result} />
      <hr />
      <InfluenceGraph />
    </div>
  );
}

export default App;
