import { useEffect, useState } from "react";
import { Filter } from "lucide-react";

export default function InfluenceGraph() {
  const [graph, setGraph] = useState(null);
  const [filters, setFilters] = useState({ 
    influence: true, 
    rivalry: true, 
    peers: true 
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/graph")
      .then((res) => res.json())
      .then((data) => {
        // --- LAYOUT LOGIC ---
        const nodes = data.nodes.map((node, i) => {
          // 1. Calculate X: Spread horizontally
          const x = 150 + (i * 160) + (Math.sin(i * 3) * 50);
          
          // 2. Calculate Y: Zig-zag up and down
          const y = 300 + (i % 2 === 0 ? -100 : 100);
          
          return {
            ...node,
            x,
            y,
            image: node.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(node.name)}&background=random&color=fff`,
            role: node.role || 'Unknown' 
          };
        });

        const nodeMap = {};
        nodes.forEach((n) => {
          nodeMap[n._id] = n;
        });

        setGraph({
          nodes: nodeMap,
          edges: data.edges,
          nodeList: nodes,
        });
      });
  }, []);

  if (!graph) return (
    <div className="flex items-center justify-center h-[600px] bg-slate-950 text-slate-500 font-mono text-sm border border-slate-800 rounded-xl">
      Loading Neural Web...
    </div>
  );

  const visibleEdges = graph.edges.filter(edge => filters[edge.type]);
  // Dynamic width for the SVG content
  const contentWidth = Math.max(1000, graph.nodeList.length * 180 + 200);

  return (
    <div className="relative w-full h-[600px] bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      
      {/* 1. Background Grid - FIXED: Now covers the viewport properly */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', 
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* 2. Scrollable Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar relative">
        <svg width={contentWidth} height="600" className="block">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connections */}
          {visibleEdges.map((edge, i) => {
            const source = graph.nodes[edge.sourceAuthorId];
            const target = graph.nodes[edge.targetAuthorId];

            if (!source || !target) return null;

            const color =
              edge.type === "influence" ? "#3b82f6" // Blue
              : edge.type === "rivalry" ? "#ef4444" // Red
              : "#22c55e"; // Green

            const isInfluence = edge.type === "influence";

            return (
              <g key={i}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={color}
                  strokeWidth={2}
                  strokeOpacity={0.6}
                  strokeDasharray={isInfluence ? "5,5" : ""}
                />
                {isInfluence && (
                  <circle r="2" fill={color} filter="url(#glow)">
                    <animateMotion 
                      dur="3s" 
                      repeatCount="indefinite" 
                      path={`M${source.x},${source.y} L${target.x},${target.y}`} 
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {graph.nodeList.map((author) => {
            const borderColor = author.role === 'Poet' ? '#f43f5e' : '#10b981';

            return (
              <g key={author._id} className="cursor-pointer hover:opacity-80 transition-opacity">
                <circle
                  cx={author.x}
                  cy={author.y}
                  r="32"
                  fill="#1e293b"
                  stroke={borderColor}
                  strokeWidth={2}
                  filter="url(#glow)"
                  opacity="0.6"
                />
                <foreignObject x={author.x - 28} y={author.y - 28} width="56" height="56">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800">
                    <img 
                      src={author.image} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                  </div>
                </foreignObject>
                <text
                  x={author.x}
                  y={author.y + 45}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="12"
                  fontWeight="bold"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {author.name.split(" ").pop()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 3. Sticky Controls - Moved inside the container properly */}
      <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl z-10 w-48">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
           <Filter size={12} /> Connection Types
        </h3>
        
        <div className="space-y-2">
          {['influence', 'rivalry', 'peer'].map(type => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group hover:bg-slate-800/50 p-1 rounded transition-colors">
              <input 
                type="checkbox" 
                checked={filters[type]} 
                onChange={() => setFilters(f => ({...f, [type]: !f[type]}))} 
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer" 
              />
              <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${
                type === 'influence' ? 'bg-blue-500 shadow-blue-500/50' : 
                type === 'rivalry' ? 'bg-red-500 shadow-red-500/50' : 
                'bg-green-500 shadow-green-500/50'
              }`}></div>
              <span className="text-slate-300 capitalize text-xs font-bold group-hover:text-white transition-colors select-none">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}