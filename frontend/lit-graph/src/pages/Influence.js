import { useState } from "react";
import { RelationshipGraph } from "../graph/RelationshipGraph";
import { InsightPanel } from "../graph/InsightPanel";
import { Network } from "lucide-react";
import "../ui/Influence.css";

const Influence = () => {
  const [filters, setFilters] = useState({
    influence: true,
    rivalry: true,
    peers: true,
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);

  const handleFilterChange = (filter) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleSelectNode = (node) => {
    setSelectedNode(node);
    setSelectedConnection(null);
  };

  const handleSelectConnection = (connection) => {
    setSelectedConnection(connection);
    setSelectedNode(null);
  };

  return (
    <div className="influence-page">
      <div className="influence-container">
        {/* Header Section */}
        <div className="influence-header">
          <div className="influence-header-content">
            <div className="influence-badge">
              <Network size={16} />
              <span>Logos — Connection & Influence</span>
            </div>
            <h1 className="influence-title">The Literary Web</h1>
            <p className="influence-subtitle">
              Explore the intricate network of influence, rivalry, and peer
              relationships that shaped Western literature across centuries.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="influence-content">
          <InsightPanel
            selectedNode={selectedNode}
            selectedConnection={selectedConnection}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <div className="graph-container">
            <RelationshipGraph
              filters={filters}
              onSelectNode={handleSelectNode}
              onSelectConnection={handleSelectConnection}
              selectedNode={selectedNode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Influence;