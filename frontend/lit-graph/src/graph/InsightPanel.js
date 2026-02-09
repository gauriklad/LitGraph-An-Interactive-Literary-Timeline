import { useState, useEffect } from "react";
import { ArrowRight, Swords, Users } from "lucide-react";
import "../ui/insightpanel.css";

const connectionDescriptions = {
  influence: {
    "pope-swift":
      "Pope and Swift shared Augustan ideals, with Pope's satirical technique influencing Swift's prose satire.",
    "wordsworth-keats":
      "Wordsworth's nature poetry and emotional depth deeply shaped Keats's own development as a Romantic poet.",
    "coleridge-wordsworth":
      "Coleridge's philosophical approach influenced Wordsworth's poetic theory, culminating in their collaborative Lyrical Ballads.",
    "dickens-hardy":
      "Dickens's social realism and regional settings influenced Hardy's portrayal of rural Wessex life.",
    "hardy-woolf":
      "Hardy's break from Victorian conventions paved the way for Woolf's radical narrative experiments.",
    "joyce-woolf":
      "Joyce's stream-of-consciousness in Ulysses influenced Woolf's development of her own interior monologue technique.",
    "kafka-beckett":
      "Kafka's absurdist vision and stripped prose style profoundly influenced Beckett's minimalist theater.",
    "joyce-pynchon":
      "Joyce's encyclopedic ambition and linguistic play influenced Pynchon's own maximalist approach.",
    "orwell-atwood":
      "Orwell's dystopian vision in 1984 directly influenced Atwood's The Handmaid's Tale.",
    "eliot-hardy":
      "George Eliot's psychological realism influenced Hardy's character development and moral complexity.",
  },
  peer: {
    "wordsworth-coleridge":
      "Close friends and collaborators, they launched Romanticism together with Lyrical Ballads (1798).",
    "keats-byron":
      "Fellow Romantics who represented different aspects of the movement—Keats's aestheticism versus Byron's theatrical rebellion.",
    "woolf-joyce":
      "Contemporaries who independently developed stream-of-consciousness, occasionally acknowledging each other's work.",
    "swift-defoe":
      "Leading prose writers of their age who defined early English fiction, though with different approaches.",
    "tseliot-joyce":
      "Mutual admirers who defined High Modernism; Eliot famously praised Ulysses's mythical method.",
    "pynchon-atwood":
      "Contemporary postmodernists who both explore paranoia, power structures, and speculative themes.",
  },
  rivalry: {
    "byron-wordsworth":
      "Byron mocked Wordsworth's simple style and Lake School pretensions, representing Romantic factionalism.",
    "dickens-eliot":
      "Represented different approaches to Victorian fiction—Dickens's popular sentiment versus Eliot's intellectual depth.",
    "pope-defoe":
      "Pope dismissed Defoe's middle-class subjects, representing literary class tensions of the age.",
  },
};

function getConnectionDescription(connection) {
  const key1 = `${connection.source}-${connection.target}`;
  const key2 = `${connection.target}-${connection.source}`;
  const descriptions = connectionDescriptions[connection.type];
  return descriptions[key1] || descriptions[key2] || "A significant literary relationship.";
}

export function InsightPanel({
  selectedNode,
  selectedConnection,
  filters,
  onFilterChange,
}) {
  const [authorNodes, setAuthorNodes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getNodeNameById = (id) => {
    return authorNodes.find((n) => n.id === id)?.name || id;
  };

  const connectionTypeLabels = {
    influence: { icon: ArrowRight, label: "Influence", color: "#60a5fa" },
    rivalry: { icon: Swords, label: "Rivalry", color: "#f87171" },
    peer: { icon: Users, label: "Peers", color: "#34d399" },
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
            <div className={`author-avatar era-${selectedNode.era}`}>
              <span className="author-initials">{selectedNode.initials}</span>
            </div>
            <div className="author-info">
              <h3 className="author-name">{selectedNode.name}</h3>
              <p className="author-era">{selectedNode.era} Era</p>
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
              const { icon: Icon, label, color } =
                connectionTypeLabels[selectedConnection.type];
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
            {getConnectionDescription(selectedConnection)}
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
          {["influence", "rivalry", "peer"].map((type) => {
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

      {/* Era Colors Legend */}
      <div className="legend-section">
        <h3 className="section-title">Era Colors</h3>
        <div className="legend-grid">
          <div className="legend-item">
            <div className="legend-dot era-neoclassical"></div>
            <span>Neoclassical</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot era-romantic"></div>
            <span>Romantic</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot era-victorian"></div>
            <span>Victorian</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot era-modernist"></div>
            <span>Modernist</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot era-postmodern"></div>
            <span>Postmodern</span>
          </div>
        </div>
      </div>

      {/* Connections Legend */}
      <div className="legend-section">
        <h3 className="section-title">Connections</h3>
        <div className="connections-legend">
          <div className="connection-legend-item">
            <div className="connection-line influence-line"></div>
            <span>Influence</span>
          </div>
          <div className="connection-legend-item">
            <div className="connection-line rivalry-line"></div>
            <span>Rivalry</span>
          </div>
          <div className="connection-legend-item">
            <div className="connection-line peer-line"></div>
            <span>Peers</span>
          </div>
        </div>
      </div>
    </aside>
  );
}