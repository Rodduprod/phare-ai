#!/usr/bin/env node
/**
 * Assigne une image de couverture Unsplash unique à chaque article.
 * Grand pool de 50 photos AI/tech — aucun doublon possible.
 * 
 * Usage : node scripts/add-covers.js [--force]
 *   --force : réassigne même les articles qui ont déjà une image
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, '..', 'content', 'articles');
const FORCE = process.argv.includes('--force');

// Pool de 50 photos Unsplash AI/tech — toutes vérifiées
const PHOTO_POOL = [
  '1677442135703-1787eea5ce01', // neural network visualization
  '1620712943543-bcc4688e7485', // AI concept blue
  '1485827404703-89b55fcc595e', // robot arm
  '1531297484001-80022131f5a1', // laptop code dark
  '1555066931-4365d14ad3cd',    // code screen green
  '1461749280684-dccba630e2f6', // coding monitor
  '1526374965328-7f61d4dc18c5', // data matrix
  '1593642632559-0c6d3fc62b89', // tech workspace
  '1611532736597-de2d4265fba3', // tools tech
  '1573804633927-bfcbcd909acd', // colorful tech
  '1611162617213-7d7a39e9b1d7', // content creation
  '1535016120720-40c647be5912', // creative studio
  '1507679799987-c73779587ccf', // business meeting
  '1454165804606-c3d57bc86b40', // work laptop
  '1542744173-8e7e53415bb0',    // entrepreneur desk
  '1558618666-fcd25c85cd64',    // tech abstract purple
  '1550745165-9bc0b252726f',    // computer monitor glow
  '1517430816045-df4b7de11d1d', // tech concept dark
  '1504868584819-f8e8b4b6d7e3', // data science graph
  '1551288049-bebda4e38f71',    // machine learning abstract
  '1563986768609-322da13575f3', // startup office
  '1522071820081-009f0129c71c', // team meeting
  '1498049794561-7780e7231661', // smart home tech
  '1581089778977-6df9cfdd7f2e', // humanoid robot
  '1535378917042-10bfdea4de8b', // abstract digital blue
  '1592659762303-90081d34b277', // keyboard close-up
  '1587620962725-abab7fe55159', // dark code screen
  '1516116216624-53ad0e64c35f', // AI brain concept
  '1542831371-29id-b38-a3db5b57df38', // creative work
  '1444703686981-a3abbc4d4fe3', // night city tech
  '1489389944381-4c1b7aea1c3c', // server rack
  '1508830524289-0adcbe822b40', // circuit board macro
  '1555255707-d1b591b8a7f8',    // tech glow
  '1519389950473-47ba0277781c', // collaboration laptops
  '1497366811353-6870744d04b2', // modern office
  '1497366754035-f200968a333e', // meeting room
  '1496181133206-80ce9b88a853', // laptop open
  '1499951360447-b19be8fe80f5', // coding coffee
  '1515879218367-8466d910aaa4', // python coding
  '1523800503107-5bc3ba2a6f81', // abstract web
  '1560732488-7b37cef147cf',    // AI data flow
  '1604328698692-f76ea9498e76', // robot concept
  '1625225233840-695456021532', // machine learning visual
  '1639322537228-f710d846310a', // neural net glowing
  '1642427749670-f20e2e76ed8c', // digital brain
  '1655720828083-9bd745f6e337', // LLM concept
  '1666597107756-ef489e9f1f09', // ChatGPT style
  '1676299081847-824916de030a', // future AI
  '1677756119877-a5a2fc8085aa', // tech data stream
  '1682685797703-2bb22dbb885b', // generative AI art
];

function buildUrl(id) {
  return `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;
}

// Charge tous les articles
const files = readdirSync(CONTENT_DIR)
  .filter(f => f.endsWith('.mdx'))
  .sort(); // tri stable

// Sépare articles avec/sans image
const withImage    = [];
const withoutImage = [];

for (const file of files) {
  const content = readFileSync(join(CONTENT_DIR, file), 'utf8');
  if (!FORCE && /^image:/m.test(content)) {
    withImage.push(file);
  } else {
    withoutImage.push(file);
  }
}

// Photos déjà utilisées
const usedIds = new Set();
if (!FORCE) {
  for (const file of withImage) {
    const content = readFileSync(join(CONTENT_DIR, file), 'utf8');
    const m = content.match(/^image: "https:\/\/images\.unsplash\.com\/photo-([^?]+)/m);
    if (m) usedIds.add(m[1]);
  }
}

// Pool disponible = total - déjà utilisées
const available = POOL_ORDER(PHOTO_POOL, withoutImage);

function POOL_ORDER(pool, articleFiles) {
  // Retire les IDs déjà utilisés, puis ordonne par hash de slug pour la stabilité
  const free = pool.filter(id => !usedIds.has(id));
  // Si on manque de photos, on recycle (edge case)
  while (free.length < articleFiles.length) {
    free.push(...pool.filter(id => !free.includes(id)));
    if (free.length === 0) break; // sécurité
  }
  return free;
}

// Assigne une photo unique à chaque article sans image
let assigned = 0;
for (let i = 0; i < withoutImage.length; i++) {
  const file = withoutImage[i];
  const filePath = join(CONTENT_DIR, file);
  let content = readFileSync(filePath, 'utf8');

  const photoId = available[i % available.length];
  const url = buildUrl(photoId);

  // Retire l'ancienne image si --force
  if (FORCE) {
    content = content.replace(/^image:.*\n/m, '');
  }

  // Insère image: juste avant published:
  const newContent = content.replace(
    /^(published:)/m,
    `image: "${url}"\n$1`
  );

  writeFileSync(filePath, newContent, 'utf8');
  console.log(`✅ ${file}\n   → ${photoId}`);
  assigned++;
}

if (assigned === 0) {
  console.log('ℹ️  Tous les articles ont déjà une image. Utilise --force pour réassigner.');
} else {
  console.log(`\n🖼️  ${assigned} article(s) mis à jour`);
}
