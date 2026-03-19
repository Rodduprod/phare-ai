import Link from "next/link";
import { ArticleMeta } from "@/lib/articles";
import { formatDate } from "@/lib/utils";
import { OptimizedImage } from "./OptimizedImage";

export function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <article className="group">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="py-8 border-b border-ink-100 group-hover:border-ink-300 transition-colors">
          <div className={`${article.image ? 'flex gap-6 items-start' : ''}`}>
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Tags */}
              <div className="flex items-center gap-2 mb-3">
                {article.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="tag-pill tag-pill-default">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h2 className="font-display text-display-md text-ink-900 group-hover:text-signal transition-colors mb-2">
                {article.title}
              </h2>

              {/* Description */}
              <p className="text-ink-500 font-body leading-relaxed mb-4 max-w-2xl">
                {article.description}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-ink-400 font-body">
                <time dateTime={article.date}>{formatDate(article.date)}</time>
                <span className="w-1 h-1 rounded-full bg-ink-300" />
                <span>{article.readingTime}</span>
              </div>
            </div>

            {/* Cover Image */}
            {article.image && (
              <div className="flex-shrink-0 w-32 h-24 sm:w-40 sm:h-28">
                <OptimizedImage
                  src={article.image}
                  alt={article.title}
                  width={160}
                  height={112}
                  className="w-full h-full rounded-lg border border-ink-100"
                />
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
