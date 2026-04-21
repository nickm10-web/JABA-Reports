#!/usr/bin/env node
// Builds src/data/genescoBrandPeers.json
//
// For each Genesco brokered brand, collects peer sponsored-post data points
// from (1) JABA's curated sponsored-posts corpus, then (2) falls back to the
// Scrape Creators API for brands with thin coverage by pulling the brand's
// own IG feed and extracting co-author / tagged athlete collabs.

import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT     = path.resolve(new URL('..', import.meta.url).pathname);
const JABA_ROOT     = '/Users/jaba/JABA';
const SPONSORED_SRC = path.join(JABA_ROOT, 'public/data/social-media/processed/sponsored-posts.json');
const OUT_FILE      = path.join(REPO_ROOT, 'src/data/genescoBrandPeers.json');
const ENV_FILE      = path.join(REPO_ROOT, '.env.local');

// Load API key from .env.local (simple parser — one KEY=VAL per line)
function loadEnvLocal() {
  try {
    const txt = fs.readFileSync(ENV_FILE, 'utf8');
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) process.env[m[1]] = process.env[m[1]] ?? m[2];
    }
  } catch {}
}
loadEnvLocal();
const SC_KEY = process.env.SCRAPE_CREATORS_API_KEY;

// Campaign athletes to exclude from the peer set (they're the report subjects).
const CAMPAIGN_ATHLETES = new Set([
  "Lionel Messi",
  "Travis Kelce",
  "Ja'Marr Chase",
  "Josh Jobe",
  "Brian Robinson Jr.",
]);

// Mirror of the component's detectBrand() matching logic.
const BRANDS = {
  '@loweshomeimprovement': {
    display: "Lowe's",
    domain : 'lowes.com',
    match  : ({ sp, cap }) =>
      sp === '@loweshomeimprovement' ||
      cap.includes('@loweshomeimprovement') ||
      cap.includes('lowespartner') ||
      cap.includes('mylowe'),
    scrapeHandle: 'loweshomeimprovement', // fallback scrape target
  },
  '@pepsi': {
    display: 'Pepsi',
    domain : 'pepsi.com',
    match  : ({ sp, cap }) =>
      sp === '@pepsi' ||
      cap.includes('@pepsi') ||
      cap.includes('#pepsipartner'),
    scrapeHandle: 'pepsi',
  },
  '@budlight': {
    display: 'Bud Light',
    domain : 'budlight.com',
    match  : ({ sp, cap }) =>
      sp === '@budlight' ||
      cap.includes('@budlight') ||
      cap.includes('bud light') ||
      cap.includes('teu') ||
      cap.includes('tight end university'),
    scrapeHandle: 'budlight',
  },
  '@7eleven': {
    display: '7-Eleven',
    domain : '7-eleven.com',
    match  : ({ sp, cap }) =>
      sp === '@7eleven' ||
      cap.includes('@7eleven') ||
      cap.includes('#7elevenpartner') ||
      cap.includes('7-eleven'),
    scrapeHandle: '7eleven',
  },
};

function scorePost(p) {
  // ER: prefer stored metric, else compute
  const m       = p.metrics || {};
  const likes   = Number(m.likes || 0);
  const cmts    = Number(m.comments || 0);
  const views   = Number(m.videoViews || 0);
  let er        = Number(m.engagementRate || 0);
  const follows = Number(m.followers || 0);
  if (!er && follows > 0) er = (likes + cmts) / follows;
  return { likes, comments: cmts, views, er, emv: Number(m.emv || 0), followers: follows };
}

function shortDate(d) {
  try { return new Date(d).toISOString().slice(0, 10); } catch { return ''; }
}

function captionPreview(c, n = 180) {
  return (c || '').replace(/\s+/g, ' ').trim().slice(0, n);
}

function trimmedAthlete(a) {
  return a ? {
    id   : a._id || null,
    name : a.name || '',
    image: a.image || '',
    sport: a.sport || '',
    school: a.school?.name || '',
  } : null;
}

