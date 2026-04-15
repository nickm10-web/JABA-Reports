interface RawMetrics {
  comments?: number;
  likes?: number;
  engagementRate?: number;
  videoViews?: number;
}

interface RawDate {
  $date?: string;
}

interface RawAthlete {
  name?: string;
  image?: string;
  sport?: string;
  school?: {
    name?: string;
  };
}

interface RawContentRecord {
  athlete?: RawAthlete;
  caption?: string;
  createdAt?: RawDate;
  mediaType?: string;
  metrics?: RawMetrics;
  permalink?: string;
  publishedAt?: RawDate;
  sponsorPartner?: string | null;
  url?: string;
}

interface RawBrandRecord {
  name?: string;
  logo?: string;
}

interface ScrapedCaptionEdge {
  node?: {
    text?: string;
  };
}

interface ScrapedTaggedUserEdge {
  node?: {
    user?: {
      username?: string;
    };
  };
}

interface ScrapedMediaNode {
  __typename?: string;
  shortcode?: string;
  thumbnail_src?: string;
  display_url?: string;
  is_video?: boolean;
  video_view_count?: number;
  video_play_count?: number;
  taken_at_timestamp?: number;
  owner?: {
    username?: string;
  };
  edge_media_to_caption?: {
    edges?: ScrapedCaptionEdge[];
  };
  edge_media_preview_like?: {
    count?: number;
  };
  edge_media_to_parent_comment?: {
    count?: number;
  };
  edge_media_to_tagged_user?: {
    edges?: ScrapedTaggedUserEdge[];
  };
}

interface ScrapedInstagramRecord {
  data?: {
    xdt_shortcode_media?: ScrapedMediaNode;
  };
}

export interface CampaignPost {
  permalink: string;
  label: string;
  athleteName: string;
  athleteImageUrl: string;
  sport: string;
  caption: string;
  imageUrl: string;
  mediaType: string;
  likes: number;
  comments: number;
  views: number;
  engagementRate: number;
  estimatedEmv: number;
  publishedAt?: string;
}

export interface HeroActivation extends CampaignPost {}

export interface BenchmarkSummary {
  label: string;
  populationSize: number;
  campaignPostCount: number;
  averageLikes: number;
  averageComments: number;
  averageViews: number;
  averageEngagementRate: number;
  averageEmv: number;
  campaignAverageLikes: number;
  campaignAverageComments: number;
  campaignAverageViews: number;
  campaignAverageEngagementRate: number;
  campaignAverageEmv: number;
  liftVsAverageLikes: number;
  liftVsAverageComments: number;
  liftVsAverageViews: number;
  liftVsAverageEmv: number;
}

export interface ComparisonRow {
  id: string;
  dateLabel: string;
  publishedAt?: string;
  likes: number;
  comments: number;
  views: number;
  engagementRate: number;
  label: string;
  isCurrent: boolean;
}

export interface CincinnatiFifthThirdCampaignData {
  campaignMeta: {
    campaignId: string;
    schoolName: string;
    brandName: string;
    title: string;
    description: string;
    dateWindow: string;
    pullDate: string;
    schoolLogoUrl?: string;
    brandLogoUrl?: string;
  };
  heroActivations: HeroActivation[];
  campaignTotals: {
    activations: number;
    totalIncludedPosts: number;
    uniqueAthletes: number;
    likes: number;
    comments: number;
    views: number;
    estimatedEmv: number;
  };
  athleteBenchmarks: {
    tylerMcKinley: BenchmarkSummary;
    myaPerry: BenchmarkSummary;
  };
  brandBenchmark: BenchmarkSummary;
  benchmarkViews: {
    tylerMcKinley: {
      recentPosts: ComparisonRow[];
    };
    myaPerry: {
      recentPosts: ComparisonRow[];
    };
  };
  methodologyNotes: string[];
}

const DATA_PATHS = {
  athlete: 'data/ncaa_roster_updated_feb_17.json',
  brands: 'data/socialMedia.brands.json',
  posts: 'data/posts.json',
  team53Posts: 'data/team53posts.json',
} as const;

const SCHOOL_NAME = 'University of Cincinnati';
const BRAND_HANDLE = '@fifththirdbank';
const RECENT_BASELINE_LIMIT = 12;

