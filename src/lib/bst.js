function nodeId(value) {
  return `node-${String(value).replaceAll('.', '_')}`;
}

export function createNode(value) {
  return {
    id: nodeId(value),
    value,
    left: null,
    right: null,
  };
}

export function cloneTree(root) {
  if (!root) {
    return null;
  }

  return {
    ...root,
    left: cloneTree(root.left),
    right: cloneTree(root.right),
  };
}

export function insert(root, value) {
  if (!root) {
    return createNode(value);
  }

  if (value < root.value) {
    return {
      ...root,
      left: insert(root.left, value),
    };
  }

  if (value > root.value) {
    return {
      ...root,
      right: insert(root.right, value),
    };
  }

  return root;
}

export function remove(root, value) {
  if (!root) {
    return null;
  }

  if (value < root.value) {
    return { ...root, left: remove(root.left, value) };
  }

  if (value > root.value) {
    return { ...root, right: remove(root.right, value) };
  }

  if (!root.left && !root.right) {
    return null;
  }

  if (!root.left) {
    return root.right;
  }

  if (!root.right) {
    return root.left;
  }

  const successor = minNode(root.right);

  return {
    ...successor,
    left: root.left,
    right: remove(root.right, successor.value),
  };
}

export function parseValues(input) {
  const tokens = input
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);

  const values = [];
  const invalidTokens = [];

  for (const token of tokens) {
    const value = Number(token);

    if (!Number.isFinite(value)) {
      invalidTokens.push(token);
    } else {
      values.push(value);
    }
  }

  return { values, invalidTokens };
}

export function parseSingleValue(input) {
  if (String(input).trim() === '') {
    return { value: null, error: 'Enter a numeric value.' };
  }

  const value = Number(String(input).trim());

  if (!Number.isFinite(value)) {
    return { value: null, error: 'Enter a numeric value.' };
  }

  return { value, error: '' };
}

export function buildTree(values) {
  return values.reduce((root, value) => insert(root, value), null);
}

export function getTreeStats(root) {
  if (!root) {
    return { size: 0, height: 0 };
  }

  const left = getTreeStats(root.left);
  const right = getTreeStats(root.right);

  return {
    size: 1 + left.size + right.size,
    height: 1 + Math.max(left.height, right.height),
  };
}

export function minNode(root) {
  let current = root;

  while (current?.left) {
    current = current.left;
  }

  return current;
}

export function maxNode(root) {
  let current = root;

  while (current?.right) {
    current = current.right;
  }

  return current;
}

function line(operation, number) {
  return `${operation}:${number}`;
}

function edgeKey(from, to) {
  return `${from}->${to}`;
}

function makeStep({
  operation,
  tree,
  lineNumber,
  message,
  activeValues = [],
  visitedValues = [],
  resultValues = [],
  traversedEdges = [],
  pathLength = 0,
}) {
  return {
    operation,
    tree: cloneTree(tree),
    line: line(operation, lineNumber),
    message,
    activeValues: [...activeValues],
    visitedValues: [...visitedValues],
    resultValues: [...resultValues],
    traversedEdges: [...traversedEdges],
    pathLength,
  };
}

function appendFinalStep(steps, operation, tree, message, resultValues = []) {
  const previous = steps.at(-1);

  steps.push(
    makeStep({
      operation,
      tree,
      lineNumber: 0,
      message,
      resultValues,
      visitedValues: previous?.visitedValues ?? [],
      traversedEdges: previous?.traversedEdges ?? [],
      pathLength: previous?.pathLength ?? 0,
    }),
  );
}

