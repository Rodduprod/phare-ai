#!/usr/bin/env node

/**
 * 🤖 Le Labo AI - Automated Content Generator
 * 
 * Scrapes AI news, identifies trending topics, and generates
 * articles in 3 technical levels (débutant/amateur/confirmé)
 * 
 * Runs every 2 hours via GitHub Actions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'articles');

// Configuration
const CONFIG = {
  maxArticlesPerHour: 1,
  minTimeBetweenArticles: 2 * 60 * 60 * 1000, // 2 heures
  sources: {
    hackernews: 'https://hacker-news.firebaseio.com/v0/topstories.json',
    reddit: 'https://www.reddit.com/r/MachineLearning/hot.json',
    arxiv: 'http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=10'
  }
};

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Scrape AI news from multiple sources
 */
async function scrapeAINews() {
  console.log('🔍 Scraping AI news from multiple sources...');
  
  const news = [];
  
  try {
    // HackerNews AI stories
    const hnResponse = await fetch(CONFIG.sources.hackernews);
    const topStories = await hnResponse.json();
    
    // Get top 10 stories
    const stories = await Promise.all(
      topStories.slice(0, 10).map(async (id) => {
        const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return response.json();
      })
    );
    
    // Filter AI-related stories
    const aiStories = stories.filter(story => 
      story.title && (
        story.title.toLowerCase().includes('ai') ||
        story.title.toLowerCase().includes('artificial intelligence') ||
        story.title.toLowerCase().includes('machine learning') ||
        story.title.toLowerCase().includes('llm') ||
        story.title.toLowerCase().includes('claude') ||
        story.title.toLowerCase().includes('gpt') ||
        story.title.toLowerCase().includes('anthropic') ||
        story.title.toLowerCase().includes('openai')
      )
    );
    
    news.push(...aiStories.map(story => ({
      title: story.title,
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      score: story.score || 0,
      source: 'HackerNews',
      timestamp: new Date(story.time * 1000)
    })));
    
    console.log(`📰 Found ${aiStories.length} AI stories from HackerNews`);
    
  } catch (error) {
    console.error('❌ Error scraping HackerNews:', error.message);
  }
  
  return news.sort((a, b) => b.score - a.score);
}

/**
 * Generate trending AI topics when no specific news found
 */
function getDefaultAITopics() {
  const topics = [
    {
      title: "L'évolution des agents IA autonomes en 2026",
      description: "Comment les agents IA transforment l'automatisation des tâches complexes",
      tags: ["agents", "autonomie", "automatisation"]
    },
    {
      title: "Multimodal AI : quand l'IA voit, entend et comprend",
      description: "Les modèles multimodaux révolutionnent l'interaction homme-machine",
      tags: ["multimodal", "vision", "interaction"]
    },
    {
      title: "Fine-tuning vs RAG : quelle stratégie pour votre IA ?",
      description: "Comparaison des approches pour personnaliser les modèles de langage",
      tags: ["finetuning", "rag", "personnalisation"]
    },
    {
      title: "L'IA générative dans les entreprises françaises",
      description: "État des lieux et bonnes pratiques d'adoption en France",
      tags: ["entreprise", "adoption", "france"]
    }
  ];
  
  return topics[Math.floor(Math.random() * topics.length)];
}

/**
 * Check if we should generate content (rate limiting)
 */
function shouldGenerateContent() {
  if (!fs.existsSync(CONTENT_DIR)) {
    return true;
  }
  
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
  if (files.length === 0) return true;
  
  // Check last article timestamp
  const lastFile = files
    .map(f => {
      const filePath = path.join(CONTENT_DIR, f);
      const stats = fs.statSync(filePath);
      return { file: f, mtime: stats.mtime };
    })
    .sort((a, b) => b.mtime - a.mtime)[0];
  
  const timeSinceLastArticle = Date.now() - lastFile.mtime.getTime();
  
  if (timeSinceLastArticle < CONFIG.minTimeBetweenArticles) {
    console.log(`⏱️ Last article generated ${Math.round(timeSinceLastArticle / (60 * 1000))} minutes ago. Waiting...`);
    return false;
  }
  
  return true;
}

/**
 * Retourne la liste des articles existants formatée pour injection dans le prompt
 */
function getExistingArticlesContext() {
  if (!fs.existsSync(CONTENT_DIR)) return '';

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
  if (files.length === 0) return '';

  const articles = files.map(filename => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8');
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;

    const slug = filename.replace('.mdx', '');
    const titleMatch = match[1].match(/title:\s*"(.+?)"/);
    const tagsMatch = match[1].match(/tags:\s*\[(.+?)\]/);
    const levelMatch = match[1].match(/level:\s*"(.+?)"/);

    if (!titleMatch) return null;
    return {
      slug,
      title: titleMatch[1],
      tags: tagsMatch ? tagsMatch[1] : '',
      level: levelMatch ? levelMatch[1] : 'amateur',
    };
  }).filter(Boolean);

  if (articles.length === 0) return '';

  const list = articles
    .map(a => `- [${a.title}](/articles/${a.slug}) (niveau: ${a.level})`)
    .join('\n');

  return `\n\n## Articles existants sur le site (pour le maillage interne)\n\nIntègre naturellement des liens vers ces articles quand le sujet s'y prête. Utilise la syntaxe Markdown standard [texte](url).\n\n${list}\n\nRule: au minimum 2 liens internes par article, intégrés naturellement dans le texte (pas dans une section dédiée).`;
}

