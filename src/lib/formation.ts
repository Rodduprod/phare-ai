import fs from "fs";
import path from "path";
import matter from "gray-matter";

const FORMATION_DIR = path.join(process.cwd(), "content/formation");

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Module {
  slug: string;
  title: string;
  description: string;
  level: "débutant" | "amateur" | "confirmé";
  order: number;
  published: boolean;
  duration: number; // minutes totales
  image: string;
  tags: string[];
  intro: string;
  lessonCount: number;
}

export interface Lesson {
  slug: string;        // ex: "01-quest-ce-que-l-ia"
  moduleSlug: string;  // ex: "comprendre-ia-debutant"
  title: string;
  description: string;
  order: number;
  duration: number;
  published: boolean;
  content: string;     // MDX raw content
}

export interface LessonMeta {
  slug: string;
  moduleSlug: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  published: boolean;
}

// ─── Modules ──────────────────────────────────────────────────────────────────

export function getAllModules(): Module[] {
  if (!fs.existsSync(FORMATION_DIR)) return [];

  return fs
    .readdirSync(FORMATION_DIR)
    .filter((entry) => {
      const full = path.join(FORMATION_DIR, entry);
      return fs.statSync(full).isDirectory();
    })
    .map((slug) => getModule(slug))
    .filter((m): m is Module => m !== null && m.published)
    .sort((a, b) => a.order - b.order);
}

export function getModule(slug: string): Module | null {
  const indexPath = path.join(FORMATION_DIR, slug, "index.mdx");
  if (!fs.existsSync(indexPath)) return null;

  const raw = fs.readFileSync(indexPath, "utf-8");
  const { data, content } = matter(raw);

  const lessons = getModuleLessons(slug);

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    level: data.level ?? "débutant",
    order: data.order ?? 99,
    published: data.published ?? false,
    duration: data.duration ?? lessons.reduce((acc, l) => acc + l.duration, 0),
    image: data.image ?? "",
    tags: data.tags ?? [],
    intro: content.trim(),
    lessonCount: lessons.length,
  };
}

// ─── Leçons ───────────────────────────────────────────────────────────────────

export function getModuleLessons(moduleSlug: string): LessonMeta[] {
  const dir = path.join(FORMATION_DIR, moduleSlug);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") && f !== "index.mdx")
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        moduleSlug,
        title: data.title ?? "",
        description: data.description ?? "",
        order: data.order ?? 99,
        duration: data.duration ?? 5,
        published: data.published ?? false,
      };
    })
    .filter((l) => l.published)
    .sort((a, b) => a.order - b.order);
}

export function getLesson(moduleSlug: string, lessonSlug: string): Lesson | null {
  const filePath = path.join(FORMATION_DIR, moduleSlug, `${lessonSlug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug: lessonSlug,
    moduleSlug,
    title: data.title ?? "",
    description: data.description ?? "",
    order: data.order ?? 99,
    duration: data.duration ?? 5,
    published: data.published ?? false,
    content,
  };
}

export function getLessonNavigation(moduleSlug: string, lessonSlug: string) {
  const lessons = getModuleLessons(moduleSlug);
  const idx = lessons.findIndex((l) => l.slug === lessonSlug);
  return {
    prev: idx > 0 ? lessons[idx - 1] : null,
    next: idx < lessons.length - 1 ? lessons[idx + 1] : null,
    current: idx + 1,
    total: lessons.length,
  };
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────
// Note : ces fonctions sont dupliquées dans formation-utils.ts (client-safe)
// Ne pas importer formation.ts depuis des Client Components (uses fs)

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

export const LEVEL_COLORS: Record<string, string> = {
  débutant: "bg-green-100 text-green-800",
  amateur: "bg-blue-100 text-blue-800",
  confirmé: "bg-purple-100 text-purple-800",
};
