import type { Metadata } from "next";
import { getAllModules } from "@/lib/formation";
import { siteConfig } from "@/lib/config";
import { FormationClientPage } from "@/components/formation/FormationClientPage";

export const metadata: Metadata = {
  title: "Formation IA — Le Labo AI",
  description: "Des parcours de formation pour comprendre et maîtriser l'IA, quel que soit votre niveau. Débutez dès maintenant avec des modules courts et progressifs.",
  alternates: { canonical: `${siteConfig.url}/formation` },
};

export default function FormationPage() {
  const modules = getAllModules();

  // Passer uniquement les données sérialisables (pas le type Module complet)
  const modulesMeta = modules.map(m => ({
    slug: m.slug,
    title: m.title,
    description: m.description,
    level: m.level,
    duration: m.duration,
    image: m.image,
    lessonCount: m.lessonCount,
  }));

  return <FormationClientPage modules={modulesMeta} />;
}
