import { Article } from "@/lib/articles";
import { siteConfig } from "@/lib/config";

interface ArticleSchemaProps {
  article: Article;
}

export function ArticleSchema({ article }: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Person",
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
      "@id": `${siteConfig.url}/articles/${article.slug}`,
    },
    url: `${siteConfig.url}/articles/${article.slug}`,
    ...(article.image && {
      image: {
        "@type": "ImageObject",
        url: article.image.startsWith('http') ? article.image : `${siteConfig.url}${article.image}`,
        width: 1200,
        height: 630,
      },
    }),
    keywords: article.tags.join(", "),
    articleSection: "Intelligence Artificielle",
    inLanguage: "fr-FR",
    ...(article.readingTime && {
      timeRequired: `PT${article.readingTime.replace(/\D/g, '')}M`,
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  );
}