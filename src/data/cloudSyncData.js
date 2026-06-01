// cloudSyncData.js — localStorage ↔ Supabase 同期ロジック
// Table: user_app_data (id uuid, user_id uuid, app_name text, app_data jsonb, updated_at timestamptz)
// unique(user_id, app_name)

import { supabase } from '../lib/supabaseClient';

const APP_NAME     = 'takken-study-app';
const LS_PREFIX    = 'takken-';  // この接頭辞で始まるキーだけ同期

// ── localStorage 収集 / 復元 ──────────────────────────────────────

/** takken-* キーをまとめてオブジェクトに */
export function collectTakkenData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(LS_PREFIX)) {
      try { data[k] = JSON.parse(localStorage.getItem(k)); }
      catch { data[k] = localStorage.getItem(k); }
    }
  }
  return data;
}

/** クラウドデータを localStorage に書き戻す（失敗時は既存データを保持） */
export function restoreLocalStorage(data) {
  if (!data || typeof data !== 'object') return;
  try {
    Object.entries(data).forEach(([k, v]) => {
      if (k.startsWith(LS_PREFIX)) {
        localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      }
    });
    // UI 再描画を促すため storage イベントを発火（key: null で全コンポーネントに通知）
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  } catch (err) {
    console.error('[CloudSync] restoreLocalStorage failed:', err);
    throw err; // 呼び出し元でハンドリング
  }
}

// ── Supabase CRUD ─────────────────────────────────────────────────

/**
 * 現在の takken-* データをクラウドに保存（upsert）
 * @returns {{ error: Error|null }}
 */
export async function saveToCloud(userId) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  const app_data = collectTakkenData();
  const { error } = await supabase
    .from('user_app_data')
    .upsert(
      { user_id: userId, app_name: APP_NAME, app_data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,app_name' }
    );
  return { error: error || null };
}

/**
 * クラウドからデータを取得
 * @returns {{ data: object|null, updatedAt: string|null, error: Error|null }}
 */
export async function loadFromCloud(userId) {
  if (!supabase) return { data: null, updatedAt: null, error: new Error('Supabase not configured') };
  const { data, error } = await supabase
    .from('user_app_data')
    .select('app_data, updated_at')
    .eq('user_id', userId)
    .eq('app_name', APP_NAME)
    .maybeSingle();
  if (error) return { data: null, updatedAt: null, error };
  return { data: data?.app_data || null, updatedAt: data?.updated_at || null, error: null };
}

/**
 * クラウドの updated_at だけ取得（差分チェック用・軽量）
 * @returns {{ updatedAt: string|null, error: Error|null }}
 */
export async function getCloudUpdatedAt(userId) {
  if (!supabase) return { updatedAt: null, error: new Error('Supabase not configured') };
  const { data, error } = await supabase
    .from('user_app_data')
    .select('updated_at')
    .eq('user_id', userId)
    .eq('app_name', APP_NAME)
    .maybeSingle();
  if (error) return { updatedAt: null, error };
  return { updatedAt: data?.updated_at || null, error: null };
}
