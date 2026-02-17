import { useState, useEffect } from "react";
import { ArrowRight, Swords, Users } from "lucide-react";
import "../ui/insightpanel.css";

export function InsightPanel({
  selectedNode,
  selectedConnection,
  filters,
  onFilterChange,
}) {
  const [authorNodes, setAuthorNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchAuthorNodes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/graph");
        const data = await response.json();
        setAuthorNodes(data.nodes || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching author nodes:", error);
        setLoading(false);
      }
    };
    fetchAuthorNodes();
  }, []);

  // Reset image error when selected node changes
  useEffect(() => {
    setImageError(false);
  }, [selectedNode]);

  const getNodeNameById = (id) =>
    authorNodes.find((n) => n.id === id)?.name || id;

  const connectionTypeLabels = {
    influence: { icon: ArrowRight, label: "Influence", color: "#60a5fa" },
    rivalry:   { icon: Swords,     label: "Rivalry",   color: "#f87171" },
    peers:     { icon: Users,      label: "Peers",     color: "#34d399" },
  };

  if (loading) {
    return (
      <aside className="insight-panel">
        <p className="loading-text">Loading...</p>
      </aside>
    );
  }

  return (
    <aside className="insight-panel">
      {/* Title */}
      <div className="panel-header">
        <h2 className="panel-title">Insight</h2>
      </div>

      {/* Selected Author */}
      {selectedNode && (
        <div className="selected-item">
          <div className="author-header">
            {/* Photo or initial avatar */}
            {selectedNode.image && !imageError ? (
              <img
                src={selectedNode.image}
                alt={selectedNode.name}
                className="author-photo"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`author-avatar era-${selectedNode.era}`}>
                <span className="author-initials">{selectedNode.initials}</span>
              </div>
            )}

            <div className="author-info">
              <h3 className="author-name">{selectedNode.name}</h3>
              <p className="author-era">{selectedNode.era} Era</p>
              {(selectedNode.birthYear || selectedNode.deathYear) && (
                <p className="author-years">
                  {selectedNode.birthYear || "?"}–{selectedNode.deathYear || "?"}
                </p>
              )}
            </div>
          </div>

          <p className="author-description">
            {selectedNode.shortDescription ||
              `${selectedNode.name} was a significant figure in the ${selectedNode.era} period.`}
          </p>
        </div>
      )}

      {/* Selected Connection */}
      {selectedConnection && (
        <div className="selected-item">
          <div className="connection-header">
            {(() => {
              const typeData = connectionTypeLabels[selectedConnection.type] || 
                connectionTypeLabels.influence;
              const { icon: Icon, label, color } = typeData;
              return (
                <>
                  <Icon className="connection-icon" style={{ color }} />
                  <span className="connection-label" style={{ color }}>
                    {label}
                  </span>
                </>
              );
            })()}
          </div>
          <p className="connection-names">
            {getNodeNameById(selectedConnection.source)} &{" "}
            {getNodeNameById(selectedConnection.target)}
          </p>
          <p className="connection-description">
            {selectedConnection.description || 
              "A significant literary relationship between these authors."}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!selectedNode && !selectedConnection && (
        <div className="empty-state">
          <p>Select an author or connection to learn more</p>
        </div>
      )}

      {/* Filters */}
      <div className="filter-section">
        <h3 className="section-title">Relationship Types</h3>
        <div className="filter-list">
          {["influence", "rivalry", "peers"].map((type) => {
            const { icon: Icon, label, color } = connectionTypeLabels[type];
            return (
              <label key={type} className="filter-item">
                <input
                  type="checkbox"
                  checked={filters[type]}
                  onChange={() => onFilterChange(type)}
                  className="filter-checkbox"
                />
                <Icon className="filter-icon" style={{ color }} />
                <span className="filter-label">{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Era Legend */}
      <div className="legend-section">
        <h3 className="section-title">Era Colors</h3>
        <div className="legend-grid">
          {[
            { key: "neoclassical", label: "Neoclassical" },
            { key: "romantic",     label: "Romantic"     },
            { key: "victorian",    label: "Victorian"    },
            { key: "modernist",    label: "Modernist"    },
            { key: "postmodern",   label: "Postmodern"   },
          ].map(({ key, label }) => (
            <div key={key} className="legend-item">
              <div className={`legend-dot era-${key}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Legend */}
      <div className="legend-section">
        <h3 className="section-title">Connections</h3>
        <div className="connections-legend">
          <div className="connection-legend-item">
            <div className="connection-line influence-line" />
            <span>Influence</span>
          </div>
          <div className="connection-legend-item">
            <div className="connection-line rivalry-line" />
            <span>Rivalry</span>
          </div>
          <div className="connection-legend-item">
            <div className="connection-line peer-line" />
            <span>Peers</span>
          </div>
        </div>
      </div>
    </aside>
  );
}