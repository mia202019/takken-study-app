import { useRef, useState, useMemo } from 'react';
import Icon from '../components/Icon';
import {
  generateAndSave, loadScheduleMeta, loadStudyStart,
  EXAM_DATE,
} from '../data/scheduleData';
import CloudSyncPanel from '../components/CloudSyncPanel';
import { useCloudSync } from '../lib/CloudSyncContext';

// ── Helpers ────────────────────────────────────────────────────────

function getAllTakkenData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('takken-')) {
      try { data[key] = JSON.parse(localStorage.getItem(key)); }
      catch { data[key] = localStorage.getItem(key); }
    }
  }
  return data;
}

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDateTime(iso) {
  try { return new Date(iso).toLocaleString('ja-JP'); }
  catch { return '不明'; }
}

// ── Sub-components ─────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--line)',
    }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ color: 'var(--ink-1)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────────

function ExportSection() {
  const [done, setDone] = useState(false);

  const handleExport = () => {
    const payload = {
      app: 'takken-study-tracker',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: getAllTakkenData(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `takken-study-backup-${fmtDate(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>書き出し</div>
      <button
        onClick={handleExport}
        className="tk-btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px' }}
      >
        <Icon name="log" size={16} stroke={1.8} />
        {done ? '書き出し完了 ✓' : 'JSONを書き出す'}
      </button>
      <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 6 }}>
        takken-study-backup-YYYY-MM-DD.json としてダウンロード
      </div>
    </div>
  );
}

// ── Import ─────────────────────────────────────────────────────────

function ImportSection() {
  const fileInputRef = useRef(null);
  const [state, setState] = useState('idle'); // idle | confirm | success | error
  const [pending, setPending] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const reset = () => { setState('idle'); setPending(null); setErrorMsg(''); };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.app !== 'takken-study-tracker') {
          throw new Error('このファイルは宅建学習管理アプリのバックアップではありません');
        }
        if (!parsed.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
          throw new Error('バックアップデータの形式が正しくありません');
        }
        const safeData = {};
        for (const [k, v] of Object.entries(parsed.data)) {
          if (k.startsWith('takken-')) safeData[k] = v;
        }
        if (Object.keys(safeData).length === 0) {
          throw new Error('インポート対象の takken- データがありません');
        }
        setPending({ exportedAt: parsed.exportedAt || null, data: safeData });
        setState('confirm');
        setErrorMsg('');
      } catch (err) {
        setErrorMsg(err.message || 'JSONの解析に失敗しました');
        setState('error');
      }
    };
    reader.onerror = () => { setErrorMsg('ファイルの読み込みに失敗しました'); setState('error'); };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    try {
      for (const [k, v] of Object.entries(pending.data)) {
        localStorage.setItem(k, JSON.stringify(v));
      }
      setState('success');
      setTimeout(() => window.location.reload(), 1400);
    } catch {
      setErrorMsg('データの書き込みに失敗しました。ストレージの空き容量を確認してください');
      setState('error');
    }
  };

  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>読み込み</div>

      {state === 'idle' && (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="tk-btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px' }}
          >
            <Icon name="arrowRight" size={16} stroke={1.8} /> JSONを読み込む
          </button>
          <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 6 }}>
            以前書き出したバックアップファイルを選択してください
          </div>
        </>
      )}

      {state === 'error' && (
        <div style={{ padding: '13px 14px', background: 'var(--warn-bg)', borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--warn)', marginBottom: 5 }}>
            読み込みエラー
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 12 }}>
            {errorMsg}
          </div>
          <button onClick={reset} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)',
            fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
          }}>
            もう一度試す
          </button>
        </div>
      )}

      {state === 'confirm' && pending && (
        <div style={{ padding: '14px 16px', background: 'var(--warn-bg)', borderRadius: 10, border: '1.5px solid var(--warn)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Icon name="flag" size={16} stroke={2} style={{ color: 'var(--warn)', flexShrink: 0 }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--warn)' }}>上書き確認</div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-1)', lineHeight: 1.65, marginBottom: 12 }}>
            このバックアップを読み込むと、現在のデータが上書きされます。
            <strong style={{ display: 'block', marginTop: 4 }}>この操作は元に戻せません。</strong>
          </div>
          <div style={{
            padding: '9px 12px', background: 'rgba(255,255,255,.6)',
            borderRadius: 8, fontSize: 12, color: 'var(--ink-3)',
            lineHeight: 1.7, marginBottom: 14,
          }}>
            <div>バックアップ日時：{pending.exportedAt ? fmtDateTime(pending.exportedAt) : '不明'}</div>
            <div>対象キー数：{Object.keys(pending.data).length} 件</div>
            <div style={{ marginTop: 3, wordBreak: 'break-all' }}>
              {Object.keys(pending.data).join('、')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={reset} className="tk-btn-ghost">キャンセル</button>
            <button onClick={handleConfirm} style={{
              padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'var(--warn)', color: '#fff',
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 7,
            }}>
              <Icon name="check" size={15} stroke={2.4} /> 上書きして読み込む
            </button>
          </div>
        </div>
      )}

      {state === 'success' && (
        <div style={{
          padding: '13px 14px', background: '#e8f5ec', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name="check" size={20} stroke={2.4} style={{ color: 'var(--ok)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ok)' }}>インポート完了</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>ページを再読み込みしています…</div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
}

// ── Schedule ───────────────────────────────────────────────────────

function ScheduleSection({ onGoHome }) {
  const [meta,      setMeta]      = useState(loadScheduleMeta);
  const [state,     setState]     = useState('idle'); // idle | done | error
  const [errorMsg,  setErrorMsg]  = useState('');
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [doneInfo, setDoneInfo] = useState(null); // { startDate }

  // 今日〜試験前日の範囲に制限
  const today   = fmtDate(new Date());
  const maxDate = '2026-10-17';

  // 保存済み開始日が過去なら today に補正
  const [startDate, setStartDate] = useState(() => {
    const saved = loadStudyStart();
    return saved < today ? today : saved;
  });

  const handleGenerate = () => {
    if (!startDate || startDate < today) {
      setErrorMsg('開始日は今日以降の日付を選択してください');
      setState('error');
      return;
    }
    if (startDate > maxDate) {
      setErrorMsg('開始日は2026年10月17日以前に設定してください');
      setState('error');
      return;
    }
    try {
      const result = generateAndSave(startDate);
      setMeta(result);
      setState('done');
      setDoneInfo({ startDate });
      setShowDoneModal(true);
    } catch (err) {
      setErrorMsg(err.message || 'スケジュール生成に失敗しました');
      setState('error');
    }
  };

  const handleGoHome = () => {
    setShowDoneModal(false);
    if (onGoHome) onGoHome();
  };

  const fmtPeriod = (s, e) => {
    const [sy, sm, sd] = s.split('-');
    const [ey, em, ed] = e.split('-');
    return `${sy}年${Number(sm)}月${Number(sd)}日〜${Number(em)}月${Number(ed)}日`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* 開始日設定 */}
      <div>
        {/* STEP③ 吹き出し — スケジュール未生成時のみ */}
        {!meta && state !== 'done' && (
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 10 }}>
            <div style={{
              background: '#f97316', color: '#fff',
              borderRadius: 10, padding: '8px 16px',
              fontSize: 12.5, fontWeight: 700, lineHeight: 1.5,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                background: '#fff', color: '#f97316',
                borderRadius: 20, padding: '1px 8px',
                fontSize: 11, fontWeight: 800, flexShrink: 0,
              }}>STEP③</span>
              学習開始日を選ぼう
            </div>
            <div style={{
              position: 'absolute', bottom: -8, left: 24,
              width: 0, height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #f97316',
            }} />
          </div>
        )}
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>
          学習開始日
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="date"
            value={startDate}
            min={today}
            max={maxDate}
            onChange={e => setStartDate(e.target.value)}
            style={{
              padding: '9px 12px', borderRadius: 10,
              border: '1.5px solid var(--border, #ddd)',
              background: 'var(--input-bg, #fff)',
              color: 'var(--ink-1)',
              fontSize: 14, fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
            〜 2026年10月18日（本試験日）
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 5 }}>
          今日以降の日付を選択してください。選んだ日から試験日までのタスクが生成されます。
        </div>
      </div>

      {/* 生成済みメタ情報 */}
      {meta && (
        <div style={{
          padding: '10px 14px', background: 'var(--chip-neutral-bg)', borderRadius: 10,
        }}>
          <InfoRow label="生成済み期間"   value={fmtPeriod(meta.startDate, meta.endDate)} />
          <InfoRow label="最終生成日時"   value={fmtDateTime(meta.generatedAt)} />
          <InfoRow label="生成済みタスク" value={`${meta.taskCount} 件`} />
          {meta.newCount === 0 && (
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 6 }}>
              ※ 最後の生成で新規追加はありませんでした
            </div>
          )}
        </div>
      )}

      {/* 生成ボタン */}
      {state !== 'error' ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          {/* STEP④ 吹き出し — スケジュール未生成時のみ */}
          {!meta && state !== 'done' && (
            <div style={{ position: 'relative' }}>
              <div style={{
                background: '#f97316', color: '#fff',
                borderRadius: 10, padding: '8px 16px',
                fontSize: 12.5, fontWeight: 700, lineHeight: 1.5,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{
                  background: '#fff', color: '#f97316',
                  borderRadius: 20, padding: '1px 8px',
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                }}>STEP④</span>
                生成ボタンを押そう
              </div>
              <div style={{
                position: 'absolute', bottom: -8, left: 24,
                width: 0, height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #f97316',
              }} />
            </div>
          )}
          <button
            onClick={handleGenerate}
            className="tk-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px' }}
          >
            <Icon name="map" size={16} stroke={1.8} />
            {state === 'done' ? '生成完了 ✓' : meta ? 'スケジュールを再生成する' : '学習タスクを生成する'}
          </button>
        </div>
      ) : (
        <div style={{ padding: '13px 14px', background: 'var(--warn-bg)', borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--warn)', marginBottom: 5 }}>生成エラー</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 12 }}>{errorMsg}</div>
          <button onClick={() => setState('idle')} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'var(--chip-neutral-bg)', color: 'var(--ink-2)',
            fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
          }}>
            もう一度試す
          </button>
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 8,
        fontSize: 11.5, color: 'var(--ink-4)', lineHeight: 1.55,
      }}>
        <Icon name="note" size={13} stroke={1.7} style={{ marginTop: 1, flexShrink: 0 }} />
        <span>
          既存タスク・手動追加タスクは上書きされません。<br />
          同じ日付・同じタイトルのタスクは重複作成されません。
        </span>
      </div>

      {/* ── 生成完了モーダル ── */}
      {showDoneModal && doneInfo && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(30,24,16,.5)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, animation: 'tkFade .2s ease',
          }}
          onClick={handleGoHome}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 360,
              background: 'var(--surface)', borderRadius: 20,
              padding: '32px 28px 28px',
              boxShadow: '0 20px 60px rgba(30,24,16,.22)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              animation: 'tkSheetUp .28s cubic-bezier(.2,.8,.2,1)',
            }}
          >
            {/* ✓ アイコン */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#e8f5ec',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 4,
            }}>
              <Icon name="check" size={32} stroke={2.4} style={{ color: 'var(--ok)' }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink-1)', marginBottom: 10 }}>
                スケジュール生成完了！
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.75 }}>
                {(() => {
                  const [y, m, d] = doneInfo.startDate.split('-');
                  return `${Number(m)}月${Number(d)}日`;
                })()}から本試験日まで、<br />
                毎日の学習タスクをホーム画面に<br />
                表示します。
              </div>
            </div>

            <button
              onClick={handleGoHome}
              style={{
                marginTop: 8, width: '100%',
                padding: '14px', borderRadius: 12, border: 'none',
                background: 'var(--accent)', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Icon name="home" size={17} stroke={2} /> ホームで確認する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Data Reset Section ────────────────────────────────────────────

function DataResetSection() {
  const { manualSave } = useCloudSync();
  const [step, setStep] = useState(0); // 0=通常 1=1回目確認 2=2回目確認 3=完了

  const handleReset = async () => {
    // takken- プレフィックスのキーをすべて削除
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('takken-')) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));

    // クラウドにも空状態を保存（上書き）
    if (manualSave) await manualSave();

    // UIを更新
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    setStep(3);
  };

  if (step === 3) {
    return (
      <div style={{
        padding: '14px 16px', borderRadius: 10,
        background: '#f0fff4', border: '1.5px solid var(--ok)',
        fontSize: 13, color: '#276749', fontWeight: 600,
      }}>
        ✓ データをリセットしました。ページを再読み込みしてください。
        <button
          onClick={() => window.location.reload()}
          style={{
            display: 'block', marginTop: 10, padding: '8px 16px', borderRadius: 8,
            border: 'none', cursor: 'pointer', background: 'var(--ok)', color: '#fff',
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
          }}
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{
        padding: '16px', borderRadius: 10,
        background: '#fff5f5', border: '1.5px solid #e53e3e',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#c53030' }}>
          ⚠️ 最終確認：本当にリセットしますか？
        </p>
        <p style={{ margin: 0, fontSize: 12.5, color: '#742a2a', lineHeight: 1.7 }}>
          スケジュール・間違いノート・復習データ・教材記録など、
          このアカウントのすべての学習データが<strong>完全に削除</strong>されます。<br />
          この操作は取り消せません。
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setStep(0)}
            style={{
              flex: 1, padding: '10px', borderRadius: 9, border: '1.5px solid var(--line)',
              background: 'var(--surface)', color: 'var(--ink-2)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleReset}
            style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none',
              background: '#e53e3e', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            すべて削除する
          </button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div style={{
        padding: '16px', borderRadius: 10,
        background: '#fffaf0', border: '1.5px solid #dd6b20',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#c05621' }}>
          データをリセットしますか？
        </p>
        <p style={{ margin: 0, fontSize: 12.5, color: '#7b341e', lineHeight: 1.7 }}>
          このアカウントの学習データがすべて削除されます。<br />
          クラウド上のデータも上書きされます。
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setStep(0)}
            style={{
              flex: 1, padding: '10px', borderRadius: 9, border: '1.5px solid var(--line)',
              background: 'var(--surface)', color: 'var(--ink-2)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            キャンセル
          </button>
          <button
            onClick={() => setStep(2)}
            style={{
              flex: 1, padding: '10px', borderRadius: 9, border: 'none',
              background: '#dd6b20', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            続ける →
          </button>
        </div>
      </div>
    );
  }

  // step === 0
  return (
    <button
      onClick={() => setStep(1)}
      style={{
        width: '100%', padding: '11px', borderRadius: 10,
        border: '1.5px solid #fc8181', background: 'transparent',
        color: '#e53e3e', fontSize: 13, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      <Icon name="trash" size={15} stroke={2} />
      データをリセット
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function SettingsPage({ onGoHome }) {
  const keyCount = useMemo(() => {
    let n = 0;
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith('takken-')) n++;
    }
    return n;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Cloud Sync section */}
      <div className="tk-card" style={{ borderTop: '3px solid #4285F4' }}>
        <CloudSyncPanel />
      </div>

      {/* Schedule section */}
      <div className="tk-card" style={{ borderTop: '3px solid var(--ok)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>学習スケジュール</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.65, marginBottom: 18 }}>
          任意の開始日〜2026年10月18日（本試験日）の日次学習タスクを自動生成します。<br />
          フェーズごとに科目・タスク種別を切り替え、毎日「何をやるか」をガイドします。
        </div>
        <ScheduleSection onGoHome={onGoHome} />
      </div>

      {/* Backup section */}
      <div className="tk-card" style={{ borderTop: '3px solid var(--accent)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>データバックアップ</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.65, marginBottom: 18 }}>
          このアプリはブラウザ内にデータを保存しています。定期的にバックアップしてください。
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', background: 'var(--chip-neutral-bg)',
          borderRadius: 10, marginBottom: 20,
        }}>
          <Icon name="note" size={16} stroke={1.7} style={{ color: 'var(--ink-3)' }} />
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            保存中のデータ：<strong>{keyCount} キー</strong>
          </span>
        </div>

        <ExportSection />

        <div style={{ height: 1, background: 'var(--line)', margin: '20px 0' }} />

        <ImportSection />
      </div>

      {/* About section */}
      <div className="tk-card">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>このアプリについて</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <InfoRow label="バージョン"     value="1.0.0" />
          <InfoRow label="対象試験"       value="宅地建物取引士（2026年度）" />
          <InfoRow label="本試験日"       value="2026年10月18日（日）" />
          <InfoRow label="データ保存先"   value="ブラウザ（localStorage）" />
          <InfoRow label="データ同期"     value="Googleアカウントでクラウド自動同期" />
        </div>
      </div>

      {/* Data reset */}
      <div className="tk-card">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#c53030' }}>データリセット</div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.65, marginBottom: 14, margin: '0 0 14px' }}>
          このアカウントのすべての学習データを削除します。
        </p>
        <DataResetSection />
      </div>

      {/* Data notes */}
      <div className="tk-card">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>データ管理の注意</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Googleアカウントでログインするとデータが自動でクラウド保存され、複数端末で同期できます',
            'ブラウザのキャッシュ削除やプライベートモードではローカルデータが消える場合があります。Googleログインで保護することをお勧めします',
            '教材の本文・問題文・解説を記録する場合は、個人学習用として管理してください。公開・共有・販売する場合は、著作権のある内容を含めないでください。',
          ].map((note, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, width: 18, height: 18, borderRadius: 18,
                background: 'var(--chip-neutral-bg)', color: 'var(--ink-3)',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 1,
              }}>{i + 1}</span>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
