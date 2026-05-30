import { useState, useMemo, useEffect, useCallback } from 'react';
import Icon from '../components/Icon';
import { CAT } from '../data/appData';
import { TOPICS } from '../data/topicsData';
import {
  LS_RESOURCES_KEY, RESOURCE_TYPES, RESOURCE_STATUSES,
  loadResources, addResource, editResource, deleteResource,
  computeResourceStats,
} from '../data/resourceData';

// ── Style helpers ──────────────────────────────────────────────────

function chip(active, fg = 'var(--accent)', bg = 'var(--accent-bg)') {
  return {
    padding: '6px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
    fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
    transition: 'all .12s', whiteSpace: 'nowrap',
    background: active ? bg : 'var(--chip-neutral-bg)',
    color: active ? fg : 'var(--ink-2)',
    boxShadow: active ? `inset 0 0 0 1.5px ${fg}` : 'none',
  };
}

function tagBase() {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 6,
    fontSize: 11.5, fontWeight: 500, lineHeight: 1.3, whiteSpace: 'nowrap',
  };
}

// ── Type / status / subject badges ────────────────────────────────

const TYPE_COLORS = {
  official: { fg: '#3a5a8a',          bg: '#e8f0fa'                   },
  law:      { fg: 'var(--cat-horei)', bg: 'var(--cat-horei-bg)'       },
  youtube:  { fg: '#c0392b',          bg: '#fdf0ee'                   },
  textbook: { fg: 'var(--cat-gyo)',   bg: 'var(--cat-gyo-bg)'         },
  workbook: { fg: 'var(--cat-kenri)', bg: 'var(--cat-kenri-bg)'       },
  website:  { fg: '#3a7a5a',          bg: '#e8f5ec'                   },
  other:    { fg: 'var(--ink-3)',     bg: 'var(--chip-neutral-bg)'    },
};

function TypeBadge({ typeId }) {
  const t = RESOURCE_TYPES.find(x => x.id === typeId);
  if (!t) return null;
  const c = TYPE_COLORS[typeId] || TYPE_COLORS.other;
  return (
    <span style={{ ...tagBase(), background: c.bg, color: c.fg }}>
      <Icon name={t.icon} size={11} stroke={2} />{t.label}
    </span>
  );
}

function StatusBadge({ statusId }) {
  const s = RESOURCE_STATUSES.find(x => x.id === statusId);
  if (!s) return null;
  return <span style={{ ...tagBase(), background: s.bg, color: s.color }}>{s.label}</span>;
}

function SubjectTag({ subjectId }) {
  if (!subjectId) return null;
  const c = CAT[subjectId];
  if (!c) return null;
  return <span style={{ ...tagBase(), background: c.bg, color: c.fg }}>{c.label}</span>;
}

