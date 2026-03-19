import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";

export async function GET() {
  const articles = getAllArticles();
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Home page -->
  <url>
    <loc>${siteConfig.url}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  
  <!-- Articles listing -->
  <url>
    <loc>${siteConfig.url}/articles</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>
  
  <!-- Individual articles -->
  ${articles
    .filter(article => article.published)
    .map(article => `  <url>
    <loc>${siteConfig.url}/articles/${article.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <lastmod>${article.date}T00:00:00.000Z</lastmod>
  </url>`)
    .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}