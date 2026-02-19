import { useEffect, useState, useRef, createRef } from "react";
import { TimelineCard } from "./TimelineCard";
import { Calendar, Clock } from "lucide-react";
import "../ui/Timeline.css";

// Era color mapping
const eraColors = {
  neoclassical: { badge: "#4a7c59", bg: "#96bca2", border: "rgba(74, 124, 89, 0.3)",  text: "#0f400b", subtleBg: "#edf4ef" },
  romantic:     { badge: "#c2607a", bg: "#f9b9ca", border: "rgba(194, 96, 122, 0.3)", text: "#440919", subtleBg: "#fdf0f3" },
  victorian:    { badge: "#b07d3a", bg: "#daa969", border: "rgba(176, 125, 58, 0.3)", text: "#472e0c", subtleBg: "#faf4ea" },
  modern:       { badge: "#4a7ea8", bg: "#d3ebff", border: "rgba(74, 126, 168, 0.3)", text: "#072946", subtleBg: "#eff6ff" },
  postmodern:   { badge: "#7a5ca8", bg: "#dec8ff", border: "rgba(122, 92, 168, 0.3)", text: "#2d184e", subtleBg: "#f5f0ff" },
};

// Transition labels shown after each era's events
const eraTransitions = {
  neoclassical: "Shift toward emotional individualism",
  romantic:     "Rise of realism and social conscience",
  victorian:    "Break from tradition, embrace of experimentation",
  modernist:    "Fragmentation of meaning and grand narratives",
  postmodern:   null,
};

// Determine which era an event belongs to based on year
const getEventEra = (eventYear, eras) => {
  for (const era of eras) {
    if (eventYear >= era.startYear && eventYear <= era.endYear) {
      return era.name.toLowerCase();
    }
  }
  return "neoclassical";
};

const getEventIcon = (label) => {
  if (label.includes("Enlightenment")) return "◈";
  if (label.includes("Revolution") || label.includes("French")) return "⚑";
  if (label.includes("Restoration") || label.includes("Monarchy")) return "♔";
  if (label.includes("Queen") || label.includes("Victoria")) return "♛";
  if (label.includes("War") || label.includes("Napoleon")) return "⚔";
  if (label.includes("Industrial")) return "⚙";
  if (label.includes("Species") || label.includes("Darwin")) return "◉";
  return "◆";
};

