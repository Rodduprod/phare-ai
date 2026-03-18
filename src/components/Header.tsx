import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function Header() {
  return (
    <header className="border-b border-ink-200/60">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <span className="w-8 h-8 rounded-md bg-signal flex items-center justify-center text-white font-body font-bold text-sm">
            S
          </span>
          <span className="font-display text-xl text-ink-900 group-hover:text-signal transition-colors">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-body font-medium text-ink-500 hover:text-ink-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
