/* =========================================================
   ARCLOGIC — simulation.js
   PLACEHOLDER MODULE.
   No Boolean evaluation happens yet. This stub exists so the
   rest of the app (status bar "Project status", future Run/
   Pause controls) can call a stable API and so the eventual
   engine can be dropped in without touching callers.
   ========================================================= */

const Simulation = (() => {
  let running = false;

  function start() {
    running = true;
    Utils.toast('Simulation engine is not implemented yet — coming in a later stage.');
  }

  function stop() {
    running = false;
  }

  function isRunning() {
    return running;
  }

  function step() {
    // Future: propagate signals through Wiring.getAll() using gate
    // truth tables from GateCatalog, one evaluation tick at a time.
  }

  return { start, stop, isRunning, step };
})();
