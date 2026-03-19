import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const CONTENT_DIR = path.join(process.cwd(), "content/articles");

export type ArticleLevel = 'débutant' | 'amateur' | 'confirmé';

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  level: ArticleLevel;
  image?: string;
  readingTime: string;
  published: boolean;
}

export interface Article extends ArticleMeta {
  content: string;
}

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

export function getAllTags(): string[] {
  const articles = getAllArticles();
  const tags = new Set<string>();
  articles.forEach((a) => a.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export function getArticlesByLevel(level: ArticleLevel): ArticleMeta[] {
  return getAllArticles().filter(article => article.level === level);
}

export function getAllLevels(): ArticleLevel[] {
  return ['débutant', 'amateur', 'confirmé'];
}

// Métadonnées des niveaux pour l'UI
export const levelConfig = {
  débutant: {
    label: 'Débutant',
    icon: '🌱',
    color: '#34c759', // Vert
    description: 'Pour ceux qui découvrent l\'IA',
    audience: 'Aucune connaissance technique requise'
  },
  amateur: {
    label: 'Amateur', 
    icon: '🔧',
    color: '#99ccff', // Bleu labo (primary)
    description: 'Pour les professionnels tech qui découvrent l\'IA',
    audience: 'Familier avec la tech, nouveau en IA'
  },
  confirmé: {
    label: 'Confirmé',
    icon: '⚡', 
    color: '#e53e3e', // Rouge
    description: 'Deep dives techniques et architecture',
    audience: 'Devs, architectes, consultants tech'
  }
} as const;
