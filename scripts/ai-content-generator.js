#!/usr/bin/env node

/**
 * 🤖 Le Labo AI - Automated Content Generator
 * 
 * Scrapes AI news from the last 24h, identifies top trending topics,
 * and generates 3 articles (×3 levels) per run.
 * 
 * Runs once per day at 7h UTC via GitHub Actions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'articles');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'generated');

// Créer le dossier images générées s'il n'existe pas
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Configuration
const CONFIG = {
  articlesPerRun: parseInt(process.env.ARTICLES_COUNT || '3', 10), // 3 articles par run
  minTimeBetweenRuns: 23 * 60 * 60 * 1000, // 23h min entre deux runs (1 run/jour)
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
 * Parse un flux RSS simple (XML) — retourne array de { title, url, description, pubDate }
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
    const pubDateRaw = (block.match(/<pubDate[^>]*>(.*?)<\/pubDate>/) || [])[1]?.trim();
    const pubDate = pubDateRaw ? new Date(pubDateRaw) : null;
    if (title && link) items.push({ title, url: link, description: desc || '', pubDate });
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
 * Filtre les articles des dernières 24h uniquement
 */
async function scrapeAINews() {
  console.log('🔍 Scraping AI news from the last 24h...');
  const allStories = [];
  const CUTOFF_MS = Date.now() - 24 * 60 * 60 * 1000; // 24h ago
  const CUTOFF_UNIX = Math.floor(CUTOFF_MS / 1000);

  // --- HackerNews ---
  try {
    const hnRes = await fetchWithTimeout(CONFIG.sources.hackernews);
    const ids = await hnRes.json();
    const stories = await Promise.all(
      ids.slice(0, 30).map(id =>
        fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then(r => r.json()).catch(() => null)
      )
    );
    const hn = stories.filter(s => s?.title && isAIRelated(s.title) && (s.time || 0) >= CUTOFF_UNIX);
    hn.forEach(s => allStories.push({ title: s.title, url: s.url || `https://news.ycombinator.com/item?id=${s.id}`, score: s.score || 0, source: 'HackerNews', description: '' }));
    console.log(`  ✅ HackerNews: ${hn.length} stories IA (24h)`);
  } catch (e) { console.log(`  ⚠️ HackerNews: ${e.message}`); }

  // --- Reddit (ML + AI + ChatGPT) ---
  for (const [key, url] of [['reddit_ml', CONFIG.sources.reddit_ml], ['reddit_ai', CONFIG.sources.reddit_ai], ['reddit_chatgpt', CONFIG.sources.reddit_chatgpt]]) {
    try {
      const res = await fetchWithTimeout(url);
      const json = await res.json();
      const posts = json.data?.children?.map(c => c.data) || [];
      const ai = posts.filter(p => p.title && isAIRelated(p.title) && (p.created_utc || 0) >= CUTOFF_UNIX);
      ai.forEach(p => allStories.push({ title: p.title, url: p.url || `https://reddit.com${p.permalink}`, score: p.score || 0, source: key, description: p.selftext?.slice(0, 200) || '' }));
      console.log(`  ✅ ${key}: ${ai.length} posts IA (24h)`);
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
      const items = parseRSS(xml).filter(i => {
        if (!isAIRelated(i.title)) return false;
        // Filtre 24h si pubDate disponible, sinon on garde (flux sans date)
        if (i.pubDate && i.pubDate instanceof Date && !isNaN(i.pubDate)) {
          return i.pubDate.getTime() >= CUTOFF_MS;
        }
        return true;
      });
      items.forEach(i => allStories.push({ title: i.title, url: i.url, score: 10, source: key, description: i.description || '' }));
      console.log(`  ✅ ${key}: ${items.length} articles IA (24h)`);
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

  if (timeSinceLastArticle < CONFIG.minTimeBetweenRuns) {
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
  const levelDescriptions = {
    débutant: `pour le grand public (débutants complets en IA). Accessible, sans jargon, métaphores du quotidien, ton enthousiaste. 800-1000 mots. Structure : intro accrocheuse → explication simple → exemples concrets → impact quotidien → conclusion optimiste.`,
    amateur:  `pour des professionnels tech qui découvrent l'IA. Technique mais accessible, implications business, exemples d'architectures. 1000-1200 mots. Structure : contexte & enjeux → fonctionnement → cas d'usage business → APIs disponibles → ROI & impact équipes.`,
    confirmé: `pour des architectes et ingénieurs ML. Deep dive technique, architectures, benchmarks, code, optimisations. 1200-1500 mots. Structure : fondements techniques → implémentation → benchmarks → limitations → recherche & évolutions futures.`,
  };

  const levelPrompts = {
    débutant: `Tu es rédacteur expert pour Le Labo AI, un média français d'IA pour le grand public.

Sujet source (actu internationale) : "${topic.title}"
Niveau cible : ${levelDescriptions['débutant']}

Réponds UNIQUEMENT avec ce format exact (respecte les séparateurs) :

TITRE: [titre accrocheur en français, max 80 caractères, sans guillemets]
DESCRIPTION: [résumé en 1-2 phrases en français, 120-160 caractères]
TAGS: [3-5 mots-clés en minuscules sans accents, séparés par des virgules]
---
[contenu complet de l'article en markdown]`,

    amateur: `Tu es rédacteur expert pour Le Labo AI, un média français d'IA pour les professionnels.

Sujet source (actu internationale) : "${topic.title}"
Niveau cible : ${levelDescriptions['amateur']}

Réponds UNIQUEMENT avec ce format exact (respecte les séparateurs) :

TITRE: [titre accrocheur en français, max 80 caractères, sans guillemets]
DESCRIPTION: [résumé en 1-2 phrases en français, 120-160 caractères]
TAGS: [3-5 mots-clés en minuscules sans accents, séparés par des virgules]
---
[contenu complet de l'article en markdown]`,

    confirmé: `Tu es rédacteur expert pour Le Labo AI, un média français d'IA pour les ingénieurs ML.

Sujet source (actu internationale) : "${topic.title}"
Niveau cible : ${levelDescriptions['confirmé']}

Réponds UNIQUEMENT avec ce format exact (respecte les séparateurs) :

TITRE: [titre accrocheur en français, max 80 caractères, sans guillemets]
DESCRIPTION: [résumé en 1-2 phrases en français, 120-160 caractères]
TAGS: [3-5 mots-clés en minuscules sans accents, séparés par des virgules]
---
[contenu complet de l'article en markdown]`,
  };

  const internalLinksContext = getExistingArticlesContext();

  const prompt = levelPrompts[level] + `

Règles importantes :
- Tout le contenu (titre, description, tags, article) doit être en français
- Contenu 100% original, inspiré des sources mais jamais copié
- **Maillage interne obligatoire** : minimum 2 liens internes dans le corps du texte (voir liste ci-dessous)
- **Synthèse multi-sources** : cite les sources naturellement dans le texte ("selon TechCrunch", "d'après Google News"...)
- Titre accrocheur, clair, informatif — pas un titre de communiqué de presse${topic.sourcesContext || ''}${internalLinksContext}`;

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

  const raw = message.content[0].text;

  // Parse le format structuré : TITRE / DESCRIPTION / TAGS / --- / contenu
  const titreMatch    = raw.match(/^TITRE:\s*(.+)$/m);
  const descMatch     = raw.match(/^DESCRIPTION:\s*(.+)$/m);
  const tagsMatch     = raw.match(/^TAGS:\s*(.+)$/m);
  const contentMatch  = raw.match(/^---\s*\n([\s\S]+)$/m);

  const generatedTitle       = titreMatch?.[1]?.trim().replace(/^["']|["']$/g, '') || topic.title;
  const generatedDescription = descMatch?.[1]?.trim() || topic.description;
  const generatedTags        = tagsMatch?.[1]?.split(',').map(t => t.trim()).filter(Boolean) || topic.tags;
  const generatedContent     = contentMatch?.[1]?.trim() || raw;

  // Sanity: remplace les <N et >N hors blocs code (ex: <7B, <100ms) — invalide en MDX car interprété comme JSX
  const sanitizedContent = generatedContent
    .split(/(?=(```[\s\S]*?```))/)  // sépare les blocs code
    .map((chunk, i) => i % 2 === 0  // les chunks pairs sont hors code
      ? chunk.replace(/<(\d)/g, '&lt;$1').replace(/>(\d)/g, '&gt;$1')
      : chunk
    ).join('');

  return { title: generatedTitle, description: generatedDescription, tags: generatedTags, content: sanitizedContent };
}

/**
 * Bibliothèque de photos Unsplash par thème IA/tech
 */
/**
 * 🎨 Génération d'image via Google Gemini API
 * Génère une image éditoriale unique pour chaque topic d'article.
 * Fallback sur le pool Unsplash si l'API est indisponible ou quota dépassé.
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';

// Styles visuels variés — Claude en choisit un adapté au sujet
const IMAGE_STYLES = [
  'overhead photograph of a carefully arranged flat lay on a textured surface',
  'close-up macro photograph with shallow depth of field, bokeh background',
  'wide landscape scene with a single striking focal element, golden hour lighting',
  'architectural or geometric composition with strong lines and natural light',
  'hands-on scene showing someone interacting with physical objects, candid feel',
  'nature-inspired metaphor — organic shapes, plants, water, light',
  'retro-analog aesthetic — vintage objects, film grain, muted palette',
  'abstract paper craft or origami composition, colorful shadows',
  'cinematic still life with dramatic side lighting and deep shadows',
  'split composition — two contrasting elements side by side',
];

/**
 * Utilise Claude pour générer un prompt image créatif et unique
 */
async function generateImagePrompt(title, tags) {
  try {
    const styleHints = IMAGE_STYLES.map((s, i) => `${i + 1}. ${s}`).join('\n');
    
    const response = await anthropic.messages.create({
      model: modelToUse,
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Tu es un directeur artistique pour un magazine tech français. Génère UN prompt de génération d'image (en anglais) pour cet article :

Titre : "${title}"
Tags : ${tags}

RÈGLES :
- Choisis UN style parmi ces options (ou invente un style original) :
${styleHints}
- Le prompt doit décrire une scène CONCRÈTE et SPÉCIFIQUE au sujet de l'article
- Utilise des métaphores visuelles créatives liées au contenu
- PAS de robots mignons, hologrammes, écrans flottants, circuits imprimés
- PAS de texte/mots/lettres dans l'image
- Format 16:9 paysage
- Style éditorial magazine haut de gamme (Wired, Monocle, The Verge)
- Varie les palettes de couleurs (pas toujours bleu/violet tech)

Réponds UNIQUEMENT avec le prompt, rien d'autre. Pas d'introduction, pas d'explication.`
      }],
    });

    const prompt = response.content[0].text.trim();
    console.log(`  🎨 Prompt image : ${prompt.slice(0, 80)}...`);
    return prompt;
  } catch (err) {
    console.log(`  ⚠️ Erreur génération prompt image: ${err.message}`);
    // Fallback sur un prompt basique
    return `A minimal editorial photograph for a magazine article about "${title}". Clean composition, natural light, concrete objects as visual metaphor. Shot on film, warm tones. NO text, NO letters. 16:9 landscape.`;
  }
}

async function generateCoverImage(title, tags, topicSlug) {
  if (!GEMINI_API_KEY) {
    console.log('  ⚠️ GEMINI_API_KEY manquante — fallback Unsplash');
    return null;
  }

  // Claude génère un prompt image créatif et varié pour chaque article
  const tagStr = tags.slice(0, 4).join(', ');
  const imagePrompt = await generateImagePrompt(title, tagStr);

  try {
    console.log('  🎨 Génération image IA via Gemini...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: imagePrompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.log(`  ⚠️ Gemini API ${response.status} — fallback Unsplash`);
      if (err.includes('quota')) console.log('  💡 Quota dépassé — réessayer plus tard');
      return null;
    }

    const data = await response.json();
    const candidates = data.candidates || [];
    
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          const { mimeType, data: base64Data } = part.inlineData;
          const ext = mimeType === 'image/png' ? 'png' : 'jpg';
          const filename = `${topicSlug}.${ext}`;
          const filepath = path.join(IMAGES_DIR, filename);
          
          // Sauvegarder l'image
          fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
          const sizeKB = Math.round(fs.statSync(filepath).size / 1024);
          console.log(`  ✅ Image générée : ${filename} (${sizeKB} KB)`);
          
          return `/images/generated/${filename}`;
        }
      }
    }

    console.log('  ⚠️ Pas d\'image dans la réponse Gemini — fallback Unsplash');
    return null;
  } catch (err) {
    console.log(`  ⚠️ Erreur génération image: ${err.message} — fallback Unsplash`);
    return null;
  }
}

