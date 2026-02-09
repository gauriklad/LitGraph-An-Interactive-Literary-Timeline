import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DNA from "./pages/DNA";
import Influence from "./pages/Influence";
import { Header } from "./layout/Header";
import { Footer } from "./layout/Footer";
import "./App.css";
import "./ui/Header.css";
import "./ui/Footer.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        
        <Routes>
          <Route path="/" element={<Influence />} />
          <Route path="/influence" element={<Influence />} />
          <Route path="/dna" element={<DNA />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;