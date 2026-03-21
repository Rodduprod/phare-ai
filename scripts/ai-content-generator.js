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
    hackernews:       'https://hacker-news.firebaseio.com/v0/topstories.json',
    reddit_ml:        'https://www.reddit.com/r/MachineLearning/hot.json?limit=15',
    reddit_ai:        'https://www.reddit.com/r/artificial/hot.json?limit=15',
    reddit_chatgpt:   'https://www.reddit.com/r/ChatGPT/hot.json?limit=10',
    gnews_fr:         'https://news.google.com/rss/search?q=intelligence+artificielle+IA&hl=fr&gl=FR&ceid=FR:fr',
    gnews_en:         'https://news.google.com/rss/search?q=artificial+intelligence+LLM&hl=en-US&gl=US&ceid=US:en',
    techcrunch:       'https://techcrunch.com/category/artificial-intelligence/feed/',
    venturebeat:      'https://venturebeat.com/category/ai/feed/',
    arxiv:            'http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=15',
    // Sources chinoises via Google News (DeepSeek, Baidu, Alibaba Qwen, ByteDance...)
    gnews_cn_deepseek: 'https://news.google.com/rss/search?q=DeepSeek+AI&hl=en-US&gl=US&ceid=US:en',
    gnews_cn_baidu:    'https://news.google.com/rss/search?q=Baidu+ERNIE+AI&hl=en-US&gl=US&ceid=US:en',
    gnews_cn_alibaba:  'https://news.google.com/rss/search?q=Alibaba+Qwen+AI+model&hl=en-US&gl=US&ceid=US:en',
    gnews_cn_general:  'https://news.google.com/rss/search?q=China+artificial+intelligence+AI+2025&hl=en-US&gl=US&ceid=US:en',
  }
};

// Mots-clés IA pour le filtrage
const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'claude', 'gemini',
  'openai', 'anthropic', 'google ai', 'deepmind', 'mistral', 'llama', 'chatgpt',
  'neural', 'transformer', 'rag', 'agent', 'copilot', 'diffusion', 'generative',
  'model', 'chatbot', 'nlp', 'computer vision', 'robotics', 'automation',
  // Acteurs chinois
  'deepseek', 'baidu', 'ernie', 'alibaba', 'qwen', 'tencent', 'hunyuan',
  'zhipu', 'minimax', 'moonshot', 'kimi', 'bytedance', 'doubao',
];

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Vérifie si un titre est lié à l'IA
 */
function isAIRelated(title) {
  const t = title.toLowerCase();
  return AI_KEYWORDS.some(k => t.includes(k));
}

/**
 * Parse un flux RSS simple (XML) — retourne array de { title, url, description }
 */
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = (block.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                   block.match(/<title[^>]*>(.*?)<\/title>/) || [])[1]?.trim();
    const link  = (block.match(/<link[^>]*>(.*?)<\/link>/) ||
                   block.match(/<guid[^>]*>(https?[^<]+)<\/guid>/) || [])[1]?.trim();
    const desc  = (block.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                   block.match(/<description[^>]*>(.*?)<\/description>/) || [])[1]
                   ?.replace(/<[^>]+>/g, '').trim().slice(0, 300);
    if (title && link) items.push({ title, url: link, description: desc || '' });
  }
  return items;
}

/**
 * Fetch avec timeout
 */
async function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'lelabo-ai-bot/1.0 (https://lelabo.ai)' }
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Tente de récupérer un extrait de l'article source (300 mots max)
 */
async function fetchArticleExcerpt(url) {
  try {
    const res = await fetchWithTimeout(url, 6000);
    const html = await res.text();
    // Extrait le texte brut (supprime balises, scripts, styles)
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 1500);
    return text;
  } catch {
    return '';
  }
}

/**
 * Regroupe les stories similaires par overlap de mots-clés
 * Retourne des clusters triés par nombre de sources
 */
function clusterTopics(stories) {
  const stopwords = new Set(['the','a','an','of','in','to','for','and','or','is','are','on','at','by','with','this','that','it','as','be','was','were','from','about','its','their','our','has','have','not','but']);

  function keywords(title) {
    return new Set(
      title.toLowerCase()
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopwords.has(w))
    );
  }

  const clusters = [];

  for (const story of stories) {
    const kw = keywords(story.title);
    let bestCluster = null;
    let bestOverlap = 0;

    for (const cluster of clusters) {
      const clusterKw = keywords(cluster.title);
      const overlap = [...kw].filter(w => clusterKw.has(w)).length;
      if (overlap >= 2 && overlap > bestOverlap) {
        bestOverlap = overlap;
        bestCluster = cluster;
      }
    }

    if (bestCluster) {
      bestCluster.sources.push(story.source);
      bestCluster.urls.push(story.url);
      bestCluster.score += story.score || 1;
    } else {
      clusters.push({
        title: story.title,
        url: story.url,
        sources: [story.source],
        urls: [story.url],
        description: story.description || '',
        score: story.score || 1,
      });
    }
  }

  // Tri : nombre de sources (coverage) puis score
  return clusters.sort((a, b) =>
    b.sources.length !== a.sources.length
      ? b.sources.length - a.sources.length
      : b.score - a.score
  );
}

