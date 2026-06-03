// 学習スケジュール自動生成
// localStorage key: takken-scheduled-tasks  (タスク配列)
//                   takken-schedule-meta     (生成メタ情報)

import { TOPICS } from './topicsData';

export const LS_SCHEDULED_KEY     = 'takken-scheduled-tasks';
export const LS_SCHEDULE_META_KEY = 'takken-schedule-meta';
export const LS_STUDY_START_KEY   = 'takken-study-start-date';

export const EXAM_DATE = '2026-10-18';

// ── ユーティリティ ────────────────────────────────────────────────

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isWeekend(date) {
  const w = date.getDay();
  return w === 0 || w === 6;
}

/** 開始日からn日目の日付文字列 (n=1 が開始日当日) */
function dateAfter(start, n) {
  const d = new Date(start);
  d.setDate(d.getDate() + n - 1);
  return formatDate(d);
}

export function loadStudyStart() {
  const saved = localStorage.getItem(LS_STUDY_START_KEY);
  return saved || formatDate(new Date());
}

export function saveStudyStart(dateStr) {
  localStorage.setItem(LS_STUDY_START_KEY, dateStr);
}

// ── 科目データ ────────────────────────────────────────────────────

const CAT_LABELS = {
  gyo:   '宅建業法',
  kenri: '権利関係',
  horei: '法令上の制限',
  zei:   '税・その他',
};

const TOPIC_TITLES = {
  gyo:   TOPICS.gyo.map(t => t.title),
  kenri: TOPICS.kenri.map(t => t.title),
  horei: TOPICS.horei.map(t => t.title),
  zei:   TOPICS.zei.map(t => t.title),
};

const SEC_CAT = { gyo: 'kenri', kenri: 'gyo', horei: 'kenri', zei: 'gyo' };

function getTopic(cat, idx) {
  const list = TOPIC_TITLES[cat];
  if (!list?.length) return '';
  return list[Math.abs(idx) % list.length];
}

// フェーズごとの科目ローテーション（20日周期）
// Phase 1: gyo50% / kenri35% / horei10% / zei5%
// Phase 2: gyo40% / kenri30% / horei20% / zei10%
// Phase 3: gyo35% / kenri25% / horei25% / zei15%
const PHASE_CAT_CYCLE = {
  // gyo×10, kenri×7, horei×2, zei×1 = 20  → 50/35/10/5
  1: ['gyo','gyo','gyo','gyo','gyo','gyo','gyo','gyo','gyo','gyo',
      'kenri','kenri','kenri','kenri','kenri','kenri','kenri',
      'horei','horei','zei'],
  // gyo×8, kenri×6, horei×4, zei×2 = 20  → 40/30/20/10
  2: ['gyo','gyo','gyo','gyo','gyo','gyo','gyo','gyo',
      'kenri','kenri','kenri','kenri','kenri','kenri',
      'horei','horei','horei','horei','zei','zei'],
  // gyo×7, kenri×5, horei×5, zei×3 = 20  → 35/25/25/15
  3: ['gyo','gyo','gyo','gyo','gyo','gyo','gyo',
      'kenri','kenri','kenri','kenri','kenri',
      'horei','horei','horei','horei','horei',
      'zei','zei','zei'],
};

// 直前モード（sprint）の10日サイクル
// gyo40% / drill30% / review20% / horei_zei10%
const SPRINT_CYCLE = [
  'gyo','gyo','gyo','gyo',
  'drill','drill','drill',
  'review','review',
  'horei',
];

// フェーズ表示名
export const PHASE_NAMES = {
  0: '直前集中',
  1: '基礎導入',
  2: '基礎演習',
  3: '論点強化',
  4: '模試演習',
  5: '最終復習',
};

// ── フェーズ計算 ───────────────────────────────────────────────────

