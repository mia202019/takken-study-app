// CloudSyncContext.jsx — Google Auth + debounce auto-save
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { saveToCloud, loadFromCloud, restoreLocalStorage } from '../data/cloudSyncData';

const DEBOUNCE_MS = 2500;          // 2.5 秒デバウンス
const LS_PREFIX   = 'takken-';

// ── Context ──────────────────────────────────────────────────────

const CloudSyncContext = createContext(null);

export function useCloudSync() {
  return useContext(CloudSyncContext);
}

// ── Provider ─────────────────────────────────────────────────────

export function CloudSyncProvider({ children }) {
  const [user,       setUser]       = useState(null);   // Supabase User | null
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [configured, setConfigured] = useState(false);
  const debounceRef = useRef(null);
  const saveErrRef  = useRef(null);

  // ── 初期化：セッション取得 + AuthState 監視 ───────────────────
  useEffect(() => {
    if (!isSupabaseConfigured()) { setConfigured(false); return; }
    setConfigured(true);

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
        saveErrRef.current = error;
        setSaveStatus('error');
      } else {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, DEBOUNCE_MS);
  }, []);

  // localStorage 変更を監視（same-tab も storageEvent で通知される）
  useEffect(() => {
    if (!user) return;
    const handler = (e) => {
      // null key = 全消去、or takken- キーの変更
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

  // ── 公開 API ─────────────────────────────────────────────────

  /** Google OAuth ログイン */
  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    const redirectTo = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    return { error: error || null };
  }, []);

  /** ログアウト */
  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  /** 手動クラウド保存 */
  const manualSave = useCallback(async () => {
    if (!user) return { error: new Error('Not logged in') };
    setSaveStatus('saving');
    const { error } = await saveToCloud(user.id);
    if (error) { setSaveStatus('error'); return { error }; }
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
    return { error: null };
  }, [user]);

  /** 手動クラウドから読み込み（既存データを上書き） */
  const manualLoad = useCallback(async () => {
    if (!user) return { error: new Error('Not logged in') };
    const { data, error } = await loadFromCloud(user.id);
    if (error) return { error };
    if (!data) return { error: new Error('クラウドにデータが見つかりません') };
    try {
      restoreLocalStorage(data);
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }, [user]);

  const value = {
    user,
    configured,
    saveStatus,
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
