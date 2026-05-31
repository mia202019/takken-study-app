import { useMemo, useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { CAT, EXAM, INITIAL_TASKS } from '../data/appData';
import { TOPICS, ALL_TOPICS, loadLevels, LS_LEVELS_KEY } from '../data/topicsData';
import { loadReviewItems, computeReviewStats, hasPendingReview, todayStr } from '../data/reviewData';
import { loadMistakeLogs } from '../data/mistakeData';
import { loadMaterialUnits, LS_UNITS_KEY } from '../data/materialData';
import { loadScheduledTasks, LS_SCHEDULED_KEY } from '../data/scheduleData';

const TODAY = todayStr();

// takken-task-done のキー
const LS_TASK_DONE_KEY = 'takken-task-done';

function loadTaskDone() {
  try { return JSON.parse(localStorage.getItem(LS_TASK_DONE_KEY)) || {}; }
  catch { return {}; }
}

// 今週（月曜始まり）の完了タスク学習時間を実データから計算
function computeWeeklyDoneH() {
  const tasks = loadScheduledTasks();
  const now   = new Date();
  const day   = now.getDay();
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon);
  const ws = `${weekStart.getFullYear()}-${String(weekStart.getMonth()+1).padStart(2,'0')}-${String(weekStart.getDate()).padStart(2,'0')}`;
  const ts = TODAY;
  const minutes = tasks
    .filter(t => t.done && t.date >= ws && t.date <= ts)
    .reduce((s, t) => s + (t.min || 0), 0);
  return Math.round(minutes / 6) / 10;
}

// ── UI primitives ──────────────────────────────────────────────────

function Bar({ value, max, color = 'var(--accent)', h = 5 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height: h, borderRadius: h, background: 'var(--track)', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: h, transition: 'width .4s ease' }} />
    </div>
  );
}

function CardTitle({ children }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.04em', color: 'var(--ink-2)', marginBottom: 14 }}>
      {children}
    </div>
  );
}

