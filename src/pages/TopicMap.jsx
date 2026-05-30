import { useState, useCallback } from 'react';
import Icon from '../components/Icon';
import { CAT } from '../data/appData';
import { TOPICS, LEVEL_INFO, loadLevels, saveLevel } from '../data/topicsData';
import { loadReviewItems, addReviewItem, hasPendingReview } from '../data/reviewData';

const CAT_TABS = [
  { id: 'all',   label: 'すべて' },
  { id: 'gyo',   label: '宅建業法' },
  { id: 'kenri', label: '権利関係' },
  { id: 'horei', label: '法令上の制限' },
  { id: 'zei',   label: '税・その他' },
];

function LevelSelector({ level, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
      {LEVEL_INFO.map((info, i) => {
        const active = level === i;
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            title={info.label}
            style={{
              width: 30, height: 30, borderRadius: 7, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12, fontWeight: 700, lineHeight: 1,
              background: active ? info.text : 'var(--chip-neutral-bg)',
              color: active ? '#fff' : 'var(--ink-3)',
              transition: 'background .12s, color .12s',
              flexShrink: 0,
            }}
          >
            {i}
          </button>
        );
      })}
    </div>
  );
}

function LevelBadge({ level }) {
  const info = LEVEL_INFO[level];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 20,
      background: info.bg, color: info.text,
      fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 6, background: info.text }} />
      {info.label}
    </span>
  );
}

function TopicCard({ topic, cat, level, onChange, hasReview, onAddReview }) {
  const catInfo = CAT[cat];
  const isHigh = topic.priority === 'high';
  return (
    <div className="tk-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{
              display: 'inline-block', padding: '2px 7px', borderRadius: 5,
              background: catInfo.bg, color: catInfo.fg,
              fontSize: 11, fontWeight: 600,
            }}>{catInfo.label}</span>
            {isHigh && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '2px 7px', borderRadius: 5,
                background: 'var(--warn-bg)', color: 'var(--warn)',
                fontSize: 11, fontWeight: 600,
              }}>
                <Icon name="flag" size={10} stroke={2} /> 頻出
              </span>
            )}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-1)', lineHeight: 1.3 }}>
            {topic.title}
          </div>
        </div>
      </div>

      {/* 理解度バー */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>理解度</span>
          <LevelBadge level={level} />
        </div>
        <LevelSelector level={level} onChange={onChange} />
      </div>

      {/* 復習追加ボタン */}
      <button
        onClick={hasReview ? undefined : onAddReview}
        disabled={hasReview}
        style={{
          width: '100%', padding: '8px', borderRadius: 9,
          border: hasReview ? 'none' : '1px solid var(--line-strong)',
          cursor: hasReview ? 'default' : 'pointer',
          fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          background: hasReview ? 'var(--accent-bg)' : 'var(--chip-neutral-bg)',
          color: hasReview ? 'var(--accent)' : 'var(--ink-2)',
          transition: 'background .12s',
        }}
      >
        {hasReview
          ? <><Icon name="check" size={13} stroke={2.2} /> 復習中</>
          : <><Icon name="review" size={13} stroke={1.8} /> 復習に追加</>
        }
      </button>
    </div>
  );
}

function CategorySection({ catId, topics, levels, reviewItems, onLevelChange, onAddReview, desktop }) {
  const catInfo = CAT[catId];
  const totalDone = topics.filter(t => (levels[t.id] ?? 0) >= 4).length;
  const avgLevel = topics.length
    ? Math.round(topics.reduce((sum, t) => sum + (levels[t.id] ?? 0), 0) / topics.length * 10) / 10
    : 0;

  return (
    <section>
      {/* セクションヘッダー */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 12, paddingBottom: 10,
        borderBottom: `2px solid ${catInfo.bg}`,
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: 10,
          background: catInfo.dot, flexShrink: 0,
        }} />
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--ink-1)' }}>
          {catInfo.label}
        </h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'baseline' }}>
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            習得 <b style={{ color: catInfo.fg }}>{totalDone}</b>/{topics.length}
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            平均 <b style={{ color: 'var(--ink-2)' }}>{avgLevel}</b>
          </span>
        </div>
      </div>

      {/* カードグリッド */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: desktop ? 'repeat(auto-fill, minmax(240px, 1fr))' : '1fr',
        gap: 10,
      }}>
        {topics.map(topic => (
          <TopicCard
            key={topic.id}
            topic={topic}
            cat={catId}
            level={levels[topic.id] ?? 0}
            onChange={lv => onLevelChange(topic.id, lv)}
            hasReview={hasPendingReview(reviewItems, topic.id)}
            onAddReview={() => onAddReview(topic.id, catId)}
          />
        ))}
      </div>
    </section>
  );
}

