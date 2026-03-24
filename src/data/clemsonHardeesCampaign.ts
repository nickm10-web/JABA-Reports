export interface RawMetrics {
  comments?: number;
  likes?: number;
  engagementRate?: number;
  videoViews?: number;
  emv?: number;
}

interface RawDate {
  $date?: string;
}

interface RawAthlete {
  name?: string;
  sport?: string;
  position?: string;
  image?: string;
}

interface RawTeamRef {
  name?: string;
  school?: {
    name?: string;
  };
}

interface RawContentRecord {
  caption?: string;
  permalink?: string;
  url?: string;
  mediaType?: string;
  source?: string;
  sponsorPartner?: string | null;
  isSponsored?: boolean;
  isCollaboration?: boolean;
  isOrganizationCollaboration?: boolean;
  collaborationPartners?: string[];
  hasOrganizationLogo?: boolean;
  hasOrganizationInCaption?: boolean;
  likeAndViewCountsDisabled?: boolean;
  metrics?: RawMetrics;
  athlete?: RawAthlete;
  team?: RawTeamRef | string;
  originalAuthor?: string;
  publishedAt?: RawDate;
  uploadedAt?: RawDate;
  createdAt?: RawDate;
  updatedAt?: RawDate;
  comments?: Array<{
    text?: string;
    user?: {
      username?: string;
    };
    created_at?: string;
  }>;
}

export interface CampaignPost {
  permalink: string;
  label: string;
  accountLabel: string;
  accountHandle: string;
  ownerType: 'athlete' | 'team' | 'brand';
  athleteName?: string;
  sport?: string;
  teamName?: string;
  caption: string;
  imageUrl: string;
  mediaType: string;
  likes: number;
  comments: number;
  views: number;
  engagementRate: number;
  estimatedEmv: number;
  publishedAt?: string;
  isSponsored: boolean;
  sponsorPartner?: string | null;
  isCollaboration: boolean;
  isOrganizationCollaboration: boolean;
  collaborationPartners: string[];
}

export interface MirrorMetrics {
  label: string;
  likes: number;
  comments: number;
  views: number;
  engagementRate: number;
  estimatedEmv: number;
}

export interface HeroActivation extends CampaignPost {
  mirror?: MirrorMetrics;
}

export interface BenchmarkSummary {
  label: string;
  populationSize: number;
  averageLikes: number;
  averageComments: number;
  averageViews: number;
  averageEngagementRate: number;
  currentLikes: number;
  currentComments: number;
  currentViews: number;
  currentEngagementRate: number;
  currentEstimatedEmv: number;
  rankByLikes: number;
  xVsAverageLikes: number;
  bestNonCampaignLikes: number;
  xVsBestNonCampaign: number;
  campaignPostCount?: number;
}

export interface ComparisonRow {
  id: string;
  dateLabel: string;
  publishedAt?: string;
  likes: number;
  views?: number;
  engagementRate?: number;
  label: string;
  isCurrent: boolean;
  countsHidden?: boolean;
  rank?: number;
}

export interface ActivationBenchmarkView {
  recentAthletePosts?: ComparisonRow[];
  recentBrandPosts?: ComparisonRow[];
  teamPosts?: ComparisonRow[];
  athletePosts?: ComparisonRow[];
}

export interface CommentHighlight {
  permalink: string;
  text: string;
  username: string;
}

export interface ClemsonHardeesCampaignData {
  campaignMeta: {
    campaignId: string;
    schoolName: string;
    brandName: string;
    title: string;
    description: string;
    dateWindow: string;
    pullDate: string;
  };
  heroActivations: HeroActivation[];
  supportingPosts: CampaignPost[];
  accountMirrors: Record<string, MirrorMetrics | undefined>;
  campaignTotals: {
    activations: number;
    totalIncludedPosts: number;
    uniqueAthletes: number;
    likes: number;
    comments: number;
    views: number;
    estimatedEmv: number;
  };
  benchmarks: {
    hardeesBrandBenchmark: BenchmarkSummary;
    clemsonMensBasketballTeamBenchmark: BenchmarkSummary;
    clemsonWomensBasketballTeamBenchmark: BenchmarkSummary;
    aceBucknerBenchmark: BenchmarkSummary;
    hollandHarrisBenchmark: BenchmarkSummary;
    jamisonBrockenbroughBenchmark: BenchmarkSummary;
  };
  benchmarkViews: {
    ace: ActivationBenchmarkView;
    holland: ActivationBenchmarkView;
    jamison: ActivationBenchmarkView;
    hardees: ActivationBenchmarkView;
  };
  commentHighlights: CommentHighlight[];
}