const CAMPAIGN_POSTS = [
  {
    permalink: 'https://www.instagram.com/p/DUq_-WwkdtZ',
    athleteName: 'Tyler McKinley',
    label: 'Tyler McKinley x Fifth Third Bank',
  },
  {
    permalink: 'https://www.instagram.com/p/DUW2QsHkf1t',
    athleteName: 'Tyler McKinley',
    label: 'Tyler McKinley x Fifth Third Better',
  },
  {
    permalink: 'https://www.instagram.com/p/DVICYH_jmyk',
    athleteName: 'Tyler McKinley',
    label: 'Tyler McKinley x Fifth Third Better',
  },
  {
    permalink: 'https://www.instagram.com/p/DVtHFLOuiw8',
    athleteName: 'Tyler McKinley',
    label: 'Tyler McKinley x Fifth Third Hometown Story',
  },
  {
    permalink: 'https://www.instagram.com/p/DUjqxYcj-V0',
    athleteName: 'Mya Perry',
    label: 'Mya Perry x Fifth Third Bank',
  },
  {
    permalink: 'https://www.instagram.com/p/DUUUj7EDHpH',
    athleteName: 'Mya Perry',
    label: 'Mya Perry x Team53',
  },
  {
    permalink: 'https://www.instagram.com/p/DU647X1D6a4',
    athleteName: 'Mya Perry',
    label: 'Mya Perry x Fifth Third Better',
  },
  {
    permalink: 'https://www.instagram.com/p/DVw5NjJj_7J',
    athleteName: 'Mya Perry',
    label: 'Mya Perry x Cincinnati Love Letter',
  },
] as const;

const LOCAL_POST_IMAGE_OVERRIDES: Record<string, string> = {
  'https://www.instagram.com/p/DVICYH_jmyk': 'images/campaigns/cincinnati-fifth-third/tyler-mckinley-fifth-third-better.jpg',
  'https://www.instagram.com/p/DVtHFLOuiw8': 'images/campaigns/cincinnati-fifth-third/tyler-mckinley-fifth-third-hometown-story.png',
  'https://www.instagram.com/p/DU647X1D6a4': 'images/campaigns/cincinnati-fifth-third/mya-perry-fifth-third-better.jpg',
  'https://www.instagram.com/p/DVw5NjJj_7J': 'images/campaigns/cincinnati-fifth-third/mya-perry-cincinnati-love-letter.jpg',
};

const CAMPAIGN_VIEW_OVERRIDES: Record<string, number> = {
  'https://www.instagram.com/p/DUq_-WwkdtZ': 7076,
  'https://www.instagram.com/p/DUW2QsHkf1t': 9224,
  'https://www.instagram.com/p/DVICYH_jmyk': 6155,
  'https://www.instagram.com/p/DVtHFLOuiw8': 739000,
  'https://www.instagram.com/p/DUjqxYcj-V0': 9104,
  'https://www.instagram.com/p/DUUUj7EDHpH': 9014,
  'https://www.instagram.com/p/DU647X1D6a4': 82200,
  'https://www.instagram.com/p/DVw5NjJj_7J': 8460,
};

const LOCAL_ATHLETE_IMAGE_OVERRIDES: Record<string, string> = {
  'Tyler McKinley': 'tmckinley.png',
  'Mya Perry': 'images/campaigns/cincinnati-fifth-third/mya-perry-headshot.png',
};

const SCRAPED_ATHLETE_BY_OWNER: Record<string, Pick<RawAthlete, 'name' | 'sport'>> = {
  txm35: {
    name: 'Tyler McKinley',
    sport: 'MENS_BASKETBALL',
  },
  myawittamac: {
    name: 'Mya Perry',
    sport: 'WOMENS_BASKETBALL',
  },
};

function buildPublicPath(relativePath: string): string {
  const basePath = import.meta.env.BASE_URL || '/';
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  return `${normalizedBase}${relativePath.replace(/^\/+/, '')}`;
}

async function fetchJson<T>(relativePath: string): Promise<T> {
  const response = await fetch(buildPublicPath(relativePath));
  if (!response.ok) {
    throw new Error(`Failed to load ${relativePath}`);
  }
  return response.json() as Promise<T>;
}

function normalizePermalink(value: string | undefined): string {
  return String(value || '').replace(/\/$/, '');
}

function toDate(value?: RawDate): string | undefined {
  return value?.$date;
}

function resolvePublishedAt(record: RawContentRecord): string | undefined {
  return toDate(record.publishedAt) || toDate(record.createdAt);
}

