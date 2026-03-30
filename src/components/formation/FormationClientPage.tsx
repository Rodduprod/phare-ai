'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import { ModuleIllustration } from "@/components/formation/ModuleIllustration";
import { formatDuration, LEVEL_COLORS } from "@/lib/formation-utils";
import { FormationSignupCTA } from "@/components/formation/FormationSignupCTA";

type FormationLevel = 'débutant' | 'amateur' | 'confirmé';

interface ModuleMeta {
  slug: string;
  title: string;
  description: string;
  level: string;
  duration: number;
  image: string;
  lessonCount: number;
}

interface Props {
  modules: ModuleMeta[];
}

const LEVEL_CONFIG: Record<FormationLevel | 'all', { label: string; icon: string; color: string }> = {
  all:       { label: 'Tous',      icon: '🎓', color: '#8a8a8a' },
  débutant:  { label: 'Débutant',  icon: '🌱', color: '#16a34a' },
  amateur:   { label: 'Amateur',   icon: '🚀', color: '#2563eb' },
  confirmé:  { label: 'Confirmé',  icon: '⚡', color: '#7c3aed' },
};

export function FormationClientPage({ modules }: Props) {
  const [selectedLevel, setSelectedLevel] = useState<FormationLevel | 'all'>('all');

  // Comptage par niveau
  const counts = useMemo(() => {
    const c = { débutant: 0, amateur: 0, confirmé: 0 } as Record<FormationLevel, number>;
    modules.forEach(m => { if (m.level in c) c[m.level as FormationLevel]++; });
    return c;
  }, [modules]);

  const filteredModules = useMemo(() =>
    selectedLevel === 'all' ? modules : modules.filter(m => m.level === selectedLevel),
    [modules, selectedLevel]
  );

  const levels: (FormationLevel | 'all')[] = ['all', 'débutant', 'amateur', 'confirmé'];

  // Module recommandé pour commencer (débutant en premier, sinon premier module)
  const startModule = modules.find(m => m.level === 'débutant') ?? modules[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

      {/* Hero */}
      <header className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
          🎓 Formation
        </div>
        <h1 className="font-display text-3xl sm:text-5xl text-text font-bold mb-4 leading-tight">
          Maîtrisez l&apos;IA,<br />à votre rythme
        </h1>
        <p className="text-text-muted text-base sm:text-lg max-w-2xl mx-auto">
          Des modules courts, progressifs et pratiques — de &ldquo;j&apos;entends parler d&apos;IA partout&rdquo;
          à &ldquo;je sais m&apos;en servir vraiment&rdquo;.
        </p>
      </header>

      {/* CTA inscription */}
      <FormationSignupCTA />

      {/* Commencer par ici */}
      {startModule && (
        <div className="mb-10 p-5 sm:p-6 rounded-2xl border-2 border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-3xl shrink-0">👇</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary-deep uppercase tracking-wide mb-1">Nouveau par ici ? Commencer par ici</p>
            <p className="font-bold text-gray-900 text-base leading-snug">{startModule.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">{startModule.lessonCount} leçons · {formatDuration(startModule.duration)} · niveau {startModule.level}</p>
          </div>
          <Link
            href={`/formation/${startModule.slug}`}
            className="shrink-0 bg-primary-deep hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors no-underline text-sm"
          >
            Démarrer →
          </Link>
        </div>
      )}

      {/* Filtre par niveau */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {levels.map((level) => {
            const cfg = LEVEL_CONFIG[level];
            const count = level === 'all'
              ? modules.length
              : counts[level as FormationLevel];
            const isSelected = selectedLevel === level;

            return (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
                  isSelected
                    ? 'shadow-sm'
                    : 'border-border text-text-muted hover:border-current'
                }`}
                style={{
                  color: isSelected ? cfg.color : undefined,
                  borderColor: isSelected ? cfg.color : undefined,
                  backgroundColor: isSelected ? `${cfg.color}12` : undefined,
                }}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/60' : 'bg-border'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille modules */}
      {filteredModules.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-4xl mb-3">🚀</p>
          <p className="font-medium">Modules {selectedLevel} en préparation</p>
          <p className="text-sm mt-1">Revenez bientôt !</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {filteredModules.map((module, index) => {
            const globalIndex = modules.indexOf(module);
            return (
              <Link
                key={module.slug}
                href={`/formation/${module.slug}`}
                className="group bg-white rounded-2xl border border-border hover:border-primary/40 hover:shadow-lg transition-all overflow-hidden relative"
              >
                {/* Numéro de module */}
                <div className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                  {globalIndex + 1}
                </div>
                <ModuleIllustration slug={module.slug} className="h-44 sm:h-48" />
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${LEVEL_COLORS[module.level]}`}>
                      {module.level}
                    </span>
                    <span className="text-xs text-text-muted">
                      {module.lessonCount} leçon{module.lessonCount > 1 ? "s" : ""} · {formatDuration(module.duration)}
                    </span>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors leading-snug">
                    {module.title}
                  </h2>
                  <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
                    {module.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-primary text-sm font-medium">
                    Commencer
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Promesse pédagogique */}
      <section className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
        {[
          { icon: "⏱️", title: "5 à 10 min par leçon", desc: "Apprenez à votre rythme, même avec un emploi du temps chargé." },
          { icon: "📈", title: "Progressif", desc: "Du plus accessible au plus avancé — sans sauter d'étapes." },
          { icon: "🔄", title: "Toujours à jour", desc: "L'IA évolue vite. Nos modules aussi." },
        ].map((item) => (
          <div key={item.title} className="bg-bg-alt rounded-xl p-5 sm:p-6">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-text mb-1">{item.title}</h3>
            <p className="text-text-muted text-sm">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
