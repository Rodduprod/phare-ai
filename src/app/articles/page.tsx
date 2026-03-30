import { getArticleGroups, getAllTags } from "@/lib/articles";
import { Suspense } from "react";
import { ClientArticlesPage } from "@/components/ClientArticlesPage";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
  description: "Tous les articles Le Labo AI — veille, analyses et décryptages de l'intelligence artificielle en français, pour tous les niveaux.",
  keywords: "intelligence artificielle, IA, articles, machine learning, LLM, ChatGPT, Claude, outils IA, agents IA",
  alternates: {
    canonical: `${siteConfig.url}/articles`,
    languages: {
      'fr':    `${siteConfig.url}/articles`,
      'fr-FR': `${siteConfig.url}/articles`,
      'x-default': `${siteConfig.url}/articles`,
    },
    types: { 'application/rss+xml': '/rss.xml' },
  },
  openGraph: {
    title: `Articles — ${siteConfig.name}`,
    description: "Veille, analyses et décryptages de l'IA en français. Chaque sujet décliné en 3 niveaux : débutant, amateur, confirmé.",
    url: `${siteConfig.url}/articles`,
    siteName: siteConfig.name,
    locale: 'fr_FR',
    images: [{ url: `${siteConfig.url}/og-image-default.png`, width: 1200, height: 630 }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
};

function CollectionPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteConfig.url}/articles`,
    name: `Articles — ${siteConfig.name}`,
    description: "Veille, analyses et décryptages de l'IA en français, pour tous les niveaux.",
    url: `${siteConfig.url}/articles`,
    inLanguage: "fr-FR",
    isPartOf: { "@type": "WebSite", "@id": siteConfig.url, name: siteConfig.name },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Articles", item: `${siteConfig.url}/articles` },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function ArticlesPage() {
  const groups = getArticleGroups();

  return (
    <>
      <CollectionPageSchema />
      <div className="max-w-5xl mx-auto px-6">
        <div className="pt-8">
          <Breadcrumbs items={[{ label: "Articles" }]} />
        </div>

        <section className="py-8 border-b border-ink-100 mb-8">
          <h1 className="font-display text-display-lg text-ink-950 mb-4">
            Articles
          </h1>
          <p className="text-ink-500 font-body max-w-xl">
            Chaque sujet est disponible en plusieurs niveaux — choisissez celui qui vous correspond.
          </p>
        </section>

        <Suspense fallback={<div className="py-8 text-center text-text-muted">Chargement…</div>}>
          <ClientArticlesPage groups={groups} />
        </Suspense>

        <NewsletterSignup />
      </div>
    </>
  );
}
