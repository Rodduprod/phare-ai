export const siteConfig = {
  name: "Le Labo AI",
  // Variantes de marque (FR tape souvent « IA » plutôt que « AI ») — exposées en JSON-LD alternateName
  alternateNames: ["Le Labo IA", "Labo IA", "LaboAI", "Labo AI", "lelabo.ai"],
  tagline: "L'intelligence artificielle, décryptée en français.",
  description:
    "Veille, analyses et décryptages pour suivre l'évolution rapide de l'IA. En français, sans jargon inutile.",
  url: "https://lelabo.ai",
  locale: "fr-FR",
  author: {
    name: "Le Labo AI",
    twitter: "@lelabo_ai",
  },
  nav: [
    { label: "Articles", href: "/articles" },
    { label: "À propos", href: "/a-propos" },
  ],
} as const;
