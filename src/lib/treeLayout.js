const NODE_RADIUS = 24;
const LEVEL_GAP = 94;
const HORIZONTAL_GAP = 86;
const SIDE_PADDING = NODE_RADIUS * 2;

function collectLayout(node, depth, nodes, edges, cursor) {
  if (!node) {
    return null;
  }

  const left = collectLayout(node.left, depth + 1, nodes, edges, cursor);
  const positioned = {
    id: node.id,
    value: node.value,
    x: SIDE_PADDING + cursor.index * HORIZONTAL_GAP,
    y: depth * LEVEL_GAP + NODE_RADIUS,
    depth,
  };

  cursor.index += 1;
  nodes.push(positioned);

  const right = collectLayout(node.right, depth + 1, nodes, edges, cursor);

  if (left) {
    edges.push({
      id: `${node.id}-${node.left.id}`,
      from: node.id,
      to: node.left.id,
      fromValue: node.value,
      toValue: node.left.value,
      x1: positioned.x,
      y1: positioned.y,
      x2: left.x,
      y2: left.y,
    });
  }

  if (right) {
    edges.push({
      id: `${node.id}-${node.right.id}`,
      from: node.id,
      to: node.right.id,
      fromValue: node.value,
      toValue: node.right.value,
      x1: positioned.x,
      y1: positioned.y,
      x2: right.x,
      y2: right.y,
    });
  }

  return positioned;
}

export function layoutTree(root) {
  if (!root) {
    return {
      nodes: [],
      edges: [],
      width: 360,
      height: 320,
    };
  }

  const nodes = [];
  const edges = [];

  collectLayout(root, 0, nodes, edges, { index: 0 });

  const maxX = nodes.reduce((max, node) => Math.max(max, node.x), 0);
  const maxY = nodes.reduce((max, node) => Math.max(max, node.y), 0);

  return {
    nodes,
    edges,
    width: Math.max(360, maxX + SIDE_PADDING),
    height: Math.max(320, maxY + NODE_RADIUS * 3),
  };
}
