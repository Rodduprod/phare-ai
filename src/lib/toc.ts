/**
 * Utilitaire serveur : extrait les titres H2/H3 d'un contenu MDX.
 * Séparé du composant client TableOfContents pour éviter les conflits SSR.
 */

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim().replace(/\*\*/g, '').replace(/`/g, '');
    const id = text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    items.push({ id, text, level });
  }

  return items;
}
