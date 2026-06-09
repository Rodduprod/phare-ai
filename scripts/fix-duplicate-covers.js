#!/usr/bin/env node
/**
 * Remplace les images dupliquées dans les articles MDX.
 * - Regroupe les articles par topic (slug sans --niveau)
 * - Identifie les topics qui partagent la même image Unsplash
 * - Appelle l'API Unsplash pour chaque topic dupliqué
 * - Met à jour le frontmatter des fichiers MDX
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, '..', 'content', 'articles');
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_KEY) {
  console.error('❌ UNSPLASH_ACCESS_KEY manquante');
  process.exit(0); // commit ce qui a été fait avant de quitter
}

// ── Lecture de tous les articles ──────────────────────────────────────────────
const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
console.log(`📂 ${files.length} articles trouvés`);

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)/);
    if (m) fm[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return fm;
}

function extractUnsplashId(imageUrl) {
  if (!imageUrl) return null;
  // Format: https://images.unsplash.com/photo-XXXX?...
  const m = imageUrl.match(/unsplash\.com\/photo-([^?&\s]+)/);
  return m ? m[1] : null;
}

function baseSlug(filename) {
  return filename
    .replace('.mdx', '')
    .replace(/--?(debutant|amateur|confirme)$/, '');
}

// ── Grouper par topic ─────────────────────────────────────────────────────────
const topics = new Map(); // baseSlug → { files, imageId, tags }

for (const file of files) {
  const content = readFileSync(join(CONTENT_DIR, file), 'utf8');
  const fm = parseFrontmatter(content);
  const slug = baseSlug(file);

  if (!topics.has(slug)) {
    topics.set(slug, { files: [], imageId: null, tags: [] });
  }
  const topic = topics.get(slug);
  topic.files.push(file);

  const id = extractUnsplashId(fm.image);
  if (id && !topic.imageId) {
    topic.imageId = id;
    topic.tags = fm.tags ? fm.tags.replace(/[\[\]]/g, '').split(',').map(t => t.trim().replace(/^["']|["']$/g, '')) : [];
    topic.title = fm.title || slug;
  }

  // Image générée par Gemini (path local) → pas un ID Unsplash
  if (fm.image && fm.image.startsWith('/images/generated/')) {
    topic.imageId = '__gemini__'; // marquer comme image locale, pas à remplacer
  }
}

console.log(`🗂  ${topics.size} topics distincts`);

// ── Détecter les doublons ─────────────────────────────────────────────────────
const idCount = new Map(); // imageId → [baseSlug]
for (const [slug, topic] of topics) {
  if (!topic.imageId || topic.imageId === '__gemini__') continue;
  if (!idCount.has(topic.imageId)) idCount.set(topic.imageId, []);
  idCount.get(topic.imageId).push(slug);
}

const duplicateTopics = new Set();
for (const [id, slugs] of idCount) {
  if (slugs.length > 1) {
    // Garder le premier (par ordre alpha = plus ancien), remplacer les autres
    for (const s of slugs.slice(1)) duplicateTopics.add(s);
  }
}

console.log(`\n🔍 ${duplicateTopics.size} topics avec image dupliquée à corriger`);
if (duplicateTopics.size === 0) {
  console.log('✅ Aucun doublon — rien à faire.');
  process.exit(0);
}

// ── Traduction FR → EN pour les queries Unsplash ─────────────────────────────
const FR_TO_EN = {
  'intelligence artificielle': 'artificial intelligence', 'IA': 'AI', 'automatisation': 'automation',
  'apprentissage': 'machine learning', 'données': 'data', 'robot': 'robot', 'agents': 'AI agents',
  'outils': 'tools', 'code': 'software code', 'santé': 'healthcare', 'éducation': 'education',
  'entreprise': 'business', 'sécurité': 'cybersecurity', 'création': 'creative', 'image': 'digital image',
  'voix': 'voice', 'langage': 'language model', 'modèle': 'AI model', 'formation': 'learning',
  'réglementation': 'regulation', 'régulation': 'regulation', 'europe': 'europe', 'chine': 'china',
  'google': 'google', 'apple': 'apple', 'microsoft': 'microsoft', 'startup': 'startup',
  'investissement': 'investment', 'productivité': 'productivity', 'chatgpt': 'chatgpt',
  'llm': 'language model', 'open source': 'open source', 'vidéo': 'video', 'musique': 'music',
};

function toEnQuery(tags) {
  const translated = tags.slice(0, 3).map(t => FR_TO_EN[t.toLowerCase()] || t);
  return (translated.join(' ') + ' technology').trim();
}

// ── Appels Unsplash + mise à jour ─────────────────────────────────────────────
let updated = 0;
let errors = 0;
const usedIds = new Set([...idCount.keys()]); // éviter de réutiliser un ID déjà en place

async function fetchUnsplashPhoto(query, retryQuery = 'artificial intelligence technology') {
  for (const q of [query, retryQuery]) {
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(q)}&orientation=landscape&client_id=${UNSPLASH_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      const remaining = res.headers.get('x-ratelimit-remaining');
      if (res.status === 403 || res.status === 429) {
        console.error(`\n❌ Rate limit Unsplash atteint (remaining: ${remaining})`);
        process.exit(0); // commit ce qui a été fait avant de quitter
      }
      continue;
    }
    const photo = await res.json();
    if (!photo.id || usedIds.has(photo.id)) continue; // éviter doublon
    return photo;
  }
  return null;
}

const slugList = [...duplicateTopics];
console.log(`\n🔄 Remplacement en cours...\n`);

for (let i = 0; i < slugList.length; i++) {
  const slug = slugList[i];
  const topic = topics.get(slug);
  const query = toEnQuery(topic.tags);

  process.stdout.write(`[${i + 1}/${slugList.length}] ${slug.slice(0, 50)}... `);

  try {
    const photo = await fetchUnsplashPhoto(query);
    if (!photo) {
      console.log('⚠️  pas de photo unique trouvée — skip');
      errors++;
      continue;
    }

    usedIds.add(photo.id);
    const newUrl = (photo.urls?.regular || `https://images.unsplash.com/photo-${photo.id}`)
      .split('?')[0] + '?w=1200&q=80&auto=format&fit=crop';

    // Mettre à jour tous les fichiers du topic (débutant/amateur/confirmé)
    for (const file of topic.files) {
      const filePath = join(CONTENT_DIR, file);
      let content = readFileSync(filePath, 'utf8');
      content = content.replace(
        /^(image:\s*)["']?https:\/\/images\.unsplash\.com\/photo-[^\s"'\n]+["']?/m,
        `$1"${newUrl}"`
      );
      writeFileSync(filePath, content);
    }

    console.log(`✅ → ${photo.id} (${topic.files.length} fichiers)`);
    updated++;

    // Pause 200ms pour ne pas spammer l'API
    await new Promise(r => setTimeout(r, 200));
  } catch (err) {
    console.log(`❌ ${err.message}`);
    errors++;
  }
}

console.log(`\n✅ ${updated} topics mis à jour, ${errors} erreurs`);
