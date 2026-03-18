import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import { formatDate } from "@/lib/utils";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      tags: article.tags,
      url: `${siteConfig.url}/articles/${article.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default function ArticlePage({ params }: PageProps) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6">
      {/* Back link */}
      <div className="pt-8">
        <Link
          href="/articles"
          className="text-sm text-ink-400 hover:text-ink-700 font-body transition-colors inline-flex items-center gap-1.5"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Tous les articles
        </Link>
      </div>

      {/* Article header */}
      <header className="pt-10 pb-10 border-b border-ink-100">
        <div className="flex items-center gap-2 mb-4">
          {article.tags.map((tag) => (
            <span key={tag} className="tag-pill tag-pill-signal">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="font-display text-display-lg text-ink-950 mb-4">
          {article.title}
        </h1>

        {article.description && (
          <p className="text-lg text-ink-500 font-body leading-relaxed mb-6 max-w-2xl">
            {article.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-ink-400 font-body">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span className="w-1 h-1 rounded-full bg-ink-300" />
          <span>{article.readingTime}</span>
        </div>
      </header>

      {/* Article body */}
      <div className="prose-article py-12">
        <MDXRemote
          source={article.content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeHighlight],
            },
          }}
        />
      </div>

      {/* Article footer */}
      <footer className="border-t border-ink-100 py-12">
        <div className="flex items-center justify-between">
          <Link
            href="/articles"
            className="text-sm text-ink-500 hover:text-signal font-body font-medium transition-colors"
          >
            ← Retour aux articles
          </Link>
          <div className="flex gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`${siteConfig.url}/articles/${article.slug}`)}`}
              target="_blank"
              rel="noopener"
              className="text-sm text-ink-400 hover:text-signal transition-colors"
            >
              Partager sur X
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
