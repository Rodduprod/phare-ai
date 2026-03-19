// Server-side functions (using fs) - only for server components
export { 
  getAllArticles, 
  getArticleBySlug, 
  getArticlesByLevel, 
  getArticlesByTag, 
  getRelatedArticles 
} from './articles-server';

// Client-side types and configs (safe for client components)
export { 
  type ArticleLevel, 
  type ArticleMeta, 
  type Article, 
  levelConfig 
} from './articles-types';

// Additional utility functions
import { getAllArticles } from './articles-server';

export function getAllTags(): string[] {
  const articles = getAllArticles();
  const tags = new Set<string>();
  articles.forEach((a) => a.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export function getAllLevels(): ArticleLevel[] {
  return ['débutant', 'amateur', 'confirmé'];
}

// Re-import for type checking
import type { ArticleLevel } from './articles-types';