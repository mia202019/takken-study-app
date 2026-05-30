import { useRef, useState, useMemo } from 'react';
import Icon from '../components/Icon';
import {
  generateAndSave, loadScheduleMeta, loadStudyStart,
  EXAM_DATE,
} from '../data/scheduleData';
import CloudSyncPanel from '../components/CloudSyncPanel';

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

function ScheduleSection() {
  const [meta,      setMeta]      = useState(loadScheduleMeta);
  const [startDate, setStartDate] = useState(loadStudyStart);
  const [state,     setState]     = useState('idle'); // idle | done | error
  const [errorMsg,  setErrorMsg]  = useState('');

  // 今日〜試験前日の範囲に制限
  const today   = fmtDate(new Date());
  const maxDate = '2026-10-17';

  const handleGenerate = () => {
    if (!startDate || startDate > maxDate) {
      setErrorMsg('開始日は2026年10月17日以前に設定してください');
      setState('error');
      return;
    }
    try {
      const result = generateAndSave(startDate);
      setMeta(result);
      setState('done');
      setTimeout(() => setState('idle'), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'スケジュール生成に失敗しました');
      setState('error');
    }
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
        <button
          onClick={handleGenerate}
          className="tk-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', alignSelf: 'flex-start' }}
        >
          <Icon name="map" size={16} stroke={1.8} />
          {state === 'done' ? '生成完了 ✓' : meta ? 'スケジュールを再生成する' : '学習タスクを生成する'}
        </button>
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
          同じ日付・同じタイトルのタスクは重複作成されません。<br />
          生成後、ホームの「今日の学習」に当日のタスクが表示されます。
        </span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function SettingsPage() {
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

      {/* Schedule section */}
      <div className="tk-card" style={{ borderTop: '3px solid var(--ok)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>学習スケジュール</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.65, marginBottom: 18 }}>
          任意の開始日〜2026年10月18日（本試験日）の日次学習タスクを自動生成します。<br />
          フェーズごとに科目・タスク種別を切り替え、毎日「何をやるか」をガイドします。
        </div>
        <ScheduleSection />
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
