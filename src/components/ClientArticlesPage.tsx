'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArticleGroup, ArticleLevel, levelConfig } from '@/lib/articles-types';
import { ArticleGroupCard } from './ArticleGroupCard';
import { LevelFilter } from './LevelFilter';

interface ClientArticlesPageProps {
  groups: ArticleGroup[];
}

export function ClientArticlesPage({ groups }: ClientArticlesPageProps) {
  const searchParams = useSearchParams();
  const [selectedLevel, setSelectedLevel] = useState<ArticleLevel | 'all'>('all');

  // Pré-sélectionner le niveau : 1) URL param, 2) localStorage
  useEffect(() => {
    const urlLevel = searchParams.get('level') as ArticleLevel | null;
    if (urlLevel && ['débutant', 'amateur', 'confirmé'].includes(urlLevel)) {
      setSelectedLevel(urlLevel);
      return;
    }
    const saved = localStorage.getItem('lelabo_user_level') as ArticleLevel | null;
    if (saved && ['débutant', 'amateur', 'confirmé'].includes(saved)) {
      setSelectedLevel(saved);
    }
  }, [searchParams]);
  const [searchQuery, setSearchQuery] = useState('');

  // Comptage par level (en comptant chaque version disponible)
  const articleCounts = { débutant: 0, amateur: 0, confirmé: 0 } as Record<ArticleLevel, number>;
  for (const group of groups) {
    for (const version of group.versions) {
      articleCounts[version.level]++;
    }
  }

  // Filtrage texte + niveau
  const filtered = useMemo(() => {
    let result = selectedLevel === 'all'
      ? groups
      : groups.filter((g) => g.versions.some((v) => v.level === selectedLevel));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g =>
        g.canonical.title.toLowerCase().includes(q) ||
        g.canonical.description.toLowerCase().includes(q) ||
        g.topic.toLowerCase().includes(q) ||
        (g.canonical.tags ?? []).some((t: string) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [groups, selectedLevel, searchQuery]);

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
      {/* Barre de recherche */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher un article…"
          className="w-full pl-10 pr-4 py-2.5 bg-bg-alt border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filtre par niveau */}
      <LevelFilter
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        articleCounts={articleCounts}
      />

      {/* Compteur de résultats */}
      <div className="mb-6 text-sm text-text-muted">
        {searchQuery.trim() ? (
          <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''} pour <strong>"{searchQuery}"</strong></span>
        ) : selectedLevel === 'all' ? (
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedGroups.map((group, index) => (
          <ArticleGroupCard key={group.topic} group={group} priority={index < 3} />
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
