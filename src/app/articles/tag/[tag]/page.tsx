import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticlesByTagSlug, resolveTagFromSlug, getArticleGroups } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { slugifyTag } from "@/lib/utils";
import { ArticleGroupCard } from "@/components/ArticleGroupCard";
import { WebsiteSchema } from "@/components/WebsiteSchema";
import { tagDescriptions } from "@/lib/tag-descriptions";

interface PageProps {
  params: { tag: string };
}

// ISR: pages revalidées toutes les 24h (évite le timeout build)
export const dynamicParams = true;
export const revalidate = 86400;


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = slugifyTag(decodeURIComponent(params.tag));
  const articles = getArticlesByTagSlug(slug);
  if (articles.length === 0) return {};

  const tag = resolveTagFromSlug(slug) ?? decodeURIComponent(params.tag);

  // Niveaux disponibles pour ce tag
  const levels = Array.from(new Set(articles.map((a) => a.level)));
  const levelsLabel = levels
    .map((l) => l === 'débutant' ? 'débutant' : l === 'amateur' ? 'intermédiaire' : 'expert')
    .join(', ');

  // Tag capitalisé + description éditoriale si disponible
  const tagCapitalized = tag.charAt(0).toUpperCase() + tag.slice(1);
  const tagMeta = tagDescriptions[tag.toLowerCase()] ?? null;
  const displayTitle = tagMeta?.title ?? tagCapitalized;

  const title = `${displayTitle} | Le Labo AI — ${articles.length} article${articles.length > 1 ? 's' : ''}`;
  const description = tagMeta?.description
    ? tagMeta.description.slice(0, 160)
    : `${articles.length} article${articles.length > 1 ? 's' : ''} sur "${tag}" en français — niveaux ${levelsLabel}. Comprendre l'IA facilement, quel que soit votre profil.`;
  const canonicalUrl = `${siteConfig.url}/articles/tag/${slug}`;

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
  const slug = slugifyTag(decodeURIComponent(params.tag));
  const articlesForTag = getArticlesByTagSlug(slug);

  if (articlesForTag.length === 0) notFound();

  const tag = resolveTagFromSlug(slug) ?? decodeURIComponent(params.tag);

  // Récupère les groupes filtrés par ce tag
  const allGroups = getArticleGroups();
  const groups = allGroups.filter((g) =>
    g.tags.some((t) => slugifyTag(t) === slug)
  );

  const canonicalUrl = `${siteConfig.url}/articles/tag/${slug}`;

  // Niveaux disponibles (pour affichage + schema)
  const levels = Array.from(new Set(articlesForTag.map((a) => a.level)));
  const levelsLabel = levels
    .map((l) => l === 'débutant' ? 'débutant' : l === 'amateur' ? 'intermédiaire' : 'expert')
    .join(', ');
  const tagCapitalized = tag.charAt(0).toUpperCase() + tag.slice(1);

  // Contenu éditorial SEO pour ce tag
  const tagMeta = tagDescriptions[tag.toLowerCase()] ?? null;

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
            {tagMeta?.title ?? tagCapitalized}
          </h1>
          <p className="text-text-muted text-lg mb-4">
            {groups.length} sujet{groups.length > 1 ? 's' : ''} · {articlesForTag.length} article{articlesForTag.length > 1 ? 's' : ''} · niveaux {levelsLabel}
          </p>
          {tagMeta?.description && (
            <p className="text-text-muted leading-relaxed max-w-3xl">
              {tagMeta.description}
            </p>
          )}
        </header>

        {/* Grille d'articles */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, index) => (
            <ArticleGroupCard key={group.topic} group={group} priority={index < 3} />
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
