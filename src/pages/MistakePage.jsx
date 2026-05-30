import { useState, useMemo, useCallback, useEffect } from 'react';
import Icon from '../components/Icon';
import { CAT } from '../data/appData';
import { TOPICS, adjustLevelForMistake } from '../data/topicsData';
import { todayStr, addDays, upsertReviewItem, fmtDate } from '../data/reviewData';
import {
  LS_MISTAKE_KEY, MISTAKE_REASONS, SOURCE_TYPES, RESULTS, CONFIDENCE_LEVELS,
  loadMistakeLogs, addMistakeLog,
} from '../data/mistakeData';

// ── Helpers ──────────────────────────────────────────────────────────

function chip(on, fg, bg) {
  return {
    padding: '6px 11px', borderRadius: 9, border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: 12, fontWeight: 600, transition: 'all .12s',
    background: on ? (bg || 'var(--accent-bg)') : 'var(--chip-neutral-bg)',
    color: on ? (fg || 'var(--accent)') : 'var(--ink-2)',
    boxShadow: on ? `inset 0 0 0 1.5px ${fg || 'var(--accent)'}` : 'none',
    flexShrink: 0,
  };
}

function FieldWrap({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}

function defaultForm() {
  return {
    date: todayStr(),
    subjectId: 'gyo',
    topicId: 'gyo-01',
    sourceType: 'past_exam',
    result: 'incorrect',
    confidence: 'low',
    mistakeReason: '知識不足',
    sourceReference: '',
    memo: '',
  };
}

// ── Form ─────────────────────────────────────────────────────────────

function MistakeForm({ onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [open, setOpen] = useState(true);

  const topicOpts = TOPICS[form.subjectId] || [];

  function patch(key, val) {
    setForm(prev => {
      if (key === 'subjectId') {
        const firstId = TOPICS[val]?.[0]?.id || '';
        return { ...prev, subjectId: val, topicId: firstId };
      }
      return { ...prev, [key]: val };
    });
  }

  function handleSave() {
    addMistakeLog(form);
    const days = form.result === 'incorrect' ? 1 : 3;
    upsertReviewItem(form.topicId, form.subjectId, addDays(todayStr(), days));
    adjustLevelForMistake(form.topicId, form.result);
    onSaved();
    setOpen(false);
    setForm(defaultForm());
  }

  if (!open) {
    return (
      <div className="tk-card">
        <button
          onClick={() => setOpen(true)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', borderRadius: 10, border: '1px dashed var(--line-strong)',
            background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)',
          }}
        >
          <Icon name="plus" size={16} stroke={2.2} /> ミスを記録する
        </button>
      </div>
    );
  }

  return (
    <div className="tk-card">
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-1)', marginBottom: 16 }}>
        ミスを記録する
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 日付 */}
        <FieldWrap label="日付">
          <input
            type="date"
            value={form.date}
            onChange={e => patch('date', e.target.value)}
            className="tk-input"
            style={{ maxWidth: 180 }}
          />
        </FieldWrap>

        {/* 科目 */}
        <FieldWrap label="科目">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(CAT).map(([id, info]) => (
              <button key={id} onClick={() => patch('subjectId', id)}
                style={chip(form.subjectId === id, info.fg, info.bg)}>
                {info.label}
              </button>
            ))}
          </div>
        </FieldWrap>

        {/* 論点 */}
        <FieldWrap label="論点">
          <select
            value={form.topicId}
            onChange={e => patch('topicId', e.target.value)}
            className="tk-input"
          >
            {topicOpts.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </FieldWrap>

        {/* 出典 */}
        <FieldWrap label="出典">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SOURCE_TYPES.map(s => (
              <button key={s.id} onClick={() => patch('sourceType', s.id)}
                style={chip(form.sourceType === s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </FieldWrap>

        {/* 結果 */}
        <FieldWrap label="結果">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {RESULTS.map(r => (
              <button key={r.id} onClick={() => patch('result', r.id)}
                style={chip(form.result === r.id, r.color, r.bg)}>
                {r.label}
              </button>
            ))}
          </div>
        </FieldWrap>

        {/* 自信度 */}
        <FieldWrap label="自信度">
          <div style={{ display: 'flex', gap: 6 }}>
            {CONFIDENCE_LEVELS.map(c => (
              <button key={c.id} onClick={() => patch('confidence', c.id)}
                style={chip(form.confidence === c.id, c.color, c.bg)}>
                {c.label}
              </button>
            ))}
          </div>
        </FieldWrap>

        {/* ミス理由 */}
        <FieldWrap label="ミス理由">
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {MISTAKE_REASONS.map(r => (
              <button key={r} onClick={() => patch('mistakeReason', r)}
                style={{ ...chip(form.mistakeReason === r), fontSize: 11.5 }}>
                {r}
              </button>
            ))}
          </div>
        </FieldWrap>

        {/* 出典メモ（任意） */}
        <FieldWrap label="出典メモ（任意）">
          <input
            type="text"
            className="tk-input"
            placeholder="例：令和5年 問34、問題集 p.120"
            value={form.sourceReference}
            onChange={e => patch('sourceReference', e.target.value)}
          />
        </FieldWrap>

        {/* 自分メモ（任意） */}
        <FieldWrap label="自分メモ・要点メモ（任意）">
          <textarea
            className="tk-input"
            placeholder="例：35条と37条を混同した、〇〇の例外を忘れていた"
            value={form.memo}
            onChange={e => patch('memo', e.target.value)}
            style={{ minHeight: 68, resize: 'vertical' }}
          />
          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 5, lineHeight: 1.5 }}>
            教材本文・問題文の全文保存は避け、出典メモ・短い要点・自分の理解メモとして記録してください
          </div>
        </FieldWrap>

        <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
          <button onClick={() => setOpen(false)} className="tk-btn-ghost">閉じる</button>
          <button onClick={handleSave} className="tk-btn-primary">記録する</button>
        </div>
      </div>
    </div>
  );
}

// ── Log card ─────────────────────────────────────────────────────────

function LogCard({ log }) {
  const catInfo = CAT[log.subjectId];
  const topic = TOPICS[log.subjectId]?.find(t => t.id === log.topicId);
  const result = RESULTS.find(r => r.id === log.result);
  const confidence = CONFIDENCE_LEVELS.find(c => c.id === log.confidence);

  return (
    <div className="tk-card" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
            {fmtDate(log.date)}
          </span>
          <span style={{
            display: 'inline-block', padding: '2px 7px', borderRadius: 5,
            background: catInfo.bg, color: catInfo.fg, fontSize: 11, fontWeight: 600, flexShrink: 0,
          }}>
            {catInfo.label}
          </span>
        </div>
        <span style={{
          padding: '2px 8px', borderRadius: 5,
          background: result.bg, color: result.color,
          fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {result.label}
        </span>
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-1)' }}>
        {topic?.title ?? log.topicId}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
        <span style={{
          padding: '2px 8px', borderRadius: 5, background: 'var(--warn-bg)',
          color: 'var(--warn)', fontSize: 11.5, fontWeight: 600,
        }}>
          {log.mistakeReason}
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>自信度: {confidence?.label}</span>
        {log.sourceReference && (
          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{log.sourceReference}</span>
        )}
      </div>

      {log.memo && (
        <div style={{
          fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55,
          background: 'var(--chip-neutral-bg)', borderRadius: 8, padding: '7px 10px',
        }}>
          {log.memo}
        </div>
      )}
    </div>
  );
}

// ── Filters ──────────────────────────────────────────────────────────

const CAT_FILTER_OPTS = [
  { id: 'all', label: 'すべて' },
  ...Object.entries(CAT).map(([id, info]) => ({ id, label: info.label })),
];

function FilterBar({ filterSubject, setFilterSubject, filterReason, setFilterReason }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
        {CAT_FILTER_OPTS.map(c => {
          const on = filterSubject === c.id;
          const info = c.id !== 'all' ? CAT[c.id] : null;
          return (
            <button key={c.id} onClick={() => setFilterSubject(c.id)} style={{
              flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              background: on ? (info ? info.bg : 'var(--accent-bg)') : 'var(--chip-neutral-bg)',
              color: on ? (info ? info.fg : 'var(--accent)') : 'var(--ink-2)',
              boxShadow: on ? `inset 0 0 0 1.5px ${info ? info.fg : 'var(--accent)'}` : 'none',
              transition: 'all .12s',
            }}>
              {c.label}
            </button>
          );
        })}
      </div>
      <select
        value={filterReason}
        onChange={e => setFilterReason(e.target.value)}
        className="tk-input"
      >
        <option value="all">ミス理由：すべて</option>
        {MISTAKE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────

function EmptyState({ hasFilter }) {
  return (
    <div className="tk-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
      <div style={{ marginBottom: 12 }}>
        <Icon name="mistake" size={36} stroke={1.4} style={{ color: 'var(--ink-4)', margin: '0 auto' }} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6 }}>
        {hasFilter ? '条件に合うミス記録がありません' : 'ミス記録がありません'}
      </div>
      {!hasFilter && (
        <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
          上のフォームから<br />間違えた問題を記録しましょう
        </div>
      )}
    </div>
  );
}

// ── Summary chips ────────────────────────────────────────────────────

function SummaryChip({ label, count }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '10px 8px', borderRadius: 11, background: 'var(--chip-neutral-bg)' }}>
      <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.15, color: 'var(--ink-1)', fontVariantNumeric: 'tabular-nums' }}>
        {count}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', left: '50%', bottom: 90, transform: 'translateX(-50%)',
      zIndex: 60, background: 'var(--ink-1)', color: '#fff',
      padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
      boxShadow: '0 8px 24px rgba(40,30,20,.25)', whiteSpace: 'nowrap',
      animation: 'tkFade .2s ease', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Icon name="check" size={15} stroke={2.4} style={{ color: 'var(--ok)' }} /> {msg}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────

