'use client';

import Link from "next/link";
import { ModuleIllustration } from "@/components/formation/ModuleIllustration";
import { ArticleLevel, ArticleGroup, levelConfig } from "@/lib/articles-types";
import { formatDuration, LEVEL_COLORS } from "@/lib/formation-utils";
import { ArticleGroupCard } from "@/components/ArticleGroupCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { LevelFilter } from "@/components/LevelFilter";
import { useState, useMemo } from "react";

interface ModuleMeta {
  slug: string;
  title: string;
  description: string;
  level: string;
  duration: number;
  image: string;
  lessonCount: number;
}

interface Stats {
  articles: number;
  modules: number;
  lessons: number;
}

interface ClientHomePageProps {
  groups: ArticleGroup[];
  modules: ModuleMeta[];
  stats: Stats;
}

const LEVEL_BORDER: Record<string, string> = {
  débutant: "border-l-4 border-l-primary",
  amateur:  "border-l-4 border-l-primary",
  confirmé: "border-l-4 border-l-primary",
};

export function ClientHomePage({ groups, modules, stats }: ClientHomePageProps) {
  const [selectedLevel, setSelectedLevel] = useState<ArticleLevel | 'all'>('all');
  const ARTICLES_LIMIT = 6;

  const articleCounts = useMemo(() => {
    const counts = { débutant: 0, amateur: 0, confirmé: 0 } as Record<ArticleLevel, number>;
    groups.forEach(g => g.versions.forEach(v => { counts[v.level]++; }));
    return counts;
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const filtered = selectedLevel === 'all'
      ? groups
      : groups.filter(g => g.versions.some(v => v.level === selectedLevel)).map(group => {
          const matchingVersion = group.versions.find(v => v.level === selectedLevel);
          if (!matchingVersion) return group;
          return {
            ...group,
            canonical: {
              ...group.canonical,
              level: selectedLevel,
              slug: matchingVersion.slug,
              readingTime: matchingVersion.readingTime,
            },
          };
        });
    return filtered.slice(0, ARTICLES_LIMIT);
  }, [groups, selectedLevel]);

  return (
    <div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-16 sm:py-24">

          {/* Badge stats */}
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/10">
              📰 {stats.articles} articles
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/10">
              🎓 {stats.modules} modules · {stats.lessons} leçons
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/10">
              🇫🇷 En français
            </span>
          </div>

          {/* H1 SEO */}
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
            Formation IA et actualités — comprenez l&apos;intelligence artificielle
          </p>

          {/* Slogan */}
          <h2 className="font-display text-4xl sm:text-6xl font-bold leading-tight max-w-2xl mb-6">
            L&apos;IA évolue tous les jours.{" "}
            <span className="text-primary">Restez à la page.</span>
          </h2>

          <p className="text-white/70 text-lg max-w-xl mb-10 leading-relaxed">
            Actualités, décryptages et formations pour comprendre l&apos;IA —
            sans jargon, en français.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/formation"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-text font-semibold rounded-xl transition-colors"
            >
              🎓 Se former gratuitement
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors"
            >
              Lire les articles →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pitch — 3 arguments ───────────────────────────────────────────── */}
      <section className="bg-bg-alt border-b border-border">
        <div className="max-w-content mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            {[
              { icon: "🌍", title: "Veille mondiale", desc: "US, Europe, Chine — les acteurs qui comptent, sans les communiqués de presse." },
              { icon: "📶", title: "3 niveaux de lecture", desc: "Débutant, amateur ou confirmé — chaque sujet expliqué à votre niveau." },
              { icon: "🔄", title: "Mis à jour chaque jour", desc: "Nouveaux articles publiés chaque jour. L'IA évolue, notre veille aussi." },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-2">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 text-2xl">{item.icon}</span>
                <h3 className="font-semibold text-text">{item.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-content mx-auto px-4 sm:px-6">

        {/* ── Formation mise en avant ─────────────────────────────────────── */}
        {modules.length > 0 && (
          <section className="py-10 sm:py-14 border-b border-border">
            <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-text">
                  Commencer à se former
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  {stats.modules} modules · {stats.lessons} leçons · gratuit
                </p>
              </div>
              <Link href="/formation" className="text-sm text-primary hover:underline whitespace-nowrap shrink-0">
                Voir tout →
              </Link>
            </div>

            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {modules.slice(0, 3).map((module) => (
                <Link
                  key={module.slug}
                  href={`/formation/${module.slug}`}
                  className={`group bg-white rounded-2xl border border-border hover:border-primary/40 hover:shadow-md transition-all overflow-hidden ${LEVEL_BORDER[module.level] ?? ''}`}
                >
                  <ModuleIllustration slug={module.slug} className="h-36" />
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[module.level]}`}>
                        {module.level}
                      </span>
                      <span className="text-xs text-text-muted">
                        {module.lessonCount} leçon{module.lessonCount > 1 ? "s" : ""} · {formatDuration(module.duration)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text group-hover:text-primary transition-colors leading-snug text-sm sm:text-base">
                      {module.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{module.description}</p>
                  </div>
                </Link>
              ))}

              {modules.length < 3 && (
                <div className="rounded-2xl border border-dashed border-border bg-bg-alt p-5 flex flex-col items-center justify-center text-center gap-2">
                  <span className="text-2xl">🚀</span>
                  <p className="text-sm font-medium text-text">Nouveaux modules en préparation</p>
                  <Link href="#newsletter" className="text-xs text-primary hover:underline mt-1">
                    S&apos;inscrire pour être notifié →
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Derniers articles ─────────────────────────────────────────────── */}
        <section className="py-10 sm:py-14">
          <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-text">Derniers articles</h2>
              <p className="text-sm text-text-muted mt-1">{stats.articles} articles · 3 niveaux</p>
            </div>
            <Link href="/articles" className="text-sm text-primary hover:underline whitespace-nowrap shrink-0">
              Voir tout →
            </Link>
          </div>

          <LevelFilter
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            articleCounts={articleCounts}
          />

          {filteredGroups.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map(group => (
                <ArticleGroupCard key={group.topic} group={group} />
              ))}
            </div>
          ) : selectedLevel === 'all' ? (
            <p className="text-center text-text-muted py-8">Aucun article pour le moment. Revenez bientôt ! 🚀</p>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg-alt rounded-lg">
                <span className="text-2xl">{levelConfig[selectedLevel].icon}</span>
                <p className="text-text-muted text-sm">
                  Aucun article niveau <strong>{levelConfig[selectedLevel].label}</strong> pour le moment.
                </p>
              </div>
            </div>
          )}

          {/* CTA voir tous les articles */}
          <div className="mt-10 text-center">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border hover:border-primary/40 hover:text-primary text-text-muted font-medium rounded-xl transition-colors text-sm"
            >
              Voir les {stats.articles} articles →
            </Link>
          </div>
        </section>

        {/* ── Newsletter ────────────────────────────────────────────────────── */}
        <NewsletterSignup />

      </div>
    </div>
  );
}
