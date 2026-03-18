import { getAllArticles } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { siteConfig } from "@/lib/config";

export default function HomePage() {
  const articles = getAllArticles();
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Hero */}
      <section className="py-20 sm:py-28 border-b border-ink-100">
        <p className="text-signal font-body text-sm font-medium tracking-wide uppercase mb-5 animate-fade-up">
          Veille & décryptages
        </p>
        <h1 className="font-display text-display-xl text-ink-950 max-w-3xl animate-fade-up"
            style={{ animationDelay: "0.1s" }}>
          {siteConfig.tagline}
        </h1>
        <p className="font-body text-lg text-ink-500 mt-6 max-w-xl animate-fade-up"
           style={{ animationDelay: "0.2s" }}>
          {siteConfig.description}
        </p>
      </section>

      {/* Featured article */}
      {featured && (
        <section className="py-12">
          <p className="text-xs font-body font-medium tracking-widest uppercase text-ink-400 mb-6">
            Dernier article
          </p>
          <ArticleCard article={featured} />
        </section>
      )}

      {/* Article list */}
      {rest.length > 0 && (
        <section>
          <p className="text-xs font-body font-medium tracking-widest uppercase text-ink-400 mb-2">
            Précédents
          </p>
          <div className="stagger">
            {rest.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <NewsletterSignup />
    </div>
  );
}
