#!/usr/bin/env node
/**
 * post-to-x.js — Publie les nouveaux articles sur X (@le_labo_ai)
 * Appelé par le workflow ai-content-generator.yml après génération
 * Usage: node scripts/post-to-x.js [articles-json]
 */

const crypto = require('crypto');
const https  = require('https');

const API_KEY            = process.env.X_API_KEY;
const API_SECRET         = process.env.X_API_SECRET;
const ACCESS_TOKEN       = process.env.X_ACCESS_TOKEN;
const ACCESS_TOKEN_SECRET = process.env.X_ACCESS_TOKEN_SECRET;

if (!API_KEY || !API_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
  console.error('❌ Clés X manquantes dans les variables d\'environnement');
  process.exit(1);
}

// ── OAuth 1.0a ──────────────────────────────────────────────────────────────

function percentEncode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function buildOAuthHeader(method, url, params = {}) {
  const nonce     = crypto.randomBytes(16).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams = {
    oauth_consumer_key:     API_KEY,
    oauth_nonce:            nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp:        timestamp,
    oauth_token:            ACCESS_TOKEN,
    oauth_version:          '1.0',
  };

  const allParams = { ...params, ...oauthParams };
  const sortedKeys = Object.keys(allParams).sort();
  const paramStr = sortedKeys
    .map(k => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join('&');

  const baseStr = [method.toUpperCase(), percentEncode(url), percentEncode(paramStr)].join('&');
  const sigKey  = `${percentEncode(API_SECRET)}&${percentEncode(ACCESS_TOKEN_SECRET)}`;
  const sig     = crypto.createHmac('sha1', sigKey).update(baseStr).digest('base64');

  oauthParams.oauth_signature = sig;

  const headerParts = Object.keys(oauthParams)
    .map(k => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(', ');

  return `OAuth ${headerParts}`;
}

function postTweet(text) {
  return new Promise((resolve, reject) => {
    const url  = 'https://api.twitter.com/2/tweets';
    const body = JSON.stringify({ text });
    const auth = buildOAuthHeader('POST', url);

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization':  auth,
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(json);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(json)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Formatage des tweets ─────────────────────────────────────────────────────

const LEVEL_EMOJI = { 'débutant': '🌱', 'amateur': '🚀', 'confirmé': '⚡' };
const LEVEL_LABEL = { 'débutant': 'Débutant', 'amateur': 'Amateur', 'confirmé': 'Confirmé' };

const HASHTAGS_BY_TAG = {
  'chatgpt': '#ChatGPT',
  'llm': '#LLM',
  'mistral': '#MistralAI',
  'google': '#Google',
  'deepseek': '#DeepSeek',
  'openai': '#OpenAI',
  'claude': '#Claude',
  'agents': '#AgentsIA',
  'formation': '#Formation',
};

function pickHashtags(tags = []) {
  const matched = tags
    .map(t => HASHTAGS_BY_TAG[t.toLowerCase()])
    .filter(Boolean)
    .slice(0, 2);
  const defaults = ['#IntelligenceArtificielle', '#IA'];
  const all = [...new Set([...matched, ...defaults])].slice(0, 3);
  return all.join(' ');
}

function buildTweet(article) {
  const emoji  = LEVEL_EMOJI[article.level] || '🧪';
  const level  = LEVEL_LABEL[article.level] || article.level;
  const tags   = pickHashtags(article.tags || []);
  const url    = `https://lelabo.ai/articles/${article.slug}`;

  // Tronquer le titre si nécessaire (max ~200 chars pour laisser de la place)
  let title = article.title;
  const maxTitleLen = 200 - url.length - tags.length - 30;
  if (title.length > maxTitleLen) {
    title = title.slice(0, maxTitleLen - 1) + '…';
  }

  return `${emoji} ${title}\n\nNiveau ${level} | lelabo.ai\n\n${url}\n\n${tags}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Les articles sont passés via stdin JSON ou via argument
  let articles = [];

  if (process.argv[2]) {
    try {
      articles = JSON.parse(process.argv[2]);
    } catch {
      console.error('❌ Format JSON invalide en argument');
      process.exit(1);
    }
  } else if (!process.stdin.isTTY) {
    const input = await new Promise(r => {
      let d = ''; process.stdin.on('data', c => d += c); process.stdin.on('end', () => r(d));
    });
    try { articles = JSON.parse(input); } catch { /* ignore */ }
  }

  if (!articles.length) {
    console.log('Aucun article à publier.');
    process.exit(0);
  }

  // Poster uniquement la version "amateur" (ou débutant) de chaque topic (1 tweet/topic)
  const topicsPosted = new Set();
  const toPost = articles.filter(a => {
    const topic = a.slug.replace(/--?(debutant|amateur|confirme)$/, '');
    if (topicsPosted.has(topic)) return false;
    // Préférer amateur, puis débutant
    if (a.level === 'amateur' || a.level === 'débutant') {
      topicsPosted.add(topic);
      return true;
    }
    return false;
  });

  // Si on n'a que des "confirmé", les prendre quand même
  if (!toPost.length) {
    articles.forEach(a => {
      const topic = a.slug.replace(/--?(debutant|amateur|confirme)$/, '');
      if (!topicsPosted.has(topic)) { toPost.push(a); topicsPosted.add(topic); }
    });
  }

  let posted = 0;
  for (const article of toPost) {
    const tweet = buildTweet(article);
    console.log(`\n📤 Posting: ${article.title.slice(0, 60)}...`);
    console.log('   Tweet preview:', tweet.slice(0, 100) + '...');
    try {
      const result = await postTweet(tweet);
      console.log(`   ✅ Publié — ID: ${result.data?.id}`);
      posted++;
      // Délai entre les tweets pour éviter le rate limit
      if (toPost.indexOf(article) < toPost.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (err) {
      console.error(`   ❌ Erreur: ${err.message}`);
    }
  }

  console.log(`\n✅ ${posted}/${toPost.length} tweets publiés`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
