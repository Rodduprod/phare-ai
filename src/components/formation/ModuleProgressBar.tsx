'use client';

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface Props {
  moduleSlug: string;
  total: number;
}

export function ModuleProgressBar({ moduleSlug, total }: Props) {
  const supabase = createSupabaseBrowserClient();
  const [completed, setCompleted] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setCompleted(0); return; }
      supabase
        .from("user_progress")
        .select("lesson_path")
        .eq("user_id", user.id)
        .like("lesson_path", `${moduleSlug}/%`)
        .then(({ data }) => setCompleted(data?.length ?? 0));
    });
  }, [moduleSlug, supabase]);

  if (completed === null || completed === 0) return null;

  const pct = Math.round((completed / total) * 100);

  return (
    <div className="bg-bg-alt rounded-xl p-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-text font-medium">Ta progression</span>
        <span className="text-primary font-semibold">{completed}/{total} leçons</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct === 100 && (
        <p className="text-green-700 text-sm font-medium mt-2">🎉 Module terminé !</p>
      )}
    </div>
  );
}
