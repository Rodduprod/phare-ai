import { getAllArticles } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { siteConfig } from "@/lib/config";
import { WebsiteSchema } from "@/components/WebsiteSchema";

export default function HomePage() {
  const articles = getAllArticles();

  return (
    <>
      {/* JSON-LD Schema */}
      <WebsiteSchema />
      
      <div className="max-w-content mx-auto px-4unit">
        {/* Hero section */}
        <section className="py-8unit border-b border-border">
          <p className="text-primary font-medium text-meta tracking-wide uppercase mb-5">
            Veille & décryptages
          </p>
          <h1 className="text-display-xl text-text max-w-3xl mb-6">
            {siteConfig.tagline}
          </h1>
          <p className="text-intro text-text-body max-w-xl">
            {siteConfig.description}
          </p>
        </section>

        {/* Grille d'articles selon charte : 1/2/3 colonnes */}
        {articles.length > 0 && (
          <section className="py-8unit">
            <h2 className="text-display-lg text-text mb-8">Articles récents</h2>
            
            <div className="grid gap-3unit sm:grid-cols-2 lg:grid-cols-3 stagger">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {articles.length === 0 && (
          <section className="py-8unit text-center">
            <p className="text-text-muted">
              Aucun article pour le moment. Revenez bientôt !
            </p>
          </section>
        )}

        {/* Newsletter */}
        <NewsletterSignup />
      </div>
    </>
  );
}
