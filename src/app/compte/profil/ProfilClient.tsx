'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Props {
  user: { email: string; id: string };
  profile: { level: string; created_at: string };
  savedArticles: { article_slug: string; saved_at: string }[];
}

const LEVELS = [
  { value: "débutant",  label: "Débutant",     icon: "🌱" },
  { value: "amateur",   label: "Intermédiaire", icon: "⚡" },
  { value: "confirmé",  label: "Expert",        icon: "🔬" },
] as const;

export function ProfilClient({ user, profile, savedArticles }: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [level, setLevel] = useState(profile.level);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleSaveLevel() {
    setSaving(true);
    await supabase
      .from("profiles")
      .upsert({ id: user.id, level, updated_at: new Date().toISOString() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleRemoveSaved(slug: string) {
    await supabase
      .from("saved_articles")
      .delete()
      .eq("user_id", user.id)
      .eq("article_slug", slug);
    router.refresh();
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* En-tête profil */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <span className="text-3xl">🧑‍🔬</span>
        </div>
        <h1 className="font-display text-2xl text-text font-bold">{user.email}</h1>
        <p className="text-text-muted text-sm mt-1">Membre depuis {memberSince}</p>
      </div>

      {/* Niveau */}
      <div className="bg-bg-alt rounded-xl p-6">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
          Mon niveau en IA
        </h2>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLevel(l.value)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                level === l.value
                  ? "border-primary bg-white"
                  : "border-transparent bg-white hover:border-primary/40"
              }`}
            >
              <div className="text-xl mb-1">{l.icon}</div>
              <div className="text-xs font-semibold text-text">{l.label}</div>
            </button>
          ))}
        </div>
        <button
          onClick={handleSaveLevel}
          disabled={saving || level === profile.level}
          className="w-full py-2 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Sauvegarde…" : saved ? "✓ Sauvegardé !" : "Sauvegarder"}
        </button>
      </div>

      {/* Articles sauvegardés */}
      <div>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
          Articles sauvegardés ({savedArticles.length})
        </h2>
        {savedArticles.length === 0 ? (
          <div className="text-center py-8 bg-bg-alt rounded-xl">
            <p className="text-text-muted text-sm">Aucun article sauvegardé pour l&apos;instant.</p>
            <Link href="/articles" className="text-primary text-sm hover:underline mt-2 inline-block">
              Parcourir les articles →
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {savedArticles.map(({ article_slug, saved_at }) => (
              <li key={article_slug} className="flex items-center justify-between bg-bg-alt rounded-lg px-4 py-3">
                <Link
                  href={`/articles/${article_slug}`}
                  className="text-sm text-text hover:text-primary transition-colors truncate mr-3"
                >
                  {article_slug.replace(/--?(debutant|amateur|confirme)$/, '').replace(/-/g, ' ')}
                </Link>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-text-muted">
                    {new Date(saved_at).toLocaleDateString("fr-FR")}
                  </span>
                  <button
                    onClick={() => handleRemoveSaved(article_slug)}
                    className="text-text-muted hover:text-red-500 transition-colors text-lg leading-none"
                    title="Retirer des favoris"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Déconnexion */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full py-2 px-4 text-sm text-text-muted hover:text-red-600 border border-border hover:border-red-200 rounded-lg transition-colors disabled:opacity-50"
        >
          {loggingOut ? "Déconnexion…" : "Se déconnecter"}
        </button>
      </div>
    </div>
  );
}
