# BST Visualizer

A polished Binary Search Tree visualizer built with React and Vite, inspired by the BST exploration experience from Visualgo.

This project focuses on BST exploration only. It lets you build a tree from input, run core BST operations, and step through each operation with visual playback, status updates, and pseudocode highlighting.

## Features

- Create a BST from comma-separated numeric input
- Search, insert, and remove
- Predecessor, successor, and `select(k)`
- Inorder, preorder, and postorder traversals
- Step-by-step trace playback with:
  - play and pause
  - start, previous, next, and end controls
  - speed control
  - clickable operation timeline
- Live stats for node count and tree height
- Complexity panel for current operation context
- SVG-based tree rendering with animated traversal cues
- Responsive UI designed around the visualizer as the first screen

## Tech Stack

- React 19
- Vite 6
- Lucide React
- SVG rendering for the tree canvas

## Project Structure

```text
bst-visualizer/
|-- AGENTS.md
|-- agents/
|   |-- builder.md
|   `-- reviewer.md
|-- src/
|   |-- components/
|   |   `-- BstCanvas.jsx
|   |-- lib/
|   |   |-- bst.js
|   |   `-- treeLayout.js
|   |-- App.jsx
|   |-- main.jsx
|   `-- styles.css
|-- index.html
|-- package.json
`-- vite.config.js
```

## Architecture Notes

- `src/lib/bst.js` contains BST operations and step-trace generation.
- `src/lib/treeLayout.js` handles tree layout as a separate pure module.
- `src/components/BstCanvas.jsx` renders nodes, edges, and traversal highlights from computed state.
- `src/App.jsx` coordinates UI state, playback, controls, and panels.

The app intentionally keeps tree logic separate from rendering so the visual layer stays a pure view over tree state.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Sample Input

Use this input to generate a balanced sample tree:

```text
50,30,70,20,40,60,80
```

You can also test skewed layouts with:

```text
10,20,30
30,20,10
```

## Scope

### In scope

- BST exploration mode
- Core BST operations
- Traversal playback
- Status, pseudocode, timeline, and stats panels

### Out of scope

- AVL trees
- Login, quizzes, lecture mode, or language switching
- Full Visualgo site clone

## Repository Notes

- Build command: `npm run build`
- This is a static Vite app
- Generated folders such as `dist/` and `node_modules/` are ignored

## Inspiration

- [Visualgo BST](https://visualgo.net/en/bst)
