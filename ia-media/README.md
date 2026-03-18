# Signal IA

> L'intelligence artificielle, décryptée en français.

Média / veille IA francophone. Site statique Next.js avec contenu MDX, conçu pour être piloté par un agent IA (OpenClaw + Telegram).

## Stack

| Couche | Techno |
|--------|--------|
| Framework | Next.js 14 (App Router, SSG) |
| Contenu | MDX (fichiers dans `content/articles/`) |
| Styling | Tailwind CSS |
| BDD | Supabase (PostgreSQL) |
| Email | Resend |
| Déploiement | Vercel |
| Agent | OpenClaw → Telegram |

## Structure du projet

```
ia-media/
├── content/
│   └── articles/          # Articles MDX (frontmatter + markdown)
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/newsletter # API route inscription newsletter
│   │   ├── articles/      # Listing + page article dynamique
│   │   └── rss.xml/       # Flux RSS auto-généré
│   ├── components/        # Composants React
│   ├── lib/               # Utilitaires (articles, supabase, config)
│   └── ...
├── supabase/
│   └── schema.sql         # Schema BDD à exécuter dans Supabase
└── ...
```

## Publier un article

Créer un fichier `.mdx` dans `content/articles/` avec ce format :

```mdx
---
title: "Titre de l'article"
description: "Description courte pour le SEO et les cards."
date: "2026-03-18"
tags: ["tag1", "tag2"]
published: true
---

Contenu en Markdown ici...
```

Puis `git push` → Vercel rebuild automatiquement.

## Publication par agent (OpenClaw)

L'agent peut publier en :
1. Générant le fichier MDX avec le frontmatter correct
2. Faisant un `git add + commit + push` sur la branche `main`
3. Vercel détecte le push et rebuild le site (~30s)

Aucune API custom n'est nécessaire pour la publication.

## Setup

### 1. Cloner et installer

```bash
git clone <repo-url> && cd ia-media
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter `supabase/schema.sql` dans l'éditeur SQL
3. Copier l'URL et l'anon key dans `.env.local`

### 3. Lancer en local

```bash
npm run dev
```

### 4. Déployer sur Vercel

```bash
npx vercel
```

Ajouter les variables d'environnement dans les settings Vercel.

## Conventions

- **Slugs** : kebab-case français (`mon-article-sur-lia`)
- **Tags** : minuscules, sans accents (`modeles`, `outils`, `agents`, `revops`, `protocoles`)
- **Dates** : ISO 8601 (`2026-03-18`)
- **Images** : dans `public/images/articles/` référencées en chemin relatif

## Licence

Propriétaire — tous droits réservés.
