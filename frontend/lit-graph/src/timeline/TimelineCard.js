import { useState } from "react";
import { ChevronRight, X, BookOpen, Users } from "lucide-react";
import "../ui/TimelineCard.css";

const eraColorClasses = {
  neoclassical: "era-neoclassical",
  romantic: "era-romantic",
  victorian: "era-victorian",
  modernist: "era-modernist",
  postmodern: "era-postmodern",
};

export function TimelineCard({ era, index, isLeft }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [works, setWorks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const eraColorClass =
    eraColorClasses[era.name.toLowerCase()] || "era-neoclassical";

  const handleExpand = async () => {
    setIsExpanded(true);

    if (works.length === 0 && authors.length === 0) {
      setLoadingDetails(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/timeline/era/${era._id}`
        );
        const data = await response.json();
        setWorks(data.works || []);
        setAuthors(data.authors || []);
        setLoadingDetails(false);
      } catch (error) {
        console.error("Error fetching era details:", error);
        setLoadingDetails(false);
      }
    }
  };

  return (
    <>
      <div
        className={`timeline-card-container ${isLeft ? "card-left" : "card-right"}`}
        style={{
          animationDelay: `${index * 0.1}s`,
        }}
      >
        {/* Timeline dot */}
        <div className="timeline-dot" />

        {/* Card */}
        <div className="timeline-card" onClick={handleExpand}>
          <div className={`card-content ${eraColorClass}-bg`}>
            {/* Period badge */}
            <div className={`era-period ${eraColorClass}-text`}>
              {era.startYear}-{era.endYear}
            </div>

            {/* Title */}
            <h3 className="era-title">{era.name}</h3>

            {/* Summary */}
            <p className="era-summary">{era.shortDescription}</p>

            {/* CTA */}
            <button className={`explore-button ${eraColorClass}-text`}>
              Explore Era
              <ChevronRight className="button-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="modal-overlay" onClick={() => setIsExpanded(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button onClick={() => setIsExpanded(false)} className="modal-close">
              <X className="close-icon" />
            </button>

            {/* Era accent header */}
            <div className={`modal-header-accent ${eraColorClass}`} />

            <div className="modal-body">
              {/* Header */}
              <div className="modal-header-section">
                <span className="modal-period">
                  {era.startYear}-{era.endYear}
                </span>
                <h2 className="modal-title">{era.name}</h2>
                <p className={`modal-theme ${eraColorClass}-text`}>
                  {era.shortDescription}
                </p>
              </div>

              {/* Description */}
              <p className="modal-description">{era.detailedDescription}</p>

              {loadingDetails ? (
                <p className="loading-text">Loading details...</p>
              ) : (
                <>
                  {/* Major Masterpieces */}
                  {works.length > 0 && (
                    <div className="modal-section">
                      <div className="section-header">
                        <BookOpen className="section-icon" />
                        <h4 className="section-title">Major Masterpieces</h4>
                      </div>
                      <div className="works-grid">
                        {works.map((work) => (
                          <div key={work._id} className="work-item">
                            <span className="work-title">{work.title}</span>
                            <span className="work-author">{work.authorName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Figures */}
                  {authors.length > 0 && (
                    <div className="modal-section">
                      <div className="section-header">
                        <Users className="section-icon" />
                        <h4 className="section-title">Key Figures</h4>
                      </div>
                      <div className="authors-flex">
                        {authors.map((author) => (
                          <div key={author._id} className="author-badge">
                            <span className={`author-avatar ${eraColorClass}`}>
                              {author.initials}
                            </span>
                            <span className="author-name">{author.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}