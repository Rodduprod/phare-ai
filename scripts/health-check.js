#!/usr/bin/env node

/**
 * 🏥 Le Labo AI - Health Check
 *
 * Vérifie l'état du site lelabo.ai :
 * - Pages clés accessibles (HTTP 200)
 * - Sitemap, RSS, OG image
 * - Dernier deploy Vercel
 * - Articles générés aujourd'hui
 * - Pas de page 500 ou redirect loop
 *
 * Usage : node scripts/health-check.js
 * Exit 0 = tout OK, Exit 1 = anomalie détectée
 */

const SITE_URL = 'https://lelabo.ai';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const TIMEOUT_MS = 10000;

const results = [];
let hasError = false;

function ok(label, detail = '') {
  results.push({ status: '✅', label, detail });
}
function warn(label, detail = '') {
  results.push({ status: '⚠️', label, detail });
}
function fail(label, detail = '') {
  results.push({ status: '❌', label, detail });
  hasError = true;
}

async function fetchCheck(url, { expectedStatus = 200, label, mustContain } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'lelabo-healthcheck/1.0' },
      redirect: 'follow',
    });
    clearTimeout(timer);

    if (res.status !== expectedStatus) {
      fail(label || url, `HTTP ${res.status} (attendu ${expectedStatus})`);
      return null;
    }

    const text = await res.text();

    if (mustContain && !text.includes(mustContain)) {
      fail(label || url, `Contenu manquant : "${mustContain}"`);
      return null;
    }

    ok(label || url, `HTTP ${res.status}`);
    return { status: res.status, text };
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      fail(label || url, `Timeout > ${TIMEOUT_MS}ms`);
    } else {
      fail(label || url, e.message);
    }
    return null;
  }
}

async function checkVercelDeploy() {
  if (!VERCEL_TOKEN) {
    warn('Vercel deploy', 'VERCEL_TOKEN non défini — check ignoré');
    return;
  }
  try {
    const res = await fetch(
      'https://api.vercel.com/v6/deployments?limit=1&projectId=phare-ai',
      { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
    );
    const data = await res.json();
    const deploy = data.deployments?.[0];
    if (!deploy) { fail('Vercel deploy', 'Aucun déploiement trouvé'); return; }

    const age = Math.round((Date.now() - deploy.createdAt) / 3600000);
    if (deploy.state === 'READY') {
      ok('Vercel deploy', `READY — il y a ${age}h`);
    } else if (deploy.state === 'ERROR') {
      fail('Vercel deploy', `ERROR — ${deploy.errorMessage || 'voir dashboard'}`);
    } else {
      warn('Vercel deploy', `État: ${deploy.state}`);
    }
  } catch (e) {
    warn('Vercel deploy', `Impossible de vérifier : ${e.message}`);
  }
}

async function checkTodaysArticles() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const res = await fetch(`${SITE_URL}/sitemap.xml`, {
      headers: { 'User-Agent': 'lelabo-healthcheck/1.0' }
    });
    const xml = await res.text();
    const todayUrls = (xml.match(/https:\/\/lelabo\.ai\/articles\/[^<]+/g) || [])
      .filter(u => xml.includes(`<lastmod>${today}`) || xml.includes(`>${today}<`));

    if (todayUrls.length >= 3) {
      ok("Articles du jour", `${todayUrls.length} articles publiés aujourd'hui (${today})`);
    } else if (todayUrls.length > 0) {
      warn("Articles du jour", `Seulement ${todayUrls.length} articles aujourd'hui — génération incomplète ?`);
    } else {
      // Vérifier si c'est un problème ou si le générateur n'a pas encore tourné
      const hour = new Date().getUTCHours();
      if (hour >= 8) {
        warn("Articles du jour", `Aucun article publié aujourd'hui (${today}) — générateur à 7h ?`);
      } else {
        ok("Articles du jour", `Génération prévue à 7h UTC (heure actuelle: ${hour}h)`);
      }
    }
  } catch (e) {
    warn("Articles du jour", `Impossible de vérifier le sitemap : ${e.message}`);
  }
}

async function run() {
  console.log(`🏥 Health Check lelabo.ai — ${new Date().toISOString()}\n`);

  // 1. Deploy Vercel
  await checkVercelDeploy();

  // 2. Pages clés
  await fetchCheck(`${SITE_URL}`, { label: 'Homepage', mustContain: 'Le Labo AI' });
  await fetchCheck(`${SITE_URL}/articles`, { label: '/articles' });

  // 3. Fichiers techniques
  await fetchCheck(`${SITE_URL}/sitemap.xml`, { label: 'sitemap.xml', mustContain: '<urlset' });
  await fetchCheck(`${SITE_URL}/news-sitemap.xml`, { label: 'news-sitemap.xml', mustContain: '<urlset' });
  await fetchCheck(`${SITE_URL}/rss.xml`, { label: 'rss.xml', mustContain: '<rss' });
  await fetchCheck(`${SITE_URL}/robots.txt`, { label: 'robots.txt', mustContain: 'Sitemap' });

  // 4. OG image dynamique
  await fetchCheck(
    `${SITE_URL}/api/og?title=Test&level=d%C3%A9butant`,
    { label: 'OG image API' }
  );

  // 5. Articles du jour
  await checkTodaysArticles();

  // 6. Page 404 (vérifier qu'elle ne retourne pas 200)
  const notFound = await fetch(`${SITE_URL}/page-qui-nexiste-vraiment-pas-du-tout`, {
    headers: { 'User-Agent': 'lelabo-healthcheck/1.0' }
  }).catch(() => null);
  if (notFound?.status === 404) {
    ok('Page 404', 'Retourne bien HTTP 404');
  } else if (notFound?.status === 200) {
    warn('Page 404', 'Retourne HTTP 200 au lieu de 404 — vérifier next.js notFound()');
  }

  // --- Rapport final ---
  console.log('\n📊 Résultats :\n');
  for (const r of results) {
    console.log(`  ${r.status} ${r.label}${r.detail ? ` — ${r.detail}` : ''}`);
  }

  const errors = results.filter(r => r.status === '❌');
  const warnings = results.filter(r => r.status === '⚠️');

  console.log(`\n${hasError ? '🚨' : warnings.length ? '⚠️' : '🎉'} Bilan : ${errors.length} erreur(s), ${warnings.length} avertissement(s)`);

  if (hasError) {
    process.exit(1);
  }
}

run().catch(e => {
  console.error('❌ Health check crash:', e);
  process.exit(1);
});
