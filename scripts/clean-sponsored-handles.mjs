#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'public', 'data');
const DEFAULT_SCHOOLS = ['iowa', 'minnesota', 'washington-state', 'mississippi-state'];
const DECISIONS_PATH = path.join(DATA_DIR, 'sponsor-handle-decisions.json');

const SCHOOL_FILES = {
  iowa: 'iowa-content-posts.json',
  minnesota: 'minnesota-content-posts.json',
  'washington-state': 'washington-state-content-posts.json',
  'mississippi-state': 'mississippi-state-content-posts.json',
};

const KNOWN_BRANDS = new Set([
  'ford', 'adidas', 'lululemon', 'statefarm', 'allstate', 'c4energy', 'underarmour',
  'dickssportinggoods', 'papajohns', 'facebook', 'gatorade', 'garmin', 'uscellular',
  'ticketmaster', 'arbys', 'cvspharmacy', 'meta', 'fabletics', 'goodmolecules',
  'olipop', 'drinkolipop', 'mysticlakecasino', 'huntington', 'academy', 'stjude',
  'mcdonaldsinlandnw', 'pumahoops', 'powerade_us', 'homage', 'kindredfootball',
]);

const BUSINESS_HINTS = [
  'coffee', 'cafe', 'bar', 'grill', 'restaurant', 'market', 'shop', 'store', 'outfitters',
  'training', 'performance', 'sports', 'sport', 'gear', 'realtor', 'realty', 'bank', 'auto',
  'energy', 'wellness', 'pharmacy', 'casino', 'cards', 'steakhouse', 'apparel', 'official',
  'cellular', 'boats', 'skincare', 'collectibles', 'orchard', 'cadillac', 'gmc', 'buick',
];

const EXCLUDE_EXACT = new Set([
  'myplayersports',
  'myplayerathlete',
  'athletesthread',
  'nil.store___',
]);

const RECRUITING_MEDIA_PATTERNS = [
  /on3/, /247sports/, /rivals/, /portal/, /podcast/, /cbssports/, /espn/, /bleacherreport/,
  /upnext/, /network/, /thebaseballhype_/, /courtside/, /recruit/,
];

const NIL_PLATFORM_PATTERNS = [
  /\.threads$/,
  /^threads\./,
  /threads$/,
  /\.nil\.store$/,
  /^nil\./,
  /influxer/,
  /nilelite/,
  /collective/,
  /myplayer/,
  /athletesthread/,
];

const TEAM_PAGE_PATTERNS = {
  iowa: [
    /iowafootball/, /iowawbb/, /iowagymnastics/, /hawkeye/,
  ],
  minnesota: [
    /gopherfootball/, /gophersports/, /uofmn/,
  ],
  'washington-state': [
    /washingtonstate/, /coug/, /wsu/,
  ],
  'mississippi-state': [
    /mississippistate/, /missstate/, /hailstate/,
  ],
};

const GENERIC_TEAM_HANDLE_PATTERNS = [
  /football$/,
  /wbb$/,
  /mbb$/,
  /vb$/,
  /soccer$/,
  /baseball$/,
  /softball$/,
  /gymnastics$/,
  /track$/,
  /volleyball$/,
];

const COLLECTIVE_LIKE_PATTERNS = [
  /collective/,
  /athletes$/,
  /^thecollective/,
  /nilhub/,
];

const SCHOOL_NAME_HINTS = {
  iowa: ['iowa', 'hawkeye'],
  minnesota: ['minnesota', 'gopher', 'uofmn'],
  'washington-state': ['washingtonstate', 'coug', 'wsu'],
  'mississippi-state': ['mississippistate', 'missstate', 'hailstate', 'mstate'],
};

function parseArgs(argv) {
  const opts = {
    schools: [...DEFAULT_SCHOOLS],
    write: false,
    dryRun: false,
    auditReport: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--schools') {
      const raw = argv[i + 1] || '';
      i += 1;
      opts.schools = raw.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (arg === '--write') {
      opts.write = true;
    } else if (arg === '--dry-run') {
      opts.dryRun = true;
      opts.write = false;
    } else if (arg === '--audit-report') {
      opts.auditReport = argv[i + 1] || null;
      i += 1;
    }
  }

  return opts;
}