function traceInsertSteps(root, value, operation) {
  const steps = [];
  const visited = [];
  let current = root;
  let parent = null;
  let traversedEdge = [];

  while (current) {
    visited.push(current.value);
    steps.push(
      makeStep({
        operation,
        tree: root,
        lineNumber: operation === 'create' ? 4 : 2,
        message: `Compare ${value} with ${current.value}.`,
        activeValues: [current.value],
        visitedValues: visited,
        traversedEdges: traversedEdge,
        pathLength: visited.length,
      }),
    );

    if (value === current.value) {
      steps.push(
        makeStep({
          operation,
          tree: root,
          lineNumber: operation === 'create' ? 4 : 3,
          message: `${value} already exists, so the BST is unchanged.`,
          activeValues: [current.value],
          visitedValues: visited,
          resultValues: [current.value],
          traversedEdges: traversedEdge,
          pathLength: visited.length,
        }),
      );
      return { tree: root, steps };
    }

    parent = current;
    const next = value < current.value ? current.left : current.right;
    const direction = value < current.value ? 'left' : 'right';

    if (next) {
      traversedEdge = [edgeKey(current.value, next.value)];
      steps.push(
        makeStep({
          operation,
          tree: root,
          lineNumber: operation === 'create' ? 4 : 4,
          message: `${value} is ${direction === 'left' ? 'smaller' : 'larger'} than ${current.value}, so move ${direction}.`,
          activeValues: [current.value, next.value],
          visitedValues: visited,
          traversedEdges: traversedEdge,
          pathLength: visited.length,
        }),
      );
    }

    current = next;
  }

  const nextTree = insert(root, value);
  const attachEdge = parent ? [edgeKey(parent.value, value)] : [];

  steps.push(
    makeStep({
      operation,
      tree: nextTree,
      lineNumber: operation === 'create' ? 4 : 5,
      message: parent
        ? `Attach ${value} as a ${value < parent.value ? 'left' : 'right'} child of ${parent.value}.`
        : `Insert ${value} as the root node.`,
      activeValues: parent ? [parent.value, value] : [value],
      visitedValues: parent ? [...visited, value] : [value],
      resultValues: [value],
      traversedEdges: attachEdge,
      pathLength: visited.length + 1,
    }),
  );

  return { tree: nextTree, steps };
}

export function traceCreate(values, invalidTokens = []) {
  const operation = 'create';
  const steps = [
    makeStep({
      operation,
      tree: null,
      lineNumber: 2,
      message: 'Start with an empty BST.',
    }),
  ];

  let root = null;

  for (const value of values) {
    steps.push(
      makeStep({
        operation,
        tree: root,
        lineNumber: 3,
        message: `Read ${value} from the input list.`,
        activeValues: [value],
      }),
    );
    const insertion = traceInsertSteps(root, value, operation);
    root = insertion.tree;
    steps.push(...insertion.steps);
  }

  const suffix =
    invalidTokens.length > 0
      ? ` Invalid token(s) skipped: ${invalidTokens.join(', ')}.`
      : '';
  appendFinalStep(
    steps,
    operation,
    root,
    `Created a BST with ${getTreeStats(root).size} node(s).${suffix}`,
  );

  return { tree: root, steps };
}

export function traceSearch(root, value) {
  const operation = 'search';
  const steps = [];
  const visited = [];
  let current = root;

  steps.push(
    makeStep({
      operation,
      tree: root,
      lineNumber: 1,
      message: `Search for ${value} starting at the root.`,
    }),
  );

  while (current) {
    visited.push(current.value);
    steps.push(
      makeStep({
        operation,
        tree: root,
        lineNumber: 2,
        message: `Compare ${value} with ${current.value}.`,
        activeValues: [current.value],
        visitedValues: visited,
        pathLength: visited.length,
      }),
    );

    if (value === current.value) {
      steps.push(
        makeStep({
          operation,
          tree: root,
          lineNumber: 3,
          message: `${value} is found in the tree.`,
          activeValues: [current.value],
          visitedValues: visited,
          resultValues: [current.value],
          pathLength: visited.length,
        }),
      );
      return { tree: root, steps };
    }

    if (value < current.value) {
      const next = current.left;
      steps.push(
        makeStep({
          operation,
          tree: root,
          lineNumber: 4,
          message: `${value} is smaller than ${current.value}, so move left.`,
          activeValues: [current.value],
          visitedValues: visited,
          traversedEdges: next ? [edgeKey(current.value, next.value)] : [],
          pathLength: visited.length,
        }),
      );
      current = next;
    } else {
      const next = current.right;
      steps.push(
        makeStep({
          operation,
          tree: root,
          lineNumber: 5,
          message: `${value} is larger than ${current.value}, so move right.`,
          activeValues: [current.value],
          visitedValues: visited,
          traversedEdges: next ? [edgeKey(current.value, next.value)] : [],
          pathLength: visited.length,
        }),
      );
      current = next;
    }
  }

  appendFinalStep(
    steps,
    operation,
    root,
    `${value} is not in the tree; the search ended at an empty child.`,
  );

  return { tree: root, steps };
}

export function traceInsert(root, value) {
  const operation = 'insert';
  const startStep =
    makeStep({
      operation,
      tree: root,
      lineNumber: 1,
      message: `Insert ${value} into the BST.`,
    });
  const insertion = traceInsertSteps(root, value, operation);

  return { tree: insertion.tree, steps: [startStep, ...insertion.steps] };
}

