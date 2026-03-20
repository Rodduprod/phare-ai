import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";

// Google News Sitemap — articles des 2 derniers jours
export async function GET() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  const recentArticles = getAllArticles()
    .filter((a) => a.published && new Date(a.date) >= twoDaysAgo)
    .slice(0, 1000); // Limite Google News

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentArticles
  .map(
    (article) => `  <url>
    <loc>${siteConfig.url}/articles/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${siteConfig.name}</news:name>
        <news:language>fr</news:language>
      </news:publication>
      <news:publication_date>${new Date(article.date).toISOString()}</news:publication_date>
      <news:title>${article.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>
      <news:keywords>${article.tags.join(', ')}</news:keywords>
    </news:news>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=3600',
    },
  });
}
