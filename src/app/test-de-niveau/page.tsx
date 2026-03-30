import { LevelTest } from "@/components/LevelTest";

export const metadata = {
  title: "Test de niveau IA — Découvrez votre profil | Le Labo AI",
  description: "5 questions pour trouver votre niveau en IA : débutant, amateur ou confirmé. Le Labo AI s'adapte à votre profil.",
};

export default function TestDeNiveauPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <LevelTest />
    </main>
  );
}
