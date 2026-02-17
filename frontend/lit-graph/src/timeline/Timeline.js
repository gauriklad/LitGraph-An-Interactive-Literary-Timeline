import { useState, useEffect } from "react";
import { TimelineCard } from "./TimelineCard";
import { Calendar, Clock } from "lucide-react";
import "../ui/Timeline.css";

// Era color mapping matching the card colors
const eraColors = {
  neoclassical: { bg: "rgba(74, 124, 89, 0.12)", border: "rgba(74, 124, 89, 0.3)", text: "#4a7c59" },
  romantic:     { bg: "rgba(194, 96, 122, 0.12)", border: "rgba(194, 96, 122, 0.3)", text: "#c2607a" },
  victorian:    { bg: "rgba(176, 125, 58, 0.12)", border: "rgba(176, 125, 58, 0.3)", text: "#b07d3a" },
  modern:    { bg: "rgba(74, 126, 168, 0.12)", border: "rgba(74, 126, 168, 0.3)", text: "#4a7ea8" },
  postmodern:   { bg: "rgba(122, 92, 168, 0.12)", border: "rgba(122, 92, 168, 0.3)", text: "#7a5ca8" },
};

// Transition labels shown after each era's events
const eraTransitions = {
  neoclassical: "Shift toward emotional individualism",
  romantic:     "Rise of realism and social conscience",
  victorian:    "Break from tradition, embrace of experimentation",
  modern:    "Fragmentation of meaning and grand narratives",
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

export function Timeline() {
  const [eras, setEras] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/timeline");
        const data = await response.json();
        setEras(data.eras || []);
        setEvents(data.events || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching timeline data:", error);
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, []);

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

  // We need to track what era we just rendered to show transition labels
  // Use a mutable ref-like approach via a variable
  const renderedEras = [];

  return (
    <section className="timeline-section">
      <div className="timeline-spine" />

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
                  <div key={`era-${item.data._id}`} className="timeline-card-wrapper">
                    <TimelineCard
                      era={item.data}
                      index={item.index}
                      isLeft={item.index % 2 === 0}
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