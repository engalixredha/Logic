/* =========================================================
   ARCLOGIC — gates.js
   Source of truth for every component the toolbox can show.
   This stage only defines metadata (icon, name, category,
   tooltip, implemented/placeholder flag). Boolean behavior,
   pin counts, and rendering geometry are added in a later
   stage so the simulation engine can consume this catalog
   without the toolbox needing to change.
   ========================================================= */

const GateCatalog = (() => {

  // Minimal inline icon set so the toolbox never depends on external
  // image assets at this stage. Swap for /assets/icons/*.svg later
  // without touching any other module — just change `icon` below.
  const icons = {
    input: '<svg viewBox="0 0 24 24" width="15" height="15"><rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M15 12h6" stroke="currentColor" stroke-width="1.5"/></svg>',
    output: '<svg viewBox="0 0 24 24" width="15" height="15"><circle cx="16" cy="12" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M3 12h6" stroke="currentColor" stroke-width="1.5"/></svg>',
    toggle: '<svg viewBox="0 0 24 24" width="15" height="15"><rect x="3" y="8" width="18" height="8" rx="4" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="8" cy="12" r="2.6" fill="currentColor"/></svg>',
    button: '<svg viewBox="0 0 24 24" width="15" height="15"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg>',
    led: '<svg viewBox="0 0 24 24" width="15" height="15"><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M12 2v3M12 19v3" stroke="currentColor" stroke-width="1.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="15" height="15"><path d="M3 12h4l2-6 4 12 2-6h6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/></svg>',
    gate: '<svg viewBox="0 0 24 24" width="15" height="15"><path d="M4 5v14h6a7 7 0 000-14H4z" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M20 12h-2" stroke="currentColor" stroke-width="1.5"/></svg>',
    flipflop: '<svg viewBox="0 0 24 24" width="15" height="15"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 9h3M8 15h3" stroke="currentColor" stroke-width="1.5"/></svg>',
    mux: '<svg viewBox="0 0 24 24" width="15" height="15"><path d="M5 5l5 7-5 7M19 5l-5 7 5 7" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    splitter: '<svg viewBox="0 0 24 24" width="15" height="15"><path d="M4 12h6M14 6h6M14 18h6M10 12l4-6M10 12l4 6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>',
    probe: '<svg viewBox="0 0 24 24" width="15" height="15"><circle cx="12" cy="9" r="5" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M12 14v7" stroke="currentColor" stroke-width="1.5"/></svg>',
  };

  // categories rendered top-to-bottom in the left sidebar, in this order.
  const categories = [
    {
      id: 'io',
      label: 'Inputs & Outputs',
      defaultOpen: true,
      items: [
        { id: 'input',  name: 'Input',        icon: icons.input,  tooltip: 'Constant logic source you can wire from', implemented: false },
        { id: 'output', name: 'Output',       icon: icons.output, tooltip: 'Terminal that reads the value driven into it', implemented: false },
        { id: 'toggle', name: 'Toggle Switch', icon: icons.toggle, tooltip: 'Click to flip between 0 and 1', implemented: false },
        { id: 'button', name: 'Push Button',  icon: icons.button, tooltip: 'Outputs 1 only while held', implemented: false },
        { id: 'led',    name: 'LED',          icon: icons.led,    tooltip: 'Lights up when its input is 1', implemented: false },
        { id: 'clock',  name: 'Clock',        icon: icons.clock,  tooltip: 'Generates a repeating 0/1 signal', implemented: false },
      ],
    },
    {
      id: 'gates',
      label: 'Logic Gates',
      defaultOpen: true,
      items: [
        { id: 'and',    name: 'AND',    icon: icons.gate, tooltip: 'High only when every input is high', implemented: false },
        { id: 'or',     name: 'OR',     icon: icons.gate, tooltip: 'High when any input is high', implemented: false },
        { id: 'not',    name: 'NOT',    icon: icons.gate, tooltip: 'Inverts a single input', implemented: false },
        { id: 'nand',   name: 'NAND',   icon: icons.gate, tooltip: 'Inverted AND', implemented: false },
        { id: 'nor',    name: 'NOR',    icon: icons.gate, tooltip: 'Inverted OR', implemented: false },
        { id: 'xor',    name: 'XOR',    icon: icons.gate, tooltip: 'High when inputs differ', implemented: false },
        { id: 'xnor',   name: 'XNOR',   icon: icons.gate, tooltip: 'High when inputs match', implemented: false },
        { id: 'buffer', name: 'BUFFER', icon: icons.gate, tooltip: 'Passes its input through unchanged', implemented: false },
      ],
    },
    {
      id: 'sequential',
      label: 'Sequential Logic',
      defaultOpen: false,
      items: [
        { id: 'd-ff',  name: 'D Flip-Flop',  icon: icons.flipflop, tooltip: 'Stores one bit, updated on clock edge', implemented: false, placeholder: true },
        { id: 'jk-ff', name: 'JK Flip-Flop', icon: icons.flipflop, tooltip: 'Set/reset/toggle storage element', implemented: false, placeholder: true },
        { id: 'sr-ff', name: 'SR Flip-Flop', icon: icons.flipflop, tooltip: 'Set/reset latch', implemented: false, placeholder: true },
        { id: 't-ff',  name: 'T Flip-Flop',  icon: icons.flipflop, tooltip: 'Toggles state on each clock edge', implemented: false, placeholder: true },
      ],
    },
    {
      id: 'extra',
      label: 'Additional Components',
      defaultOpen: false,
      items: [
        { id: 'mux',     name: 'Multiplexer',   icon: icons.mux,      tooltip: 'Selects one of several inputs', implemented: false, placeholder: true },
        { id: 'demux',   name: 'Demultiplexer', icon: icons.mux,      tooltip: 'Routes one input to a selected output', implemented: false, placeholder: true },
        { id: 'decoder', name: 'Decoder',       icon: icons.mux,      tooltip: 'Activates one output per input combination', implemented: false, placeholder: true },
        { id: 'encoder', name: 'Encoder',       icon: icons.mux,      tooltip: 'Compresses active line into a binary code', implemented: false, placeholder: true },
        { id: 'splitter',name: 'Splitter',      icon: icons.splitter, tooltip: 'Fans a bus out into individual wires', implemented: false, placeholder: true },
        { id: 'tunnel',  name: 'Tunnel',        icon: icons.splitter, tooltip: 'Connects same-named points without a drawn wire', implemented: false, placeholder: true },
        { id: 'probe',   name: 'Probe',         icon: icons.probe,    tooltip: 'Displays the live value at a point in the circuit', implemented: false, placeholder: true },
      ],
    },
  ];

  function all() {
    return categories.flatMap((cat) => cat.items.map((item) => ({ ...item, categoryId: cat.id, categoryLabel: cat.label })));
  }

  function search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({ ...cat, items: cat.items.filter((i) => i.name.toLowerCase().includes(q)) }))
      .filter((cat) => cat.items.length > 0);
  }

  return { categories, icons, all, search };
})();
