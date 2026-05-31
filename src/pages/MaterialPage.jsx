import { useState, useMemo, useCallback, useEffect } from 'react';
import Icon from '../components/Icon';
import { CAT } from '../data/appData';
import { TOPICS } from '../data/topicsData';
import {
  LS_MATERIALS_KEY, LS_UNITS_KEY,
  MATERIAL_TYPES, MATERIAL_STATUSES, UNIT_STATUSES,
  loadMaterials, loadMaterialUnits,
  addMaterial, editMaterial, deleteMaterial,
  addMaterialUnit, editMaterialUnit, updateUnitStatus, deleteUnit,
  computeMaterialStats, addMaterialFromCatalog,
} from '../data/materialData';
import { TEXTBOOK_CATALOG, catalogUnitSummary } from '../data/textbookCatalog';
import { LS_SCHEDULE_META_KEY } from '../data/scheduleData';

// ── Style helpers ─────────────────────────────────────────────────────

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

// ── Toast ─────────────────────────────────────────────────────────────

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

// ── Material form ─────────────────────────────────────────────────────

const BLANK_MAT = { title: '', type: 'textbook', status: 'using', memo: '' };

function MaterialForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || BLANK_MAT);
  const patch = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSave = form.title.trim().length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FieldWrap label="教材名 *">
        <input
          className="tk-input"
          placeholder="例：みんなが欲しかった！宅建士の教科書"
          value={form.title}
          onChange={e => patch('title', e.target.value)}
        />
      </FieldWrap>

      <FieldWrap label="種別">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {MATERIAL_TYPES.map(t => (
            <button key={t.id} style={chipStyle(form.type === t.id)} onClick={() => patch('type', t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </FieldWrap>

      <FieldWrap label="ステータス">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {MATERIAL_STATUSES.map(s => (
            <button key={s.id} style={chipStyle(form.status === s.id, s.color, s.bg)} onClick={() => patch('status', s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </FieldWrap>

      <FieldWrap label="メモ（任意）">
        <textarea
          className="tk-input"
          placeholder="例：宅建業法の条文確認に使用"
          value={form.memo}
          onChange={e => patch('memo', e.target.value)}
          rows={2}
          style={{ resize: 'vertical', minHeight: 56 }}
        />
      </FieldWrap>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} className="tk-btn-ghost">キャンセル</button>
        <button
          onClick={() => canSave && onSave(form)}
          className="tk-btn-primary"
          style={{ opacity: canSave ? 1 : 0.4 }}
        >
          保存する
        </button>
      </div>
    </div>
  );
}

// ── Unit form ─────────────────────────────────────────────────────────

function UnitForm({ materials, initial, fixedMaterialId, onSave, onCancel }) {
  const defaultMaterialId = fixedMaterialId || materials[0]?.id || '';
  const [form, setForm] = useState(initial || {
    materialId: defaultMaterialId,
    subjectId: 'gyo',
    topicId: '',
    chapterTitle: '',
    pageRange: '',
    status: 'not_started',
    estimatedMinutes: '',
    memo: '',
  });
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
      {!fixedMaterialId && (
        <FieldWrap label="教材">
          <select value={form.materialId} onChange={e => patch('materialId', e.target.value)} className="tk-input">
            {materials.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </FieldWrap>
      )}

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

      <FieldWrap label="章・セクション名 *">
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
          placeholder="例：この章は出題頻度高め"
          value={form.memo}
          onChange={e => patch('memo', e.target.value)}
          style={{ minHeight: 56, resize: 'vertical' }}
        />
      </FieldWrap>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} className="tk-btn-ghost">キャンセル</button>
        <button
          onClick={() => canSave && onSave(form)}
          className="tk-btn-primary"
          style={{ opacity: canSave ? 1 : 0.4 }}
        >
          {initial ? '更新する' : '追加する'}
        </button>
      </div>
    </div>
  );
}

// ── Catalog ───────────────────────────────────────────────────────────

const CAT_ORDER = ['gyo', 'kenri', 'horei', 'zei'];

function CatalogCard({ entry, alreadyAdded, onPreview }) {
  const summary = useMemo(() => catalogUnitSummary(entry), [entry]);
  const total = entry.units.length;
  const typeInfo = MATERIAL_TYPES.find(t => t.id === entry.type);

  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 14,
      border: '1.5px solid var(--line)',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
            background: 'var(--accent-bg)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={typeInfo?.icon || 'book'} size={19} stroke={1.7} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-1)', lineHeight: 1.35 }}>
              {entry.shortTitle}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
              {entry.publisher}　·　全{total}ユニット
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6, margin: '10px 0 10px' }}>
          {entry.description}
        </div>

        {/* 科目別ユニット数 */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
          {CAT_ORDER.map(catId => summary[catId] ? (
            <span key={catId} style={{
              padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600,
              background: CAT[catId]?.bg, color: CAT[catId]?.fg,
            }}>
              {CAT[catId]?.label} {summary[catId]}
            </span>
          ) : null)}
        </div>

        {alreadyAdded ? (
          <div style={{
            padding: '8px 14px', borderRadius: 9, background: '#f0fff4',
            color: 'var(--ok)', fontSize: 13, fontWeight: 600, textAlign: 'center',
          }}>
            ✓ 追加済み
          </div>
        ) : (
          <button
            onClick={() => onPreview(entry)}
            style={{
              width: '100%', padding: '10px', borderRadius: 9,
              border: '1.5px solid var(--accent)', background: 'var(--accent-bg)',
              color: 'var(--accent)', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <Icon name={typeInfo?.icon || 'book'} size={14} stroke={2} />
            {entry.type === 'video' ? 'トピック一覧を見て追加' : 'ユニット一覧を見て追加'}
          </button>
        )}
      </div>
    </div>
  );
}

// カタログプレビューシート（ユニット一覧 + 追加ボタン）
function CatalogPreviewSheet({ entry, onAdd, onClose }) {
  const summary = useMemo(() => catalogUnitSummary(entry), [entry]);
  const total = entry.units.length;
  const bySubject = useMemo(() => {
    const groups = {};
    entry.units.forEach(u => {
      if (!groups[u.subjectId]) groups[u.subjectId] = [];
      groups[u.subjectId].push(u);
    });
    return groups;
  }, [entry]);

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
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 4, background: 'var(--line-strong)', margin: '0 auto 16px' }} />

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink-1)', lineHeight: 1.3 }}>{entry.title}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>全{total}ユニット</div>
        </div>

        {/* 購入が必要な教材への注意 */}
        {(entry.type === 'textbook' || entry.type === 'workbook') && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '10px 12px', borderRadius: 10,
            background: '#fff8e1', border: '1px solid #f6d860',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>📖</span>
            <div style={{ fontSize: 12, color: '#7a5f00', lineHeight: 1.65 }}>
              <strong>別途ご購入が必要です。</strong><br />
              このアプリには目次（章構成）のみ登録されています。実際の本文・解説・問題は書籍をご購入ください。<br />
              <span style={{ fontWeight: 600 }}>購入済み、または購入予定の教材</span>を選んでください。
            </div>
          </div>
        )}

        {/* 科目別ユニット一覧 */}
        {CAT_ORDER.filter(c => bySubject[c]).map(catId => (
          <div key={catId} style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, marginBottom: 8,
              padding: '3px 10px', borderRadius: 6, display: 'inline-block',
              background: CAT[catId]?.bg, color: CAT[catId]?.fg,
            }}>
              {CAT[catId]?.label}　{bySubject[catId].length}{entry.type === 'video' ? 'トピック' : '章'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {bySubject[catId].map((u, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 8,
                  background: 'var(--chip-neutral-bg)',
                }}>
                  <span style={{ fontSize: 11.5, color: 'var(--ink-1)', flex: 1 }}>{u.chapterTitle}</span>
                  {u.url && (
                    <a href={u.url} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ flexShrink: 0, color: 'var(--accent)', display: 'flex', alignItems: 'center' }}
                    >
                      <Icon name="arrowRight" size={13} stroke={2} />
                    </a>
                  )}
                  {u.estimatedMinutes && (
                    <span style={{ fontSize: 11, color: 'var(--ink-4)', flexShrink: 0 }}>
                      {u.estimatedMinutes}分
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ fontSize: 11.5, color: 'var(--ink-4)', lineHeight: 1.6, marginBottom: 16 }}>
          ※ 章構成は2026年度版の公開情報をもとに作成しています。実際の書籍と照合してユニットを編集・追加できます。
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid var(--line)',
            background: 'transparent', color: 'var(--ink-2)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            キャンセル
          </button>
          <button onClick={() => onAdd(entry)} className="tk-btn-primary" style={{ flex: 2, padding: '12px' }}>
            この教材を追加する
          </button>
        </div>
      </div>
    </div>
  );
}

