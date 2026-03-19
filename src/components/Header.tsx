import Link from "next/link";
import { siteConfig } from "@/lib/config";
import Image from "next/image";

export function Header() {
  return (
    <header className="border-b border-ink-200/60">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="group flex items-center">
          <Image
            src="/images/logo.svg"
            alt="Le Labo AI"
            width={200}
            height={60}
            className="h-12 w-auto group-hover:opacity-80 transition-opacity"
          />
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
