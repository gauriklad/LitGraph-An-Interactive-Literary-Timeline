import { useState } from "react";
import { ChevronRight, X, BookOpen, Users, ExternalLink, PenTool, Feather, Factory, Lightbulb, Sparkles } from "lucide-react";
import { ShadowGallery } from "./ShadowGallery";
import "../ui/TimelineCard.css";
import "../ui/ShadowGallery.css";

const eraColorClasses = {
  neoclassical: "era-neoclassical",
  romantic:     "era-romantic",
  victorian:    "era-victorian",
  modern:       "era-modernist",
  postmodern:   "era-postmodern",
};

const eraIcons = {
  neoclassical: PenTool,
  romantic:     Feather,
  victorian:    Factory,
  modern:       Lightbulb,
  postmodern:   Sparkles,
};

const API = process.env.REACT_APP_API_URL;

export function TimelineCard({ era, index, isLeft, cardRef }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [works, setWorks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const eraKey = era.name.toLowerCase();
  const eraColorClass = eraColorClasses[eraKey] || "era-neoclassical";
  const EraIcon = eraIcons[eraKey] || PenTool;

  const handleExpand = async () => {
    setIsExpanded(true);

    if (works.length === 0 && authors.length === 0) {
      setLoadingDetails(true);
      try {
        const response = await fetch(
          `${API}/api/timeline/era/${era._id}`
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

  const handleWorkClick = (link) => {
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div
        className={`timeline-card-container ${isLeft ? "card-left" : "card-right"}`}
        style={{ animationDelay: `${index * 0.1}s` }}
        ref={cardRef}
      >
        <ShadowGallery 
          eraId={eraKey} 
          isLeft={isLeft} 
          parentRef={cardRef} 
        />

        <div className={`timeline-dot ${eraColorClass}-dot`} />

        <div className={`timeline-card-inner ${eraColorClass}-bg`} onClick={handleExpand}>
          <div className={`card-era-icon ${eraColorClass}-icon`}>
            <EraIcon size={28} />
          </div>

          <div className={`era-period ${eraColorClass}-text`}>
            {era.startYear}–{era.endYear}
          </div>

          <h3 className="era-title">{era.name}</h3>

          <p className="era-summary">{era.shortDescription}</p>

          <button className={`explore-button ${eraColorClass}-text`}>
            Explore Era
            <ChevronRight className="button-icon" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="modal-overlay" onClick={() => setIsExpanded(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsExpanded(false)} className="modal-close">
              <X className="close-icon" />
            </button>

            <div className={`modal-header-accent ${eraColorClass}-accent`} />

            <div className="modal-body">
              <div className="modal-header-section">
                <span className={`modal-period ${eraColorClass}-text`}>
                  {era.startYear}–{era.endYear}
                </span>
                <h2 className="modal-title">{era.name}</h2>
                <p className={`modal-theme ${eraColorClass}-text`}>
                  {era.shortDescription}
                </p>
              </div>

              <p className="modal-description">{era.detailedDescription}</p>

              {loadingDetails ? (
                <div className="modal-loading">
                  <div className="loading-dots">
                    <div className="loading-dot" />
                    <div className="loading-dot" />
                    <div className="loading-dot" />
                  </div>
                </div>
              ) : (
                <>
                  {works.length > 0 && (
                    <div className="modal-section">
                      <div className="section-header">
                        <BookOpen className={`section-icon ${eraColorClass}-text`} />
                        <h4 className="section-title">Major Masterpieces</h4>
                      </div>
                      <div className="works-grid">
                        {works.slice(0, 6).map((work) => (
                          <div
                            key={work._id}
                            className={`work-item ${work.link ? "work-item-clickable" : ""}`}
                            onClick={() => work.link && handleWorkClick(work.link)}
                          >
                            <div className="work-main">
                              <span className="work-title">{work.title}</span>
                              {work.link && (
                                <ExternalLink className={`work-link-icon ${eraColorClass}-text`} />
                              )}
                            </div>
                            <div className="work-meta">
                              <span className="work-author">{work.authorName}</span>
                              {work.publicationYear && (
                                <>
                                  <span className="work-separator">·</span>
                                  <span className="work-year">{work.publicationYear}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {authors.length > 0 && (
                    <div className="modal-section">
                      <div className="section-header">
                        <Users className={`section-icon ${eraColorClass}-text`} />
                        <h4 className="section-title">Key Figures</h4>
                      </div>
                      <div className="authors-flex">
                        {authors.map((author) => (
                          <div key={author._id} className="author-badge">
                            {author.image ? (
                              <img
                                src={author.image}
                                alt={author.name}
                                className="author-image"
                              />
                            ) : (
                              <span className={`author-avatar ${eraColorClass}-avatar`}>
                                {author.initials}
                              </span>
                            )}
                            <div className="author-info-badge">
                              <span className="author-name">{author.name}</span>
                              {(author.birthYear || author.deathYear) && (
                                <span className="author-years">
                                  {author.birthYear || "?"}–{author.deathYear || "?"}
                                </span>
                              )}
                            </div>
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