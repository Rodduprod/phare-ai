#!/usr/bin/env node
/**
 * weekly-seo-report.mjs — Rapport SEO hebdomadaire (Search Console + GA4) → Telegram.
 *
 * Combine les deux sources de vérité trafic et pousse une synthèse sur Telegram.
 * Aucune dépendance externe : utilise fetch + node:crypto natifs (Node 18+).
 *
 * Variables d'environnement attendues :
 *   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN  → OAuth Search Console (read-only)
 *   GA4_SERVICE_ACCOUNT   → contenu JSON du service account GA4
 *   GA4_PROPERTY_ID       → défaut 529346366 (Le Labo IA)
 *   GSC_SITE              → défaut "sc-domain:lelabo.ai"
 *   TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID
 */
import crypto from "node:crypto";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  GA4_SERVICE_ACCOUNT,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
} = process.env;
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || "529346366";
const GSC_SITE = process.env.GSC_SITE || "sc-domain:lelabo.ai";

const b64url = (b) => Buffer.from(b).toString("base64url");
const ymd = (d) => d.toISOString().slice(0, 10);
const num = (v) => Number(v || 0);

// ── Auth ─────────────────────────────────────────────────────────────────────

async function gscToken() {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("GSC token: " + JSON.stringify(j));
  return j.access_token;
}

async function ga4Token() {
  const sa = JSON.parse(GA4_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const unsigned = `${header}.${claims}`;
  const sig = b64url(
    crypto.createSign("RSA-SHA256").update(unsigned).sign(sa.private_key)
  );
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${sig}`,
    }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("GA4 token: " + JSON.stringify(j));
  return j.access_token;
}

// ── Requêtes ───────────────────────────────────────────────────────────────

async function gsc(tok, body) {
  const r = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
      GSC_SITE
    )}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const j = await r.json();
  if (j.error) throw new Error("GSC query: " + JSON.stringify(j.error));
  return j;
}

async function ga4(tok, body) {
  const r = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const j = await r.json();
  if (j.error) throw new Error("GA4 report: " + JSON.stringify(j.error));
  return j;
}

async function sendTelegram(text) {
  const r = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    }
  );
  const j = await r.json();
  if (!j.ok) throw new Error("Telegram: " + JSON.stringify(j));
}

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const trend = (cur, prev) => {
  if (prev === 0) return cur > 0 ? "🆕" : "—";
  const d = Math.round(((cur - prev) / prev) * 100);
  return d > 0 ? `▲ +${d}%` : d < 0 ? `▼ ${d}%` : "= 0%";
};

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const end = new Date(Date.now() - 3 * 864e5); // GSC : délai ~3 jours
  const start = new Date(end.getTime() - 27 * 864e5);

  const [gscTok, ga4Tok] = await Promise.all([gscToken(), ga4Token()]);

  const [gTot, gQ, a7, aPrev, aCh, aPg] = await Promise.all([
    gsc(gscTok, { startDate: ymd(start), endDate: ymd(end) }),
    gsc(gscTok, { startDate: ymd(start), endDate: ymd(end), dimensions: ["query"], rowLimit: 8 }),
    ga4(ga4Tok, {
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }, { name: "engagementRate" }],
    }),
    ga4(ga4Tok, {
      dateRanges: [{ startDate: "14daysAgo", endDate: "8daysAgo" }],
      metrics: [{ name: "sessions" }],
    }),
    ga4(ga4Tok, {
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    ga4(ga4Tok, {
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 5,
    }),
  ]);

  const t = (gTot.rows && gTot.rows[0]) || {};
  const m7 = (a7.rows && a7.rows[0] && a7.rows[0].metricValues) || [];
  const sessions = num(m7[0] && m7[0].value);
  const users = num(m7[1] && m7[1].value);
  const pageviews = num(m7[2] && m7[2].value);
  const engagement = num(m7[3] && m7[3].value);
  const prevSessions = num(
    aPrev.rows && aPrev.rows[0] && aPrev.rows[0].metricValues[0].value
  );

  const channels = (aCh.rows || [])
    .map((r) => `${esc(r.dimensionValues[0].value)} ${r.metricValues[0].value}`)
    .join(" · ");
  const pages = (aPg.rows || [])
    .map((r) => `  ${r.metricValues[0].value} — ${esc(r.dimensionValues[0].value)}`)
    .join("\n");
  const queries = (gQ.rows || [])
    .map(
      (r) =>
        `  ${esc(r.keys[0])} — ${r.clicks}c / ${r.impressions}i / pos ${r.position.toFixed(1)}`
    )
    .join("\n");

  const msg =
    `📊 <b>Le Labo — rapport SEO hebdo</b>\n\n` +
    `<b>🟢 Trafic on-site (GA4, 7j)</b>\n` +
    `Sessions : <b>${sessions}</b> (${trend(sessions, prevSessions)} vs 7j préc.)\n` +
    `Utilisateurs : ${users} · Pages vues : ${pageviews} · Engagement : ${(engagement * 100).toFixed(0)}%\n` +
    `Canaux : ${channels || "—"}\n\n` +
    `<b>Top pages (7j)</b>\n${pages || "  —"}\n\n` +
    `<b>🔎 Recherche Google (GSC, 28j)</b>\n` +
    `Clics : <b>${num(t.clicks)}</b> · Impressions : ${num(t.impressions)} · ` +
    `CTR : ${(num(t.ctr) * 100).toFixed(1)}% · Pos. moy. : ${num(t.position).toFixed(1)}\n` +
    `Top requêtes :\n${queries || "  —"}\n\n` +
    `<i>lelabo.ai · ${ymd(start)} → ${ymd(end)}</i>`;

  await sendTelegram(msg);
  console.log("✅ Rapport envoyé sur Telegram.");
}

main().catch(async (e) => {
  console.error("❌ weekly-seo-report:", e.message);
  try {
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID)
      await sendTelegram(`⚠️ <b>Rapport SEO hebdo en échec</b>\n${esc(e.message)}`);
  } catch {}
  process.exit(1);
});
