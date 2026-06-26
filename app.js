/* =========================================================
   ARCLOGIC — app.js
   Boots the application. Keeps initialization order explicit
   so the dependency direction (utils → catalog → canvas → ui)
   stays obvious as the codebase grows.
   ========================================================= */

(function bootArclogic() {

  function initCanvasControls() {
    document.getElementById('zoomInBtn').addEventListener('click', WorkspaceCanvas.zoomIn);
    document.getElementById('zoomOutBtn').addEventListener('click', WorkspaceCanvas.zoomOut);
    document.getElementById('resetZoomBtn').addEventListener('click', WorkspaceCanvas.resetZoom);
    document.getElementById('centerBtn').addEventListener('click', WorkspaceCanvas.centerWorkspace);
    document.getElementById('fitScreenBtn').addEventListener('click', () =>
      Utils.toast('Fit to Screen will be available once circuits exist.')
    );
  }

  function initTopRightButtons() {
    document.getElementById('themeToggle').addEventListener('click', () =>
      Utils.toast('Light mode is on the roadmap — dark mode is the default for now.')
    );
    document.getElementById('settingsBtn').addEventListener('click', () =>
      Utils.toast('Settings are coming in a later stage.')
    );
  }

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) ||
        document.activeElement?.isContentEditable;
      if (typing) return;

      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        FileManager.save();
      } else if (mod && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        FileManager.openProject();
      } else if (e.key === '+' || e.key === '=') {
        WorkspaceCanvas.zoomIn();
      } else if (e.key === '-') {
        WorkspaceCanvas.zoomOut();
      } else if (e.key === '0') {
        WorkspaceCanvas.resetZoom();
      }
    });
  }

  function warnBeforeClose() {
    window.addEventListener('beforeunload', (e) => {
      if (FileManager.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  function init() {
    WorkspaceCanvas.init();
    UI.init();
    initCanvasControls();
    initTopRightButtons();
    initKeyboardShortcuts();
    warnBeforeClose();
    WorkspaceCanvas.centerWorkspace();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
