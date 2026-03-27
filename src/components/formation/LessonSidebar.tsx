'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface LessonMeta {
  slug: string;
  title: string;
  duration: number;
  order: number;
}

interface Props {
  moduleSlug: string;
  moduleTitle: string;
  lessons: LessonMeta[];
  currentSlug: string;
  totalDuration: string;
  current: number;
  total: number;
}

export function LessonSidebar({
  moduleSlug, moduleTitle, lessons,
  currentSlug, totalDuration, current, total
}: Props) {
  const supabase = createSupabaseBrowserClient();
  const [completedPaths, setCompletedPaths] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("user_progress")
        .select("lesson_path")
        .eq("user_id", user.id)
        .like("lesson_path", `${moduleSlug}/%`)
        .then(({ data }) => {
          if (data) setCompletedPaths(new Set(data.map((r: { lesson_path: string }) => r.lesson_path)));
        });
    });
  }, [moduleSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">
      <div className="sticky top-24">
        {/* Retour au module */}
        <Link
          href={`/formation/${moduleSlug}`}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {moduleTitle}
        </Link>

        {/* Leçons */}
        <nav className="space-y-1">
          {lessons.map((lesson, i) => {
            const isCurrent = lesson.slug === currentSlug;
            const isCompleted = completedPaths.has(`${moduleSlug}/${lesson.slug}`);

            return (
              <Link
                key={lesson.slug}
                href={`/formation/${moduleSlug}/${lesson.slug}`}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isCurrent
                    ? "bg-primary/10 text-primary font-medium"
                    : isCompleted
                      ? "text-text-muted/60 hover:text-text-muted hover:bg-bg-alt"
                      : "text-text-muted hover:text-text hover:bg-bg-alt"
                }`}
              >
                {/* Icône : check si complété, numéro sinon */}
                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                  isCurrent
                    ? "bg-primary text-white"
                    : isCompleted
                      ? "bg-green-100 text-green-600"
                      : "bg-border text-text-muted"
                }`}>
                  {isCompleted ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>

                <span className={`leading-snug ${isCompleted && !isCurrent ? "line-through decoration-text-muted/40" : ""}`}>
                  {lesson.title}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 px-3 text-xs text-text-muted">
          {current}/{total} leçons · {totalDuration} au total
        </div>
      </div>
    </aside>
  );
}
