import { memo } from 'react';

export const BstCanvas = memo(function BstCanvas({ layout, stats, step }) {
  const { nodes, edges, width, height } = layout;
  const activeValues = new Set(step?.activeValues ?? []);
  const visitedValues = new Set(step?.visitedValues ?? []);
  const resultValues = new Set(step?.resultValues ?? []);
  const traversedEdges = new Set(step?.traversedEdges ?? []);

  return (
    <section className="canvas-panel" aria-label="Binary search tree canvas">
      <div className="canvas-meta">
        <span>N={stats.size}, h={stats.height}</span>
      </div>
      <svg
        className="tree-canvas"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Rendered binary search tree"
      >
        <defs>
          <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.18" />
          </filter>
        </defs>

        <g className="edges">
          {edges.map((edge) => {
            const currentEdge = `${edge.fromValue}->${edge.toValue}`;

            return (
              <TreeEdge
                key={edge.id}
                edge={edge}
                isCurrent={traversedEdges.has(currentEdge)}
                isVisited={visitedValues.has(edge.fromValue) && visitedValues.has(edge.toValue)}
              />
            );
          })}
        </g>

        <g className="nodes">
          {nodes.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              isActive={activeValues.has(node.value)}
              isVisited={visitedValues.has(node.value)}
              isResult={resultValues.has(node.value)}
            />
          ))}
        </g>
      </svg>
    </section>
  );
});

const TreeEdge = memo(function TreeEdge({ edge, isCurrent, isVisited }) {
  return (
    <g>
      <line
        className={[isVisited ? 'is-visited' : '', isCurrent ? 'is-active' : '']
          .filter(Boolean)
          .join(' ')}
        x1={edge.x1}
        y1={edge.y1}
        x2={edge.x2}
        y2={edge.y2}
        vectorEffect="non-scaling-stroke"
      />
      {isCurrent && (
        <circle className="edge-runner" r="5">
          <animateMotion
            dur="0.75s"
            repeatCount="indefinite"
            path={`M ${edge.x1} ${edge.y1} L ${edge.x2} ${edge.y2}`}
          />
        </circle>
      )}
    </g>
  );
});

const TreeNode = memo(function TreeNode({ node, isActive, isVisited, isResult }) {
  return (
    <g
      className={[
        isVisited ? 'is-visited' : '',
        isActive ? 'is-active' : '',
        isResult ? 'is-result' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      transform={`translate(${node.x} ${node.y})`}
    >
      <circle r="24" />
      <text textAnchor="middle" dominantBaseline="central">
        {node.value}
      </text>
    </g>
  );
});
