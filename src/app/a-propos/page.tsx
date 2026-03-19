import { siteConfig } from "@/lib/config";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { AboutSchema } from "@/components/AboutSchema";
import { levelConfig } from "@/lib/articles-types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez la mission du Labo AI : démocratiser l'intelligence artificielle en français avec une approche accessible et segmentée par niveau technique.",
  openGraph: {
    title: "À propos - Le Labo AI",
    description: "La mission et l'approche du média IA francophone qui démocratise l'intelligence artificielle.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <AboutSchema />
      
      <div className="max-w-content mx-auto px-4unit">
        <div className="pt-8">
          <Breadcrumbs items={[{ label: "À propos" }]} />
        </div>

      {/* Hero section */}
      <section className="py-8unit">
        <div className="max-w-prose">
          <h1 className="text-display-xl text-text mb-6">
            À propos du Labo AI
          </h1>
          <p className="text-intro text-text-body">
            Le laboratoire éditorial français qui démocratise l'intelligence artificielle 
            avec une approche accessible et segmentée par niveau technique.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-8unit border-t border-border">
        <div className="grid lg:grid-cols-2 gap-8unit">
          <div>
            <h2 className="text-display-lg text-text mb-6">Notre mission</h2>
            <div className="prose-article">
              <p>
                L'intelligence artificielle transforme notre monde à une vitesse vertigineuse. 
                Pourtant, la majorité du contenu IA reste soit trop technique, soit trop superficiel, 
                et principalement en anglais.
              </p>
              <p>
                <strong>Le Labo AI</strong> comble ce vide en proposant du contenu IA français 
                <strong>segmenté par niveau technique</strong> : des explications accessibles aux débutants 
                jusqu'aux deep dives architecturaux pour les professionnels.
              </p>
              <p>
                Notre approche ? <strong>Curiosité, rigueur, accessibilité</strong>. 
                On explique, on décrypte, on teste — sans jargon inutile ni simplifications abusives.
              </p>
            </div>
          </div>

          <div className="bg-bg-alt rounded-lg p-6">
            <h3 className="text-display-md text-text mb-4">Nos valeurs</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">🎯</span>
                <div>
                  <strong className="text-text">Accessible</strong>
                  <p className="text-text-body text-sm mt-1">Chaque niveau trouve son contenu, du débutant au confirmé</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">🔬</span>
                <div>
                  <strong className="text-text">Rigoureux</strong>
                  <p className="text-text-body text-sm mt-1">Analyses techniques précises et décryptages approfondis</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl">🇫🇷</span>
                <div>
                  <strong className="text-text">Francophone</strong>
                  <p className="text-text-body text-sm mt-1">Contenu IA de qualité en français, par et pour les francophones</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Niveaux techniques */}
      <section className="py-8unit border-t border-border">
        <h2 className="text-display-lg text-text mb-6">Notre approche segmentée</h2>
        <p className="text-text-body mb-8 max-w-2xl">
          Nous organisons notre contenu en trois niveaux techniques pour que chacun trouve 
          sa place dans l'écosystème IA, quel que soit son background.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(levelConfig).map(([level, config]) => (
            <div key={level} className="border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{config.icon}</span>
                <div>
                  <h3 className="text-display-md text-text">{config.label}</h3>
                  <span 
                    className="text-sm font-medium px-2 py-1 rounded"
                    style={{ backgroundColor: `${config.color}15`, color: config.color }}
                  >
                    {level}
                  </span>
                </div>
              </div>
              <p className="text-text-body mb-3">{config.description}</p>
              <p className="text-text-muted text-sm">
                <strong>Public :</strong> {config.audience}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Équipe */}
      <section className="py-8unit border-t border-border">
        <div className="grid lg:grid-cols-2 gap-8unit">
          <div>
            <h2 className="text-display-lg text-text mb-6">L'équipe</h2>
            <div className="prose-article">
              <h3>Rodolphe du Peloux</h3>
              <p><strong>Fondateur & Rédacteur</strong></p>
              <p>
                Entrepreneur tech passionné par l'intelligence artificielle et son impact 
                sur nos façons de travailler et d'apprendre. Après avoir observé le manque 
                de contenu IA français de qualité, il lance Le Labo AI pour combler ce vide.
              </p>
              <p>
                Son approche ? Traduire les innovations IA en insights pratiques, 
                que vous soyez débutant curieux ou architecte confirmé.
              </p>
            </div>
          </div>

          <div className="bg-bg-alt rounded-lg p-6">
            <h3 className="text-display-md text-text mb-4">Rejoignez l'aventure</h3>
            <p className="text-text-body mb-6">
              Le Labo AI grandit grâce à sa communauté. Vous avez une expertise IA ? 
              Une story à partager ? Des questions qui méritent investigation ?
            </p>
            <div className="space-y-3">
              <a 
                href={`mailto:contact@lelabo.ai?subject=Contribution au Labo AI`}
                className="btn-primary block text-center"
              >
                💌 Nous contacter
              </a>
              <p className="text-text-muted text-sm text-center">
                Contributions, partnerships, interviews — on échange !
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-8unit border-t border-border">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-display-lg text-text mb-6">Notre vision</h2>
          <div className="prose-article">
            <p>
              <strong>Faire du Labo AI la référence IA francophone</strong> — 
              là où débutants, professionnels et experts viennent comprendre, 
              apprendre et décider dans un monde transformé par l'intelligence artificielle.
            </p>
            <p>
              Un lab où la curiosité rencontre la rigueur, où la technique 
              devient accessible, et où l'innovation IA prend du sens.
            </p>
          </div>
          
          <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-text font-medium mb-2">
              🧪 <em>« Expérimenter, comprendre, partager »</em>
            </p>
            <p className="text-text-muted text-sm">
              La devise du Labo AI
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-8unit">
        <NewsletterSignup />
      </section>
      </div>
    </>
  );
}