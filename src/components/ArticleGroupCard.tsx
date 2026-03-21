'use client';

import Link from 'next/link';
import { ArticleGroup, levelConfig } from '@/lib/articles-types';
import { formatDate } from '@/lib/utils';
import { OptimizedImage } from './OptimizedImage';

interface ArticleGroupCardProps {
  group: ArticleGroup;
}

export function ArticleGroupCard({ group }: ArticleGroupCardProps) {
  const { canonical, versions } = group;
  const isMultiVersion = versions.length > 1;
  const lv = levelConfig[canonical.level];

  return (
    <article className="article-card group flex flex-col">
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

      <div className="article-card-content flex flex-col flex-1">
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

        {/* Titre */}
        <Link href={`/articles/${canonical.slug}`} className="block group/title flex-1">
          <h2 className="text-display-lg text-text group-hover/title:text-primary transition-colors duration-200 mb-2">
            {canonical.title}
          </h2>
          <p className="text-text-body leading-relaxed mb-4">
            {canonical.description}
          </p>
        </Link>

        {/* Footer : niveau + badge multi-niveaux + méta */}
        <div className="flex items-center justify-between gap-3 flex-wrap mt-auto">
          <div className="flex items-center gap-2">
            {/* Badge niveau */}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium"
              style={{
                borderColor: lv.color,
                color: lv.color,
                backgroundColor: `${lv.color}12`,
              }}
            >
              <span>{lv.icon}</span>
              <span>{lv.label}</span>
            </span>

            {/* Badge multi-niveaux discret */}
            {isMultiVersion && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-border text-xs text-text-muted">
                {versions.length} niveaux
              </span>
            )}
          </div>

          {/* Méta */}
          <div className="flex items-center gap-2 text-meta text-text-muted">
            <time dateTime={canonical.date}>{formatDate(canonical.date)}</time>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{canonical.readingTime}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
