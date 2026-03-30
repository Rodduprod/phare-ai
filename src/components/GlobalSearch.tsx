'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
  type: "article" | "formation";
  title: string;
  description: string;
  level?: string;
  slug: string;
  url: string;
}

interface GlobalSearchProps {
  articles: { topic: string; title: string; description: string; level: string; slug: string }[];
  modules: { slug: string; title: string; description: string; level: string }[];
}

const LEVEL_COLORS: Record<string, string> = {
  débutant: "bg-primary/15 text-primary-deep",
  amateur:  "bg-primary/15 text-primary-deep",
  confirmé: "bg-primary/15 text-primary-deep",
};

export function GlobalSearch({ articles, modules }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Recherche
  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    const lower = q.toLowerCase();

    const articleResults: SearchResult[] = articles
      .filter(a => a.title.toLowerCase().includes(lower) || a.description.toLowerCase().includes(lower) || a.topic.toLowerCase().includes(lower))
      .slice(0, 5)
      .map(a => ({
        type: "article",
        title: a.title,
        description: a.description,
        level: a.level,
        slug: a.slug,
        url: `/articles/${a.slug}`,
      }));

    const moduleResults: SearchResult[] = modules
      .filter(m => m.title.toLowerCase().includes(lower) || m.description.toLowerCase().includes(lower))
      .slice(0, 3)
      .map(m => ({
        type: "formation",
        title: m.title,
        description: m.description,
        level: m.level,
        slug: m.slug,
        url: `/formation/${m.slug}`,
      }));

    setResults([...articleResults, ...moduleResults]);
    setActiveIndex(0);
  }, [articles, modules]);

  useEffect(() => { search(query); }, [query, search]);

  // Raccourci clavier Cmd+K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Focus input à l'ouverture
  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); }
    else { setQuery(""); setResults([]); }
  }, [open]);

  // Navigation clavier dans les résultats
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[activeIndex]) {
      router.push(results[activeIndex].url);
      setOpen(false);
    }
  }

  // Clic en dehors
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <>
      {/* Bouton déclencheur dans le header */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted bg-bg-alt border border-border rounded-lg hover:border-primary/40 hover:text-text transition-colors"
        aria-label="Rechercher"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Rechercher…</span>
        <kbd className="hidden sm:inline text-xs px-1.5 py-0.5 bg-white border border-border rounded font-mono">⌘K</kbd>
      </button>

      {/* Modal de recherche */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div ref={containerRef} className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <svg className="w-5 h-5 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Rechercher un article, un module…"
                className="flex-1 text-base outline-none bg-transparent text-text placeholder:text-text-muted"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-text-muted hover:text-text p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <kbd className="text-xs px-1.5 py-0.5 bg-bg-alt border border-border rounded font-mono text-text-muted">Esc</kbd>
            </div>

            {/* Résultats */}
            {results.length > 0 && (
              <ul className="py-2 max-h-80 overflow-y-auto">
                {results.map((r, i) => (
                  <li key={r.url}>
                    <Link
                      href={r.url}
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-bg-alt transition-colors ${i === activeIndex ? "bg-bg-alt" : ""}`}
                    >
                      <span className="mt-0.5 text-lg shrink-0">
                        {r.type === "formation" ? "🎓" : "📰"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-text truncate">{r.title}</span>
                          {r.level && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${LEVEL_COLORS[r.level] ?? "bg-gray-100 text-gray-600"}`}>
                              {r.level}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{r.description}</p>
                      </div>
                      <span className="text-xs text-text-muted shrink-0 self-center">
                        {r.type === "formation" ? "Module" : "Article"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {query && results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-text-muted">
                Aucun résultat pour <strong>"{query}"</strong>
              </div>
            )}

            {!query && (
              <div className="px-4 py-6 text-center text-sm text-text-muted">
                Tapez pour rechercher parmi les articles et modules de formation
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border bg-bg-alt flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1"><kbd className="font-mono px-1 bg-white border border-border rounded">↑↓</kbd> naviguer</span>
              <span className="flex items-center gap-1"><kbd className="font-mono px-1 bg-white border border-border rounded">↵</kbd> ouvrir</span>
              <span className="flex items-center gap-1"><kbd className="font-mono px-1 bg-white border border-border rounded">Esc</kbd> fermer</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
