'use client';

import { ArticleLevel, ArticleGroup, levelConfig } from "@/lib/articles-types";
import { ArticleGroupCard } from "@/components/ArticleGroupCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { LevelFilter } from "@/components/LevelFilter";
import { siteConfig } from "@/lib/config";
import { useState, useMemo } from "react";

interface ClientHomePageProps {
  groups: ArticleGroup[];
}

export function ClientHomePage({ groups }: ClientHomePageProps) {
  const [selectedLevel, setSelectedLevel] = useState<ArticleLevel | 'all'>('all');

  // Comptage par niveau (toutes versions confondues)
  const articleCounts = useMemo(() => {
    const counts = { débutant: 0, amateur: 0, confirmé: 0 } as Record<ArticleLevel, number>;
    groups.forEach(g => g.versions.forEach(v => { counts[v.level]++; }));
    return counts;
  }, [groups]);

  // Filtrage : groupes ayant au moins une version du niveau sélectionné
  const filteredGroups = useMemo(() => {
    if (selectedLevel === 'all') return groups;
    return groups.filter(g => g.versions.some(v => v.level === selectedLevel)).map(group => {
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
  }, [groups, selectedLevel]);

  return (
    <div className="max-w-content mx-auto px-4unit">
      {/* Hero */}
      <section className="py-8unit border-b border-border">
        <p className="text-primary font-medium text-meta tracking-wide uppercase mb-5">
          Veille & décryptages
        </p>
        <h1 className="text-display-xl text-text max-w-3xl mb-6">
          {siteConfig.tagline}
        </h1>
        <p className="text-intro text-text-body max-w-xl">
          {siteConfig.description}
        </p>
      </section>

      {/* Articles */}
      <section className="py-8unit">
        <h2 className="text-display-lg text-text mb-8">Découvrir par niveau</h2>

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

      <NewsletterSignup />
    </div>
  );
}
