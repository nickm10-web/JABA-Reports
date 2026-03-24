#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = '/Users/jaba/REPORTS';
const componentsDir = path.join(repoRoot, 'src/components');

const presets = {
  virginia: {
    source: 'VirginiaIPImpact.tsx',
    component: 'VirginiaIPImpact',
    schoolName: 'Virginia',
    schoolSlug: 'virginia',
    schoolFullName: 'University of Virginia',
    mascot: 'Cavaliers',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/258.png',
    theme: { primary: '#232D4B', primaryDark: '#182038', primaryLight: '#36476F', accent: '#F84C1E' },
  },
  kentucky: {
    source: 'KentuckyIPImpact.tsx',
    component: 'KentuckyIPImpact',
    schoolName: 'Kentucky',
    schoolSlug: 'kentucky',
    schoolFullName: 'University of Kentucky',
    mascot: 'Wildcats',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/96.png',
    theme: { primary: '#0033A0', primaryDark: '#002266', primaryLight: '#1a5cc8', accent: '#0369a1' },
  },
  clemson: {
    source: 'ClemsonIPImpact.tsx',
    component: 'ClemsonIPImpact',
    schoolName: 'Clemson',
    schoolSlug: 'clemson',
    schoolFullName: 'Clemson',
    mascot: 'Tigers',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/228.png',
    theme: { primary: '#F56600', primaryDark: '#D35400', primaryLight: '#FF8A33', accent: '#522D80' },
  },
};

function usage() {
  console.error('Usage: node scripts/generate-ip-impact-report.mjs --base <virginia|kentucky|clemson> --name <School> --slug <school-slug> --full <School Full Name> --mascot <Mascot> --logo <url> --component <ComponentName> --out <filename.tsx> [--primary <hex> --primary-dark <hex> --primary-light <hex> --accent <hex>]');
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const k = argv[i];
    const v = argv[i + 1];
    if (!k.startsWith('--') || !v || v.startsWith('--')) usage();
    args[k.slice(2)] = v;
    i += 1;
  }
  return args;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceAllLiteral(content, from, to) {
  if (!from || from === to) return content;
  return content.replace(new RegExp(escapeRegExp(from), 'g'), to);
}

const args = parseArgs(process.argv);
const baseKey = args.base;
if (!baseKey || !presets[baseKey]) usage();

const base = presets[baseKey];
const target = {
  schoolName: args.name,
  schoolSlug: args.slug,
  schoolFullName: args.full,
  mascot: args.mascot,
  logoUrl: args.logo,
  component: args.component,
  out: args.out,
  theme: {
    primary: args['primary'] || base.theme.primary,
    primaryDark: args['primary-dark'] || base.theme.primaryDark,
    primaryLight: args['primary-light'] || base.theme.primaryLight,
    accent: args.accent || base.theme.accent,
  },
};

if (!target.schoolName || !target.schoolSlug || !target.schoolFullName || !target.mascot || !target.logoUrl || !target.component || !target.out) {
  usage();
}

const sourcePath = path.join(componentsDir, base.source);
let content = fs.readFileSync(sourcePath, 'utf8');

// Scoped replacements for school identity and component naming.
content = replaceAllLiteral(content, base.component, target.component);
content = replaceAllLiteral(content, `src="${base.logoUrl}"`, `src="${target.logoUrl}"`);
content = replaceAllLiteral(content, `alt="${base.schoolName}"`, `alt="${target.schoolName}"`);

// Theme colors.
content = replaceAllLiteral(content, `primary: '${base.theme.primary}'`, `primary: '${target.theme.primary}'`);
content = replaceAllLiteral(content, `primaryDark: '${base.theme.primaryDark}'`, `primaryDark: '${target.theme.primaryDark}'`);
content = replaceAllLiteral(content, `primaryLight: '${base.theme.primaryLight}'`, `primaryLight: '${target.theme.primaryLight}'`);
content = replaceAllLiteral(content, `accent: '${base.theme.accent}'`, `accent: '${target.theme.accent}'`);

