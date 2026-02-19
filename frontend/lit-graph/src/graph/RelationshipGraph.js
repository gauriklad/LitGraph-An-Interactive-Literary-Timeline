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

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/graph");
        const data = await response.json();
        setAuthorNodes(data.nodes || []);
        const formattedConnections = (data.connections || []).map(conn => ({
          ...conn, 
          source: conn.sourceAuthorId || conn.source,
          target: conn.targetAuthorId || conn.target,
          description: conn.description, 
          id: conn._id || conn.id
        }));

        setAuthorConnections(formattedConnections);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching graph data:", error);
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);


  const eraNodeColors = {
    neoclassical: {
      fill: "hsl(145, 25%, 35%)",
      stroke: "hsl(145, 30%, 55%)",
      glow: "hsl(145, 30%, 45%)",
      ring: "hsl(145, 30%, 60%)",
    },
    romantic: {
      fill: "hsl(340, 45%, 55%)",
      stroke: "hsl(340, 50%, 68%)",
      glow: "hsl(340, 50%, 60%)",
      ring: "hsl(340, 50%, 70%)",
    },
    victorian: {
      fill: "hsl(35, 35%, 50%)",
      stroke: "hsl(35, 40%, 63%)",
      glow: "hsl(35, 40%, 55%)",
      ring: "hsl(35, 40%, 65%)",
    },
    modern: {
      fill: "hsl(210, 40%, 50%)",
      stroke: "hsl(210, 45%, 63%)",
      glow: "hsl(210, 45%, 55%)",
      ring: "hsl(210, 45%, 65%)",
    },
    postmodern: {
      fill: "hsl(280, 40%, 55%)",
      stroke: "hsl(280, 45%, 68%)",
      glow: "hsl(280, 45%, 60%)",
      ring: "hsl(280, 45%, 70%)",
    },
  };

  const activeConnections = useMemo(() => {
    return authorConnections.filter((conn) => {
      if (conn.type === "influence" && filters.influence) return true;
      if (conn.type === "rivalry" && filters.rivalry) return true;
      if (conn.type === "peers" && filters.peers) return true;
      return false;
    });
  }, [filters, authorConnections]);

  const visibleNodeIds = useMemo(() => {
    const ids = new Set();
    activeConnections.forEach((conn) => {
      ids.add(conn.source);
      ids.add(conn.target);
    });
    return ids;
  }, [activeConnections]);

  const visibleNodes = useMemo(() => {
    if (!filters.influence && !filters.rivalry && !filters.peers) {
      return authorNodes;
    }
    return authorNodes.filter((node) => visibleNodeIds.has(node.id));
  }, [visibleNodeIds, filters, authorNodes]);

  const nodePositions = useMemo(() => {
    const positions = {};
    const centerX = 450;
    const centerY = 320;
    const nodeCount = visibleNodes.length;

    if (nodeCount <= 6) {
      const radius = 200;
      visibleNodes.forEach((node, index) => {
        const angle = (index / nodeCount) * 2 * Math.PI - Math.PI / 2;
        positions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      });
    } else {
      const innerRing = Math.ceil(nodeCount * 0.4);
      const outerRing = nodeCount - innerRing;
      const innerRadius = 160;
      const outerRadius = 250;

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
      const len = Math.sqrt(dx * dx + dy * dy);
      const offset = len * 0.1;
      const controlX = midX - (dy / len) * offset;
      const controlY = midY + (dx / len) * offset;

      return `M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}`;
    },
    [nodePositions]
  );

  const getConnectionStyle = (type) => {
    switch (type) {
      case "influence": return { stroke: "#60a5fa" };
      case "rivalry":   return { stroke: "#f87171" };
      case "peers":     return { stroke: "#34d399" };
      default:          return { stroke: "#64748b" };
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

  const getNodeColors = (era) =>
    eraNodeColors[era] || eraNodeColors.neoclassical;

  const NODE_R = 28;
  const IMAGE_R = NODE_R;
  const IMAGE_SIZE = IMAGE_R * 2;

  if (loading) {
    return (
      <div className="graph-loading">
        <div className="graph-loading-dots">
          <div className="graph-loading-dot" />
          <div className="graph-loading-dot" />
          <div className="graph-loading-dot" />
        </div>
      </div>
    );
  }

  return (
    <div className="relationship-graph">
      <svg viewBox="0 0 900 640" className="graph-svg">
        <defs>
          {/* Subtle grid */}
          <pattern id="rg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#1e293b"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </pattern>

          {/* Per-node circular clip paths */}
          {visibleNodes.map((node) => (
            <clipPath key={`clip-${node.id}`} id={`clip-${node.id}`}>
              <circle cx="0" cy="0" r={IMAGE_R} />
            </clipPath>
          ))}

          {/* Glow filters per era */}
          {Object.entries(eraNodeColors).map(([era, colors]) => (
            <filter key={era} id={`glow-${era}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Background grid */}
        <rect width="100%" height="100%" fill="url(#rg-grid)" />

        {/* ── CONNECTIONS ── */}
        <g>
          {activeConnections.map((conn, idx) => {
            const style = getConnectionStyle(conn.type);
            const isHl = hoveredNode === conn.source || hoveredNode === conn.target;
            return (
              <path
                key={`${conn.source}-${conn.target}-${idx}`}
                d={getConnectionPath(conn)}
                fill="none"
                stroke={style.stroke}
                strokeWidth={isHl ? 5 : 3.5}
                opacity={hoveredNode ? (isHl ? 0.9 : 0.15) : 0.55}
                className="connection-path"
                onClick={() => onSelectConnection(conn)}
              />
            );
          })}
        </g>

        {/* ── NODES ── */}
        <g>
          {visibleNodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const highlighted = isNodeHighlighted(node.id);
            const dimmed = hoveredNode && !highlighted;
            const colors = getNodeColors(node.era);
            const hasImage = !!node.image;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className={`node-group ${highlighted ? "highlighted" : ""} ${dimmed ? "dimmed" : ""}`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onSelectNode(node)}
              >
                {/* Pulse ring on highlight */}
                {highlighted && (
                  <circle
                    r={NODE_R + 10}
                    fill={colors.glow}
                    opacity={0.25}
                    className="node-glow"
                  />
                )}

                {/* Era-colored ring border */}
                <circle
                  r={NODE_R + 2}
                  fill={colors.fill}
                  stroke={highlighted ? colors.ring : colors.stroke}
                  strokeWidth={highlighted ? 3 : 1.5}
                  style={{ filter: highlighted ? `url(#glow-${node.era})` : "none" }}
                />

                {/* Photo or fallback */}
                {hasImage ? (
                  <>
                    <circle r={NODE_R} fill="#1e293b" />
                    <image
                      href={node.image}
                      x={-IMAGE_R}
                      y={-IMAGE_R}
                      width={IMAGE_SIZE}
                      height={IMAGE_SIZE}
                      clipPath={`url(#clip-${node.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                    <circle
                      r={NODE_R}
                      fill="url(#vignette)"
                      opacity={0.25}
                    />
                  </>
                ) : (
                  <>
                    <circle r={NODE_R} fill={colors.fill} />
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fill="white"
                      fontSize="11"
                      fontWeight="700"
                      className="node-initials"
                    >
                      {node.initials}
                    </text>
                  </>
                )}

                {/* Name label below node */}
                <text
                  textAnchor="middle"
                  y={NODE_R + 16}
                  fill={highlighted ? "#e2e8f0" : "#94a3b8"}
                  fontSize="10"
                  fontWeight={highlighted ? "600" : "400"}
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