/**
 * Generate article content using Claude
 */
async function generateArticle(topic, level) {
  const levelPrompts = {
    débutant: `Écris un article de vulgarisation sur "${topic.title}" pour des débutants complets en IA.
    
Style:
- Accessible au grand public
- Métaphores et exemples concrets du quotidien
- Aucun jargon technique non expliqué
- Ton enthousiaste et pédagogue
- 800-1000 mots

Structure:
1. Introduction accrocheuse
2. Explication simple du concept
3. Exemples concrets et applications
4. Impact sur la vie quotidienne
5. Conclusion optimiste

Évite les termes techniques complexes, privilégie la clarté.`,

    amateur: `Écris un article technique sur "${topic.title}" pour des professionnels tech découvrant l'IA.
    
Style:
- Accessible aux développeurs/chefs de projet
- Context technique mais pas trop poussé
- Implications business et intégrations
- Exemples d'architectures et d'APIs
- 1000-1200 mots

Structure:
1. Contexte et enjeux techniques
2. Comment ça fonctionne (niveau architecture)
3. Cas d'usage business concrets
4. Intégrations et APIs disponibles
5. ROI et impact sur les équipes

Balance entre technique et business.`,

    confirmé: `Écris un article expert sur "${topic.title}" pour des architectes et ingénieurs ML.
    
Style:
- Deep dive technique complet
- Architectures, performance, optimisations
- Code, benchmarks, métriques
- Implications techniques avancées
- 1200-1500 mots

Structure:
1. Architecture et fondements techniques
2. Implémentation et optimisations
3. Benchmarks et performance
4. Limitations et défis techniques
5. Évolutions futures et recherche

Maximum de précision technique et d'insights d'expert.`
  };

  const internalLinksContext = getExistingArticlesContext();

  const prompt = levelPrompts[level] + `

Important: 
- Contenu 100% original et en français
- Pas de plagiat, inspire-toi mais ne copies pas
- Adapte le niveau technique exactement comme demandé
- Utilise des exemples français/européens quand possible
- Termine par un appel à l'action subtil
- **Maillage interne obligatoire** : intègre au minimum 2 liens vers des articles existants du site quand le sujet s'y prête (voir liste ci-dessous)

Description du sujet: ${topic.description}${internalLinksContext}`;

  console.log(`🤖 Generating ${level} article for: ${topic.title}`);

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
}

/**
 * Génère un slug ASCII kebab-case depuis un titre
 */
function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Create MDX file with proper frontmatter
 */
function createMDXFile(topic, content, level, topicSlug) {
  const date = new Date().toISOString().split('T')[0];

  // Niveau en ASCII pour le slug
  const levelSlug = level === 'débutant' ? 'debutant' : level === 'confirmé' ? 'confirme' : level;

  const frontmatter = `---
title: "${topic.title}"
description: "${topic.description}"
date: "${date}"
tags: [${topic.tags.map(tag => `"${tag}"`).join(', ')}]
level: "${level}"
topic: "${topicSlug}"
published: true
---

${content}`;

  const filename = `${topicSlug}--${levelSlug}.mdx`;
  const filepath = path.join(CONTENT_DIR, filename);

  // Ensure directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  // Check if file already exists (avoid duplicates)
  if (fs.existsSync(filepath)) {
    console.log(`⚠️ File ${filename} already exists, skipping...`);
    return false;
  }

  fs.writeFileSync(filepath, frontmatter);
  console.log(`✅ Created: ${filename}`);
  return true;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting AI Content Generator...');

  // Check if we should generate content
  if (!shouldGenerateContent()) {
    console.log('⏹️ Rate limit active, skipping this hour');
    return;
  }

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not found');
    return;
  }

  try {
    // Get AI news
    const news = await scrapeAINews();
    
    let topic;
    if (news.length > 0) {
      // Use trending news
      const topNews = news[0];
      topic = {
        title: topNews.title,
        description: `Analyse de l'actualité IA trending: ${topNews.title}`,
        tags: ["actualité", "trending", "innovation"],
        source: topNews.source
      };
      console.log(`📈 Using trending topic: ${topic.title}`);
    } else {
      // Use default AI topic
      topic = getDefaultAITopics();
      console.log(`🎯 Using default topic: ${topic.title}`);
    }

    // Générer les 3 niveaux pour ce topic
    const levels = ['débutant', 'amateur', 'confirmé'];
    const topicSlug = titleToSlug(topic.title);

    console.log(`📝 Generating 3 levels for topic: "${topic.title}" (slug: ${topicSlug})`);

    let createdCount = 0;
    for (const level of levels) {
      try {
        const content = await generateArticle(topic, level);
        const created = createMDXFile(topic, content, level, topicSlug);
        if (created) createdCount++;
        // Pause entre les appels API pour éviter le rate limiting
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error(`❌ Failed to generate ${level} version:`, err.message);
      }
    }

    if (createdCount > 0) {
      console.log(`🎉 Generated ${createdCount}/3 versions for: ${topic.title}`);
      console.log(`📂 Topic slug: ${topicSlug}`);
    }

  } catch (error) {
    console.error('❌ Error generating content:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}