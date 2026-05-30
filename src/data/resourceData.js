// リソース管理
// 参照情報のみ保存。教材本文・問題文・解説・スクリーンショット・講義録は保存しない。
// localStorage key: takken-resources

export const LS_RESOURCES_KEY = 'takken-resources';

export const RESOURCE_TYPES = [
  { id: 'official', label: '公式',    icon: 'flag'       },
  { id: 'law',      label: '法令',    icon: 'note'       },
  { id: 'youtube',  label: 'YouTube', icon: 'bolt'       },
  { id: 'textbook', label: '教科書',  icon: 'book'       },
  { id: 'workbook', label: '問題集',  icon: 'target'     },
  { id: 'website',  label: 'ウェブ',  icon: 'arrowRight' },
  { id: 'other',    label: 'その他',  icon: 'spark'      },
];

export const RESOURCE_STATUSES = [
  { id: 'not_started', label: '未確認', color: 'var(--ink-3)',  bg: 'var(--chip-neutral-bg)' },
  { id: 'using',       label: '使用中', color: 'var(--accent)', bg: 'var(--accent-bg)'       },
  { id: 'completed',   label: '完了',   color: 'var(--ok)',     bg: '#e8f5ec'                },
  { id: 'reference',   label: '参照用', color: 'var(--carry)',  bg: 'var(--carry-bg)'        },
];

const TS = '2026-01-01T00:00:00.000Z';

const DEFAULT_RESOURCES = [
  { id: 'res-01', title: 'RETIO 公式過去問ページ',                                  type: 'official', subjectId: null,    topicId: null, url: null, description: '宅建試験の公式過去問と正解番号表', status: 'reference', memo: null },
  { id: 'res-02', title: 'e-Gov 宅地建物取引業法',                                  type: 'law',      subjectId: 'gyo',   topicId: null, url: null, description: null, status: 'reference', memo: null },
  { id: 'res-03', title: 'e-Gov 民法',                                              type: 'law',      subjectId: 'kenri', topicId: null, url: null, description: null, status: 'reference', memo: null },
  { id: 'res-04', title: 'e-Gov 借地借家法',                                        type: 'law',      subjectId: 'kenri', topicId: null, url: null, description: null, status: 'reference', memo: null },
  { id: 'res-05', title: 'e-Gov 建築基準法',                                        type: 'law',      subjectId: 'horei', topicId: null, url: null, description: null, status: 'reference', memo: null },
  { id: 'res-06', title: 'e-Gov 都市計画法',                                        type: 'law',      subjectId: 'horei', topicId: null, url: null, description: null, status: 'reference', memo: null },
  { id: 'res-07', title: 'e-Gov 農地法',                                            type: 'law',      subjectId: 'horei', topicId: null, url: null, description: null, status: 'reference', memo: null },
  { id: 'res-08', title: 'e-Gov 国土利用計画法',                                    type: 'law',      subjectId: 'horei', topicId: null, url: null, description: null, status: 'reference', memo: null },
  { id: 'res-09', title: '国交省 宅建業法改正情報',                                  type: 'official', subjectId: 'gyo',   topicId: null, url: null, description: null, status: 'reference', memo: null },
  { id: 'res-10', title: '棚田行政書士の不動産大学',                                type: 'youtube',  subjectId: null,    topicId: null, url: null, description: null, status: 'reference', memo: null },
  { id: 'res-11', title: 'ゆーき大学 宅建',                                        type: 'youtube',  subjectId: null,    topicId: null, url: null, description: null, status: 'reference', memo: null },
  { id: 'res-12', title: '吉野塾',                                                  type: 'youtube',  subjectId: null,    topicId: null, url: null, description: null, status: 'reference', memo: null },
  { id: 'res-13', title: '2026年度版 みんなが欲しかった！宅建士の教科書',           type: 'textbook', subjectId: null,    topicId: null, url: null, description: null, status: 'using',     memo: null },
  { id: 'res-14', title: '2026年度版 みんなが欲しかった！宅建士の論点別過去問題集', type: 'workbook', subjectId: null,    topicId: null, url: null, description: null, status: 'using',     memo: null },
].map(r => ({ ...r, createdAt: TS, updatedAt: TS }));

// ── localStorage 読み書き ─────────────────────────────────────────

export function loadResources() {
  try {
    const stored = localStorage.getItem(LS_RESOURCES_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(LS_RESOURCES_KEY, JSON.stringify(DEFAULT_RESOURCES));
    return DEFAULT_RESOURCES;
  } catch { return DEFAULT_RESOURCES; }
}

function save(list) {
  localStorage.setItem(LS_RESOURCES_KEY, JSON.stringify(list));
  window.dispatchEvent(new StorageEvent('storage', { key: LS_RESOURCES_KEY }));
  return list;
}

// ── CRUD ─────────────────────────────────────────────────────────────

export function addResource(fields) {
  const now = new Date().toISOString();
  const item = {
    id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: fields.title,
    type: fields.type,
    subjectId: fields.subjectId || null,
    topicId: fields.topicId || null,
    url: fields.url?.trim() || null,
    description: fields.description?.trim() || null,
    status: fields.status,
    memo: fields.memo?.trim() || null,
    createdAt: now,
    updatedAt: now,
  };
  return save([...loadResources(), item]);
}

export function editResource(id, fields) {
  const now = new Date().toISOString();
  return save(loadResources().map(r => r.id !== id ? r : {
    ...r,
    title: fields.title,
    type: fields.type,
    subjectId: fields.subjectId || null,
    topicId: fields.topicId || null,
    url: fields.url?.trim() || null,
    description: fields.description?.trim() || null,
    status: fields.status,
    memo: fields.memo?.trim() || null,
    updatedAt: now,
  }));
}

export function deleteResource(id) {
  return save(loadResources().filter(r => r.id !== id));
}

// ── 集計 ─────────────────────────────────────────────────────────────

export function computeResourceStats(resources) {
  return {
    total:     resources.length,
    using:     resources.filter(r => r.status === 'using').length,
    reference: resources.filter(r => r.status === 'reference').length,
    youtube:   resources.filter(r => r.type === 'youtube').length,
    law:       resources.filter(r => r.type === 'law').length,
  };
}
