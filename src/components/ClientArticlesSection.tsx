'use client';

import { useState, useMemo } from "react";
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
