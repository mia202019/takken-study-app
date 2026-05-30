// 復習データ管理（教材本文・問題文は保存しない）
// localStorage key: takken-review-items

export const LS_REVIEW_KEY = 'takken-review-items';

// ── 日付ユーティリティ ────────────────────────────────────────────

export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function fmtDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${m}月${d}日`;
}

// ── 復習間隔設定 ───────────────────────────────────────────────────

export const RESULT_CONFIGS = [
  { id: 'forgot', label: '忘れた', days: 1,  color: 'var(--warn)',   bg: 'var(--warn-bg)',      hint: '翌日' },
  { id: 'hard',   label: '難しい', days: 1,  color: '#9a5020',       bg: '#fdf5e4',             hint: '翌日' },
  { id: 'normal', label: '普通',   days: 7,  color: 'var(--accent)', bg: 'var(--accent-bg)',    hint: '7日後' },
  { id: 'easy',   label: '簡単',   days: 30, color: 'var(--ok)',     bg: 'var(--cat-kenri-bg)', hint: '30日後' },
];

// ── localStorage 読み書き ─────────────────────────────────────────

export function loadReviewItems() {
  try { return JSON.parse(localStorage.getItem(LS_REVIEW_KEY)) || []; }
  catch { return []; }
}

function save(items) {
  localStorage.setItem(LS_REVIEW_KEY, JSON.stringify(items));
  // 同一タブ内で他コンポーネントが受け取れるよう手動発火
  window.dispatchEvent(new StorageEvent('storage', { key: LS_REVIEW_KEY }));
  return items;
}

// ── CRUD ────────────────────────────────────────────────────────────

/** 論点を復習に追加（同一topicIdのpendingがある場合はスキップ） */
export function addReviewItem(topicId, subjectId) {
  const items = loadReviewItems();
  if (items.some(it => it.topicId === topicId && it.status === 'pending')) return items;

  const now = new Date().toISOString();
  const item = {
    id: `rv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topicId,
    subjectId,
    dueDate: addDays(todayStr(), 1),  // 初期: 翌日
    status: 'pending',
    reviewCount: 0,
    lastResult: null,
    createdAt: now,
    updatedAt: now,
  };
  return save([...items, item]);
}

/** 復習完了：現在のアイテムをdoneにして次の予定を作成 */
export function completeReview(itemId, result) {
  const items = loadReviewItems();
  const item = items.find(it => it.id === itemId);
  if (!item) return items;

  const cfg = RESULT_CONFIGS.find(r => r.id === result);
  const now = new Date().toISOString();
  const nextDue = addDays(todayStr(), cfg?.days ?? 7);

  const updated = items.map(it =>
    it.id === itemId ? { ...it, status: 'done', lastResult: result, updatedAt: now } : it
  );

  const next = {
    id: `rv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    topicId: item.topicId,
    subjectId: item.subjectId,
    dueDate: nextDue,
    status: 'pending',
    reviewCount: item.reviewCount + 1,
    lastResult: null,
    createdAt: now,
    updatedAt: now,
  };

  return save([...updated, next]);
}

// ── 集計 ─────────────────────────────────────────────────────────────

export function computeReviewStats(items) {
  const today = todayStr();
  const pending = items.filter(it => it.status === 'pending');
  return {
    overdue:  pending.filter(it => it.dueDate <  today).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    today:    pending.filter(it => it.dueDate === today),
    upcoming: pending.filter(it => it.dueDate >  today).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
  };
}

/** ホームサマリー用：期限超過数と今日の復習数 */
export function computeReviewCounts(items) {
  const { overdue, today } = computeReviewStats(items);
  return { overdueCount: overdue.length, todayCount: today.length };
}

/** topicId → pending があるか */
export function hasPendingReview(items, topicId) {
  return items.some(it => it.topicId === topicId && it.status === 'pending');
}

/**
 * ミス記録連動：既存pendingがなければ作成、あればdueDateが早い方に更新
 */
export function upsertReviewItem(topicId, subjectId, dueDateStr) {
  const items = loadReviewItems();
  const existing = items.find(it => it.topicId === topicId && it.status === 'pending');

  if (!existing) {
    const now = new Date().toISOString();
    const item = {
      id: `rv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      topicId,
      subjectId,
      dueDate: dueDateStr,
      status: 'pending',
      reviewCount: 0,
      lastResult: null,
      createdAt: now,
      updatedAt: now,
    };
    return save([...items, item]);
  }

  if (dueDateStr < existing.dueDate) {
    const now = new Date().toISOString();
    return save(items.map(it =>
      it.id === existing.id ? { ...it, dueDate: dueDateStr, updatedAt: now } : it
    ));
  }

  return items;
}