function TopicTag({ subjectId, topicId }) {
  if (!subjectId || !topicId) return null;
  const topic = TOPICS[subjectId]?.find(t => t.id === topicId);
  if (!topic) return null;
  return (
    <span style={{ ...tagBase(), background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)' }}>
      {topic.title}
    </span>
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

// ── Summary strip ─────────────────────────────────────────────────

function SummaryStrip({ stats }) {
  const items = [
    { label: '全体',    value: stats.total,     accent: false },
    { label: '使用中',  value: stats.using,     accent: true  },
    { label: '参照用',  value: stats.reference, accent: false },
    { label: 'YouTube', value: stats.youtube,   accent: false },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {items.map(it => (
        <div key={it.label} style={{
          background: 'var(--chip-neutral-bg)', borderRadius: 11,
          padding: '10px 8px', textAlign: 'center',
        }}>
          <div style={{
            fontSize: 20, fontWeight: 700, lineHeight: 1.1,
            fontVariantNumeric: 'tabular-nums',
            color: it.accent ? 'var(--accent)' : 'var(--ink-1)',
          }}>{it.value}</div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 2 }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Filter bar ─────────────────────────────────────────────────────

function FilterBar({ filterType, setFilterType, filterSubject, setFilterSubject, search, setSearch }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
        <button style={chip(filterType === 'all')} onClick={() => setFilterType('all')}>すべて</button>
        {RESOURCE_TYPES.map(t => (
          <button key={t.id} style={chip(filterType === t.id)} onClick={() => setFilterType(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
        <button style={chip(filterSubject === 'all')} onClick={() => setFilterSubject('all')}>全科目</button>
        {Object.entries(CAT).map(([id, c]) => (
          <button key={id} style={chip(filterSubject === id, c.fg, c.bg)} onClick={() => setFilterSubject(id)}>
            {c.label}
          </button>
        ))}
        <button style={chip(filterSubject === 'none')} onClick={() => setFilterSubject('none')}>科目なし</button>
      </div>
      <input
        className="tk-input"
        placeholder="タイトルで検索…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ fontSize: 13 }}
      />
    </div>
  );
}

// ── Resource form ─────────────────────────────────────────────────

const BLANK_FORM = {
  title: '', type: 'website', subjectId: '', topicId: '',
  url: '', description: '', status: 'reference', memo: '',
};

function ResourceForm({ initial, onSave, onCancel, isEdit }) {
  const [form, setForm] = useState(initial || BLANK_FORM);

  const patch = (k, v) => setForm(f => {
    if (k === 'subjectId') return { ...f, subjectId: v, topicId: '' };
    return { ...f, [k]: v };
  });

  const topicOpts = form.subjectId ? (TOPICS[form.subjectId] || []) : [];
  const canSave = form.title.trim().length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <label style={{ display: 'block' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>
          タイトル <span style={{ color: 'var(--warn)' }}>*</span>
        </span>
        <input
          className="tk-input"
          placeholder="例：e-Gov 民法"
          value={form.title}
          onChange={e => patch('title', e.target.value)}
        />
      </label>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 7 }}>種別</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {RESOURCE_TYPES.map(t => (
            <button key={t.id} style={chip(form.type === t.id)} onClick={() => patch('type', t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 7 }}>科目（任意）</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button
            style={chip(!form.subjectId, 'var(--ink-3)', 'var(--chip-neutral-bg)')}
            onClick={() => patch('subjectId', '')}
          >なし</button>
          {Object.entries(CAT).map(([id, c]) => (
            <button key={id} style={chip(form.subjectId === id, c.fg, c.bg)} onClick={() => patch('subjectId', id)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {topicOpts.length > 0 && (
        <label style={{ display: 'block' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>論点（任意）</span>
          <select
            className="tk-input"
            value={form.topicId}
            onChange={e => patch('topicId', e.target.value)}
            style={{ fontSize: 14 }}
          >
            <option value="">選択なし</option>
            {topicOpts.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </label>
      )}

      <label style={{ display: 'block' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>URL（任意）</span>
        <input
          className="tk-input"
          placeholder="https://"
          value={form.url}
          onChange={e => patch('url', e.target.value)}
        />
      </label>

      <label style={{ display: 'block' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>説明（任意）</span>
        <input
          className="tk-input"
          placeholder="例：公式過去問と正解番号表"
          value={form.description}
          onChange={e => patch('description', e.target.value)}
        />
      </label>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 7 }}>ステータス</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {RESOURCE_STATUSES.map(s => (
            <button key={s.id} style={chip(form.status === s.id, s.color, s.bg)} onClick={() => patch('status', s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <label style={{ display: 'block' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>メモ（任意）</span>
        <textarea
          className="tk-input"
          placeholder="例：宅建業法の条文確認に使用"
          value={form.memo}
          onChange={e => patch('memo', e.target.value)}
          rows={2}
          style={{ resize: 'vertical', minHeight: 60 }}
        />
      </label>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} className="tk-btn-ghost">キャンセル</button>
        <button
          onClick={() => canSave && onSave(form)}
          className="tk-btn-primary"
          style={{ opacity: canSave ? 1 : 0.4 }}
        >
          {isEdit ? '保存する' : '追加する'}
        </button>
      </div>
    </div>
  );
}

// ── Edit sheet ────────────────────────────────────────────────────

function EditSheet({ resource, onSave, onClose }) {
  const initial = {
    title:       resource.title,
    type:        resource.type,
    subjectId:   resource.subjectId || '',
    topicId:     resource.topicId   || '',
    url:         resource.url         || '',
    description: resource.description || '',
    status:      resource.status,
    memo:        resource.memo        || '',
  };
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(40,32,24,.34)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'tkFade .18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', width: '100%', maxWidth: 600,
          borderRadius: '20px 20px 0 0',
          padding: '8px 20px calc(32px + env(safe-area-inset-bottom))',
          maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(40,30,20,.18)',
          animation: 'tkSheetUp .26s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 4, background: 'var(--line-strong)', margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>リソースを編集</div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 15, border: 'none', cursor: 'pointer',
            background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        <ResourceForm initial={initial} onSave={onSave} onCancel={onClose} isEdit />
      </div>
    </div>
  );
}

// ── Resource card ─────────────────────────────────────────────────

function ResourceCard({ resource, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleOpen = () => {
    if (!resource.url) return;
    const url = resource.url.startsWith('http') ? resource.url : `https://${resource.url}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="tk-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 7 }}>
        <TypeBadge typeId={resource.type} />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-1)', flex: 1, minWidth: 0 }}>
          {resource.title}
        </span>
      </div>

      {resource.description && (
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 8, lineHeight: 1.45 }}>
          {resource.description}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <SubjectTag subjectId={resource.subjectId} />
        <TopicTag subjectId={resource.subjectId} topicId={resource.topicId} />
        <StatusBadge statusId={resource.status} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {resource.url && (
          <button onClick={handleOpen} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'var(--accent-bg)', color: 'var(--accent)',
            fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
          }}>
            <Icon name="arrowRight" size={13} stroke={2} /> 開く
          </button>
        )}
        <button onClick={() => onEdit(resource)} style={{
          width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="pencil" size={14} stroke={1.8} />
        </button>
        {confirmDelete ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--warn)' }}>削除しますか？</span>
            <button onClick={() => onDelete(resource.id)} style={{
              padding: '4px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: 'var(--warn)', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            }}>削除</button>
            <button onClick={() => setConfirmDelete(false)} style={{
              padding: '4px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            }}>取消</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} style={{
            width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'var(--chip-neutral-bg)', color: 'var(--warn)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, lineHeight: 1,
          }}>×</button>
        )}
      </div>

      {resource.memo && (
        <div style={{
          marginTop: 10, padding: '7px 10px', background: 'var(--chip-neutral-bg)',
          borderRadius: 7, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5,
        }}>
          {resource.memo}
        </div>
      )}
    </div>
  );
}

// ── Add section (collapsible) ─────────────────────────────────────

function AddSection({ onAdded }) {
  const [open, setOpen] = useState(false);

  const handleSave = (form) => {
    addResource(form);
    setOpen(false);
    onAdded();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '13px', borderRadius: 12,
          border: '1.5px dashed var(--line-strong)', background: 'transparent',
          cursor: 'pointer', color: 'var(--accent)', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
        }}
      >
        <Icon name="plus" size={17} stroke={2.2} /> リソースを追加
      </button>
    );
  }

  return (
    <div className="tk-card" style={{ borderTop: '3px solid var(--accent)' }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>リソースを追加</div>
      <ResourceForm onSave={handleSave} onCancel={() => setOpen(false)} isEdit={false} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function ResourcePage() {
  const [resources, setResources] = useState(loadResources);
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === LS_RESOURCES_KEY) setResources(loadResources());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const flash = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const stats = useMemo(() => computeResourceStats(resources), [resources]);

  const filtered = useMemo(() => resources.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterSubject === 'none' && r.subjectId) return false;
    if (filterSubject !== 'all' && filterSubject !== 'none' && r.subjectId !== filterSubject) return false;
    if (search.trim() && !r.title.includes(search.trim())) return false;
    return true;
  }), [resources, filterType, filterSubject, search]);

  const handleEdit = useCallback((fields) => {
    editResource(editTarget.id, fields);
    setEditTarget(null);
    flash('リソースを更新しました');
  }, [editTarget, flash]);

  const handleDelete = useCallback((id) => {
    deleteResource(id);
    flash('削除しました');
  }, [flash]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
        公式サイト・法令・動画・教材リンクをまとめます
      </div>

      <SummaryStrip stats={stats} />

      <div className="tk-card">
        <FilterBar
          filterType={filterType}       setFilterType={setFilterType}
          filterSubject={filterSubject} setFilterSubject={setFilterSubject}
          search={search}               setSearch={setSearch}
        />
      </div>

      <AddSection onAdded={() => flash('リソースを追加しました')} />

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-3)' }}>
          <Icon name="library" size={32} stroke={1.4} style={{ marginBottom: 8, display: 'block', margin: '0 auto 10px' }} />
          <div style={{ fontSize: 14, fontWeight: 600 }}>リソースがありません</div>
          <div style={{ fontSize: 12.5, marginTop: 4 }}>フィルターを変更するか、リソースを追加してください</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(r => (
            <ResourceCard
              key={r.id}
              resource={r}
              onEdit={setEditTarget}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editTarget && (
        <EditSheet
          resource={editTarget}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

      <Toast msg={toast} />
    </div>
  );
}
