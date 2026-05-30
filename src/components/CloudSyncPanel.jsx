// CloudSyncPanel.jsx — 設定ページのクラウド同期セクション
import { useState } from 'react';
import { useCloudSync } from '../lib/CloudSyncContext';

// ── スタイル定数 ──────────────────────────────────────────────────

const card = {
  background: 'var(--card-bg)',
  borderRadius: 16,
  padding: '20px 18px',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

const row = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
};

const btn = (variant = 'primary', disabled = false) => ({
  padding: '10px 18px',
  borderRadius: 10,
  border: variant === 'outline' ? '1.5px solid var(--border)' : 'none',
  background: disabled
    ? 'var(--btn-disabled-bg, #ccc)'
    : variant === 'primary'
    ? 'var(--accent)'
    : variant === 'danger'
    ? '#e53e3e'
    : 'transparent',
  color: disabled
    ? 'var(--btn-disabled-fg, #888)'
    : variant === 'outline'
    ? 'var(--text-secondary)'
    : '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  whiteSpace: 'nowrap',
});

const statusColors = {
  saving: { bg: '#fff8e1', fg: '#b7791f' },
  saved:  { bg: '#f0fff4', fg: '#276749' },
  error:  { bg: '#fff5f5', fg: '#c53030' },
  idle:   null,
};

// ── Dialog ────────────────────────────────────────────────────────

function ConfirmDialog({ message, onOk, onCancel }) {
  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  };
  const box = {
    background: 'var(--card-bg)', borderRadius: 14, padding: '24px 20px',
    maxWidth: 320, width: '90%', display: 'flex', flexDirection: 'column', gap: 16,
  };
  return (
    <div style={overlay} onClick={onCancel}>
      <div style={box} onClick={e => e.stopPropagation()}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button style={btn('outline')} onClick={onCancel}>キャンセル</button>
          <button style={btn('danger')}  onClick={onOk}>上書きする</button>
        </div>
      </div>
    </div>
  );
}

// ── WebView 検出 ──────────────────────────────────────────────────

