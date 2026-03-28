'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

/**
 * Bandeau CTA inscription — affiché en haut de /formation pour les visiteurs non connectés.
 * Se masque automatiquement si l'utilisateur est déjà connecté.
 */
export function FormationSignupCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      // Afficher uniquement si non connecté
      setShow(!user);
    });
  }, []);

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 to-blue-50 border border-primary/20 rounded-2xl px-6 py-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-text">
          🎓 Suivez votre progression gratuitement
        </p>
        <p className="text-sm text-text-muted mt-0.5">
          Créez un compte pour sauvegarder vos leçons complétées et reprendre où vous en étiez.
        </p>
      </div>
      <div className="flex gap-3 shrink-0">
        <Link
          href="/compte/inscription"
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
        >
          S&apos;inscrire gratuitement
        </Link>
        <Link
          href="/compte/connexion"
          className="px-5 py-2.5 border border-border text-text text-sm font-medium rounded-xl hover:border-primary/40 hover:text-primary transition-colors whitespace-nowrap"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}
