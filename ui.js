/* =========================================================
   ARCLOGIC — ui.js
   Everything that wires up chrome: the menu bar, the component
   toolbox (rendered from GateCatalog), the examples drawer,
   collapsible side panels, and small affordances like ripples.
   ========================================================= */

const UI = (() => {

  /* ---------------- MENU BAR ---------------- */

  function initMenuBar() {
    const items = document.querySelectorAll('.menu-item');
    function closeAll(except) {
      items.forEach((item) => { if (item !== except) item.classList.remove('is-open'); });
    }
    items.forEach((item) => {
      const trigger = item.querySelector('.menu-trigger');
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasOpen = item.classList.contains('is-open');
        closeAll();
        item.classList.toggle('is-open', !wasOpen);
      });
    });
    document.addEventListener('click', () => closeAll());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

    document.querySelectorAll('.menu-action, [data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => handleAction(btn.dataset.action, e));
    });
  }

  function handleAction(action) {
    switch (action) {
      case 'new': FileManager.newProject(); break;
      case 'open': FileManager.openProject(); break;
      case 'save': FileManager.save(); break;
      case 'saveas': FileManager.saveAs(); break;
      case 'import': FileManager.importProject(); break;
      case 'export': FileManager.exportProject(); break;
      case 'undo': Utils.toast('Undo history starts once editing is enabled.'); break;
      case 'redo': Utils.toast('Redo history starts once editing is enabled.'); break;
      case 'cut': case 'copy': case 'paste': case 'delete':
        Utils.toast('Select a component to use this — coming with circuit editing.'); break;
      case 'toggle-grid': {
        const on = WorkspaceCanvas.toggleGridSnap();
        syncGridStatus(on);
        break;
      }
      case 'toggle-left': togglePanel('leftSidebar'); break;
      case 'toggle-right': togglePanel('rightSidebar'); break;
      case 'zoom-reset': WorkspaceCanvas.resetZoom(); break;
      case 'zoom-fit': Utils.toast('Fit to Screen will be available once circuits exist.'); break;
      case 'docs': Utils.toast('Documentation is coming soon.'); break;
      case 'shortcuts': Utils.toast('Ctrl+S Save · Scroll to zoom · Drag to pan.'); break;
      case 'about': Utils.toast('Arclogic — a digital logic circuit studio.'); break;
      default: break;
    }
  }

  /* ---------------- TOOLBOX ---------------- */

  function renderToolbox(categories = GateCatalog.categories, { preserveOpenState = true } = {}) {
    const scroll = document.getElementById('toolboxScroll');
    const openIds = preserveOpenState
      ? new Set([...scroll.querySelectorAll('.tb-category.is-open')].map((el) => el.dataset.categoryId))
      : new Set(categories.filter((c) => c.defaultOpen).map((c) => c.id));

    scroll.innerHTML = '';

    if (categories.length === 0) {
      scroll.innerHTML = '<div class="no-results">No components match your search.</div>';
      return;
    }

    categories.forEach((cat) => {
      const isOpen = openIds.has(cat.id) || (openIds.size === 0 && cat.defaultOpen);
      const wrap = document.createElement('div');
      wrap.className = `tb-category${isOpen ? ' is-open' : ''}`;
      wrap.dataset.categoryId = cat.id;

      wrap.innerHTML = `
        <button class="tb-category__header">
          <svg class="tb-category__chevron" viewBox="0 0 24 24" width="12" height="12"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>${cat.label}</span>
          <span class="tb-category__count">${cat.items.length}</span>
        </button>
        <div class="tb-category__list">
          <div class="tb-category__list-inner">
            ${cat.items.map(itemTemplate).join('')}
          </div>
        </div>
      `;

      wrap.querySelector('.tb-category__header').addEventListener('click', () => {
        wrap.classList.toggle('is-open');
      });

      scroll.appendChild(wrap);
    });
  }

  function itemTemplate(item) {
    const badge = item.placeholder ? '<span class="tb-item__badge">Soon</span>' : '';
    return `
      <div class="tb-item${item.placeholder ? ' is-placeholder' : ''}" draggable="${!item.placeholder}" data-component-id="${item.id}" data-tooltip="${item.tooltip}">
        <span class="tb-item__icon">${item.icon}</span>
        <span class="tb-item__name">${item.name}</span>
        ${badge}
      </div>
    `;
  }

  function initToolboxSearch() {
    const input = document.getElementById('componentSearch');
    input.addEventListener('input', Utils.debounce(() => {
      const results = GateCatalog.search(input.value);
      renderToolbox(results, { preserveOpenState: input.value.trim().length === 0 });
    }, 120));
  }

  function initToolboxDrag() {
    document.getElementById('toolboxScroll').addEventListener('click', (e) => {
      const item = e.target.closest('.tb-item');
      if (!item) return;
      if (item.classList.contains('is-placeholder')) {
        Utils.toast('This component is on the roadmap and not wired up yet.');
        return;
      }
      Utils.toast(`Placing components on the canvas arrives in the next stage.`);
    });
  }

  /* ---------------- PANEL COLLAPSE ---------------- */

  function togglePanel(id, force) {
    const el = document.getElementById(id);
    const collapsed = typeof force === 'boolean' ? !force : !el.classList.contains('is-collapsed');
    el.classList.toggle('is-collapsed', collapsed);
  }

  function initCollapseHandles() {
    document.getElementById('collapseLeftHandle').addEventListener('click', () => togglePanel('leftSidebar'));
    document.getElementById('collapseRightHandle').addEventListener('click', () => togglePanel('rightSidebar'));
  }

  /* ---------------- EXAMPLES DRAWER ---------------- */

  const EXAMPLES = [
    { id: 'half-adder', name: 'Half Adder' },
    { id: 'full-adder', name: 'Full Adder' },
    { id: 'multiplier', name: 'Multiplier' },
    { id: 'comparator', name: 'Comparator' },
    { id: 'decoder', name: 'Decoder' },
    { id: 'encoder', name: 'Encoder' },
    { id: 'multiplexer', name: 'Multiplexer' },
    { id: 'alu', name: 'ALU' },
    { id: 'counter', name: 'Counter' },
    { id: 'register', name: 'Register' },
  ];

  function renderExamples() {
    const grid = document.getElementById('examplesGrid');
    grid.innerHTML = EXAMPLES.map((ex) => `
      <div class="example-card" data-example-id="${ex.id}">
        <span class="example-card__icon">${GateCatalog.icons.mux}</span>
        <span class="example-card__name">${ex.name}</span>
        <span class="example-card__tag">Placeholder</span>
      </div>
    `).join('');

    grid.querySelectorAll('.example-card').forEach((card) => {
      card.addEventListener('click', () => Utils.toast('Example circuits will load once circuit data exists.'));
    });
  }

  function openDrawer() {
    document.getElementById('examplesDrawer').classList.add('is-open');
    document.getElementById('drawerOverlay').classList.add('is-open');
  }
  function closeDrawer() {
    document.getElementById('examplesDrawer').classList.remove('is-open');
    document.getElementById('drawerOverlay').classList.remove('is-open');
  }
  function initDrawer() {
    document.getElementById('hamburgerBtn').addEventListener('click', openDrawer);
    document.getElementById('closeDrawerBtn').addEventListener('click', closeDrawer);
    document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
  }

  /* ---------------- STATUS BAR TOGGLES ---------------- */

  function syncGridStatus(on) {
    const chip = document.getElementById('gridStatus');
    chip.classList.toggle('is-on', on);
  }

  function initStatusBarToggles() {
    const gridChip = document.getElementById('gridStatus');
    gridChip.addEventListener('click', () => {
      const on = WorkspaceCanvas.toggleGridSnap();
      syncGridStatus(on);
    });
  }

  /* ---------------- RIPPLES ---------------- */

  function initRipples() {
    document.querySelectorAll('.pill-btn, .icon-btn').forEach(Utils.attachRipple);
  }

  /* ---------------- PROJECT NAME EDIT ---------------- */

  function initProjectName() {
    const nameEl = document.getElementById('projectName');
    nameEl.addEventListener('blur', () => {
      const text = nameEl.textContent.trim() || 'Untitled Circuit';
      nameEl.textContent = text;
      FileManager.getCurrentProject().meta.name = text;
    });
    nameEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
    });
  }

  function init() {
    initMenuBar();
    renderToolbox();
    initToolboxSearch();
    initToolboxDrag();
    initCollapseHandles();
    renderExamples();
    initDrawer();
    initStatusBarToggles();
    initRipples();
    initProjectName();
  }

  return { init, togglePanel };
})();
