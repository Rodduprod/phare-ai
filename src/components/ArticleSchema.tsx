import { Article } from "@/lib/articles-types";
import { siteConfig } from "@/lib/config";

interface ArticleSchemaProps {
  article: Article;
  breadcrumbs?: { name: string; url: string }[];
}

const EDUCATIONAL_LEVEL: Record<string, string> = {
  débutant: 'Beginner',
  amateur:  'Intermediate',
  confirmé: 'Advanced',
};

const EDUCATIONAL_USE: Record<string, string> = {
  débutant: 'Reading, General Education',
  amateur:  'Professional Development',
  confirmé: 'Technical Training',
};

export function ArticleSchema({ article, breadcrumbs }: ArticleSchemaProps) {
  const canonicalUrl = `${siteConfig.url}/articles/${article.slug}`;
  const ogImage = article.image
    ? (article.image.startsWith('http') ? article.image : `${siteConfig.url}${article.image}`)
    : `${siteConfig.url}/og-image-default.png`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": canonicalUrl,
    headline: article.title,
    description: article.description,
    datePublished: `${article.date}T00:00:00.000Z`,
    dateModified:  `${article.date}T00:00:00.000Z`,
    url: canonicalUrl,
    inLanguage: "fr-FR",
    keywords: article.tags.join(", "),
    articleSection: "Intelligence Artificielle",
    educationalLevel: EDUCATIONAL_LEVEL[article.level] ?? "Intermediate",
    educationalUse: EDUCATIONAL_USE[article.level] ?? "Reading",
    teaches: article.tags.map((tag) => ({
      "@type": "DefinedTerm",
      name: tag,
    })),
    image: {
      "@type": "ImageObject",
      url: ogImage,
      width: 1200,
      height: 630,
    },
    author: {
      "@type": "Organization",
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/logo.svg`,
        width: 400,
        height: 120,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    isAccessibleForFree: true,
    ...(article.readingTime && {
      timeRequired: `PT${article.readingTime.replace(/\D/g, '')}M`,
    }),
  };

  // BreadcrumbList automatique
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: siteConfig.url,
          },
          ...breadcrumbs.map((crumb, i) => ({
            "@type": "ListItem",
            position: i + 2,
            name: crumb.name,
            item: crumb.url,
          })),
        ],
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}
