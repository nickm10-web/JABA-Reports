#!/usr/bin/env node
// Builds src/data/tierMedians.json — follower-tier engagement-rate medians
// computed from every athlete in JABA's roster corpus.
//
// Output feeds the Genesco report's "Who Overperforms Their Tier" comparison
// so the benchmark is the full JABA universe (~20K athletes), not the
// 3-athlete Genesco roster.

import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const ROSTER_DIR = '/Users/jaba/JABA/public/data';
const OUT_FILE = path.join(REPO_ROOT, 'src/data/tierMedians.json');

const tierFor = (f) => {
  if (f >= 10_000_000) return 'Mega';
  if (f >= 1_000_000)  return 'Large';
  if (f >= 100_000)    return 'Mid';
  if (f >= 10_000)     return 'Emerging';
  if (f > 0)           return 'Micro';
  return null;
};

const median = (arr) => {
  const s = arr.filter((x) => Number.isFinite(x) && x > 0).sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

// Walk every file in the roster dir and try to extract {followers, er} rows.
function extractAthletes() {
  const rows = [];
  const seen = new Set(); // dedup by _id
  const files = fs.readdirSync(ROSTER_DIR).filter((f) => /roster/i.test(f) && f.endsWith('.json'));

  for (const file of files) {
    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(path.join(ROSTER_DIR, file), 'utf8'));
    } catch {
      continue;
    }
    // Rosters may be arrays or { athletes: [...] }.
    const arr = Array.isArray(raw) ? raw : raw.athletes ?? raw.data ?? [];
    if (!Array.isArray(arr)) continue;

    for (const a of arr) {
      const id = typeof a._id === 'string' ? a._id : a._id?.$oid ?? `${file}|${a.firstName}|${a.lastName}`;
      if (seen.has(id)) continue;

      const m = a.metrics?.sevenDays ?? a.metrics?.thirtyDays ?? a.metrics ?? {};
      const followers = Number(m.followers ?? 0);
      const er        = Number(m.engagementRate ?? 0);
      if (!followers || !er) continue;
      seen.add(id);
      rows.push({ followers, er });
    }
  }
  return rows;
}

const rows = extractAthletes();
console.log(`→ Scanned ${rows.length} unique athletes with follower + ER data`);

const TIERS = ['Mega', 'Large', 'Mid', 'Emerging', 'Micro'];
const groups = Object.fromEntries(TIERS.map((t) => [t, []]));
for (const r of rows) {
  const tier = tierFor(r.followers);
  if (tier) groups[tier].push(r);
}

const out = {
  generatedAt: new Date().toISOString(),
  source: `JABA roster corpus (${ROSTER_DIR})`,
  totalAthletes: rows.length,
  tiers: Object.fromEntries(TIERS.map((t) => {
    const g = groups[t];
    return [t, {
      athleteCount: g.length,
      medianER    : median(g.map((x) => x.er)),
      p25ER       : (() => {
        const s = g.map((x) => x.er).filter((x) => x > 0).sort((a, b) => a - b);
        return s.length ? s[Math.floor(s.length * 0.25)] : 0;
      })(),
      p75ER       : (() => {
        const s = g.map((x) => x.er).filter((x) => x > 0).sort((a, b) => a - b);
        return s.length ? s[Math.floor(s.length * 0.75)] : 0;
      })(),
    }];
  })),
};

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
console.log(`✓ Wrote ${OUT_FILE}`);
for (const t of TIERS) {
  const b = out.tiers[t];
  console.log(`  ${t.padEnd(10)} n=${String(b.athleteCount).padEnd(6)} medianER=${(b.medianER * 100).toFixed(2)}%  p25=${(b.p25ER * 100).toFixed(2)}%  p75=${(b.p75ER * 100).toFixed(2)}%`);
}
