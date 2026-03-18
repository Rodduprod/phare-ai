import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-ink-200/60 mt-24">
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-ink-400 font-body">
          {new Date().getFullYear()} {siteConfig.name} — Fait avec curiosité.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="/rss.xml"
            className="text-sm text-ink-400 hover:text-signal transition-colors"
          >
            RSS
          </a>
          <a
            href={`https://twitter.com/${siteConfig.author.twitter?.replace("@", "")}`}
            className="text-sm text-ink-400 hover:text-signal transition-colors"
            target="_blank"
            rel="noopener"
          >
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