// ─── 1. Scan JABA sponsored-posts corpus ───────────────────────────────────────
function scanJaba() {
  const raw = JSON.parse(fs.readFileSync(SPONSORED_SRC, 'utf8'));
  const out = {}; // handle → post[]
  for (const handle of Object.keys(BRANDS)) out[handle] = [];

  const seen = new Set(); // _id dedup

  for (const p of raw) {
    const athleteName = p.athlete?.name || '';
    if (CAMPAIGN_ATHLETES.has(athleteName)) continue;

    const sp  = (p.sponsorPartner || '').toLowerCase().trim();
    const cap = (p.caption        || '').toLowerCase();

    for (const [handle, spec] of Object.entries(BRANDS)) {
      if (!spec.match({ sp, cap })) continue;
      const key = `${handle}|${p._id || p.permalink || ''}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const s = scorePost(p);
      // Skip posts with no engagement data — they pollute the distribution.
      if (s.likes === 0 && s.comments === 0 && s.views === 0 && s.er === 0) continue;
      out[handle].push({
        id        : p._id || null,
        athlete   : trimmedAthlete(p.athlete),
        brand     : handle,
        date      : shortDate(p.publishedAt?.$date || p.createdAt?.$date),
        permalink : p.permalink || p.url || '',
        mediaType : p.mediaType || '',
        caption   : captionPreview(p.caption),
        metrics   : s,
        source    : 'jaba-curated',
      });
    }
  }
  return out;
}

// ─── 2. Scrape Creators fallback for thin brands ───────────────────────────────
async function scrapeBrandFeed(handle, maxPages = 2) {
  if (!SC_KEY) return [];
  const items = [];
  let cursor = null;
  for (let page = 0; page < maxPages; page++) {
    const url = new URL('https://api.scrapecreators.com/v2/instagram/user/posts');
    url.searchParams.set('handle', handle);
    if (cursor) url.searchParams.set('next_max_id', cursor);
    const res = await fetch(url, { headers: { 'x-api-key': SC_KEY } });
    if (!res.ok) break;
    const j = await res.json();
    for (const it of (j.items || [])) items.push(it);
    if (!j.more_available || !j.next_max_id) break;
    cursor = j.next_max_id;
  }
  return items;
}

function scAthletePosts(items, brandHandle) {
  // A scraped brand post is kept only when a co-author or usertag is NOT the
  // brand itself — otherwise it's the brand's own content.
  const out = [];
  for (const it of items) {
    const coauth = [
      ...(it.coauthor_producers || []),
      ...(it.invited_coauthor_producers || []),
    ].map(c => c.username).filter(u => u && u !== brandHandle.replace(/^@/, ''));
    const tagged = (it.usertags?.in || [])
      .map(u => u.user?.username)
      .filter(u => u && u !== brandHandle.replace(/^@/, ''));
    const peer = coauth[0] || tagged[0];
    if (!peer) continue;

    const likes = Number(it.like_count || 0);
    const cmts  = Number(it.comment_count || 0);
    const views = Number(it.play_count || it.view_count || 0);

    out.push({
      id        : it.pk || null,
      athlete   : { id: null, name: peer, image: '', sport: '', school: '' },
      brand     : brandHandle,
      date      : shortDate((it.taken_at || 0) * 1000),
      permalink : it.code ? `https://www.instagram.com/p/${it.code}` : '',
      mediaType : it.media_type === 2 ? 'VIDEO' : 'IMAGE',
      caption   : captionPreview(it.caption?.text),
      metrics   : { likes, comments: cmts, views, er: 0, emv: 0, followers: 0 },
      source    : 'scrape-creators',
    });
  }
  return out;
}

function summarise(posts) {
  if (posts.length === 0) {
    return { postCount: 0, athleteCount: 0, medianER: 0, medianLikes: 0, medianViews: 0 };
  }
  const ers    = posts.map(p => p.metrics.er).filter(x => x > 0).sort((a,b) => a-b);
  const likes  = posts.map(p => p.metrics.likes).filter(x => x > 0).sort((a,b) => a-b);
  const views  = posts.map(p => p.metrics.views).filter(x => x > 0).sort((a,b) => a-b);
  const mid    = (arr) => arr.length === 0 ? 0 : arr[Math.floor(arr.length / 2)];
  const unique = new Set(posts.map(p => p.athlete?.name).filter(Boolean));
  return {
    postCount    : posts.length,
    athleteCount : unique.size,
    medianER     : mid(ers),
    medianLikes  : mid(likes),
    medianViews  : mid(views),
  };
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('→ Scanning JABA sponsored-posts corpus:', SPONSORED_SRC);
  const jaba = scanJaba();

  const THIN_THRESHOLD = 10; // posts below this → fallback scrape
  for (const [handle, spec] of Object.entries(BRANDS)) {
    console.log(`  ${handle}: ${jaba[handle].length} posts from JABA`);
    if (jaba[handle].length < THIN_THRESHOLD && spec.scrapeHandle && SC_KEY) {
      console.log(`  ↳ thin — scraping ${spec.scrapeHandle}...`);
      try {
        const raw  = await scrapeBrandFeed(spec.scrapeHandle, 3);
        const peer = scAthletePosts(raw, handle);
        console.log(`    got ${peer.length} peer posts from Scrape Creators`);
        jaba[handle].push(...peer);
      } catch (e) {
        console.warn(`    scrape failed: ${e.message}`);
      }
    }
  }

  // Sort posts per brand by engagement (ER desc, likes desc).
  for (const handle of Object.keys(BRANDS)) {
    jaba[handle].sort((a, b) =>
      (b.metrics.er - a.metrics.er) || (b.metrics.likes - a.metrics.likes));
  }

  const payload = {
    generatedAt : new Date().toISOString(),
    source      : { jabaCurated: SPONSORED_SRC, scrapeCreators: 'api.scrapecreators.com' },
    brands      : {},
  };
  for (const [handle, spec] of Object.entries(BRANDS)) {
    const posts = jaba[handle];
    payload.brands[handle] = {
      display : spec.display,
      domain  : spec.domain,
      summary : summarise(posts),
      posts,
    };
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));
  console.log(`\n✓ Wrote ${OUT_FILE}`);
  for (const [h, b] of Object.entries(payload.brands)) {
    console.log(`  ${h.padEnd(24)} posts=${b.summary.postCount}  athletes=${b.summary.athleteCount}  medianER=${b.summary.medianER.toFixed(4)}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