function detectInAppBrowser() {
  const ua = navigator.userAgent || '';
  return (
    /FBAN|FBAV|Instagram|Line\/|MicroMessenger|Twitter|Snapchat/i.test(ua) ||
    (/iPhone|iPad|iPod/i.test(ua) && !/Safari\//i.test(ua) && /AppleWebKit/i.test(ua))
  );
}

function InAppBrowserWarning() {
  const url = window.location.href;
  return (
    <div style={{
      background: '#fff8e1', border: '1.5px solid #f6c90e', borderRadius: 12,
      padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#7a5f00' }}>
        ⚠️ このブラウザではGoogle ログインできません
      </p>
      <p style={{ margin: 0, fontSize: 12.5, color: '#7a5f00', lineHeight: 1.7 }}>
        LINE・Instagram・Twitterなどのアプリ内ブラウザからは
        Google 認証がブロックされます。<br />
        <strong>Safari または Chrome</strong> でこのページを開いてください。
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block', padding: '8px 14px', borderRadius: 8,
          background: '#f6c90e', color: '#5a4400',
          fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center',
        }}
      >
        Safari / Chrome で開く
      </a>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export default function CloudSyncPanel() {
  const { user, configured, saveStatus, autoLoaded, signInWithGoogle, signOut, manualSave, manualLoad } = useCloudSync();
  const [loadConfirm, setLoadConfirm] = useState(false);
  const [saveConfirm, setSaveConfirm] = useState(false);
  const [opResult,    setOpResult]    = useState(null); // { ok, msg }
  const [busy,        setBusy]        = useState(false);
  const [loginError,  setLoginError]  = useState(null);

  // ── 未設定 ───────────────────────────────────────────────────
  if (!configured) {
    return (
      <section>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>クラウド同期</h2>
        <div style={{ ...card, opacity: 0.7 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            クラウド同期を使うには Supabase の設定が必要です。<br />
            <code style={{ fontSize: 12 }}>VITE_SUPABASE_URL</code> と{' '}
            <code style={{ fontSize: 12 }}>VITE_SUPABASE_ANON_KEY</code> を
            環境変数に設定してください。
          </p>
        </div>
      </section>
    );
  }

  // ── 共通オペレーション ────────────────────────────────────────

  const doSave = async () => {
    setBusy(true); setOpResult(null);
    const { error } = await manualSave();
    setOpResult(error ? { ok: false, msg: `保存失敗：${error.message}` } : { ok: true, msg: 'クラウドに保存しました' });
    setBusy(false);
  };

  const doLoad = async () => {
    setBusy(true); setOpResult(null);
    const { error } = await manualLoad();
    setOpResult(error ? { ok: false, msg: `読み込み失敗：${error.message}` } : { ok: true, msg: 'クラウドから読み込みました' });
    setBusy(false);
  };

  // ── ステータスバッジ ─────────────────────────────────────────
  const sc = statusColors[saveStatus];
  const statusBadge = sc ? (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: sc.bg, color: sc.fg,
    }}>
      {saveStatus === 'saving' ? '保存中…' : saveStatus === 'saved' ? '保存済み ✓' : '保存失敗 ✗'}
    </span>
  ) : null;

  // ── ログイン前 ────────────────────────────────────────────────
  if (!user) {
    const isInApp = detectInAppBrowser();
    return (
      <section>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>クラウド同期</h2>
        <div style={card}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Google アカウントでログインすると学習データが自動的にクラウドに保存され、
            複数端末から同じデータを利用できます。
          </p>
          {isInApp ? (
            <InAppBrowserWarning />
          ) : (
            <>
              <button
                style={{ ...btn('primary'), alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={async () => {
                  setLoginError(null);
                  const { error } = await signInWithGoogle();
                  if (error) setLoginError(error.message);
                }}
              >
                <GoogleIcon />
                Google でログイン
              </button>
              {loginError && (
                <p style={{ margin: 0, fontSize: 12, color: '#c53030', padding: '6px 10px', background: '#fff5f5', borderRadius: 8 }}>
                  エラー：{loginError}
                </p>
              )}
            </>
          )}
        </div>
      </section>
    );
  }

  // ── ログイン後 ────────────────────────────────────────────────
  return (
    <section>
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>クラウド同期</h2>
      <div style={card}>
        {/* ユーザー情報 + ステータス */}
        <div style={row}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {user.user_metadata?.full_name || user.email}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {statusBadge}
            <button style={btn('outline')} onClick={signOut}>ログアウト</button>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
          学習データはバックグラウンドで自動保存・自動読み込みされます。<br />
          アプリを開くたびに他の端末の最新データが自動で反映されます。
        </p>
        {autoLoaded && (
          <p style={{
            margin: 0, fontSize: 13, padding: '8px 12px', borderRadius: 8,
            background: '#f0fff4', color: '#276749',
          }}>
            📱 他の端末のデータを自動で読み込みました ✓
          </p>
        )}

        {/* 操作ボタン */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={btn('primary', busy)} disabled={busy} onClick={() => setSaveConfirm(true)}>
            今すぐ保存
          </button>
          <button style={btn('outline', busy)} disabled={busy} onClick={() => setLoadConfirm(true)}>
            クラウドから読み込む
          </button>
        </div>

        {/* 操作結果 */}
        {opResult && (
          <p style={{
            margin: 0, fontSize: 13, padding: '8px 12px', borderRadius: 8,
            background: opResult.ok ? '#f0fff4' : '#fff5f5',
            color: opResult.ok ? '#276749' : '#c53030',
          }}>
            {opResult.msg}
          </p>
        )}
      </div>

      {/* 確認ダイアログ：保存 */}
      {saveConfirm && (
        <ConfirmDialog
          message="現在の学習データをクラウドに上書き保存します。クラウド側の古いデータは削除されます。続けますか？"
          onOk={() => { setSaveConfirm(false); doSave(); }}
          onCancel={() => setSaveConfirm(false)}
        />
      )}

      {/* 確認ダイアログ：読み込み */}
      {loadConfirm && (
        <ConfirmDialog
          message="クラウドのデータをこの端末に読み込みます。この端末の現在のデータは上書きされます。続けますか？"
          onOk={() => { setLoadConfirm(false); doLoad(); }}
          onCancel={() => setLoadConfirm(false)}
        />
      )}
    </section>
  );
}

// ── Google Icon (SVG) ─────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
