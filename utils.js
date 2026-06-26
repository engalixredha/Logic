/* =========================================================
   ARCLOGIC — utils.js
   Small, dependency-free helper functions shared by every
   other module. Keep this file free of DOM-heavy logic so it
   stays easy to reuse (and unit test) later.
   ========================================================= */

const Utils = (() => {

  /** Clamp a number between min and max. */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /** Round a value to the nearest multiple of `step`. */
  function snap(value, step) {
    return Math.round(value / step) * step;
  }

  /** Linear interpolation. */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /** Generate a short, sufficiently-unique id (no external deps). */
  function uid(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /** Debounce: delay invoking `fn` until `wait` ms have passed quietly. */
  function debounce(fn, wait = 150) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  /** Throttle: ensure `fn` runs at most once per `wait` ms. */
  function throttle(fn, wait = 16) {
    let last = 0;
    let queued = null;
    return (...args) => {
      const now = performance.now();
      if (now - last >= wait) {
        last = now;
        fn(...args);
      } else {
        clearTimeout(queued);
        queued = setTimeout(() => { last = performance.now(); fn(...args); }, wait - (now - last));
      }
    };
  }

  /** Format device pixel ratio aware canvas sizing. */
  function fitCanvasToContainer(canvas, container) {
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width: rect.width, height: rect.height, dpr };
  }

  /** Push a small toast notification. Used while real features are stubbed. */
  function toast(message, { duration = 2600 } = {}) {
    const stack = document.getElementById('toastStack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="toast__dot"></span><span>${message}</span>`;
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-leaving');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, duration);
  }

  /** Attach a simple ripple effect to a clickable element. */
  function attachRipple(el) {
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${(e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2}px`;
      ripple.style.top = `${(e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2}px`;
      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  }

  /** Tiny pub/sub used to keep modules decoupled (canvas <-> ui <-> app). */
  function createEventBus() {
    const listeners = new Map();
    return {
      on(event, cb) {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(cb);
        return () => listeners.get(event)?.delete(cb);
      },
      emit(event, payload) {
        listeners.get(event)?.forEach((cb) => cb(payload));
      },
    };
  }

  return { clamp, snap, lerp, uid, debounce, throttle, fitCanvasToContainer, toast, attachRipple, createEventBus };
})();
