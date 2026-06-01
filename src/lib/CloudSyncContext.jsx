// CloudSyncContext.jsx — Google Auth + debounce auto-save + auto-load on focus
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { saveToCloud, loadFromCloud, restoreLocalStorage, getCloudUpdatedAt } from '../data/cloudSyncData';

const DEBOUNCE_MS     = 2500;
const LS_PREFIX       = 'takken-';
// 同期用メタキー（'takken-' で始まらないのでクラウド同期対象外）
const LS_SYNC_TS_KEY  = '_takken_last_cloud_ts';
const LS_OWNER_KEY    = '_takken_local_owner';   // どのアカウントのデータか

// ── Context ──────────────────────────────────────────────────────

const CloudSyncContext = createContext(null);

export function useCloudSync() {
  return useContext(CloudSyncContext);
}

// ── ローカルデータを全消去 ────────────────────────────────────────

function clearLocalTakkenData() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(LS_PREFIX)) keys.push(k);
  }
  keys.forEach(k => localStorage.removeItem(k));
  localStorage.removeItem(LS_SYNC_TS_KEY);
}

// ── Provider ─────────────────────────────────────────────────────

export function CloudSyncProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [saveStatus,  setSaveStatus]  = useState('idle');
  const [autoLoaded,  setAutoLoaded]  = useState(false);
  const [configured,  setConfigured]  = useState(false);
  const debounceRef  = useRef(null);
  const checkingRef  = useRef(false);

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

  // ── アカウント切り替え検知 → データ差し替え ─────────────────
  useEffect(() => {
    if (!user) return;

    const localOwner = localStorage.getItem(LS_OWNER_KEY);

    if (localOwner && localOwner !== user.id) {
      // 別アカウントのデータが残っている → ローカルを消してクラウドから読み込む
      if (debounceRef.current) clearTimeout(debounceRef.current); // 保存キャンセル
      clearLocalTakkenData();
      localStorage.setItem(LS_OWNER_KEY, user.id);

      loadFromCloud(user.id).then(({ data, updatedAt, error }) => {
        if (!error && data) {
          restoreLocalStorage(data);
          if (updatedAt) localStorage.setItem(LS_SYNC_TS_KEY, updatedAt);
          setAutoLoaded(true);
          setTimeout(() => setAutoLoaded(false), 4000);
        }
        // クラウドにデータなし = このアカウントは初回 → 空の状態で開始
      });
    } else {
      // 同じアカウント（または初回）→ オーナーを記録してタイムスタンプ比較
      localStorage.setItem(LS_OWNER_KEY, user.id);
      checkAndAutoLoad(user.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── 画面がアクティブになったとき自動読み込み ─────────────────
  const checkAndAutoLoad = useCallback(async (userId) => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    try {
      const { updatedAt } = await getCloudUpdatedAt(userId);
      if (!updatedAt) return;
      const localTs = localStorage.getItem(LS_SYNC_TS_KEY) || '';
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
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkAndAutoLoad(user.id);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, checkAndAutoLoad]);

  // 60秒おきに定期チェック（アプリを開きっぱなしでも更新を検知）
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') checkAndAutoLoad(user.id);
    }, 60_000);
    return () => clearInterval(interval);
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
    localStorage.removeItem(LS_OWNER_KEY);
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
    user, configured, saveStatus, autoLoaded,
    signInWithGoogle, signOut, manualSave, manualLoad,
  };

  return (
    <CloudSyncContext.Provider value={value}>
      {children}
    </CloudSyncContext.Provider>
  );
}