/**
 * Scrape AI news from multiple sources and return clustered topics
 */
async function scrapeAINews() {
  console.log('🔍 Scraping AI news from multiple sources...');
  const allStories = [];

  // --- HackerNews ---
  try {
    const hnRes = await fetchWithTimeout(CONFIG.sources.hackernews);
    const ids = await hnRes.json();
    const stories = await Promise.all(
      ids.slice(0, 20).map(id =>
        fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then(r => r.json()).catch(() => null)
      )
    );
    const hn = stories.filter(s => s?.title && isAIRelated(s.title));
    hn.forEach(s => allStories.push({ title: s.title, url: s.url || `https://news.ycombinator.com/item?id=${s.id}`, score: s.score || 0, source: 'HackerNews', description: '' }));
    console.log(`  ✅ HackerNews: ${hn.length} stories IA`);
  } catch (e) { console.log(`  ⚠️ HackerNews: ${e.message}`); }

  // --- Reddit (ML + AI + ChatGPT) ---
  for (const [key, url] of [['reddit_ml', CONFIG.sources.reddit_ml], ['reddit_ai', CONFIG.sources.reddit_ai], ['reddit_chatgpt', CONFIG.sources.reddit_chatgpt]]) {
    try {
      const res = await fetchWithTimeout(url);
      const json = await res.json();
      const posts = json.data?.children?.map(c => c.data) || [];
      const ai = posts.filter(p => p.title && isAIRelated(p.title));
      ai.forEach(p => allStories.push({ title: p.title, url: p.url || `https://reddit.com${p.permalink}`, score: p.score || 0, source: key, description: p.selftext?.slice(0, 200) || '' }));
      console.log(`  ✅ ${key}: ${ai.length} posts IA`);
    } catch (e) { console.log(`  ⚠️ ${key}: ${e.message}`); }
  }

  // --- RSS Feeds (Google News FR/EN, TechCrunch, VentureBeat) ---
  for (const [key, url] of [
    ['GoogleNews-FR', CONFIG.sources.gnews_fr],
    ['GoogleNews-EN', CONFIG.sources.gnews_en],
    ['GoogleNews-CN-DeepSeek', CONFIG.sources.gnews_cn_deepseek],
    ['GoogleNews-CN-Baidu',   CONFIG.sources.gnews_cn_baidu],
    ['GoogleNews-CN-Alibaba', CONFIG.sources.gnews_cn_alibaba],
    ['GoogleNews-CN-General', CONFIG.sources.gnews_cn_general],
    ['TechCrunch',            CONFIG.sources.techcrunch],
    ['VentureBeat',           CONFIG.sources.venturebeat],
  ]) {
    try {
      const res = await fetchWithTimeout(url);
      const xml = await res.text();
      const items = parseRSS(xml).filter(i => isAIRelated(i.title));
      items.forEach(i => allStories.push({ title: i.title, url: i.url, score: 10, source: key, description: i.description || '' }));
      console.log(`  ✅ ${key}: ${items.length} articles IA`);
    } catch (e) { console.log(`  ⚠️ ${key}: ${e.message}`); }
  }

  // --- arXiv (papers récents) ---
  try {
    const res = await fetchWithTimeout(CONFIG.sources.arxiv);
    const xml = await res.text();
    const titleMatches = xml.match(/<title>(.*?)<\/title>/g) || [];
    const urlMatches = xml.match(/<id>(https?[^<]+)<\/id>/g) || [];
    const summaryMatches = xml.match(/<summary>([\s\S]*?)<\/summary>/g) || [];
    titleMatches.slice(1).forEach((t, i) => { // slice(1) pour ignorer le titre du feed
      const title = t.replace(/<\/?title>/g, '').trim();
      const url = (urlMatches[i] || '').replace(/<\/?id>/g, '').trim();
      const desc = (summaryMatches[i] || '').replace(/<\/?summary>/g, '').trim().slice(0, 200);
      if (title) allStories.push({ title, url, score: 5, source: 'arXiv', description: desc });
    });
    console.log(`  ✅ arXiv: ${titleMatches.length - 1} papers`);
  } catch (e) { console.log(`  ⚠️ arXiv: ${e.message}`); }

  console.log(`📊 Total: ${allStories.length} stories collectées`);

  // Regroupe les stories similaires en clusters
  const clusters = clusterTopics(allStories);
  console.log(`🧩 ${clusters.length} topics identifiés (top: "${clusters[0]?.title}" — ${clusters[0]?.sources.length} sources)`);

  return clusters;
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
 * Lit la date (ou generated_at) dans le frontmatter d'un fichier MDX.
 * Les articles auto-générés ont un champ generated_at ISO précis.
 */
function readArticleDate(filepath) {
  try {
    const raw = fs.readFileSync(filepath, 'utf-8');
    // Priorité au timestamp précis de génération
    const tsMatch = raw.match(/^---\n[\s\S]*?generated_at:\s*"?([^"\n]+)"?/m);
    if (tsMatch) return new Date(tsMatch[1]);
    // Fallback sur la date du frontmatter
    const dateMatch = raw.match(/^---\n[\s\S]*?date:\s*"?(\d{4}-\d{2}-\d{2})"?/m);
    if (dateMatch) return new Date(dateMatch[1]);
  } catch {}
  return null;
}

