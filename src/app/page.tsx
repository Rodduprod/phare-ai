import type { Metadata } from "next";
import { getArticleGroups } from "@/lib/articles-server";
import { getAllModules } from "@/lib/formation";
import { WebsiteSchema } from "@/components/WebsiteSchema";
import { ClientHomePage } from "@/components/ClientHomePage";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    absolute:
      "Le Labo AI — l'actualité de l'intelligence artificielle (IA) en français",
  },
  description:
    "Le Labo AI (alias « Le Labo IA ») : veille, analyses et décryptages de l'IA en français, sans jargon. Actu IA quotidienne et formations gratuites, du débutant à l'expert.",
  alternates: { canonical: siteConfig.url },
};

export default function HomePage() {
  const groups = getArticleGroups();
  const modules = getAllModules();

  // Stats pour la preuve sociale
  const totalArticles = groups.reduce((acc, g) => acc + g.versions.length, 0);
  const totalModules = modules.length;
  const totalLessons = modules.reduce((acc, m) => acc + m.lessonCount, 0);

  return (
    <>
      <WebsiteSchema />
      <ClientHomePage
        groups={groups}
        modules={modules}
        stats={{ articles: totalArticles, modules: totalModules, lessons: totalLessons }}
      />
    </>
  );
}
