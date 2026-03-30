import Link from "next/link";
import { formatDuration } from "@/lib/formation-utils";

interface Props {
  module: {
    slug: string;
    title: string;
    level: string;
    lessonCount: number;
    duration: number;
  };
}

export function ArticleFormationLink({ module }: Props) {
  return (
    <div className="my-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <p className="text-xs font-semibold text-primary-deep uppercase tracking-wide mb-3">
        🎓 Formation sur ce sujet
      </p>
      <Link
        href={`/formation/${module.slug}`}
        className="flex items-center justify-between gap-4 group no-underline"
      >
        <div>
          <p className="font-bold text-gray-900 group-hover:text-primary-deep transition-colors leading-snug">
            {module.title}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {module.lessonCount} leçons · {formatDuration(module.duration)} · gratuit
          </p>
        </div>
        <span className="shrink-0 bg-primary-deep text-white text-sm font-semibold px-4 py-2 rounded-lg group-hover:bg-blue-700 transition-colors whitespace-nowrap">
          Commencer →
        </span>
      </Link>
    </div>
  );
}