const DATA_PATHS = {
  athlete: 'data/Clem.3.Athlete.contents.json',
  team: 'data/Team.clemsonBB.contents.json',
  brand: 'data/Hardee.contents.json',
  comments: 'data/hardeespost-comments.json',
} as const;

const CORE_PERMALINKS = {
  aceCollab: 'https://www.instagram.com/p/DWCIWbnDmqN',
  hollandCollab: 'https://www.instagram.com/p/DWCB-ojDvwI',
  jamisonBrand: 'https://www.instagram.com/p/DWE3Lj0jhpw',
  aceSupport: 'https://www.instagram.com/p/DV9a2SMjyDd',
  jamisonSupport: 'https://www.instagram.com/p/DVGrHtIEdWu',
} as const;

const VIEW_OVERRIDES: Record<string, number> = {
  [CORE_PERMALINKS.aceCollab]: 10700,
  [CORE_PERMALINKS.hollandCollab]: 3400,
  [CORE_PERMALINKS.jamisonBrand]: 8100,
};

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
  return toDate(record.publishedAt) || toDate(record.uploadedAt);
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function estimateEmv(likes: number, comments: number): number {
  return likes * 0.5 + comments * 1.5;
}

function resolveViews(record: RawContentRecord): number {
  const permalink = normalizePermalink(record.permalink);
  return VIEW_OVERRIDES[permalink] ?? toNumber(record.metrics?.videoViews);
}

function formatShortDate(value?: string): string {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  });
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatDateWindow(values: string[]): string {
  const dates = values
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) {
    return 'Dates unavailable';
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  const first = dates[0].toLocaleDateString('en-US', options);
  const last = dates[dates.length - 1].toLocaleDateString('en-US', options);
  return `${first} – ${last}`;
}