function toIsoFromUnix(value: unknown): string | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return new Date(value * 1000).toISOString();
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function estimateEmv(likes: number, comments: number): number {
  return likes * 0.5 + comments * 1.5;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentLift(current: number, baseline: number): number {
  if (baseline <= 0) return 0;
  return ((current - baseline) / baseline) * 100;
}

function formatShortDate(value?: string): string {
  if (!value) return 'Unknown';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
}

function formatDateWindow(values: string[]): string {
  const dates = values
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return 'Dates unavailable';

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  return `${dates[0].toLocaleDateString('en-US', options)} – ${dates[dates.length - 1].toLocaleDateString('en-US', options)}`;
}

function formatPullDate(values: string[]): string {
  const dates = values
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  if (dates.length === 0) return 'Unknown';

  return dates[0].toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function mapPost(record: RawContentRecord, label: string): CampaignPost {
  const likes = toNumber(record.metrics?.likes);
  const comments = toNumber(record.metrics?.comments);
  const normalizedPermalink = normalizePermalink(record.permalink);
  const views = CAMPAIGN_VIEW_OVERRIDES[normalizedPermalink] ?? toNumber(record.metrics?.videoViews);
  const localImagePath = LOCAL_POST_IMAGE_OVERRIDES[normalizedPermalink];
  const athleteName = record.athlete?.name || 'Unknown athlete';
  const athleteImagePath = LOCAL_ATHLETE_IMAGE_OVERRIDES[athleteName];

  return {
    permalink: normalizedPermalink,
    label,
    athleteName,
    athleteImageUrl: athleteImagePath ? buildPublicPath(athleteImagePath) : (record.athlete?.image || ''),
    sport: record.athlete?.sport || 'Unknown sport',
    caption: record.caption || 'No caption available.',
    imageUrl: localImagePath ? buildPublicPath(localImagePath) : (record.url || ''),
    mediaType: record.mediaType || 'POST',
    likes,
    comments,
    views,
    engagementRate: toNumber(record.metrics?.engagementRate),
    estimatedEmv: estimateEmv(likes, comments),
    publishedAt: resolvePublishedAt(record),
  };
}

function buildBenchmarkSummary(
  label: string,
  campaignPosts: CampaignPost[],
  baselineRows: RawContentRecord[],
): BenchmarkSummary {
  const baselineLikes = baselineRows.map((row) => toNumber(row.metrics?.likes));
  const baselineComments = baselineRows.map((row) => toNumber(row.metrics?.comments));
  const baselineViews = baselineRows.map((row) => toNumber(row.metrics?.videoViews));
  const baselineEngagement = baselineRows.map((row) => toNumber(row.metrics?.engagementRate));
  const baselineEmv = baselineRows.map((row) => estimateEmv(toNumber(row.metrics?.likes), toNumber(row.metrics?.comments)));

  const campaignLikes = campaignPosts.map((post) => post.likes);
  const campaignComments = campaignPosts.map((post) => post.comments);
  const campaignViews = campaignPosts.map((post) => post.views);
  const campaignEngagement = campaignPosts.map((post) => post.engagementRate);
  const campaignEmv = campaignPosts.map((post) => post.estimatedEmv);

  const averageLikes = average(baselineLikes);
  const averageComments = average(baselineComments);
  const averageViews = average(baselineViews);
  const averageEngagementRate = average(baselineEngagement);
  const averageEmv = average(baselineEmv);

  const campaignAverageLikes = average(campaignLikes);
  const campaignAverageComments = average(campaignComments);
  const campaignAverageViews = average(campaignViews);
  const campaignAverageEngagementRate = average(campaignEngagement);
  const campaignAverageEmv = average(campaignEmv);

  return {
    label,
    populationSize: baselineRows.length,
    campaignPostCount: campaignPosts.length,
    averageLikes,
    averageComments,
    averageViews,
    averageEngagementRate,
    averageEmv,
    campaignAverageLikes,
    campaignAverageComments,
    campaignAverageViews,
    campaignAverageEngagementRate,
    campaignAverageEmv,
    liftVsAverageLikes: percentLift(campaignAverageLikes, averageLikes),
    liftVsAverageComments: percentLift(campaignAverageComments, averageComments),
    liftVsAverageViews: percentLift(campaignAverageViews, averageViews),
    liftVsAverageEmv: percentLift(campaignAverageEmv, averageEmv),
  };
}

function buildRecentComparisonRows(
  athleteRows: RawContentRecord[],
  campaignPermalinks: Set<string>,
  limit: number,
): ComparisonRow[] {
  const sortedRows = [...athleteRows].sort((a, b) => {
    const aTime = new Date(resolvePublishedAt(a) || 0).getTime();
    const bTime = new Date(resolvePublishedAt(b) || 0).getTime();
    return bTime - aTime;
  });

  const campaignIndexes = sortedRows
    .map((row, index) => (campaignPermalinks.has(normalizePermalink(row.permalink)) ? index : -1))
    .filter((index) => index >= 0);

  const inclusiveCount = campaignIndexes.length > 0
    ? Math.max(limit, Math.max(...campaignIndexes) + 1)
    : limit;

  return sortedRows.slice(0, inclusiveCount).map((row) => ({
    id: normalizePermalink(row.permalink) || `${resolvePublishedAt(row) || 'unknown'}-${toNumber(row.metrics?.likes)}`,
    dateLabel: formatShortDate(resolvePublishedAt(row)),
    publishedAt: resolvePublishedAt(row),
    likes: toNumber(row.metrics?.likes),
    comments: toNumber(row.metrics?.comments),
    views: toNumber(row.metrics?.videoViews),
    engagementRate: toNumber(row.metrics?.engagementRate),
    label: row.athlete?.name || 'Instagram post',
    isCurrent: campaignPermalinks.has(normalizePermalink(row.permalink)),
  }));
}

function findCampaignRecord(records: RawContentRecord[], permalink: string): RawContentRecord {
  const record = records.find((entry) => normalizePermalink(entry.permalink) === normalizePermalink(permalink));
  if (!record) {
    throw new Error(`Missing campaign record for ${permalink}`);
  }
  return record;
}

function mapScrapedPost(record: ScrapedInstagramRecord): RawContentRecord | null {
  const media = record.data?.xdt_shortcode_media;
  const shortcode = media?.shortcode;
  if (!shortcode) return null;

  const taggedUsers = media.edge_media_to_tagged_user?.edges?.map((edge) => edge.node?.user?.username?.toLowerCase()).filter(Boolean) || [];
  const caption = media.edge_media_to_caption?.edges?.[0]?.node?.text || '';
  const ownerUsername = media.owner?.username?.toLowerCase() || '';
  const athlete = SCRAPED_ATHLETE_BY_OWNER[ownerUsername];

  if (!taggedUsers.includes('fifththirdbank')) return null;
  if (!athlete) return null;

  return {
    athlete: {
      name: athlete.name,
      image: '',
      sport: athlete.sport,
      school: {
        name: SCHOOL_NAME,
      },
    },
    caption,
    createdAt: undefined,
    mediaType: media.is_video || media.__typename === 'XDTGraphVideo' ? 'VIDEO' : 'POST',
    metrics: {
      likes: toNumber(media.edge_media_preview_like?.count),
      comments: toNumber(media.edge_media_to_parent_comment?.count),
      engagementRate: 0,
      videoViews: toNumber(media.video_view_count ?? media.video_play_count),
    },
    permalink: `https://www.instagram.com/p/${shortcode}`,
    publishedAt: (() => {
      const iso = toIsoFromUnix(media.taken_at_timestamp);
      return iso ? { $date: iso } : undefined;
    })(),
    sponsorPartner: BRAND_HANDLE,
    url: media.display_url || media.thumbnail_src || '',
  };
}

function mergeRecordsByPermalink(primary: RawContentRecord[], supplemental: RawContentRecord[]): RawContentRecord[] {
  const merged = new Map<string, RawContentRecord>();

  for (const row of primary) {
    merged.set(normalizePermalink(row.permalink), row);
  }

  for (const row of supplemental) {
    const key = normalizePermalink(row.permalink);
    if (!merged.has(key)) {
      merged.set(key, row);
    }
  }

  return [...merged.values()];
}

export async function loadCincinnatiFifthThirdCampaign(): Promise<CincinnatiFifthThirdCampaignData> {
  const [athleteRows, brandRows, scrapedRows, team53Rows] = await Promise.all([
    fetchJson<RawContentRecord[]>(DATA_PATHS.athlete),
    fetchJson<RawBrandRecord[]>(DATA_PATHS.brands),
    fetchJson<ScrapedInstagramRecord[]>(DATA_PATHS.posts),
    fetchJson<ScrapedInstagramRecord[]>(DATA_PATHS.team53Posts),
  ]);

  const cincinnatiRows = athleteRows.filter((row) => row.athlete?.school?.name === SCHOOL_NAME);
  const supplementalRows = [...scrapedRows, ...team53Rows]
    .map(mapScrapedPost)
    .filter((row): row is RawContentRecord => Boolean(row));
  const mergedCincinnatiRows = mergeRecordsByPermalink(cincinnatiRows, supplementalRows);
  const campaignPermalinks = new Set(CAMPAIGN_POSTS.map((post) => normalizePermalink(post.permalink)));

  const heroActivations = CAMPAIGN_POSTS.map((post) => {
    const record = findCampaignRecord(mergedCincinnatiRows, post.permalink);
    return mapPost(record, post.label);
  });

  const schoolDates = heroActivations
    .map((post) => post.publishedAt)
    .filter((value): value is string => Boolean(value));

  const schoolLogoUrl = 'https://a.espncdn.com/i/teamlogos/ncaa/500/2132.png';
  const brandLogoUrl = brandRows.find((row) => String(row.name || '').toLowerCase() === BRAND_HANDLE)?.logo;

  const tylerRows = mergedCincinnatiRows.filter((row) => row.athlete?.name === 'Tyler McKinley');
  const myaRows = mergedCincinnatiRows.filter((row) => row.athlete?.name === 'Mya Perry');

  const tylerCampaign = heroActivations.filter((post) => post.athleteName === 'Tyler McKinley');
  const myaCampaign = heroActivations.filter((post) => post.athleteName === 'Mya Perry');

  const tylerBaseline = tylerRows
    .filter((row) => !campaignPermalinks.has(normalizePermalink(row.permalink)))
    .sort((a, b) => new Date(resolvePublishedAt(b) || 0).getTime() - new Date(resolvePublishedAt(a) || 0).getTime())
    .slice(0, RECENT_BASELINE_LIMIT);

  const myaBaseline = myaRows
    .filter((row) => !campaignPermalinks.has(normalizePermalink(row.permalink)))
    .sort((a, b) => new Date(resolvePublishedAt(b) || 0).getTime() - new Date(resolvePublishedAt(a) || 0).getTime())
    .slice(0, RECENT_BASELINE_LIMIT);

  const athleteBenchmarks = {
    tylerMcKinley: buildBenchmarkSummary('Tyler McKinley recent non-campaign baseline', tylerCampaign, tylerBaseline),
    myaPerry: buildBenchmarkSummary('Mya Perry recent non-campaign baseline', myaCampaign, myaBaseline),
  };

  const brandBenchmark = buildBenchmarkSummary(
    'Included Fifth Third campaign average',
    heroActivations,
    heroActivations.map((post) => ({
      athlete: { name: post.athleteName, sport: post.sport, image: post.athleteImageUrl, school: { name: SCHOOL_NAME } },
      caption: post.caption,
      mediaType: post.mediaType,
      metrics: {
        likes: post.likes,
        comments: post.comments,
        videoViews: post.views,
        engagementRate: post.engagementRate,
      },
      permalink: post.permalink,
      publishedAt: post.publishedAt ? { $date: post.publishedAt } : undefined,
      url: post.imageUrl,
    })),
  );

  return {
    campaignMeta: {
      campaignId: 'cincinnati-fifth-third-campaign',
      schoolName: SCHOOL_NAME,
      brandName: 'Fifth Third Bank',
      title: 'Cincinnati x Fifth Third Bank Campaign Report',
      description: 'Athlete-owned Cincinnati activations currently verified in the local Fifth Third campaign dataset.',
      dateWindow: formatDateWindow(schoolDates),
      pullDate: formatPullDate(schoolDates),
      schoolLogoUrl,
      brandLogoUrl,
    },
    heroActivations,
    campaignTotals: {
      activations: heroActivations.length,
      totalIncludedPosts: heroActivations.length,
      uniqueAthletes: new Set(heroActivations.map((post) => post.athleteName)).size,
      likes: heroActivations.reduce((sum, post) => sum + post.likes, 0),
      comments: heroActivations.reduce((sum, post) => sum + post.comments, 0),
      views: heroActivations.reduce((sum, post) => sum + post.views, 0),
      estimatedEmv: heroActivations.reduce((sum, post) => sum + post.estimatedEmv, 0),
    },
    athleteBenchmarks,
    brandBenchmark,
    benchmarkViews: {
      tylerMcKinley: {
        recentPosts: buildRecentComparisonRows(tylerRows, campaignPermalinks, RECENT_BASELINE_LIMIT),
      },
      myaPerry: {
        recentPosts: buildRecentComparisonRows(myaRows, campaignPermalinks, RECENT_BASELINE_LIMIT),
      },
    },
    methodologyNotes: [
      'This report includes only athlete-owned Cincinnati x Fifth Third activations currently verified in the local raw dataset.',
      'The canonical campaign set is fixed to 4 athlete-owned posts across Tyler McKinley and Mya Perry.',
      'Athlete benchmarks use each athlete’s most recent non-campaign posts, excluding the included campaign permalinks.',
      'The Fifth Third benchmark is the included campaign-post average for this verified local campaign set, not overall Fifth Third account performance.',
    ],
  };
}
