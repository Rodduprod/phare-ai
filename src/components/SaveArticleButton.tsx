'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Props {
  slug: string;
}

export function SaveArticleButton({ slug }: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger l'état initial
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ? { id: user.id } : null);
      if (user) {
        supabase
          .from("saved_articles")
          .select("article_slug")
          .eq("user_id", user.id)
          .eq("article_slug", slug)
          .maybeSingle()
          .then(({ data }) => setIsSaved(!!data));
      }
    });
  }, [slug, supabase]);

  async function handleToggle() {
    if (!user) {
      router.push(`/compte/connexion?redirect=/articles/${slug}`);
      return;
    }

    setLoading(true);
    if (isSaved) {
      await supabase
        .from("saved_articles")
        .delete()
        .eq("user_id", user.id)
        .eq("article_slug", slug);
      setIsSaved(false);
    } else {
      await supabase
        .from("saved_articles")
        .insert({ user_id: user.id, article_slug: slug, saved_at: new Date().toISOString() });
      setIsSaved(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isSaved ? "Retirer des favoris" : "Sauvegarder l'article"}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
        isSaved
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-white border-border text-text-muted hover:border-primary/40 hover:text-primary"
      } disabled:opacity-60`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {isSaved ? "Sauvegardé" : "Sauvegarder"}
    </button>
  );
}
