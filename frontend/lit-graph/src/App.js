import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DNA from "./pages/DNA";
import Influence from "./pages/Influence";
import Time from "./pages/Time";
import { Header } from "./layout/Header";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        
        <Routes>
          <Route path="/" element={<Time />} />
          <Route path="/time" element={<Time />} />
          <Route path="/dna" element={<DNA />} />
          <Route path="/influence" element={<Influence />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;