// 学習スケジュール自動生成
// localStorage key: takken-scheduled-tasks  (タスク配列)
//                   takken-schedule-meta     (生成メタ情報)

import { TOPICS } from './topicsData';

export const LS_SCHEDULED_KEY      = 'takken-scheduled-tasks';
export const LS_SCHEDULE_META_KEY  = 'takken-schedule-meta';
export const LS_STUDY_START_KEY    = 'takken-study-start-date'; // ユーザー設定の開始日

export const EXAM_DATE = '2026-10-18';

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** ユーザーが設定した開始日を取得（未設定なら今日） */
export function loadStudyStart() {
  const saved = localStorage.getItem(LS_STUDY_START_KEY);
  if (saved) return saved;
  return formatDate(new Date());
}

export function saveStudyStart(dateStr) {
  localStorage.setItem(LS_STUDY_START_KEY, dateStr);
}

// ── 内部データ ─────────────────────────────────────────────────────

const CAT_LABELS = {
  gyo:   '宅建業法',
  kenri: '権利関係',
  horei: '法令上の制限',
  zei:   '税・その他',
};

// トピック名リスト（topicsData から生成）
const TOPIC_TITLES = {
  gyo:   TOPICS.gyo.map(t => t.title),
  kenri: TOPICS.kenri.map(t => t.title),
  horei: TOPICS.horei.map(t => t.title),
  zei:   TOPICS.zei.map(t => t.title),
};

// 復習タスクのサブ科目
const SEC_CAT = { gyo: 'kenri', kenri: 'gyo', horei: 'kenri', zei: 'gyo' };

// 科目ローテーション（length=20）
// Phase 1: gyo50 / kenri35 / horei10 / zei5
// Phase 2: gyo40 / kenri30 / horei20 / zei10
// Phase 3: gyo35 / kenri25 / horei25 / zei15
const PHASE_CAT_CYCLE = {
  1: ['gyo','gyo','gyo','gyo','gyo','kenri','kenri','kenri','kenri','horei',
      'gyo','gyo','gyo','kenri','kenri','kenri','horei','gyo','zei','kenri'],
  2: ['gyo','gyo','gyo','gyo','kenri','kenri','kenri','horei','horei','zei',
      'gyo','gyo','gyo','kenri','kenri','horei','horei','gyo','zei','kenri'],
  3: ['gyo','gyo','gyo','gyo','kenri','kenri','kenri','horei','horei','horei',
      'gyo','gyo','kenri','kenri','horei','horei','zei','gyo','zei','kenri'],
};

// ── ヘルパー ──────────────────────────────────────────────────────

function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isWeekend(date) {
  const w = date.getDay();
  return w === 0 || w === 6;
}

// 科目ごとのトピック名を cycleIndex でローテーション
function getTopic(cat, idx) {
  const list = TOPIC_TITLES[cat];
  if (!list || !list.length) return '';
  return list[Math.abs(idx) % list.length];
}

// ── フェーズ境界の動的計算 ────────────────────────────────────────
//
// 総日数（開始日〜試験前日）に応じてフェーズ長を比例配分する。
// Phase 5（最終復習）は常に末尾17日固定。
// Phase 4（模試演習）は残りの18%、7〜30日の範囲に収める。
// Phase 1・2・3 は残り日数を 30 / 35 / 35 % で分割。
//
// 返り値: { p1, p2, p3, p4 } — 各フェーズの最終日（'YYYY-MM-DD'）
//   p4 + 1 日〜試験前日が Phase 5 になる。
//
export function calcPhaseBoundaries(startDateStr) {
  const start   = parseLocalDate(startDateStr);
  const lastDay = parseLocalDate(EXAM_DATE);
  lastDay.setDate(lastDay.getDate() - 1); // 10/17（試験前日）

  const totalDays = Math.max(0, Math.floor((lastDay - start) / 86400000) + 1);

  // Phase 5: 最後17日（足りなければ全期間）
  const p5 = Math.min(17, totalDays);
  // Phase 4: 残りの18%、最低7日・最大30日（残りがなければ0）
  const afterP5 = totalDays - p5;
  const p4 = afterP5 > 0
    ? Math.min(30, Math.max(7, Math.round(afterP5 * 0.18)))
    : 0;
  // Phase 1〜3: 残り日数を 30/35/35 で分割
  const early = Math.max(0, totalDays - p5 - p4);
  const p1 = Math.round(early * 0.30);
  const p2 = Math.round(early * 0.35);
  const p3 = early - p1 - p2;

  // n 日目の最終日文字列（0 なら開始日の前日 ＝ フェーズなし）
  function endDateStr(n) {
    const d = new Date(start);
    d.setDate(d.getDate() + n - 1);
    return formatDate(d);
  }

  return {
    p1: endDateStr(p1),
    p2: endDateStr(p1 + p2),
    p3: endDateStr(p1 + p2 + p3),
    p4: endDateStr(p1 + p2 + p3 + p4),
    // Phase 5: p4 + 1 日目〜最終日
    days: { p1, p2, p3, p4, p5 },  // 日数情報（メタ表示用）
  };
}

