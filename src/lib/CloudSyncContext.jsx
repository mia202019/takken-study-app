// CloudSyncContext.jsx — Google Auth + debounce auto-save + auto-load on focus
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { saveToCloud, loadFromCloud, restoreLocalStorage, getCloudUpdatedAt } from '../data/cloudSyncData';

const DEBOUNCE_MS    = 2500;   // 自動保存デバウンス（ms）
const LS_PREFIX      = 'takken-';
// クラウド同期タイムスタンプ（このキーは 'takken-' で始まらないので同期対象外）
const LS_SYNC_TS_KEY = '_takken_last_cloud_ts';

// ── Context ──────────────────────────────────────────────────────

const CloudSyncContext = createContext(null);

export function useCloudSync() {
  return useContext(CloudSyncContext);
}

// ── Provider ─────────────────────────────────────────────────────

export function CloudSyncProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [saveStatus,  setSaveStatus]  = useState('idle'); // 'idle'|'saving'|'saved'|'error'
  const [autoLoaded,  setAutoLoaded]  = useState(false);  // 自動読み込み通知
  const [configured,  setConfigured]  = useState(false);
  const debounceRef  = useRef(null);
  const checkingRef  = useRef(false);  // 重複チェック防止

  // ── 初期化：セッション取得 + AuthState 監視 ───────────────────
  useEffect(() => {
    if (!isSupabaseConfigured()) { setConfigured(false); return; }
    setConfigured(true);

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        window.dispatchEvent(new CustomEvent('takken-signed-in'));
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // ── デバウンス auto-save ──────────────────────────────────────
  const triggerAutoSave = useCallback((userId) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveStatus('saving');
    debounceRef.current = setTimeout(async () => {
      const { error } = await saveToCloud(userId);
      if (error) {
        setSaveStatus('error');
      } else {
        // 保存成功 → タイムスタンプ記録
        localStorage.setItem(LS_SYNC_TS_KEY, new Date().toISOString());
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, DEBOUNCE_MS);
  }, []);

  // localStorage 変更を監視して auto-save
  useEffect(() => {
    if (!user) return;
    const handler = (e) => {
      if (e.key === null || (e.key && e.key.startsWith(LS_PREFIX))) {
        triggerAutoSave(user.id);
      }
    };
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('storage', handler);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user, triggerAutoSave]);

  // ── 画面がアクティブになったとき自動読み込み ─────────────────
  const checkAndAutoLoad = useCallback(async (userId) => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    try {
      const { updatedAt } = await getCloudUpdatedAt(userId);
      if (!updatedAt) return;

      const localTs = localStorage.getItem(LS_SYNC_TS_KEY) || '';
      // クラウドが新しい場合のみ自動読み込み
      if (updatedAt > localTs) {
        const { data, error } = await loadFromCloud(userId);
        if (!error && data) {
          restoreLocalStorage(data);
          localStorage.setItem(LS_SYNC_TS_KEY, updatedAt);
          setAutoLoaded(true);
          setTimeout(() => setAutoLoaded(false), 4000);
        }
      }
    } finally {
      checkingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    // ログイン直後に一度チェック
    checkAndAutoLoad(user.id);

    // ページがフォアグラウンドに戻ったときにチェック
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndAutoLoad(user.id);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, checkAndAutoLoad]);

  // ── 公開 API ─────────────────────────────────────────────────

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error: error || null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    localStorage.removeItem(LS_SYNC_TS_KEY);
    await supabase.auth.signOut();
  }, []);

  const manualSave = useCallback(async () => {
    if (!user) return { error: new Error('Not logged in') };
    setSaveStatus('saving');
    const { error } = await saveToCloud(user.id);
    if (error) { setSaveStatus('error'); return { error }; }
    localStorage.setItem(LS_SYNC_TS_KEY, new Date().toISOString());
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
    return { error: null };
  }, [user]);

  const manualLoad = useCallback(async () => {
    if (!user) return { error: new Error('Not logged in') };
    const { data, updatedAt, error } = await loadFromCloud(user.id);
    if (error) return { error };
    if (!data) return { error: new Error('クラウドにデータが見つかりません') };
    try {
      restoreLocalStorage(data);
      if (updatedAt) localStorage.setItem(LS_SYNC_TS_KEY, updatedAt);
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }, [user]);

  const value = {
    user,
    configured,
    saveStatus,
    autoLoaded,
    signInWithGoogle,
    signOut,
    manualSave,
    manualLoad,
  };

  return (
    <CloudSyncContext.Provider value={value}>
      {children}
    </CloudSyncContext.Provider>
  );
}