// カタログ選択ビュー（教材ゼロのとき表示）
function CatalogView({ addedIds, onPreview, onCustomAdd }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7, padding: '0 2px' }}>
        使用する教材を選択してください。選択した教材のユニット一覧が自動で作成されます。
      </div>
      <div style={{
        display: 'flex', gap: 9, alignItems: 'flex-start',
        padding: '10px 12px', borderRadius: 10,
        background: '#fff8e1', border: '1px solid #f6d860',
      }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>📖</span>
        <div style={{ fontSize: 12, color: '#7a5f00', lineHeight: 1.65 }}>
          教科書・問題集は<strong>別途ご購入が必要</strong>です。アプリには目次のみ入っています。<br />
          <span style={{ fontWeight: 600 }}>購入済み・購入予定のものを選んでください。</span>
        </div>
      </div>
      {TEXTBOOK_CATALOG.map(entry => (
        <CatalogCard
          key={entry.id}
          entry={entry}
          alreadyAdded={addedIds.has(entry.id)}
          onPreview={onPreview}
        />
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>または</span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>
      <button
        onClick={onCustomAdd}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px', borderRadius: 12, border: '1.5px dashed var(--line-strong)',
          background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)',
        }}
      >
        <Icon name="plus" size={15} stroke={2.2} /> 教材をゼロから追加
      </button>
    </div>
  );
}

