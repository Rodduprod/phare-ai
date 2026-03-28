import { siteConfig } from "@/lib/config";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-16 sm:mt-24">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-text-muted text-center sm:text-left">
            © {new Date().getFullYear()} {siteConfig.name} — Fait avec curiosité.
          </p>
          <nav className="flex items-center gap-1">
            <Link
              href="/formation"
              className="px-4 py-2.5 text-sm text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-bg-alt"
            >
              Formation
            </Link>
            <Link
              href="/articles"
              className="px-4 py-2.5 text-sm text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-bg-alt"
            >
              Articles
            </Link>
            <Link
              href="/a-propos"
              className="px-4 py-2.5 text-sm text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-bg-alt"
            >
              À propos
            </Link>
            <a
              href="/rss.xml"
              className="px-4 py-2.5 text-sm text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-bg-alt"
            >
              RSS
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
