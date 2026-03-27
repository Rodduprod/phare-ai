import Link from "next/link";

interface Props {
  level?: string;
}

/**
 * Bannière de conversion média → formation, affichée en bas des articles.
 * Pour les débutants, oriente vers le module "Comprendre l'IA".
 */
export function FormationCTA({ level }: Props) {
  const isDebutant = !level || level === "débutant";

  return (
    <aside className="mt-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">🎓</div>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-text mb-2">
            {isDebutant
              ? "Envie d'aller plus loin ?"
              : "Structurez vos connaissances"}
          </h3>
          <p className="text-text-muted text-sm mb-4">
            {isDebutant
              ? "Ce module de formation débutant vous guide pas à pas — de la définition de l'IA jusqu'aux usages concrets. 5 leçons, 35 minutes."
              : "Nos parcours de formation structurent ce que vous lisez dans nos articles — du débutant au confirmé."}
          </p>
          <Link
            href={isDebutant ? "/formation/comprendre-ia-debutant" : "/formation"}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {isDebutant ? "Démarrer le module débutant" : "Voir les formations"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </aside>
  );
}
