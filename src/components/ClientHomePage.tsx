'use client';

import Link from "next/link";
import Image from "next/image";
import { ArticleLevel, ArticleGroup, levelConfig } from "@/lib/articles-types";
import { formatDuration, LEVEL_COLORS } from "@/lib/formation-utils";
import { ArticleGroupCard } from "@/components/ArticleGroupCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { LevelFilter } from "@/components/LevelFilter";
import { useState, useMemo } from "react";

// Type local — évite d'importer formation.ts (uses fs) dans un Client Component
interface ModuleMeta {
  slug: string;
  title: string;
  description: string;
  level: string;
  duration: number;
  image: string;
  lessonCount: number;
}

interface ClientHomePageProps {
  groups: ArticleGroup[];
  modules: ModuleMeta[];
}

export function ClientHomePage({ groups, modules }: ClientHomePageProps) {
  const [selectedLevel, setSelectedLevel] = useState<ArticleLevel | 'all'>('all');

  const articleCounts = useMemo(() => {
    const counts = { débutant: 0, amateur: 0, confirmé: 0 } as Record<ArticleLevel, number>;
    groups.forEach(g => g.versions.forEach(v => { counts[v.level]++; }));
    return counts;
  }, [groups]);

  const ARTICLES_LIMIT = 6;

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
    <div className="max-w-content mx-auto px-4unit">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="py-12 border-b border-border">
        <h1 className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
          Formation IA et actualités — comprenez l&apos;intelligence artificielle
        </h1>

        <p className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight max-w-2xl mb-6">
          L&apos;IA évolue tous les jours.<br />
          <span className="text-primary">Restez à la page.</span>
        </p>

        <p className="text-lg text-text-muted max-w-xl mb-8 leading-relaxed">
          Actualités, décryptages et formations pour comprendre l&apos;IA — sans jargon, en français.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/formation"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors"
          >
            🎓 Se former gratuitement
          </Link>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-bg-alt hover:bg-border text-text font-semibold rounded-xl transition-colors"
          >
            Lire les articles →
          </Link>
        </div>
      </section>

      {/* ── Formation mise en avant ───────────────────────── */}
      {modules.length > 0 && (
        <section className="py-10 border-b border-border">
          <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-text">Commencer à se former</h2>
            <Link href="/formation" className="text-sm text-primary hover:underline whitespace-nowrap shrink-0">
              Voir tout →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.slice(0, 3).map((module) => (
              <Link
                key={module.slug}
                href={`/formation/${module.slug}`}
                className="group bg-white rounded-2xl border border-border hover:border-primary/40 hover:shadow-md transition-all overflow-hidden"
              >
                {module.image && (
                  <div className="relative h-36 bg-bg-alt overflow-hidden">
                    <Image
                      src={module.image}
                      alt={module.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[module.level]}`}>
                      {module.level}
                    </span>
                    <span className="text-xs text-text-muted">
                      {module.lessonCount} leçon{module.lessonCount > 1 ? "s" : ""} · {formatDuration(module.duration)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-text group-hover:text-primary transition-colors leading-snug">
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
                <p className="text-xs text-text-muted">Inscrivez-vous pour être notifié</p>
                <Link href="#newsletter" className="text-xs text-primary hover:underline mt-1">
                  S&apos;inscrire →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Derniers articles ─────────────────────────────── */}
      <section className="py-10">
        <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-text">Derniers articles</h2>
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
              <p className="text-text-muted">
                Aucun article niveau <strong>{levelConfig[selectedLevel].label}</strong> pour le moment.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── Newsletter ────────────────────────────────────── */}
      <NewsletterSignup />
    </div>
  );
}
