'use client';

import { useState } from "react";
import Link from "next/link";

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
  current: number;
  total: number;
}

/**
 * Navigation mobile pour la page leçon.
 * Affichée uniquement sur < lg. Bouton "Plan du module" qui ouvre un drawer.
 */
export function LessonMobileNav({ moduleSlug, moduleTitle, lessons, currentSlug, current, total }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Barre contextuelle — module + bouton plan */}
      <div className="flex items-center justify-between mb-5">
        <Link
          href={`/formation/${moduleSlug}`}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span className="truncate max-w-[180px]">{moduleTitle}</span>
        </Link>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-sm text-primary font-medium px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          Plan · {current}/{total}
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[75vh] flex flex-col">
            {/* Handle */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-semibold text-text text-sm">Plan du module</span>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-alt transition-colors"
                aria-label="Fermer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Liste leçons */}
            <nav className="overflow-y-auto flex-1 px-4 py-3 space-y-1">
              {lessons.map((lesson, i) => {
                const isCurrent = lesson.slug === currentSlug;
                return (
                  <Link
                    key={lesson.slug}
                    href={`/formation/${moduleSlug}/${lesson.slug}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${
                      isCurrent
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-text-muted hover:text-text hover:bg-bg-alt"
                    }`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent ? "bg-primary text-white" : "bg-border text-text-muted"
                    }`}>
                      {i + 1}
                    </span>
                    <span className="flex-1 leading-snug">{lesson.title}</span>
                    <span className="text-xs text-text-muted shrink-0">{lesson.duration} min</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