// ── Bottom sheet ──────────────────────────────────────────────────────

function BottomSheet({ title, onClose, children }) {
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
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ width: 38, height: 4, borderRadius: 4, background: 'var(--line-strong)', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 15, border: 'none', cursor: 'pointer',
            background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Unit card ─────────────────────────────────────────────────────────

function UnitCard({ unit, onStatusChange, onEdit, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const catInfo = CAT[unit.subjectId];
  const topic = TOPICS[unit.subjectId]?.find(t => t.id === unit.topicId);

  return (
    <div style={{
      background: 'var(--chip-neutral-bg)', borderRadius: 10,
      padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-1)', lineHeight: 1.35, flex: 1 }}>
          {unit.chapterTitle}
        </div>
        <StatusPicker status={unit.status} onChange={s => onStatusChange(unit.id, s)} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {catInfo && (
          <span style={{
            padding: '2px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600,
            background: catInfo.bg, color: catInfo.fg,
          }}>
            {catInfo.label}
          </span>
        )}
        {topic && (
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{topic.title}</span>
        )}
        {unit.pageRange && (
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{unit.pageRange}</span>
        )}
        {unit.estimatedMinutes && (
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>約{unit.estimatedMinutes}分</span>
        )}
      </div>

      {unit.memo && (
        <div style={{
          fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5,
          background: 'var(--surface)', borderRadius: 7, padding: '5px 9px',
        }}>
          {unit.memo}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        {confirmDel ? (
          <>
            <span style={{ fontSize: 12, color: 'var(--warn)', alignSelf: 'center' }}>削除しますか？</span>
            <button onClick={() => onDelete(unit.id)} style={{
              padding: '4px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: 'var(--warn)', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            }}>削除</button>
            <button onClick={() => setConfirmDel(false)} style={{
              padding: '4px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: 'var(--surface)', color: 'var(--ink-2)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            }}>取消</button>
          </>
        ) : (
          <>
            <button onClick={() => onEdit(unit)} style={{
              padding: '4px 9px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: 'var(--surface)', color: 'var(--ink-2)',
              display: 'flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontFamily: 'inherit',
            }}>
              <Icon name="pencil" size={11} stroke={2} /> 編集
            </button>
            <button onClick={() => setConfirmDel(true)} style={{
              padding: '4px 9px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: 'var(--warn-bg)', color: 'var(--warn)',
              fontSize: 11.5, fontFamily: 'inherit',
            }}>× 削除</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Material card (accordion) ─────────────────────────────────────────

function MaterialCard({ material, units, onAddUnit, onEditUnit, onDeleteUnit, onStatusChange, onEditMaterial, onDeleteMaterial }) {
  const [expanded, setExpanded] = useState(false);
  const [unitsOpen, setUnitsOpen] = useState(false);
  const [addingUnit, setAddingUnit] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const typeInfo = MATERIAL_TYPES.find(t => t.id === material.type);
  const statusInfo = MATERIAL_STATUSES.find(s => s.id === material.status);
  const completedCount = units.filter(u => u.status === 'completed').length;

  return (
    <div className="tk-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header row — tap to expand */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        <span style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'var(--accent-bg)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={typeInfo?.icon || 'book'} size={17} stroke={1.8} />
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13.5, fontWeight: 700, color: 'var(--ink-1)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {material.title}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{
              padding: '1px 7px', borderRadius: 4,
              background: statusInfo?.bg || 'var(--chip-neutral-bg)',
              color: statusInfo?.color || 'var(--ink-3)',
              fontSize: 11, fontWeight: 600,
            }}>
              {statusInfo?.label}
            </span>
            {units.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {completedCount}/{units.length} ユニット完了
              </span>
            )}
            {units.length === 0 && (
              <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>ユニット未登録</span>
            )}
          </div>
        </div>

        <Icon
          name="chevron"
          size={16}
          stroke={2}
          style={{
            color: 'var(--ink-3)', flexShrink: 0,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform .2s',
          }}
        />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Material action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => onEditMaterial(material)} style={{
              padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)',
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            }}>
              <Icon name="pencil" size={12} stroke={2} /> 教材を編集
            </button>
            {confirmDel ? (
              <>
                <span style={{ fontSize: 12, color: 'var(--warn)', alignSelf: 'center' }}>削除しますか？</span>
                <button onClick={() => onDeleteMaterial(material.id)} style={{
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'var(--warn)', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                }}>削除</button>
                <button onClick={() => setConfirmDel(false)} style={{
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                }}>取消</button>
              </>
            ) : (
              <button onClick={() => setConfirmDel(true)} style={{
                padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'var(--warn-bg)', color: 'var(--warn)',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              }}>× 教材を削除</button>
            )}
          </div>

          {/* Unit list — 折りたたみ */}
          {units.length > 0 && (
            <div>
              <button
                onClick={() => setUnitsOpen(v => !v)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: 'var(--chip-neutral-bg)', fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)' }}>
                  ユニット一覧（{units.length}件）
                </span>
                <Icon
                  name="chevron"
                  size={14}
                  stroke={2}
                  style={{
                    color: 'var(--ink-3)',
                    transform: unitsOpen ? 'rotate(270deg)' : 'rotate(90deg)',
                    transition: 'transform .2s',
                  }}
                />
              </button>
              {unitsOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {units.map(unit => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      onStatusChange={onStatusChange}
                      onEdit={onEditUnit}
                      onDelete={onDeleteUnit}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add unit inline */}
          {addingUnit ? (
            <div style={{
              background: 'var(--chip-neutral-bg)', borderRadius: 10, padding: '14px 12px',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>ユニットを追加</div>
              <UnitForm
                materials={[material]}
                fixedMaterialId={material.id}
                onSave={(form) => { onAddUnit(form); setAddingUnit(false); }}
                onCancel={() => setAddingUnit(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingUnit(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '10px', borderRadius: 9, border: '1.5px dashed var(--line-strong)',
                background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: 600, color: 'var(--accent)',
              }}
            >
              <Icon name="plus" size={14} stroke={2.2} /> ユニットを追加
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Summary strip ─────────────────────────────────────────────────────

function SummaryStrip({ materials }) {
  // カタログ全体の種別カウント
  const catalogCounts = useMemo(() => {
    const c = { textbook: 0, workbook: 0, video: 0 };
    TEXTBOOK_CATALOG.forEach(e => {
      if (c[e.type] !== undefined) c[e.type]++;
    });
    return c;
  }, []);

  // ユーザーが選択済みの種別カウント
  const selectedCounts = useMemo(() => {
    const c = { textbook: 0, workbook: 0, video: 0 };
    materials.forEach(m => {
      if (c[m.type] !== undefined) c[m.type]++;
    });
    return c;
  }, [materials]);

  const rows = [
    { type: 'textbook', icon: 'book',   label: '教科書', unit: '冊' },
    { type: 'workbook', icon: 'target', label: '問題集', unit: '冊' },
    { type: 'video',    icon: 'play',   label: '動画',   unit: '本' },
  ];

  return (
    <div className="tk-card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 12, letterSpacing: '.04em' }}>
        教材の選択状況
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map(r => (
          <div key={r.type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8, background: 'var(--accent-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name={r.icon} size={13} stroke={1.8} style={{ color: 'var(--accent)' }} />
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', flex: 1 }}>{r.label}</span>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
              カタログ <span style={{ fontWeight: 700, color: 'var(--ink-1)' }}>{catalogCounts[r.type]}</span>{r.unit}
            </span>
            <span style={{ fontSize: 11, color: 'var(--ink-4)', margin: '0 4px' }}>→</span>
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: selectedCounts[r.type] > 0 ? 'var(--ok)' : 'var(--ink-4)',
            }}>
              選択済み {selectedCounts[r.type]}{r.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────

function loadHasSchedule() {
  try { return !!localStorage.getItem(LS_SCHEDULE_META_KEY); } catch { return false; }
}

export default function MaterialPage({ onGoSettings }) {
  const [materials, setMaterials] = useState(loadMaterials);
  const [units, setUnits] = useState(loadMaterialUnits);
  const [hasSchedule, setHasSchedule] = useState(loadHasSchedule);
  const [toast, setToast] = useState(null);

  // Sheet state
  const [addMatOpen, setAddMatOpen] = useState(false);
  const [editMatTarget, setEditMatTarget] = useState(null);
  const [editUnitTarget, setEditUnitTarget] = useState(null);
  const [catalogPreview, setCatalogPreview] = useState(null); // catalog entry being previewed
  const [showCatalogSheet, setShowCatalogSheet] = useState(false); // catalog sheet when materials exist

  // カタログ追加済みIDセット（タイトルで照合）
  const addedCatalogIds = useMemo(() => {
    const titles = new Set(materials.map(m => m.title));
    return new Set(TEXTBOOK_CATALOG.filter(e => titles.has(e.title)).map(e => e.id));
  }, [materials]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.key || e.key === LS_MATERIALS_KEY)    setMaterials(loadMaterials());
      if (!e.key || e.key === LS_UNITS_KEY)        setUnits(loadMaterialUnits());
      if (!e.key || e.key === LS_SCHEDULE_META_KEY) setHasSchedule(loadHasSchedule());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const stats = useMemo(() => computeMaterialStats(units), [units]);

  const unitsByMaterial = useMemo(() => {
    const map = {};
    units.forEach(u => {
      if (!map[u.materialId]) map[u.materialId] = [];
      map[u.materialId].push(u);
    });
    return map;
  }, [units]);

  const flash = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  // Material handlers
  const handleAddMaterial = useCallback((form) => {
    setMaterials(addMaterial(form));
    setAddMatOpen(false);
    flash('教材を追加しました');
  }, [flash]);

  const handleAddFromCatalog = useCallback((entry) => {
    addMaterialFromCatalog(entry);
    setMaterials(loadMaterials());
    setUnits(loadMaterialUnits());
    setCatalogPreview(null);
    setShowCatalogSheet(false);
    flash(`「${entry.shortTitle}」を追加しました（${entry.units.length}ユニット）`);
  }, [flash]);

  const handleEditMaterial = useCallback((form) => {
    setMaterials(editMaterial(editMatTarget.id, form));
    setEditMatTarget(null);
    flash('教材を更新しました');
  }, [editMatTarget, flash]);

  const handleDeleteMaterial = useCallback((id) => {
    deleteMaterial(id);
    setMaterials(loadMaterials());
    setUnits(loadMaterialUnits());
    flash('教材を削除しました');
  }, [flash]);

  // Unit handlers
  const handleAddUnit = useCallback((form) => {
    setUnits(addMaterialUnit(form));
    flash('ユニットを追加しました');
  }, [flash]);

  const handleEditUnit = useCallback((form) => {
    setUnits(editMaterialUnit(editUnitTarget.id, form));
    setEditUnitTarget(null);
    flash('更新しました');
  }, [editUnitTarget, flash]);

  const handleStatusChange = useCallback((unitId, status) => {
    setUnits(updateUnitStatus(unitId, status));
  }, []);

  const handleDeleteUnit = useCallback((unitId) => {
    setUnits(deleteUnit(unitId));
    flash('削除しました');
  }, [flash]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {materials.length === 0 ? (
        /* ── 教材ゼロ：カタログ選択ビュー ── */
        <CatalogView
          addedIds={addedCatalogIds}
          onPreview={setCatalogPreview}
          onCustomAdd={() => setAddMatOpen(true)}
        />
      ) : (
        <>
          {/* サマリー */}
          <SummaryStrip materials={materials} />

          {/* 教材リスト */}
          {materials.map(m => (
            <MaterialCard
              key={m.id}
              material={m}
              units={unitsByMaterial[m.id] || []}
              onAddUnit={handleAddUnit}
              onEditUnit={setEditUnitTarget}
              onDeleteUnit={handleDeleteUnit}
              onStatusChange={handleStatusChange}
              onEditMaterial={setEditMatTarget}
              onDeleteMaterial={handleDeleteMaterial}
            />
          ))}

          {/* 追加ボタン群 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowCatalogSheet(true)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '12px', borderRadius: 12, border: '1.5px solid var(--accent)',
                background: 'var(--accent-bg)', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: 700, color: 'var(--accent)',
              }}
            >
              <Icon name="book" size={15} stroke={2} /> カタログから追加
            </button>
            <button
              onClick={() => setAddMatOpen(true)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '12px', borderRadius: 12, border: '1.5px dashed var(--line-strong)',
                background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: 600, color: 'var(--ink-2)',
              }}
            >
              <Icon name="plus" size={15} stroke={2.2} /> ゼロから追加
            </button>
          </div>
        </>
      )}

      {/* 教材変更時の再生成注意 — 教材あり & スケジュール設定済み */}
      {materials.length > 0 && hasSchedule && (
        <div style={{
          padding: '12px 14px', borderRadius: 12,
          background: 'var(--warn-bg)', border: '1px solid var(--warn)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="note" size={15} stroke={1.8} style={{ color: 'var(--warn)', flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>
              <strong>教材を選び直した場合</strong>は、設定画面でスケジュールを<strong>再度生成</strong>してください。<br />
              タスクの参考教材リンクが最新の選択内容に更新されます。
            </div>
          </div>
          {onGoSettings && (
            <button
              onClick={onGoSettings}
              style={{
                alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: 'var(--warn)', color: '#fff',
                fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              }}
            >
              <Icon name="settings" size={13} stroke={2} /> スケジュールを再生成する →
            </button>
          )}
        </div>
      )}

      {/* STEP② 案内バナー — 教材あり & スケジュール未設定 */}
      {materials.length > 0 && !hasSchedule && onGoSettings && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 16px', borderRadius: 14,
          background: 'var(--accent-bg)',
          border: '1.5px solid var(--accent)',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <span style={{
                background: '#f97316', color: '#fff',
                borderRadius: 20, padding: '1px 8px',
                fontSize: 11, fontWeight: 800,
              }}>STEP②</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-1)' }}>
                次はスケジュールを設定しよう
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
              教材の選択が完了しました。設定画面で学習スケジュールを生成してください。
            </div>
          </div>
          <button
            onClick={onGoSettings}
            style={{
              flexShrink: 0, padding: '9px 14px', borderRadius: 10,
              border: 'none', background: 'var(--accent)', color: '#fff',
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            設定へ <Icon name="arrowRight" size={13} stroke={2.2} />
          </button>
        </div>
      )}

      {/* カタログプレビューシート（教材ゼロ時 or カタログから追加ボタン経由） */}
      {catalogPreview && (
        <CatalogPreviewSheet
          entry={catalogPreview}
          onAdd={handleAddFromCatalog}
          onClose={() => setCatalogPreview(null)}
        />
      )}

      {/* カタログ選択シート（教材あり時の「カタログから追加」ボタン用） */}
      {showCatalogSheet && (
        <BottomSheet title="教材カタログ" onClose={() => setShowCatalogSheet(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TEXTBOOK_CATALOG.map(entry => (
              <CatalogCard
                key={entry.id}
                entry={entry}
                alreadyAdded={addedCatalogIds.has(entry.id)}
                onPreview={(e) => { setShowCatalogSheet(false); setCatalogPreview(e); }}
              />
            ))}
          </div>
        </BottomSheet>
      )}

      {/* 教材追加シート */}
      {addMatOpen && (
        <BottomSheet title="教材を追加" onClose={() => setAddMatOpen(false)}>
          <MaterialForm onSave={handleAddMaterial} onCancel={() => setAddMatOpen(false)} />
        </BottomSheet>
      )}

      {/* 教材編集シート */}
      {editMatTarget && (
        <BottomSheet title="教材を編集" onClose={() => setEditMatTarget(null)}>
          <MaterialForm
            initial={{
              title: editMatTarget.title,
              type: editMatTarget.type,
              status: editMatTarget.status,
              memo: editMatTarget.memo || '',
            }}
            onSave={handleEditMaterial}
            onCancel={() => setEditMatTarget(null)}
          />
        </BottomSheet>
      )}

      {/* ユニット編集シート */}
      {editUnitTarget && (
        <BottomSheet title="ユニットを編集" onClose={() => setEditUnitTarget(null)}>
          <UnitForm
            materials={materials}
            initial={{
              materialId: editUnitTarget.materialId,
              subjectId: editUnitTarget.subjectId,
              topicId: editUnitTarget.topicId || '',
              chapterTitle: editUnitTarget.chapterTitle,
              pageRange: editUnitTarget.pageRange || '',
              status: editUnitTarget.status,
              estimatedMinutes: editUnitTarget.estimatedMinutes || '',
              memo: editUnitTarget.memo || '',
            }}
            onSave={handleEditUnit}
            onCancel={() => setEditUnitTarget(null)}
          />
        </BottomSheet>
      )}

      <Toast msg={toast} />
    </div>
  );
}
