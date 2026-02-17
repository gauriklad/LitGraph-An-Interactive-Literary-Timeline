import { useState, useEffect } from "react";
import { TimelineCard } from "./TimelineCard";
import { Calendar, Clock, Lightbulb, Sparkles, Crown, X } from "lucide-react";
import "../ui/Timeline.css";

// Icon mapping for events
const getEventIcon = (label) => {
  if (label.includes("Enlightenment")) return <Lightbulb className="event-icon" />;
  if (label.includes("Revolution")) return <Sparkles className="event-icon" />;
  if (label.includes("Restoration") || label.includes("Monarchy")) return <Crown className="event-icon" />;
  return <Calendar className="event-icon" />;
};

export function Timeline() {
  const [eras, setEras] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/timeline");
        const data = await response.json();
        console.log("Timeline data:", data);
        console.log("Eras:", data.eras);
        console.log("Events:", data.events);
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

  // Create a merged timeline of eras and events
  const getTimelineItems = () => {
    const items = [];

    // Add all eras
    eras.forEach((era, index) => {
      items.push({
        type: 'era',
        year: era.startYear,
        data: era,
        index: index
      });
    });

    // Add all events
    events.forEach((event) => {
      items.push({
        type: 'event',
        year: event.year,
        data: event
      });
    });

    // Sort by year - events come BEFORE era cards on same year
    return items.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      // Same year: events first, eras second
      if (a.type === 'event' && b.type === 'era') return -1;
      if (a.type === 'era' && b.type === 'event') return 1;
      return 0;
    });
  };

  const timelineItems = getTimelineItems();
  console.log("Rendering", timelineItems.length, "timeline items");

  return (
    <section className="timeline-section">
      {/* Timeline spine */}
      <div className="timeline-spine" />

      <div className="timeline-container">
        {/* Section header */}
        <div className="timeline-header">
          <h2 className="timeline-title">The Chronological Spine</h2>
          <p className="timeline-subtitle">
            A visual journey through the evolution of literature, intertwined
            with the history that shaped it.
          </p>

          {/* Stats row */}
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

        {/* Timeline items (eras and events mixed) */}
        <div className="timeline-content">
          {timelineItems.map((item, index) => {
            if (item.type === 'era') {
              const eraIndex = item.index;
              const isLeft = eraIndex % 2 === 0;

              return (
                <div key={`era-${item.data._id}`} className="timeline-card-wrapper">
                  <TimelineCard 
                    era={item.data} 
                    index={eraIndex} 
                    isLeft={isLeft} 
                  />
                </div>
              );
            } else {
              return (
                <div key={`event-${item.data._id}`} className="floating-event">
                  <div 
                    className="event-badge"
                    onClick={() => setSelectedEvent(item.data)}
                    title={item.data.shortDescription} // Tooltip on hover
                  >
                    <span className="event-year">{item.data.year}</span>
                    {getEventIcon(item.data.label)}
                    <span className="event-label">{item.data.label}</span>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="event-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedEvent(null)} className="event-modal-close">
              <X className="close-icon" />
            </button>
            
            <div className="event-modal-header">
              <span className="event-modal-year">{selectedEvent.year}</span>
              <h3 className="event-modal-title">{selectedEvent.label}</h3>
            </div>
            
            <p className="event-modal-description">
              {selectedEvent.shortDescription}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}