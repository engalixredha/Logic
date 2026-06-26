/* =========================================================
   ARCLOGIC — canvas.js
   Drives the infinite workspace: panning, zooming, snap-to-
   grid, and the crisp dot-grid background. Also paints a soft
   "probe" glow that follows the cursor on a second, pointer-
   events-free canvas — the page's signature ambient detail,
   evoking an oscilloscope probe sweeping the board.

   No circuit data is rendered here yet — that begins once
   gates.js / wiring.js gain real geometry.
   ========================================================= */

const WorkspaceCanvas = (() => {
  const GRID_SIZE = 24;          // px between minor grid dots at zoom = 1
  const MAJOR_EVERY = 4;         // every Nth line is a "major" line
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 1.18;

  let workspaceEl, gridCanvas, probeCanvas, gridCtx, probeCtx;
  let view = { x: 0, y: 0, zoom: 1 };   // x/y = world offset under top-left of viewport
  let pointer = { x: null, y: null, active: false };
  let isPanning = false;
  let panStart = null;
  let gridSnapEnabled = true;

  const bus = Utils.createEventBus();

  function init() {
    workspaceEl = document.getElementById('workspace');
    gridCanvas = document.getElementById('gridCanvas');
    probeCanvas = document.getElementById('probeCanvas');
    gridCtx = gridCanvas.getContext('2d');
    probeCtx = probeCanvas.getContext('2d');

    resize();
    window.addEventListener('resize', Utils.debounce(resize, 80));

    workspaceEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    workspaceEl.addEventListener('wheel', onWheel, { passive: false });
    workspaceEl.addEventListener('pointerleave', () => { pointer.active = false; });

    draw();
  }

  function resize() {
    Utils.fitCanvasToContainer(gridCanvas, workspaceEl);
    Utils.fitCanvasToContainer(probeCanvas, workspaceEl);
    draw();
  }

  /* ---------------- coordinate helpers ---------------- */

  function screenToWorld(sx, sy) {
    return { x: (sx - view.x) / view.zoom, y: (sy - view.y) / view.zoom };
  }

  function setZoom(nextZoom, pivotScreen) {
    const clamped = Utils.clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    if (pivotScreen) {
      const worldBefore = screenToWorld(pivotScreen.x, pivotScreen.y);
      view.zoom = clamped;
      view.x = pivotScreen.x - worldBefore.x * view.zoom;
      view.y = pivotScreen.y - worldBefore.y * view.zoom;
    } else {
      view.zoom = clamped;
    }
    draw();
    syncStatusBar();
    bus.emit('zoom', view.zoom);
  }

  function zoomIn() {
    const rect = workspaceEl.getBoundingClientRect();
    setZoom(view.zoom * ZOOM_STEP, { x: rect.width / 2, y: rect.height / 2 });
  }
  function zoomOut() {
    const rect = workspaceEl.getBoundingClientRect();
    setZoom(view.zoom / ZOOM_STEP, { x: rect.width / 2, y: rect.height / 2 });
  }
  function resetZoom() {
    setZoom(1);
    syncStatusBar();
  }
  function centerWorkspace() {
    const rect = workspaceEl.getBoundingClientRect();
    view.x = rect.width / 2;
    view.y = rect.height / 2;
    draw();
  }
  function toggleGridSnap(force) {
    gridSnapEnabled = typeof force === 'boolean' ? force : !gridSnapEnabled;
    bus.emit('gridSnap', gridSnapEnabled);
    return gridSnapEnabled;
  }
  function isGridSnapEnabled() { return gridSnapEnabled; }

  /* ---------------- input handlers ---------------- */

  function onPointerDown(e) {
    if (e.target.closest('.canvas-controls')) return;
    isPanning = true;
    panStart = { x: e.clientX, y: e.clientY, viewX: view.x, viewY: view.y };
    workspaceEl.classList.add('is-panning');
  }

  function onPointerMove(e) {
    const rect = workspaceEl.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const within = sx >= 0 && sy >= 0 && sx <= rect.width && sy <= rect.height;
    pointer.active = within;
    pointer.x = sx;
    pointer.y = sy;

    if (isPanning && panStart) {
      view.x = panStart.viewX + (e.clientX - panStart.x);
      view.y = panStart.viewY + (e.clientY - panStart.y);
      draw();
    } else {
      drawProbe();
    }

    if (within) syncStatusBar();
  }

  function onPointerUp() {
    isPanning = false;
    panStart = null;
    workspaceEl.classList.remove('is-panning');
  }

  function onWheel(e) {
    e.preventDefault();
    const rect = workspaceEl.getBoundingClientRect();
    const pivot = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    // Pinch-zoom on trackpads reports ctrlKey; plain wheel pans/zooms too —
    // treat any wheel on the canvas as zoom, which feels best for a CAD-like tool.
    const direction = e.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP;
    setZoom(view.zoom * Math.pow(direction, Math.abs(e.deltaY) > 50 ? 1.6 : 1), pivot);
  }

  /* ---------------- drawing ---------------- */

  function draw() {
    const rect = workspaceEl.getBoundingClientRect();
    const { width, height } = rect;
    gridCtx.clearRect(0, 0, width, height);

    gridCtx.fillStyle = '#0a0e14';
    gridCtx.fillRect(0, 0, width, height);

    const step = GRID_SIZE * view.zoom;
    if (step < 4) { return; } // too dense — skip to stay crisp/performant

    const offsetX = ((view.x % step) + step) % step;
    const offsetY = ((view.y % step) + step) % step;

    // minor dots
    gridCtx.fillStyle = 'rgba(148, 178, 196, 0.16)';
    const dotR = Utils.clamp(0.7 * Math.min(1, view.zoom), 0.4, 1.4);
    for (let x = offsetX; x < width; x += step) {
      for (let y = offsetY; y < height; y += step) {
        gridCtx.beginPath();
        gridCtx.arc(x, y, dotR, 0, Math.PI * 2);
        gridCtx.fill();
      }
    }

    // major lines (subtle), every MAJOR_EVERY cells, helps depth perception
    const majorStep = step * MAJOR_EVERY;
    if (majorStep > 8) {
      const moX = ((view.x % majorStep) + majorStep) % majorStep;
      const moY = ((view.y % majorStep) + majorStep) % majorStep;
      gridCtx.strokeStyle = 'rgba(148, 178, 196, 0.05)';
      gridCtx.lineWidth = 1;
      for (let x = moX; x < width; x += majorStep) {
        gridCtx.beginPath(); gridCtx.moveTo(x, 0); gridCtx.lineTo(x, height); gridCtx.stroke();
      }
      for (let y = moY; y < height; y += majorStep) {
        gridCtx.beginPath(); gridCtx.moveTo(0, y); gridCtx.lineTo(width, y); gridCtx.stroke();
      }
    }

    // origin marker — orients the user inside the infinite plane
    const originScreen = { x: view.x, y: view.y };
    if (originScreen.x > -40 && originScreen.x < width + 40 && originScreen.y > -40 && originScreen.y < height + 40) {
      gridCtx.strokeStyle = 'rgba(94, 234, 212, 0.35)';
      gridCtx.lineWidth = 1.4;
      gridCtx.beginPath();
      gridCtx.arc(originScreen.x, originScreen.y, 5, 0, Math.PI * 2);
      gridCtx.stroke();
    }

    drawProbe();
  }

  function drawProbe() {
    const rect = workspaceEl.getBoundingClientRect();
    probeCtx.clearRect(0, 0, rect.width, rect.height);
    if (!pointer.active || isPanning) return;

    const r = 90;
    const grad = probeCtx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, r);
    grad.addColorStop(0, 'rgba(94, 234, 212, 0.10)');
    grad.addColorStop(1, 'rgba(94, 234, 212, 0)');
    probeCtx.fillStyle = grad;
    probeCtx.beginPath();
    probeCtx.arc(pointer.x, pointer.y, r, 0, Math.PI * 2);
    probeCtx.fill();

    // crosshair, snapped to grid when enabled — communicates exactly where a
    // dropped component would land.
    const world = screenToWorld(pointer.x, pointer.y);
    const snappedWorld = gridSnapEnabled
      ? { x: Utils.snap(world.x, GRID_SIZE), y: Utils.snap(world.y, GRID_SIZE) }
      : world;
    const screenSnapped = {
      x: snappedWorld.x * view.zoom + view.x,
      y: snappedWorld.y * view.zoom + view.y,
    };
    probeCtx.strokeStyle = 'rgba(94, 234, 212, 0.55)';
    probeCtx.lineWidth = 1;
    probeCtx.beginPath();
    probeCtx.arc(screenSnapped.x, screenSnapped.y, 3, 0, Math.PI * 2);
    probeCtx.stroke();
  }

  /* ---------------- status bar sync ---------------- */

  function syncStatusBar() {
    const zoomEl = document.getElementById('zoomStatus');
    const coordEl = document.getElementById('coordStatus');
    if (zoomEl) zoomEl.textContent = `${Math.round(view.zoom * 100)}%`;
    if (coordEl && pointer.active) {
      const world = screenToWorld(pointer.x, pointer.y);
      const display = gridSnapEnabled
        ? { x: Utils.snap(world.x, GRID_SIZE), y: Utils.snap(world.y, GRID_SIZE) }
        : world;
      coordEl.textContent = `x: ${Math.round(display.x)}, y: ${Math.round(display.y)}`;
    }
  }

  return {
    init, zoomIn, zoomOut, resetZoom, centerWorkspace,
    toggleGridSnap, isGridSnapEnabled,
    on: bus.on,
  };
})();
