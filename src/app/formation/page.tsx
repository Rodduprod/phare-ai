import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllModules, formatDuration, LEVEL_COLORS } from "@/lib/formation";
import { siteConfig } from "@/lib/config";
import { FormationSignupCTA } from "@/components/formation/FormationSignupCTA";

export const metadata: Metadata = {
  title: "Formation IA — Le Labo AI",
  description: "Des parcours de formation pour comprendre et maîtriser l'IA, quel que soit votre niveau. Débutez dès maintenant avec des modules courts et progressifs.",
  alternates: { canonical: `${siteConfig.url}/formation` },
};

export default function FormationPage() {
  const modules = getAllModules();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero */}
      <header className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          🎓 Formation
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-text font-bold mb-4 leading-tight">
          Maîtrisez l&apos;IA,<br />à votre rythme
        </h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Des modules courts, progressifs et pratiques — conçus pour passer de
          &ldquo;j&apos;entends parler d&apos;IA partout&rdquo; à &ldquo;je sais m&apos;en servir vraiment&rdquo;.
        </p>
      </header>

      {/* CTA inscription — visible uniquement pour les non-connectés */}
      <FormationSignupCTA />

      {/* Modules */}
      {modules.length === 0 ? (
        <p className="text-center text-text-muted">Modules en cours de préparation…</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {modules.map((module) => (
            <Link
              key={module.slug}
              href={`/formation/${module.slug}`}
              className="group bg-white rounded-2xl border border-border hover:border-primary/40 hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Image */}
              {module.image && (
                <div className="relative h-48 overflow-hidden bg-bg-alt">
                  <Image
                    src={module.image}
                    alt={module.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${LEVEL_COLORS[module.level]}`}>
                    {module.level}
                  </span>
                  <span className="text-xs text-text-muted">
                    {module.lessonCount} leçon{module.lessonCount > 1 ? "s" : ""} · {formatDuration(module.duration)}
                  </span>
                </div>

                <h2 className="font-display text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors">
                  {module.title}
                </h2>
                <p className="text-text-muted text-sm leading-relaxed line-clamp-3">
                  {module.description}
                </p>

                <div className="mt-5 flex items-center gap-1.5 text-primary text-sm font-medium">
                  Commencer le module
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Promesse pédagogique */}
      <section className="mt-20 grid sm:grid-cols-3 gap-6 text-center">
        {[
          { icon: "⏱️", title: "5 à 10 min par leçon", desc: "Apprenez à votre rythme, même avec un emploi du temps chargé." },
          { icon: "📈", title: "Progressif", desc: "Du plus accessible au plus avancé — sans sauter d'étapes." },
          { icon: "🔄", title: "Toujours à jour", desc: "L'IA évolue vite. Nos modules aussi." },
        ].map((item) => (
          <div key={item.title} className="bg-bg-alt rounded-xl p-6">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-text mb-1">{item.title}</h3>
            <p className="text-text-muted text-sm">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