function normalizeHandle(value) {
  return String(value || '').trim().toLowerCase().replace(/^@+/, '');
}

function isSponsoredCandidate(post) {
  return Boolean(post?.isSponsored || post?.sponsored || String(post?.sponsorPartner || '').trim());
}

function looksLikeBusiness(handle) {
  if (KNOWN_BRANDS.has(handle)) return true;
  return BUSINESS_HINTS.some((hint) => handle.includes(hint));
}

function looksLikeIndividual(handle) {
  if (!handle) return false;
  if (looksLikeBusiness(handle)) return false;
  if (/^[a-z]+[._][a-z0-9._]+$/.test(handle) && !handle.includes('official')) return true;
  if (/\d/.test(handle) && !handle.includes('24') && !handle.includes('47')) return true;
  if (handle.startsWith('_')) return true;
  if (handle.split('.').length >= 3) return true;
  return false;
}

function classifyBase(schoolId, handle) {
  if (!handle) return null;

  if (EXCLUDE_EXACT.has(handle)) {
    return { decision: 'flag', reason: 'nil store/threads/collective/platform', confidence: 'high' };
  }

  if (NIL_PLATFORM_PATTERNS.some((pattern) => pattern.test(handle))) {
    return { decision: 'flag', reason: 'nil store/threads/collective/platform', confidence: 'high' };
  }

  if (RECRUITING_MEDIA_PATTERNS.some((pattern) => pattern.test(handle))) {
    return { decision: 'flag', reason: 'recruiting/media/podcast/publisher', confidence: 'high' };
  }

  const teamPatterns = TEAM_PAGE_PATTERNS[schoolId] || [];
  const schoolHints = SCHOOL_NAME_HINTS[schoolId] || [];
  if (teamPatterns.some((pattern) => pattern.test(handle))) {
    return { decision: 'flag', reason: 'team/school page', confidence: 'high' };
  }
  if (GENERIC_TEAM_HANDLE_PATTERNS.some((pattern) => pattern.test(handle)) && !looksLikeBusiness(handle)) {
    return { decision: 'flag', reason: 'team/school page', confidence: 'medium' };
  }
  if (schoolHints.some((hint) => handle.includes(hint)) && /football|wbb|vb|gym|soccer|baseball|basketball/.test(handle)) {
    return { decision: 'flag', reason: 'team/school page', confidence: 'high' };
  }
  if (COLLECTIVE_LIKE_PATTERNS.some((pattern) => pattern.test(handle)) && !looksLikeBusiness(handle)) {
    return { decision: 'needs-manual-check', reason: 'collective-like ambiguous handle', confidence: 'medium' };
  }

  if (looksLikeIndividual(handle)) {
    return { decision: 'flag', reason: 'likely individual non-brand', confidence: 'medium' };
  }

  if (!looksLikeBusiness(handle) && handle.length < 6) {
    return { decision: 'needs-manual-check', reason: 'ambiguous brand signal', confidence: 'low' };
  }

  return { decision: 'keep', reason: 'likely legit brand/business', confidence: 'medium' };
}

function loadDecisions(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const candidates = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.decisions) ? parsed.decisions : []);
  const validActions = new Set(['allow', 'exclude']);
  const out = [];
  for (const [idx, row] of candidates.entries()) {
    if (!row || typeof row !== 'object') {
      console.warn(`[decisions] skipping non-object row at index ${idx}`);
      continue;
    }
    const schoolId = String(row.schoolId || '').trim();
    const handle = normalizeHandle(row.handle);
    const action = String(row.action || '').trim();
    if (!schoolId || !handle || !validActions.has(action)) {
      console.warn(`[decisions] skipping invalid row at index ${idx} (requires schoolId, handle, action in allow|exclude)`);
      continue;
    }
    out.push({ ...row, schoolId, handle, action });
  }
  return out;
}

function getNowIso() {
  return new Date().toISOString();
}

function sortDecisionRows(rows) {
  return [...rows].sort((a, b) =>
    String(a.schoolId).localeCompare(String(b.schoolId))
    || normalizeHandle(a.handle).localeCompare(normalizeHandle(b.handle))
    || String(a.action).localeCompare(String(b.action))
  );
}

