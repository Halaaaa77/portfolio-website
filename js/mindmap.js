/*
Vite + npm Mind Elixir integration.
- The map structure/theme comes from mindmap-data.json exported by Mind Elixir.
- Placeholder nodes are replaced from app.data. Display-only placeholders stay inert.
- Explicit navigation nodes (including file placeholders) are bound by node ID to in-page portfolio views.
*/
import MindElixir from 'mind-elixir';
import 'mind-elixir/style.css';
import mapTemplate from './mindmap-data.json';

const app = window.PortfolioV2 = window.PortfolioV2 || {};

const deepClone = (value) => JSON.parse(JSON.stringify(value));
const timelineById = (id) => app.data.timeline.find((item) => item.id === id);

// The exported map was authored quickly, so these aliases normalize old/short names
// to the current data.js structure without changing the visual map design.
const alias = {
  'testing-2026-08.hover': () => timelineById('testing-2026-08')?.hover,
  'testing-2026-08.story': () => timelineById('testing-2026-08')?.story,
  'admin-2026-06.hover': () => timelineById('admin-2026-06')?.hover,
  'admin-2026-06.story': () => timelineById('admin-2026-06')?.story,
  'certificate-2026-02.hover': () => timelineById('certificate-2026-02')?.hover,
  'certificate-2026-02.story': () => timelineById('certificate-2026-02')?.story,
  'parttime-2025-10.hover': () => timelineById('parttime-2025-10')?.hover,
  'parttime-2025-10.story': () => timelineById('parttime-2025-10')?.story,
  'study-2025-04.hover': () => timelineById('study-2025-04')?.hover,
  'study-2025-04.story': () => timelineById('study-2025-04')?.story,
  'store-2024-07.hover': () => timelineById('coding-2024-08')?.hover,
  'store-2024-07.story': () => timelineById('coding-2024-08')?.story,
  'graduate-2024-06.hover': () => timelineById('graduate-2024-06')?.hover,
  'graduate-2024-06.story': () => timelineById('graduate-2024-06')?.story,
  'files.excel.preview': () => app.data.files.excel?.preview,
  'files.tqc.preview': () => app.data.files.word?.preview,
  'files.word.preview': () => app.data.files.word?.preview,
  'practices.acceptance.intro': () => app.data.practices.acceptance?.intro,
  'practices.acceptance.object': () => app.data.practices.acceptance?.object,
  'documents[0].url': () => app.data.practices.acceptance?.documents?.[0]?.url,
  'documents[1].url': () => app.data.practices.acceptance?.documents?.[1]?.url,
  'practices.exploratory.intro': () => app.data.practices.exploratory?.intro,
  'practices.exploratory.object': () => app.data.practices.exploratory?.object,
  '.charter[0].file[0].info': () => app.data.practices.exploratory?.testCharters?.[0]?.files?.[0]?.info,
  '.charter[0].file[1].info': () => app.data.practices.exploratory?.testCharters?.[0]?.files?.[1]?.info,
  '.charter[0].file[1].url': () => app.data.practices.exploratory?.testCharters?.[0]?.files?.[1]?.url || app.data.practices.exploratory?.testCharters?.[0]?.files?.[1]?.download,
  '.charter[1].file[0].info': () => app.data.practices.exploratory?.testCharters?.[1]?.files?.[0]?.info,
  '.charter[1].file[0].url': () => app.data.practices.exploratory?.testCharters?.[1]?.files?.[0]?.url || app.data.practices.exploratory?.testCharters?.[1]?.files?.[0]?.download,
  'Timeline/testing-2026-08': () => timelineById('testing-2026-08')?.date,
  none: () => 'none',
  '': () => '—',
};

function normalizeExportedTopic(node) {
  // Fix a few data-name typos in the supplied export while preserving its node IDs/layout.
  const fixes = {
    '0a47c79355594bc9': 'TQC WORD 專業級：{files.word.preview}',
    '0a489960e7031970': app.data.practices.exploratory?.testCharters?.[1]?.files?.[0]?.label || 'Test_forget_password_form.py',
  };
  if (fixes[node.id]) node.topic = fixes[node.id];

  // Several placeholders in the export are missing the closing brace.
  if (typeof node.topic === 'string' && node.topic.includes('{') && !node.topic.includes('}')) {
    node.topic += '}';
  }
}

function resolvePlaceholder(path) {
  const key = String(path).trim();
  if (alias[key]) return alias[key]();
  return undefined;
}

