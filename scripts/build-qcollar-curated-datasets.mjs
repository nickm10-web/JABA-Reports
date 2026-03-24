#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const ATHLETE_COLLAB_URLS = [
  'https://www.instagram.com/p/CptGQlbOTwZ/',
  'https://www.instagram.com/reel/DQW2y3qDeGT/',
  'https://www.instagram.com/p/CzUvzvYvw6X/',
  'https://www.instagram.com/reel/DPRyOnTgQbW/',
  'https://www.instagram.com/p/DQxVKboieBT/',
  'https://www.instagram.com/p/CiisdTqOx6h/',
  'https://www.instagram.com/reel/Cp0bvqKD9t1/',
  'https://www.instagram.com/p/CzoneqTP8o4/',
  'https://www.instagram.com/p/CjjA0_4Pj4D/',
  'https://www.instagram.com/reel/CwGnpF7qJX5/',
  'https://www.instagram.com/p/C2DBCkBu49Y/',
  'https://www.instagram.com/reel/C-Jarh2gaoO/',
  'https://www.instagram.com/p/DEiP3eaRlje/',
  'https://www.instagram.com/p/DP9pL93EuIA/',
  'https://www.instagram.com/reel/DUlvwvTD5_q/',
  'https://www.instagram.com/reel/DCPmZ7eSjPG/',
  'https://www.instagram.com/reel/C5zE09LSNGI/',
  'https://www.instagram.com/reel/C4x6kdLL0NU/',
];

const BRAND_ONLY_URLS = [
  'https://www.instagram.com/reel/DPRyOnTgQbW/',
  'https://www.instagram.com/reel/DLkcsACsWLy/',
  'https://www.instagram.com/reel/DL8ERPkROuS/',
  'https://www.instagram.com/reel/DMa7pQLRwgf/',
  'https://www.instagram.com/reel/DMgVzUPBClz/',
  'https://www.instagram.com/reel/DNEIgWoRRFc/',
  'https://www.instagram.com/reel/DNjDUiZBNKW/',
  'https://www.instagram.com/reel/DOO0Wq7gXSf/',
  'https://www.instagram.com/reel/DO9PBEDgbZq/',
  'https://www.instagram.com/reel/DH_x4C_RW-r/',
  'https://www.instagram.com/reel/C-ayEJkvWlm/',
  'https://www.instagram.com/reel/C9SnJozxGYB/',
  'https://www.instagram.com/reel/CyEWYwiLb9j/',
  'https://www.instagram.com/reel/CwqG2dGRhgu/',
  'https://www.instagram.com/reel/CwgfJ8avxe0/',
  'https://www.instagram.com/reel/CwNyPzOpFoe/',
  'https://www.instagram.com/reel/CvxmPM6g3fd/',
  'https://www.instagram.com/reel/CviEhLcA-Me/',
  'https://www.instagram.com/reel/Cm-CNVOpT5d/',
  'https://www.instagram.com/reel/CkgFGLdAG6c/',
  'https://www.instagram.com/reel/CkGRbCsA4G0/',
  'https://www.instagram.com/reel/Cjp9Q0Ggr8p/',
  'https://www.instagram.com/reel/Cii40-yg0WM/',
  'https://www.instagram.com/reel/CiQWoSLg12c/',
  'https://www.instagram.com/p/Chkf6kxl-pc/',
  'https://www.instagram.com/reel/ChS21LwAb5d/',
];

const DATA_DIR = path.resolve(process.cwd(), 'public/data/scrapecreators');
const BRAND_POSTS_PATH = path.join(DATA_DIR, 'brand-posts-qcollarofficial.json');

function canonicalizeInstagramUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const match = url.pathname.match(/^\/(p|reel)\/([^/]+)/i);
  if (!match) return null;
  const mediaType = match[1].toLowerCase();
  const shortcode = match[2];
  return {
    mediaType,
    shortcode,
    permalink: `https://www.instagram.com/${mediaType}/${shortcode}/`,
  };
}

function buildRows(rawUrls, sourceLabel) {
  const seen = new Set();
  const duplicates = [];
  const rows = [];

  for (const raw of rawUrls) {
    const parsed = canonicalizeInstagramUrl(raw);
    if (!parsed) continue;
    if (seen.has(parsed.permalink)) {
      duplicates.push(parsed.permalink);
      continue;
    }
    seen.add(parsed.permalink);
    rows.push({
      source: sourceLabel,
      permalink: parsed.permalink,
      shortcode: parsed.shortcode,
      mediaType: parsed.mediaType === 'reel' ? 'reel' : 'static',
      athletePartnership: sourceLabel === 'athlete_collab',
      brandOnlyPost: sourceLabel === 'brand_only',
    });
  }

  return { rows, duplicates };
}

