'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Props {
  moduleSlug: string;
  lessonSlug: string;
  next: { slug: string; title: string } | null;
  moduleHref: string;
  isLast: boolean;
}

export function LessonCompleteButton({ moduleSlug, lessonSlug, next, moduleHref, isLast }: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);

  const lessonPath = `${moduleSlug}/${lessonSlug}`;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      supabase
        .from("user_progress")
        .select("lesson_path")
        .eq("user_id", user.id)
        .eq("lesson_path", lessonPath)
        .maybeSingle()
        .then(({ data }) => { if (data) setCompleted(true); });
    });
  }, [lessonPath, supabase]);

  async function handleComplete() {
    setLoading(true);

    // Sauvegarde progression si connecté (best-effort, ne bloque pas la navigation)
    if (userId && !completed) {
      await Promise.allSettled([
        supabase.from("user_progress").upsert({
          user_id: userId,
          lesson_path: lessonPath,
          completed_at: new Date().toISOString(),
        }),
        supabase.from("user_enrollments").upsert({
          user_id: userId,
          module_slug: moduleSlug,
          enrolled_at: new Date().toISOString(),
        }),
      ]);
      setCompleted(true);
    }

    // Si non connecté → montrer l'hint login brièvement puis naviguer quand même
    if (!userId) setShowLoginHint(true);

    setLoading(false);

    // Navigation toujours effective
    setTimeout(() => {
      if (next) {
        router.push(`/formation/${moduleSlug}/${next.slug}`);
      } else {
        router.push(moduleHref);
      }
    }, userId ? 0 : 1200); // petite pause si non connecté pour voir le hint
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleComplete}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all disabled:opacity-60 ${
          completed
            ? "bg-green-100 text-green-800 border-2 border-green-200 hover:bg-green-50"
            : "bg-primary hover:bg-primary-hover text-white"
        }`}
      >
        {loading
          ? "…"
          : completed
            ? isLast ? "✓ Module terminé — retour au catalogue" : `✓ Continuer vers : ${next?.title}`
            : isLast ? "Terminer le module 🎉" : "Marquer comme lu et continuer →"}
      </button>

      {/* Hint login discret si non connecté */}
      {showLoginHint && (
        <p className="text-xs text-text-muted text-center">
          <Link href={`/compte/connexion?redirect=/formation/${moduleSlug}/${lessonSlug}`} className="text-primary hover:underline">
            Connectez-vous
          </Link>{" "}
          pour sauvegarder votre progression.
        </p>
      )}
    </div>
  );
}
