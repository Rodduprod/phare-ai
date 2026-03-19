import Link from "next/link";
import { siteConfig } from "@/lib/config";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Schema JSON-LD pour les breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: siteConfig.url,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        ...(item.href && { item: `${siteConfig.url}${item.href}` }),
      })),
    ],
  };

  return (
    <>
      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema, null, 2),
        }}
      />

      {/* Breadcrumbs visibles */}
      <nav aria-label="Fil d'Ariane" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-ink-400 font-body">
          <li>
            <Link
              href="/"
              className="hover:text-ink-700 transition-colors"
            >
              Accueil
            </Link>
          </li>
          
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="opacity-40"
              >
                <path
                  d="M6 12l4-4-4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-ink-700 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-ink-600">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}