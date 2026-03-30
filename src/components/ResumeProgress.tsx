'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

interface ProgressData {
  moduleSlug: string;
  moduleTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonPath: string;
  completedCount: number;
  totalLessons: number;
}

export function ResumeProgress() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        // Dernière leçon vue
        const { data: rows } = await supabase
          .from('user_progress')
          .select('lesson_path, completed_at')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1);

        if (!rows?.length) { setLoading(false); return; }

        const lastPath = rows[0].lesson_path; // ex: comprendre-ia-debutant/01-introduction
        const parts = lastPath.split('/');
        if (parts.length < 2) { setLoading(false); return; }
        const moduleSlug = parts[0];
        const lessonSlug = parts[1];

        // Compter les leçons complétées de ce module
        const { count } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .like('lesson_path', `${moduleSlug}/%`);

        setProgress({
          moduleSlug,
          moduleTitle: moduleSlug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          lessonSlug,
          lessonTitle: lessonSlug.replace(/^\d+-/, '').replace(/-/g, ' '),
          lessonPath: lastPath,
          completedCount: count ?? 0,
          totalLessons: 5, // valeur par défaut, affinée si besoin
        });
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !progress) return null;

  const pct = Math.round((progress.completedCount / progress.totalLessons) * 100);

  return (
    <div className="mb-6 bg-white border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl shrink-0">🎓</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            Reprends ta formation
          </p>
          <p className="text-xs text-gray-500 truncate">
            {progress.moduleTitle} — {progress.completedCount}/{progress.totalLessons} leçons
          </p>
          <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full w-32">
            <div
              className="h-full bg-primary-deep rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
      <Link
        href={`/formation/${progress.moduleSlug}/${progress.lessonSlug}`}
        className="shrink-0 text-sm font-semibold text-white bg-primary-deep hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors no-underline"
      >
        Continuer →
      </Link>
    </div>
  );
}
