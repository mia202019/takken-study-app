-- ============================================================
-- Supabase セットアップ SQL
-- Supabase ダッシュボード > SQL Editor で実行してください。
-- ============================================================

-- テーブル作成
CREATE TABLE IF NOT EXISTS public.user_app_data (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_name   TEXT NOT NULL,
  app_data   JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, app_name)
);

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_app_data_updated_at ON public.user_app_data;
CREATE TRIGGER trg_user_app_data_updated_at
  BEFORE UPDATE ON public.user_app_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.user_app_data ENABLE ROW LEVEL SECURITY;

-- 自分の行だけ SELECT 可能
CREATE POLICY "Users can read own data"
  ON public.user_app_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- 自分の行だけ INSERT 可能
CREATE POLICY "Users can insert own data"
  ON public.user_app_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分の行だけ UPDATE 可能
CREATE POLICY "Users can update own data"
  ON public.user_app_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 自分の行だけ DELETE 可能
CREATE POLICY "Users can delete own data"
  ON public.user_app_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 確認クエリ（実行後に RLS が有効か確認）
-- ============================================================
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE tablename = 'user_app_data';
