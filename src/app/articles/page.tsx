import { getArticleGroups, getAllTags } from "@/lib/articles";
import { ClientArticlesPage } from "@/components/ClientArticlesPage";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = {
  title: "Articles",
  description: "Tous les articles Signal IA — veille, analyses et décryptages de l'intelligence artificielle.",
};

export default function ArticlesPage() {
  const groups = getArticleGroups();

  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="pt-8">
        <Breadcrumbs items={[{ label: "Articles" }]} />
      </div>

      <section className="py-8 border-b border-ink-100 mb-8">
        <h1 className="font-display text-display-lg text-ink-950 mb-4">
          Articles
        </h1>
        <p className="text-ink-500 font-body max-w-xl">
          Chaque sujet est disponible en plusieurs niveaux — choisissez celui qui vous correspond.
        </p>
      </section>

      <ClientArticlesPage groups={groups} />

      <NewsletterSignup />
    </div>
  );
}
