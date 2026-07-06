# BST Visualizer Agent Context

## Project Scope

This repository is a focused Binary Search Tree exploration tool inspired by Visualgo's BST page. The first screen must be the working visualizer, not a marketing landing page or full educational site clone.

In scope:
- Binary Search Tree only.
- SVG tree canvas.
- Create a tree from comma-separated numeric input.
- Search, insert, remove.
- Predecessor, successor, select(k).
- Inorder, preorder, postorder traversal.
- Playback controls and speed slider.
- Status/explanation panel and pseudocode panel.
- Polished responsive UI.

Out of scope:
- AVL tree and other balanced tree variants.
- Lecture mode, quizzes, login, language switching, accounts, or full Visualgo site chrome.
- Server-side persistence unless explicitly requested later.

## Architecture Rules

- Use React + Vite for the app shell.
- Keep BST data-structure logic in its own module, separate from React rendering.
- Keep layout calculation separate from React components where practical.
- Keep the SVG rendering layer a pure function of tree state and layout data.
- Prefer deterministic behavior for sample trees, tests, and demos.
- Avoid coupling tree algorithms to animation state; animation steps can consume algorithm output later.

## Current Implementation Phase

The bootstrap phase is complete. The app is now in full BST exploration mode and should preserve these working capabilities:
- Create a tree from comma-separated input.
- Search, insert, remove, predecessor, successor, select(k), and traversals.
- Step-by-step operation traces with playback controls.
- Status, pseudocode, timeline, complexity, and live stats panels.

Future changes should be targeted improvements to those capabilities, not a rollback to the bootstrap-only scaffold.

## UI Direction

The app should feel like a polished technical visualizer: dense enough for exploration, visually calm, and responsive. The main canvas should dominate the first viewport. Controls should be immediately usable, with no explanatory landing copy standing between the user and the tool.

## Repo and Deployment Expectations

- The repository should remain deployable as a static Vite app.
- Use `npm run build` as the deployment build command.
- Keep dependencies modest and justified.
- Do not commit generated build artifacts such as `dist/` unless a future deployment process explicitly requires it.
- If this becomes a Git repository later, preserve user changes and avoid broad rewrites unrelated to the current task.

## Verification Expectations

For app changes, run:
- `npm run build` for production correctness.
- A local dev server check when UI rendering changes.

Confirm that input like `50,30,70,20,40,60,80` renders a valid BST with edges and nodes. For layout changes, also verify skewed trees such as `10,20,30` and `30,20,10` show their right/left direction clearly.
