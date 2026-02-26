const SCRAPECREATORS_BASE_URL =
  (import.meta.env.VITE_SCRAPECREATORS_BASE_URL || 'https://api.scrapecreators.com').replace(/\/+$/, '');

const SCRAPECREATORS_API_KEY = import.meta.env.VITE_SCRAPECREATORS_API_KEY || '';

export interface ScrapeCreatorsRequestOptions {
  username: string;
  limit?: number;
  cursor?: string;
}

type AnyRecord = Record<string, unknown>;

function buildUrl(path: string, params: Record<string, string | number | undefined>) {
  const url = new URL(`${SCRAPECREATORS_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

function getHeaders(): HeadersInit {
  if (!SCRAPECREATORS_API_KEY) {
    return {};
  }

  return {
    'x-api-key': SCRAPECREATORS_API_KEY,
    Authorization: `Bearer ${SCRAPECREATORS_API_KEY}`,
  };
}

async function callScrapeCreators(path: string, options: ScrapeCreatorsRequestOptions): Promise<AnyRecord> {
  const url = buildUrl(path, {
    handle: options.username,
    username: options.username,
    user: options.username,
    limit: options.limit,
    cursor: options.cursor,
  });

  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ScrapeCreators API error (${response.status}): ${body.slice(0, 300)}`);
  }
  return (await response.json()) as AnyRecord;
}

function extractItems(payload: AnyRecord): AnyRecord[] {
  const candidates = [payload.data, payload.items, payload.posts, payload.reels, payload.results];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as AnyRecord[];
    }
  }
  return [];
}

export interface ScrapeCreatorsFeedResponse {
  raw: AnyRecord;
  items: AnyRecord[];
}

export async function fetchInstagramUserPosts(
  options: ScrapeCreatorsRequestOptions
): Promise<ScrapeCreatorsFeedResponse> {
  const raw = await callScrapeCreators('/v2/instagram/user/posts', options);
  return { raw, items: extractItems(raw) };
}

export async function fetchInstagramUserReels(
  options: ScrapeCreatorsRequestOptions
): Promise<ScrapeCreatorsFeedResponse> {
  const raw = await callScrapeCreators('/v1/instagram/user/reels', options);
  return { raw, items: extractItems(raw) };
}

export async function fetchInstagramUserContent(options: ScrapeCreatorsRequestOptions) {
  const [posts, reels] = await Promise.all([
    fetchInstagramUserPosts(options),
    fetchInstagramUserReels(options),
  ]);

  return {
    posts,
    reels,
    allItems: [...posts.items, ...reels.items],
  };
}

export function buildScrapeCreatorsAIPrompt() {
  const key = SCRAPECREATORS_API_KEY || 'YOUR_SCRAPECREATORS_API_KEY';

  return [
    'You are integrating ScrapeCreators Instagram endpoints.',
    '',
    'Base URL:',
    `${SCRAPECREATORS_BASE_URL}`,
    '',
    'Authentication:',
    '- Send header `x-api-key: <API_KEY>`',
    '- Also send `Authorization: Bearer <API_KEY>` for compatibility',
    '',
    'Endpoints:',
    '- GET /v2/instagram/user/posts',
    '- GET /v1/instagram/user/reels',
    '',
    'Common query params to send:',
    '- handle (required by some endpoint versions)',
    '- username (required)',
    '- limit (optional)',
    '- cursor (optional)',
    '- user (alias of username for compatibility)',
    '',
    'Expected response parsing strategy:',
    '- Primary list keys to check in this order: data, items, posts, reels, results',
    '- Return empty list if none are present',
    '',
    'TypeScript fetch helper:',
    '```ts',
    `const headers = { "x-api-key": "${key}", "Authorization": "Bearer ${key}" };`,
    '```',
    '',
    'Implementation requirements:',
    '- Fetch posts + reels in parallel',
    '- Normalize into `{ posts, reels, allItems }`',
    '- Include robust error handling with HTTP status + truncated body',
    '- Keep raw payload and parsed item list',
  ].join('\n');
}
