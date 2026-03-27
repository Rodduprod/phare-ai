-- ============================================================
-- Migration 001 — Espace utilisateur lelabo.ai
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- Table profiles : niveau et préférences utilisateur
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level       TEXT NOT NULL DEFAULT 'débutant'
                   CHECK (level IN ('débutant', 'amateur', 'confirmé')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table saved_articles : articles mis en favoris
CREATE TABLE IF NOT EXISTS public.saved_articles (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_slug  TEXT NOT NULL,
  saved_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, article_slug)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON public.saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_slug    ON public.saved_articles(article_slug);

-- ============================================================
-- RLS (Row Level Security) — chaque utilisateur ne voit que ses données
-- ============================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

-- Profiles : lecture et modification uniquement pour l'utilisateur lui-même
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Saved articles : toutes les opérations uniquement pour l'utilisateur lui-même
CREATE POLICY "saved_select_own" ON public.saved_articles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_insert_own" ON public.saved_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_delete_own" ON public.saved_articles
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Trigger : créer un profil automatiquement à l'inscription
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'level', 'débutant')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