export default function TopicMap({ desktop }) {
  const [levels, setLevels] = useState(loadLevels);
  const [reviewItems, setReviewItems] = useState(loadReviewItems);
  const [activeTab, setActiveTab] = useState('all');

  const handleChange = useCallback((id, lv) => {
    setLevels(saveLevel(id, lv));
    window.dispatchEvent(new StorageEvent('storage', { key: 'takken-topic-levels' }));
  }, []);

  const handleAddReview = useCallback((topicId, subjectId) => {
    setReviewItems(addReviewItem(topicId, subjectId));
  }, []);

  const visibleCats = activeTab === 'all'
    ? Object.keys(TOPICS)
    : [activeTab];

  // サマリー統計
  const allTopicsFlat = Object.values(TOPICS).flat();
  const totalTopics = allTopicsFlat.length;
  const masteredCount = allTopicsFlat.filter(t => (levels[t.id] ?? 0) >= 4).length;
  const studiedCount = allTopicsFlat.filter(t => (levels[t.id] ?? 0) > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* サマリーバー */}
      <div className="tk-card" style={{ display: 'flex', gap: 10 }}>
        <SummaryChip label="全論点" value={totalTopics} unit="件" />
        <SummaryChip label="着手済み" value={studiedCount} unit="件" color="var(--accent)" />
        <SummaryChip label="習得（4〜5）" value={masteredCount} unit="件" color="var(--ok)" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, minWidth: 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)' }}>
            <span>習得率</span>
            <span>{Math.round(masteredCount / totalTopics * 100)}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 6, background: 'var(--track)', overflow: 'hidden' }}>
            <div style={{ width: `${masteredCount / totalTopics * 100}%`, height: '100%', background: 'var(--ok)', borderRadius: 6, transition: 'width .35s' }} />
          </div>
        </div>
      </div>

      {/* フィルタータブ */}
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto',
        scrollbarWidth: 'none', paddingBottom: 2,
      }}>
        {CAT_TABS.map(tab => {
          const on = activeTab === tab.id;
          const catInfo = tab.id !== 'all' ? CAT[tab.id] : null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 20, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
                background: on ? (catInfo ? catInfo.bg : 'var(--accent-bg)') : 'var(--chip-neutral-bg)',
                color: on ? (catInfo ? catInfo.fg : 'var(--accent)') : 'var(--ink-2)',
                boxShadow: on ? (catInfo ? `inset 0 0 0 1.5px ${catInfo.fg}` : 'inset 0 0 0 1.5px var(--accent)') : 'none',
                transition: 'all .12s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 論点セクション */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {visibleCats.map(catId => (
          <CategorySection
            key={catId}
            catId={catId}
            topics={TOPICS[catId]}
            levels={levels}
            reviewItems={reviewItems}
            onLevelChange={handleChange}
            onAddReview={handleAddReview}
            desktop={desktop}
          />
        ))}
      </div>

      {/* 理解度凡例 */}
      <div className="tk-card" style={{ background: 'var(--chip-neutral-bg)', border: 'none' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 10 }}>理解度の目安</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: desktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
          gap: '6px 12px',
        }}>
          {LEVEL_INFO.map((info, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6,
                background: info.text, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>{i}</span>
              <span style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{info.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryChip({ label, value, unit, color = 'var(--ink-1)' }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 54, padding: '4px 8px', borderRadius: 9, background: 'var(--chip-neutral-bg)' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
        {value}<span style={{ fontSize: 11 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 1 }}>{label}</div>
    </div>
  );
}
