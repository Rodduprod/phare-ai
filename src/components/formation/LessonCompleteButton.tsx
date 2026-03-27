'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const lessonPath = `${moduleSlug}/${lessonSlug}`;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ? { id: user.id } : null);
      if (user) {
        supabase
          .from("user_progress")
          .select("lesson_path")
          .eq("user_id", user.id)
          .eq("lesson_path", lessonPath)
          .maybeSingle()
          .then(({ data }) => setCompleted(!!data));
      }
    });
  }, [lessonPath, supabase]);

  async function handleComplete() {
    if (!user) {
      router.push(`/compte/connexion?redirect=/formation/${moduleSlug}/${lessonSlug}`);
      return;
    }

    setLoading(true);

    if (!completed) {
      // Marquer comme complété + s'inscrire au module
      await Promise.all([
        supabase.from("user_progress").upsert({
          user_id: user.id,
          lesson_path: lessonPath,
          completed_at: new Date().toISOString(),
        }),
        supabase.from("user_enrollments").upsert({
          user_id: user.id,
          module_slug: moduleSlug,
          enrolled_at: new Date().toISOString(),
        }),
      ]);
      setCompleted(true);
    }

    setLoading(false);

    // Navigation automatique
    if (next) {
      router.push(`/formation/${moduleSlug}/${next.slug}`);
    } else {
      router.push(moduleHref);
    }
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all disabled:opacity-60 ${
        completed
          ? "bg-green-100 text-green-800 border-2 border-green-200"
          : "bg-primary hover:bg-primary-hover text-white"
      }`}
    >
      {loading ? "…" : completed
        ? isLast ? "✓ Module terminé — retour au catalogue" : `✓ Continuer vers : ${next?.title}`
        : isLast ? "Terminer le module 🎉" : `Marquer comme lu et continuer →`}
    </button>
  );
}
