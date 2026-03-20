'use client';

import { useState } from 'react';
import { ArticleGroup, ArticleLevel, levelConfig } from '@/lib/articles-types';
import { ArticleGroupCard } from './ArticleGroupCard';
import { LevelFilter } from './LevelFilter';

interface ClientArticlesPageProps {
  groups: ArticleGroup[];
}

export function ClientArticlesPage({ groups }: ClientArticlesPageProps) {
  const [selectedLevel, setSelectedLevel] = useState<ArticleLevel | 'all'>('all');

  // Comptage par level (en comptant chaque version disponible)
  const articleCounts = { débutant: 0, amateur: 0, confirmé: 0 } as Record<ArticleLevel, number>;
  for (const group of groups) {
    for (const version of group.versions) {
      articleCounts[version.level]++;
    }
  }

  // Filtrage : on garde les groupes qui ont au moins une version du niveau sélectionné
  const filtered = selectedLevel === 'all'
    ? groups
    : groups.filter((g) => g.versions.some((v) => v.level === selectedLevel));

  // Pour les groupes filtrés par level, on met en avant la version du niveau sélectionné
  const displayedGroups = filtered.map((group) => {
    if (selectedLevel === 'all') return group;

    const matchingVersion = group.versions.find((v) => v.level === selectedLevel);
    if (!matchingVersion) return group;

    // Mettre à jour le canonical vers la version sélectionnée pour l'affichage
    const matchingArticle = group.versions.find((v) => v.level === selectedLevel);
    if (!matchingArticle) return group;

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

  return (
    <div>
      {/* Filtre par niveau */}
      <LevelFilter
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        articleCounts={articleCounts}
      />

      {/* Compteur de résultats */}
      <div className="mb-6 text-sm text-text-muted">
        {selectedLevel === 'all' ? (
          <span>{groups.length} sujet{groups.length > 1 ? 's' : ''}</span>
        ) : (
          <span>
            {filtered.length} article{filtered.length > 1 ? 's' : ''} niveau{' '}
            <span style={{ color: levelConfig[selectedLevel].color }}>
              {levelConfig[selectedLevel].icon} {levelConfig[selectedLevel].label}
            </span>
          </span>
        )}
      </div>

      {/* Grille d'articles */}
      <div className="stagger">
        {displayedGroups.map((group) => (
          <ArticleGroupCard key={group.topic} group={group} />
        ))}
      </div>

      {displayedGroups.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-4xl mb-4">{levelConfig[selectedLevel as ArticleLevel]?.icon ?? '🔍'}</p>
          <p className="text-text-muted font-body">
            Aucun article pour ce niveau pour l'instant.
          </p>
          <button
            onClick={() => setSelectedLevel('all')}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Voir tous les articles
          </button>
        </div>
      )}
    </div>
  );
}
