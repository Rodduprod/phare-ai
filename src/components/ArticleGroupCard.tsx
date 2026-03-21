'use client';

import Link from 'next/link';
import { ArticleGroup, ArticleLevel, levelConfig } from '@/lib/articles-types';
import { formatDate } from '@/lib/utils';
import { OptimizedImage } from './OptimizedImage';

const ALL_LEVELS: ArticleLevel[] = ['débutant', 'amateur', 'confirmé'];

interface ArticleGroupCardProps {
  group: ArticleGroup;
}

export function ArticleGroupCard({ group }: ArticleGroupCardProps) {
  const { canonical, versions } = group;
  const isMultiVersion = versions.length > 1;

  return (
    <article className="article-card group">
      {/* Image */}
      {canonical.image && (
        <Link href={`/articles/${canonical.slug}`} className="block overflow-hidden">
          <div className="aspect-video overflow-hidden">
            <OptimizedImage
              src={canonical.image}
              alt={canonical.title}
              width={400}
              height={225}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Link>
      )}

      <div className="article-card-content">
        {/* Tags — liens vers les pages tag */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {canonical.tags.slice(0, 2).map((tag) => (
            <Link
              key={tag}
              href={`/articles/tag/${tag.toLowerCase()}`}
              className="tag-pill tag-pill-default hover:text-primary hover:border-primary/40 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Titre — lien vers le canonical */}
        <Link href={`/articles/${canonical.slug}`} className="block group">
          <h2 className="text-display-lg text-text group-hover:text-primary transition-colors duration-200 mb-2">
            {canonical.title}
          </h2>
          <p className="text-text-body leading-relaxed mb-4">
            {canonical.description}
          </p>
        </Link>

        {/* Level switcher inline dans la card */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {isMultiVersion ? (
            ALL_LEVELS.map((level) => {
              const version = versions.find((v) => v.level === level);
              const config = levelConfig[level];

              if (!version) {
                return (
                  <span
                    key={level}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-dashed border-border text-xs text-text-muted opacity-40 cursor-not-allowed"
                    title="Version à venir"
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </span>
                );
              }

              const isCanonical = version.slug === canonical.slug;

              return (
                <Link
                  key={level}
                  href={`/articles/${version.slug}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-all duration-150 hover:shadow-sm"
                  style={{
                    borderColor: isCanonical ? config.color : 'var(--color-border)',
                    color: isCanonical ? config.color : 'var(--color-text-muted)',
                    backgroundColor: isCanonical ? `${config.color}12` : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCanonical) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.color = config.color;
                      el.style.borderColor = config.color;
                      el.style.backgroundColor = `${config.color}10`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCanonical) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.color = '';
                      el.style.borderColor = '';
                      el.style.backgroundColor = '';
                    }
                  }}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </Link>
              );
            })
          ) : (
            // Article standalone — affiche simplement le badge niveau
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium"
              style={{
                borderColor: levelConfig[canonical.level].color,
                color: levelConfig[canonical.level].color,
                backgroundColor: `${levelConfig[canonical.level].color}12`,
              }}
            >
              <span>{levelConfig[canonical.level].icon}</span>
              <span>{levelConfig[canonical.level].label}</span>
            </span>
          )}
        </div>

        {/* Métadonnées */}
        <div className="flex items-center gap-3 text-meta text-text-muted">
          <time dateTime={canonical.date}>{formatDate(canonical.date)}</time>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{canonical.readingTime}</span>
          {isMultiVersion && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-xs">
                {versions.length} version{versions.length > 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
