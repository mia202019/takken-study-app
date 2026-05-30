import { useState, useMemo, useCallback, useEffect } from 'react';
import Icon from '../components/Icon';
import { CAT } from '../data/appData';
import { TOPICS } from '../data/topicsData';
import {
  LS_MATERIALS_KEY, LS_UNITS_KEY,
  MATERIAL_TYPES, MATERIAL_STATUSES, UNIT_STATUSES,
  loadMaterials, loadMaterialUnits,
  addMaterialUnit, editMaterialUnit, updateUnitStatus, deleteUnit,
  computeMaterialStats,
} from '../data/materialData';

// ── Helpers ──────────────────────────────────────────────────────────

function chipStyle(on, fg, bg) {
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

// ── Status picker (inline) ────────────────────────────────────────────

function StatusPicker({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const info = UNIT_STATUSES.find(s => s.id === status) || UNIT_STATUSES[0];

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 9px', borderRadius: 5, border: 'none', cursor: 'pointer',
        background: info.bg, color: info.color, fontSize: 11.5, fontWeight: 600,
        flexShrink: 0,
      }}>
        {info.label} <Icon name="chevron" size={10} stroke={2} />
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {UNIT_STATUSES.map(s => (
        <button key={s.id} onClick={() => { onChange(s.id); setOpen(false); }} style={{
          padding: '3px 9px', borderRadius: 5, border: 'none', cursor: 'pointer',
          background: s.id === status ? s.bg : 'var(--chip-neutral-bg)',
          color: s.id === status ? s.color : 'var(--ink-3)',
          boxShadow: s.id === status ? `inset 0 0 0 1.5px ${s.color}` : 'none',
          fontSize: 11, fontWeight: 600,
        }}>
          {s.label}
        </button>
      ))}
      <button onClick={() => setOpen(false)} style={{
        padding: '3px 6px', background: 'transparent', border: 'none',
        cursor: 'pointer', color: 'var(--ink-4)', fontSize: 13,
      }}>×</button>
    </div>
  );
}

// ── Unit form (add / edit) ────────────────────────────────────────────

function defaultUnitForm(materials) {
  return {
    materialId: materials[0]?.id || '',
    subjectId: 'gyo',
    topicId: '',
    chapterTitle: '',
    pageRange: '',
    status: 'not_started',
    estimatedMinutes: '',
    memo: '',
  };
}

function UnitForm({ materials, initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || defaultUnitForm(materials));
  const topicOpts = TOPICS[form.subjectId] || [];

  function patch(key, val) {
    setForm(prev => key === 'subjectId'
      ? { ...prev, subjectId: val, topicId: '' }
      : { ...prev, [key]: val }
    );
  }

  const canSave = form.chapterTitle.trim().length > 0 && form.materialId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FieldWrap label="教材">
        <select value={form.materialId} onChange={e => patch('materialId', e.target.value)} className="tk-input">
          {materials.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </FieldWrap>

      <FieldWrap label="科目">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(CAT).map(([id, info]) => (
            <button key={id} onClick={() => patch('subjectId', id)}
              style={chipStyle(form.subjectId === id, info.fg, info.bg)}>
              {info.label}
            </button>
          ))}
        </div>
      </FieldWrap>

      <FieldWrap label="論点（任意）">
        <select value={form.topicId} onChange={e => patch('topicId', e.target.value)} className="tk-input">
          <option value="">指定しない</option>
          {topicOpts.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </FieldWrap>

      <FieldWrap label="章・セクション名">
        <input
          type="text"
          className="tk-input"
          placeholder="例：第1章 免許、宅建業法 第3節"
          value={form.chapterTitle}
          onChange={e => patch('chapterTitle', e.target.value)}
        />
      </FieldWrap>

      <FieldWrap label="ページ範囲（任意）">
        <input
          type="text"
          className="tk-input"
          placeholder="例：p.10-25"
          value={form.pageRange}
          onChange={e => patch('pageRange', e.target.value)}
        />
      </FieldWrap>

      <FieldWrap label="ステータス">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {UNIT_STATUSES.map(s => (
            <button key={s.id} onClick={() => patch('status', s.id)}
              style={{ ...chipStyle(form.status === s.id, s.color, s.bg), fontSize: 11.5 }}>
              {s.label}
            </button>
          ))}
        </div>
      </FieldWrap>

      <FieldWrap label="目安時間（任意）">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number"
            className="tk-input"
            placeholder="30"
            min="0"
            step="5"
            value={form.estimatedMinutes}
            onChange={e => patch('estimatedMinutes', e.target.value)}
            style={{ maxWidth: 110 }}
          />
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>分</span>
        </div>
      </FieldWrap>

      <FieldWrap label="メモ（任意）">
        <textarea
          className="tk-input"
          placeholder="例：この章は宅建業の定義、出題頻度高め"
          value={form.memo}
          onChange={e => patch('memo', e.target.value)}
          style={{ minHeight: 60, resize: 'vertical' }}
        />
      </FieldWrap>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} className="tk-btn-ghost">キャンセル</button>
        <button
          onClick={() => canSave && onSave(form)}
          className="tk-btn-primary"
          style={{ opacity: canSave ? 1 : 0.45 }}
        >
          {initial ? '更新する' : '追加する'}
        </button>
      </div>
    </div>
  );
}