const internalFileNodeLabels = {
  '06a731b723e130d6': 'MOS EXCEL EXPERT',
  '0a47c79355594bc9': 'TQC WORD 專業級',
  '0a485f8ff47c1a51': '需求規格',
  '0a4860ed53415f6f': '測試案例',
  '0a48f75f81278cbd': '心智圖',
  '0a48ce7aa4b89de0': '檔案',
  '0a48cdb6287370d8': '檔案',
};

function hydrateNode(node, placeholderIds) {
  normalizeExportedTopic(node);
  const original = String(node.topic ?? '');
  const hasPlaceholder = /\{[^}]*\}/.test(original);

  if (internalFileNodeLabels[node.id]) {
    // File placeholders are navigation metadata, not visible URLs.
    // The actual in-page target is defined in actionMap below.
    node.topic = internalFileNodeLabels[node.id];
  } else if (hasPlaceholder) {
    placeholderIds.add(node.id);
    node.topic = original.replace(/\{([^}]*)\}/g, (_match, path) => {
      const value = resolvePlaceholder(path);
      return value === null || value === undefined || value === '' ? '—' : String(value);
    });
  }

  (node.children || []).forEach((child) => hydrateNode(child, placeholderIds));
}

function scrollViewArea() {
  requestAnimationFrame(() => document.querySelector('#view-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

function goPractice(practiceId, afterRender) {
  if (!app.render.renderPractice(practiceId)) return;
  app.navigation.goTo('practice');
  requestAnimationFrame(() => {
    afterRender?.();
    scrollViewArea();
  });
}

function goDocument(practiceId, documentId) {
  goPractice(practiceId, () => {
    app.render.renderPracticeInlineDocument(practiceId, documentId);
    app.navigation.sync();
  });
}

function goCharter(charterId, fileIndex = null) {
  goPractice('exploratory', () => {
    const practice = app.data.practices.exploratory;
    const charter = practice.testCharters?.find((item) => item.id === charterId);
    if (!charter) return;
    document.querySelectorAll('[data-charter-id]').forEach((button) => {
      const active = button.dataset.charterId === charterId;
      button.classList.toggle('is-active', active);
      button.classList.toggle('is-inactive', !active);
      button.setAttribute('aria-pressed', String(active));
    });
    app.render.renderPracticeCharterDetail(charter);
    if (Number.isInteger(fileIndex) && charter.files?.[fileIndex]) {
      app.render.renderCharterFilePreview(charter.files[fileIndex]);
    }
    document.querySelector('.practice-charters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function goFile(fileId) {
  if (!app.render.renderFile(fileId)) return;
  app.navigation.goTo('file');
  scrollViewArea();
}

// IDs are the IDs from the user's exported Mind Elixir JSON.
// Only explicitly mapped (purple-marked) nodes are eligible for actions.
const actionMap = {
  // Timeline navigation
  '06a70b7530bc9cef': () => app.navigation.goTimeline(app.state.timelineId),
  '06a71ed4f7aef917': () => app.navigation.goTimeline('testing-2026-08'),
  '06a720990c5fe280': () => app.navigation.goTimeline('admin-2026-06'),
  '06a7383491cc0603': () => app.navigation.goTimeline('certificate-2026-02'),
  '06a7ad993da107fd': () => app.navigation.goTimeline('parttime-2025-10'),
  '0a47b5ff5d2da54d': () => app.navigation.goTimeline('study-2025-04'),
  '0a47bae02b4fadbe': () => app.navigation.goTimeline('coding-2024-08'),
  '0a47c2ee45bebfb7': () => app.navigation.goTimeline('graduate-2024-06'),

  // File showcase: always navigate to the site's own File View, never open/download the asset.
  '06a7102650d00993': () => app.navigation.goTimeline('certificate-2026-02'),
  '06a731b723e130d6': () => goFile('excel'),
  '0a47c79355594bc9': () => goFile('word'),

  // Practice navigation
  '06a7c2d215c6a23a': () => goPractice(app.state.practiceId || 'exploratory'),
  '06a7c8fe80e063bd': () => goPractice('acceptance'),
  '0a485f8ff47c1a51': () => goDocument('acceptance', 'acceptance-requirements'),
  '0a4860ed53415f6f': () => goDocument('acceptance', 'acceptance-test-cases'),
  '0a47d18cb72f0d77': () => app.navigation.goTimeline('testing-2026-08'),

  '06a7ca1837cd8870': () => goPractice('exploratory'),
  '0a48f75f81278cbd': () => goDocument('exploratory', 'exploratory-mindmap'),
  '0a4881aa2e5ae200': () => goPractice('exploratory', () => document.querySelector('.practice-charters')?.scrollIntoView({ behavior: 'smooth', block: 'start' })),
  '0a4894b4243065d1': () => goCharter('login-form'),
  '0a4887416b041049': () => goCharter('login-form', 0),
  '0a488eea6c4f2476': () => goCharter('login-form', 1),
  '0a48ce7aa4b89de0': () => goCharter('login-form', 1),
  '0a4897c66466490e': () => goCharter('forgot-password'),
  '0a489960e7031970': () => goCharter('forgot-password', 0),
  '0a48cdb6287370d8': () => goCharter('forgot-password', 0),
  '0a4901e1ac8ff77e': () => app.navigation.goTimeline('testing-2026-08'),
};

function markClickableNodes(mind, placeholderIds) {
  Object.keys(actionMap).forEach((id) => {
    const el = mind.findEl?.(id) || document.querySelector(`[data-nodeid="${id}"], [data-node-id="${id}"]`);
    el?.classList.add('portfolio-map-link');
  });
}

function initMindmap() {
  const mount = document.querySelector('#map');
  if (!mount || !app.data || !app.navigation || !app.render) return;

  const introCard = document.querySelector('.intro-card');
  // Always start fully expanded. Mind Elixir initialization must never collapse it.
  introCard?.classList.remove('is-collapsed');

  const data = deepClone(mapTemplate);
  const placeholderIds = new Set();
  hydrateNode(data.nodeData, placeholderIds);

  // Initial view: keep levels 1-3 visible and fold the fourth level under
  // its level-3 parent. Users can expand those branches normally in Mind Elixir.
  const foldFourthLevel = (node, depth = 1) => {
    if (!node) return;
    if (depth === 3 && Array.isArray(node.children) && node.children.length) {
      node.expanded = false;
      return;
    }
    node.children?.forEach((child) => foldFourthLevel(child, depth + 1));
  };
  foldFourthLevel(data.nodeData);

  // Vite/npm initialization follows Mind Elixir's documented #map mount pattern.
  const mind = new MindElixir({
    el: '#map',
    direction: data.direction ?? MindElixir.SIDE,
    draggable: true,
    editable: false,
    contextMenu: true,
    toolBar: true,
    keypress: true,
    overflowHidden: false,
    mouseSelectionButton: 2,
    theme: data.theme,
  });

  // Use the user's exported Mind Elixir data directly; only topics are hydrated above.
  mind.init(data);

  // Collapse only after a real map gesture. A simple pointerdown during setup/clicking
  // is not enough: dragging must move at least 8px, or the user must wheel the map.
  const collapseIntro = () => introCard?.classList.add('is-collapsed');
  let dragStart = null;
  mount.addEventListener('pointerdown', (event) => {
    dragStart = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  mount.addEventListener('pointermove', (event) => {
    if (!dragStart) return;
    if (Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) >= 8) {
      collapseIntro();
      dragStart = null;
    }
  }, { passive: true });
  const clearDrag = () => { dragStart = null; };
  mount.addEventListener('pointerup', clearDrag, { passive: true });
  mount.addEventListener('pointercancel', clearDrag, { passive: true });
  mount.addEventListener('wheel', collapseIntro, { passive: true });

  // Clicking anywhere outside the mind-map restores the introduction.
  // Interactions inside #map keep it collapsed so map controls/nodes are unaffected.
  document.addEventListener('pointerdown', (event) => {
    if (!mount.contains(event.target)) {
      introCard?.classList.remove('is-collapsed');
    }
  }, { passive: true });

  // Mind Elixir v5 uses selectNodes (selectNode was removed in v5).
  mind.bus.addListener('selectNodes', (nodes) => {
    const selected = Array.isArray(nodes) ? nodes[0] : nodes;
    const id = selected?.id || selected?.nodeObj?.id;
    if (!id) return;
    actionMap[id]?.();
  });

  requestAnimationFrame(() => {
    markClickableNodes(mind, placeholderIds);
    mind.toCenter?.();
  });

  app.mindmap = mind;
  app.mindmapPlaceholderIds = placeholderIds;
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initMindmap, { once: true });
} else {
  initMindmap();
}
