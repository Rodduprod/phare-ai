export type ArticleLevel = 'débutant' | 'amateur' | 'confirmé';

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  level: ArticleLevel;
  topic?: string;       // Groupe thématique (ex: "chatgpt-vs-claude"). Si absent, slug = topic.
  image?: string;
  readingTime: string;
  published: boolean;
}

// Un groupe d'articles sur le même sujet, déclinés par level
export interface ArticleVersion {
  level: ArticleLevel;
  slug: string;
  readingTime: string;
}

export interface ArticleGroup {
  topic: string;          // identifiant du groupe
  title: string;          // titre partagé (du canonical)
  description: string;
  date: string;
  tags: string[];
  image?: string;
  versions: ArticleVersion[];          // les versions existantes (1 à 3)
  canonical: ArticleMeta;              // version par défaut (amateur > débutant > confirmé)
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