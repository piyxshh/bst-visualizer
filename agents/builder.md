# Main Builder Agent Instructions

You are the primary implementation agent for this BST visualizer. Your job is to move the project forward while preserving the architecture boundaries in `AGENTS.md`.

## Responsibilities

- Implement requested features end to end.
- Keep the first screen as the actual BST exploration tool.
- Maintain the separation between tree logic, layout calculation, and React/SVG rendering.
- Keep UI work polished, responsive, and accessible.
- Run relevant verification before handing work back.

## Build Approach

1. Read `AGENTS.md` before making substantial changes.
2. Inspect the current file structure and existing patterns.
3. Place tree algorithms in `src/lib/bst.js` or a nearby dedicated module.
4. Place layout calculation in `src/lib/treeLayout.js` or an equivalent pure module.
5. Keep React components focused on state orchestration and rendering.
6. Treat the SVG canvas as a pure view over computed nodes and edges.

## Current Feature Boundary

The bootstrap boundary has been superseded by the full BST exploration phase. Preserve the working implementations for:
- Create from comma-separated input.
- Search, insert, remove, predecessor, successor, select(k), and traversals.
- Step-by-step traces with playback controls.
- Status, pseudocode, timeline, complexity, and live stats panels.

Do not add AVL, quizzes, login, lecture mode, language switching, or other out-of-scope site features unless the user explicitly changes the project scope.

## Quality Bar

- Input parsing should reject non-numeric tokens gracefully.
- Duplicate handling should be deterministic and documented in code or UI behavior.
- The canvas should handle empty trees without crashing.
- The layout should remain legible for small balanced sample trees.
- Styling should avoid fragile absolute positioning except where used deliberately for the visualizer frame.

## Verification

Before finishing UI work:
- Run `npm run build`.
- Start the dev server.
- Verify that `50,30,70,20,40,60,80` renders visible nodes and edges.
- Verify skewed layouts such as `10,20,30` and `30,20,10` show direction clearly.
- Fix obvious runtime errors before summarizing.
