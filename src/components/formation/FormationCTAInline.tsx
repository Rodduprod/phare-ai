import Link from "next/link";

interface Props {
  level?: string;
}

/**
 * CTA formation inline — injecté automatiquement au milieu des articles.
 * Orienté conversion : plus visuel et accrocheur que le CTA footer.
 */
export function FormationCTAInline({ level }: Props) {
  const isDebutant = !level || level === "débutant";
  const isAmateur = level === "amateur";

  const config = isDebutant
    ? {
        emoji: "🎓",
        title: "Vous débutez avec l'IA ?",
        text: "Notre formation débutant vous guide pas à pas — de la définition de l'IA jusqu'aux usages du quotidien. 5 leçons, 35 minutes.",
        cta: "Commencer la formation gratuite",
        href: "/formation/comprendre-ia-debutant",
      }
    : isAmateur
    ? {
        emoji: "⚡",
        title: "Passez à la vitesse supérieure",
        text: "Nos parcours de formation structurent vos connaissances et vous donnent des méthodes concrètes pour intégrer l'IA dans votre travail.",
        cta: "Voir les modules de formation",
        href: "/formation",
      }
    : {
        emoji: "🔬",
        title: "Structurez votre expertise",
        text: "Des parcours avancés pour aller plus loin : architectures, agents, fine-tuning. Du concret, pas de la théorie.",
        cta: "Explorer les formations avancées",
        href: "/formation",
      };

  return (
    <aside
      className="my-10 not-prose rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 to-primary/3 p-6 sm:p-7"
      aria-label="Formation Le Labo AI"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl flex-shrink-0 mt-0.5" aria-hidden="true">
          {config.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1.5">
            Formation Le Labo AI
          </p>
          <h3 className="font-display text-base sm:text-lg font-bold text-text leading-snug mb-2">
            {config.title}
          </h3>
          <p className="text-sm text-text-muted leading-relaxed mb-4">
            {config.text}
          </p>
          <Link
            href={config.href}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover !text-white text-sm font-semibold rounded-lg transition-colors no-underline"
          >
            {config.cta}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  );
}
