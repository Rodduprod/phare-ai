import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getModule, getModuleLessons, formatDuration, LEVEL_COLORS, getAllModules } from "@/lib/formation";
import { siteConfig } from "@/lib/config";
import { ModuleProgressBar } from "@/components/formation/ModuleProgressBar";

interface Props { params: { module: string } }

export async function generateStaticParams() {
  return getAllModules().map((m) => ({ module: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const module = getModule(params.module);
  if (!module) return {};
  return {
    title: `${module.title} — Formation Le Labo AI`,
    description: module.description,
    alternates: { canonical: `${siteConfig.url}/formation/${module.slug}` },
  };
}

export default function ModulePage({ params }: Props) {
  const module = getModule(params.module);
  if (!module) notFound();

  const lessons = getModuleLessons(params.module);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
        <Link href="/formation" className="hover:text-primary transition-colors">Formation</Link>
        <span>/</span>
        <span className="text-text">{module.title}</span>
      </nav>

      {/* Header module */}
      {module.image && (
        <div className="relative h-56 rounded-2xl overflow-hidden mb-8 bg-bg-alt">
          <Image src={module.image} alt={module.title} fill className="object-cover" sizes="768px" />
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${LEVEL_COLORS[module.level]}`}>
          {module.level}
        </span>
        <span className="text-xs text-text-muted">
          {module.lessonCount} leçon{module.lessonCount > 1 ? "s" : ""} · {formatDuration(module.duration)}
        </span>
      </div>

      <h1 className="font-display text-3xl font-bold text-text mb-4">{module.title}</h1>
      <p className="text-text-muted text-lg mb-6">{module.description}</p>

      {/* Intro du module */}
      <div className="prose prose-sm max-w-none text-text-muted mb-8">
        <p>{module.intro}</p>
      </div>

      {/* Barre de progression (client component) */}
      <ModuleProgressBar moduleSlug={params.module} total={lessons.length} />

      {/* Liste des leçons */}
      <div className="space-y-2 mt-6">
        {lessons.map((lesson, i) => (
          <Link
            key={lesson.slug}
            href={`/formation/${params.module}/${lesson.slug}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-bg-alt transition-all group"
          >
            {/* Numéro */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              {i + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-text group-hover:text-primary transition-colors truncate">
                {lesson.title}
              </div>
              <div className="text-xs text-text-muted mt-0.5">{lesson.duration} min</div>
            </div>

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        ))}
      </div>

      {/* CTA démarrer */}
      {lessons.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            href={`/formation/${params.module}/${lessons[0].slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors"
          >
            Commencer la première leçon →
          </Link>
        </div>
      )}
    </div>
  );
}
