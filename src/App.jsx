import { useEffect, useMemo, useState } from 'react';
import {
  FastForward,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
} from 'lucide-react';
import {
  PSEUDOCODE,
  buildTree,
  getTreeStats,
  parseSingleValue,
  parseValues,
  traceCreate,
  traceInsert,
  tracePredecessor,
  traceRemove,
  traceSearch,
  traceSelect,
  traceSuccessor,
  traceTraversal,
} from './lib/bst.js';
import { layoutTree } from './lib/treeLayout.js';
import { BstCanvas } from './components/BstCanvas.jsx';

const SAMPLE_INPUT = '50,30,70,20,40,60,80';
const INITIAL_TREE = buildTree(parseValues(SAMPLE_INPUT).values);
const INITIAL_TRACE = traceCreate(parseValues(SAMPLE_INPUT).values).steps;

const operationLabels = {
  create: 'Create',
  search: 'Search',
  insert: 'Insert',
  remove: 'Remove',
  successor: 'Successor',
  predecessor: 'Predecessor',
  select: 'Select(k)',
  inorder: 'Inorder',
  preorder: 'Preorder',
  postorder: 'Postorder',
};

function treeLayoutKey(node) {
  if (!node) {
    return 'empty';
  }

  return `${node.value}(${treeLayoutKey(node.left)})(${treeLayoutKey(node.right)})`;
}

