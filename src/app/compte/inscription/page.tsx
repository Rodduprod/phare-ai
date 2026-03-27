'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const LEVELS = [
  { value: "débutant",  label: "Débutant",  desc: "Je découvre l'IA" },
  { value: "amateur",   label: "Intermédiaire", desc: "Je connais les bases" },
  { value: "confirmé",  label: "Expert",    desc: "Je travaille avec l'IA" },
] as const;

export default function InscriptionPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [level, setLevel] = useState<"débutant" | "amateur" | "confirmé">("débutant");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { level },
        emailRedirectTo: `${location.origin}/compte/callback`,
      },
    });

    if (error) {
      setError(error.message === "User already registered"
        ? "Un compte existe déjà avec cet email."
        : "Une erreur est survenue. Réessayez.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="font-display text-2xl text-text font-bold mb-3">Vérifiez votre email</h1>
        <p className="text-text-muted">
          Un lien de confirmation a été envoyé à <strong className="text-text">{email}</strong>.
          Cliquez dessus pour activer votre compte.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
          <span className="text-2xl">🧪</span>
        </div>
        <h1 className="font-display text-2xl text-text font-bold mb-2">Créer un compte</h1>
        <p className="text-text-muted text-sm">
          Déjà inscrit ?{" "}
          <Link href="/compte/connexion" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            placeholder="vous@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
            Mot de passe
            <span className="text-text-muted font-normal ml-1">(8 caractères min.)</span>
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            placeholder="••••••••"
          />
        </div>

        {/* Sélecteur de niveau */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Mon niveau en IA
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLevel(l.value)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  level === l.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="text-sm font-semibold text-text">{l.label}</div>
                <div className="text-xs text-text-muted mt-0.5">{l.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Création…" : "Créer mon compte"}
        </button>
      </form>
    </div>
  );
}
