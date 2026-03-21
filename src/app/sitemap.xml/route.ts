import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";

// Calcule la changefreq selon l'âge de l'article
function changefreq(dateStr: string): string {
  const ageDays = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays < 7) return 'daily';
  if (ageDays < 30) return 'weekly';
  if (ageDays < 180) return 'monthly';
  return 'yearly';
}

// Priorité selon le niveau (débutant = plus grand public = plus prioritaire)
function levelPriority(level: string): string {
  switch (level) {
    case 'débutant': return '0.95';
    case 'amateur':  return '0.90';
    case 'confirmé': return '0.80';
    default:         return '0.85';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toISOString();
}

export async function GET() {
  const articles = getAllArticles().filter((a) => a.published);

  // Tags uniques
  const tags = Array.from(new Set(articles.flatMap((a) => a.tags.map((t) => t.toLowerCase()))));

  const staticPages = [
    { url: siteConfig.url,             priority: '1.0',  changefreq: 'daily',   lastmod: new Date().toISOString() },
    { url: `${siteConfig.url}/articles`, priority: '0.9',  changefreq: 'daily',   lastmod: new Date().toISOString() },
    { url: `${siteConfig.url}/a-propos`, priority: '0.5',  changefreq: 'monthly', lastmod: new Date().toISOString() },
  ];

  const articleUrls = articles.map((article) => ({
    url: `${siteConfig.url}/articles/${article.slug}`,
    priority: levelPriority(article.level),
    changefreq: changefreq(article.date),
    lastmod: formatDate(article.date),
  }));

  const tagUrls = tags.map((tag) => ({
    url: `${siteConfig.url}/articles/tag/${tag}`,
    priority: '0.70',
    changefreq: 'weekly',
    lastmod: new Date().toISOString(),
  }));

  const allUrls = [...staticPages, ...articleUrls, ...tagUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