function App() {
  const [tree, setTree] = useState(INITIAL_TREE);
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [valueInput, setValueInput] = useState('60');
  const [kInput, setKInput] = useState('3');
  const [trace, setTrace] = useState(INITIAL_TRACE);
  const [stepIndex, setStepIndex] = useState(INITIAL_TRACE.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [lastRunner, setLastRunner] = useState('create');

  const activeStep = trace[stepIndex] ?? null;
  const visibleTree = activeStep?.tree ?? tree;
  const visibleTreeKey = treeLayoutKey(visibleTree);
  const layout = useMemo(() => layoutTree(visibleTree), [visibleTreeKey]);
  const stats = useMemo(() => getTreeStats(visibleTree), [visibleTreeKey]);
  const operation = activeStep?.operation ?? lastRunner;
  const pathLength = activeStep?.pathLength ?? 0;

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    if (stepIndex >= trace.length - 1) {
      setIsPlaying(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setStepIndex((index) => Math.min(index + 1, trace.length - 1));
    }, 900 / speed);

    return () => window.clearTimeout(timer);
  }, [isPlaying, speed, stepIndex, trace.length]);

  function loadTrace(result, runner) {
    setTree(result.tree);
    setTrace(result.steps);
    setStepIndex(0);
    setIsPlaying(result.steps.length > 1);
    setLastRunner(runner);
  }

  function runCreate(event) {
    event?.preventDefault();
    const parsed = parseValues(input);
    loadTrace(traceCreate(parsed.values, parsed.invalidTokens), 'create');
  }

  function readValue() {
    const parsed = parseSingleValue(valueInput);

    if (parsed.error) {
      return { error: parsed.error };
    }

    return parsed;
  }

  function runValueOperation(type) {
    const parsed = readValue();

    if (parsed.error) {
      setTrace([
        {
          operation: type,
          tree,
          line: `${type}:0`,
          message: parsed.error,
          activeValues: [],
          visitedValues: [],
          resultValues: [],
          pathLength: 0,
        },
      ]);
      setStepIndex(0);
      setIsPlaying(false);
      return;
    }

    const traceByType = {
      search: traceSearch,
      insert: traceInsert,
      remove: traceRemove,
      successor: traceSuccessor,
      predecessor: tracePredecessor,
    };

    loadTrace(traceByType[type](tree, parsed.value), type);
  }

  function runSelect() {
    const k = Number(kInput);
    loadTrace(traceSelect(tree, k), 'select');
  }

  function runTraversal(order) {
    loadTrace(traceTraversal(tree, order), order);
  }

  function playFromStart() {
    setStepIndex(0);
    setIsPlaying(true);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          B
        </div>
        <div>
          <p className="eyebrow">Exploration Mode</p>
          <h1>Binary Search Tree</h1>
        </div>
        <nav aria-label="Visualizer sections">
          <a aria-current="page" href="#bst">
            BST
          </a>
        </nav>
      </header>

      <div className="workspace" id="bst">
        <aside className="control-panel" aria-label="BST controls">
          <form onSubmit={runCreate} className="create-form">
            <label htmlFor="tree-values">Create tree</label>
            <div className="input-row">
              <input
                id="tree-values"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="50,30,70"
              />
              <button type="submit">Create</button>
            </div>
          </form>

          <div className="operation-group">
            <label htmlFor="operation-value">Value operations</label>
            <input
              id="operation-value"
              value={valueInput}
              onChange={(event) => setValueInput(event.target.value)}
              placeholder="value"
            />
            <div className="tool-list compact" aria-label="BST value operations">
              <button type="button" onClick={() => runValueOperation('search')}>
                Search(v)
              </button>
              <button type="button" onClick={() => runValueOperation('insert')}>
                Insert(v)
              </button>
              <button type="button" onClick={() => runValueOperation('remove')}>
                Remove(v)
              </button>
              <button type="button" onClick={() => runValueOperation('predecessor')}>
                Predecessor(v)
              </button>
              <button type="button" onClick={() => runValueOperation('successor')}>
                Successor(v)
              </button>
            </div>
          </div>

          <div className="operation-group">
            <label htmlFor="select-k">Select rank</label>
            <div className="inline-action">
              <input
                id="select-k"
                value={kInput}
                onChange={(event) => setKInput(event.target.value)}
                placeholder="k"
              />
              <button type="button" onClick={runSelect}>
                Select(k)
              </button>
            </div>
          </div>

          <div className="operation-group">
            <label>Traversals</label>
            <div className="tool-list compact">
              <button type="button" onClick={() => runTraversal('inorder')}>
                Inorder
              </button>
              <button type="button" onClick={() => runTraversal('preorder')}>
                Preorder
              </button>
              <button type="button" onClick={() => runTraversal('postorder')}>
                Postorder
              </button>
            </div>
          </div>
        </aside>

        <BstCanvas layout={layout} stats={stats} step={activeStep} />

        <aside className="info-stack">
          <section className="info-panel">
            <h2>Status</h2>
            <p>{activeStep?.message ?? 'Choose an operation to explore the tree.'}</p>
            <div className="stat-grid">
              <Metric label="Node count" value={stats.size} />
              <Metric label="Tree height" value={stats.height} />
            </div>
          </section>

          <section className="info-panel">
            <h2>Pseudocode</h2>
            <Pseudocode operation={operation} activeLine={activeStep?.line} />
          </section>

          <section className="info-panel">
            <h2>Complexity meter</h2>
            <div className="complexity-meter">
              <Metric label="Operation" value={operationLabels[operation] ?? operation} />
              <Metric label="Path length" value={pathLength} />
              <Metric label="Tree height" value={stats.height} />
              <Metric label="Node count" value={stats.size} />
            </div>
          </section>

          <section className="info-panel timeline-panel">
            <h2>Operation timeline</h2>
            <div className="timeline">
              {trace.map((step, index) => (
                <button
                  key={`${step.operation}-${index}-${step.message}`}
                  type="button"
                  className={index === stepIndex ? 'is-current' : ''}
                  onClick={() => {
                    setStepIndex(index);
                    setIsPlaying(false);
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <footer className="playback-bar" aria-label="Playback controls">
        <div className="speed-control">
          <span>0.25x</span>
          <input
            type="range"
            min="0.25"
            max="2"
            step="0.25"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
          <strong>{speed}x</strong>
        </div>

        <div className="transport">
          <button type="button" aria-label="Run current trace" onClick={playFromStart}>
            <RotateCcw size={18} />
            <span>Run</span>
          </button>
          <button
            type="button"
            aria-label="Jump to start"
            onClick={() => {
              setStepIndex(0);
              setIsPlaying(false);
            }}
          >
            <SkipBack size={18} />
          </button>
          <button
            type="button"
            aria-label="Previous step"
            onClick={() => {
              setStepIndex((index) => Math.max(0, index - 1));
              setIsPlaying(false);
            }}
          >
            <StepBack size={18} />
          </button>
          <button
            type="button"
            aria-label={isPlaying ? 'Pause playback' : 'Play playback'}
            onClick={() => {
              if (stepIndex >= trace.length - 1) {
                playFromStart();
              } else {
                setIsPlaying((value) => !value);
              }
            }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={18} />}
          </button>
          <button
            type="button"
            aria-label="Next step"
            onClick={() => {
              setStepIndex((index) => Math.min(trace.length - 1, index + 1));
              setIsPlaying(false);
            }}
          >
            <StepForward size={18} />
          </button>
          <button
            type="button"
            aria-label="Jump to end"
            onClick={() => {
              setStepIndex(trace.length - 1);
              setIsPlaying(false);
            }}
          >
            <SkipForward size={18} />
          </button>
          <button type="button" aria-label="Run to end" onClick={() => {
            setStepIndex(trace.length - 1);
            setIsPlaying(false);
          }}>
            <FastForward size={18} />
            <span>End</span>
          </button>
        </div>
      </footer>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Pseudocode({ operation, activeLine }) {
  const lines = PSEUDOCODE[operation] ?? PSEUDOCODE.create;
  const activeIndex = Number(activeLine?.split(':')[1] ?? 0) - 1;

  return (
    <pre className="pseudocode">
      {lines.map((line, index) => (
        <span key={`${operation}-${line}`} className={index === activeIndex ? 'is-active' : ''}>
          {line}
        </span>
      ))}
    </pre>
  );
}

export default App;
