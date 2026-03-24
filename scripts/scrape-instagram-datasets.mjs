#!/usr/bin/env node
/**
 * ScrapeCreators Instagram dataset builder
 *
 * Outputs:
 * - public/data/scrapecreators/brand-posts-qcollarofficial.json
 * - public/data/scrapecreators/athlete-mentions-qcollarofficial.json
 * - public/data/scrapecreators/athlete-baselines-qcollarofficial.json
 * - public/data/scrapecreators/competitive-brand-qcollarofficial.json
 *
 * Usage:
 * SCRAPECREATORS_API_KEY=... node scripts/scrape-instagram-datasets.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const API_KEY = process.env.SCRAPECREATORS_API_KEY || process.env.VITE_SCRAPECREATORS_API_KEY;
const BASE_URL = (process.env.SCRAPECREATORS_BASE_URL || process.env.VITE_SCRAPECREATORS_BASE_URL || 'https://api.scrapecreators.com').replace(/\/+$/, '');

if (!API_KEY) {
  console.error('Missing SCRAPECREATORS_API_KEY (or VITE_SCRAPECREATORS_API_KEY).');
  process.exit(1);
}

const BRAND_HANDLE = process.env.BRAND_HANDLE || 'qcollarofficial';
const ATHLETE_POST_LIMIT = Number(process.env.ATHLETE_POST_LIMIT || 20);
const MAX_PAGES = Number(process.env.MAX_PAGES || 8);
const PAGE_LIMIT = Number(process.env.PAGE_LIMIT || 50);
const COMPETITOR_HANDLES = (process.env.COMPETITOR_HANDLES || 'xenithfootball,shockdoctor,battle,schuttsports,riddellsports')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .slice(0, 5);
const EXTRA_ATHLETE_HANDLES = (process.env.EXTRA_ATHLETE_HANDLES || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/data/scrapecreators');
const SAVE_RAW_RESPONSES = (process.env.SCRAPECREATORS_SAVE_RAW || '1') === '1';
const RAW_DUMP_PATH = path.resolve(
  process.cwd(),
  process.env.SCRAPECREATORS_RAW_DUMP_PATH || 'tmp/scrapecreators-raw-responses.json'
);

function normalizeHandle(raw) {
  const value = text(raw).replace(/^@+/, '').trim().toLowerCase();
  if (!value) return '';
  // Remove trailing sentence punctuation that often appears after @mentions in captions.
  return value.replace(/[!?;:,]+$/g, '').replace(/\.+$/g, '');
}

function headers() {
  return {
    'x-api-key': API_KEY,
    Authorization: `Bearer ${API_KEY}`,
  };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(v) {
  return typeof v === 'string' ? v : '';
}

function num(v, fallback = 0) {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function extractList(payload) {
  const candidates = [payload?.data, payload?.items, payload?.posts, payload?.reels, payload?.results];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function extractNextCursor(payload) {
  return (
    payload?.next_cursor ||
    payload?.cursor ||
    payload?.pagination?.next_cursor ||
    payload?.page_info?.end_cursor ||
    payload?.next ||
    null
  );
}

function getCaption(post) {
  if (typeof post?.caption === 'string') return post.caption;
  if (typeof post?.caption?.text === 'string') return post.caption.text;
  return '';
}

function getTaggedUsers(post) {
  const out = new Set();
  asArray(post?.tagged_users).forEach((u) => {
    const username = normalizeHandle(u?.username || u?.user?.username || u?.handle);
    if (username) out.add(username.toLowerCase());
  });
  asArray(post?.usertags).forEach((u) => {
    const username = normalizeHandle(u?.user?.username || u?.username);
    if (username) out.add(username.toLowerCase());
  });
  asArray(post?.coauthor_producers).forEach((u) => {
    const username = normalizeHandle(u?.username || u?.user?.username);
    if (username) out.add(username.toLowerCase());
  });
  return [...out];
}

function getCollaborators(post) {
  const out = new Set();
  asArray(post?.collaborators).forEach((u) => {
    const username = normalizeHandle(u?.username || u?.user?.username);
    if (username) out.add(username.toLowerCase());
  });
  asArray(post?.coauthor_producers).forEach((u) => {
    const username = normalizeHandle(u?.username || u?.user?.username);
    if (username) out.add(username.toLowerCase());
  });
  return [...out];
}

function getCaptionMentions(caption) {
  const out = new Set();
  if (!caption) return [];
  const regex = /@([a-zA-Z0-9._]{1,30})/g;
  let match = regex.exec(caption);
  while (match) {
    const cleaned = normalizeHandle(match[1]);
    if (cleaned) out.add(cleaned);
    match = regex.exec(caption);
  }
  return [...out];
}

function collectHandlesDeep(input, maxDepth = 5) {
  const out = new Set();
  const visited = new Set();

  function walk(node, depth) {
    if (!node || depth > maxDepth) return;
    if (typeof node !== 'object') return;
    if (visited.has(node)) return;
    visited.add(node);

    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (value && typeof value === 'string') {
        const keyLower = key.toLowerCase();
        if (
          keyLower.includes('username') ||
          keyLower === 'handle' ||
          keyLower.endsWith('_handle') ||
          keyLower.includes('user_name')
        ) {
          const cleaned = normalizeHandle(value);
          if (cleaned) out.add(cleaned);
        }
      } else if (value && typeof value === 'object') {
        walk(value, depth + 1);
      }
    }
  }

  walk(input, 0);
  return [...out];
}

function getId(post) {
  return String(post?.id || post?.pk || post?.media_id || post?.code || post?.shortcode || '');
}

function getType(post, fallback = 'static') {
  const mediaType = String(post?.media_type || post?.type || post?.product_type || '').toLowerCase();
  if (mediaType.includes('reel') || mediaType.includes('video')) return 'reel';
  if (post?.is_video === true) return 'reel';
  return fallback;
}

function getLikes(post) {
  return num(post?.like_count, num(post?.metrics?.likes, num(post?.likes, 0)));
}

function getComments(post) {
  return num(post?.comment_count, num(post?.metrics?.comments, num(post?.comments, 0)));
}

function getTimestamp(post) {
  return (
    post?.taken_at ||
    post?.taken_at_timestamp ||
    post?.created_at ||
    post?.timestamp ||
    post?.published_at ||
    null
  );
}

function getVideoDuration(post) {
  return num(post?.video_duration, num(post?.duration, num(post?.video_duration_secs, 0)), 0);
}

function getMediaCandidates(post) {
  const candidates = [];

  const push = (value) => {
    if (typeof value !== 'string') return;
    const trimmed = value.trim();
    if (!trimmed) return;
    candidates.push(trimmed);
  };

  push(post?.thumbnail_url);
  push(post?.display_url);
  push(post?.image_url);
  push(post?.video_url);
  push(post?.image_versions2?.candidates?.[0]?.url);
  push(post?.image_versions?.items?.[0]?.url);
  push(post?.video_versions?.[0]?.url);
  push(post?.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url);
  push(post?.carousel_media?.[0]?.video_versions?.[0]?.url);
  push(post?.media?.image_url);
  push(post?.media?.video_url);
  push(post?.media?.thumbnail_url);

  return [...new Set(candidates)];
}

function getThumbnailUrl(post) {
  const media = getMediaCandidates(post);
  return media[0] || null;
}

function getMediaUrl(post) {
  return (
    post?.video_url ||
    post?.video_versions?.[0]?.url ||
    post?.image_url ||
    post?.display_url ||
    post?.image_versions2?.candidates?.[0]?.url ||
    getThumbnailUrl(post)
  );
}

function isSponsored(post) {
  const caption = getCaption(post).toLowerCase();
  if (post?.is_paid_partnership || post?.is_sponsored || post?.isSponsored) return true;
  return (
    caption.includes('#ad') ||
    caption.includes('#sponsored') ||
    caption.includes('paid partnership') ||
    caption.includes('#partner')
  );
}

function normalizeBrandPost(post, sourceType) {
  const collaborators = getCollaborators(post);
  const taggedUsers = getTaggedUsers(post);
  const caption = getCaption(post);
  const captionMentions = getCaptionMentions(caption);
  const deepHandles = collectHandlesDeep(post);
  const thumbnailUrl = getThumbnailUrl(post);
  const mediaUrl = getMediaUrl(post);
  return {
    postId: getId(post),
    type: getType(post, sourceType === 'reels' ? 'reel' : 'static'),
    caption,
    likes: getLikes(post),
    comments: getComments(post),
    timestamp: getTimestamp(post),
    videoDuration: getVideoDuration(post),
    collabFlag: collaborators.length > 0 || Boolean(post?.is_collab || post?.isCollaboration),
    collaborators,
    taggedUsers,
    captionMentions,
    deepHandles,
    permalink: post?.permalink || post?.url || null,
    thumbnail: thumbnailUrl, // legacy field
    thumbnailUrl,
    mediaUrl,
    mediaCandidates: getMediaCandidates(post),
    sourceType,
  };
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

async function fetchEndpoint(pathname, params = {}, rawResponses = null) {
  const url = new URL(`${BASE_URL}${pathname}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });

  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${pathname} failed ${res.status}: ${body.slice(0, 300)}`);
  }
  const payload = await res.json();
  if (SAVE_RAW_RESPONSES && Array.isArray(rawResponses)) {
    rawResponses.push({
      fetchedAt: new Date().toISOString(),
      pathname,
      params,
      payload,
    });
  }
  return payload;
}

async function fetchUserFeedWithPagination(handle, pathname, rawResponses = null) {
  const all = [];
  let cursor = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const payload = await fetchEndpoint(pathname, {
      handle,
      username: handle,
      user: handle,
      limit: PAGE_LIMIT,
      cursor,
    }, rawResponses);
    const pageItems = extractList(payload);
    all.push(...pageItems);
    cursor = extractNextCursor(payload);
    if (!cursor || pageItems.length === 0) break;
  }

  return all;
}

function extractPotentialAthleteHandles(brandPosts, brandHandle) {
  const blacklist = new Set([
    normalizeHandle(brandHandle),
    'pll',
    'nfl',
    'nba',
    'mlb',
    'nhl',
    'ncaa',
    'espn',
  ]);

  const out = new Set();
  for (const p of brandPosts) {
    for (const handle of [
      ...p.taggedUsers,
      ...p.collaborators,
      ...(p.captionMentions || []),
      ...(p.deepHandles || []),
    ]) {
      if (!handle) continue;
      const normalized = normalizeHandle(handle);
      if (!normalized) continue;
      if (blacklist.has(normalized)) continue;
      out.add(normalized);
    }
  }
  for (const h of EXTRA_ATHLETE_HANDLES) {
    const normalized = normalizeHandle(h);
    if (!normalized || blacklist.has(normalized)) continue;
    out.add(normalized);
  }
  return [...out];
}

function isQCollarMention(post, brandHandle) {
  const caption = getCaption(post).toLowerCase();
  const tagged = getTaggedUsers(post);
  return (
    caption.includes('q collar') ||
    caption.includes('q-collar') ||
    caption.includes('qcollar') ||
    tagged.includes(brandHandle.toLowerCase())
  );
}

function toAthleteMentionRow(handle, post, brandHandle) {
  const caption = getCaption(post);
  const taggedUsers = getTaggedUsers(post);
  const thumbnailUrl = getThumbnailUrl(post);
  const mediaUrl = getMediaUrl(post);
  const followers = num(
    post?.owner?.follower_count,
    num(post?.user?.follower_count, num(post?.author?.follower_count, 0))
  );

  return {
    athlete: handle,
    followers,
    postId: getId(post),
    type: getType(post),
    caption,
    likes: getLikes(post),
    comments: getComments(post),
    engagementRate: followers > 0 ? ((getLikes(post) + getComments(post)) / followers) * 100 : null,
    timestamp: getTimestamp(post),
    sponsored: isSponsored(post),
    captionContainsQCollar:
      caption.toLowerCase().includes('q collar') ||
      caption.toLowerCase().includes('q-collar') ||
      caption.toLowerCase().includes('qcollar'),
    qCollarTagged: taggedUsers.includes(brandHandle.toLowerCase()),
    logoVisible: null,
    productVisible: null,
    visionStatus: 'pending_manual_or_ai_review',
    taggedUsers,
    permalink: post?.permalink || post?.url || null,
    imageOrVideoUrl: mediaUrl || thumbnailUrl,
    thumbnailUrl,
    mediaUrl,
    mediaCandidates: getMediaCandidates(post),
  };
}

async function fetchUserPostsAndReels(handle, limit = ATHLETE_POST_LIMIT, rawResponses = null) {
  const [postsPayload, reelsPayload] = await Promise.all([
    fetchEndpoint('/v2/instagram/user/posts', { handle, username: handle, user: handle, limit }, rawResponses),
    fetchEndpoint('/v1/instagram/user/reels', { handle, username: handle, user: handle, limit }, rawResponses),
  ]);

  const posts = extractList(postsPayload);
  const reels = extractList(reelsPayload);
  const all = [...posts, ...reels].slice(0, limit * 2);
  return { posts, reels, all };
}

async function build() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const rawResponses = [];

  console.log(`Fetching brand posts for @${BRAND_HANDLE}...`);
  const [brandPostsRaw, brandReelsRaw] = await Promise.all([
    fetchUserFeedWithPagination(BRAND_HANDLE, '/v2/instagram/user/posts', rawResponses),
    fetchUserFeedWithPagination(BRAND_HANDLE, '/v1/instagram/user/reels', rawResponses),
  ]);

  const brandPosts = [
    ...brandPostsRaw.map((p) => normalizeBrandPost(p, 'posts')),
    ...brandReelsRaw.map((p) => normalizeBrandPost(p, 'reels')),
  ];

  const athleteHandles = extractPotentialAthleteHandles(brandPosts, BRAND_HANDLE);
  console.log(`Potential athlete handles found: ${athleteHandles.length}`);

  const athleteMentions = [];
  const athleteBaselines = [];

  for (const handle of athleteHandles) {
    try {
      const userContent = await fetchUserPostsAndReels(handle, ATHLETE_POST_LIMIT, rawResponses);
      const mentionRows = userContent.all
        .filter((post) => isQCollarMention(post, BRAND_HANDLE))
        .map((post) => toAthleteMentionRow(handle, post, BRAND_HANDLE));
      athleteMentions.push(...mentionRows);

      const baselineCandidates = userContent.all.filter((post) => !isSponsored(post)).slice(0, ATHLETE_POST_LIMIT);
      const likes = baselineCandidates.map(getLikes);
      const comments = baselineCandidates.map(getComments);
      const followerCandidates = baselineCandidates
        .map((p) => num(p?.owner?.follower_count, num(p?.user?.follower_count, 0)))
        .filter((v) => v > 0);
      const followers = followerCandidates[0] || 0;
      const engagementRate =
        followers > 0 ? average(baselineCandidates.map((p) => ((getLikes(p) + getComments(p)) / followers) * 100)) : null;

      athleteBaselines.push({
        athlete: handle,
        followers,
        sampleSize: baselineCandidates.length,
        avgLikes: average(likes),
        avgComments: average(comments),
        engagementRate,
      });
    } catch (error) {
      athleteBaselines.push({
        athlete: handle,
        error: String(error),
      });
    }
  }

  const competitorRows = [];
  for (const competitor of COMPETITOR_HANDLES) {
    try {
      const [cPostsRaw, cReelsRaw] = await Promise.all([
        fetchUserFeedWithPagination(competitor, '/v2/instagram/user/posts', rawResponses),
        fetchUserFeedWithPagination(competitor, '/v1/instagram/user/reels', rawResponses),
      ]);
      const normalized = [
        ...cPostsRaw.map((p) => normalizeBrandPost(p, 'posts')),
        ...cReelsRaw.map((p) => normalizeBrandPost(p, 'reels')),
      ];
      const sponsoredAthletePosts = normalized.filter((p) => p.collabFlag || /#ad|#sponsored|paid partnership|#partner/i.test(p.caption));
      const talent = [...new Set(sponsoredAthletePosts.flatMap((p) => [...p.taggedUsers, ...p.collaborators]))];
      competitorRows.push({
        brand: competitor,
        totalPosts: normalized.length,
        sponsoredAthletePosts: sponsoredAthletePosts.length,
        avgLikesSponsored: average(sponsoredAthletePosts.map((p) => p.likes)),
        avgCommentsSponsored: average(sponsoredAthletePosts.map((p) => p.comments)),
        engagementAvgProxy: average(
          sponsoredAthletePosts.map((p) => {
            const denom = Math.max(1, p.likes + p.comments);
            return ((p.likes + p.comments) / denom) * 100;
          })
        ),
        talentUsed: talent,
        posts: sponsoredAthletePosts,
      });
    } catch (error) {
      competitorRows.push({
        brand: competitor,
        error: String(error),
      });
    }
  }

  const brandPostsPath = path.join(OUTPUT_DIR, `brand-posts-${BRAND_HANDLE}.json`);
  const athleteMentionsPath = path.join(OUTPUT_DIR, `athlete-mentions-${BRAND_HANDLE}.json`);
  const athleteBaselinesPath = path.join(OUTPUT_DIR, `athlete-baselines-${BRAND_HANDLE}.json`);
  const competitorPath = path.join(OUTPUT_DIR, `competitive-brand-${BRAND_HANDLE}.json`);

  await Promise.all([
    fs.writeFile(
      brandPostsPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          brandHandle: BRAND_HANDLE,
          total: brandPosts.length,
          rows: brandPosts,
        },
        null,
        2
      )
    ),
    fs.writeFile(
      athleteMentionsPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          brandHandle: BRAND_HANDLE,
          total: athleteMentions.length,
          rows: athleteMentions,
          note: 'logoVisible/productVisible require manual or AI vision review.',
        },
        null,
        2
      )
    ),
    fs.writeFile(
      athleteBaselinesPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          brandHandle: BRAND_HANDLE,
          total: athleteBaselines.length,
          rows: athleteBaselines,
        },
        null,
        2
      )
    ),
    fs.writeFile(
      competitorPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          brandHandle: BRAND_HANDLE,
          competitors: COMPETITOR_HANDLES,
          rows: competitorRows,
        },
        null,
        2
      )
    ),
  ]);

  if (SAVE_RAW_RESPONSES) {
    await fs.mkdir(path.dirname(RAW_DUMP_PATH), { recursive: true });
    await fs.writeFile(
      RAW_DUMP_PATH,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          baseUrl: BASE_URL,
          brandHandle: BRAND_HANDLE,
          requestsCaptured: rawResponses.length,
          responses: rawResponses,
        },
        null,
        2
      )
    );
    console.log(`raw_dump: ${RAW_DUMP_PATH}`);
  }

  console.log('Done.');
  console.log(brandPostsPath);
  console.log(athleteMentionsPath);
  console.log(athleteBaselinesPath);
  console.log(competitorPath);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
