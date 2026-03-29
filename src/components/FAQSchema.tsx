/**
 * FAQSchema — Génère un JSON-LD FAQPage pour les rich results Google.
 * Extrait les paires Q/R d'une section "## FAQ" dans le contenu MDX.
 *
 * Format attendu dans le MDX :
 *   ## FAQ
 *   **Question ?**
 *   Réponse complète...
 *
 *   **Autre question ?**
 *   Autre réponse...
 */

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

export function FAQSchema({ items }: FAQSchemaProps) {
  if (!items || items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Extrait les paires Q/R depuis le contenu brut d'un article MDX.
 * Cherche une section ## FAQ et parse les blocs **Question ?** / réponse.
 */
export function extractFAQ(content: string): FAQItem[] {
  // Trouver la section FAQ
  const faqMatch = content.match(/##\s+FAQ\s*\n([\s\S]*?)(?=\n##\s|\s*$)/i);
  if (!faqMatch) return [];

  const faqSection = faqMatch[1];
  const items: FAQItem[] = [];

  // Parser chaque bloc **Question ?** \n Réponse...
  const blocks = faqSection.split(/\n(?=\*\*)/);

  for (const block of blocks) {
    const match = block.match(/^\*\*(.+?)\*\*\s*\n([\s\S]+?)(?=\n\*\*|$)/);
    if (!match) continue;

    const question = match[1].trim();
    // Nettoyer la réponse : supprimer les marqueurs Markdown simples
    const answer = match[2]
      .trim()
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // liens → texte
      .replace(/\*\*([^*]+)\*\*/g, '$1')        // gras → texte
      .replace(/\*([^*]+)\*/g, '$1')             // italique → texte
      .replace(/`([^`]+)`/g, '$1');              // code inline → texte

    if (question && answer) {
      items.push({ question, answer });
    }
  }

  return items;
}