function StatBox({ label, value, unit = '', warn, accent }) {
  const bg    = warn ? 'var(--warn-bg)' : accent ? 'var(--accent-bg)' : 'var(--chip-neutral-bg)';
  const color = warn ? 'var(--warn)'    : accent ? 'var(--accent)'    : 'var(--ink-1)';
  return (
    <div style={{ flex: 1, background: bg, borderRadius: 11, padding: '11px 8px', textAlign: 'center', minWidth: 0 }}>
      <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginBottom: 3, lineHeight: 1.3 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
        {value}
        {unit && <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

const tag = {
  display: 'inline-flex', padding: '2px 7px', borderRadius: 6,
  fontSize: 11, fontWeight: 500, lineHeight: 1.3, whiteSpace: 'nowrap',
};

// ── Priority actions ───────────────────────────────────────────────

function buildActions({ overdue, todayReview, remaining, needsReview, topWeak, topReason }) {
  const list = [];
  if (overdue > 0)
    list.push({ icon: 'flag',    color: 'var(--warn)',   text: `期限超過の復習が ${overdue} 件あります。まず復習から始めましょう。` });
  if (todayReview > 0)
    list.push({ icon: 'review',  color: 'var(--accent)', text: `今日の復習が ${todayReview} 件あります。` });
  if (remaining > 0)
    list.push({ icon: 'check',   color: 'var(--ok)',     text: `今日のタスクが ${remaining} 件残っています。` });
  if (needsReview > 0)
    list.push({ icon: 'book',    color: 'var(--carry)',  text: `教材の復習必要ユニットが ${needsReview} 件あります。` });
  if (topWeak && topWeak.level > 0 && topWeak.level <= 2)
    list.push({ icon: 'target',  color: 'var(--ink-2)',  text: `「${topWeak.title}」の理解度が低いです（Lv.${topWeak.level}）。重点的に復習しましょう。` });
  if (topReason && list.length < 5)
    list.push({ icon: 'mistake', color: 'var(--ink-3)',  text: `ミス理由「${topReason}」が最多です。意識して学習しましょう。` });
  return list;
}

function PriorityActions({ actions }) {
  return (
    <div className="tk-card" style={{ borderTop: '3px solid var(--accent)' }}>
      <CardTitle>今日の優先アクション</CardTitle>
      {actions.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ok)' }}>
          <Icon name="check" size={18} stroke={2.2} />
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>特に急ぎの課題はありません。計画通りに進めましょう。</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {actions.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: 28,
                background: 'var(--chip-neutral-bg)', color: a.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={a.icon} size={15} stroke={1.8} />
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-1)', lineHeight: 1.6, paddingTop: 5 }}>{a.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Overall summary ────────────────────────────────────────────────

function OverallSummary({ data }) {
  return (
    <div className="tk-card">
      <CardTitle>全体サマリー</CardTitle>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <StatBox label="今週の学習" value={data.weeklyDoneH} unit="h" accent />
        <StatBox label="完了タスク" value={`${data.tasksDone}/${INITIAL_TASKS.length}`} />
        <StatBox label="復習バックログ" value={data.overdueReview} unit="件" warn={data.overdueReview > 0} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <StatBox label="ミス記録" value={data.mistakeTotal} unit="件" />
        <StatBox label="教材完了" value={`${data.matCompleted}/${data.matTotal}`} />
        <StatBox label="論点着手率" value={`${data.topicsStartedPct}`} unit="%" accent />
      </div>
    </div>
  );
}

// ── Subject progress ───────────────────────────────────────────────

function SubjectRow({ id, stats, isLast }) {
  const c = CAT[id];
  return (
    <div style={{ padding: '13px 0', borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: c.dot, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>{c.label}</span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{stats.total}論点</span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          平均 {stats.avgLevel.toFixed(1)}
        </span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 4 }}>
          <span>着手 {stats.started}/{stats.total}</span>
          <span>{stats.total ? Math.round(stats.started / stats.total * 100) : 0}%</span>
        </div>
        <Bar value={stats.started} max={stats.total} color={c.dot} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          { label: '低理解',  value: stats.lowLevel, warn: stats.lowLevel > 0  },
          { label: 'ミス',    value: stats.mistakes,  warn: stats.mistakes > 0  },
          { label: '復習待ち', value: stats.reviews                              },
        ].map(s => (
          <span key={s.label} style={{
            padding: '3px 9px', borderRadius: 7, fontSize: 12, fontWeight: 600,
            background: s.warn ? 'var(--warn-bg)' : 'var(--chip-neutral-bg)',
            color: s.warn ? 'var(--warn)' : 'var(--ink-3)',
          }}>{s.label} {s.value}</span>
        ))}
      </div>
    </div>
  );
}

function SubjectProgress({ subjectStats }) {
  const keys = Object.keys(CAT);
  return (
    <div className="tk-card">
      <CardTitle>科目別進捗</CardTitle>
      {keys.map((id, i) => (
        <SubjectRow key={id} id={id} stats={subjectStats[id]} isLast={i === keys.length - 1} />
      ))}
    </div>
  );
}

// ── Weak topics ranking ────────────────────────────────────────────

function WeakTopicsRanking({ weakTopics, mistakeLogs, reviewItems }) {
  return (
    <div className="tk-card">
      <CardTitle>苦手論点ランキング</CardTitle>
      {weakTopics.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--ink-3)', padding: '4px 0' }}>
          論点マップで理解度を記録すると表示されます
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {weakTopics.map((t, i) => {
            const c = CAT[t.cat];
            const mistakeCount = mistakeLogs.filter(m => m.topicId === t.id).length;
            const pendingReview = hasPendingReview(reviewItems, t.id);
            const barColor = t.level === 0 ? 'var(--ink-4)' : t.level <= 2 ? 'var(--warn)' : 'var(--carry)';
            return (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                borderBottom: i < weakTopics.length - 1 ? '1px solid var(--line)' : 'none',
              }}>
                <span style={{
                  flexShrink: 0, width: 20, height: 20, borderRadius: 20,
                  background: 'var(--chip-neutral-bg)', color: 'var(--ink-3)',
                  fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </span>
                    <span style={{ ...tag, background: c.bg, color: c.fg, flexShrink: 0 }}>{c.label}</span>
                  </div>
                  <Bar value={t.level} max={5} color={barColor} h={4} />
                </div>

                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 3 }}>
                    {t.level === 0 ? '未着手' : `Lv.${t.level}`}
                  </div>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    {mistakeCount > 0 && (
                      <span style={{ ...tag, background: 'var(--warn-bg)', color: 'var(--warn)' }}>ミス{mistakeCount}</span>
                    )}
                    {pendingReview && (
                      <span style={{ ...tag, background: 'var(--accent-bg)', color: 'var(--accent)' }}>復習</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Mistake reason ranking ─────────────────────────────────────────

function MistakeReasons({ reasons }) {
  const maxCount = reasons[0]?.count || 1;
  return (
    <div className="tk-card">
      <CardTitle>ミス理由ランキング</CardTitle>
      {reasons.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--ink-3)', padding: '4px 0' }}>まだミスが記録されていません</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {reasons.map((r, i) => (
            <div key={r.reason}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{
                    flexShrink: 0, width: 18, height: 18, borderRadius: 18,
                    background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.reason}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--warn)', fontVariantNumeric: 'tabular-nums' }}>
                  {r.count}件
                </span>
              </div>
              <Bar value={r.count} max={maxCount} color="var(--warn)" h={4} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Review status ──────────────────────────────────────────────────

function ReviewStatusSection({ stats, doneCount }) {
  const cells = [
    { label: '期限超過', value: stats.overdue.length,  warn: stats.overdue.length > 0 },
    { label: '今日',     value: stats.today.length,    accent: true                    },
    { label: '今後',     value: stats.upcoming.length                                  },
    { label: '完了済み', value: doneCount                                               },
  ];
  return (
    <div className="tk-card">
      <CardTitle>復習状況</CardTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {cells.map(c => (
          <div key={c.label} style={{
            background: c.warn ? 'var(--warn-bg)' : c.accent ? 'var(--accent-bg)' : 'var(--chip-neutral-bg)',
            borderRadius: 11, padding: '10px 6px', textAlign: 'center',
          }}>
            <div style={{
              fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
              color: c.warn ? 'var(--warn)' : c.accent ? 'var(--accent)' : 'var(--ink-1)',
            }}>{c.value}</div>
            <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Material progress ──────────────────────────────────────────────

const MAT_STATUS_META = [
  { id: 'completed',    label: '完了',      color: 'var(--ok)'         },
  { id: 'in_progress',  label: '学習中',    color: 'var(--accent)'     },
  { id: 'practicing',   label: '問題演習中', color: 'var(--cat-horei)' },
  { id: 'needs_review', label: '復習必要',  color: 'var(--warn)'       },
  { id: 'read',         label: '読了',      color: 'var(--carry)'      },
  { id: 'not_started',  label: '未着手',    color: 'var(--ink-4)'      },
];

function MaterialProgress({ byStatus }) {
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  return (
    <div className="tk-card">
      <CardTitle>教材進捗</CardTitle>
      {total === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>教材ユニットがまだ登録されていません</div>
      ) : (
        <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)', marginBottom: 5 }}>
              <span>完了率</span>
              <span>{byStatus.completed || 0} / {total} 件</span>
            </div>
            <Bar value={byStatus.completed || 0} max={total} color="var(--ok)" h={6} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {MAT_STATUS_META.map(s => {
              const count = byStatus[s.id] || 0;
              if (count === 0) return null;
              return (
                <div key={s.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 3 }}>
                    <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{count}件</span>
                  </div>
                  <Bar value={count} max={total} color={s.color} h={4} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const [levels,        setLevels]        = useState(loadLevels);
  const [reviewItems,   setReviewItems]   = useState(loadReviewItems);
  const [mistakeLogs,   setMistakeLogs]   = useState(loadMistakeLogs);
  const [materialUnits, setMaterialUnits] = useState(loadMaterialUnits);
  const [taskDone,      setTaskDone]      = useState(loadTaskDone);
  const [weeklyDoneH,   setWeeklyDoneH]   = useState(computeWeeklyDoneH);

  // リセット・更新時に再取得
  useEffect(() => {
    const handler = () => {
      setLevels(loadLevels());
      setReviewItems(loadReviewItems());
      setMistakeLogs(loadMistakeLogs());
      setMaterialUnits(loadMaterialUnits());
      setTaskDone(loadTaskDone());
      setWeeklyDoneH(computeWeeklyDoneH());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Review stats (uses arrays from reviewData's own computation)
  const reviewStats = useMemo(() => computeReviewStats(reviewItems), [reviewItems]);
  const reviewDoneCount = useMemo(
    () => reviewItems.filter(r => r.status === 'done' || r.status === 'skipped').length,
    [reviewItems]
  );

  // Mistake reasons ranked
  const mistakeReasons = useMemo(() => {
    const counts = {};
    mistakeLogs.forEach(l => {
      if (l.mistakeReason) counts[l.mistakeReason] = (counts[l.mistakeReason] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => ({ reason, count }));
  }, [mistakeLogs]);

  // Weak topics: started-weak first (level 1-3), then unstarted (level 0), up to 8
  const weakTopics = useMemo(() =>
    ALL_TOPICS
      .map(t => ({ ...t, level: levels[t.id] ?? 0 }))
      .filter(t => t.level < 4)
      .sort((a, b) => {
        const la = a.level === 0 ? 10 : a.level;
        const lb = b.level === 0 ? 10 : b.level;
        if (la !== lb) return la - lb;
        return a.priority === 'high' ? -1 : 1;
      })
      .slice(0, 8)
  , [levels]);

  // Subject stats
  const subjectStats = useMemo(() => {
    const result = {};
    for (const id of Object.keys(CAT)) {
      const list = TOPICS[id] || [];
      result[id] = {
        total:    list.length,
        started:  list.filter(t => (levels[t.id] || 0) > 0).length,
        avgLevel: list.length
          ? list.reduce((sum, t) => sum + (levels[t.id] || 0), 0) / list.length
          : 0,
        lowLevel: list.filter(t => { const l = levels[t.id] || 0; return l > 0 && l <= 2; }).length,
        mistakes: mistakeLogs.filter(m => m.subjectId === id).length,
        reviews:  reviewItems.filter(r => r.subjectId === id && r.status === 'pending').length,
      };
    }
    return result;
  }, [levels, mistakeLogs, reviewItems]);

  // Material status map
  const matByStatus = useMemo(() => {
    const map = {};
    materialUnits.forEach(u => { map[u.status] = (map[u.status] || 0) + 1; });
    return map;
  }, [materialUnits]);

  // Overall summary values
  const allTopicsCount    = ALL_TOPICS.length;
  const startedCount      = ALL_TOPICS.filter(t => (levels[t.id] || 0) > 0).length;
  const tasksDone         = INITIAL_TASKS.filter(t => !!taskDone[t.id]).length;
  const topReason         = mistakeReasons[0]?.reason ?? null;
  const overdueCount      = reviewStats.overdue.length;
  const todayReviewCount  = reviewStats.today.length;

  const summaryData = {
    tasksDone,
    weeklyDoneH,
    overdueReview:    overdueCount,
    mistakeTotal:     mistakeLogs.length,
    matCompleted:     matByStatus.completed || 0,
    matTotal:         materialUnits.length,
    topicsStartedPct: allTopicsCount ? Math.round(startedCount / allTopicsCount * 100) : 0,
  };

  const actions = useMemo(() => buildActions({
    overdue:     overdueCount,
    todayReview: todayReviewCount,
    remaining:   Math.max(0, INITIAL_TASKS.length - tasksDone),
    needsReview: matByStatus.needs_review || 0,
    topWeak:     weakTopics[0] ?? null,
    topReason,
  }), [overdueCount, todayReviewCount, tasksDone, matByStatus, weakTopics, topReason]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PriorityActions actions={actions} />
      <OverallSummary data={summaryData} />
      <SubjectProgress subjectStats={subjectStats} />
      <WeakTopicsRanking
        weakTopics={weakTopics}
        mistakeLogs={mistakeLogs}
        reviewItems={reviewItems}
      />
      <MistakeReasons reasons={mistakeReasons} />
      <ReviewStatusSection stats={reviewStats} doneCount={reviewDoneCount} />
      <MaterialProgress byStatus={matByStatus} />
    </div>
  );
}
