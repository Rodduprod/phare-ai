import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { Article, ArticleMeta, ArticleLevel } from './articles-types';

const CONTENT_DIR = path.join(process.cwd(), "content/articles");

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  const articles = files
    .map((filename) => {
      const filePath = path.join(CONTENT_DIR, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      return {
        slug: filename.replace(".mdx", ""),
        title: data.title || "Sans titre",
        description: data.description || "",
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        level: data.level || "amateur", // Défaut amateur si pas spécifié
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
    image: data.image || null,
    readingTime: readingTime(content).text.replace("min read", "min"),
    published: data.published !== false,
    content,
  };
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