import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllArticles, getArticlesByLevel, getArticleGroups } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { levelConfig } from "@/lib/articles-types";
import type { ArticleLevel } from "@/lib/articles-types";
import { ArticleGroupCard } from "@/components/ArticleGroupCard";
import { WebsiteSchema } from "@/components/WebsiteSchema";

// Mapping slug URL → niveau réel (gestion des accents)
const SLUG_TO_LEVEL: Record<string, ArticleLevel> = {
  debutant:  'débutant',
  amateur:   'amateur',
  confirme:  'confirmé',
  // Alias avec accents (au cas où)
  'débutant': 'débutant',
  'confirmé': 'confirmé',
};

// Mapping niveau → slug URL canonique (sans accents)
const LEVEL_TO_SLUG: Record<ArticleLevel, string> = {
  'débutant': 'debutant',
  'amateur':  'amateur',
  'confirmé': 'confirme',
};

// Descriptions éditoriales par niveau
const LEVEL_META: Record<ArticleLevel, { h1: string; intro: string }> = {
  'débutant': {
    h1: 'IA pour débutants — Comprendre l\'intelligence artificielle pas à pas',
    intro:
      'Vous entendez parler d\'IA partout mais vous ne savez pas par où commencer ? Ces articles sont faits pour vous. ' +
      'Pas de jargon, pas de prérequis technique : on explique l\'intelligence artificielle simplement, avec des exemples du quotidien. ' +
      'Comprenez ChatGPT, Midjourney, les assistants vocaux et bien plus encore, à votre rythme.',
  },
  'amateur': {
    h1: 'IA pour professionnels — Aller plus loin avec l\'intelligence artificielle',
    intro:
      'Vous connaissez les bases de l\'IA et vous voulez comprendre comment ça fonctionne vraiment ? Ces articles plongent dans les concepts ' +
      'techniques, les use cases professionnels et les décisions d\'architecture. Pour les développeurs, chefs de projet et consultants tech ' +
      'qui veulent intégrer l\'IA intelligemment dans leurs projets.',
  },
  'confirmé': {
    h1: 'IA avancée — Deep dives techniques et analyses expertes',
    intro:
      'Articles pour les experts et chercheurs qui veulent aller au fond des choses : architectures transformer, fine-tuning, ' +
      'RLHF, évaluation de modèles, déploiement en production. Des analyses approfondies pour rester à la pointe ' +
      'de l\'état de l\'art en intelligence artificielle.',
  },
};

interface PageProps {
  params: { level: string };
}


export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const level = SLUG_TO_LEVEL[params.level];
  if (!level) return {};

  const articles = getArticlesByLevel(level);
  const cfg = levelConfig[level];
  const meta = LEVEL_META[level];
  const canonicalUrl = `${siteConfig.url}/articles/level/${LEVEL_TO_SLUG[level]}`;

  const title = `${cfg.label} ${cfg.icon} — ${articles.length} article${articles.length > 1 ? 's' : ''} IA | Le Labo AI`;
  const description = meta.intro.slice(0, 160);

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

export default function LevelPage({ params }: PageProps) {
  const level = SLUG_TO_LEVEL[params.level];
  if (!level) notFound();

  const articlesForLevel = getArticlesByLevel(level);
  if (articlesForLevel.length === 0) notFound();

  // Groupes d'articles filtrés par niveau
  const allGroups = getArticleGroups();
  const groups = allGroups.filter((g) =>
    g.versions.some((v) => v.level === level)
  );

  const cfg = levelConfig[level];
  const meta = LEVEL_META[level];
  const canonicalUrl = `${siteConfig.url}/articles/level/${LEVEL_TO_SLUG[level]}`;

  // Breadcrumb JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `${siteConfig.url}/articles` },
      { '@type': 'ListItem', position: 3, name: cfg.label, item: canonicalUrl },
    ],
  };

  // Schema CollectionPage
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cfg.label} — ${articlesForLevel.length} articles IA | Le Labo AI`,
    description: meta.intro.slice(0, 200),
    url: canonicalUrl,
    isPartOf: { '@type': 'WebSite', name: siteConfig.name, url: siteConfig.url },
    hasPart: articlesForLevel.slice(0, 20).map((a) => ({
      '@type': 'Article',
      name: a.title,
      url: `${siteConfig.url}/articles/${a.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
          <span className="text-text">{cfg.label}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
          >
            {cfg.icon} {cfg.label}
          </div>
          <h1 className="font-display text-display-lg text-text mb-3">
            {meta.h1}
          </h1>
          <p className="text-text-muted text-lg mb-2">
            {groups.length} sujet{groups.length > 1 ? 's' : ''} · {articlesForLevel.length} article{articlesForLevel.length > 1 ? 's' : ''}
          </p>
          <p className="text-text-muted leading-relaxed max-w-3xl">
            {meta.intro}
          </p>
        </header>

        {/* Liens vers les autres niveaux */}
        <div className="flex flex-wrap gap-3 mb-10">
          {(Object.entries(LEVEL_TO_SLUG) as [ArticleLevel, string][])
            .filter(([lvl]) => lvl !== level)
            .map(([lvl, slug]) => {
              const c = levelConfig[lvl];
              return (
                <Link
                  key={lvl}
                  href={`/articles/level/${slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-border hover:border-primary text-text-muted hover:text-primary transition-colors"
                >
                  {c.icon} {c.label}
                </Link>
              );
            })}
        </div>

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
