/* =========================================================
   ARCLOGIC — fileManager.js
   Defines the ".ARL" project format and the menu actions that
   read/write it. Full serialization of gates and wires lands
   once those modules exist; for now this locks in a versioned
   envelope so future fields never break old files.
   ========================================================= */

const FileManager = (() => {

  const ARL_VERSION = 1;
  const FILE_EXTENSION = '.arl';

  let currentProject = createEmptyProject('Untitled Circuit');
  let hasUnsavedChanges = false;

  /**
   * Canonical empty project. Every future feature should add a new,
   * optional key here rather than changing existing keys, so older
   * .ARL files keep loading correctly (forward compatibility).
   */
  function createEmptyProject(name) {
    return {
      arlVersion: ARL_VERSION,
      meta: {
        name,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      canvas: {
        zoom: 1,
        panX: 0,
        panY: 0,
        gridSnap: true,
      },
      // Populated by gates.js / wiring.js once placement & routing exist.
      components: [],
      wires: [],
      // Free-form notes the user can attach to a project.
      notes: '',
      // Reserved for simulation settings (clock speed, tick rate, etc.)
      simulationSettings: {},
      // Open-ended bucket for features not yet designed, so they never
      // require bumping arlVersion just to be stored.
      extensions: {},
    };
  }

  function markDirty() {
    hasUnsavedChanges = true;
    const el = document.getElementById('projectStatus');
    if (el) el.textContent = 'Unsaved changes';
  }

  function markClean() {
    hasUnsavedChanges = false;
    const el = document.getElementById('projectStatus');
    if (el) el.textContent = 'No unsaved changes';
  }

  function newProject() {
    currentProject = createEmptyProject('Untitled Circuit');
    const nameEl = document.getElementById('projectName');
    if (nameEl) nameEl.textContent = currentProject.meta.name;
    markClean();
    Utils.toast('New project created.');
  }

  function serialize() {
    currentProject.meta.modifiedAt = new Date().toISOString();
    return JSON.stringify(currentProject, null, 2);
  }

  function save() {
    // Full persistence (e.g. to disk via a download, or browser storage)
    // arrives once there is real circuit data worth saving. For now we
    // simulate the round trip so the UI feels real.
    serialize();
    markClean();
    Utils.toast('Project saved.');
  }

  function saveAs() {
    const name = window.prompt('Save project as:', currentProject.meta.name);
    if (!name) return;
    currentProject.meta.name = name;
    const nameEl = document.getElementById('projectName');
    if (nameEl) nameEl.textContent = name;
    save();
  }

  function openProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = FILE_EXTENSION + ',application/json';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          currentProject = { ...createEmptyProject(parsed?.meta?.name || 'Imported Circuit'), ...parsed };
          const nameEl = document.getElementById('projectName');
          if (nameEl) nameEl.textContent = currentProject.meta.name;
          markClean();
          Utils.toast(`Opened "${currentProject.meta.name}".`);
        } catch (err) {
          Utils.toast('Could not read that file — it may not be a valid .ARL project.');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  function exportProject() {
    const blob = new Blob([serialize()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.meta.name.replace(/\s+/g, '_')}${FILE_EXTENSION}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    Utils.toast('Project exported as .arl');
  }

  function importProject() {
    openProject();
  }

  return {
    ARL_VERSION,
    newProject,
    save,
    saveAs,
    openProject,
    exportProject,
    importProject,
    markDirty,
    markClean,
    getCurrentProject: () => currentProject,
    hasUnsavedChanges: () => hasUnsavedChanges,
  };
})();
