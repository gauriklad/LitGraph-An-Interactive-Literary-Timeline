import { useMemo, useState, useCallback, useEffect } from "react";
import "../ui/RelationshipGraph.css";

export function RelationshipGraph({
  filters,
  onSelectNode,
  onSelectConnection,
  selectedNode,
}) {
  const [authorNodes, setAuthorNodes] = useState([]);
  const [authorConnections, setAuthorConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Fetch data from API
  // Fetch data from API
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/graph");
        const data = await response.json();

        console.log("RAW API DATA:", data); // DEBUG 1

        // 1. SAFE NODE MAPPING
        // Handle both data.nodes (if array) or data itself (if array)
        const rawNodes = Array.isArray(data) ? data : (data.nodes || []);
        const nodes = rawNodes.map(node => ({
          ...node,
          id: String(node._id || node.id), // Force string ID
          era: node.era ? node.era.toLowerCase() : 'neoclassical' // Safety default
        }));

        // 2. SAFE CONNECTION MAPPING
        // Handle data.connections or data.edges
        const rawConnections = data.connections || data.edges || [];
        const connections = rawConnections.map(conn => ({
          ...conn,
          // Handle 'sourceAuthorId', 'sourceId', or just 'source'
          // Also handle if source is an OBJECT (populated) vs a STRING
          source: String(
            conn.sourceAuthorId?._id || 
            conn.sourceAuthorId || 
            conn.source?._id || 
            conn.source
          ),
          target: String(
            conn.targetAuthorId?._id || 
            conn.targetAuthorId || 
            conn.target?._id || 
            conn.target
          ),
          // Normalize type to lowercase for filtering
          type: (conn.type || 'peers').toLowerCase()
        }));

        console.log("PROCESSED NODES:", nodes); // DEBUG 2
        console.log("PROCESSED CONNECTIONS:", connections); // DEBUG 3

        if (nodes.length === 0) console.warn("WARNING: No nodes found!");
        if (connections.length === 0) console.warn("WARNING: No connections found!");

        setAuthorNodes(nodes);
        setAuthorConnections(connections);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching graph data:", error);
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  // Era-based node colors - matching the dark theme
  const eraNodeColors = {
    neoclassical: { 
      fill: "hsl(145, 25%, 35%)", 
      stroke: "hsl(145, 30%, 50%)",
      glow: "hsl(145, 30%, 45%)"
    },
    romantic: { 
      fill: "hsl(340, 45%, 55%)", 
      stroke: "hsl(340, 50%, 65%)",
      glow: "hsl(340, 50%, 60%)"
    },
    victorian: { 
      fill: "hsl(35, 35%, 50%)", 
      stroke: "hsl(35, 40%, 60%)",
      glow: "hsl(35, 40%, 55%)"
    },
    modern: { 
      fill: "hsl(210, 40%, 50%)", 
      stroke: "hsl(210, 45%, 60%)",
      glow: "hsl(210, 45%, 55%)"
    },
    postmodern: { 
      fill: "hsl(280, 40%, 55%)", 
      stroke: "hsl(280, 45%, 65%)",
      glow: "hsl(280, 45%, 60%)"
    },
  };

  // Filter connections based on active filters
  const activeConnections = useMemo(() => {
    return authorConnections.filter((conn) => {
      if (conn.type === "influence" && filters.influence) return true;
      if (conn.type === "rivalry" && filters.rivalry) return true;
      if (conn.type === "peers" && filters.peer) return true;
      return false;
    });
  }, [filters, authorConnections]);

  // Get visible nodes (those that have active connections)
  const visibleNodeIds = useMemo(() => {
    const ids = new Set();
    activeConnections.forEach((conn) => {
      ids.add(conn.source);
      ids.add(conn.target);
    });
    return ids;
  }, [activeConnections]);

  const visibleNodes = useMemo(() => {
    if (!filters.influence && !filters.rivalry && !filters.peer) {
      return authorNodes;
    }
    return authorNodes.filter((node) => visibleNodeIds.has(node.id));
  }, [visibleNodeIds, filters, authorNodes]);

  // Calculate node positions in a force-directed style layout
  const nodePositions = useMemo(() => {
    const positions = {};
    const centerX = 450;
    const centerY = 320;
    
    const nodeCount = visibleNodes.length;
    
    if (nodeCount <= 6) {
      // Single ring for small number of nodes
      const radius = 200;
      visibleNodes.forEach((node, index) => {
        const angle = (index / nodeCount) * 2 * Math.PI - Math.PI / 2;
        positions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      });
    } else {
      // Multiple rings for larger sets
      const innerRing = Math.ceil(nodeCount * 0.4);
      const outerRing = nodeCount - innerRing;
      const innerRadius = 160;
      const outerRadius = 280;
      
      visibleNodes.forEach((node, index) => {
        if (index < innerRing) {
          const angle = (index / innerRing) * 2 * Math.PI - Math.PI / 2;
          const offsetX = Math.sin(angle * 2) * 15;
          const offsetY = Math.cos(angle * 2) * 15;
          positions[node.id] = {
            x: centerX + innerRadius * Math.cos(angle) + offsetX,
            y: centerY + innerRadius * Math.sin(angle) + offsetY,
          };
        } else {
          const outerIndex = index - innerRing;
          const angle = (outerIndex / outerRing) * 2 * Math.PI - Math.PI / 4;
          positions[node.id] = {
            x: centerX + outerRadius * Math.cos(angle),
            y: centerY + outerRadius * Math.sin(angle),
          };
        }
      });
    }

    return positions;
  }, [visibleNodes]);

  const getConnectionPath = useCallback(
    (connection) => {
      const source = nodePositions[connection.source];
      const target = nodePositions[connection.target];
      if (!source || !target) return "";

      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const offset = Math.sqrt(dx * dx + dy * dy) * 0.1;
      const controlX = midX - (dy / Math.sqrt(dx * dx + dy * dy)) * offset;
      const controlY = midY + (dx / Math.sqrt(dx * dx + dy * dy)) * offset;

      return `M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`;
    },
    [nodePositions]
  );

  const getConnectionStyle = (type) => {
    switch (type) {
      case "influence":
        return {
          stroke: "#60a5fa",
          strokeDasharray: "none",
        };
      case "rivalry":
        return {
          stroke: "#f87171",
          strokeDasharray: "none",
        };
      case "peers":
        return {
          stroke: "#34d399",
          strokeDasharray: "none",
        };
      default:
        return { stroke: "#64748b", strokeDasharray: "none" };
    }
  };

  const isNodeHighlighted = (nodeId) => {
    if (hoveredNode === nodeId) return true;
    if (selectedNode?.id === nodeId) return true;
    if (hoveredNode) {
      return activeConnections.some(
        (conn) =>
          (conn.source === hoveredNode && conn.target === nodeId) ||
          (conn.target === hoveredNode && conn.source === nodeId)
      );
    }
    return false;
  };

  const getNodeColors = (era) => {
    return eraNodeColors[era] || eraNodeColors.neoclassical;
  };

  if (loading) {
    return (
      <div className="graph-loading">
        <p>Loading graph...</p>
      </div>
    );
  }

  return (
    <div className="relationship-graph">
      <svg
        viewBox="0 0 900 640"
        className="graph-svg"
      >
        {/* Subtle grid pattern */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 40 0 L 0 0 0 40" 
              fill="none" 
              stroke="#1e293b" 
              strokeWidth="0.5" 
              opacity="0.5" 
            />
          </pattern>
          
          {/* Glow filters for nodes */}
          {Object.entries(eraNodeColors).map(([era, colors]) => (
            <filter key={era} id={`glow-${era}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          ))}
        </defs>
        
        {/* Background pattern */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Connections */}
        <g className="connections-group">
          {activeConnections.map((conn, index) => {
            const style = getConnectionStyle(conn.type);
            const isHighlighted =
              hoveredNode === conn.source || hoveredNode === conn.target;
            return (
              <path
                key={`${conn.source}-${conn.target}-${index}`}
                d={getConnectionPath(conn)}
                fill="none"
                stroke={style.stroke}
                strokeWidth={isHighlighted ? 2.5 : 1.8}
                strokeDasharray={style.strokeDasharray}
                opacity={
                  hoveredNode
                    ? isHighlighted
                      ? 0.9
                      : 0.2
                    : 0.6
                }
                className="connection-path"
                onClick={() => onSelectConnection(conn)}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes-group">
          {visibleNodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const highlighted = isNodeHighlighted(node.id);
            const dimmed = hoveredNode && !highlighted;
            const colors = getNodeColors(node.era);

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className={`node-group ${highlighted ? 'highlighted' : ''} ${dimmed ? 'dimmed' : ''}`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onSelectNode(node)}
              >
                {/* Outer glow on hover */}
                {highlighted && (
                  <circle
                    r={36}
                    fill={colors.glow}
                    opacity={0.3}
                    className="node-glow"
                  />
                )}
                
                {/* Node circle */}
                <circle
                  r={26}
                  fill={colors.fill}
                  stroke={highlighted ? colors.stroke : colors.fill}
                  strokeWidth={highlighted ? 3 : 0}
                  className="node-circle"
                  style={{
                    filter: highlighted ? `url(#glow-${node.era})` : "none",
                  }}
                />
                
                {/* Initials */}
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fill="white"
                  fontSize="11"
                  fontWeight="600"
                  className="node-initials"
                >
                  {node.initials}
                </text>
                
                {/* Name label */}
                <text
                  textAnchor="middle"
                  y={42}
                  fill="#94a3b8"
                  fontSize="10"
                  className="node-name"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}