/**
 * Check if we should generate content (rate limiting).
 * Utilise la date du frontmatter (pas le mtime) pour éviter les faux positifs
 * lors des git checkouts qui remettent les mtimes à zéro.
 */
function shouldGenerateContent() {
  if (!fs.existsSync(CONTENT_DIR)) {
    return true;
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
  if (files.length === 0) return true;

  // Utilise la date dans le frontmatter, pas le mtime du fichier
  const dates = files
    .map(f => readArticleDate(path.join(CONTENT_DIR, f)))
    .filter(Boolean);

  if (dates.length === 0) return true;

  const mostRecent = new Date(Math.max(...dates.map(d => d.getTime())));
  const timeSinceLastArticle = Date.now() - mostRecent.getTime();

  if (timeSinceLastArticle < CONFIG.minTimeBetweenArticles) {
    console.log(`⏱️ Last article date: ${mostRecent.toISOString().slice(0,10)}. Rate limit active, skipping.`);
    return false;
  }

  console.log(`✅ Last article was ${Math.round(timeSinceLastArticle / (60 * 60 * 1000))}h ago — generating new content.`);
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
- **Synthèse multi-sources** : si des sources sont fournies, appuie-toi sur elles pour les faits et données — mentionne les sources dans le texte naturellement (ex: "selon TechCrunch", "d'après les chercheurs d'arXiv")

Description du sujet: ${topic.description}${topic.sourcesContext || ''}${internalLinksContext}`;

  console.log(`🤖 Generating ${level} article for: ${topic.title}`);

  // Découverte dynamique du modèle via l'API
  let modelId = null;
  try {
    const modelsPage = await anthropic.models.list({ limit: 20 });
    const models = modelsPage.data ?? [];
    console.log(`   📋 Modèles disponibles: ${models.map(m => m.id).join(', ')}`);

    // Préférence : sonnet > haiku > opus (ratio qualité/coût)
    const preferred = models.find(m => m.id.toLowerCase().includes('sonnet'))
      ?? models.find(m => m.id.toLowerCase().includes('haiku'))
      ?? models.find(m => m.id.toLowerCase().includes('claude'));

    if (preferred) {
      modelId = preferred.id;
      console.log(`   ✅ Modèle sélectionné: ${modelId}`);
    }
  } catch (err) {
    console.log(`   ⚠️ models.list() indisponible: ${err.message}`);
  }

  // Fallback si la liste ne fonctionne pas — Sonnet en priorité
  if (!modelId) {
    const FALLBACKS = [
      'claude-sonnet-4-5',
      'claude-sonnet-4-6',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-haiku-20240307',
    ];
    for (const m of FALLBACKS) {
      try {
        await anthropic.messages.create({ model: m, max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] });
        modelId = m;
        console.log(`   ✅ Fallback model OK: ${modelId}`);
        break;
      } catch (err) {
        console.log(`   ⚠️ ${m}: ${err.status ?? '?'} ${err.message?.slice(0, 60)}`);
      }
    }
  }

  if (!modelId) throw new Error('Aucun modèle Anthropic disponible — vérifier la clé API et les modèles autorisés.');

  // Probe avec un appel minimal pour vérifier que le modèle répond
  console.log(`   🔬 Test minimal du modèle ${modelId}...`);
  try {
    const probe = await anthropic.messages.create({
      model: modelId,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'ping' }]
    });
    console.log(`   ✅ Probe OK: ${JSON.stringify(probe.content)}`);
  } catch (probeErr) {
    console.error(`   ❌ Probe failed: ${probeErr.status} — ${JSON.stringify(probeErr.error)}`);
    throw new Error(`Modèle ${modelId} inaccessible: ${probeErr.status}`);
  }

  const message = await anthropic.messages.create({
    model: modelId,
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
}

/**
 * Bibliothèque de photos Unsplash par thème IA/tech
 */
const COVER_BY_TOPIC = {
  'agents':       ['1485827404703-89b55fcc595e', '1677442135703-1787eea5ce01'],
  'outils':       ['1611532736597-de2d4265fba3', '1531297484001-80022131f5a1'],
  'code':         ['1555066931-4365d14ad3cd', '1461749280684-dccba630e2f6'],
  'automatisation':['1485827404703-89b55fcc595e', '1593642632559-0c6d3fc62b89'],
  'entrepreneurs':['1507679799987-c73779587ccf', '1454165804606-c3d57bc86b40'],
  'créateurs':    ['1611162617213-7d7a39e9b1d7', '1535016120720-40c647be5912'],
  'google':       ['1573804633927-bfcbcd909acd', '1526374965328-7f61d4dc18c5'],
  'default':      ['1677442135703-1787eea5ce01', '1620712943543-bcc4688e7485',
                   '1485827404703-89b55fcc595e', '1531297484001-80022131f5a1',
                   '1555066931-4365d14ad3cd', '1526374965328-7f61d4dc18c5'],
};

function getCoverImage(tags, slug) {
  const matched = tags.find(t => COVER_BY_TOPIC[t.toLowerCase()]);
  const photos = (matched && COVER_BY_TOPIC[matched.toLowerCase()]) || COVER_BY_TOPIC['default'];
  const hash = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const id = photos[hash % photos.length];
  return `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;
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

  const generatedAt = new Date().toISOString();
  // Image partagée pour toutes les versions du même topic (slug du topic sans niveau)
  const coverImage = getCoverImage(topic.tags, topicSlug);

  const frontmatter = `---
title: "${topic.title}"
description: "${topic.description}"
date: "${date}"
generated_at: "${generatedAt}"
tags: [${topic.tags.map(tag => `"${tag}"`).join(', ')}]
level: "${level}"
topic: "${topicSlug}"
image: "${coverImage}"
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
    // Slugs des topics déjà couverts (articles existants)
    const existingSlugs = new Set(
      fs.readdirSync(CONTENT_DIR)
        .filter(f => f.endsWith('.mdx'))
        .map(f => f.replace(/--[a-z]+\.mdx$/, '').replace('.mdx', ''))
    );

    // Get AI news
    const news = await scrapeAINews();

    let topic;
    // Parcourt les clusters jusqu'à trouver un topic non couvert
    const candidatesFromNews = news.filter(n => {
      const slug = titleToSlug(n.title);
      if (existingSlugs.has(slug)) {
        console.log(`⏭️  Déjà couvert, skip: ${n.title}`);
        return false;
      }
      return true;
    });

    if (candidatesFromNews.length > 0) {
      const best = candidatesFromNews[0];
      const sourceNames = [...new Set(best.sources)].join(', ');
      console.log(`📈 Topic sélectionné: "${best.title}" (${best.sources.length} source(s): ${sourceNames})`);

      // Tente de récupérer un extrait du contenu source
      let sourceExcerpts = [];
      for (const url of best.urls.slice(0, 3)) {
        console.log(`  📄 Fetch contenu source: ${url}`);
        const excerpt = await fetchArticleExcerpt(url);
        if (excerpt.length > 100) {
          sourceExcerpts.push({ source: best.sources[best.urls.indexOf(url)] || 'Source', url, excerpt });
        }
      }

      const sourcesContext = sourceExcerpts.length > 0
        ? '\n\nSources disponibles (extrait du contenu original) :\n' +
          sourceExcerpts.map((s, i) => `[Source ${i+1} — ${s.source}] ${s.url}\n${s.excerpt.slice(0, 500)}`).join('\n\n')
        : '';

      topic = {
        title: best.title,
        description: `Analyse et décryptage : ${best.title}`,
        tags: ["actualité", "ia", "innovation"],
        sources: best.sources,
        sourcesContext,
      };
      console.log(`📈 Using trending topic: ${topic.title}`);
    } else {
      // Tous les topics trending sont déjà couverts → topic par défaut non couvert
      let defaultTopic;
      do {
        defaultTopic = getDefaultAITopics();
      } while (existingSlugs.has(titleToSlug(defaultTopic.title)));
      topic = defaultTopic;
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