/**
 * 学習開始日と試験日から動的フェーズ配分を計算する。
 *
 * モード判定：
 *   通常  (120日以上) : 5フェーズ、P5=17日固定
 *   中期  (80〜119日) : 5フェーズ、P5=14日、P3比重を上げる
 *   短期  (40〜79日)  : 5フェーズ、P5を圧縮、P3・P4中心
 *   直前  (40日未満)  : スプリントモード（フェーズなし一括）
 *
 * @returns {{
 *   mode: 'normal'|'medium'|'short'|'sprint',
 *   totalDays: number,
 *   days: {p1,p2,p3,p4,p5},
 *   boundaries: {p1,p2,p3,p4},  // 各フェーズの最終日文字列
 * }}
 */
export function calculateDynamicPhases(studyStartDate, examDate) {
  const start   = parseLocalDate(studyStartDate);
  const lastDay = new Date(parseLocalDate(examDate));
  lastDay.setDate(lastDay.getDate() - 1); // 試験前日

  const totalDays = Math.max(0, Math.floor((lastDay - start) / 86400000) + 1);

  // ─ 直前モード ─────────────────────────────────────────────────
  if (totalDays < 40) {
    // 境界はすべて開始日前日（= どの日付も sprint 扱い）
    const beforeStart = formatDate(new Date(start.getTime() - 86400000));
    return {
      mode: 'sprint',
      totalDays,
      days: { p1: 0, p2: 0, p3: 0, p4: 0, p5: totalDays },
      boundaries: { p1: beforeStart, p2: beforeStart, p3: beforeStart, p4: beforeStart },
    };
  }

  // ─ P5日数 ──────────────────────────────────────────────────────
  let p5Days;
  if (totalDays >= 120)      p5Days = 17;
  else if (totalDays >= 80)  p5Days = 14;
  else                       p5Days = Math.max(10, Math.round(totalDays * 0.18));

  const afterP5 = totalDays - p5Days;

  // ─ P4日数 ──────────────────────────────────────────────────────
  let p4Days;
  if (totalDays >= 120) {
    p4Days = Math.min(30, Math.max(7, Math.round(afterP5 * 0.19)));
  } else if (totalDays >= 80) {
    p4Days = Math.min(24, Math.max(7, Math.round(afterP5 * 0.20)));
  } else {
    // 短期：P4は afterP5の20%（残りをP1/P2/P3に）
    p4Days = Math.max(3, Math.round(afterP5 * 0.20));
  }

  const early = afterP5 - p4Days;

  // ─ P1/P2/P3 比率 ───────────────────────────────────────────────
  let p1r, p2r, p3r;
  if (totalDays >= 120) {
    // 通常モード: 30/35/35
    p1r = 0.30; p2r = 0.35; p3r = 0.35;
  } else if (totalDays >= 80) {
    // 中期モード: 20/35/45（P3を厚くする）
    p1r = 0.20; p2r = 0.35; p3r = 0.45;
  } else {
    // 短期モード: 15/25/60（P3最大化）
    p1r = 0.15; p2r = 0.25; p3r = 0.60;
  }

  const p1Days = Math.max(1, Math.round(early * p1r));
  const p2Days = Math.max(1, Math.round(early * p2r));
  const p3Days = Math.max(1, early - p1Days - p2Days);

  const mode = totalDays >= 120 ? 'normal'
             : totalDays >= 80  ? 'medium'
             : 'short';

  return {
    mode,
    totalDays,
    days: { p1: p1Days, p2: p2Days, p3: p3Days, p4: p4Days, p5: p5Days },
    boundaries: {
      p1: dateAfter(start, p1Days),
      p2: dateAfter(start, p1Days + p2Days),
      p3: dateAfter(start, p1Days + p2Days + p3Days),
      p4: dateAfter(start, p1Days + p2Days + p3Days + p4Days),
    },
  };
}

/** 後方互換エイリアス（設定ページなどで使用） */
export function calcPhaseBoundaries(startDateStr) {
  return calculateDynamicPhases(startDateStr, EXAM_DATE);
}

function getPhaseId(dateStr, boundaries) {
  if (dateStr <= boundaries.p1) return 1;
  if (dateStr <= boundaries.p2) return 2;
  if (dateStr <= boundaries.p3) return 3;
  if (dateStr <= boundaries.p4) return 4;
  return 5;
}

