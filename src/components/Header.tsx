'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import Image from "next/image";
import { AuthButton } from "@/components/AuthButton";
import { GlobalSearch } from "@/components/GlobalSearch";

interface HeaderProps {
  searchArticles?: { topic: string; title: string; description: string; level: string; slug: string }[];
  searchModules?: { slug: string; title: string; description: string; level: string }[];
}

export function Header({ searchArticles = [], searchModules = [] }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Ferme le menu à chaque changement de page
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Empêche le scroll body quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Ferme le menu en cliquant en dehors
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-[12px] border-b border-border" ref={menuRef}>
      <div className="max-w-content mx-auto px-4unit flex items-center justify-between h-16 gap-3">
        {/* Logo */}
        <Link href="/" className="group flex items-center shrink-0">
          <Image
            src="/images/logo.svg"
            alt="Le Labo AI"
            width={200}
            height={60}
            className="h-12 w-auto group-hover:opacity-80 transition-opacity duration-200"
          />
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden sm:flex items-center gap-4 flex-1 justify-end">
          {/* Formation — CTA en premier, bien visible */}
          <Link
            href="/formation"
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 shrink-0 ${
              pathname?.startsWith('/formation')
                ? 'bg-primary text-white'
                : 'bg-primary text-white hover:bg-primary-hover'
            }`}
          >
            🎓 Se former
          </Link>

          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-nav text-text hover:text-primary transition-colors duration-200 shrink-0"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/test-de-niveau"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 shrink-0 ${
              pathname === '/test-de-niveau'
                ? 'text-primary-deep'
                : 'text-text-muted hover:text-primary'
            }`}
          >
            🧪 Mon niveau
          </Link>

          {/* Barre de recherche globale */}
          <GlobalSearch articles={searchArticles} modules={searchModules} />

          <AuthButton />
        </nav>

        {/* Boutons mobile : recherche + burger */}
        <div className="sm:hidden flex items-center gap-2">
          <GlobalSearch articles={searchArticles} modules={searchModules} />
          <button
            className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-bg-alt transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text">
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-border bg-white/95 backdrop-blur-[12px]">
          <div className="max-w-content mx-auto px-4unit py-4 flex flex-col gap-1">
            {/* Formation en tête du menu mobile */}
            <Link
              href="/formation"
              className="px-3 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors duration-150 text-base font-semibold flex items-center gap-2"
            >
              🎓 Se former
            </Link>
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-3 rounded-lg text-text hover:text-primary hover:bg-bg-alt transition-colors duration-150 text-base font-medium"
              >
                {item.label}
              </Link>
            ))}
            {/* Compte — séparé par un divider */}
            <div className="border-t border-border mt-2 pt-3 px-1">
              <AuthButton />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
