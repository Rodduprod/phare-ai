import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug, getArticleSiblings, getRelatedArticles, getCanonicalSlug } from "@/lib/articles";
import { levelConfig } from "@/lib/articles-types";
import { formatDate } from "@/lib/utils";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { ArticleSchema } from "@/components/ArticleSchema";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LevelSwitcher } from "@/components/LevelSwitcher";
import { RelatedArticles } from "@/components/RelatedArticles";
import { ReadingProgress } from "@/components/ReadingProgress";
import { TableOfContents } from "@/components/TableOfContents";
import { extractHeadings } from "@/lib/toc";
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

  const canonicalSlug = getCanonicalSlug(params.slug);
  const canonicalUrl = `${siteConfig.url}/articles/${canonicalSlug}`;

  const ogImage = article.image
    ? (article.image.startsWith('http') ? article.image : `${siteConfig.url}${article.image}`)
    : `${siteConfig.url}/api/og?title=${encodeURIComponent(article.title)}&description=${encodeURIComponent(article.description)}&level=${encodeURIComponent(article.level)}&tags=${encodeURIComponent(article.tags.slice(0, 4).join(','))}`;

  return {
    title: article.title,
    description: article.description,
    keywords: [...article.tags, 'intelligence artificielle', 'IA', LEVEL_SECTION[article.level] ?? ''].filter(Boolean).join(', '),
    authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
    alternates: {
      canonical: canonicalUrl,
      languages: { 'fr': canonicalUrl, 'fr-FR': canonicalUrl, 'x-default': canonicalUrl },
      types: { 'application/rss+xml': '/rss.xml' },
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: `${article.date}T00:00:00.000Z`,
      modifiedTime: `${article.date}T00:00:00.000Z`,
      authors: [siteConfig.author.name],
      tags: article.tags,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: 'fr_FR',
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
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
      index: true, follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
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

  const siblings = getArticleSiblings(params.slug);
  const allVersions: ArticleVersion[] = [
    { level: article.level, slug: article.slug, readingTime: article.readingTime },
    ...siblings.map((s) => ({ level: s.level, slug: s.slug, readingTime: s.readingTime })),
  ];
  const isMultiVersion = allVersions.length > 1;
  const lv = levelConfig[article.level];

  const siblingsSlugs = siblings.map((s) => s.slug);
  const related = getRelatedArticles(params.slug, 3).filter((a) => !siblingsSlugs.includes(a.slug));

  // Table des matières extraite côté serveur
  const tocItems = extractHeadings(article.content);

  return (
    <>
      <ArticleSchema
        article={article}
        breadcrumbs={[
          { name: "Articles", url: `${siteConfig.url}/articles` },
          { name: article.title, url: `${siteConfig.url}/articles/${article.slug}` },
        ]}
      />

      {/* Barre de progression */}
      <ReadingProgress color={lv.color} />

      {/* Cover image — full bleed avec overlay */}
      {article.image && (
        <div className="w-full aspect-[21/7] relative mb-0 overflow-hidden">
          <OptimizedImage
            src={article.image}
            alt={article.title}
            fill
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent" />
        </div>
      )}

      {/* Wrapper principal */}
      <div className="max-w-6xl mx-auto px-6">

        {/* Breadcrumbs */}
        <div className={article.image ? 'pt-4' : 'pt-10'}>
          <Breadcrumbs items={[{ label: "Articles", href: "/articles" }, { label: article.title }]} />
        </div>

        {/* Layout : header + [prose | ToC] */}
        <div className="article-layout">

          {/* Colonne principale */}
          <div className="article-main">

            {/* Header */}
            <header className="pb-8 border-b border-border mb-10">

              {/* Badges niveau + tags */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-sm font-semibold"
                  style={{ borderColor: lv.color, color: lv.color, backgroundColor: `${lv.color}15` }}
                >
                  <span>{lv.icon}</span>
                  <span>{lv.label}</span>
                </span>
                {article.tags.slice(0, 3).map((tag) => (
                  <Link
                    key={tag}
                    href={`/articles/tag/${tag.toLowerCase()}`}
                    className="tag-pill tag-pill-default hover:text-primary transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Titre */}
              <h1 className="article-title">
                {article.title}
              </h1>

              {/* Description / chapô */}
              {article.description && (
                <p className="article-lead">
                  {article.description}
                </p>
              )}

              {/* Level switcher */}
              {isMultiVersion && (
                <div className="mb-5">
                  <LevelSwitcher currentLevel={article.level} versions={allVersions} />
                </div>
              )}

              {/* Méta */}
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <time dateTime={article.date} className="font-medium">{formatDate(article.date)}</time>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{article.readingTime}</span>
                {isMultiVersion && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{allVersions.length} niveaux disponibles</span>
                  </>
                )}
              </div>
            </header>

            {/* Corps de l'article */}
            <div className="prose-article">
              <MDXRemote
                source={article.content}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [
                      rehypeHighlight,
                      rehypeSlug,
                    ],
                  },
                }}
              />
            </div>

            {/* Footer article */}
            <footer className="mt-16 pt-8 border-t border-border">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Link href="/articles" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary font-medium transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Tous les articles
                </Link>

                {/* Partage */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-muted">Partager :</span>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`${siteConfig.url}/articles/${article.slug}`)}`}
                    target="_blank" rel="noopener"
                    className="share-btn"
                    aria-label="Partager sur X"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.213 5.567 5.951-5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X
                  </a>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`${siteConfig.url}/articles/${article.slug}`)}&title=${encodeURIComponent(article.title)}`}
                    target="_blank" rel="noopener"
                    className="share-btn"
                    aria-label="Partager sur LinkedIn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </div>
            </footer>

            {/* Articles liés */}
            <RelatedArticles articles={related} />
          </div>

          {/* Sidebar ToC */}
          {tocItems.length >= 2 && (
            <aside className="article-sidebar">
              <div className="toc-sticky">
                <TableOfContents items={tocItems} />

                {/* Mini level switcher dans la sidebar */}
                {isMultiVersion && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
                      Changer de niveau
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {allVersions
                        .sort((a, b) => {
                          const order = { débutant: 0, amateur: 1, confirmé: 2 };
                          return (order[a.level as keyof typeof order] ?? 0) - (order[b.level as keyof typeof order] ?? 0);
                        })
                        .map((v) => {
                          const cfg = levelConfig[v.level];
                          const isCurrent = v.level === article.level;
                          return (
                            <Link
                              key={v.level}
                              href={`/articles/${v.slug}`}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                isCurrent
                                  ? 'font-semibold'
                                  : 'text-text-muted hover:text-text hover:bg-bg-alt'
                              }`}
                              style={isCurrent ? {
                                backgroundColor: `${cfg.color}12`,
                                color: cfg.color,
                                border: `1px solid ${cfg.color}40`,
                              } : {}}
                            >
                              <span>{cfg.icon}</span>
                              <span>{cfg.label}</span>
                              {isCurrent && <span className="ml-auto text-xs opacity-60">actuel</span>}
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