// ── タスク生成 ────────────────────────────────────────────────────

function mk(dateStr, n, cat, type, title, min, phaseName) {
  return {
    id:        `sched-${dateStr}-${n}`,
    date:      dateStr,
    cat:       cat || null,
    type,
    title,
    topic:     '',
    min,
    phaseName,
    carry:     false,
    scheduled: true,
  };
}

/** Phase 1〜3 の通常タスク生成 */
function generatePhaseTasks(dateStr, dayIndex, phaseId, weekend) {
  const main = weekend ? 45 : 30;
  const name = PHASE_NAMES[phaseId];
  const cycle      = PHASE_CAT_CYCLE[phaseId] || PHASE_CAT_CYCLE[1];
  const primaryCat = cycle[dayIndex % cycle.length];
  const secCat     = SEC_CAT[primaryCat];
  const pLabel     = CAT_LABELS[primaryCat];
  const sLabel     = CAT_LABELS[secCat];
  const pTopic     = getTopic(primaryCat, dayIndex);
  const sTopic     = getTopic(secCat, Math.floor(dayIndex / 3));

  if (phaseId === 3) {
    return [
      mk(dateStr, 0, primaryCat, 'drill',  `問題演習：${pLabel} 論点別過去問 / ${pTopic}`, main, name),
      mk(dateStr, 1, null,       'review', '復習：苦手論点',                               20,   name),
      mk(dateStr, 2, secCat,     'drill',  `問題演習：${sLabel} / ${sTopic}`,              main, name),
      mk(dateStr, 3, null,       'tidy',   '間違いノート整理',                             10,   name),
    ];
  }
  if (phaseId === 2) {
    const nTopic = getTopic(primaryCat, dayIndex + 1);
    return [
      mk(dateStr, 0, primaryCat, 'drill',  `問題演習：${pLabel} / ${pTopic}`,  main, name),
      mk(dateStr, 1, primaryCat, 'new',    `新規学習：${pLabel} / ${nTopic}`,   main, name),
      mk(dateStr, 2, secCat,     'review', `復習：${sLabel} / ${sTopic}`,       20,   name),
      mk(dateStr, 3, null,       'tidy',   '間違いノート整理',                  10,   name),
    ];
  }
  // Phase 1
  return [
    mk(dateStr, 0, primaryCat, 'new',    `新規学習：${pLabel} / ${pTopic}`,  main, name),
    mk(dateStr, 1, primaryCat, 'drill',  `問題演習：${pLabel} / ${pTopic}`,  main, name),
    mk(dateStr, 2, secCat,     'review', `復習：${sLabel} / ${sTopic}`,      20,   name),
    mk(dateStr, 3, null,       'tidy',   '間違いノート整理',                 10,   name),
  ];
}

/** Phase 4：年度別・模試演習 */
function generatePhase4Tasks(dateStr, dayIndex, weekend) {
  const main = weekend ? 45 : 30;
  const name = PHASE_NAMES[4];
  const mainTitle = weekend ? '模試演習' : '年度別過去問';
  return [
    mk(dateStr, 0, null, 'drill',  mainTitle,          main, name),
    mk(dateStr, 1, null, 'review', '苦手論点の復習',    main, name),
    mk(dateStr, 2, null, 'review', 'まとめ・暗記確認',  20,   name),
    mk(dateStr, 3, null, 'tidy',   '間違いノート整理',  10,   name),
  ];
}

/** Phase 5：最終復習 */
function generatePhase5Tasks(dateStr, dayIndex, weekend) {
  const main = weekend ? 45 : 30;
  const name = PHASE_NAMES[5];
  const gyoTopic    = getTopic('gyo',   dayIndex);
  const kenriTopic  = getTopic('kenri', dayIndex);
  return [
    mk(dateStr, 0, null,    'review', '復習：間違いノート',                         main, name),
    mk(dateStr, 1, 'gyo',   'review', `暗記確認：宅建業法 / ${gyoTopic}`,           main, name),
    mk(dateStr, 2, 'horei', 'review', '暗記確認：法令上の制限',                     20,   name),
    mk(dateStr, 3, 'kenri', 'review', `頻出論点：権利関係 / ${kenriTopic}`,         10,   name),
  ];
}

