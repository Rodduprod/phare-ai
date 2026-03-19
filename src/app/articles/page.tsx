import { getAllArticles, getAllTags } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = {
  title: "Articles",
  description: "Tous les articles Signal IA — veille, analyses et décryptages de l'intelligence artificielle.",
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const tags = getAllTags();

  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="pt-8">
        <Breadcrumbs items={[{ label: "Articles" }]} />
      </div>
      
      <section className="py-8 border-b border-ink-100">
        <h1 className="font-display text-display-lg text-ink-950 mb-4">
          Articles
        </h1>
        <p className="text-ink-500 font-body max-w-xl">
          Veille, analyses et décryptages pour comprendre ce qui se passe dans le monde de l'IA.
        </p>

        {/* Tag filters */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {tags.map((tag) => (
              <span key={tag} className="tag-pill tag-pill-default cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="stagger">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="py-20 text-center text-ink-400 font-body">
          Aucun article pour le moment. Revenez bientôt !
        </p>
      )}

      <NewsletterSignup />
    </div>
  );
}
