/**
 * Bibliothèque de photos de couverture thématiques pour les articles Le Labo AI.
 * Photos Unsplash — usage libre (Unsplash License).
 * Format : https://images.unsplash.com/photo-{id}?w=1200&q=80&auto=format&fit=crop
 */

// Map tag/topic → liste de photo IDs Unsplash
const COVER_BY_TOPIC: Record<string, string[]> = {
  // IA générale
  'ia':         ['1677442135703-1787eea5ce01', '1620712943543-bcc4688e7485', '1555255707-d1b591b8a7f8'],
  'modèles':    ['1677442135703-1787eea5ce01', '1620712943543-bcc4688e7485', '1535378917042-10bfdea4de8b'],
  'llm':        ['1620712943543-bcc4688e7485', '1677442135703-1787eea5ce01', '1535378917042-10bfdea4de8b'],
  // Outils & productivité
  'outils':     ['1611532736597-de2d4265fba3', '1633356122544-f134324a6cee', '1531297484001-80022131f5a1'],
  'productivité':['1611532736597-de2d4265fba3', '1593642632559-0c6d3fc62b89', '1531297484001-80022131f5a1'],
  // Code & développement
  'code':       ['1518770660439-4636190af475', '1461749280684-dccba630e2f6', '1587620962725-abab7fe55159'],
  'développement':['1518770660439-4636190af475', '1461749280684-dccba630e2f6', '1587620962725-abab7fe55159'],
  // Agents & automatisation
  'agents':     ['1485827404703-89b55fcc595e', '1677442135703-1787eea5ce01', '1620712943543-bcc4688e7485'],
  'automatisation':['1485827404703-89b55fcc595e', '1593642632559-0c6d3fc62b89', '1585314062340-f1a5a7c9328d'],
  // Business & entrepreneurs
  'entrepreneurs':['1507679799987-c73779587ccf', '1454165804606-c3d57bc86b40', '1542744173-8e7e53415bb0'],
  'business':   ['1507679799987-c73779587ccf', '1454165804606-c3d57bc86b40', '1542744173-8e7e53415bb0'],
  // Créateurs & contenu
  'créateurs':  ['1542831371-29id-b38-a3db5b57df38', '1611162617213-7d7a39e9b1d7', '1488590528505-98d2b5aba04b'],
  'contenu':    ['1611162617213-7d7a39e9b1d7', '1542831371-29id-b38-a3db5b57df38', '1593642632559-0c6d3fc62b89'],
  // Google, OpenAI, Anthropic
  'google':     ['1573804633927-bfcbcd909acd', '1592659762303-90081d34b277', '1526374965328-7f61d4dc18c5'],
  'openai':     ['1620712943543-bcc4688e7485', '1677442135703-1787eea5ce01', '1535378917042-10bfdea4de8b'],
  'anthropic':  ['1620712943543-bcc4688e7485', '1677442135703-1787eea5ce01', '1485827404703-89b55fcc595e'],
  // Défaut tech/futuriste
  'default':    ['1677442135703-1787eea5ce01', '1620712943543-bcc4688e7485', '1485827404703-89b55fcc595e',
                 '1531297484001-80022131f5a1', '1518770660439-4636190af475', '1526374965328-7f61d4dc18c5'],
};

/**
 * Retourne l'URL d'une photo de couverture Unsplash adaptée aux tags donnés.
 * Déterministe pour un slug donné (toujours la même image pour le même article).
 */
export function getCoverImage(tags: string[], slug: string): string {
  // Cherche le premier tag qui a une entrée dans la bibliothèque
  const matchedTopic = tags.find((tag) =>
    Object.keys(COVER_BY_TOPIC).includes(tag.toLowerCase())
  ) ?? 'default';

  const photos = COVER_BY_TOPIC[matchedTopic.toLowerCase()] ?? COVER_BY_TOPIC['default'];

  // Hash déterministe du slug pour choisir toujours la même photo
  const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const photoId = photos[hash % photos.length];

  return `https://images.unsplash.com/photo-${photoId}?w=1200&q=80&auto=format&fit=crop`;
}
