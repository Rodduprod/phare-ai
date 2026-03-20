import Link from 'next/link';
import { ArticleMeta, levelConfig } from '@/lib/articles-types';
import { formatDate } from '@/lib/utils';

interface RelatedArticlesProps {
  articles: ArticleMeta[];
  title?: string;
}

export function RelatedArticles({ articles, title = 'Articles liés' }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="border-t border-ink-100 pt-12 pb-8">
      <h2 className="font-display text-xl text-ink-950 mb-6">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => {
          const level = levelConfig[article.level];
          return (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block p-4 rounded-xl border border-ink-100 hover:border-ink-300 hover:shadow-sm transition-all duration-200 bg-white"
            >
              {/* Niveau */}
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium mb-3"
                style={{
                  borderColor: level.color,
                  color: level.color,
                  backgroundColor: `${level.color}12`,
                }}
              >
                <span>{level.icon}</span>
                <span>{level.label}</span>
              </span>

              {/* Titre */}
              <h3 className="text-sm font-semibold text-ink-900 group-hover:text-primary transition-colors leading-snug mb-2">
                {article.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-ink-500 leading-relaxed line-clamp-2 mb-3">
                {article.description}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-2 text-xs text-ink-400">
                <time dateTime={article.date}>{formatDate(article.date)}</time>
                <span className="w-1 h-1 rounded-full bg-ink-200" />
                <span>{article.readingTime}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
