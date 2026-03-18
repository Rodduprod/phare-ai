import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/config";
import { Feed } from "feed";

export async function GET() {
  const articles = getAllArticles();

  const feed = new Feed({
    title: siteConfig.name,
    description: siteConfig.description,
    id: siteConfig.url,
    link: siteConfig.url,
    language: "fr",
    copyright: `${new Date().getFullYear()} ${siteConfig.name}`,
    author: {
      name: siteConfig.author.name,
    },
  });

  articles.forEach((article) => {
    feed.addItem({
      title: article.title,
      id: `${siteConfig.url}/articles/${article.slug}`,
      link: `${siteConfig.url}/articles/${article.slug}`,
      description: article.description,
      date: new Date(article.date),
      category: article.tags.map((t) => ({ name: t })),
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