// ── Edit sheet ────────────────────────────────────────────────────────

function EditSheet({ unit, materials, onSave, onClose }) {
  const initial = {
    materialId: unit.materialId,
    subjectId: unit.subjectId,
    topicId: unit.topicId || '',
    chapterTitle: unit.chapterTitle,
    pageRange: unit.pageRange || '',
    status: unit.status,
    estimatedMinutes: unit.estimatedMinutes || '',
    memo: unit.memo || '',
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
          boxShadow: '0 -8px 40px rgba(40,30,20,.18)',
          animation: 'tkSheetUp .26s cubic-bezier(.2,.8,.2,1)',
          maxHeight: '85vh', overflowY: 'auto',
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 4, background: 'var(--line-strong)', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-1)', marginBottom: 16 }}>ユニットを編集</div>
        <UnitForm materials={materials} initial={initial} onSave={onSave} onCancel={onClose} />
      </div>
    </div>
  );
}

// ── Unit card ─────────────────────────────────────────────────────────

function UnitCard({ unit, materials, onStatusChange, onEdit, onDelete }) {
  const material = materials.find(m => m.id === unit.materialId);
  const matType = MATERIAL_TYPES.find(t => t.id === material?.type);
  const catInfo = CAT[unit.subjectId];
  const topic = TOPICS[unit.subjectId]?.find(t => t.id === unit.topicId);

  return (
    <div className="tk-card" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {/* Material name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
          <Icon name={matType?.icon || 'book'} size={12} stroke={1.8}
            style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
          <span style={{
            fontSize: 11.5, color: 'var(--ink-3)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {material?.title ?? '不明'}
          </span>
        </div>
        <StatusPicker status={unit.status} onChange={s => onStatusChange(unit.id, s)} />
      </div>

      {/* Chapter title */}
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-1)', lineHeight: 1.3 }}>
        {unit.chapterTitle}
      </div>

      {/* Page range + est. minutes */}
      {(unit.pageRange || unit.estimatedMinutes) && (
        <div style={{ display: 'flex', gap: 10 }}>
          {unit.pageRange && (
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{unit.pageRange}</span>
          )}
          {unit.estimatedMinutes && (
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>約{unit.estimatedMinutes}分</span>
          )}
        </div>
      )}

      {/* Subject / topic + action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {catInfo && (
          <span style={{
            display: 'inline-block', padding: '2px 7px', borderRadius: 5,
            background: catInfo.bg, color: catInfo.fg, fontSize: 11, fontWeight: 600,
          }}>
            {catInfo.label}
          </span>
        )}
        {topic && (
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{topic.title}</span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button onClick={() => onEdit(unit)} style={{
            padding: '4px 9px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)',
            display: 'flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontFamily: 'inherit',
          }}>
            <Icon name="pencil" size={11} stroke={2} /> 編集
          </button>
          <button onClick={() => onDelete(unit.id)} style={{
            padding: '4px 9px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: 'var(--warn-bg)', color: 'var(--warn)',
            display: 'flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontFamily: 'inherit',
          }}>
            × 削除
          </button>
        </div>
      </div>

      {unit.memo && (
        <div style={{
          fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55,
          background: 'var(--chip-neutral-bg)', borderRadius: 8, padding: '6px 10px',
        }}>
          {unit.memo}
        </div>
      )}
    </div>
  );
}

// ── Material overview ─────────────────────────────────────────────────

function MaterialRow({ material, unitCount, index }) {
  const typeInfo = MATERIAL_TYPES.find(t => t.id === material.type);
  const statusInfo = MATERIAL_STATUSES.find(s => s.id === material.status);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '11px 0',
      borderTop: index > 0 ? '1px solid var(--line)' : 'none',
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: 'var(--accent-bg)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={typeInfo?.icon || 'book'} size={16} stroke={1.8} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: 'var(--ink-1)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {material.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
          {typeInfo?.label} · {unitCount}ユニット
        </div>
      </div>
      <span style={{
        padding: '2px 8px', borderRadius: 5, flexShrink: 0,
        background: statusInfo?.bg || 'var(--chip-neutral-bg)',
        color: statusInfo?.color || 'var(--ink-3)',
        fontSize: 11, fontWeight: 600,
      }}>
        {statusInfo?.label}
      </span>
    </div>
  );
}

// ── Summary / empty / toast ───────────────────────────────────────────

function SummaryChip({ label, count, warn }) {
  return (
    <div style={{
      flex: 1, textAlign: 'center', padding: '10px 8px', borderRadius: 11,
      background: warn && count > 0 ? 'var(--warn-bg)' : 'var(--chip-neutral-bg)',
    }}>
      <div style={{
        fontSize: 20, fontWeight: 700, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums',
        color: warn && count > 0 ? 'var(--warn)' : 'var(--ink-1)',
      }}>{count}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="tk-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
      <div style={{ marginBottom: 12 }}>
        <Icon name="book" size={36} stroke={1.4} style={{ color: 'var(--ink-4)', margin: '0 auto' }} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6 }}>
        ユニットがありません
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
        「ユニットを追加」から<br />章・ページ範囲・進捗を登録できます
      </div>
    </div>
  );
}

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

// ── Main ──────────────────────────────────────────────────────────────

export default function MaterialPage() {
  const [materials, setMaterials] = useState(loadMaterials);
  const [units, setUnits] = useState(loadMaterialUnits);
  const [formOpen, setFormOpen] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [filterMaterial, setFilterMaterial] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (!e.key || e.key === LS_MATERIALS_KEY) setMaterials(loadMaterials());
      if (!e.key || e.key === LS_UNITS_KEY) setUnits(loadMaterialUnits());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const stats = useMemo(() => computeMaterialStats(units), [units]);

  const unitCountByMaterial = useMemo(() => {
    const counts = {};
    units.forEach(u => { counts[u.materialId] = (counts[u.materialId] || 0) + 1; });
    return counts;
  }, [units]);

  const filtered = useMemo(() =>
    filterMaterial === 'all' ? units : units.filter(u => u.materialId === filterMaterial),
    [units, filterMaterial]
  );

  const flash = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const handleAdd = useCallback((form) => {
    setUnits(addMaterialUnit(form));
    setFormOpen(false);
    flash('ユニットを追加しました');
  }, [flash]);

  const handleEdit = useCallback((form) => {
    setUnits(editMaterialUnit(editUnit.id, form));
    setEditUnit(null);
    flash('更新しました');
  }, [editUnit, flash]);

  const handleStatusChange = useCallback((unitId, status) => {
    setUnits(updateUnitStatus(unitId, status));
  }, []);

  const handleDelete = useCallback((unitId) => {
    setUnits(deleteUnit(unitId));
    flash('削除しました');
  }, [flash]);

  // Filter chips: only show materials that have units
  const materialsWithUnits = materials.filter(m => unitCountByMaterial[m.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* サマリー */}
      <div style={{ display: 'flex', gap: 8 }}>
        <SummaryChip label="全体" count={stats.total} />
        <SummaryChip label="完了" count={stats.completed} />
        <SummaryChip label="復習必要" count={stats.needsReview} warn />
        <SummaryChip label="学習中" count={stats.inProgress} />
      </div>

      {/* 教材一覧 */}
      <div className="tk-card">
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 4 }}>教材一覧</div>
        {materials.map((m, i) => (
          <MaterialRow key={m.id} material={m} unitCount={unitCountByMaterial[m.id] || 0} index={i} />
        ))}
      </div>

      {/* ユニット追加 */}
      {formOpen ? (
        <div className="tk-card">
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-1)', marginBottom: 16 }}>
            ユニットを追加
          </div>
          <UnitForm materials={materials} onSave={handleAdd} onCancel={() => setFormOpen(false)} />
        </div>
      ) : (
        <button
          onClick={() => setFormOpen(true)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', borderRadius: 12, border: '1px dashed var(--line-strong)',
            background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)',
          }}
        >
          <Icon name="plus" size={16} stroke={2.2} /> ユニットを追加
        </button>
      )}

      {/* フィルター（ユニットがある教材のみ表示） */}
      {materialsWithUnits.length > 0 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
          {[{ id: 'all', label: 'すべて' }, ...materialsWithUnits.map(m => ({
            id: m.id,
            label: m.title.length > 12 ? m.title.slice(0, 12) + '…' : m.title,
          }))].map(f => {
            const on = filterMaterial === f.id;
            return (
              <button key={f.id} onClick={() => setFilterMaterial(f.id)} style={{
                flexShrink: 0, padding: '6px 12px', borderRadius: 20, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                background: on ? 'var(--accent-bg)' : 'var(--chip-neutral-bg)',
                color: on ? 'var(--accent)' : 'var(--ink-2)',
                boxShadow: on ? 'inset 0 0 0 1.5px var(--accent)' : 'none',
                transition: 'all .12s',
              }}>
                {f.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ユニット一覧 */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(unit => (
            <UnitCard
              key={unit.id}
              unit={unit}
              materials={materials}
              onStatusChange={handleStatusChange}
              onEdit={setEditUnit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* 編集シート */}
      {editUnit && (
        <EditSheet
          unit={editUnit}
          materials={materials}
          onSave={handleEdit}
          onClose={() => setEditUnit(null)}
        />
      )}

      <Toast msg={toast} />
    </div>
  );
}