export function Timeline({ onEraChange }) {
  const [eras, setEras] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const spineRef = useRef(null);
  const timelineRef = useRef(null);
  const eraRefs = useRef([]);
  const cardRefs = useRef([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentEraIndex, setCurrentEraIndex] = useState(0);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/timeline");
        const data = await response.json();
        
        console.log("Timeline data fetched:", {
          eras: data.eras?.length || 0,
          events: data.events?.length || 0,
          eraNames: data.eras?.map(e => `${e.name} (${e.startYear}-${e.endYear})`),
          eventYears: data.events?.map(e => `${e.year}: ${e.label}`)
        });
        
        setEras(data.eras || []);
        setEvents(data.events || []);
        
        // Initialize refs arrays
        eraRefs.current = new Array(data.eras.length).fill(null);
        cardRefs.current = (data.eras || []).map(() => createRef());
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching timeline data:", error);
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const totalHeight = rect.height;
      const scrolled = viewHeight - rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalHeight));
      setScrollProgress(progress);

      let bestIndex = 0;
      let bestVisibility = -1;
      
      eraRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const visible = Math.min(r.bottom, viewHeight) - Math.max(r.top, 0);
        if (visible > bestVisibility) {
          bestVisibility = visible;
          bestIndex = i;
        }
      });
      
      if (bestIndex !== currentEraIndex) {
        setCurrentEraIndex(bestIndex);
        if (onEraChange) {
          onEraChange(bestIndex);
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentEraIndex, onEraChange]);

  const getTimelineItems = () => {
    const items = [];

    eras.forEach((era, index) => {
      items.push({ type: "era", year: era.startYear, data: era, index });
    });

    events.forEach((event) => {
      items.push({ type: "event", year: event.year, data: event });
    });

    // Events before eras on same year
    return items.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.type === "event" && b.type === "era") return -1;
      if (a.type === "era" && b.type === "event") return 1;
      return 0;
    });
  };

  if (loading) {
    return (
      <div className="timeline-loading">
        <div className="loading-dots">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
        <p>Loading timeline...</p>
      </div>
    );
  }

  const timelineItems = getTimelineItems();
  const currentEraColor = eras[currentEraIndex] ? eras[currentEraIndex].name.toLowerCase() : "neoclassical";

  return (
    <section className="timeline-section" ref={timelineRef} style={{
    backgroundColor: eraColors[currentEraColor]?.subtleBg || "#f0f0eb",}}>
      {/* Timeline spine with scroll progress */}
      <div className="timeline-spine" />
      <div
        ref={spineRef}
        className="timeline-spine-progress"
        style={{
          height: `${scrollProgress * 100}%`,
          backgroundColor: eraColors[currentEraColor]?.text || "#4a7c59",
          opacity: 0.5,
          transition: "background-color 0.6s ease-in-out",
        }}
      />

      <div className="timeline-container">
        {/* Header */}
        <div className="timeline-header">
          <h2 className="timeline-title">The Chronological Spine</h2>
          <p className="timeline-subtitle">
            A visual journey through the evolution of literature, intertwined
            with the history that shaped it.
          </p>
          <div className="timeline-stats">
            <div className="stat-item">
              <Clock className="stat-icon" />
              <span>{eras.length} Literary Eras</span>
            </div>
            <div className="stat-item">
              <Calendar className="stat-icon" />
              <span>{events.length} Historical Events</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline-content">
          {(() => {
            let lastEraKey = null;
            const elements = [];

            timelineItems.forEach((item, i) => {
              if (item.type === "era") {
                const eraKey = item.data.name.toLowerCase();
                const eraIndex = item.index;

                // Show transition label before this era if there was a previous era
                if (lastEraKey && eraTransitions[lastEraKey]) {
                  elements.push(
                    <div key={`transition-${lastEraKey}`} className="era-transition">
                      <span className="transition-arrow">↓</span>
                      <span className="transition-text">{eraTransitions[lastEraKey]}</span>
                    </div>
                  );
                }

                elements.push(
                  <div 
                    key={`era-${item.data._id}`} 
                    className="timeline-card-wrapper"
                    ref={(el) => { eraRefs.current[eraIndex] = el; }}
                  >
                    <TimelineCard
                      era={item.data}
                      index={item.index}
                      isLeft={item.index % 2 === 0}
                      cardRef={cardRefs.current[eraIndex]}
                    />
                  </div>
                );

                lastEraKey = eraKey;
              } else {
                const eraName = getEventEra(item.data.year, eras);
                const colors = eraColors[eraName] || eraColors.neoclassical;

                elements.push(
                  <div key={`event-${item.data._id}`} className="floating-event">
                    <div
                      className="event-badge"
                      style={{
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                      }}
                    >
                      <span className="event-year" style={{ color: colors.text }}>
                        {item.data.year}
                      </span>
                      <span className="event-icon-char" style={{ color: colors.text }}>
                        {getEventIcon(item.data.label)}
                      </span>
                      <span className="event-label" style={{ color: colors.text }}>
                        {item.data.label}
                      </span>
                      
                      {/* Tooltip with shortDescription */}
                      {item.data.shortDescription && (
                        <div className="event-tooltip" style={{ borderColor: colors.text }}>
                          <div className="event-tooltip-arrow" style={{ borderBottomColor: colors.bg }} />
                          <p className="event-tooltip-text">{item.data.shortDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            });

            return elements;
          })()}
        </div>
      </div>
    </section>
  );
}