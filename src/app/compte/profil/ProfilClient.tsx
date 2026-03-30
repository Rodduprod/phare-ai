'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Props {
  user: { email: string; id: string };
  profile: { level: string; created_at: string };
  savedArticles: { article_slug: string; saved_at: string }[];
  enrollments: { module_slug: string; enrolled_at: string }[];
  progressCount: number;
}

// ─── XP System ────────────────────────────────────────────────────────────────
const XP_PER_LESSON = 10;

interface XpTier {
  label: string;
  icon: string;
  minXp: number;
  maxXp: number | null; // null = dernier palier
  color: string;
}

const XP_TIERS: XpTier[] = [
  { label: "Novice",      icon: "🌱", minXp: 0,   maxXp: 49,  color: "text-green-600 bg-green-50 border-green-200" },
  { label: "Apprenti",    icon: "⚡", minXp: 50,  maxXp: 149, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { label: "Explorateur", icon: "🔭", minXp: 150, maxXp: 299, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { label: "Chercheur",   icon: "🔬", minXp: 300, maxXp: 499, color: "text-orange-600 bg-orange-50 border-orange-200" },
  { label: "Expert",      icon: "🏆", minXp: 500, maxXp: null, color: "text-yellow-700 bg-yellow-50 border-yellow-300" },
];

function getXpTier(xp: number): { current: XpTier; pct: number; xpToNext: number | null } {
  const current = [...XP_TIERS].reverse().find((t) => xp >= t.minXp) ?? XP_TIERS[0];
  const next = XP_TIERS[XP_TIERS.indexOf(current) + 1] ?? null;
  const pct = next
    ? Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100)
    : 100;
  const xpToNext = next ? next.minXp - xp : null;
  return { current, pct, xpToNext };
}

const LEVELS = [
  { value: "débutant",  label: "Débutant",     icon: "🌱" },
  { value: "amateur",   label: "Intermédiaire", icon: "⚡" },
  { value: "confirmé",  label: "Expert",        icon: "🔬" },
] as const;

export function ProfilClient({ user, profile, savedArticles, enrollments, progressCount }: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [level, setLevel] = useState(profile.level);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Calcul XP
  const totalXp = progressCount * XP_PER_LESSON;
  const { current: xpTier, pct: xpPct, xpToNext } = getXpTier(totalXp);

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

      {/* Progression XP */}
      <div className="bg-bg-alt rounded-xl p-6">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
          Ma progression
        </h2>
        {/* Badge niveau XP */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold mb-4 ${xpTier.color}`}>
          <span>{xpTier.icon}</span>
          <span>{xpTier.label}</span>
          <span className="opacity-70 font-normal">· {totalXp} XP</span>
        </div>
        {/* Barre de progression */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-text-muted">
            <span>{xpTier.label}</span>
            {xpToNext !== null ? (
              <span>Prochain palier dans {xpToNext} XP</span>
            ) : (
              <span className="text-yellow-700 font-medium">Niveau max atteint 🏆</span>
            )}
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-primary">{progressCount}</div>
            <div className="text-xs text-text-muted mt-0.5">leçon{progressCount !== 1 ? "s" : ""} complétée{progressCount !== 1 ? "s" : ""}</div>
          </div>
          <div className="bg-white rounded-lg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-primary">{totalXp}</div>
            <div className="text-xs text-text-muted mt-0.5">points XP</div>
          </div>
        </div>
        {progressCount === 0 && (
          <p className="text-xs text-text-muted mt-3 text-center">
            Complète ta première leçon pour gagner tes premiers XP !{" "}
            <Link href="/formation" className="text-primary hover:underline">Commencer →</Link>
          </p>
        )}
      </div>

      {/* Formation */}
      {enrollments.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
            Ma formation ({progressCount} leçon{progressCount > 1 ? "s" : ""} complétée{progressCount > 1 ? "s" : ""})
          </h2>
          <ul className="space-y-2">
            {enrollments.map(({ module_slug, enrolled_at }) => (
              <li key={module_slug}>
                <Link
                  href={`/formation/${module_slug}`}
                  className="flex items-center justify-between bg-bg-alt rounded-lg px-4 py-3 hover:bg-primary/5 transition-colors"
                >
                  <span className="text-sm text-text hover:text-primary transition-colors">
                    {module_slug.replace(/-/g, ' ')}
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(enrolled_at).toLocaleDateString("fr-FR")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/formation" className="text-xs text-primary hover:underline mt-2 inline-block">
            Voir tous les modules →
          </Link>
        </div>
      )}

      {enrollments.length === 0 && (
        <div className="bg-bg-alt rounded-xl p-5 text-center">
          <p className="text-text-muted text-sm mb-3">Vous n&apos;avez pas encore commencé de formation.</p>
          <Link href="/formation" className="text-primary text-sm font-medium hover:underline">
            Découvrir les modules →
          </Link>
        </div>
      )}

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
