// 間違いノートデータ管理
// 教材本文・問題文の全文保存は避け、出典メモ・短い要点・自分の理解メモとして記録する
// localStorage key: takken-mistake-logs

export const LS_MISTAKE_KEY = 'takken-mistake-logs';

export const SOURCE_TYPES = [
  { id: 'past_exam',  label: '過去問' },
  { id: 'workbook',   label: '問題集' },
  { id: 'mock_exam',  label: '模試' },
  { id: 'self_made',  label: '自作' },
  { id: 'other',      label: 'その他' },
];

export const RESULTS = [
  { id: 'incorrect',          label: '不正解',       color: 'var(--warn)',   bg: 'var(--warn-bg)' },
  { id: 'correct_but_unsure', label: '正解（不安）', color: '#9a5020',       bg: '#fdf5e4' },
];

export const CONFIDENCE_LEVELS = [
  { id: 'low',    label: '低い', color: 'var(--warn)',   bg: 'var(--warn-bg)' },
  { id: 'medium', label: '普通', color: 'var(--accent)', bg: 'var(--accent-bg)' },
  { id: 'high',   label: '高い', color: 'var(--ok)',     bg: '#e8f5ec' },
];

export const MISTAKE_REASONS = [
  '知識不足',
  '暗記不足',
  '問題文の読み間違い',
  '似た論点と混同',
  '条件を見落とした',
  '数字を覚えていない',
  '理解できていない',
  'ケアレスミス',
];

// ── localStorage 読み書き ─────────────────────────────────────────

export function loadMistakeLogs() {
  try { return JSON.parse(localStorage.getItem(LS_MISTAKE_KEY)) || []; }
  catch { return []; }
}

function save(logs) {
  localStorage.setItem(LS_MISTAKE_KEY, JSON.stringify(logs));
  window.dispatchEvent(new StorageEvent('storage', { key: LS_MISTAKE_KEY }));
  return logs;
}

// ── CRUD ─────────────────────────────────────────────────────────────

export function addMistakeLog(fields) {
  const logs = loadMistakeLogs();
  const now = new Date().toISOString();
  const item = {
    id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: fields.date,
    subjectId: fields.subjectId,
    topicId: fields.topicId,
    sourceType: fields.sourceType,
    sourceReference: fields.sourceReference || null,
    result: fields.result,
    confidence: fields.confidence,
    mistakeReason: fields.mistakeReason,
    memo: fields.memo || null,
    createdAt: now,
    updatedAt: now,
  };
  return save([item, ...logs]);
}

// ── 集計 ─────────────────────────────────────────────────────────────

export function computeMistakeStats(logs) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  // 今週月曜日を起点
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((dayOfWeek + 6) % 7));

  const weekCount = logs.filter(l => new Date(l.createdAt) >= weekStart).length;

  const reasonCount = {};
  logs.forEach(l => { reasonCount[l.mistakeReason] = (reasonCount[l.mistakeReason] || 0) + 1; });
  const topReason = Object.entries(reasonCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { weekCount, topReason };
}
