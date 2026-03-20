import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { Article, ArticleMeta, ArticleLevel, ArticleGroup } from './articles-types';

const CONTENT_DIR = path.join(process.cwd(), "content/articles");

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  const articles = files
    .map((filename) => {
      const filePath = path.join(CONTENT_DIR, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      const slug = filename.replace(".mdx", "");
      return {
        slug,
        title: data.title || "Sans titre",
        description: data.description || "",
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        level: data.level || "amateur",
        topic: data.topic || undefined,  // undefined = article standalone (topic = slug)
        image: data.image || null,
        readingTime: readingTime(content).text.replace("min read", "min"),
        published: data.published !== false,
      } as ArticleMeta;
    })
    .filter((a) => a.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return articles;
}

export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    slug,
    title: data.title || "Sans titre", 
    description: data.description || "",
    date: data.date || new Date().toISOString(),
    tags: data.tags || [],
    level: data.level || "amateur",
    topic: data.topic || undefined,
    image: data.image || null,
    readingTime: readingTime(content).text.replace("min read", "min"),
    published: data.published !== false,
    content,
  };
}

// Résout le topic d'un article (topic explicite ou slug comme fallback)
function resolveTopic(article: ArticleMeta): string {
  return article.topic || article.slug;
}

// Retourne les articles groupés par topic (ordre de préférence canonical: amateur > débutant > confirmé)
export function getArticleGroups(): ArticleGroup[] {
  const articles = getAllArticles();
  const LEVEL_PRIORITY: ArticleLevel[] = ['amateur', 'débutant', 'confirmé'];

  const byTopic = new Map<string, ArticleMeta[]>();
  for (const article of articles) {
    const topic = resolveTopic(article);
    if (!byTopic.has(topic)) byTopic.set(topic, []);
    byTopic.get(topic)!.push(article);
  }

  const groups: ArticleGroup[] = [];

  for (const [topic, versions] of byTopic.entries()) {
    // Choisir le canonical selon la priorité de niveau
    const canonical =
      LEVEL_PRIORITY.map((l) => versions.find((v) => v.level === l)).find(Boolean) ??
      versions[0];

    groups.push({
      topic,
      title: canonical.title,
      description: canonical.description,
      date: canonical.date,
      tags: canonical.tags,
      image: canonical.image,
      versions: versions
        .sort((a, b) => LEVEL_PRIORITY.indexOf(a.level) - LEVEL_PRIORITY.indexOf(b.level))
        .map((v) => ({ level: v.level, slug: v.slug, readingTime: v.readingTime })),
      canonical,
    });
  }

  // Trier par date du canonical (plus récent en premier)
  return groups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Retourne les autres versions du même topic que l'article donné
export function getArticleSiblings(slug: string): ArticleMeta[] {
  const allArticles = getAllArticles();
  const current = allArticles.find((a) => a.slug === slug);
  if (!current) return [];

  const topic = resolveTopic(current);
  // Article standalone (pas de topic explicite) = pas de siblings
  if (!current.topic) return [];

  return allArticles.filter(
    (a) => resolveTopic(a) === topic && a.slug !== slug
  );
}

export function getArticlesByLevel(level: ArticleLevel): ArticleMeta[] {
  return getAllArticles().filter((article) => article.level === level);
}

export function getArticlesByTag(tag: string): ArticleMeta[] {
  return getAllArticles().filter((article) =>
    article.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
  );
}

export function getRelatedArticles(currentSlug: string, limit = 3): ArticleMeta[] {
  const allArticles = getAllArticles();
  const currentArticle = allArticles.find((a) => a.slug === currentSlug);
  
  if (!currentArticle) return [];

  // Articles du même niveau ou avec tags similaires
  const related = allArticles
    .filter((article) => article.slug !== currentSlug)
    .sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Bonus si même niveau
      if (a.level === currentArticle.level) scoreA += 10;
      if (b.level === currentArticle.level) scoreB += 10;

      // Bonus pour chaque tag en commun
      const commonTagsA = a.tags.filter((tag) => currentArticle.tags.includes(tag));
      const commonTagsB = b.tags.filter((tag) => currentArticle.tags.includes(tag));
      scoreA += commonTagsA.length * 5;
      scoreB += commonTagsB.length * 5;

      return scoreB - scoreA;
    });

  return related.slice(0, limit);
}