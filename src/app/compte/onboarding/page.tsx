'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type Level = 'débutant' | 'amateur' | 'confirmé';

const MODULES_BY_LEVEL: Record<Level, { slug: string; title: string }> = {
  'débutant': { slug: 'comprendre-ia-debutant', title: "L'IA pour tous — Comprendre sans jargon" },
  'amateur':  { slug: 'ia-au-travail-amateur',  title: "L'IA au travail — Automatiser sans se perdre" },
  'confirmé': { slug: 'agents-ia-confirme',     title: "Construire des agents IA" },
};

const LEVEL_CONFIG: Record<Level, { emoji: string; label: string; color: string; bg: string }> = {
  'débutant': { emoji: '🌱', label: 'Débutant',         color: 'text-green-700',  bg: 'bg-green-50' },
  'amateur':  { emoji: '🚀', label: 'Amateur éclairé',  color: 'text-blue-700',   bg: 'bg-blue-50' },
  'confirmé': { emoji: '⚡', label: 'Confirmé',         color: 'text-purple-700', bg: 'bg-purple-50' },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [level, setLevel] = useState<Level | null>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/compte/connexion'); return; }

        setUserName(user.email?.split('@')[0] ?? '');

        // Charger le niveau depuis profiles
        const { data } = await supabase
          .from('profiles')
          .select('level')
          .eq('id', user.id)
          .single();

        if (data?.level) {
          setLevel(data.level as Level);
        } else {
          // Fallback localStorage
          const stored = localStorage.getItem('lelabo_user_level') as Level | null;
          if (stored) setLevel(stored);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-400">Chargement...</div>
      </div>
    );
  }

  const cfg = level ? LEVEL_CONFIG[level] : null;
  const module = level ? MODULES_BY_LEVEL[level] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">

        {/* Bienvenue */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue{userName ? `, ${userName}` : ''} !
          </h1>
          <p className="text-gray-500">Votre espace est prêt. Voici comment commencer.</p>
        </div>

        {/* Niveau détecté */}
        {level && cfg ? (
          <div className={`mb-6 p-5 rounded-2xl ${cfg.bg} border border-opacity-20`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{cfg.emoji}</span>
              <div>
                <p className="font-bold text-gray-900">Votre niveau : {cfg.label}</p>
                <p className={`text-sm ${cfg.color}`}>Le contenu s'adapte automatiquement à votre profil.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-5 rounded-2xl bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-800 font-medium mb-2">Vous n'avez pas encore défini votre niveau.</p>
            <Link href="/test-de-niveau" className="text-sm font-semibold text-yellow-900 underline">
              Faire le test de niveau →
            </Link>
          </div>
        )}

        {/* Étapes */}
        <div className="space-y-3 mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Par où commencer</h2>

          {/* Étape 1 : module recommandé */}
          {module && (
            <Link
              href={`/formation/${module.slug}`}
              className="flex items-center gap-4 bg-white border border-primary/20 hover:border-primary/50 hover:shadow-sm rounded-xl p-4 transition-all no-underline group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary-deep font-bold shrink-0">
                1
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm group-hover:text-primary-deep transition-colors">
                  Commencer votre premier module
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{module.title}</p>
              </div>
              <span className="text-primary-deep shrink-0 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}

          {/* Étape 2 : lire un article */}
          <Link
            href={level ? `/articles?level=${level}` : '/articles'}
            className="flex items-center gap-4 bg-white border border-gray-200 hover:border-primary/40 hover:shadow-sm rounded-xl p-4 transition-all no-underline group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
              2
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm group-hover:text-primary-deep transition-colors">
                Lire votre premier article
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Actu IA adaptée à votre niveau</p>
            </div>
            <span className="text-gray-400 shrink-0 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          {/* Étape 3 : profil */}
          <Link
            href="/compte/profil"
            className="flex items-center gap-4 bg-white border border-gray-200 hover:border-primary/40 hover:shadow-sm rounded-xl p-4 transition-all no-underline group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
              3
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm group-hover:text-primary-deep transition-colors">
                Voir votre tableau de bord
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Progression, XP, articles sauvegardés</p>
            </div>
            <span className="text-gray-400 shrink-0 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <Link
          href="/"
          className="block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Explorer le site d'abord →
        </Link>
      </div>
    </div>
  );
}