function formatPullDate(values: string[]): string {
  const dates = values
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  if (dates.length === 0) {
    return 'Unknown';
  }

  return dates[0].toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function findByPermalink(records: RawContentRecord[], permalink: string): RawContentRecord {
  const record = records.find((entry) => normalizePermalink(entry.permalink) === normalizePermalink(permalink));
  if (!record) {
    throw new Error(`Missing record for ${permalink}`);
  }
  return record;
}

function mapPost(record: RawContentRecord, config: {
  label: string;
  accountLabel: string;
  accountHandle: string;
  ownerType: CampaignPost['ownerType'];
  athleteName?: string;
  sport?: string;
  teamName?: string;
}): CampaignPost {
  const likes = toNumber(record.metrics?.likes);
  const comments = toNumber(record.metrics?.comments);
  const views = resolveViews(record);

  return {
    permalink: normalizePermalink(record.permalink),
    label: config.label,
    accountLabel: config.accountLabel,
    accountHandle: config.accountHandle,
    ownerType: config.ownerType,
    athleteName: config.athleteName,
    sport: config.sport,
    teamName: config.teamName,
    caption: record.caption || 'No caption available.',
    imageUrl: record.url || '',
    mediaType: record.mediaType || 'POST',
    likes,
    comments,
    views,
    engagementRate: toNumber(record.metrics?.engagementRate),
    estimatedEmv: estimateEmv(likes, comments),
    publishedAt: resolvePublishedAt(record),
    isSponsored: Boolean(record.isSponsored),
    sponsorPartner: record.sponsorPartner,
    isCollaboration: Boolean(record.isCollaboration),
    isOrganizationCollaboration: Boolean(record.isOrganizationCollaboration),
    collaborationPartners: record.collaborationPartners || [],
  };
}

function buildMirror(label: string, record: RawContentRecord): MirrorMetrics {
  const likes = toNumber(record.metrics?.likes);
  const comments = toNumber(record.metrics?.comments);
  return {
    label,
    likes,
    comments,
    views: resolveViews(record),
    engagementRate: toNumber(record.metrics?.engagementRate),
    estimatedEmv: estimateEmv(likes, comments),
  };
}

function computeBenchmark(
  label: string,
  rows: RawContentRecord[],
  currentPost: CampaignPost,
  excludePermalinks: string[] = []
): BenchmarkSummary {
  const rankedRows = [...rows].sort((a, b) => toNumber(b.metrics?.likes) - toNumber(a.metrics?.likes));
  const rankByLikes = rankedRows.findIndex(
    (row) => normalizePermalink(row.permalink) === currentPost.permalink
  ) + 1;

  const nonCampaignRows = rows.filter(
    (row) => !excludePermalinks.includes(normalizePermalink(row.permalink))
  );
  const bestNonCampaignLikes = nonCampaignRows.reduce(
    (max, row) => Math.max(max, toNumber(row.metrics?.likes)),
    0
  );
  const averageLikes = average(rows.map((row) => toNumber(row.metrics?.likes)));

  return {
    label,
    populationSize: rows.length,
    averageLikes,
    averageComments: average(rows.map((row) => toNumber(row.metrics?.comments))),
    averageViews: average(rows.map((row) => toNumber(row.metrics?.videoViews))),
    averageEngagementRate: average(rows.map((row) => toNumber(row.metrics?.engagementRate))),
    currentLikes: currentPost.likes,
    currentComments: currentPost.comments,
    currentViews: currentPost.views,
    currentEngagementRate: currentPost.engagementRate,
    currentEstimatedEmv: currentPost.estimatedEmv,
    rankByLikes: rankByLikes || 1,
    xVsAverageLikes: averageLikes > 0 ? currentPost.likes / averageLikes : 0,
    bestNonCampaignLikes,
    xVsBestNonCampaign: bestNonCampaignLikes > 0 ? currentPost.likes / bestNonCampaignLikes : 0,
  };
}

function getPublishedTime(record: RawContentRecord): number {
  const value = resolvePublishedAt(record);
  if (!value) {
    return 0;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function toComparisonRow(record: RawContentRecord, currentPermalink: string, rank?: number): ComparisonRow {
  const publishedAt = resolvePublishedAt(record);
  const teamLabel =
    typeof record.team === 'object' && record.team
      ? record.team.name
      : typeof record.team === 'string'
        ? record.team
        : undefined;

  return {
    id: normalizePermalink(record.permalink) || `${publishedAt || 'unknown'}-${toNumber(record.metrics?.likes)}`,
    dateLabel: formatShortDate(publishedAt),
    publishedAt,
    likes: toNumber(record.metrics?.likes),
    views: resolveViews(record),
    engagementRate: toNumber(record.metrics?.engagementRate),
    label: record.originalAuthor || record.athlete?.name || teamLabel || 'Instagram post',
    isCurrent: normalizePermalink(record.permalink) === normalizePermalink(currentPermalink),
    countsHidden: Boolean(record.likeAndViewCountsDisabled),
    rank,
  };
}

function buildRecentComparisonRows(
  rows: RawContentRecord[],
  currentPermalink: string,
  limit: number
): ComparisonRow[] {
  const sortedRows = [...rows].sort((a, b) => getPublishedTime(b) - getPublishedTime(a));
  const currentIndex = sortedRows.findIndex((row) => normalizePermalink(row.permalink) === normalizePermalink(currentPermalink));
  const nextRows = currentIndex >= 0
    ? sortedRows.slice(0, Math.max(limit, currentIndex + 1))
    : sortedRows.slice(0, limit);

  return nextRows.map((row, index) => toComparisonRow(row, currentPermalink, index + 1));
}

function selectCommentHighlights(rows: RawContentRecord[]): CommentHighlight[] {
  return rows
    .flatMap((row) =>
      (row.comments || []).map((comment) => ({
        permalink: normalizePermalink(row.permalink),
        text: (comment.text || '').trim(),
        username: comment.user?.username || 'instagram-user',
      }))
    )
    .filter((comment) => comment.text.length >= 2)
    .slice(0, 4);
}

export async function loadClemsonHardeesCampaign(): Promise<ClemsonHardeesCampaignData> {
  const [athleteRows, teamRows, brandRows, commentRows] = await Promise.all([
    fetchJson<RawContentRecord[]>(DATA_PATHS.athlete),
    fetchJson<RawContentRecord[]>(DATA_PATHS.team),
    fetchJson<RawContentRecord[]>(DATA_PATHS.brand),
    fetchJson<RawContentRecord[]>(DATA_PATHS.comments),
  ]);

  const aceAthlete = findByPermalink(athleteRows, CORE_PERMALINKS.aceCollab);
  const aceTeam = findByPermalink(teamRows, CORE_PERMALINKS.aceCollab);
  const hollandAthlete = findByPermalink(athleteRows, CORE_PERMALINKS.hollandCollab);
  const hollandTeam = findByPermalink(teamRows, CORE_PERMALINKS.hollandCollab);
  const jamisonBrand = findByPermalink(brandRows, CORE_PERMALINKS.jamisonBrand);
  const jamisonAthleteMirror = findByPermalink(athleteRows, CORE_PERMALINKS.jamisonBrand);
  const aceSupport = findByPermalink(athleteRows, CORE_PERMALINKS.aceSupport);
  const jamisonSupport = findByPermalink(athleteRows, CORE_PERMALINKS.jamisonSupport);

  const heroActivations: HeroActivation[] = [
    {
      ...mapPost(aceAthlete, {
        label: 'Ace Buckner x Clemson MBB x Hardee’s',
        accountLabel: 'Ace athlete post',
        accountHandle: '@acebuckner_',
        ownerType: 'athlete',
        athleteName: 'Ace Buckner',
        sport: 'Men’s Basketball',
        teamName: 'Clemson Men’s Basketball',
      }),
      mirror: buildMirror('@clemsonmbb collab mirror', aceTeam),
    },
    {
      ...mapPost(hollandAthlete, {
        label: 'Holland Harris x Clemson WBB x Hardee’s',
        accountLabel: 'Holland athlete post',
        accountHandle: '@thehollandharris',
        ownerType: 'athlete',
        athleteName: 'Holland Harris',
        sport: 'Women’s Basketball',
        teamName: 'Clemson Women’s Basketball',
      }),
      mirror: buildMirror('@clemsonwbb collab mirror', hollandTeam),
    },
    {
      ...mapPost(jamisonBrand, {
        label: 'Hardee’s x Jamison Brockenbrough',
        accountLabel: 'Hardee’s brand post',
        accountHandle: '@hardees',
        ownerType: 'brand',
        athleteName: 'Jamison Brockenbrough',
        sport: 'Softball',
        teamName: 'Hardee’s brand account',
      }),
      mirror: buildMirror('@jamison.b9 mirror', jamisonAthleteMirror),
    },
  ];

  const supportingPosts: CampaignPost[] = [
    mapPost(aceSupport, {
      label: 'Ace Buckner athlete support post',
      accountLabel: 'Ace supporting post',
      accountHandle: '@acebuckner_',
      ownerType: 'athlete',
      athleteName: 'Ace Buckner',
      sport: 'Men’s Basketball',
      teamName: 'Athlete-owned',
    }),
    mapPost(jamisonSupport, {
      label: 'Jamison athlete support post',
      accountLabel: 'Jamison supporting post',
      accountHandle: '@jamison.b9',
      ownerType: 'athlete',
      athleteName: 'Jamison Brockenbrough',
      sport: 'Softball',
      teamName: 'Athlete-owned',
    }),
  ];

  const canonicalPosts = [...heroActivations, ...supportingPosts];
  const campaignPermalinks = canonicalPosts.map((post) => post.permalink);
  const totals = canonicalPosts.reduce(
    (summary, post) => ({
      likes: summary.likes + post.likes,
      comments: summary.comments + post.comments,
      views: summary.views + post.views,
      estimatedEmv: summary.estimatedEmv + post.estimatedEmv,
    }),
    { likes: 0, comments: 0, views: 0, estimatedEmv: 0 }
  );

  const teamMensRows = teamRows.filter((row) => (typeof row.team === 'object' ? row.team?.name : row.team) === 'MENS_BASKETBALL');
  const teamWomensRows = teamRows.filter((row) => (typeof row.team === 'object' ? row.team?.name : row.team) === 'WOMENS_BASKETBALL');
  const hardeesCollabRows = brandRows.filter((row) => row.isCollaboration);
  const aceRows = athleteRows.filter((row) => row.athlete?.name === 'Ace Buckner');
  const hollandRows = athleteRows.filter((row) => row.athlete?.name === 'Holland Harris');
  const jamisonRows = athleteRows.filter((row) => row.athlete?.name === 'Jamison Brockenbrough');

  const hardeesBrandBenchmark = {
    ...computeBenchmark(
      'Hardee’s brand benchmark',
      brandRows,
      heroActivations[2],
      campaignPermalinks
    ),
    campaignPostCount: hardeesCollabRows.length,
  };

  const commentSourceRows = commentRows.filter((row) =>
    [CORE_PERMALINKS.aceCollab, CORE_PERMALINKS.hollandCollab, CORE_PERMALINKS.jamisonBrand]
      .map(normalizePermalink)
      .includes(normalizePermalink(row.permalink))
  );

  const dateValues = canonicalPosts
    .map((post) => post.publishedAt)
    .filter((value): value is string => Boolean(value));

  const pullDateValues = [...athleteRows, ...teamRows, ...brandRows]
    .map((row) => toDate(row.updatedAt) || toDate(row.createdAt))
    .filter((value): value is string => Boolean(value));

  return {
    campaignMeta: {
      campaignId: 'clemson-hardees',
      schoolName: 'Clemson',
      brandName: 'Hardee’s',
      title: 'Clemson x Hardee’s Content Performance Report',
      description: 'A performance report for the identified Hardee’s x Clemson posts currently included in this dataset, spanning men’s basketball, women’s basketball, softball, athlete-owned posts, and Hardee’s brand-owned distribution.',
      dateWindow: formatDateWindow(dateValues),
      pullDate: formatPullDate(pullDateValues),
    },
    heroActivations,
    supportingPosts,
    accountMirrors: {
      [heroActivations[0].permalink]: heroActivations[0].mirror,
      [heroActivations[1].permalink]: heroActivations[1].mirror,
      [heroActivations[2].permalink]: heroActivations[2].mirror,
    },
    campaignTotals: {
      activations: heroActivations.length,
      totalIncludedPosts: canonicalPosts.length,
      uniqueAthletes: 3,
      ...totals,
    },
    benchmarks: {
      hardeesBrandBenchmark,
      clemsonMensBasketballTeamBenchmark: computeBenchmark(
        'Clemson Men’s Basketball benchmark',
        teamMensRows,
        buildMirror('@clemsonmbb collab mirror', aceTeam) as CampaignPost,
        [normalizePermalink(CORE_PERMALINKS.aceCollab)]
      ),
      clemsonWomensBasketballTeamBenchmark: computeBenchmark(
        'Clemson Women’s Basketball benchmark',
        teamWomensRows,
        buildMirror('@clemsonwbb collab mirror', hollandTeam) as CampaignPost,
        [normalizePermalink(CORE_PERMALINKS.hollandCollab)]
      ),
      aceBucknerBenchmark: {
        ...computeBenchmark('Ace Buckner benchmark', aceRows, heroActivations[0], campaignPermalinks),
        campaignPostCount: aceRows.filter((row) => /hardee/i.test(row.caption || '') || /hardee/i.test(row.sponsorPartner || '')).length,
      },
      hollandHarrisBenchmark: {
        ...computeBenchmark('Holland Harris benchmark', hollandRows, heroActivations[1], campaignPermalinks),
        campaignPostCount: hollandRows.filter((row) => /hardee/i.test(row.caption || '') || /hardee/i.test(row.sponsorPartner || '')).length,
      },
      jamisonBrockenbroughBenchmark: {
        ...computeBenchmark(
          'Jamison Brockenbrough benchmark',
          jamisonRows,
          supportingPosts[1],
          campaignPermalinks
        ),
        campaignPostCount: jamisonRows.filter((row) => /hardee/i.test(row.caption || '') || /hardee/i.test(row.sponsorPartner || '')).length,
      },
    },
    benchmarkViews: {
      ace: {
        recentAthletePosts: buildRecentComparisonRows(aceRows, CORE_PERMALINKS.aceCollab, 12),
        teamPosts: buildRecentComparisonRows(teamMensRows, CORE_PERMALINKS.aceCollab, 12),
      },
      holland: {
        recentAthletePosts: buildRecentComparisonRows(hollandRows, CORE_PERMALINKS.hollandCollab, 12),
        teamPosts: buildRecentComparisonRows(teamWomensRows, CORE_PERMALINKS.hollandCollab, 12),
      },
      jamison: {
        athletePosts: buildRecentComparisonRows(jamisonRows, CORE_PERMALINKS.jamisonBrand, 12),
      },
      hardees: {
        recentBrandPosts: buildRecentComparisonRows(brandRows, CORE_PERMALINKS.jamisonBrand, 12),
      },
    },
    commentHighlights: selectCommentHighlights(commentSourceRows),
  };
}
