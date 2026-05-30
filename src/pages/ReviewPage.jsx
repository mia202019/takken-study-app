import { useState, useCallback } from 'react';
import Icon from '../components/Icon';
import { CAT } from '../data/appData';
import { ALL_TOPICS } from '../data/topicsData';
import { loadLevels, LEVEL_INFO } from '../data/topicsData';
import {
  loadReviewItems, completeReview, computeReviewStats,
  RESULT_CONFIGS, fmtDate, todayStr,
} from '../data/reviewData';

// ── トピック・理解度のルックアップ ────────────────────────────────

const TOPIC_MAP = Object.fromEntries(ALL_TOPICS.map(t => [t.id, t]));

function useReviewState() {
  const [items, setItems] = useState(loadReviewItems);
  const [levels, setLevels] = useState(loadLevels);

  const handleComplete = useCallback((itemId, result) => {
    setItems(completeReview(itemId, result));
  }, []);

  return { items, levels, handleComplete };
}

// ── 結果ボタン ────────────────────────────────────────────────────

function ResultButton({ cfg, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 2, padding: '8px 4px', borderRadius: 10, border: 'none',
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all .12s',
        background: cfg.bg, color: cfg.color,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 700 }}>{cfg.label}</span>
      <span style={{ fontSize: 10, color: cfg.color, opacity: 0.7 }}>{cfg.hint}</span>
    </button>
  );
}

// ── 復習カード ─────────────────────────────────────────────────────

function ReviewCard({ item, level, onComplete, overdue }) {
  const [confirming, setConfirming] = useState(false);
  const topic = TOPIC_MAP[item.topicId];
  const catInfo = CAT[item.subjectId];
  const levelInfo = LEVEL_INFO[level ?? 0];
  const today = todayStr();
  const daysOver = overdue
    ? Math.round((new Date(today) - new Date(item.dueDate)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div
      className="tk-card"
      style={{
        borderLeft: overdue ? '3px solid var(--warn)' : undefined,
        background: overdue ? 'linear-gradient(to right, #fff8f2, var(--surface))' : undefined,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-block', padding: '2px 7px', borderRadius: 5,
              background: catInfo.bg, color: catInfo.fg, fontSize: 11, fontWeight: 600,
            }}>{catInfo.label}</span>
            {item.reviewCount > 0 && (
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{item.reviewCount}回目</span>
            )}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-1)' }}>
            {topic?.title ?? item.topicId}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {overdue ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--warn)' }}>
                {daysOver > 0 ? `${daysOver}日超過` : '今日期限'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{fmtDate(item.dueDate)}</div>
            </>
          ) : (
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>
              {fmtDate(item.dueDate)}
            </div>
          )}
        </div>
      </div>

      {/* 理解度 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px', borderRadius: 9, background: levelInfo.bg,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 8, background: levelInfo.text, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: levelInfo.text, fontWeight: 600 }}>
          理解度 {level ?? 0} — {levelInfo.label}
        </span>
      </div>

      {/* 結果ボタン */}
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          style={{
            width: '100%', padding: '10px', borderRadius: 10,
            border: '1px solid var(--line-strong)', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)',
          }}
        >
          復習する →
        </button>
      ) : (
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 7, textAlign: 'center' }}>
            今回の結果は？
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {RESULT_CONFIGS.map(cfg => (
              <ResultButton
                key={cfg.id}
                cfg={cfg}
                onClick={() => { onComplete(item.id, cfg.id); setConfirming(false); }}
              />
            ))}
          </div>
          <button
            onClick={() => setConfirming(false)}
            style={{
              marginTop: 8, width: '100%', padding: '6px', borderRadius: 8,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 11.5, color: 'var(--ink-3)', background: 'transparent',
            }}
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  );
}

// ── セクションヘッダー ─────────────────────────────────────────────

function SectionHeader({ label, count, warn }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      paddingBottom: 8, borderBottom: `2px solid ${warn ? 'var(--warn-bg)' : 'var(--line)'}`,
    }}>
      {warn && <Icon name="flag" size={14} stroke={2} style={{ color: 'var(--warn)' }} />}
      <h3 style={{
        margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '.04em',
        color: warn ? 'var(--warn)' : 'var(--ink-2)',
      }}>{label}</h3>
      <span style={{
        marginLeft: 4, padding: '2px 8px', borderRadius: 20,
        background: warn ? 'var(--warn-bg)' : 'var(--chip-neutral-bg)',
        color: warn ? 'var(--warn)' : 'var(--ink-3)',
        fontSize: 11.5, fontWeight: 700,
      }}>{count}件</span>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────

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

// ── 空状態 ─────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="tk-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
      <div style={{ marginBottom: 12 }}>
        <Icon name="review" size={36} stroke={1.4} style={{ color: 'var(--ink-4)', margin: '0 auto' }} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6 }}>
        復習予定がありません
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
        論点マップの各論点カードにある<br />
        「復習に追加」ボタンから<br />
        復習予定を登録できます。
      </div>
    </div>
  );
}

// ── サマリーチップ ─────────────────────────────────────────────────

function SummaryChip({ label, count, warn }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '10px 8px', borderRadius: 11,
      background: warn && count > 0 ? 'var(--warn-bg)' : 'var(--chip-neutral-bg)',
    }}>
      <div style={{
        fontSize: 20, fontWeight: 700, lineHeight: 1.15,
        color: warn && count > 0 ? 'var(--warn)' : 'var(--ink-1)',
        fontVariantNumeric: 'tabular-nums',
      }}>{count}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── ルートコンポーネント ───────────────────────────────────────────

export default function ReviewPage() {
  const { items, levels, handleComplete } = useReviewState();
  const [toast, setToast] = useState(null);
  const { overdue, today, upcoming } = computeReviewStats(items);

  const handleCompleteWithToast = useCallback((itemId, result) => {
    handleComplete(itemId, result);
    const cfg = RESULT_CONFIGS.find(r => r.id === result);
    const msg = result === 'forgot' || result === 'hard'
      ? `翌日に再設定しました`
      : `次回は${cfg.hint}に設定しました`;
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, [handleComplete]);

  const hasPending = overdue.length + today.length + upcoming.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* サマリーバー */}
      <div style={{ display: 'flex', gap: 8 }}>
        <SummaryChip label="期限超過" count={overdue.length} warn />
        <SummaryChip label="今日" count={today.length} />
        <SummaryChip label="今後" count={upcoming.length} />
      </div>

      {!hasPending ? (
        <EmptyState />
      ) : (
        <>
          {/* 期限超過 */}
          {overdue.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SectionHeader label="期限超過" count={overdue.length} warn />
              {overdue.map(item => (
                <ReviewCard
                  key={item.id}
                  item={item}
                  level={levels[item.topicId]}
                  onComplete={handleCompleteWithToast}
                  overdue
                />
              ))}
            </div>
          )}

          {/* 今日の復習 */}
          {today.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SectionHeader label="今日の復習" count={today.length} />
              {today.map(item => (
                <ReviewCard
                  key={item.id}
                  item={item}
                  level={levels[item.topicId]}
                  onComplete={handleCompleteWithToast}
                  overdue={false}
                />
              ))}
            </div>
          )}

          {/* 今後の復習 */}
          {upcoming.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SectionHeader label="今後の復習" count={upcoming.length} />
              {upcoming.map(item => (
                <ReviewCard
                  key={item.id}
                  item={item}
                  level={levels[item.topicId]}
                  onComplete={handleCompleteWithToast}
                  overdue={false}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Toast msg={toast} />
    </div>
  );
}
