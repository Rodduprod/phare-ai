-- ===========================================
-- Signal IA — Supabase Schema
-- À exécuter dans l'éditeur SQL de Supabase
-- ===========================================

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'website',
  unsubscribed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index pour les recherches par email
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (email);

-- Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Politique : l'anon key peut uniquement insérer (signup)
CREATE POLICY "Allow anonymous inserts" ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Politique : seul le service_role peut lire/modifier (admin, agent)
CREATE POLICY "Service role full access" ON newsletter_subscribers
  FOR ALL
  USING (auth.role() = 'service_role');

-- ===========================================
-- Future: analytics table (page views, etc.)
-- ===========================================
-- CREATE TABLE IF NOT EXISTS page_views (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   path TEXT NOT NULL,
--   referrer TEXT,
--   user_agent TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );
