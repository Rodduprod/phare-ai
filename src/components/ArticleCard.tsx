import Link from "next/link";
import { ArticleMeta, levelConfig } from "@/lib/articles-types";
import { formatDate } from "@/lib/utils";
import { OptimizedImage } from "./OptimizedImage";

export function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <article className="article-card">
      <Link href={`/articles/${article.slug}`} className="block h-full">
        {/* Image de couverture en haut si présente */}
        {article.image && (
          <div className="aspect-video overflow-hidden">
            <OptimizedImage
              src={article.image}
              alt={article.title}
              width={400}
              height={225}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Contenu de la carte */}
        <div className="article-card-content">
          {/* Niveau + Tags */}
          <div className="flex items-center gap-2 mb-3">
            {/* Badge niveau */}
            <span className={`level-badge level-${article.level}`}>
              <span>{levelConfig[article.level].icon}</span>
              <span>{levelConfig[article.level].label}</span>
            </span>
            
            {/* Tags existants */}
            {article.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="tag-pill tag-pill-default">
                {tag}
              </span>
            ))}
          </div>

          {/* Titre */}
          <h2 className="text-display-lg text-text group-hover:text-primary transition-colors duration-200 mb-2">
            {article.title}
          </h2>

          {/* Description */}
          <p className="text-text-body leading-relaxed mb-4">
            {article.description}
          </p>

          {/* Métadonnées */}
          <div className="flex items-center gap-3 text-meta text-text-muted">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{article.readingTime}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
