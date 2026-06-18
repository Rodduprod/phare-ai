import type { Metadata } from "next";
import Script from "next/script";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WebsiteSchema } from "@/components/WebsiteSchema";
import { siteConfig } from "@/lib/config";
import { getArticleGroups } from "@/lib/articles-server";
import { getAllModules } from "@/lib/formation";
import "./globals.css";

const GTM_ID = "GTM-PP47M2T9";
const GA_ID = "GT-5NGRSQ3H"; // Google Tag ID (GA4 property)

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — Intelligence artificielle en français`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: "/og-image-default.png",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: siteConfig.author.twitter,
  },
  alternates: {
    canonical: siteConfig.url,
    languages: {
      'fr':    siteConfig.url,
      'fr-FR': siteConfig.url,
      'x-default': siteConfig.url,
    },
    types: { "application/rss+xml": "/rss.xml" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: "/manifest.json",
  verification: {
    google: "PVw8FeWG7pRNf16Z6OkIvMqMPFvf4Ru5JgaJxr2ZNpM",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/images/logo-icon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Preconnect pour accélérer les ressources critiques */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* DNS prefetch pour les domaines externes fréquents */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//vercel-insights.com" />

        {/*
          Filtre trafic interne — doit s'exécuter AVANT GA4/GTM.
          Visite ?internal=true une fois par appareil pour t'exclure définitivement.
          Visite ?internal=false pour réactiver le tracking (ex: tester GA4).
        */}
        <Script
          id="internal-traffic-filter"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var params = new URLSearchParams(window.location.search);
    if (params.get('internal') === 'true') {
      localStorage.setItem('lelabo_internal', 'true');
    } else if (params.get('internal') === 'false') {
      localStorage.removeItem('lelabo_internal');
    }
    if (localStorage.getItem('lelabo_internal') === 'true') {
      window['ga-disable-${GA_ID}'] = true;
      window['ga-disable-G-JD2WB9GW19'] = true;
      window.__INTERNAL_TRAFFIC__ = true;
    }
  } catch(e) {}
})();
            `,
          }}
        />

        {/* Google Tag (GA4 direct) — ignoré si __INTERNAL_TRAFFIC__ */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="ga4-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
if (!window.__INTERNAL_TRAFFIC__) {
  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments);}
  gtag('js',new Date());
  gtag('config','${GA_ID}');
}`,
          }}
        />
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <WebsiteSchema />
        <Header
          searchArticles={getArticleGroups().map(g => ({
            topic: g.topic,
            title: g.canonical.title,
            description: g.canonical.description,
            level: g.canonical.level,
            slug: g.canonical.slug,
          }))}
          searchModules={getAllModules().map(m => ({ slug: m.slug, title: m.title, description: m.description, level: m.level }))}
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
