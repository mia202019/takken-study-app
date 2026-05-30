import { useState, useMemo, useEffect, useCallback } from 'react';
import Icon from '../components/Icon';
import {
  CAT, TYPE, NAV, NAV_PRIMARY,
  INITIAL_TASKS, FIXED_TASKS, EXAM,
  daysBetween, parseDate, fmtShort, fmtMD, weekday,
} from '../data/appData';
import { loadLevels, computeWeakTopics } from '../data/topicsData';
import { loadReviewItems, computeReviewCounts } from '../data/reviewData';
import TopicMap from './TopicMap';
import ReviewPage from './ReviewPage';
import MistakePage from './MistakePage';
import MaterialPage from './MaterialPage';
import ResourcePage from './ResourcePage';
import AnalysisPage from './AnalysisPage';
import SettingsPage from './SettingsPage';
import HelpPage from './HelpPage';
import { loadMistakeLogs, computeMistakeStats } from '../data/mistakeData';
import { loadMaterialUnits, computeMaterialStats } from '../data/materialData';
import { loadResources, computeResourceStats } from '../data/resourceData';
import {
  loadScheduledTasks, getScheduledTasksForDate,
  LS_SCHEDULED_KEY, processCarryover,
} from '../data/scheduleData';

const TODAY = new Date();
const TODAY_STR = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}-${String(TODAY.getDate()).padStart(2, '0')}`;

// ── Helpers ──────────────────────────────────────────────────────

function tagBase(size = 'sm') {
  const pad = size === 'xs' ? '2px 7px' : '3px 9px';
  const fs = size === 'xs' ? 11 : 12;
  return {
    display: 'inline-flex', alignItems: 'center', padding: pad,
    borderRadius: 6, fontSize: fs, fontWeight: 500, lineHeight: 1.2,
    letterSpacing: '.02em', whiteSpace: 'nowrap',
  };
}

function CatTag({ cat, size }) {
  if (!cat) return (
    <span style={{ ...tagBase(size), background: 'var(--chip-neutral-bg)', color: 'var(--ink-3)' }}>その他</span>
  );
  const c = CAT[cat];
  return <span style={{ ...tagBase(size), background: c.bg, color: c.fg }}>{c.label}</span>;
}

function Dot({ cat, s = 8 }) {
  return (
    <span style={{
      width: s, height: s, borderRadius: s,
      background: cat ? CAT[cat].dot : 'var(--ink-4)',
      flexShrink: 0, display: 'inline-block',
    }} />
  );
}

function TypeBadge({ type }) {
  const t = TYPE[type];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--ink-3)', fontSize: 11.5, fontWeight: 500 }}>
      <Icon name={t.icon} size={13} stroke={1.8} /> {t.label}
    </span>
  );
}

function ProgressBar({ value, max, color = 'var(--accent)', h = 6 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ height: h, borderRadius: h, background: 'var(--track)', overflow: 'hidden', width: '100%' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: h, transition: 'width .35s ease' }} />
    </div>
  );
}

function SectionLabel({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '.04em', color: 'var(--ink-2)' }}>{children}</h3>
      {right}
    </div>
  );
}

// ── localStorage hook ─────────────────────────────────────────────

const LS_KEY = 'takken-task-done';

function loadDoneState() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
}

function useTasks() {
  const [doneMap, setDoneMap] = useState(loadDoneState);
  const [extraTasks, setExtraTasks] = useState([]);
  const [scheduledToday, setScheduledToday] = useState(() =>
    getScheduledTasksForDate(loadScheduledTasks(), TODAY_STR)
  );

  // マウント時に1度だけ持ち越し処理を実行
  useEffect(() => {
    const changed = processCarryover(loadDoneState(), TODAY_STR);
    if (changed) {
      setScheduledToday(getScheduledTasksForDate(loadScheduledTasks(), TODAY_STR));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // スケジュールが生成・更新されたら今日分を再取得
  useEffect(() => {
    const handler = (e) => {
      if (!e.key || e.key === LS_SCHEDULED_KEY) {
        setScheduledToday(getScheduledTasksForDate(loadScheduledTasks(), TODAY_STR));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // 表示順: 持ち越し → サンプル（スケジュールなし時のみ）→ 通常
  const tasks = useMemo(() => {
    const carried  = scheduledToday.filter(t => t.carriedOver);
    const regular  = scheduledToday.filter(t => !t.carriedOver);
    // スケジュール済みタスクがある日はサンプルタスクを非表示
    const showSamples = scheduledToday.length === 0 && extraTasks.length === 0;
    return [
      ...carried.map(t  => ({ ...t, done: !!doneMap[t.id] })),
      ...(showSamples ? INITIAL_TASKS.map(t => ({ ...t, done: !!doneMap[t.id] })) : []),
      ...regular.map(t  => ({ ...t, done: !!doneMap[t.id] })),
      ...extraTasks.map(t => ({ ...t, done: !!doneMap[t.id] })),
    ];
  }, [doneMap, scheduledToday, extraTasks]);

  const toggle = useCallback((id) => {
    setDoneMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addTask = useCallback((task) => {
    setExtraTasks(prev => [...prev, task]);
  }, []);

  return { tasks, toggle, addTask };
}

// ── Coach bubble ──────────────────────────────────────────────────

function CoachBubble({ tasks, desktop }) {
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const remaining = tasks.filter(t => !t.done).reduce((a, t) => a + t.min, 0);
  let msg, sub;
  if (done >= total) {
    msg = '今日のタスク、ぜんぶ完了です。';
    sub = 'よくがんばりました。ゆっくり休みましょう。';
  } else if (done === 0) {
    msg = '今日の分だけ、進めましょう。';
    sub = `残り${total}件・約${remaining}分。まずは1つだけでOKです。`;
  } else {
    msg = 'いいペースです。';
    sub = `残り${total - done}件・約${remaining}分。この調子で。`;
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
      <span style={{
        flexShrink: 0, width: desktop ? 44 : 38, height: desktop ? 44 : 38, borderRadius: '50%',
        background: 'var(--accent-bg)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="sun" size={desktop ? 22 : 19} stroke={1.7} />
      </span>
      <div style={{
        position: 'relative', background: 'var(--surface)',
        border: '1px solid var(--line)', borderRadius: 14,
        padding: desktop ? '12px 18px' : '11px 14px',
        maxWidth: desktop ? 560 : '100%',
        boxShadow: '0 1px 2px rgba(60,45,30,.04)',
      }}>
        <span style={{
          position: 'absolute', left: -6, top: 15, width: 11, height: 11,
          background: 'var(--surface)', borderLeft: '1px solid var(--line)',
          borderBottom: '1px solid var(--line)', transform: 'rotate(45deg)',
        }} />
        <div style={{ fontSize: desktop ? 18 : 16, fontWeight: 700, color: 'var(--ink-1)', letterSpacing: '-.01em', lineHeight: 1.35 }}>{msg}</div>
        <div style={{ fontSize: desktop ? 13 : 12.5, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.4 }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Countdown ─────────────────────────────────────────────────────

function Countdown({ desktop }) {
  const days = daysBetween(TODAY, EXAM.date);
  const stats = [
    { k: '現在フェーズ', v: EXAM.phase },
    { k: '今週の目標', v: EXAM.weeklyGoalH + '時間' },
    { k: '申込ステータス', v: EXAM.applyStatus, warn: true },
  ];
  return (
    <div style={{
      background: 'var(--band)', color: 'var(--band-ink)', borderRadius: 16,
      padding: desktop ? '22px 28px' : '16px 16px',
      display: 'flex', alignItems: 'center', flexWrap: 'wrap',
      gap: desktop ? 28 : 14, border: '1px solid var(--band-line)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '.06em', color: 'var(--band-soft)', marginBottom: 1 }}>本試験まで</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ fontSize: 11, color: 'var(--band-soft)' }}>あと</span>
            <span style={{ fontSize: desktop ? 44 : 36, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.01em' }}>{days}</span>
            <span style={{ fontSize: 14, color: 'var(--band-soft)' }}>日</span>
          </div>
        </div>
      </div>
      {desktop && <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--band-line)' }} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{EXAM.dateLabel}</div>
        <div style={{ fontSize: 11.5, color: 'var(--band-soft)' }}>{EXAM.timeLabel}</div>
      </div>
      <div style={{
        flex: 1, minWidth: desktop ? 'auto' : '100%',
        display: 'flex', gap: desktop ? 26 : 0,
        justifyContent: desktop ? 'flex-end' : 'space-between',
        borderTop: desktop ? 'none' : '1px solid var(--band-line)',
        paddingTop: desktop ? 0 : 10, marginTop: desktop ? 0 : 2,
      }}>
        {stats.map(s => (
          <div key={s.k} style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: desktop ? 'flex-end' : 'flex-start' }}>
            <span style={{ fontSize: 11, color: 'var(--band-soft)', letterSpacing: '.03em' }}>{s.k}</span>
            <span style={{ fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {s.warn && <span style={{ width: 7, height: 7, borderRadius: 7, background: 'var(--warn)' }} />}
              {s.v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Important tasks ────────────────────────────────────────────────

function ImportantTasks() {
  const rows = FIXED_TASKS.map(t => ({ ...t, d: parseDate(t.date), left: daysBetween(TODAY, parseDate(t.date)) }));
  return (
    <div className="tk-card" style={{ borderTop: '3px solid var(--warn)' }}>
      <SectionLabel right={
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Icon name="flag" size={13} /> 固定日
        </span>
      }>
        重要タスク・申込関連
      </SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((t, i) => (
          <div key={t.date} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
            borderTop: i ? '1px solid var(--line)' : 'none',
          }}>
            <div style={{ width: 50, flexShrink: 0, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.exam ? 'var(--warn)' : 'var(--ink-1)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{fmtShort(t.d)}</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{t.d.getFullYear()}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t.title}</span>
                {t.exam && <span style={{ ...tagBase('xs'), background: 'var(--warn-bg)', color: 'var(--warn)' }}>本番</span>}
                {t.key && <span style={{ ...tagBase('xs'), background: 'var(--accent-bg)', color: 'var(--accent)' }}>重要</span>}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{t.note}</div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {t.left >= 0 ? `あと${t.left}日` : `${-t.left}日超過`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Today's study ─────────────────────────────────────────────────

function TaskRow({ task, onToggle }) {
  return (
    <div onClick={() => onToggle(task.id)} style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 0', cursor: 'pointer',
    }}>
      <button
        aria-label={task.done ? '完了済み' : '完了する'}
        onClick={e => { e.stopPropagation(); onToggle(task.id); }}
        style={{
          marginTop: 2, width: 24, height: 24, flexShrink: 0, borderRadius: 7,
          border: 'none', padding: 0, cursor: 'pointer',
          background: task.done ? 'var(--ok)' : 'var(--check-bg)',
          boxShadow: task.done ? 'none' : 'inset 0 0 0 1.5px var(--check-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .15s',
        }}
      >
        {task.done && <Icon name="check" size={14} stroke={2.6} style={{ color: '#fff' }} />}
      </button>
      <div style={{ flex: 1, minWidth: 0, opacity: task.done ? 0.45 : 1, transition: 'opacity .15s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          {(task.carriedOver || task.carry) && (
            <span style={{ ...tagBase('xs'), background: 'var(--carry-bg)', color: 'var(--carry)' }}>
              {task.carriedOver
                ? task.carriedOverCount > 1
                  ? `${task.carriedOverCount}回持ち越し`
                  : task.originalDate
                    ? `${fmtShort(parseDate(task.originalDate))}から持ち越し`
                    : '持ち越し'
                : '持ち越し'}
            </span>
          )}
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-1)', textDecoration: task.done ? 'line-through' : 'none' }}>
            {task.title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5, flexWrap: 'wrap' }}>
          <TypeBadge type={task.type} />
          {task.cat && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Dot cat={task.cat} />
              <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                {CAT[task.cat].label}{task.topic ? ' / ' + task.topic : ''}
              </span>
            </span>
          )}
          {!task.cat && task.topic && (
            <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{task.topic}</span>
          )}
        </div>
      </div>
      <span style={{ flexShrink: 0, fontSize: 13, color: 'var(--ink-2)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 3 }}>
        {task.min}分
      </span>
    </div>
  );
}

function StatChip({ label, value, accent }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 50, padding: '5px 10px', borderRadius: 9, background: 'var(--chip-neutral-bg)' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: accent ? 'var(--accent)' : 'var(--ink-1)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.15 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 1 }}>{label}</div>
    </div>
  );
}

function TodayStudy({ tasks, onToggle }) {
  const done = tasks.filter(t => t.done).length;
  const remaining = tasks.filter(t => !t.done).reduce((a, t) => a + t.min, 0);
  // 持ち越し（carriedOver）と固定 carry（INITIAL_TASKS t0 等）を先頭にまとめる
  const carryTasks = tasks.filter(t => t.carriedOver || t.carry);
  const normal     = tasks.filter(t => !t.carriedOver && !t.carry);
  return (
    <div className="tk-card" style={{ borderTop: '3px solid var(--accent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--ink-1)' }}>今日の学習</h3>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
            {fmtMD(TODAY)}（{weekday(TODAY)}）
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatChip label="目標" value={EXAM.todayGoalMin + '分'} />
          <StatChip label="完了" value={`${done}/${tasks.length}`} accent />
          <StatChip label="残り" value={remaining + '分'} />
        </div>
      </div>
      {carryTasks.length > 0 && (
        <div>
          {carryTasks.map((t, i) => (
            <div key={t.id} style={{ borderTop: i ? '1px solid var(--line)' : 'none' }}>
              <TaskRow task={t} onToggle={onToggle} />
            </div>
          ))}
        </div>
      )}
      <div style={{ borderTop: carryTasks.length ? '1px solid var(--line)' : 'none' }}>
        {normal.map((t, i) => (
          <div key={t.id} style={{ borderTop: i ? '1px solid var(--line)' : 'none' }}>
            <TaskRow task={t} onToggle={onToggle} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Quick add ─────────────────────────────────────────────────────

const QUICK_ITEMS = [
  { id: 'log',     label: '学習ログ',   icon: 'log',     desc: '勉強した内容を記録' },
  { id: 'mistake', label: 'ミス記録',   icon: 'mistake', desc: '間違いと理由を記録' },
  { id: 'task',    label: 'タスク追加', icon: 'plus',    desc: '今日のタスクを追加' },
];

function QuickAdd({ onOpen, desktop }) {
  return (
    <div className="tk-card">
      <SectionLabel>クイック追加</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {QUICK_ITEMS.map(q => (
          <button key={q.id} onClick={() => onOpen(q.id)} className="tk-quick">
            <span className="tk-quick-ic"><Icon name={q.icon} size={18} stroke={1.8} /></span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-1)' }}>{q.label}</span>
            {desktop && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{q.desc}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Status summary ─────────────────────────────────────────────────

function MiniStat({ label, value, unit, warn, accent }) {
  const bg = warn ? 'var(--warn-bg)' : accent ? 'var(--accent-bg)' : 'var(--chip-neutral-bg)';
  const color = warn ? 'var(--warn)' : accent ? 'var(--accent)' : 'var(--ink-1)';
  return (
    <div style={{ flex: 1, background: bg, borderRadius: 11, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{unit}</span>
      </div>
    </div>
  );
}

function TopReasonStat({ reason }) {
  return (
    <div style={{ flex: 2, background: 'var(--chip-neutral-bg)', borderRadius: 11, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>よくあるミス理由</div>
      <div style={{
        fontSize: 12.5, fontWeight: 600,
        color: reason ? 'var(--ink-1)' : 'var(--ink-4)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {reason ?? 'まだ記録なし'}
      </div>
    </div>
  );
}

function StatusSummary({ remainingMin }) {
  const [levels, setLevels] = useState(loadLevels);
  const [reviewItems, setReviewItems] = useState(loadReviewItems);
  const [mistakeLogs, setMistakeLogs] = useState(loadMistakeLogs);
  const [materialUnits, setMaterialUnits] = useState(loadMaterialUnits);
  const [resources, setResources] = useState(loadResources);
  useEffect(() => {
    const handler = () => {
      setLevels(loadLevels());
      setReviewItems(loadReviewItems());
      setMistakeLogs(loadMistakeLogs());
      setMaterialUnits(loadMaterialUnits());
      setResources(loadResources());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const weakTopics = useMemo(() => computeWeakTopics(levels), [levels]);
  const { overdueCount, todayCount } = useMemo(() => computeReviewCounts(reviewItems), [reviewItems]);
  const { weekCount, topReason } = useMemo(() => computeMistakeStats(mistakeLogs), [mistakeLogs]);
  const matStats = useMemo(() => computeMaterialStats(materialUnits), [materialUnits]);
  const resStats = useMemo(() => computeResourceStats(resources), [resources]);

  return (
    <div className="tk-card">
      <SectionLabel>状況サマリー</SectionLabel>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <MiniStat label="期限超過の復習" value={overdueCount} unit="件" warn />
        <MiniStat label="今日の復習" value={todayCount} unit="件" />
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <MiniStat label="今週のミス" value={weekCount} unit="件" />
        <TopReasonStat reason={topReason} />
      </div>
      {matStats.total > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <MiniStat label="教材完了" value={`${matStats.completed}/${matStats.total}`} unit="件" />
          <MiniStat label="教材復習必要" value={matStats.needsReview} unit="件" warn={matStats.needsReview > 0} />
        </div>
      )}
      {resStats.total > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <MiniStat label="使用中リソース" value={resStats.using} unit="件" accent />
          <MiniStat label="参照リソース" value={resStats.reference} unit="件" />
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>今週の進捗</span>
          <span style={{ fontSize: 12, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>{EXAM.weeklyDoneH} / {EXAM.weeklyGoalH} 時間</span>
        </div>
        <ProgressBar value={EXAM.weeklyDoneH} max={EXAM.weeklyGoalH} />
      </div>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 10 }}>苦手論点 TOP3</div>
        {weakTopics.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', padding: '8px 0' }}>論点マップで理解度を記録すると表示されます</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {weakTopics.map(w => (
              <div key={w.rank} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 18, height: 18, borderRadius: 18, background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{w.rank}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Dot cat={w.cat} s={7} />
                    <span style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.topic}</span>
                  </div>
                  {w.missRate !== null ? (
                    <ProgressBar value={w.missRate} max={100} color={CAT[w.cat].dot} h={4} />
                  ) : (
                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>未着手</div>
                  )}
                </div>
                <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                  {w.missRate !== null ? `理解度 ${w.level}` : '未着手'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Quick-add sheet ────────────────────────────────────────────────

const MIN_OPTS = [10, 20, 30, 45, 60];
const REASON_OPTS = ['知識不足', 'ケアレス', '時間不足', '理解あいまい'];

function ChipRow({ opts, value, onPick, render, colorFor }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {opts.map(o => {
        const on = value === o;
        const c = colorFor && colorFor(o);
        return (
          <button key={o} onClick={() => onPick(o)} style={{
            padding: '7px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', transition: 'all .12s',
            background: on ? (c ? c.bg : 'var(--accent-bg)') : 'var(--chip-neutral-bg)',
            color: on ? (c ? c.fg : 'var(--accent)') : 'var(--ink-2)',
            boxShadow: on ? (c ? `inset 0 0 0 1.5px ${c.fg}` : 'inset 0 0 0 1.5px var(--accent)') : 'none',
          }}>{render(o)}</button>
        );
      })}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 7 }}>{label}</span>
      {children}
    </label>
  );
}

function QuickAddSheet({ kind, mobile, onClose, onSubmit }) {
  const meta = QUICK_ITEMS.find(q => q.id === kind);
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('gyo');
  const [type, setType] = useState('new');
  const [min, setMin] = useState(30);
  const [reason, setReason] = useState('知識不足');

  const fields = (
    <>
      {(kind === 'task' || kind === 'mistake') && (
        <Field label={kind === 'task' ? '内容' : '論点'}>
          <input className="tk-input" placeholder={kind === 'task' ? '例：宅建業法 / 媒介契約' : '例：意思表示（錯誤）'} value={title} onChange={e => setTitle(e.target.value)} />
        </Field>
      )}
      <Field label="分野">
        <ChipRow opts={Object.keys(CAT)} value={cat} onPick={setCat} render={k => CAT[k].label} colorFor={k => CAT[k]} />
      </Field>
      {kind === 'task' && (
        <Field label="種別">
          <ChipRow opts={Object.keys(TYPE)} value={type} onPick={setType} render={k => TYPE[k].label} />
        </Field>
      )}
      {kind === 'mistake' && (
        <Field label="ミス理由">
          <ChipRow opts={REASON_OPTS} value={reason} onPick={setReason} render={k => k} />
        </Field>
      )}
      {(kind === 'task' || kind === 'log') && (
        <Field label="学習時間">
          <ChipRow opts={MIN_OPTS} value={min} onPick={setMin} render={k => k + '分'} />
        </Field>
      )}
    </>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(40,32,24,.34)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: mobile ? 'flex-end' : 'center', justifyContent: 'center',
        animation: 'tkFade .18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', width: mobile ? '100%' : 420,
          borderRadius: mobile ? '20px 20px 0 0' : 16,
          padding: mobile ? '8px 20px 32px' : '24px',
          boxShadow: '0 -8px 40px rgba(40,30,20,.18)',
          animation: mobile ? 'tkSheetUp .26s cubic-bezier(.2,.8,.2,1)' : 'tkPop .2s ease',
        }}
      >
        {mobile && <div style={{ width: 38, height: 4, borderRadius: 4, background: 'var(--line-strong)', margin: '0 auto 14px' }} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span className="tk-quick-ic" style={{ width: 34, height: 34 }}><Icon name={meta.icon} size={18} stroke={1.8} /></span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{meta.label}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{meta.desc}</div>
          </div>
          <button onClick={onClose} style={{
            marginLeft: 'auto', width: 30, height: 30, borderRadius: 15, border: 'none', cursor: 'pointer',
            background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)', fontSize: 18, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{fields}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} className="tk-btn-ghost">キャンセル</button>
          <button onClick={() => onSubmit(kind, { title, cat, type, min, reason })} className="tk-btn-primary">記録する</button>
        </div>
      </div>
    </div>
  );
}

// ── Navigation ────────────────────────────────────────────────────

function Sidebar({ active, onNav }) {
  return (
    <aside style={{
      width: 220, flexShrink: 0, background: 'var(--surface)',
      borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column', padding: '20px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px 20px' }}>
        <span style={{
          width: 34, height: 34, borderRadius: 10, background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 15, letterSpacing: '.02em',
        }}>宅</span>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.2 }}>宅建 学習管理</div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>2026年度 受験</div>
        </div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV.map(n => {
          const on = active === n.id;
          return (
            <button key={n.id} onClick={() => onNav(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '10px 11px',
              borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13.5, fontWeight: on ? 700 : 500, textAlign: 'left',
              color: on ? 'var(--accent)' : 'var(--ink-2)',
              background: on ? 'var(--accent-bg)' : 'transparent',
              transition: 'all .12s',
            }}>
              <Icon name={n.icon} size={18} stroke={on ? 2 : 1.7} /> {n.label}
            </button>
          );
        })}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 8px 0', borderTop: '1px solid var(--line)' }}>
        <span style={{ width: 28, height: 28, borderRadius: 28, background: 'var(--chip-neutral-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--ink-2)', fontWeight: 700 }}>初</span>
        <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>初学者プラン</div>
      </div>
    </aside>
  );
}

function BottomNav({ active, onNav, onMore }) {
  const items = NAV_PRIMARY.map(id => NAV.find(n => n.id === id));
  return (
    <nav style={{
      flexShrink: 0, display: 'flex', borderTop: '1px solid var(--line)',
      background: 'var(--surface-elevated)',
      padding: '7px 4px calc(7px + env(safe-area-inset-bottom))',
    }}>
      {items.map(n => {
        const on = active === n.id;
        return (
          <button key={n.id} onClick={() => onNav(n.id)} style={navBtnStyle(on)}>
            <Icon name={n.icon} size={21} stroke={on ? 2 : 1.7} />
            <span style={{ fontSize: 10, fontWeight: on ? 700 : 500 }}>{n.label}</span>
          </button>
        );
      })}
      <button onClick={onMore} style={navBtnStyle(false)}>
        <Icon name="menu" size={21} stroke={1.7} />
        <span style={{ fontSize: 10, fontWeight: 500 }}>メニュー</span>
      </button>
    </nav>
  );
}
function navBtnStyle(on) {
  return {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    padding: '6px 0', border: 'none', background: 'transparent', cursor: 'pointer',
    fontFamily: 'inherit', color: on ? 'var(--accent)' : 'var(--ink-3)', transition: 'color .12s',
  };
}

function MoreMenu({ active, onNav, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(40,32,24,.34)',
        display: 'flex', alignItems: 'flex-end', animation: 'tkFade .18s ease',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', background: 'var(--surface)', borderRadius: '20px 20px 0 0',
        padding: '8px 18px calc(24px + env(safe-area-inset-bottom))',
        animation: 'tkSheetUp .26s cubic-bezier(.2,.8,.2,1)',
      }}>
        <div style={{ width: 38, height: 4, borderRadius: 4, background: 'var(--line-strong)', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 14 }}>メニュー</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {NAV.map(n => {
            const on = active === n.id;
            return (
              <button key={n.id} onClick={() => { onNav(n.id); onClose(); }} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                padding: '14px 4px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', background: on ? 'var(--accent-bg)' : 'var(--chip-neutral-bg)',
                color: on ? 'var(--accent)' : 'var(--ink-2)',
              }}>
                <Icon name={n.icon} size={22} stroke={1.7} />
                <span style={{ fontSize: 11, fontWeight: on ? 700 : 500 }}>{n.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Placeholder for other pages ───────────────────────────────────

function ComingSoon({ title }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--ink-3)' }}>
      <Icon name="spark" size={36} stroke={1.5} />
      <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 13 }}>このページは準備中です</div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', left: '50%', bottom: 90, transform: 'translateX(-50%)', zIndex: 60,
      background: 'var(--ink-1)', color: 'var(--surface)', padding: '10px 18px',
      borderRadius: 999, fontSize: 13, fontWeight: 600,
      boxShadow: '0 8px 24px rgba(40,30,20,.25)', whiteSpace: 'nowrap',
      animation: 'tkFade .2s ease', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Icon name="check" size={15} stroke={2.4} style={{ color: 'var(--ok)' }} /> {msg}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────

export default function Home() {
  const { tasks, toggle, addTask } = useTasks();
  const [active, setActive] = useState('home');
  const [sheet, setSheet] = useState(null);
  const [more, setMore] = useState(false);
  const [toast, setToast] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Google ログイン完了時に設定ページへ自動遷移
  useEffect(() => {
    const handler = () => setActive('settings');
    window.addEventListener('takken-signed-in', handler);
    return () => window.removeEventListener('takken-signed-in', handler);
  }, []);

  const remainingMin = useMemo(() => tasks.filter(t => !t.done).reduce((a, t) => a + t.min, 0), [tasks]);

  const flash = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const handleSubmit = useCallback((kind, data) => {
    if (kind === 'task') {
      const title = data.title.trim() || TYPE[data.type].label;
      addTask({ id: 'u' + Date.now(), carry: false, type: data.type, cat: data.cat, title, topic: '', min: data.min });
      flash('タスクを追加しました');
    } else if (kind === 'log') {
      flash(`学習ログを記録しました（+${data.min}分）`);
    } else {
      flash('ミスを記録しました');
    }
    setSheet(null);
  }, [addTask, flash]);

  const handleOpenQuick = useCallback((kind) => {
    if (kind === 'mistake') setActive('mistake');
    else setSheet(kind);
  }, []);

  // Mobile layout: TodayStudy first, then rest
  const mobileHomeContent = (
    <>
      <TodayStudy tasks={tasks} onToggle={toggle} />
      <Countdown desktop={false} />
      <ImportantTasks />
      <QuickAdd onOpen={handleOpenQuick} desktop={false} />
      <StatusSummary remainingMin={remainingMin} />
    </>
  );

  // Desktop layout: 2-col grid
  const desktopHomeContent = (
    <>
      <Countdown desktop />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TodayStudy tasks={tasks} onToggle={toggle} />
          <QuickAdd onOpen={handleOpenQuick} desktop />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ImportantTasks />
          <StatusSummary remainingMin={remainingMin} />
        </div>
      </div>
    </>
  );

  const homeContent = isMobile ? mobileHomeContent : desktopHomeContent;

  function renderPage(pageId) {
    if (pageId === 'home')    return homeContent;
    if (pageId === 'map')     return <TopicMap desktop={!isMobile} />;
    if (pageId === 'review')  return <ReviewPage />;
    if (pageId === 'mistake') return <MistakePage />;
    if (pageId === 'material') return <MaterialPage />;
    if (pageId === 'analysis')  return <AnalysisPage />;
    if (pageId === 'library')   return <ResourcePage />;
    if (pageId === 'settings')  return <SettingsPage />;
    if (pageId === 'help')      return <HelpPage />;
    return <ComingSoon title={NAV.find(n => n.id === pageId)?.label || ''} />;
  }

  const pageContent = renderPage(active);

  if (isMobile) {
    return (
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--app-bg)' }}>
        {/* status bar */}
        <div style={{
          height: 36, flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 18px',
          fontSize: 13, fontWeight: 600, background: 'var(--app-bg)',
        }}>
          <span>{new Date().getHours()}:{String(new Date().getMinutes()).padStart(2,'0')}</span>
          <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <Icon name="spark" size={13} stroke={1.6} />
            <Icon name="bell" size={13} stroke={1.6} />
          </span>
        </div>
        {/* header */}
        <header style={{ padding: '4px 16px 12px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: active === 'home' ? 8 : 4 }}>
            {fmtMD(TODAY)}（{weekday(TODAY)}）
          </div>
          {active === 'home'
            ? <CoachBubble tasks={tasks} desktop={false} />
            : <div style={{ fontSize: 19, fontWeight: 700 }}>{NAV.find(n => n.id === active)?.label}</div>
          }
        </header>
        {/* scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 20px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          {pageContent}
          {active === 'home' && (
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-4)', padding: '4px 0 8px' }}>
              焦らず、一日ずつ。
            </div>
          )}
        </div>
        <BottomNav active={active} onNav={setActive} onMore={() => setMore(true)} />
        {sheet && <QuickAddSheet kind={sheet} mobile onClose={() => setSheet(null)} onSubmit={handleSubmit} />}
        {more && <MoreMenu active={active} onNav={setActive} onClose={() => setMore(false)} />}
        <Toast msg={toast} />
      </div>
    );
  }

  // Desktop
  return (
    <div style={{ height: '100dvh', display: 'flex', background: 'var(--app-bg)' }}>
      <Sidebar active={active} onNav={setActive} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '20px 32px 16px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: active === 'home' ? 8 : 0 }}>
              {fmtMD(TODAY)}（{weekday(TODAY)}）
            </div>
            {active === 'home'
              ? <CoachBubble tasks={tasks} desktop />
              : <div>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.01em' }}>{NAV.find(n => n.id === active)?.label}</h1>
                </div>
            }
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginTop: 4 }}>
            <button className="tk-icon-btn"><Icon name="bell" size={19} stroke={1.7} /></button>
            <button onClick={() => setSheet('task')} className="tk-btn-primary" style={{ flex: 'none', width: 'auto', padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <Icon name="plus" size={17} stroke={2.2} /> 記録する
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {pageContent}
        </div>
      </main>
      {sheet && <QuickAddSheet kind={sheet} mobile={false} onClose={() => setSheet(null)} onSubmit={handleSubmit} />}
      <Toast msg={toast} />
    </div>
  );
}