// Tracking des images générées dans ce run (pour ne pas régénérer pour chaque niveau)
const _generatedImages = new Map(); // topicSlug → image path

async function getOrGenerateCoverImage(title, tags, topicSlug) {
  // Si déjà générée pour ce topic (autre niveau), réutiliser
  if (_generatedImages.has(topicSlug)) {
    return _generatedImages.get(topicSlug);
  }

  // Tenter la génération IA
  const generatedPath = await generateCoverImage(title, tags, topicSlug);
  if (generatedPath) {
    _generatedImages.set(topicSlug, generatedPath);
    return generatedPath;
  }

  // Fallback Unsplash
  const unsplashUrl = getCoverImage(tags, topicSlug);
  _generatedImages.set(topicSlug, unsplashUrl);
  return unsplashUrl;
}

// ⚠️ Tous les IDs ci-dessous ont été vérifiés HTTP 200 sur images.unsplash.com (fallback)
const COVER_BY_TOPIC = {
  // IA / agents / robots
  'agents':         ['1485827404703-89b55fcc595e', '1677442135703-1787eea5ce01', '1547082299-de196ea013d6'],
  'robot':          ['1620712943543-bcc4688e7485', '1677442135703-1787eea5ce01', '1485827404703-89b55fcc595e'],
  // Outils / software
  'outils':         ['1611532736597-de2d4265fba3', '1531297484001-80022131f5a1', '1488590528505-98d2b5aba04b'],
  // Code / dev
  'code':           ['1587620962725-abab7fe55159', '1461749280684-dccba630e2f6', '1517430816045-df4b7de11d1d'],
  // Automatisation / workflow
  'automatisation': ['1593642632559-0c6d3fc62b89', '1488590528505-98d2b5aba04b', '1518770660439-4636190af475'],
  // Entrepreneurs / business
  'entrepreneurs':  ['1507679799987-c73779587ccf', '1454165804606-c3d57bc86b40', '1519389950473-47ba0277781c'],
  // Créateurs / design
  'créateurs':      ['1611162617213-7d7a39e9b1d7', '1547082299-de196ea013d6', '1611532736597-de2d4265fba3'],
  // Google / Big Tech
  'google':         ['1573804633927-bfcbcd909acd', '1526374965328-7f61d4dc18c5', '1516321318423-f06f85e504b3'],
  // Santé / médical
  'santé':          ['1559757148-5c350d0d3c56', '1576091160550-2173dba999ef', '1519389950473-47ba0277781c'],
  // Éducation / apprentissage
  'éducation':      ['1472162072942-cd5147eb3902', '1456513080510-7bf3a84b82f8', '1503676260728-1c00da094a0b'],
  // Enfants / jouets / jeux — images colorées, humaines, pas "tech"
  'jouets':         ['1503454537195-1dcabb73ffb9', '1540479859555-17af45c78602', '1472162072942-cd5147eb3902'],
  'enfants':        ['1503454537195-1dcabb73ffb9', '1540479859555-17af45c78602', '1503676260728-1c00da094a0b'],
  'jeux':           ['1540479859555-17af45c78602', '1503454537195-1dcabb73ffb9', '1472162072942-cd5147eb3902'],
  // Default — pool large 100% vérifié
  'default':        [
    '1677442135703-1787eea5ce01', '1620712943543-bcc4688e7485',
    '1485827404703-89b55fcc595e', '1531297484001-80022131f5a1',
    '1526374965328-7f61d4dc18c5', '1593642632559-0c6d3fc62b89',
    '1611532736597-de2d4265fba3', '1461749280684-dccba630e2f6',
    '1507679799987-c73779587ccf', '1542744173-8e7e53415bb0',
    '1587620962725-abab7fe55159', '1516321318423-f06f85e504b3',
    '1517430816045-df4b7de11d1d', '1488590528505-98d2b5aba04b',
    '1518770660439-4636190af475', '1519389950473-47ba0277781c',
    '1559757148-5c350d0d3c56', '1576091160550-2173dba999ef',
    '1456513080510-7bf3a84b82f8', '1503676260728-1c00da094a0b',
    '1503454537195-1dcabb73ffb9', '1472162072942-cd5147eb3902',
    '1547082299-de196ea013d6', '1540479859555-17af45c78602',
  ],
};

