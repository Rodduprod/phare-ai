'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import Image from "next/image";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Ferme le menu à chaque changement de page
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Empêche le scroll body quand le menu est ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-[12px] border-b border-border">
      <div className="max-w-content mx-auto px-4unit flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="group flex items-center">
          <Image
            src="/images/logo.svg"
            alt="Le Labo AI"
            width={200}
            height={60}
            className="h-12 w-auto group-hover:opacity-80 transition-opacity duration-200"
          />
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden sm:flex items-center gap-8">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-nav text-text hover:text-primary transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bouton burger mobile */}
        <button
          className="sm:hidden flex items-center justify-center w-10 h-10 rounded-md hover:bg-bg-alt transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            // Icône ✕
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            // Icône ☰
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text">
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <nav className="sm:hidden border-t border-border bg-white/95 backdrop-blur-[12px]">
          <div className="max-w-content mx-auto px-4unit py-4 flex flex-col gap-1">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-3 rounded-lg text-text hover:text-primary hover:bg-bg-alt transition-colors duration-150 text-base font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
