import { useState } from "react";
import DNAAnalyzer from "./DNAAnalyzer";
import RadarChartView from "./RadarChartView";
import InfluenceGraph from "./InfluenceGraph";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="LitGraph logo" />

        <h1>LitGraph</h1>
        <p>
          An Interactive Literary Timeline and Stylometric Analysis Platform
        </p>

        <section className="module-container">
          <DNAAnalyzer onResult={setResult} />
        </section>

        <section className="module-container">
          <RadarChartView result={result} />
        </section>

        <section className="module-container">
          <InfluenceGraph />
        </section>
      </header>
    </div>
  );
}

export default App;