// School naming in UI copy and source paths.
const scopedPhrases = [
  `${base.schoolName} posts show`,
  `feature ${base.schoolName} IP`,
  `official ${base.schoolName} account`,
  `feature ${base.schoolName} logos`,
  `mention ${base.schoolName} in captions`,
  `${base.schoolName} athlete personal social media accounts`,
  `use ${base.schoolName} IP`,
  `mapped ${base.schoolName} athlete follower totals`,
  `Pulling athlete and team posts for ${base.schoolName}.`,
  `Best WITH ${base.schoolName} IP`,
  `official ${base.schoolName} team page posts only`,
  `${base.schoolName} athlete personal posts only`,
  `No ${base.schoolName} team page posts available.`,
  `Official ${base.schoolName} athletics social account performance.`,
  `Benchmark ${base.schoolName} team pages against conference and NCAA.`,
  `This tab uses <span className="font-semibold">official ${base.schoolName} team page accounts</span>, not athlete personal posts.`,
  `${base.schoolName} vs {benchmarkLabel} schools ranked by {metricLabels[rankingMetric].toLowerCase()}. Data reflects {selectedSport === 'ALL' ? 'all athlete posts' : \`${'${formatSportLabel(selectedSport)}'} athlete posts\`}.`,
  `${base.schoolName} Rank`,
  `${base.schoolName} Value`,
  `${base.schoolName} is {kyRank ? \`#${'${kyRank}'}\` : 'unranked'}`,
  `${base.schoolName} {sportLabel} Rank`,
  `${base.schoolName} Team`,
  `${base.schoolName} `,
  `<span style={{ color: colors.primary }}>${base.schoolName} </span>`,
  `<span className=\"hidden sm:inline\"><span style={{ color: colors.primary }}>${base.mascot} </span><span style={{ color: colors.headerGray }}>IP Impact Report</span></span>`,
];

for (const phrase of scopedPhrases) {
  if (phrase.includes(base.schoolName)) {
    content = replaceAllLiteral(content, phrase, phrase.replaceAll(base.schoolName, target.schoolName).replaceAll(base.mascot, target.mascot));
  }
}

// Common direct replacements in data file names.
content = replaceAllLiteral(content, `/data/${base.schoolSlug}-content-posts.json`, `/data/${target.schoolSlug}-content-posts.json`);
content = replaceAllLiteral(content, `/data/${base.schoolSlug}_teams_contents.json`, `/data/${target.schoolSlug}_teams_contents.json`);
content = replaceAllLiteral(content, `/data/${base.schoolSlug}.team_contents.json`, `/data/${target.schoolSlug}.team_contents.json`);
content = replaceAllLiteral(content, `/data/${base.schoolSlug}_teams_metrics.json`, `/data/${target.schoolSlug}_teams_metrics.json`);
content = replaceAllLiteral(content, `/data/${base.schoolSlug}.roster_teams.json`, `/data/${target.schoolSlug}.roster_teams.json`);
content = replaceAllLiteral(content, `/data/${base.schoolSlug}-athlete-overview.json`, `/data/${target.schoolSlug}-athlete-overview.json`);

// University-specific files used by Virginia-style report.
content = replaceAllLiteral(content, `/data/university-of-${base.schoolSlug}-ip-impact.json`, `/data/university-of-${target.schoolSlug}-ip-impact.json`);
content = replaceAllLiteral(content, `/data/university-of-${base.schoolSlug}-partnerships.json`, `/data/university-of-${target.schoolSlug}-partnerships.json`);
content = replaceAllLiteral(content, `/data/${base.schoolSlug}-roster.json`, `/data/${target.schoolSlug}-roster.json`);

// Alias map school key entries.
content = replaceAllLiteral(content, `${base.schoolSlug}: '${base.schoolSlug}'`, `${target.schoolSlug}: '${target.schoolSlug}'`);
content = replaceAllLiteral(content, `universityof${base.schoolSlug}: '${base.schoolSlug}'`, `universityof${target.schoolSlug}: '${target.schoolSlug}'`);

// Full name fallbacks.
content = replaceAllLiteral(content, `'${base.schoolFullName}'`, `'${target.schoolFullName}'`);

const outPath = path.join(componentsDir, target.out);
fs.writeFileSync(outPath, content);
console.log(`Generated ${outPath} from ${sourcePath}`);