export function traceRemove(root, value) {
  const operation = 'remove';
  const steps = [];
  const visited = [];
  let current = root;

  steps.push(
    makeStep({
      operation,
      tree: root,
      lineNumber: 1,
      message: `Remove ${value} from the BST.`,
    }),
  );

  while (current && current.value !== value) {
    visited.push(current.value);
    const next = value < current.value ? current.left : current.right;
    steps.push(
      makeStep({
        operation,
        tree: root,
        lineNumber: 2,
        message: `Compare ${value} with ${current.value}.`,
        activeValues: [current.value],
        visitedValues: visited,
        pathLength: visited.length,
      }),
    );

    if (next) {
      const direction = value < current.value ? 'left' : 'right';
      steps.push(
        makeStep({
          operation,
          tree: root,
          lineNumber: 2,
          message: `${value} is ${direction === 'left' ? 'smaller' : 'larger'} than ${current.value}, so move ${direction}.`,
          activeValues: [current.value, next.value],
          visitedValues: visited,
          traversedEdges: [edgeKey(current.value, next.value)],
          pathLength: visited.length,
        }),
      );
    }

    current = next;
  }

  if (!current) {
    appendFinalStep(
      steps,
      operation,
      root,
      `${value} is not in the tree, so nothing is removed.`,
    );
    return { tree: root, steps };
  }

  visited.push(current.value);
  const hasLeft = Boolean(current.left);
  const hasRight = Boolean(current.right);

  steps.push(
    makeStep({
      operation,
      tree: root,
      lineNumber: 3,
      message: `Found ${value}; inspect its children before deleting it.`,
      activeValues: [current.value],
      visitedValues: visited,
      resultValues: [current.value],
      pathLength: visited.length,
    }),
  );

  if (!hasLeft && !hasRight) {
    const nextTree = remove(root, value);
    appendFinalStep(
      steps,
      operation,
      nextTree,
      `${value} was a leaf node, so it was removed directly.`,
    );
    return { tree: nextTree, steps };
  }

  if (!hasLeft || !hasRight) {
    const childValue = hasLeft ? current.left.value : current.right.value;
    const nextTree = remove(root, value);
    appendFinalStep(
      steps,
      operation,
      nextTree,
      `${value} had one child, so ${childValue} was linked to its parent.`,
      [childValue],
    );
    return { tree: nextTree, steps };
  }

  let successor = current.right;
  const successorVisited = [...visited, successor.value];
  steps.push(
    makeStep({
      operation,
      tree: root,
      lineNumber: 6,
      message: `${value} has two children; search the right subtree for its successor.`,
      activeValues: [current.value, successor.value],
      visitedValues: successorVisited,
      traversedEdges: [edgeKey(current.value, successor.value)],
      pathLength: successorVisited.length,
    }),
  );

  while (successor.left) {
    const next = successor.left;
    successorVisited.push(next.value);
    steps.push(
      makeStep({
        operation,
        tree: root,
        lineNumber: 6,
        message: `${next.value} is smaller than ${successor.value}, so continue left while finding the successor.`,
        activeValues: [successor.value, next.value],
        visitedValues: successorVisited,
        traversedEdges: [edgeKey(successor.value, next.value)],
        pathLength: successorVisited.length,
      }),
    );
    successor = next;
  }

  steps.push(
    makeStep({
      operation,
      tree: root,
      lineNumber: 7,
      message: `${successor.value} is the leftmost node in the right subtree, so it is the successor.`,
      activeValues: [successor.value],
      visitedValues: successorVisited,
      resultValues: [successor.value],
      pathLength: successorVisited.length,
    }),
  );

  const nextTree = remove(root, value);
  appendFinalStep(
    steps,
    operation,
    nextTree,
    `${value} was replaced by successor ${successor.value}, then the old successor node was removed.`,
    [successor.value],
  );

  return { tree: nextTree, steps };
}

export function traceSuccessor(root, value) {
  const operation = 'successor';
  const steps = [];
  const visited = [];
  let current = root;
  let candidate = null;

  steps.push(
    makeStep({
      operation,
      tree: root,
      lineNumber: 1,
      message: `Find the successor of ${value}: the smallest key greater than ${value}.`,
    }),
  );

  while (current) {
    visited.push(current.value);

    if (value < current.value) {
      candidate = current;
      const next = current.left;
      steps.push(
        makeStep({
          operation,
          tree: root,
          lineNumber: 3,
          message: `${current.value} is greater than ${value}, so it is the best successor candidate so far.`,
          activeValues: [current.value],
          visitedValues: visited,
          resultValues: [candidate.value],
          traversedEdges: next ? [edgeKey(current.value, next.value)] : [],
          pathLength: visited.length,
        }),
      );
      current = next;
    } else {
      const next = current.right;
      steps.push(
        makeStep({
          operation,
          tree: root,
          lineNumber: 4,
          message: `${current.value} is not greater than ${value}, so move right.`,
          activeValues: [current.value],
          visitedValues: visited,
          traversedEdges: next ? [edgeKey(current.value, next.value)] : [],
          pathLength: visited.length,
        }),
      );
      current = next;
    }
  }

  const previous = steps.at(-1);
  steps.push(
    makeStep({
      operation,
      tree: root,
      lineNumber: 5,
      message: candidate
        ? `The successor of ${value} is ${candidate.value}.`
        : `${value} has no successor in this tree.`,
      activeValues: candidate ? [candidate.value] : previous?.activeValues ?? [],
      visitedValues: previous?.visitedValues ?? [],
      resultValues: candidate ? [candidate.value] : [],
      pathLength: previous?.pathLength ?? 0,
    }),
  );

  return { tree: root, steps };
}

