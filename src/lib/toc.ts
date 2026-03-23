/**
 * Utilitaire serveur : extrait les titres H2/H3 d'un contenu MDX.
 * Séparé du composant client TableOfContents pour éviter les conflits SSR.
 *
 * ⚠️ Les IDs doivent être identiques à ceux générés par rehype-slug v6
 * qui utilise github-slugger v2 (garde les accents, ex: "émergence" → "émergence").
 */
import GithubSlugger from 'github-slugger';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  const slugger = new GithubSlugger();
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    // Nettoyer le markdown (gras, code inline) pour obtenir le texte brut
    const text = match[2].trim().replace(/\*\*/g, '').replace(/`[^`]*`/g, '').trim();
    // Utiliser github-slugger pour être identique à rehype-slug
    const id = slugger.slug(text);

    items.push({ id, text, level });
  }

  return items;
}
