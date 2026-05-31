// 教材進捗管理
// 著作物コンテンツ（本文・問題文）は保存しない。章名・ページ範囲・進捗情報のみ。
// localStorage keys: takken-materials / takken-material-units

export const LS_MATERIALS_KEY = 'takken-materials';
export const LS_UNITS_KEY = 'takken-material-units';

export const MATERIAL_TYPES = [
  { id: 'textbook',  label: '教科書',  icon: 'book' },
  { id: 'workbook',  label: '問題集',  icon: 'target' },
  { id: 'video',     label: '動画',    icon: 'bolt' },
  { id: 'website',   label: 'ウェブ',  icon: 'arrowRight' },
  { id: 'mock_exam', label: '模試',    icon: 'note' },
  { id: 'other',     label: 'その他',  icon: 'spark' },
];

export const MATERIAL_STATUSES = [
  { id: 'not_started', label: '未着手', color: 'var(--ink-3)',    bg: 'var(--chip-neutral-bg)' },
  { id: 'using',       label: '使用中', color: 'var(--accent)',   bg: 'var(--accent-bg)' },
  { id: 'completed',   label: '完了',   color: 'var(--ok)',       bg: '#e8f5ec' },
  { id: 'reference',   label: '参考',   color: 'var(--carry)',    bg: 'var(--carry-bg)' },
];

export const UNIT_STATUSES = [
  { id: 'not_started',  label: '未着手',    color: 'var(--ink-3)',     bg: 'var(--chip-neutral-bg)' },
  { id: 'in_progress',  label: '学習中',    color: 'var(--accent)',    bg: 'var(--accent-bg)' },
  { id: 'read',         label: '読了',      color: 'var(--carry)',     bg: 'var(--carry-bg)' },
  { id: 'practicing',   label: '問題演習中', color: 'var(--cat-horei)', bg: 'var(--cat-horei-bg)' },
  { id: 'needs_review', label: '復習必要',  color: 'var(--warn)',      bg: 'var(--warn-bg)' },
  { id: 'completed',    label: '完了',      color: 'var(--ok)',        bg: '#e8f5ec' },
];


// ── localStorage 読み書き ─────────────────────────────────────────

export function loadMaterials() {
  try { return JSON.parse(localStorage.getItem(LS_MATERIALS_KEY)) || []; }
  catch { return []; }
}

export function loadMaterialUnits() {
  try { return JSON.parse(localStorage.getItem(LS_UNITS_KEY)) || []; }
  catch { return []; }
}

function saveMats(mats) {
  localStorage.setItem(LS_MATERIALS_KEY, JSON.stringify(mats));
  window.dispatchEvent(new StorageEvent('storage', { key: LS_MATERIALS_KEY }));
  return mats;
}

// カタログから教材＋全ユニットを一括追加
export function addMaterialFromCatalog(catalogEntry) {
  const now = new Date().toISOString();
  const matId = `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const material = {
    id: matId,
    title: catalogEntry.title,
    type: catalogEntry.type,
    status: catalogEntry.status || 'using',
    memo: null,
    createdAt: now,
    updatedAt: now,
  };
  saveMats([...loadMaterials(), material]);

  const newUnits = (catalogEntry.units || []).map((u, i) => ({
    id: `mu-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
    materialId: matId,
    subjectId: u.subjectId,
    topicId: u.topicId || null,
    chapterTitle: u.chapterTitle,
    pageRange: u.pageRange || null,
    url: u.url || null,
    keywords: u.keywords || null,
    status: 'not_started',
    estimatedMinutes: u.estimatedMinutes || null,
    memo: null,
    createdAt: now,
    updatedAt: now,
  }));
  saveUnits([...loadMaterialUnits(), ...newUnits]);
  return matId;
}

export function addMaterial(fields) {
  const now = new Date().toISOString();
  const item = {
    id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: fields.title.trim(),
    type: fields.type || 'textbook',
    status: fields.status || 'using',
    memo: fields.memo?.trim() || null,
    createdAt: now,
    updatedAt: now,
  };
  return saveMats([...loadMaterials(), item]);
}

export function editMaterial(id, fields) {
  const now = new Date().toISOString();
  return saveMats(loadMaterials().map(m => m.id !== id ? m : {
    ...m,
    title: fields.title.trim(),
    type: fields.type,
    status: fields.status,
    memo: fields.memo?.trim() || null,
    updatedAt: now,
  }));
}

export function deleteMaterial(id) {
  saveMats(loadMaterials().filter(m => m.id !== id));
  // 紐づくユニットも削除
  saveUnits(loadMaterialUnits().filter(u => u.materialId !== id));
}

function saveUnits(units) {
  localStorage.setItem(LS_UNITS_KEY, JSON.stringify(units));
  window.dispatchEvent(new StorageEvent('storage', { key: LS_UNITS_KEY }));
  return units;
}

// ── CRUD ─────────────────────────────────────────────────────────────

export function addMaterialUnit(fields) {
  const units = loadMaterialUnits();
  const now = new Date().toISOString();
  const item = {
    id: `mu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    materialId: fields.materialId,
    subjectId: fields.subjectId,
    topicId: fields.topicId || null,
    chapterTitle: fields.chapterTitle,
    pageRange: fields.pageRange || null,
    status: fields.status,
    estimatedMinutes: fields.estimatedMinutes ? Number(fields.estimatedMinutes) : null,
    memo: fields.memo || null,
    createdAt: now,
    updatedAt: now,
  };
  return saveUnits([...units, item]);
}

export function editMaterialUnit(unitId, fields) {
  const units = loadMaterialUnits();
  const now = new Date().toISOString();
  return saveUnits(units.map(u => u.id !== unitId ? u : {
    ...u,
    materialId: fields.materialId,
    subjectId: fields.subjectId,
    topicId: fields.topicId || null,
    chapterTitle: fields.chapterTitle,
    pageRange: fields.pageRange || null,
    status: fields.status,
    estimatedMinutes: fields.estimatedMinutes ? Number(fields.estimatedMinutes) : null,
    memo: fields.memo || null,
    updatedAt: now,
  }));
}

export function updateUnitStatus(unitId, status) {
  const units = loadMaterialUnits();
  const now = new Date().toISOString();
  return saveUnits(units.map(u =>
    u.id === unitId ? { ...u, status, updatedAt: now } : u
  ));
}

export function deleteUnit(unitId) {
  return saveUnits(loadMaterialUnits().filter(u => u.id !== unitId));
}

// ── 集計 ─────────────────────────────────────────────────────────────

export function computeMaterialStats(units) {
  return {
    total: units.length,
    completed: units.filter(u => u.status === 'completed').length,
    needsReview: units.filter(u => u.status === 'needs_review').length,
    inProgress: units.filter(u => u.status === 'in_progress' || u.status === 'practicing').length,
  };
}
