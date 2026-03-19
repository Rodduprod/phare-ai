export type ArticleLevel = 'débutant' | 'amateur' | 'confirmé';

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  level: ArticleLevel;
  image?: string;
  readingTime: string;
  published: boolean;
}

export interface Article extends ArticleMeta {
  content: string;
}

// Configuration des niveaux techniques
export const levelConfig: Record<ArticleLevel, {
  label: string;
  icon: string;
  color: string;
  description: string;
  audience: string;
}> = {
  débutant: {
    label: 'Débutant',
    icon: '🌱',
    color: '#34c759',
    description: 'Découvrir l\'IA sans prérequis technique',
    audience: 'Grand public, non-techniques, curieux'
  },
  amateur: {
    label: 'Amateur',
    icon: '🔧', 
    color: '#99ccff',
    description: 'Comprendre les aspects techniques de l\'IA',
    audience: 'Développeurs, chefs de projet, consultants tech'
  },
  confirmé: {
    label: 'Confirmé',
    icon: '⚡',
    color: '#e53e3e',
    description: 'Deep dives techniques et implications avancées',
    audience: 'Architectes, ingénieurs ML, experts IA'
  }
};