function writeDecisionRegistry(filePath, decisions) {
  const payload = {
    schemaVersion: 1,
    decisions: sortDecisionRows(decisions).map((d) => ({
      schoolId: d.schoolId,
      handle: normalizeHandle(d.handle),
      action: d.action,
      reason: d.reason || 'manual decision',
      updatedAt: d.updatedAt || getNowIso(),
    })),
  };
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

function autoSeedDecisionRows(results, existingRows) {
  const keyOf = (d) => `${d.schoolId}::${normalizeHandle(d.handle)}::${d.action}`;
  const existingKeys = new Set(existingRows.map(keyOf));
  const merged = [...existingRows];

  for (const result of results) {
    for (const row of result.flagged) {
      const candidate = {
        schoolId: result.schoolId,
        handle: row.handle,
        action: 'exclude',
        reason: `reviewed flagged handle: ${row.reason}`,
        updatedAt: getNowIso(),
      };
      const key = keyOf(candidate);
      if (!existingKeys.has(key)) {
        existingKeys.add(key);
        merged.push(candidate);
      }
    }
  }

  const iowaAllow47 = {
    schoolId: 'iowa',
    handle: '47',
    action: 'allow',
    reason: 'explicit user approval',
    updatedAt: getNowIso(),
  };
  const allowKey = keyOf(iowaAllow47);
  if (!existingKeys.has(allowKey)) {
    merged.push(iowaAllow47);
  }

  return merged;
}

function decisionMaps(decisions, schoolId) {
  const allow = new Set();
  const exclude = new Map();

  for (const d of decisions) {
    if (!d || d.schoolId !== schoolId) continue;
    const handle = normalizeHandle(d.handle);
    if (!handle) continue;
    if (d.action === 'allow') {
      allow.add(handle);
      continue;
    }
    if (d.action === 'exclude') {
      exclude.set(handle, d.reason || 'decision registry');
    }
  }

  return { allow, exclude };
}

function analyzeSchool(schoolId, posts, decisions) {
  const counts = new Map();
  let sponsoredPosts = 0;

  for (const post of posts) {
    if (!isSponsoredCandidate(post)) continue;
    sponsoredPosts += 1;
    const handle = normalizeHandle(post?.sponsorPartner);
    if (!handle) continue;
    counts.set(handle, (counts.get(handle) || 0) + 1);
  }

  const { allow, exclude } = decisionMaps(decisions, schoolId);
  const rows = [...counts.entries()].map(([handle, count]) => {
    if (allow.has(handle)) {
      return { handle, count, decision: 'keep', reason: 'decision registry allow', confidence: 'high', source: 'decision' };
    }
    if (exclude.has(handle)) {
      return { handle, count, decision: 'flag', reason: 'decision registry exclude', confidence: 'high', source: 'decision' };
    }
    const base = classifyBase(schoolId, handle);
    return { handle, count, ...base, source: 'rules' };
  }).sort((a, b) => b.count - a.count || a.handle.localeCompare(b.handle));

  return {
    schoolId,
    sponsoredPosts,
    uniqueHandles: counts.size,
    rows,
    flagged: rows.filter((r) => r.decision === 'flag'),
    manual: rows.filter((r) => r.decision === 'needs-manual-check'),
    keep: rows.filter((r) => r.decision === 'keep'),
  };
}

function applyCleaning(posts, schoolResult, decisions) {
  const { allow, exclude } = decisionMaps(decisions, schoolResult.schoolId);
  let changed = 0;
  const reasonCounts = new Map();

  for (const post of posts) {
    if (!isSponsoredCandidate(post)) continue;
    const handle = normalizeHandle(post?.sponsorPartner);
    if (!handle) continue;

    if (allow.has(handle)) continue;

    let shouldExclude = false;
    let reason = '';

    if (exclude.has(handle)) {
      shouldExclude = true;
      reason = 'decision registry exclude';
    } else {
      const base = classifyBase(schoolResult.schoolId, handle);
      if (base?.decision === 'flag') {
        shouldExclude = true;
        reason = base.reason;
      }
    }

    if (!shouldExclude) continue;

    post.sponsorPartner = '';
    post.isSponsored = false;
    if (Object.prototype.hasOwnProperty.call(post, 'sponsored')) {
      post.sponsored = false;
    }
    changed += 1;
    reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
  }

  return { changed, reasonCounts };
}

function toMarkdown(results) {
  const schoolTitle = {
    iowa: 'Iowa',
    minnesota: 'Minnesota',
    'washington-state': 'Washington State',
    'mississippi-state': 'Mississippi State',
  };

  const lines = [];
  lines.push('# Sponsored Handle Audit (4 Schools)');
  lines.push('');
  lines.push('Generated by `scripts/clean-sponsored-handles.mjs` in audit mode.');
  lines.push('');

  for (const result of results) {
    lines.push(`## ${schoolTitle[result.schoolId] || result.schoolId}`);
    lines.push('');
    lines.push(`- Sponsored posts: ${result.sponsoredPosts}`);
    lines.push(`- Unique handles: ${result.uniqueHandles}`);
    lines.push(`- Flagged: ${result.flagged.length}`);
    lines.push(`- Manual-check: ${result.manual.length}`);
    lines.push('');

    lines.push('### Flagged');
    lines.push('');
    lines.push('| Handle | Count | Reason | Confidence |');
    lines.push('|---|---:|---|---|');
    for (const row of result.flagged) {
      lines.push(`| @${row.handle} | ${row.count} | ${row.reason} | ${row.confidence} |`);
    }
    if (!result.flagged.length) {
      lines.push('| _None_ | 0 | - | - |');
    }
    lines.push('');

    lines.push('### Manual-Check');
    lines.push('');
    lines.push('| Handle | Count | Reason | Confidence |');
    lines.push('|---|---:|---|---|');
    for (const row of result.manual) {
      lines.push(`| @${row.handle} | ${row.count} | ${row.reason} | ${row.confidence} |`);
    }
    if (!result.manual.length) {
      lines.push('| _None_ | 0 | - | - |');
    }
    lines.push('');

    lines.push('### Keep (Condensed)');
    lines.push('');
    lines.push('| Handle | Count |');
    lines.push('|---|---:|');
    for (const row of result.keep.slice(0, 25)) {
      lines.push(`| @${row.handle} | ${row.count} |`);
    }
    if (!result.keep.length) {
      lines.push('| _None_ | 0 |');
    }
    if (result.keep.length > 25) {
      lines.push(`| _...and ${result.keep.length - 25} more_ |  |`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const originalDecisions = loadDecisions(DECISIONS_PATH);
  let decisions = originalDecisions;

  const results = [];
  for (const schoolId of opts.schools) {
    const file = SCHOOL_FILES[schoolId];
    if (!file) {
      console.warn(`[skip] Unknown schoolId: ${schoolId}`);
      continue;
    }
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`[skip] Missing file: ${filePath}`);
      continue;
    }

    const posts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const result = analyzeSchool(schoolId, posts, decisions);
    results.push(result);

    const { changed, reasonCounts } = applyCleaning(posts, result, decisions);

    if (opts.write && !opts.dryRun) {
      fs.writeFileSync(filePath, `${JSON.stringify(posts, null, 2)}\n`);
    }

    const reasonSummary = [...reasonCounts.entries()].map(([k, v]) => `${k}: ${v}`).join(', ');
    console.log(`[${schoolId}] sponsored=${result.sponsoredPosts} handles=${result.uniqueHandles} flagged=${result.flagged.length} manual=${result.manual.length} cleaned_posts=${changed}${reasonSummary ? ` | ${reasonSummary}` : ''}`);
  }

  // Seed reviewed decisions from currently flagged handles + explicit allow for Iowa @47.
  decisions = autoSeedDecisionRows(results, decisions);
  writeDecisionRegistry(DECISIONS_PATH, decisions);

  if (opts.auditReport) {
    const markdown = toMarkdown(results);
    const outPath = path.isAbsolute(opts.auditReport)
      ? opts.auditReport
      : path.join(ROOT, opts.auditReport);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, markdown);
    console.log(`[audit] wrote ${outPath}`);
  }
}

main();