/**
 * Charge les images déjà utilisées dans les articles existants
 * → évite les doublons entre runs successifs
 */
function loadUsedImagesFromDisk(articlesDir) {
  const used = new Set();
  if (!fs.existsSync(articlesDir)) return used;
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.mdx'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(articlesDir, file), 'utf8');
    const match = content.match(/^image:\s*"https:\/\/images\.unsplash\.com\/photo-([^?]+)/m);
    if (match) used.add(match[1]);
  }
  return used;
}

// Suivi des images utilisées : articles existants + run courant
const _usedCoverImages = loadUsedImagesFromDisk(path.join(__dirname, '..', 'content', 'articles'));

function getCoverImage(tags, slug) {
  // Slug de base = sans le suffixe --niveau (les 3 niveaux d'un même topic partagent la même image)
  const baseSlug = slug.replace(/--?(debutant|amateur|confirme)$/, '');

  const matched = tags.find(t => COVER_BY_TOPIC[t.toLowerCase()]);
  const photos = (matched && COVER_BY_TOPIC[matched.toLowerCase()]) || COVER_BY_TOPIC['default'];

  // Sélection par hash, avec fallback sur les suivantes si déjà utilisée
  const hash = baseSlug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  let id = null;
  for (let i = 0; i < photos.length; i++) {
    const candidate = photos[(hash + i) % photos.length];
    if (!_usedCoverImages.has(candidate)) {
      id = candidate;
      break;
    }
  }
  // Fallback ultime : pool default entier
  if (!id) {
    for (const candidate of COVER_BY_TOPIC['default']) {
      if (!_usedCoverImages.has(candidate)) { id = candidate; break; }
    }
  }
  // Si tout est épuisé (très rare), on réutilise le premier du pool
  if (!id) id = photos[hash % photos.length];

  _usedCoverImages.add(id);
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
async function createMDXFile(topic, generated, level, topicSlug) {
  // `generated` = { title, description, tags, content } produit par Claude
  const date = new Date().toISOString().split('T')[0];
  const levelSlug = level === 'débutant' ? 'debutant' : level === 'confirmé' ? 'confirme' : level;
  const generatedAt = new Date().toISOString();
  const coverImage = await getOrGenerateCoverImage(generated.title, generated.tags, topicSlug);

  // Échappe les guillemets dans le titre pour le YAML
  const safeTitle = generated.title.replace(/"/g, '\\"');
  const safeDesc  = generated.description.replace(/"/g, '\\"');

  const frontmatter = `---
title: "${safeTitle}"
description: "${safeDesc}"
date: "${date}"
generated_at: "${generatedAt}"
tags: [${generated.tags.map(t => `"${t}"`).join(', ')}]
level: "${level}"
topic: "${topicSlug}"
image: "${coverImage}"
published: true
---

${generated.content}`;

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

  const forceGenerate = process.argv.includes('--force') || process.env.FORCE_GENERATE === 'true';

  // Check if we should generate content
  if (!forceGenerate && !shouldGenerateContent()) {
    console.log('⏹️ Rate limit active, skipping this hour');
    return;
  }
  if (forceGenerate) console.log('⚡ Force mode — rate limit ignoré');

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not found');
    return;
  }

  try {
    // Slugs + titres des topics déjà couverts (articles existants)
    const existingFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
    const existingSlugs = new Set(
      existingFiles.map(f => f.replace(/--[a-z]+\.mdx$/, '').replace('.mdx', ''))
    );

    // Titres + dates des articles existants pour la déduplication sémantique temporelle
    const TODAY = new Date();
    const existingArticles = existingFiles
      .filter(f => f.endsWith('--debutant.mdx') || !f.includes('--'))
      .map(f => {
        try {
          const content = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf-8');
          const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
          const dateMatch  = content.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m);
          const title = titleMatch ? titleMatch[1] : '';
          const date  = dateMatch  ? new Date(dateMatch[1]) : null;
          const ageDays = date ? Math.floor((TODAY - date) / 86400000) : 999;
          return title ? { title, ageDays } : null;
        } catch { return null; }
      })
      .filter(Boolean);

    // Seuil de similarité selon l'âge de l'article existant :
    //   < 7 jours  → 0.30 (très strict  — même sujet cette semaine = doublon)
    //   7–30 jours → 0.45 (strict       — même sujet ce mois = doublon probable)
    //   30–90 jours→ 0.60 (modéré       — même société mais angle différent = OK)
    //   > 90 jours → 0.80 (permissif    — sujet ancien peut avoir du nouveau)
    function thresholdForAge(ageDays) {
      if (ageDays <  7) return 0.30;
      if (ageDays < 30) return 0.45;
      if (ageDays < 90) return 0.60;
      return 0.80;
    }

    const STOPWORDS_FR = new Set([
      'le','la','les','un','une','des','de','du','et','ou','en','sur','par','pour',
      'que','qui','avec','dans','est','son','ses','leur','leurs','cette','tout',
      'mais','plus','comme','aussi','entre','vers','dont','aux','au','the','this','is',
    ]);
    function extractKeywords(title) {
      return new Set(
        title.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9 ]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 3 && !STOPWORDS_FR.has(w))
      );
    }
    // Groupes d'entités : baidu/ernie = même société, openai/chatgpt/gpt = même écosystème, etc.
    // Si deux titres partagent ≥1 entité du même groupe → même sujet
    const ENTITY_GROUPS = [
      ['baidu','ernie'],
      ['alibaba','qwen'],
      ['openai','chatgpt','gpt','sora','dalle'],
      ['anthropic','claude'],
      ['google','deepmind','gemini','bard'],
      ['meta','llama'],
      ['microsoft','copilot','bing'],
      ['deepseek'],
      ['mistral'],
      ['perplexity'],
      ['grok','xai'],
      ['midjourney'],
    ];
    // Map entité → id de groupe
    const ENTITY_TO_GROUP = new Map();
    ENTITY_GROUPS.forEach((grp, i) => grp.forEach(e => ENTITY_TO_GROUP.set(e, i)));

    function extractEntityGroups(title) {
      const words = title.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/);
      const groups = new Set();
      for (const w of words) {
        if (ENTITY_TO_GROUP.has(w)) groups.add(ENTITY_TO_GROUP.get(w));
      }
      return groups;
    }
    function isTooSimilar(newTitle) {
      const newKw  = extractKeywords(newTitle);
      const newEnt = extractEntityGroups(newTitle);
      if (newKw.size === 0) return false;
      for (const { title: existingTitle, ageDays } of existingArticles) {
        const threshold = thresholdForAge(ageDays);
        const existKw  = extractKeywords(existingTitle);
        const existEnt = extractEntityGroups(existingTitle);

        // 1. Similarité sémantique générale
        const overlap = [...newKw].filter(w => existKw.has(w)).length;
        const score = overlap / Math.min(newKw.size, existKw.size);

        // 2. Chevauchement de groupes d'entités (baidu+ernie = même groupe)
        //    ≥1 groupe commun + article récent (<30j) = doublon quasi-certain
        const sharedGroups = [...newEnt].filter(g => existEnt.has(g));
        const entityBlock = sharedGroups.length >= 1 && ageDays < 30;

        if (score >= threshold || entityBlock) {
          const reason = entityBlock
            ? `groupe entité commun: [${sharedGroups.map(i => ENTITY_GROUPS[i].join('/')).join(', ')}]`
            : `score: ${(score*100).toFixed(0)}%, seuil: ${(threshold*100).toFixed(0)}%`;
          console.log(`⏭️  Trop similaire à "${existingTitle}" (${reason}, âge: ${ageDays}j), skip: ${newTitle}`);
          return true;
        }
      }
      return false;
    }

    // Get AI news (dernières 24h)
    const news = await scrapeAINews();

    // Filtre les topics non couverts
    const candidatesFromNews = news.filter(n => {
      const slug = titleToSlug(n.title);
      if (existingSlugs.has(slug)) {
        console.log(`⏭️  Déjà couvert (slug exact), skip: ${n.title}`);
        return false;
      }
      if (isTooSimilar(n.title)) return false;
      return true;
    });

    // Sélectionne N topics distincts (N = CONFIG.articlesPerRun, défaut 3)
    const N = CONFIG.articlesPerRun;
    const selectedTopics = [];
    const selectedTitles = []; // pour éviter les doublons entre les N topics du même run

    for (const candidate of candidatesFromNews) {
      if (selectedTopics.length >= N) break;
      // Vérifier que ce topic n'est pas trop similaire à ceux déjà sélectionnés ce run
      const alreadySelected = selectedTitles.some(t => {
        const kA = extractKeywords(t), kB = extractKeywords(candidate.title);
        const overlap = [...kA].filter(w => kB.has(w)).length;
        return overlap / Math.min(kA.size, kB.size) >= 0.40;
      });
      if (alreadySelected) continue;

      // Enrichir avec les extraits sources
      let sourceExcerpts = [];
      for (const url of candidate.urls.slice(0, 2)) {
        const excerpt = await fetchArticleExcerpt(url);
        if (excerpt.length > 100) {
          sourceExcerpts.push({ source: candidate.sources[candidate.urls.indexOf(url)] || 'Source', url, excerpt });
        }
      }
      const sourcesContext = sourceExcerpts.length > 0
        ? '\n\nSources disponibles :\n' +
          sourceExcerpts.map((s, i) => `[Source ${i+1} — ${s.source}] ${s.url}\n${s.excerpt.slice(0, 400)}`).join('\n\n')
        : '';

      selectedTopics.push({
        title: candidate.title,
        description: `Analyse et décryptage : ${candidate.title}`,
        tags: ["actualité", "ia", "innovation"],
        sources: candidate.sources,
        sourcesContext,
      });
      selectedTitles.push(candidate.title);
      console.log(`📈 Topic ${selectedTopics.length}/${N}: "${candidate.title}" (${candidate.sources.length} sources)`);
    }

    // Compléter avec des topics par défaut si pas assez de news
    while (selectedTopics.length < N) {
      let defaultTopic;
      let attempts = 0;
      do {
        defaultTopic = getDefaultAITopics();
        attempts++;
      } while ((existingSlugs.has(titleToSlug(defaultTopic.title)) || isTooSimilar(defaultTopic.title)) && attempts < 20);
      selectedTopics.push(defaultTopic);
      console.log(`🎯 Topic par défaut ${selectedTopics.length}/${N}: "${defaultTopic.title}"`);
    }

    // Générer les 3 niveaux pour chaque topic sélectionné
    const levels = ['débutant', 'amateur', 'confirmé'];
    let totalCreated = 0;

    for (let i = 0; i < selectedTopics.length; i++) {
      const topic = selectedTopics[i];
      const topicSlug = titleToSlug(topic.title);
      console.log(`\n📝 [${i+1}/${N}] Generating 3 levels for: "${topic.title}"`);

      let createdCount = 0;
      let frenchTitle = null;

      for (const level of levels) {
        // Retry automatique : max 3 tentatives avec backoff exponentiel (issue #46)
        let generated = null;
        let attempts = 0;
        while (attempts < 3) {
          try {
            generated = await generateArticle(topic, level);
            break; // succès → sortir du while
          } catch (err) {
            attempts++;
            if (attempts < 3) {
              const delayMs = 5000 * attempts;
              console.warn(`  ⚠️ Tentative ${attempts}/3 échouée pour niveau ${level} — retry dans ${delayMs / 1000}s...`);
              await new Promise(r => setTimeout(r, delayMs));
            } else {
              console.error(`  ❌ Niveau ${level} : échec après 3 tentatives — ${err.message}`);
            }
          }
        }
        if (!generated) continue; // passer au niveau suivant si tous les retries ont échoué

        if (!frenchTitle) {
          frenchTitle = generated.title;
          console.log(`🇫🇷 Titre FR généré: "${frenchTitle}"`);
        }
        const frenchSlug = titleToSlug(frenchTitle);
        // Ajouter le slug français au set pour éviter les doublons intra-run
        existingSlugs.add(frenchSlug);
        const created = await createMDXFile(topic, generated, level, frenchSlug);
        if (created) createdCount++;
        await new Promise(r => setTimeout(r, 2000));
      }

      if (createdCount > 0) {
        totalCreated += createdCount;
        console.log(`🎉 [${i+1}/${N}] Generated ${createdCount}/3 versions for: ${frenchTitle || topic.title}`);
      }
    }

    console.log(`\n✅ Run complet: ${totalCreated} fichiers créés (${selectedTopics.length} topics × 3 niveaux)`);


  } catch (error) {
    console.error('❌ Error generating content:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}