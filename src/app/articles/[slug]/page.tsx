import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug, getArticleSiblings, getRelatedArticles } from "@/lib/articles";
import { levelConfig } from "@/lib/articles-types";
import { formatDate } from "@/lib/utils";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { ArticleSchema } from "@/components/ArticleSchema";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LevelSwitcher } from "@/components/LevelSwitcher";
import { RelatedArticles } from "@/components/RelatedArticles";
import type { ArticleVersion } from "@/lib/articles-types";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

const LEVEL_SECTION: Record<string, string> = {
  débutant: 'IA pour débutants',
  amateur:  'IA pour professionnels',
  confirmé: 'IA avancée',
};

const LEVEL_EDUCATIONAL: Record<string, string> = {
  débutant: 'Beginner',
  amateur:  'Intermediate',
  confirmé: 'Advanced',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};

  const canonicalUrl = `${siteConfig.url}/articles/${article.slug}`;

  // OG image : cover de l'article si dispo, sinon image générée dynamiquement
  const ogImage = article.image
    ? (article.image.startsWith('http') ? article.image : `${siteConfig.url}${article.image}`)
    : `${siteConfig.url}/api/og?title=${encodeURIComponent(article.title)}&description=${encodeURIComponent(article.description)}&level=${encodeURIComponent(article.level)}&tags=${encodeURIComponent(article.tags.slice(0, 4).join(','))}`;

  return {
    title: article.title,
    description: article.description,
    keywords: [
      ...article.tags,
      'intelligence artificielle',
      'IA',
      LEVEL_SECTION[article.level] ?? '',
    ].filter(Boolean).join(', '),
    authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'fr':    canonicalUrl,
        'fr-FR': canonicalUrl,
        'x-default': canonicalUrl,
      },
      types: { 'application/rss+xml': '/rss.xml' },
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: `${article.date}T00:00:00.000Z`,
      modifiedTime:  `${article.date}T00:00:00.000Z`,
      authors: [siteConfig.author.name],
      tags: article.tags,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: 'fr_FR',
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: article.title,
      }],
      section: LEVEL_SECTION[article.level] ?? 'Intelligence Artificielle',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      creator: siteConfig.author.twitter,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'article:section': LEVEL_SECTION[article.level] ?? 'Intelligence Artificielle',
      'article:tag': article.tags.join(','),
      'educational-level': LEVEL_EDUCATIONAL[article.level] ?? 'Intermediate',
    },
  };
}

export default function ArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  // Récupère les siblings (autres niveaux du même topic)
  const siblings = getArticleSiblings(params.slug);
  const allVersions: ArticleVersion[] = [
    { level: article.level, slug: article.slug, readingTime: article.readingTime },
    ...siblings.map((s) => ({ level: s.level, slug: s.slug, readingTime: s.readingTime })),
  ];
  const isMultiVersion = allVersions.length > 1;
  const currentLevelConfig = levelConfig[article.level];

  // Articles liés (même niveau ou tags similaires, hors siblings)
  const siblingsSlugs = siblings.map((s) => s.slug);
  const related = getRelatedArticles(params.slug, 3)
    .filter((a) => !siblingsSlugs.includes(a.slug));

  return (
    <>
      {/* JSON-LD Schema */}
      <ArticleSchema
        article={article}
        breadcrumbs={[
          { name: "Articles", url: `${siteConfig.url}/articles` },
          { name: article.title, url: `${siteConfig.url}/articles/${article.slug}` },
        ]}
      />

      <div className="max-w-3xl mx-auto px-6">
        {/* Breadcrumbs */}
        <div className="pt-8">
          <Breadcrumbs 
            items={[
              { label: "Articles", href: "/articles" },
              { label: article.title }
            ]} 
          />
        </div>
        
        {/* Back link */}
        <div className="mb-4">
          <Link
            href="/articles"
            className="text-sm text-ink-400 hover:text-ink-700 font-body transition-colors inline-flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tous les articles
          </Link>
        </div>

        {/* Cover image hero */}
        {article.image && (
          <div className="mt-6 mb-8 overflow-hidden rounded-xl aspect-[16/7] relative">
            <OptimizedImage
              src={article.image}
              alt={article.title}
              width={768}
              height={336}
              className="w-full h-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* Article header */}
        <header className="pb-10 border-b border-ink-100">
          <div className="flex items-center gap-2 mb-4">
            {/* Badge niveau */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-sm font-medium"
              style={{
                borderColor: currentLevelConfig.color,
                color: currentLevelConfig.color,
                backgroundColor: `${currentLevelConfig.color}15`,
              }}
            >
              <span>{currentLevelConfig.icon}</span>
              <span>{currentLevelConfig.label}</span>
            </span>

            {article.tags.map((tag) => (
              <span key={tag} className="tag-pill tag-pill-signal">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="font-display text-display-lg text-ink-950 mb-4">
            {article.title}
          </h1>

          {article.description && (
            <p className="text-lg text-ink-500 font-body leading-relaxed mb-6 max-w-2xl">
              {article.description}
            </p>
          )}

          {/* Level switcher — visible seulement si d'autres versions existent */}
          {isMultiVersion && (
            <LevelSwitcher currentLevel={article.level} versions={allVersions} />
          )}

          <div className="flex items-center gap-4 text-sm text-ink-400 font-body mt-4">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span className="w-1 h-1 rounded-full bg-ink-300" />
            <span>{article.readingTime}</span>
          </div>
        </header>

        {/* Article body */}
        <div className="prose-article py-12">
          <MDXRemote
            source={article.content}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeHighlight],
              },
            }}
          />
        </div>

        {/* Articles liés */}
        <RelatedArticles articles={related} />

        {/* Article footer */}
        <footer className="border-t border-ink-100 py-12">
          <div className="flex items-center justify-between">
            <Link
              href="/articles"
              className="text-sm text-ink-500 hover:text-signal font-body font-medium transition-colors"
            >
              ← Retour aux articles
            </Link>
            <div className="flex gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`${siteConfig.url}/articles/${article.slug}`)}`}
                target="_blank"
                rel="noopener"
                className="text-sm text-ink-400 hover:text-signal transition-colors"
              >
                Partager sur X
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
