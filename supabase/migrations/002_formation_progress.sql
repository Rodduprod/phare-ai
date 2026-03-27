-- ============================================================
-- Migration 002 — Suivi de progression formation
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- Progression par leçon
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_path   TEXT NOT NULL, -- ex: "comprendre-ia-debutant/01-quest-ce-que-l-ia"
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_path)
);

-- Inscriptions aux modules
CREATE TABLE IF NOT EXISTS public.user_enrollments (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_slug  TEXT NOT NULL,
  enrolled_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, module_slug)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_progress_user    ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson  ON public.user_progress(lesson_path);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.user_enrollments(user_id);

-- RLS
ALTER TABLE public.user_progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_select_own"   ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_insert_own"   ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_upsert_own"   ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "enroll_select_own"     ON public.user_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "enroll_insert_own"     ON public.user_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "enroll_upsert_own"     ON public.user_enrollments FOR UPDATE USING (auth.uid() = user_id);
