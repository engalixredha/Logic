# Arclogic — Digital Circuit Studio

A browser-based environment for designing, simulating, and analyzing digital
logic circuits. Built for students, engineers, and educators. Runs entirely
client-side — no backend, no build step, deployable as-is to GitHub Pages.

This is **Stage 1: the foundation**. It establishes the interface, layout,
and project-file architecture that every later stage (wiring, simulation,
truth tables, Karnaugh maps) will build on without requiring a rewrite.

## Running it

Just open `index.html` in a browser, or serve the folder with any static
file server. For GitHub Pages: push this folder to a repo and point Pages
at its root (or `/docs` if you move it there).

## Project structure

```
/
│ index.html              Page shell — markup only, no inline logic
│
├── css/
│   styles.css            Design tokens (color, type, motion), resets, .glass utility
│   layout.css             Structural grid: topbar, sidebars, workspace, status bar
│   components.css         Buttons, menus, toolbox items, chips, toasts
│   animations.css         Keyframes and reusable motion classes
│
├── js/
│   utils.js               Shared helpers: clamp/snap/debounce/toast/event bus
│   gates.js                Component catalog (icons, names, categories) — the
│                           single source of truth the toolbox renders from
│   wiring.js               Placeholder: documents the future wire data model
│   simulation.js           Placeholder: documents the future evaluation loop
│   fileManager.js          The .ARL project format + New/Open/Save/Import/Export
│   canvas.js               Infinite grid workspace: pan, zoom, snap, cursor probe
│   ui.js                   Menu bar, toolbox rendering/search, drawer, panels
│   app.js                  Boot order, keyboard shortcuts, top-level wiring
│
├── assets/
│   icons/                 Reserved for future standalone icon assets
│   images/                Reserved for future raster/vector imagery
│
├── examples/              Reserved for future example .arl circuit files
│
└── README.md
```

## The `.ARL` format

`.arl` files are JSON with a versioned envelope:

```json
{
  "arlVersion": 1,
  "meta": { "name": "...", "createdAt": "...", "modifiedAt": "..." },
  "canvas": { "zoom": 1, "panX": 0, "panY": 0, "gridSnap": true },
  "components": [],
  "wires": [],
  "notes": "",
  "simulationSettings": {},
  "extensions": {}
}
```

New features should add new, optional keys rather than repurpose existing
ones — that keeps older project files loading correctly in newer versions
of the app. `extensions` exists specifically as a landing spot for anything
not yet designed.

## What's intentionally not here yet

By design, this stage does **not** implement: placing/dragging components
onto the canvas, wiring between pins, Boolean evaluation, truth tables,
Karnaugh maps, or the example circuits (they're wired up as placeholders
that explain what's coming). The architecture — module boundaries, the
`.ARL` schema, the component catalog — is shaped so each of those can be
added as its own stage without touching unrelated files.

## Design language

Dark by default, glass panels over a near-black void, with a teal "signal
trace" accent and an indigo secondary used for selection/mode states. A
soft glow follows the cursor across the canvas — a nod to a probe sweeping
a board. Typography: Space Grotesk for display/UI, Inter for body text,
JetBrains Mono for coordinates and status data.