export function tracePredecessor(root, value) {
  const operation = 'predecessor';
  const steps = [];
  const visited = [];
  let current = root;
  let candidate = null;

  steps.push(
    makeStep({
      operation,
      tree: root,
      lineNumber: 1,
      message: `Find the predecessor of ${value}: the largest key smaller than ${value}.`,
    }),
  );

  while (current) {
    visited.push(current.value);

    if (value > current.value) {
      candidate = current;
      const next = current.right;
      steps.push(
        makeStep({
          operation,
          tree: root,
          lineNumber: 3,
          message: `${current.value} is smaller than ${value}, so it is the best predecessor candidate so far.`,
          activeValues: [current.value],
          visitedValues: visited,
          resultValues: [candidate.value],
          traversedEdges: next ? [edgeKey(current.value, next.value)] : [],
          pathLength: visited.length,
        }),
      );
      current = next;
    } else {
      const next = current.left;
      steps.push(
        makeStep({
          operation,
          tree: root,
          lineNumber: 4,
          message: `${current.value} is not smaller than ${value}, so move left.`,
          activeValues: [current.value],
          visitedValues: visited,
          traversedEdges: next ? [edgeKey(current.value, next.value)] : [],
          pathLength: visited.length,
        }),
      );
      current = next;
    }
  }

  const previous = steps.at(-1);
  steps.push(
    makeStep({
      operation,
      tree: root,
      lineNumber: 5,
      message: candidate
        ? `The predecessor of ${value} is ${candidate.value}.`
        : `${value} has no predecessor in this tree.`,
      activeValues: candidate ? [candidate.value] : previous?.activeValues ?? [],
      visitedValues: previous?.visitedValues ?? [],
      resultValues: candidate ? [candidate.value] : [],
      pathLength: previous?.pathLength ?? 0,
    }),
  );

  return { tree: root, steps };
}

function subtreeSize(node) {
  return node ? getTreeStats(node).size : 0;
}

export function traceSelect(root, k) {
  const operation = 'select';
  const steps = [];
  const stats = getTreeStats(root);
  const visited = [];
  let current = root;
  let rank = k;

  steps.push(
    makeStep({
      operation,
      tree: root,
      lineNumber: 1,
      message: `Select the ${k}${ordinalSuffix(k)} smallest key.`,
    }),
  );

  if (!Number.isInteger(k) || k < 1 || k > stats.size) {
    appendFinalStep(
      steps,
      operation,
      root,
      `k must be an integer from 1 to ${stats.size}.`,
    );
    return { tree: root, steps };
  }

  while (current) {
    visited.push(current.value);
    const leftSize = subtreeSize(current.left);

    steps.push(
      makeStep({
        operation,
        tree: root,
        lineNumber: 2,
        message: `${current.value} has ${leftSize} node(s) in its left subtree.`,
        activeValues: [current.value],
        visitedValues: visited,
        pathLength: visited.length,
      }),
    );

    if (rank === leftSize + 1) {
      appendFinalStep(
        steps,
        operation,
        root,
        `The ${k}${ordinalSuffix(k)} smallest key is ${current.value}.`,
        [current.value],
      );
      return { tree: root, steps };
    }

    if (rank <= leftSize) {
      const next = current.left;
      steps.push(
        makeStep({
          operation,
          tree: root,
          lineNumber: 4,
          message: `k is within the left subtree, so move left from ${current.value}.`,
          activeValues: [current.value],
          visitedValues: visited,
          traversedEdges: next ? [edgeKey(current.value, next.value)] : [],
          pathLength: visited.length,
        }),
      );
      current = next;
    } else {
      rank -= leftSize + 1;
      const next = current.right;
      steps.push(
        makeStep({
          operation,
          tree: root,
          lineNumber: 5,
          message: `Skip ${current.value} and its left subtree, then move right with k=${rank}.`,
          activeValues: [current.value],
          visitedValues: visited,
          traversedEdges: next ? [edgeKey(current.value, next.value)] : [],
          pathLength: visited.length,
        }),
      );
      current = next;
    }
  }

  return { tree: root, steps };
}

