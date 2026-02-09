import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import "../ui/Header.css";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isInfluencePage = location.pathname === "/influence";

  return (
    <header
      className={`header ${isScrolled ? 'header-scrolled' : ''} ${
        isInfluencePage ? 'header-dark' : 'header-light'
      }`}
    >
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <div className={`logo-icon ${isInfluencePage ? 'logo-icon-dark' : ''}`}>
            <BookOpen className="logo-svg" />
          </div>
          <div>
            <h1 className={`logo-title ${isInfluencePage ? 'logo-title-dark' : ''}`}>
              LitGraph
            </h1>
            <p className={`logo-subtitle ${isInfluencePage ? 'logo-subtitle-dark' : ''}`}>
              Literary Visualization
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="header-nav">
          <Link
            to="/dna"
            className={`nav-link ${
              location.pathname === '/' || location.pathname === '/dna'
                ? isInfluencePage 
                  ? 'nav-link-dark-active' 
                  : 'nav-link-active'
                : isInfluencePage 
                  ? 'nav-link-dark' 
                  : ''
            }`}
          >
            DNA
          </Link>
          <Link
            to="/influence"
            className={`nav-link ${
              location.pathname === '/influence'
                ? isInfluencePage
                  ? 'nav-link-dark-active'
                  : 'nav-link-active'
                : isInfluencePage
                  ? 'nav-link-dark'
                  : ''
            }`}
          >
            Influence
          </Link>
        </nav>
      </div>
    </header>
  );
}