// フェーズIDの判定（境界は動的）
function getPhaseId(dateStr, boundaries) {
  if (dateStr <= boundaries.p1) return 1;
  if (dateStr <= boundaries.p2) return 2;
  if (dateStr <= boundaries.p3) return 3;
  if (dateStr <= boundaries.p4) return 4;
  return 5;
}

// ── 1日分のタスク生成 ──────────────────────────────────────────────

function generateDayTasks(dateStr, dayIndex, phaseId, weekend) {
  const main = weekend ? 45 : 30; // 主学習・問題演習の分数

  const mk = (n, cat, type, title, min) => ({
    id:        `sched-${dateStr}-${n}`,
    date:      dateStr,
    cat:       cat || null,
    type,
    title,
    topic:     '',
    min,
    carry:     false,
    scheduled: true,
  });

  // 本試験当日
  if (dateStr === EXAM_DATE) {
    return [{
      id: `sched-${dateStr}-0`, date: dateStr, cat: null,
      type: 'tidy', title: '本試験', topic: '13:00〜15:00',
      min: 120, carry: false, scheduled: true, fixedDate: true,
    }];
  }

  // Phase 5：最終復習
  if (phaseId === 5) {
    const gyoTopic = getTopic('gyo', dayIndex);
    return [
      mk(0, null,    'review', '復習：間違いノート',                    main),
      mk(1, 'gyo',   'review', `暗記確認：宅建業法 / ${gyoTopic}`,      main),
      mk(2, 'horei', 'review', '暗記確認：法令上の制限',                20),
      mk(3, null,    'tidy',   '最終チェック',                         10),
    ];
  }

  // Phase 4：年度別・模試演習
  if (phaseId === 4) {
    const mainTitle = weekend ? '模試演習' : '年度別過去問';
    return [
      mk(0, null, 'drill',  mainTitle,          main),
      mk(1, null, 'review', '苦手論点の復習',    main),
      mk(2, null, 'review', 'まとめ・暗記確認',  20),
      mk(3, null, 'tidy',   '間違いノート整理',  10),
    ];
  }

  // Phase 1〜3：科目ローテーション
  const cycle      = PHASE_CAT_CYCLE[phaseId] || PHASE_CAT_CYCLE[1];
  const primaryCat = cycle[dayIndex % cycle.length];
  const secCat     = SEC_CAT[primaryCat];
  const pLabel     = CAT_LABELS[primaryCat];
  const sLabel     = CAT_LABELS[secCat];
  const pTopic     = getTopic(primaryCat, dayIndex);
  // 復習は 3 日おきにトピックが進む（ゆっくり定着）
  const sTopic     = getTopic(secCat, Math.floor(dayIndex / 3));

  if (phaseId === 3) {
    return [
      mk(0, primaryCat, 'drill',  `問題演習：${pLabel} 論点別過去問 / ${pTopic}`,  main),
      mk(1, null,       'review', '復習：苦手論点',                                20),
      mk(2, secCat,     'drill',  `問題演習：${sLabel} / ${sTopic}`,               main),
      mk(3, null,       'tidy',   '間違いノート整理',                              10),
    ];
  }

  if (phaseId === 2) {
    const nTopic = getTopic(primaryCat, dayIndex + 1);
    return [
      mk(0, primaryCat, 'drill',  `問題演習：${pLabel} / ${pTopic}`,  main),
      mk(1, primaryCat, 'new',    `新規学習：${pLabel} / ${nTopic}`,   main),
      mk(2, secCat,     'review', `復習：${sLabel} / ${sTopic}`,       20),
      mk(3, null,       'tidy',   '間違いノート整理',                  10),
    ];
  }

  // Phase 1：基礎導入
  return [
    mk(0, primaryCat, 'new',    `新規学習：${pLabel} / ${pTopic}`,   main),
    mk(1, primaryCat, 'drill',  `問題演習：${pLabel} / ${pTopic}`,   main),
    mk(2, secCat,     'review', `復習：${sLabel} / ${sTopic}`,        20),
    mk(3, null,       'tidy',   '間違いノート整理',                   10),
  ];
}