/**
 * 直前モード（< 40日）の1日タスク
 * 宅建業法40% / 論点別過去問30% / 復習20% / 法令・税10%
 */
function generateSprintTasks(dateStr, dayIndex, weekend) {
  const main = weekend ? 50 : 35;
  const name = PHASE_NAMES[0];
  const dayType    = SPRINT_CYCLE[dayIndex % SPRINT_CYCLE.length];
  const gyoTopic   = getTopic('gyo',   dayIndex);
  const kenriTopic = getTopic('kenri', dayIndex);
  const horeiTopic = getTopic('horei', dayIndex);
  const zeiTopic   = getTopic('zei',   dayIndex);

  if (dayType === 'gyo') {
    return [
      mk(dateStr, 0, 'gyo',   'new',    `新規学習：宅建業法 / ${gyoTopic}`,   main, name),
      mk(dateStr, 1, 'gyo',   'drill',  `問題演習：宅建業法 / ${gyoTopic}`,   main, name),
      mk(dateStr, 2, null,    'review', '間違いノート整理',                   20,   name),
      mk(dateStr, 3, null,    'tidy',   '暗記確認',                           10,   name),
    ];
  }
  if (dayType === 'drill') {
    return [
      mk(dateStr, 0, 'gyo',   'drill',  `論点別過去問：宅建業法 / ${gyoTopic}`,   main, name),
      mk(dateStr, 1, 'kenri', 'drill',  `論点別過去問：権利関係 / ${kenriTopic}`, main, name),
      mk(dateStr, 2, null,    'review', '間違いノート整理',                       20,   name),
      mk(dateStr, 3, null,    'tidy',   'まとめ・暗記確認',                       10,   name),
    ];
  }
  if (dayType === 'review') {
    return [
      mk(dateStr, 0, null,  'review', '復習：間違いノート全体',             main, name),
      mk(dateStr, 1, 'gyo', 'review', `弱点確認：宅建業法 / ${gyoTopic}`,  main, name),
      mk(dateStr, 2, null,  'review', '暗記確認',                          20,   name),
      mk(dateStr, 3, null,  'tidy',   '要点まとめ',                        10,   name),
    ];
  }
  // horei / zei 暗記
  return [
    mk(dateStr, 0, 'horei', 'review', `暗記確認：法令上の制限 / ${horeiTopic}`, main, name),
    mk(dateStr, 1, 'zei',   'review', `暗記確認：税・その他 / ${zeiTopic}`,     main, name),
    mk(dateStr, 2, 'gyo',   'drill',  `問題演習：宅建業法 / ${gyoTopic}`,       20,   name),
    mk(dateStr, 3, null,    'tidy',   '間違いノート整理',                        10,   name),
  ];
}

// ── スケジュール全体生成 ───────────────────────────────────────────

