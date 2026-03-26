#!/usr/bin/env node
/**
 * validate-articles.js
 * Validation du frontmatter des articles MDX — aucune dépendance externe.
 * Usage : node scripts/validate-articles.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');

// ─── Valeurs valides ─────────────────────────────────────────────────────────

const VALID_LEVELS = ['débutant', 'amateur', 'confirmé'];
const REQUIRED_FIELDS = ['title', 'description', 'date', 'tags', 'level', 'published'];
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
// Slug: kebab-case pur OU pattern topic--level (double tiret)
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*(--[a-z0-9]+(-[a-z0-9]+)*)?$/;
// Valeurs valides pour le champ topic (slug kebab-case simple)
const TOPIC_SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ─── Parser frontmatter YAML simple (sans dépendance) ────────────────────────

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const yamlBlock = match[1];
  const content = match[2];
  const data = {};

  for (const line of yamlBlock.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Boolean
    if (value === 'true') { data[key] = true; continue; }
    if (value === 'false') { data[key] = false; continue; }

    // String quoted
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      data[key] = value.slice(1, -1);
      continue;
    }

    // Array inline ["a", "b"]
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      continue;
    }

    data[key] = value || undefined;
  }

  return { data, content };
}

// ─── Moteur de test léger ─────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function test(label, fn) {
  try {
    fn();
    passed++;
    process.stdout.write(`  ✅ ${label}\n`);
  } catch (err) {
    failed++;
    failures.push({ label, error: err.message });
    process.stdout.write(`  ❌ ${label}\n     → ${err.message}\n`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateArticle(filename) {
  const filepath = path.join(ARTICLES_DIR, filename);
  const raw = fs.readFileSync(filepath, 'utf-8');
  const { data, content } = parseFrontmatter(raw);
  const slug = filename.replace('.mdx', '');

  console.log(`\n📄 ${filename}`);

  test('contient tous les champs obligatoires', () => {
    for (const field of REQUIRED_FIELDS) {
      assert(data[field] !== undefined, `Champ manquant: "${field}"`);
    }
  });

  test('title est une string non vide', () => {
    assert(typeof data.title === 'string', `title doit être une string (reçu: ${typeof data.title})`);
    assert(data.title.trim().length > 0, 'title ne peut pas être vide');
  });

  test('description est une string non vide', () => {
    assert(typeof data.description === 'string', `description doit être une string`);
    assert(data.description.trim().length > 0, 'description ne peut pas être vide');
  });

  test('date au format YYYY-MM-DD', () => {
    const dateStr = String(data.date || '').slice(0, 10);
    assert(
      DATE_REGEX.test(dateStr),
      `Date invalide: "${data.date}" — format attendu: YYYY-MM-DD`
    );
  });

  test(`level est valide (${VALID_LEVELS.join(' | ')})`, () => {
    assert(
      VALID_LEVELS.includes(data.level),
      `Level invalide: "${data.level}" — valeurs acceptées: ${VALID_LEVELS.join(', ')}`
    );
  });

  test('tags est un tableau non vide', () => {
    assert(Array.isArray(data.tags), `tags doit être un tableau (reçu: ${typeof data.tags})`);
    assert(data.tags.length > 0, 'tags ne peut pas être vide');
  });

  test('published est un booléen', () => {
    assert(
      typeof data.published === 'boolean',
      `published doit être true ou false (reçu: ${typeof data.published} "${data.published}")`
    );
  });

  test('slug (nom de fichier) en kebab-case ASCII (ou topic--level)', () => {
    assert(
      SLUG_REGEX.test(slug),
      `Slug invalide: "${slug}" — format attendu: kebab-case ou topic--level`
    );
  });

  test('image (si présente) est une URL valide', () => {
    if (data.image !== undefined) {
      assert(typeof data.image === 'string', `image doit être une string`);
      assert(
        data.image.startsWith('http') || data.image.startsWith('/'),
        `image invalide: "${data.image}" — doit être une URL http(s) ou un chemin /...`
      );
    }
  });

  test('topic (si présent) est un slug kebab-case valide', () => {
    if (data.topic !== undefined) {
      assert(typeof data.topic === 'string', `topic doit être une string`);
      assert(
        TOPIC_SLUG_REGEX.test(data.topic),
        `topic invalide: "${data.topic}" — utiliser uniquement lettres minuscules, chiffres et tirets`
      );
    }
  });

  test('contenu markdown non vide (> 100 caractères)', () => {
    assert(content.trim().length > 100, `Contenu trop court (${content.trim().length} chars)`);
  });

  test('pas de patterns MDX dangereux (crash build)', () => {
    // Retire les blocs code avant analyse
    const bodyNoCode = content.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]+`/g, '');
    const dangerousPatterns = [
      { re: /<\d/,        label: '<digit (ex: <2%) — utiliser &lt;' },
      { re: /< \d/,       label: '< espace+chiffre (ex: < 500ms) — utiliser &lt;' },
      { re: /> \d/,       label: '> espace+chiffre (ex: > 90%) — utiliser &gt;' },
      { re: />\d/,        label: '>digit (ex: >90%) — utiliser &gt;' },
      { re: /<[A-Z][a-zA-Z0-9]*[\s/>]/, label: '<UppercaseTag (composant JSX halluciné)' },
    ];
    const found = dangerousPatterns.filter(p => p.re.test(bodyNoCode));
    assert(found.length === 0, `Patterns MDX dangereux détectés:\n       ${found.map(p => p.label).join('\n       ')}`);
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('🔍 Validation des articles MDX\n');
console.log(`📁 Dossier: ${ARTICLES_DIR}`);

if (!fs.existsSync(ARTICLES_DIR)) {
  console.error(`\n❌ Dossier introuvable: ${ARTICLES_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.mdx'));

if (files.length === 0) {
  console.error('\n❌ Aucun article trouvé dans content/articles/');
  process.exit(1);
}

console.log(`\n📊 ${files.length} article(s) à valider`);

for (const file of files) {
  validateArticle(file);
}

// ─── Rapport final ────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(50));
console.log(`\n📊 Résultats : ${passed} ✅  ${failed} ❌  (${files.length} articles)\n`);

if (failed > 0) {
  console.log('🚨 Erreurs à corriger :\n');
  failures.forEach(({ label, error }) => {
    console.log(`  ❌ ${label}`);
    console.log(`     ${error}\n`);
  });
  process.exit(1); // Code de sortie non-zéro → fait échouer la CI
} else {
  console.log('✅ Tous les articles sont valides !\n');
  process.exit(0);
}
