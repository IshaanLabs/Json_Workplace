<<<<<<< HEAD

=======
# JSON Workspace

A modern, fully client-side JSON developer toolbox. All data processing occurs locally in the browser — no data ever leaves your device.

## Features

| Tool | Description |
|---|---|
| **JSON Viewer** | Interactive collapsible tree view with search and syntax highlighting |
| **JSON Formatter** | Pretty print (2 or 4 spaces), minify, or sort keys alphabetically |
| **JSON Compare** | Side-by-side diff with visual annotations and summary |
| **JSON Validator** | Real-time parse validation with precise line/column error reporting |
| **JSON Corrector** | Heuristic detection of common mistakes with one-click fixes |

## Technology Stack

- **React 19** + **TypeScript** — UI framework
- **Vite 6** — Build tool (fast HMR and optimised production builds)
- **Tailwind CSS v4** — Utility-class styling with light/dark theme
- **Zustand** — Application state management
- **Monaco Editor** — Code editor (the same engine as VS Code)
- **React Router v7** (HashRouter) — Client-side routing
- **Prettier** — JSON formatting engine
- **jsondiffpatch** — JSON diffing engine
- **Lucide React** — Icon library

## Getting Started

### Prerequisites

- Node.js 20 LTS or later
- npm 10 or later

### Installation

```bash
git clone https://github.com/your-username/json-workspace
cd json-workspace
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

The production output is in the `dist/` directory.

### Type Check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── main.tsx              # Application entry point
├── App.tsx               # Root component + routing
├── shell/                # Persistent application frame
│   ├── AppShell.tsx
│   ├── TopBar.tsx
│   ├── ToolNav.tsx
│   └── StatusBar.tsx
├── features/             # Feature modules (one per tool)
│   ├── viewer/
│   ├── formatter/
│   ├── compare/
│   ├── validator/
│   └── corrector/
├── components/           # Shared UI components
├── hooks/                # Custom React hooks
├── store/                # Zustand state slices
├── utils/                # Pure utility functions
├── types/                # TypeScript type definitions
└── styles/               # Global CSS (Tailwind v4)
```

## Privacy

This application is **100% client-side**. No data is transmitted to any server. All JSON processing happens in your browser. The only external network request is to load the initial application bundle.

## Deployment

The app is configured for GitHub Pages deployment using a `HashRouter` (no server-side routing needed).

To deploy:

1. Set the `base` option in `vite.config.ts` to your repository name:
   ```ts
   base: '/json-workspace/',
   ```
2. Push to the `main` branch — GitHub Actions will build and deploy automatically.

## Architecture

Each tool module is self-contained:
- Reads shared input from `workspaceSlice` (Zustand)
- Writes its own output to its own slice
- Never imports from another feature module

New tools can be added by creating a new feature folder, a new slice file, a new route, and a new tab entry — no existing code needs modification.

## License

MIT
>>>>>>> 29821d6 (Prepare for GitHub Pages)