export function generateSchedule(startDate, phaseData) {
  const effectiveStart = startDate || loadStudyStart();
  const pd  = phaseData || calculateDynamicPhases(effectiveStart, EXAM_DATE);
  const start = parseLocalDate(effectiveStart);
  const end   = parseLocalDate(EXAM_DATE);
  const all   = [];
  const isSprint = pd.mode === 'sprint';

  let dayIndex = 0;
  const cur = new Date(start);

  while (cur <= end) {
    const dateStr = formatDate(cur);
    let tasks;

    if (dateStr === EXAM_DATE) {
      // 本試験当日
      tasks = [{
        id: `sched-${dateStr}-0`, date: dateStr, cat: null,
        type: 'tidy', title: '本試験', topic: '13:00〜15:00',
        phaseName: '本試験', min: 120, carry: false, scheduled: true, fixedDate: true,
      }];
    } else if (isSprint) {
      tasks = generateSprintTasks(dateStr, dayIndex, isWeekend(cur));
    } else {
      const phaseId = getPhaseId(dateStr, pd.boundaries);
      if      (phaseId === 4) tasks = generatePhase4Tasks(dateStr, dayIndex, isWeekend(cur));
      else if (phaseId === 5) tasks = generatePhase5Tasks(dateStr, dayIndex, isWeekend(cur));
      else                    tasks = generatePhaseTasks(dateStr, dayIndex, phaseId, isWeekend(cur));
    }

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
  // 同タブ内のリスナー（MaterialPage の hasSchedule 等）に通知
  window.dispatchEvent(new StorageEvent('storage', { key: LS_SCHEDULE_META_KEY }));
}

// ── 生成 & 保存（重複防止マージ） ────────────────────────────────

export function generateAndSave(startDate) {
  const effectiveStart = startDate || loadStudyStart();
  if (startDate) saveStudyStart(startDate);

  const phaseData = calculateDynamicPhases(effectiveStart, EXAM_DATE);

  // 完了状態を取得
  let doneMap = {};
  try { doneMap = JSON.parse(localStorage.getItem('takken-task-done')) || {}; } catch { /**/ }

  const existing = loadScheduledTasks();

  // 完了済みタスク・手動追加タスクを保持（再生成対象外）
  const keep = existing.filter(t => {
    if (!t.scheduled) return true;    // 手動追加は保持
    if (!!doneMap[t.id]) return true; // 完了済みは保持
    return false;
  });

  // 新規スケジュール生成（完了済みタスクは除外して生成）
  const generated = generateSchedule(effectiveStart, phaseData);

  // 保持タスクのキー（date::title）を記録
  const keepKeys = new Set(keep.map(t => `${t.date}::${t.title}`));

  // 新規タスクから重複を除外
  const newTasks = generated.filter(t => !keepKeys.has(`${t.date}::${t.title}`));

  // マージ：保持タスク + 新規タスク
  const merged = [...keep, ...newTasks];

  saveScheduledTasks(merged);

  const meta = {
    generatedAt:  new Date().toISOString(),
    taskCount:    merged.length,
    newCount:     newTasks.length,
    startDate:    effectiveStart,
    endDate:      EXAM_DATE,
    mode:         phaseData.mode,
    phaseDays:    phaseData.days,
    phaseBounds:  phaseData.boundaries,
  };
  saveScheduleMeta(meta);
  return meta;
}

// ── 日付フィルタ ─────────────────────────────────────────────────

export function getScheduledTasksForDate(tasks, dateStr) {
  return tasks.filter(t => t.date === dateStr);
}

// ── 持ち越し処理（1日1回のみ実行） ──────────────────────────────

export const LS_CARRYOVER_DATE_KEY = 'takken-last-carryover-processed-date';

export function processCarryover(doneMap, todayStr) {
  const lastDate = localStorage.getItem(LS_CARRYOVER_DATE_KEY) || '';
  if (lastDate >= todayStr) return false;

  // 日付昇順ソート → 同名タスクが複数あるとき最新日（日付が大きい）を保持する
  const tasks = loadScheduledTasks()
    .slice()
    .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);

  const todayTitles = new Set(tasks.filter(t => t.date === todayStr).map(t => t.title));
  let changed       = false;

  const updatedTasks = tasks.map(t => {
    if (t.date >= todayStr || !!doneMap[t.id] || t.fixedDate) return t;
    if (todayTitles.has(t.title)) { changed = true; return null; }

    const PRIORITY_UP = { low: 'medium', medium: 'high', high: 'high' };
    todayTitles.add(t.title);
    changed = true;

    return {
      ...t,
      date:             todayStr,
      originalDate:     t.originalDate || t.date,
      carriedOver:      true,
      carriedOverCount: (t.carriedOverCount || 0) + 1,
      priority:         PRIORITY_UP[t.priority || 'medium'] || 'high',
      carry:            true,
    };
  }).filter(Boolean);

  if (changed) saveScheduledTasks(updatedTasks);
  localStorage.setItem(LS_CARRYOVER_DATE_KEY, todayStr);
  return changed;
}