// ── スケジュール全体生成 ───────────────────────────────────────────

export function generateSchedule(startDate, boundaries) {
  const effectiveStart = startDate || loadStudyStart();
  const bs  = boundaries || calcPhaseBoundaries(effectiveStart);
  const start = parseLocalDate(effectiveStart);
  const end   = parseLocalDate(EXAM_DATE);
  const all   = [];

  let dayIndex = 0;
  const cur = new Date(start);

  while (cur <= end) {
    const dateStr = formatDate(cur);
    const phaseId = getPhaseId(dateStr, bs);
    const tasks   = generateDayTasks(dateStr, dayIndex, phaseId, isWeekend(cur));
    all.push(...tasks);
    dayIndex++;
    cur.setDate(cur.getDate() + 1);
  }

  return all;
}

// ── localStorage CRUD ─────────────────────────────────────────────

export function loadScheduledTasks() {
  try { return JSON.parse(localStorage.getItem(LS_SCHEDULED_KEY)) || []; }
  catch { return []; }
}

export function loadScheduleMeta() {
  try { return JSON.parse(localStorage.getItem(LS_SCHEDULE_META_KEY)) || null; }
  catch { return null; }
}

function saveScheduledTasks(tasks) {
  localStorage.setItem(LS_SCHEDULED_KEY, JSON.stringify(tasks));
  window.dispatchEvent(new StorageEvent('storage', { key: LS_SCHEDULED_KEY }));
}

function saveScheduleMeta(meta) {
  localStorage.setItem(LS_SCHEDULE_META_KEY, JSON.stringify(meta));
}

// ── 生成 & 保存（重複防止マージ） ────────────────────────────────

export function generateAndSave(startDate) {
  const effectiveStart = startDate || loadStudyStart();
  if (startDate) saveStudyStart(startDate);

  const boundaries = calcPhaseBoundaries(effectiveStart);
  const existing   = loadScheduledTasks();
  const generated  = generateSchedule(effectiveStart, boundaries);

  // date::title をキーに重複チェック（手動タスク・完了タスクを保護）
  const existingKeys = new Set(existing.map(t => `${t.date}::${t.title}`));
  const newTasks     = generated.filter(t => !existingKeys.has(`${t.date}::${t.title}`));

  const merged = [...existing, ...newTasks];
  saveScheduledTasks(merged);

  const meta = {
    generatedAt: new Date().toISOString(),
    taskCount:   merged.length,
    newCount:    newTasks.length,
    startDate:   effectiveStart,
    endDate:     EXAM_DATE,
    phaseDays:   boundaries.days,   // 各フェーズの日数（UI表示用）
    phaseBounds: {                  // 各フェーズの最終日（UI表示用）
      p1: boundaries.p1,
      p2: boundaries.p2,
      p3: boundaries.p3,
      p4: boundaries.p4,
    },
  };
  saveScheduleMeta(meta);
  return meta;
}

// ── 日付フィルタ（ホーム用） ─────────────────────────────────────

export function getScheduledTasksForDate(tasks, dateStr) {
  return tasks.filter(t => t.date === dateStr);
}

// ── 持ち越し処理（1日1回のみ実行） ──────────────────────────────

export const LS_CARRYOVER_DATE_KEY = 'takken-last-carryover-processed-date';

export function processCarryover(doneMap, todayStr) {
  const lastDate = localStorage.getItem(LS_CARRYOVER_DATE_KEY) || '';
  if (lastDate >= todayStr) return false;

  const tasks = loadScheduledTasks();

  const todayTitles = new Set(
    tasks.filter(t => t.date === todayStr).map(t => t.title)
  );

  let changed = false;

  const updatedTasks = tasks.map(t => {
    if (t.date >= todayStr || !!doneMap[t.id] || t.fixedDate) return t;

    if (todayTitles.has(t.title)) {
      changed = true;
      return null;
    }

    const originalDate  = t.originalDate || t.date;
    const count         = (t.carriedOverCount || 0) + 1;
    const PRIORITY_UP   = { low: 'medium', medium: 'high', high: 'high' };

    todayTitles.add(t.title);
    changed = true;

    return {
      ...t,
      date:             todayStr,
      originalDate,
      carriedOver:      true,
      carriedOverCount: count,
      priority:         PRIORITY_UP[t.priority || 'medium'] || 'high',
      carry:            true,
    };
  }).filter(Boolean);

  if (changed) saveScheduledTasks(updatedTasks);

  localStorage.setItem(LS_CARRYOVER_DATE_KEY, todayStr);
  return changed;
}
