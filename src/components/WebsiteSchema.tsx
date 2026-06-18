import { siteConfig } from "@/lib/config";

export function WebsiteSchema() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: siteConfig.alternateNames,
    description: siteConfig.description,
    url: siteConfig.url,
    inLanguage: "fr-FR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint", 
        urlTemplate: `${siteConfig.url}/articles?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: siteConfig.alternateNames,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: {
      "@type": "ImageObject", 
      url: `${siteConfig.url}/images/logo.svg`,
      width: 400,
      height: 120,
    },
    sameAs: [
      `https://twitter.com/${siteConfig.author.twitter.replace('@', '')}`,
    ],
    foundingDate: "2026",
    knowsAbout: [
      "Intelligence Artificielle",
      "Machine Learning", 
      "Large Language Models",
      "Agents IA",
      "Outils IA",
      "Formation IA"
    ],
    areaServed: {
      "@type": "Country",
      name: "France"
    },
    audience: {
      "@type": "Audience",
      audienceType: "Professionnels, Entrepreneurs, Curieux de l'IA"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema, null, 2),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema, null, 2),
        }}
      />
    </>
  );
}