export function traceTraversal(root, order) {
  const operation = order;
  const steps = [];
  const result = [];

  steps.push(
    makeStep({
      operation,
      tree: root,
      lineNumber: 1,
      message: `Start ${orderLabel(order)} traversal at the root.`,
    }),
  );

  function addMove(parent, child, lineNumber) {
    if (!child) {
      return;
    }

    steps.push(
      makeStep({
        operation,
        tree: root,
        lineNumber,
        message: `Move from ${parent.value} to ${child.value} to continue ${orderLabel(order)} traversal.`,
        activeValues: [parent.value, child.value],
        visitedValues: result,
        resultValues: [...result],
        traversedEdges: [edgeKey(parent.value, child.value)],
        pathLength: result.length,
      }),
    );
  }

  function addVisit(node, lineNumber, message) {
    result.push(node.value);
    steps.push(
      makeStep({
        operation,
        tree: root,
        lineNumber,
        message,
        activeValues: [node.value],
        visitedValues: result,
        resultValues: [...result],
        pathLength: result.length,
      }),
    );
  }

  function visit(node) {
    if (!node) {
      return;
    }

    if (order === 'preorder') {
      addVisit(node, 2, `Visit ${node.value} before its children.`);
    }

    addMove(node, node.left, order === 'preorder' ? 3 : 2);
    visit(node.left);

    if (order === 'inorder') {
      addVisit(node, 3, `Visit ${node.value} after its left subtree.`);
    }

    addMove(node, node.right, order === 'postorder' ? 3 : 4);
    visit(node.right);

    if (order === 'postorder') {
      addVisit(node, 4, `Visit ${node.value} after both children.`);
    }
  }

  visit(root);
  appendFinalStep(
    steps,
    operation,
    root,
    `${orderLabel(order)} traversal result: ${result.join(', ') || 'empty tree'}.`,
    result,
  );

  return { tree: root, steps };
}

function orderLabel(order) {
  return {
    inorder: 'inorder',
    preorder: 'preorder',
    postorder: 'postorder',
  }[order];
}

function ordinalSuffix(value) {
  if (!Number.isFinite(value)) {
    return '';
  }

  const mod100 = value % 100;
  const mod10 = value % 10;

  if (mod100 >= 11 && mod100 <= 13) {
    return 'th';
  }

  if (mod10 === 1) return 'st';
  if (mod10 === 2) return 'nd';
  if (mod10 === 3) return 'rd';
  return 'th';
}

export const PSEUDOCODE = {
  create: [
    'create(values):',
    '  root = empty',
    '  for each value:',
    '    root = insert(root, value)',
  ],
  search: [
    'search(root, value):',
    '  while node is not empty:',
    '    if value == node.value: return node',
    '    if value < node.value: node = node.left',
    '    else: node = node.right',
  ],
  insert: [
    'insert(root, value):',
    '  while node is not empty:',
    '    if value == node.value: stop',
    '    move left or right by comparison',
    '  attach value at the empty child',
  ],
  remove: [
    'remove(root, value):',
    '  search for value',
    '  inspect matching node',
    '  if leaf: remove it',
    '  if one child: link child upward',
    '  if two children: find successor',
    '  replace value and remove successor',
  ],
  successor: [
    'successor(root, value):',
    '  candidate = empty',
    '  if value < node.value: candidate = node; go left',
    '  else: go right',
    '  return candidate',
  ],
  predecessor: [
    'predecessor(root, value):',
    '  candidate = empty',
    '  if value > node.value: candidate = node; go right',
    '  else: go left',
    '  return candidate',
  ],
  select: [
    'select(root, k):',
    '  leftSize = size(node.left)',
    '  if k == leftSize + 1: return node',
    '  if k <= leftSize: go left',
    '  else: k -= leftSize + 1; go right',
  ],
  inorder: [
    'inorder(node):',
    '  inorder(node.left)',
    '  visit node',
    '  inorder(node.right)',
  ],
  preorder: [
    'preorder(node):',
    '  visit node',
    '  preorder(node.left)',
    '  preorder(node.right)',
  ],
  postorder: [
    'postorder(node):',
    '  postorder(node.left)',
    '  postorder(node.right)',
    '  visit node',
  ],
};
