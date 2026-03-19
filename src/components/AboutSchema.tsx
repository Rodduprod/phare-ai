import { siteConfig } from "@/lib/config";

export function AboutSchema() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/images/logo.svg`,
      width: 400,
      height: 120,
    },
    foundingDate: "2026",
    founder: {
      "@type": "Person",
      name: "Rodolphe du Peloux",
      jobTitle: "Fondateur & Rédacteur",
      description: "Entrepreneur tech passionné par l'intelligence artificielle et son impact sur nos façons de travailler et d'apprendre.",
      worksFor: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    },
    areaServed: {
      "@type": "Country",
      name: "France"
    },
    inLanguage: "fr-FR",
    publishingPrinciples: `${siteConfig.url}/a-propos`,
    knowsAbout: [
      "Intelligence Artificielle",
      "Machine Learning", 
      "Large Language Models",
      "Agents IA",
      "Outils IA",
      "Formation IA",
      "Vulgarisation technique",
      "Innovation technologique"
    ],
    audience: [
      {
        "@type": "Audience",
        audienceType: "Débutants en IA",
        description: "Personnes découvrant l'intelligence artificielle sans background technique"
      },
      {
        "@type": "Audience", 
        audienceType: "Professionnels tech amateurs IA",
        description: "Développeurs, chefs de projet tech explorant l'IA"
      },
      {
        "@type": "Audience",
        audienceType: "Experts techniques IA", 
        description: "Architectes, ingénieurs ML, consultants IA confirmés"
      }
    ],
    mission: "Démocratiser l'intelligence artificielle en français avec une approche accessible et segmentée par niveau technique",
    values: [
      "Accessibilité - Chaque niveau trouve son contenu",
      "Rigueur - Analyses techniques précises et décryptages approfondis", 
      "Francophone - Contenu IA de qualité en français"
    ],
    sameAs: [
      `https://twitter.com/${siteConfig.author.twitter.replace('@', '')}`,
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "fr-FR",
    about: {
      "@type": "Thing",
      name: "Intelligence Artificielle",
      description: "Démocratisation et vulgarisation de l'IA en français"
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      "@type": "AboutPage",
      name: "À propos du Labo AI",
      description: "La mission et l'approche du laboratoire éditorial français qui démocratise l'intelligence artificielle",
      url: `${siteConfig.url}/a-propos`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema, null, 2),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema, null, 2),
        }}
      />
    </>
  );
}