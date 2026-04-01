'use client';

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArticleLevel, ArticleGroup, levelConfig } from "@/lib/articles-types";
import { ArticleGroupCard } from "@/components/ArticleGroupCard";
import { LevelFilter } from "@/components/LevelFilter";

interface Props {
  groups: ArticleGroup[];
  totalArticles: number;
}

const ARTICLES_LIMIT = 6;

export function ClientArticlesSection({ groups, totalArticles }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<ArticleLevel | 'all'>('all');
  const [showTestBanner, setShowTestBanner] = useState(false);

  // Pré-sélectionner le niveau depuis localStorage si connu
  useEffect(() => {
    const saved = localStorage.getItem('lelabo_user_level') as ArticleLevel | null;
    if (saved && ['débutant', 'amateur', 'confirmé'].includes(saved)) {
      setSelectedLevel(saved);
    } else {
      // Nouveau visiteur : afficher le bandeau test de niveau
      setShowTestBanner(true);
    }
  }, []);

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
    <>
      {/* Bandeau test de niveau — affiché uniquement aux nouveaux visiteurs */}
      {showTestBanner && (
        <div className="mb-6 flex items-center justify-between gap-4 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧪</span>
            <p className="text-sm text-gray-700">
              <strong>Nouveau ?</strong> Faites le test de niveau pour voir les articles adaptés à votre profil.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/test-de-niveau"
              className="text-sm font-semibold text-primary-deep hover:underline whitespace-nowrap no-underline"
            >
              Démarrer →
            </Link>
            <button
              onClick={() => setShowTestBanner(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <LevelFilter
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        articleCounts={articleCounts}
      />

      {filteredGroups.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group, index) => (
            <ArticleGroupCard key={group.topic} group={group} priority={index < 3} />
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

      <div className="mt-10 text-center">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 px-6 py-3 border border-border hover:border-primary/40 hover:text-primary text-text-muted font-medium rounded-xl transition-colors text-sm"
        >
          Voir les {totalArticles} articles →
        </Link>
      </div>
    </>
  );
}
