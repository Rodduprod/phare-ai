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
import { LessonQuiz } from "@/components/formation/LessonQuiz";
import { LessonSidebar } from "@/components/formation/LessonSidebar";
import { LessonMobileNav } from "@/components/formation/LessonMobileNav";

interface Props { params: { module: string; lecon: string } }


export const dynamicParams = true;
export const revalidate = 86400;

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

  const lessons = getModuleLessons(params.module);
  const nav = getLessonNavigation(params.module, params.lecon);

  return (
    <div className="min-h-screen bg-white">
      {/* Barre de progression en haut */}
      <div className="h-1 bg-border">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(nav.current / nav.total) * 100}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex gap-8">

        {/* Sidebar — liste des leçons avec état de complétion (client) */}
        <LessonSidebar
          moduleSlug={params.module}
          moduleTitle={module.title}
          lessons={lessons}
          currentSlug={params.lecon}
          totalDuration={formatDuration(module.duration)}
          current={nav.current}
          total={nav.total}
        />

        {/* Contenu principal */}
        <main className="flex-1 min-w-0 max-w-2xl">
          {/* Navigation mobile — remplace le breadcrumb */}
          <LessonMobileNav
            moduleSlug={params.module}
            moduleTitle={module.title}
            lessons={lessons}
            currentSlug={params.lecon}
            current={nav.current}
            total={nav.total}
          />

          {/* Header leçon */}
          <header className="mb-10 pb-8 border-b border-border">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              Leçon {nav.current} sur {nav.total} · {lesson.duration} min
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-text mb-4 leading-tight">
              {lesson.title}
            </h1>
            <p className="text-text-muted text-lg leading-relaxed">
              {lesson.description}
            </p>
          </header>

          {/* Contenu MDX — utilise la classe du site */}
          <div className="prose-article">
            <MDXRemote
              source={lesson.content}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>

          {/* QCM ou bouton simple selon si la leçon a des questions */}
          {lesson.qcm && lesson.qcm.length === 4 ? (
            <LessonQuiz
              moduleSlug={params.module}
              lessonSlug={params.lecon}
              questions={lesson.qcm}
              next={nav.next ? { slug: nav.next.slug, title: nav.next.title } : null}
              moduleHref={`/formation/${params.module}`}
              isLast={nav.next === null}
            />
          ) : (
            <div className="mt-16 pt-8 border-t border-border space-y-4">
              <LessonCompleteButton
                moduleSlug={params.module}
                lessonSlug={params.lecon}
                next={nav.next ? { slug: nav.next.slug, title: nav.next.title } : null}
                moduleHref={`/formation/${params.module}`}
                isLast={nav.next === null}
              />
              {/* Navigation prev / next */}
              <div className="flex justify-between text-sm pt-2">
                {nav.prev ? (
                  <Link
                    href={`/formation/${params.module}/${nav.prev.slug}`}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <span className="truncate max-w-48">{nav.prev?.title}</span>
                  </Link>
                ) : <div />}
                {nav.next && (
                  <Link
                    href={`/formation/${params.module}/${nav.next.slug}`}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
                  >
                    <span className="truncate max-w-48">{nav.next.title}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
