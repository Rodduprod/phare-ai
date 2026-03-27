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

  const [userId, setUserId] = useState<string | null | undefined>(undefined); // undefined = pas encore chargé
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const lessonPath = `${moduleSlug}/${lessonSlug}`;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setUserId(null); return; }
      setUserId(user.id);
      supabase
        .from("user_progress")
        .select("lesson_path")
        .eq("user_id", user.id)
        .eq("lesson_path", lessonPath)
        .maybeSingle()
        .then(({ data }) => { if (data) setCompleted(true); });
    });
  }, [lessonPath]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleClick() {
    // Pas connecté → login
    if (userId === null) {
      router.push(`/compte/connexion?redirect=/formation/${moduleSlug}/${lessonSlug}`);
      return;
    }
    // Auth pas encore chargée → attendre
    if (userId === undefined) return;

    setLoading(true);

    // Sauvegarder progression en base
    if (!completed) {
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

    setLoading(false);

    // Navigation vers la leçon suivante (ou retour au module si dernière leçon)
    if (next) {
      router.push(`/formation/${moduleSlug}/${next.slug}`);
    } else {
      router.push(moduleHref);
    }
  }

  const label = loading
    ? "Enregistrement…"
    : isLast
      ? completed ? "✓ Module terminé — retour au catalogue" : "Terminer le module 🎉"
      : completed
        ? `✓ Continuer : ${next?.title}`
        : "Marquer comme lu et continuer →";

  return (
    <button
      onClick={handleClick}
      disabled={loading || userId === undefined}
      className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all disabled:opacity-50 ${
        completed
          ? "bg-green-100 text-green-800 border-2 border-green-200"
          : "bg-primary hover:bg-primary-hover text-white"
      }`}
    >
      {label}
    </button>
  );
}
