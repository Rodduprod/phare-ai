'use client';

import { ArticleLevel, levelConfig, ArticleMeta } from "@/lib/articles-types";
import { ArticleCard } from "@/components/ArticleCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { LevelFilter } from "@/components/LevelFilter";
import { siteConfig } from "@/lib/config";
import { useState, useMemo } from "react";

interface ClientHomePageProps {
  articles: ArticleMeta[];
}

export function ClientHomePage({ articles }: ClientHomePageProps) {
  const [selectedLevel, setSelectedLevel] = useState<ArticleLevel | 'all'>('all');

  // Calcul des compteurs par niveau
  const articleCounts = useMemo(() => {
    const counts = { débutant: 0, amateur: 0, confirmé: 0 } as Record<ArticleLevel, number>;
    articles.forEach(article => {
      counts[article.level]++;
    });
    return counts;
  }, [articles]);

  // Filtrage des articles selon le niveau sélectionné
  const filteredArticles = useMemo(() => {
    if (selectedLevel === 'all') return articles;
    return articles.filter(article => article.level === selectedLevel);
  }, [articles, selectedLevel]);

  return (
    <div className="max-w-content mx-auto px-4unit">
      {/* Hero section */}
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

      {/* Navigation par niveau et articles */}
      <section className="py-8unit">
        <h2 className="text-display-lg text-text mb-8">Découvrir par niveau</h2>
        
        {/* Filtre par niveau */}
        <LevelFilter 
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          articleCounts={articleCounts}
        />
        
        {/* Grille d'articles filtrés */}
        {filteredArticles.length > 0 ? (
          <div className="grid gap-3unit sm:grid-cols-2 lg:grid-cols-3 stagger">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : selectedLevel === 'all' ? (
          <div className="text-center py-8">
            <p className="text-text-muted">
              Aucun article pour le moment. Revenez bientôt ! 🚀
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg-alt rounded-lg">
              <span className="text-2xl">{levelConfig[selectedLevel].icon}</span>
              <p className="text-text-muted">
                Aucun article niveau <strong>{levelConfig[selectedLevel].label}</strong> pour le moment.
              </p>
            </div>
            <p className="text-text-muted text-sm mt-2">
              Ils arrivent bientôt ! 🚀
            </p>
          </div>
        )}
      </section>

      {/* Newsletter */}
      <NewsletterSignup />
    </div>
  );
}