import { LevelTest } from "@/components/LevelTest";
import { getArticleGroups } from "@/lib/articles-server";
import { getAllModules } from "@/lib/formation";

export const metadata = {
  title: "Test de niveau IA — Découvrez votre profil | Le Labo AI",
  description: "5 questions pour trouver votre niveau en IA : débutant, amateur ou confirmé. Le Labo AI s'adapte à votre profil.",
};

export default function TestDeNiveauPage() {
  const groups = getArticleGroups();
  const modules = getAllModules();

  // 3 articles par niveau (title/description depuis le groupe, slug depuis la version)
  function getArticlesForLevel(level: 'débutant' | 'amateur' | 'confirmé') {
    return groups
      .filter(g => g.versions.some(v => v.level === level))
      .slice(0, 3)
      .map(g => {
        const version = g.versions.find(v => v.level === level)!;
        return { slug: version.slug, title: g.title, description: g.description };
      });
  }
  const articlesByLevel = {
    débutant: getArticlesForLevel('débutant'),
    amateur:  getArticlesForLevel('amateur'),
    confirmé: getArticlesForLevel('confirmé'),
  };

  // Module recommandé par niveau
  const moduleByLevel = {
    débutant: modules.find(m => m.level === 'débutant') ?? modules[0],
    amateur: modules.find(m => m.level === 'amateur') ?? modules[0],
    confirmé: modules.find(m => m.level === 'confirmé') ?? modules[0],
  };

  const modulesMeta = {
    débutant: moduleByLevel.débutant ? { slug: moduleByLevel.débutant.slug, title: moduleByLevel.débutant.title, lessonCount: moduleByLevel.débutant.lessonCount } : null,
    amateur: moduleByLevel.amateur ? { slug: moduleByLevel.amateur.slug, title: moduleByLevel.amateur.title, lessonCount: moduleByLevel.amateur.lessonCount } : null,
    confirmé: moduleByLevel.confirmé ? { slug: moduleByLevel.confirmé.slug, title: moduleByLevel.confirmé.title, lessonCount: moduleByLevel.confirmé.lessonCount } : null,
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <LevelTest articles={articlesByLevel} modules={modulesMeta} />
    </main>
  );
}
