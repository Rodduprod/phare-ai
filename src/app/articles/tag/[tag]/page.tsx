import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllArticles, getArticlesByTag, getArticleGroups } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { ArticleGroupCard } from "@/components/ArticleGroupCard";
import { WebsiteSchema } from "@/components/WebsiteSchema";

interface PageProps {
  params: { tag: string };
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  const tags = new Set<string>();
  articles.forEach((a) => a.tags.forEach((t) => tags.add(t.toLowerCase())));
  return Array.from(tags).map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  const articles = getArticlesByTag(tag);
  if (articles.length === 0) return {};

  // Niveaux disponibles pour ce tag
  const levels = Array.from(new Set(articles.map((a) => a.level)));
  const levelsLabel = levels
    .map((l) => l === 'débutant' ? 'débutant' : l === 'amateur' ? 'intermédiaire' : 'expert')
    .join(', ');

  // Tag capitalisé pour les titres
  const tagCapitalized = tag.charAt(0).toUpperCase() + tag.slice(1);

  const title = `${tagCapitalized} | Le Labo AI — ${articles.length} article${articles.length > 1 ? 's' : ''}`;
  const description = `${articles.length} article${articles.length > 1 ? 's' : ''} sur "${tag}" en français — niveaux ${levelsLabel}. Comprendre l'IA facilement, quel que soit votre profil.`;
  const canonicalUrl = `${siteConfig.url}/articles/tag/${tag}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'fr':        canonicalUrl,
        'fr-FR':     canonicalUrl,
        'x-default': canonicalUrl,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default function TagPage({ params }: PageProps) {
  const tag = decodeURIComponent(params.tag);
  const articlesForTag = getArticlesByTag(tag);

  if (articlesForTag.length === 0) notFound();

  // Récupère les groupes filtrés par ce tag
  const allGroups = getArticleGroups();
  const groups = allGroups.filter((g) =>
    g.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
  );

  const canonicalUrl = `${siteConfig.url}/articles/tag/${tag}`;

  // Niveaux disponibles (pour affichage + schema)
  const levels = Array.from(new Set(articlesForTag.map((a) => a.level)));
  const levelsLabel = levels
    .map((l) => l === 'débutant' ? 'débutant' : l === 'amateur' ? 'intermédiaire' : 'expert')
    .join(', ');
  const tagCapitalized = tag.charAt(0).toUpperCase() + tag.slice(1);

  // Schema CollectionPage pour ce tag
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tagCapitalized} — ${articlesForTag.length} articles | Le Labo AI`,
    description: `${articlesForTag.length} articles sur "${tag}" en français — niveaux ${levelsLabel}.`,
    url: canonicalUrl,
    isPartOf: { '@type': 'WebSite', name: siteConfig.name, url: siteConfig.url },
    hasPart: articlesForTag.map((a) => ({
      '@type': 'Article',
      name: a.title,
      url: `${siteConfig.url}/articles/${a.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <WebsiteSchema />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-primary transition-colors">Articles</Link>
          <span>/</span>
          <span className="text-text">{tag}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            🏷️ {tag}
          </div>
          <h1 className="font-display text-display-lg text-text mb-3">
            {tagCapitalized}
          </h1>
          <p className="text-text-muted text-lg">
            {groups.length} sujet{groups.length > 1 ? 's' : ''} · {articlesForTag.length} article{articlesForTag.length > 1 ? 's' : ''} · niveaux {levelsLabel}
          </p>
        </header>

        {/* Grille d'articles */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <ArticleGroupCard key={group.topic} group={group} />
          ))}
        </div>

        {/* Retour */}
        <div className="mt-12 text-center">
          <Link
            href="/articles"
            className="text-sm text-text-muted hover:text-primary transition-colors"
          >
            ← Tous les articles
          </Link>
        </div>
      </div>
    </>
  );
}