export default function MistakePage() {
  const [logs, setLogs] = useState(loadMistakeLogs);
  const [toast, setToast] = useState(null);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterReason, setFilterReason] = useState('all');

  useEffect(() => {
    const handler = (e) => {
      if (!e.key || e.key === LS_MISTAKE_KEY) setLogs(loadMistakeLogs());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleSaved = useCallback(() => {
    setLogs(loadMistakeLogs());
    setToast('ミスを記録しました（復習に追加）');
    setTimeout(() => setToast(null), 2500);
  }, []);

  const weekLogs = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((dayOfWeek + 6) % 7));
    return logs.filter(l => new Date(l.createdAt) >= weekStart);
  }, [logs]);

  const incorrectCount = useMemo(() => logs.filter(l => l.result === 'incorrect').length, [logs]);

  const hasFilter = filterSubject !== 'all' || filterReason !== 'all';

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (filterSubject !== 'all' && l.subjectId !== filterSubject) return false;
      if (filterReason !== 'all' && l.mistakeReason !== filterReason) return false;
      return true;
    });
  }, [logs, filterSubject, filterReason]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* サマリー */}
      <div style={{ display: 'flex', gap: 8 }}>
        <SummaryChip label="合計" count={logs.length} />
        <SummaryChip label="今週" count={weekLogs.length} />
        <SummaryChip label="不正解" count={incorrectCount} />
      </div>

      {/* フォーム */}
      <MistakeForm onSaved={handleSaved} />

      {/* フィルター */}
      {logs.length > 0 && (
        <FilterBar
          filterSubject={filterSubject}
          setFilterSubject={setFilterSubject}
          filterReason={filterReason}
          setFilterReason={setFilterReason}
        />
      )}

      {/* ログ一覧 */}
      {filtered.length === 0 ? (
        <EmptyState hasFilter={hasFilter} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(log => (
            <LogCard key={log.id} log={log} />
          ))}
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
}
