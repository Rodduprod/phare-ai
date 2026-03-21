#!/usr/bin/env node
/**
 * Ajoute un champ image: dans le frontmatter des articles qui n'en ont pas.
 * Utilise la même logique que src/lib/covers.ts
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, '..', 'content', 'articles');

const COVER_BY_TOPIC = {
  'agents':         ['1485827404703-89b55fcc595e', '1677442135703-1787eea5ce01'],
  'outils':         ['1611532736597-de2d4265fba3', '1531297484001-80022131f5a1'],
  'productivité':   ['1611532736597-de2d4265fba3', '1593642632559-0c6d3fc62b89'],
  'code':           ['1555066931-4365d14ad3cd', '1461749280684-dccba630e2f6'],
  'développement':  ['1555066931-4365d14ad3cd', '1587620962725-abab7fe55159'],
  'automatisation': ['1485827404703-89b55fcc595e', '1593642632559-0c6d3fc62b89'],
  'entrepreneurs':  ['1507679799987-c73779587ccf', '1454165804606-c3d57bc86b40'],
  'business':       ['1507679799987-c73779587ccf', '1542744173-8e7e53415bb0'],
  'créateurs':      ['1611162617213-7d7a39e9b1d7', '1535016120720-40c647be5912'],
  'contenu':        ['1611162617213-7d7a39e9b1d7', '1535016120720-40c647be5912'],
  'google':         ['1573804633927-bfcbcd909acd', '1526374965328-7f61d4dc18c5'],
  'openai':         ['1620712943543-bcc4688e7485', '1677442135703-1787eea5ce01'],
  'anthropic':      ['1620712943543-bcc4688e7485', '1485827404703-89b55fcc595e'],
  'fondamentaux':   ['1677442135703-1787eea5ce01', '1526374965328-7f61d4dc18c5'],
  'modèles':        ['1620712943543-bcc4688e7485', '1677442135703-1787eea5ce01'],
  'comparatif':     ['1593642632559-0c6d3fc62b89', '1620712943543-bcc4688e7485'],
  'protocoles':     ['1526374965328-7f61d4dc18c5', '1485827404703-89b55fcc595e'],
  'revops':         ['1507679799987-c73779587ccf', '1454165804606-c3d57bc86b40'],
  'prompts':        ['1677442135703-1787eea5ce01', '1611532736597-de2d4265fba3'],
  'débutants':      ['1526374965328-7f61d4dc18c5', '1677442135703-1787eea5ce01'],
  'default':        [
    '1677442135703-1787eea5ce01', '1620712943543-bcc4688e7485',
    '1485827404703-89b55fcc595e', '1531297484001-80022131f5a1',
    '1555066931-4365d14ad3cd',    '1526374965328-7f61d4dc18c5',
  ],
};

function getCoverImage(tags, slug) {
  const matched = tags.find(t => COVER_BY_TOPIC[t.toLowerCase()]);
  const photos = (matched && COVER_BY_TOPIC[matched.toLowerCase()]) || COVER_BY_TOPIC['default'];
  const hash = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const id = photos[hash % photos.length];
  return `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;
}

function parseTags(tagsLine) {
  // Extrait les tags d'une ligne comme: tags: ["ia", "agents", "2026"]
  const matches = tagsLine.match(/"([^"]+)"/g);
  return matches ? matches.map(m => m.replace(/"/g, '')) : [];
}

const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
let updated = 0;

for (const file of files) {
  const filePath = join(CONTENT_DIR, file);
  const content = readFileSync(filePath, 'utf8');

  // Skip si image déjà présente
  if (/^image:/m.test(content)) {
    console.log(`⏭️  ${file} — image déjà présente`);
    continue;
  }

  // Extrait le frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    console.log(`⚠️  ${file} — frontmatter non trouvé`);
    continue;
  }

  const fm = fmMatch[1];
  const tagsLine = fm.split('\n').find(l => l.startsWith('tags:')) ?? '';
  const tags = parseTags(tagsLine);
  const slug = file.replace('.mdx', '');

  const coverUrl = getCoverImage(tags, slug);

  // Insère image: juste avant published:
  const newContent = content.replace(
    /^(published:)/m,
    `image: "${coverUrl}"\n$1`
  );

  writeFileSync(filePath, newContent, 'utf8');
  console.log(`✅ ${file} → ${coverUrl}`);
  updated++;
}

console.log(`\n🖼️  ${updated} articles mis à jour sur ${files.length}`);
