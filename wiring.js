/* =========================================================
   ARCLOGIC — wiring.js
   PLACEHOLDER MODULE.
   This stage does not draw or route wires yet. The shape
   below documents the data model that the wiring engine will
   produce so canvas.js, simulation.js, and fileManager.js can
   already agree on a contract before the real implementation
   lands.

   Planned shape of a wire record:
   {
     id: string,
     fromComponentId: string,
     fromPinIndex: number,
     toComponentId: string,
     toPinIndex: number,
     points: [{x, y}, ...],   // bend points, grid-snapped
     bitWidth: number,
   }
   ========================================================= */

const Wiring = (() => {
  const wires = [];

  function notImplemented(action) {
    Utils.toast(`Wiring: "${action}" will be available in a future update.`);
  }

  function startWire() { notImplemented('draw wire'); }
  function getAll() { return wires.slice(); }

  return { startWire, getAll };
})();
