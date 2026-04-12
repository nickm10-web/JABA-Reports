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
    permalink: 'https://www.instagram.com/p/DUjqxYcj-V0',
    athleteName: 'Mya Perry',
    label: 'Mya Perry x Fifth Third Bank',
  },
  {
    permalink: 'https://www.instagram.com/p/DUUUj7EDHpH',
    athleteName: 'Mya Perry',
    label: 'Mya Perry x Team53',
  },
] as const;

function buildPublicPath(relativePath: string): string {
  return `${import.meta.env.BASE_URL}${relativePath}`;
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
  const views = toNumber(record.metrics?.videoViews);

  return {
    permalink: normalizePermalink(record.permalink),
    label,
    athleteName: record.athlete?.name || 'Unknown athlete',
    athleteImageUrl: record.athlete?.image || '',
    sport: record.athlete?.sport || 'Unknown sport',
    caption: record.caption || 'No caption available.',
    imageUrl: record.url || '',
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

export async function loadCincinnatiFifthThirdCampaign(): Promise<CincinnatiFifthThirdCampaignData> {
  const [athleteRows, brandRows] = await Promise.all([
    fetchJson<RawContentRecord[]>(DATA_PATHS.athlete),
    fetchJson<RawBrandRecord[]>(DATA_PATHS.brands),
  ]);

  const cincinnatiRows = athleteRows.filter((row) => row.athlete?.school?.name === SCHOOL_NAME);
  const campaignPermalinks = new Set(CAMPAIGN_POSTS.map((post) => normalizePermalink(post.permalink)));

  const heroActivations = CAMPAIGN_POSTS.map((post) => {
    const record = findCampaignRecord(cincinnatiRows, post.permalink);
    return mapPost(record, post.label);
  });

  const schoolDates = heroActivations
    .map((post) => post.publishedAt)
    .filter((value): value is string => Boolean(value));

  const schoolLogoUrl = 'https://a.espncdn.com/i/teamlogos/ncaa/500/2132.png';
  const brandLogoUrl = brandRows.find((row) => String(row.name || '').toLowerCase() === BRAND_HANDLE)?.logo;

  const tylerRows = cincinnatiRows.filter((row) => row.athlete?.name === 'Tyler McKinley');
  const myaRows = cincinnatiRows.filter((row) => row.athlete?.name === 'Mya Perry');

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
