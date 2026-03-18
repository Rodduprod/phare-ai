"use client";

import { useState } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Bienvenue ! Vous recevrez la prochaine édition.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Une erreur est survenue.");
      }
    } catch {
      setStatus("error");
      setMessage("Impossible de se connecter. Réessayez.");
    }
  }

  return (
    <section id="newsletter" className="my-24">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-ink-950 rounded-2xl px-8 py-14 sm:px-14">
          <p className="text-signal font-body text-sm font-medium tracking-wide uppercase mb-4">
            Newsletter
          </p>
          <h2 className="font-display text-display-md text-white mb-3">
            Restez dans la boucle.
          </h2>
          <p className="text-ink-400 font-body mb-8 max-w-md mx-auto">
            Un condensé hebdomadaire des avancées IA qui comptent.
            Pas de spam, pas de bruit.
          </p>

          {status === "success" ? (
            <p className="text-green-400 font-body text-sm animate-fade-in">
              {message}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="flex-1 px-4 py-3 rounded-lg bg-ink-800 border border-ink-700 text-white
                           placeholder:text-ink-500 font-body text-sm
                           focus:outline-none focus:border-signal focus:ring-1 focus:ring-signal/30
                           transition-all"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 rounded-lg bg-signal text-white font-body font-medium text-sm
                           hover:bg-signal-dark transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed
                           whitespace-nowrap"
              >
                {status === "loading" ? "..." : "S'abonner"}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="text-red-400 font-body text-sm mt-3">{message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