function getShortcodeFromPermalink(url) {
  const parsed = canonicalizeInstagramUrl(url);
  return parsed?.shortcode || '';
}

function enrichWithBrandDataset(row, brandPostsByShortcode) {
  const match = brandPostsByShortcode.get(row.shortcode);
  if (!match) {
    return {
      ...row,
      foundInBrandDataset: false,
      caption: null,
      likes: null,
      comments: null,
      timestamp: null,
      videoDuration: null,
      thumbnailUrl: null,
      mediaUrl: null,
      taggedUsers: [],
      collaborators: [],
    };
  }

  return {
    ...row,
    foundInBrandDataset: true,
    caption: match.caption ?? null,
    likes: match.likes ?? null,
    comments: match.comments ?? null,
    timestamp: match.timestamp ?? null,
    videoDuration: match.videoDuration ?? null,
    thumbnailUrl: match.thumbnailUrl || match.thumbnail || null,
    mediaUrl: match.mediaUrl || match.thumbnailUrl || match.thumbnail || null,
    taggedUsers: Array.isArray(match.taggedUsers) ? match.taggedUsers : [],
    collaborators: Array.isArray(match.collaborators) ? match.collaborators : [],
  };
}

async function run() {
  const { rows: athleteRows, duplicates: athleteDuplicates } = buildRows(
    ATHLETE_COLLAB_URLS,
    'athlete_collab'
  );
  const { rows: brandOnlyRows, duplicates: brandOnlyDuplicates } = buildRows(
    BRAND_ONLY_URLS,
    'brand_only'
  );

  const allRowsDedupMap = new Map();
  for (const row of [...athleteRows, ...brandOnlyRows]) {
    const existing = allRowsDedupMap.get(row.permalink);
    if (!existing) {
      allRowsDedupMap.set(row.permalink, row);
      continue;
    }

    allRowsDedupMap.set(row.permalink, {
      ...existing,
      athletePartnership: existing.athletePartnership || row.athletePartnership,
      brandOnlyPost: existing.brandOnlyPost || row.brandOnlyPost,
      source:
        existing.source === row.source
          ? existing.source
          : existing.source === 'both' || row.source === 'both'
            ? 'both'
            : 'both',
    });
  }

  let brandPosts = [];
  try {
    const raw = await fs.readFile(BRAND_POSTS_PATH, 'utf8');
    brandPosts = JSON.parse(raw).rows || [];
  } catch {
    // no-op: enrichment is best effort
  }

  const brandPostsByShortcode = new Map();
  for (const post of brandPosts) {
    const shortcode = getShortcodeFromPermalink(post.permalink);
    if (!shortcode) continue;
    brandPostsByShortcode.set(shortcode, post);
  }

  const athleteEnriched = athleteRows.map((row) => enrichWithBrandDataset(row, brandPostsByShortcode));
  const brandOnlyEnriched = brandOnlyRows.map((row) => enrichWithBrandDataset(row, brandPostsByShortcode));
  const masterEnriched = [...allRowsDedupMap.values()].map((row) =>
    enrichWithBrandDataset(row, brandPostsByShortcode)
  );

  await fs.mkdir(DATA_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(
      path.join(DATA_DIR, 'qcollar-manual-athlete-collab.json'),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          count: athleteEnriched.length,
          duplicatesRemoved: athleteDuplicates.length,
          duplicates: athleteDuplicates,
          rows: athleteEnriched,
        },
        null,
        2
      )
    ),
    fs.writeFile(
      path.join(DATA_DIR, 'qcollar-manual-brand-only.json'),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          count: brandOnlyEnriched.length,
          duplicatesRemoved: brandOnlyDuplicates.length,
          duplicates: brandOnlyDuplicates,
          rows: brandOnlyEnriched,
        },
        null,
        2
      )
    ),
    fs.writeFile(
      path.join(DATA_DIR, 'qcollar-manual-curated-master.json'),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          totalUniquePosts: masterEnriched.length,
          foundInBrandDataset: masterEnriched.filter((r) => r.foundInBrandDataset).length,
          notFoundInBrandDataset: masterEnriched.filter((r) => !r.foundInBrandDataset).length,
          rows: masterEnriched,
        },
        null,
        2
      )
    ),
  ]);

  console.log(`athlete_collab: ${athleteEnriched.length}`);
  console.log(`brand_only: ${brandOnlyEnriched.length}`);
  console.log(`master_unique: ${masterEnriched.length}`);
  console.log(
    `matched_to_brand_dataset: ${masterEnriched.filter((r) => r.foundInBrandDataset).length}/${masterEnriched.length}`
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
