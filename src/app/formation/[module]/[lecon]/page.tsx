import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  getLesson, getModule, getModuleLessons,
  getLessonNavigation, formatDuration, getAllModules
} from "@/lib/formation";
import { siteConfig } from "@/lib/config";
import { LessonCompleteButton } from "@/components/formation/LessonCompleteButton";

interface Props { params: { module: string; lecon: string } }

export async function generateStaticParams() {
  return getAllModules().flatMap((m) =>
    getModuleLessons(m.slug).map((l) => ({ module: m.slug, lecon: l.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = getLesson(params.module, params.lecon);
  if (!lesson) return {};
  return {
    title: `${lesson.title} — Le Labo AI Formation`,
    description: lesson.description,
    alternates: { canonical: `${siteConfig.url}/formation/${params.module}/${params.lecon}` },
  };
}

export default function LeconPage({ params }: Props) {
  const lesson = getLesson(params.module, params.lecon);
  if (!lesson) notFound();

  const module = getModule(params.module);
  if (!module) notFound();

  const nav = getLessonNavigation(params.module, params.lecon);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2 flex-wrap">
        <Link href="/formation" className="hover:text-primary transition-colors">Formation</Link>
        <span>/</span>
        <Link href={`/formation/${params.module}`} className="hover:text-primary transition-colors">{module.title}</Link>
        <span>/</span>
        <span className="text-text">{lesson.title}</span>
      </nav>

      {/* Header leçon */}
      <header className="mb-10">
        <div className="text-xs text-text-muted mb-3">
          Leçon {nav.current}/{nav.total} · {formatDuration(lesson.duration)}
        </div>
        <h1 className="font-display text-3xl font-bold text-text mb-3">{lesson.title}</h1>
        <p className="text-text-muted text-lg">{lesson.description}</p>
      </header>

      {/* Contenu MDX */}
      <article className="prose prose-slate max-w-none
        prose-headings:font-display prose-headings:text-text
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-text-muted prose-p:leading-relaxed
        prose-strong:text-text prose-strong:font-semibold
        prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1
        prose-ul:text-text-muted prose-ol:text-text-muted
        prose-code:bg-bg-alt prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-table:text-sm prose-th:bg-bg-alt prose-th:text-text prose-td:text-text-muted
        prose-hr:border-border">
        <MDXRemote source={lesson.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </article>

      {/* Bouton marquer comme lu + navigation */}
      <div className="mt-12 pt-8 border-t border-border">
        <LessonCompleteButton
          moduleSlug={params.module}
          lessonSlug={params.lecon}
          next={nav.next ? { slug: nav.next.slug, title: nav.next.title } : null}
          moduleHref={`/formation/${params.module}`}
          isLast={nav.next === null}
        />

        {/* Navigation prev/next */}
        <div className="flex justify-between mt-6 text-sm">
          {nav.prev ? (
            <Link
              href={`/formation/${params.module}/${nav.prev.slug}`}
              className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              {nav.prev.title}
            </Link>
          ) : <div />}

          {nav.next && (
            <Link
              href={`/formation/${params.module}/${nav.next.slug}`}
              className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
            >
              {nav.next.title}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
