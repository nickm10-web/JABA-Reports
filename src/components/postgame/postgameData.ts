/**
 * Postgame report data foundation.
 *
 * TODO(live-data): replace `MOCK_SPONSORED_RECORDS` with records from:
 * - imported JSON (`all_roster_sponsored.json`) or
 * - internal API fetch in a data loader.
 */

export type BrandKey =
  | 'CVS'
  | 'Hollister'
  | 'Adidas'
  | 'All-State'
  | 'Hey Dude'
  | 'C4'
  | 'Crocs'
  | 'Stanley'
  | '7/11';

export interface DateField {
  $date: string;
}

export interface SponsoredAthleteEntity {
  _id: string;
  name: string;
  sport?: string;
  position?: string;
  year?: string;
  image?: string;
  bio?: string;
  school?: { _id?: string; name?: string };
  conference?: { _id?: string; name?: string };
  league?: { _id?: string; name?: string };
}

export interface SponsoredMetrics {
  likes: number;
  comments: number;
  engagementRate: number;
  shares?: number;
  saves?: number;
  impressions?: number;
  followers?: number;
  totalInteractions?: number;
  accountsEngaged?: number;
  videoViews?: number;
  reach?: number;
  profileLinksTaps?: number;
  emv?: number;
}

export interface SponsoredRecord {
  _id: string;
  athlete: SponsoredAthleteEntity;
  caption?: string;
  hashtags?: string[];
  metrics: SponsoredMetrics;
  sponsorPartner?: string;
  permalink?: string;
  url?: string;
  source?: string;
  mediaType?: string;
  isSponsored?: boolean;
  sponsored?: boolean;
  isCollaboration?: boolean;
  isOrganizationCollaboration?: boolean;
  hasOrganizationInCaption?: boolean;
  hasOrganizationLogo?: boolean;
  likeAndViewCountsDisabled?: boolean;
  publishedAt?: string | DateField;
  createdAt?: string | DateField;
  updatedAt?: string | DateField;
}

export interface BrandDefinition {
  displayName: string;
  aliases: string[];
  handleAliases?: string[];
  domainAliases?: string[];
  hashtagAliases?: string[];
}

export interface BrandSummary {
  brandKey: BrandKey;
  displayName: string;
  activeCampaigns: number;
  posts: number;
  athletes: number;
  totalLikes: number;
  totalComments: number;
  totalInteractions: number;
  avgEngagementRate: number;
  estimatedEmv: number;
}

export interface AthleteSummary {
  athleteId: string;
  athleteName: string;
  sport: string;
  conference: string;
  school: string;
  postCount: number;
  totalLikes: number;
  totalComments: number;
  totalInteractions: number;
  avgEngagementRate: number;
  totalEmv: number;
}

export interface TopPost {
  recordId: string;
  athleteId: string;
  athleteName: string;
  sport: string;
  school: string;
  conference: string;
  mediaType: string;
  sponsorPartner?: string;
  caption?: string;
  permalink?: string;
  publishedAt?: string;
  likes: number;
  comments: number;
  videoViews: number;
  videoViewsEstimated: boolean;
  emv: number;
  emvEstimated: boolean;
  totalInteractions: number;
  totalInteractionsEstimated: boolean;
  engagementRate: number;
}

export type OverlapMatrix = Record<string, Partial<Record<BrandKey, number>>>;

export interface BrandInsightStats {
  topMediaType: string;
  topSport: string;
  topConference: string;
  topPattern: string;
  topPatternShare: number;
}

export interface BrandOutputs {
  brandSummaries: Record<BrandKey, BrandSummary>;
  athletesByBrand: Record<BrandKey, AthleteSummary[]>;
  topPostsByBrand: Record<BrandKey, TopPost[]>;
  recordsByBrand: Record<BrandKey, SponsoredRecord[]>;
  insightStatsByBrand: Record<BrandKey, BrandInsightStats>;
  overlapMatrix: OverlapMatrix;
}

export interface TalentAthleteRow {
  athleteId: string;
  athleteName: string;
  sport: string;
  school: string;
  conference: string;
  followers: number;
  avgEngagementRate: number;
  sponsoredPostsForBrand: number;
  fitScore: number;
  totalEmvForBrand: number;
}

export type SponsorCategory =
  | 'footwear'
  | 'apparel'
  | 'beverage'
  | 'convenience'
  | 'insurance'
  | 'retail'
  | 'other';

export interface MonitorPostRow {
  recordId: string;
  athleteId: string;
  athleteName: string;
  sport: string;
  school: string;
  publishedAt?: string;
  caption?: string;
  mediaType: string;
  mediaUrl?: string;
  permalink?: string;
  isCollaboration: boolean;
  sponsorPartner: string;
  sponsorCategory: SponsorCategory;
  likes: number;
  comments: number;
  totalInteractions: number;
  totalInteractionsEstimated: boolean;
  engagementRate: number;
  emv: number;
  emvEstimated: boolean;
  videoViews: number;
  videoViewsEstimated: boolean;
  isCompetitorPost: boolean;
}

export interface AthleteBaselineLiftRow {
  athleteId: string;
  athleteName: string;
  brandEngagementRate: number;
  baselineEngagementRate: number;
  lift: number;
}

export const BRAND_MAP: Record<BrandKey, BrandDefinition> = {
  CVS: {
    displayName: 'CVS',
    aliases: ['cvs', 'cvs pharmacy', 'cvshealth'],
    handleAliases: ['@cvs', '@cvspharmacy', '@cvshealth'],
    domainAliases: ['cvs.com', 'cvshealth.com'],
    hashtagAliases: ['#cvs', '#cvspharmacy', '#cvshealth'],
  },
  Hollister: {
    displayName: 'Hollister',
    aliases: ['hollister', 'hollister co', 'hco'],
    handleAliases: ['@hollister', '@hollisterco'],
    domainAliases: ['hollisterco.com'],
    hashtagAliases: ['#hollister', '#hollisterco'],
  },
  Adidas: {
    displayName: 'Adidas',
    aliases: ['adidas', 'adidas originals', 'three stripes'],
    handleAliases: ['@adidas', '@adidasfootball', '@adidasbasketball', '@adidasusfootball'],
    domainAliases: ['adidas.com'],
    hashtagAliases: ['#adidas', '#adidaspartner', '#createdwithadidas'],
  },
  'All-State': {
    displayName: 'All-State',
    aliases: ['all state', 'allstate', 'all-state'],
    handleAliases: ['@allstate'],
    domainAliases: ['allstate.com'],
    hashtagAliases: ['#allstate'],
  },
  'Hey Dude': {
    displayName: 'Hey Dude',
    aliases: ['hey dude', 'heydude', 'hey dude shoes'],
    handleAliases: ['@heydude', '@heydudeshoes'],
    domainAliases: ['heydude.com', 'heydudeshoesusa.com'],
    hashtagAliases: ['#heydude', '#heydudeshoes'],
  },
  C4: {
    displayName: 'C4',
    aliases: ['c4', 'c4 energy', 'c4energy'],
    handleAliases: ['@c4energy', '@c4enrgy'],
    domainAliases: ['c4energy.com'],
    hashtagAliases: ['#c4energy', '#c4'],
  },
  Crocs: {
    displayName: 'Crocs',
    aliases: ['crocs', 'croc nation', 'crocs shoes'],
    handleAliases: ['@crocs'],
    domainAliases: ['crocs.com'],
    hashtagAliases: ['#crocs', '#crocsstyle'],
  },
  Stanley: {
    displayName: 'Stanley',
    aliases: ['stanley', 'stanley cup', 'stanley 1913'],
    handleAliases: ['@stanley_brand', '@stanley1913'],
    domainAliases: ['stanley1913.com'],
    hashtagAliases: ['#stanley1913', '#stanleytumbler'],
  },
  '7/11': {
    displayName: '7/11',
    aliases: ['7/11', '7-11', '7 eleven', 'seven eleven'],
    handleAliases: ['@7eleven'],
    domainAliases: ['7-eleven.com'],
    hashtagAliases: ['#7eleven', '#7elevenpartner'],
  },
};

const BRAND_CATEGORY_MAP: Record<BrandKey, SponsorCategory> = {
  CVS: 'retail',
  Hollister: 'apparel',
  Adidas: 'apparel',
  'All-State': 'insurance',
  'Hey Dude': 'footwear',
  C4: 'beverage',
  Crocs: 'footwear',
  Stanley: 'beverage',
  '7/11': 'convenience',
};

const SPONSOR_CATEGORY_HINTS: Array<{ token: string; category: SponsorCategory }> = [
  { token: 'adidas', category: 'apparel' },
  { token: 'hollister', category: 'apparel' },
  { token: 'allstate', category: 'insurance' },
  { token: 'insurance', category: 'insurance' },
  { token: 'crocs', category: 'footwear' },
  { token: 'heydude', category: 'footwear' },
  { token: 'stanley', category: 'beverage' },
  { token: 'c4', category: 'beverage' },
  { token: 'redbull', category: 'beverage' },
  { token: 'gatorade', category: 'beverage' },
  { token: '7eleven', category: 'convenience' },
  { token: '7-eleven', category: 'convenience' },
  { token: 'cvs', category: 'retail' },
  { token: 'uber', category: 'retail' },
];

// Realistic schema-aligned mock rows for local development.
export const MOCK_SPONSORED_RECORDS: SponsoredRecord[] = [
  {
    _id: 'mock_0001',
    athlete: { _id: 'ath_01', name: 'Ari Foster', sport: 'WOMENS_BASKETBALL', school: { name: 'UCLA' } },
    caption: 'Fueling up before practice with @cvspharmacy essentials.',
    hashtags: ['#CVS', '#ad'],
    metrics: { likes: 4200, comments: 122, engagementRate: 0.058, shares: 51, saves: 80, totalInteractions: 4453, followers: 118000 },
    sponsorPartner: '@cvspharmacy',
    permalink: 'https://www.instagram.com/p/mock1',
    url: 'https://cdn.example.com/media/mock1.jpg',
    source: 'INSTAGRAM',
    isSponsored: true,
    isOrganizationCollaboration: true,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-01-10T13:30:00.000Z' },
  },
  {
    _id: 'mock_0002',
    athlete: { _id: 'ath_02', name: 'Miles Carter', sport: 'MENS_FOOTBALL', school: { name: 'Notre Dame' } },
    caption: 'Game day fit by Hollister Co. Link in bio.',
    hashtags: ['#hollisterco', '#gameday'],
    metrics: { likes: 6100, comments: 164, engagementRate: 0.046, shares: 28, saves: 46, totalInteractions: 6338, followers: 235000 },
    sponsorPartner: '@hollister',
    permalink: 'https://www.instagram.com/p/mock2',
    url: 'https://www.hollisterco.com/athlete-partner',
    source: 'INSTAGRAM',
    isSponsored: true,
    isOrganizationCollaboration: true,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-01-12T16:20:00.000Z' },
  },
  {
    _id: 'mock_0003',
    athlete: { _id: 'ath_03', name: 'Jules Medina', sport: 'WOMENS_SOCCER', school: { name: 'UCLA' } },
    caption: 'New boots from adidasfootball are unreal.',
    hashtags: ['#adidas', '#partner'],
    metrics: { likes: 5002, comments: 91, engagementRate: 0.062, shares: 20, saves: 65, totalInteractions: 5178, followers: 141000 },
    sponsorPartner: '@adidasfootball',
    permalink: 'https://www.instagram.com/p/mock3',
    url: 'https://assets.adidas.com/image/upload/mock3',
    source: 'INSTAGRAM',
    isSponsored: true,
    isOrganizationCollaboration: true,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-01-15T18:10:00.000Z' },
  },
  {
    _id: 'mock_0004',
    athlete: { _id: 'ath_01', name: 'Ari Foster', sport: 'WOMENS_BASKETBALL', school: { name: 'UCLA' } },
    caption: 'Protected by Allstate for the road this season.',
    hashtags: ['#allstate', '#sponsored'],
    metrics: { likes: 3300, comments: 77, engagementRate: 0.041, shares: 13, saves: 22, totalInteractions: 3412, followers: 118000 },
    sponsorPartner: '@allstate',
    permalink: 'https://www.instagram.com/p/mock4',
    url: 'https://www.allstate.com/athlete/mock4',
    source: 'INSTAGRAM',
    isSponsored: true,
    isOrganizationCollaboration: true,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-01-20T12:00:00.000Z' },
  },
  {
    _id: 'mock_0005',
    athlete: { _id: 'ath_04', name: 'Noah Kim', sport: 'BASEBALL', school: { name: 'Notre Dame' } },
    caption: 'Weekend comfort mode activated.',
    hashtags: ['#HeyDude', '#ad'],
    metrics: { likes: 2890, comments: 54, engagementRate: 0.039, shares: 9, saves: 14, totalInteractions: 2967, followers: 97000 },
    sponsorPartner: '@heydudeshoes',
    permalink: 'https://www.instagram.com/p/mock5',
    url: 'https://www.heydude.com/en-us/mock5',
    source: 'INSTAGRAM',
    isSponsored: true,
    isOrganizationCollaboration: false,
    hasOrganizationInCaption: false,
    publishedAt: { $date: '2026-01-21T15:20:00.000Z' },
  },
  {
    _id: 'mock_0006',
    athlete: { _id: 'ath_05', name: 'Tess Vaughn', sport: 'TRACK_AND_FIELD', school: { name: 'UCLA' } },
    caption: 'Early lift + @c4energy to start the day.',
    hashtags: ['#c4energy', '#preworkout'],
    metrics: { likes: 4100, comments: 70, engagementRate: 0.071, shares: 42, saves: 91, totalInteractions: 4303, followers: 86000 },
    sponsorPartner: '@c4enrgy',
    permalink: 'https://www.instagram.com/p/mock6',
    url: 'https://www.c4energy.com/pages/athletes',
    source: 'INSTAGRAM',
    isSponsored: true,
    isOrganizationCollaboration: true,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-01-22T17:50:00.000Z' },
  },
  {
    _id: 'mock_0007',
    athlete: { _id: 'ath_02', name: 'Miles Carter', sport: 'MENS_FOOTBALL', school: { name: 'Notre Dame' } },
    caption: 'Tunnel look powered by Crocs.',
    hashtags: ['#crocs', '#gameday'],
    metrics: { likes: 5401, comments: 148, engagementRate: 0.051, shares: 21, saves: 33, totalInteractions: 5603, followers: 235000 },
    sponsorPartner: '@crocs',
    permalink: 'https://www.instagram.com/p/mock7',
    url: 'https://www.crocs.com/collabs/mock7',
    source: 'INSTAGRAM',
    isSponsored: true,
    isOrganizationCollaboration: true,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-01-24T11:30:00.000Z' },
  },
  {
    _id: 'mock_0008',
    athlete: { _id: 'ath_06', name: 'Riley Hart', sport: 'VOLLEYBALL', school: { name: 'UCLA' } },
    caption: 'Hydration check all week.',
    hashtags: ['#stanley1913', '#partner'],
    metrics: { likes: 3650, comments: 83, engagementRate: 0.067, shares: 26, saves: 98, totalInteractions: 3857, followers: 92000 },
    sponsorPartner: '@stanley1913',
    permalink: 'https://www.instagram.com/p/mock8',
    url: 'https://www.stanley1913.com/products/mock8',
    source: 'INSTAGRAM',
    isSponsored: true,
    isOrganizationCollaboration: false,
    hasOrganizationInCaption: false,
    publishedAt: { $date: '2026-01-25T08:15:00.000Z' },
  },
  {
    _id: 'mock_0009',
    athlete: { _id: 'ath_07', name: 'Kai Adams', sport: 'MENS_BASKETBALL', school: { name: 'Notre Dame' } },
    caption: 'Pit stop at 7-Eleven before film session.',
    hashtags: ['#7ElevenPartner', '#snackrun'],
    metrics: { likes: 4550, comments: 96, engagementRate: 0.048, shares: 30, saves: 44, totalInteractions: 4720, followers: 177000 },
    sponsorPartner: '@7eleven',
    permalink: 'https://www.instagram.com/p/mock9',
    url: 'https://www.7-eleven.com/rewards/mock9',
    source: 'INSTAGRAM',
    isSponsored: true,
    isOrganizationCollaboration: true,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-01-28T10:40:00.000Z' },
  },
  {
    _id: 'mock_0010',
    athlete: { _id: 'ath_03', name: 'Jules Medina', sport: 'WOMENS_SOCCER', school: { name: 'UCLA' } },
    caption: 'Could not pick one colorway from adidas originals.',
    hashtags: ['#createdwithadidas'],
    metrics: { likes: 4895, comments: 110, engagementRate: 0.059, shares: 25, saves: 66, totalInteractions: 5096, followers: 141000 },
    sponsorPartner: '',
    permalink: 'https://www.instagram.com/p/mock10',
    url: 'https://www.instagram.com/p/mock10',
    source: 'INSTAGRAM',
    isSponsored: true,
    isOrganizationCollaboration: true,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-01-30T14:05:00.000Z' },
  },
  {
    _id: 'mock_0011',
    athlete: { _id: 'ath_08', name: 'Liam Zhao', sport: 'MENS_SWIMMING', school: { name: 'UCLA' } },
    caption: 'Recovery run sponsored segment.',
    hashtags: ['#fitness'],
    metrics: { likes: 1600, comments: 33, engagementRate: 0.031, shares: 7, saves: 19, totalInteractions: 1659, followers: 54000 },
    sponsorPartner: '',
    permalink: 'https://www.instagram.com/p/mock11',
    url: 'https://www.cvs.com/shop/hydration',
    source: 'INSTAGRAM',
    isSponsored: true,
    isOrganizationCollaboration: false,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-02-01T07:10:00.000Z' },
  },
  {
    _id: 'mock_0012',
    athlete: { _id: 'ath_09', name: 'Nia Bennett', sport: 'WOMENS_TRACK_AND_FIELD', school: { name: 'Notre Dame' } },
    caption: 'C4 and Crocs collab day.',
    hashtags: ['#c4', '#crocsstyle'],
    metrics: { likes: 3770, comments: 82, engagementRate: 0.064, shares: 15, saves: 38, totalInteractions: 3905, followers: 102000 },
    sponsorPartner: '@crocs',
    permalink: 'https://www.instagram.com/p/mock12',
    url: 'https://m.example.com/mock12',
    source: 'INSTAGRAM',
    isSponsored: true,
    isOrganizationCollaboration: true,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-02-03T19:45:00.000Z' },
  },
  {
    _id: 'mock_0013',
    athlete: { _id: 'ath_01', name: 'Ari Foster', sport: 'WOMENS_BASKETBALL', school: { name: 'UCLA' }, conference: { name: 'Big Ten' } },
    caption: 'Fuel session with @gatorade before tip-off.',
    hashtags: ['#gatorade', '#partner'],
    metrics: { likes: 2980, comments: 63, engagementRate: 0.038, totalInteractions: 3043, followers: 118000 },
    sponsorPartner: '@gatorade',
    permalink: 'https://www.instagram.com/p/mock13',
    source: 'INSTAGRAM',
    isSponsored: true,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-02-05T18:40:00.000Z' },
  },
  {
    _id: 'mock_0014',
    athlete: { _id: 'ath_02', name: 'Miles Carter', sport: 'MENS_FOOTBALL', school: { name: 'Notre Dame' }, conference: { name: 'ACC' } },
    caption: 'Recovery stack from @redbull on road week.',
    hashtags: ['#redbull', '#athlete'],
    metrics: { likes: 5012, comments: 104, engagementRate: 0.042, totalInteractions: 5116, followers: 235000 },
    sponsorPartner: '@redbull',
    permalink: 'https://www.instagram.com/p/mock14',
    source: 'INSTAGRAM',
    isSponsored: true,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-02-06T16:30:00.000Z' },
  },
  {
    _id: 'mock_0015',
    athlete: { _id: 'ath_03', name: 'Jules Medina', sport: 'WOMENS_SOCCER', school: { name: 'UCLA' }, conference: { name: 'Big Ten' } },
    caption: 'Quick trip with @uber after training.',
    hashtags: ['#uber', '#ad'],
    metrics: { likes: 2450, comments: 59, engagementRate: 0.036, totalInteractions: 2509, followers: 141000 },
    sponsorPartner: '@uber',
    permalink: 'https://www.instagram.com/p/mock15',
    source: 'INSTAGRAM',
    isSponsored: true,
    hasOrganizationInCaption: true,
    publishedAt: { $date: '2026-02-07T11:15:00.000Z' },
  },
];

export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCompact(str: string): string {
  return normalizeText(str).replace(/\s/g, '');
}

function toText(value: string | undefined | null): string {
  return value ? normalizeText(value) : '';
}

function getDateString(value: string | DateField | undefined): string | undefined {
  if (!value) return undefined;
  return typeof value === 'string' ? value : value.$date;
}

function toDateValue(value: string | DateField | undefined): Date | null {
  const dateString = getDateString(value);
  if (!dateString) return null;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hashToSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getRecordDomains(record: SponsoredRecord): string[] {
  const fields = [record.url, record.permalink].filter(Boolean) as string[];
  const result: string[] = [];
  for (const field of fields) {
    try {
      const hostname = new URL(field).hostname.toLowerCase().replace(/^www\./, '');
      result.push(hostname);
    } catch {
      // Ignore invalid URLs in source data.
    }
  }
  return result;
}

function buildAliasSet(def: BrandDefinition): Set<string> {
  return new Set(
    [def.displayName, ...def.aliases]
      .map((x) => normalizeText(x))
      .filter(Boolean),
  );
}

function buildHandleSet(def: BrandDefinition): Set<string> {
  const handles = def.handleAliases ?? [];
  return new Set(
    [...handles, ...def.aliases]
      .map((x) => normalizeCompact(x.replace(/^@/, '')))
      .filter(Boolean),
  );
}

function buildHashtagSet(def: BrandDefinition): Set<string> {
  const hashtags = def.hashtagAliases ?? [];
  return new Set(
    [...hashtags, ...def.aliases]
      .map((x) => normalizeCompact(x.replace(/^#/, '')))
      .filter(Boolean),
  );
}

function getTotalInteractions(record: SponsoredRecord): number {
  const explicit = record.metrics.totalInteractions;
  if (typeof explicit === 'number' && explicit > 0) return explicit;
  const likes = record.metrics.likes || 0;
  const comments = record.metrics.comments || 0;
  const shares = record.metrics.shares || 0;
  const saves = record.metrics.saves || 0;
  return likes + comments + shares + saves;
}

function isTotalInteractionsEstimated(record: SponsoredRecord): boolean {
  return !(typeof record.metrics.totalInteractions === 'number' && record.metrics.totalInteractions > 0);
}

const EMV_UPLIFT_FACTOR = 1.6;

function normalizeEngagementRate(er: number): number {
  if (!Number.isFinite(er) || er <= 0) return 0;
  return er > 1 ? er / 100 : er;
}

function getEstimatedInteractions(record: SponsoredRecord): number {
  const explicitTotal = record.metrics.totalInteractions;
  if (typeof explicitTotal === 'number' && explicitTotal > 0) return explicitTotal;

  const likes = record.metrics.likes || 0;
  const comments = record.metrics.comments || 0;
  const shares = record.metrics.shares || 0;
  const saves = record.metrics.saves || 0;
  const direct = likes + comments + shares + saves;
  if (direct > 0) return direct;

  const accountsEngaged = record.metrics.accountsEngaged || 0;
  if (accountsEngaged > 0) return accountsEngaged;

  const impressions = record.metrics.impressions || 0;
  if (impressions > 0) return impressions * 0.018;

  const reach = record.metrics.reach || 0;
  if (reach > 0) return reach * 0.022;

  const followers = record.metrics.followers || 0;
  const engagementRate = normalizeEngagementRate(record.metrics.engagementRate || 0);
  if (followers > 0 && engagementRate > 0) return followers * engagementRate;

  return 0;
}

function getEmv(record: SponsoredRecord): number {
  const explicit = record.metrics.emv;
  if (typeof explicit === 'number' && explicit > 0) return explicit * EMV_UPLIFT_FACTOR;

  const likes = record.metrics.likes || 0;
  const comments = record.metrics.comments || 0;
  const videoViews = record.metrics.videoViews || 0;
  const interactionWeighted = likes * 0.35 + comments * 2 + videoViews * 0.02;
  const estimatedInteractions = getEstimatedInteractions(record);
  const fallbackWeighted = estimatedInteractions * 0.9;
  const followers = record.metrics.followers || 0;
  const followerFloor = followers > 0 ? Math.max(180, followers * 0.004) : 180;
  const blended = Math.max(interactionWeighted, fallbackWeighted, followerFloor);
  return blended * EMV_UPLIFT_FACTOR;
}

function isEmvEstimated(record: SponsoredRecord): boolean {
  return !(typeof record.metrics.emv === 'number' && record.metrics.emv > 0);
}

export function getBrandCategory(brandKey: BrandKey): SponsorCategory {
  return BRAND_CATEGORY_MAP[brandKey];
}

export const BRAND_CATEGORY_LABELS: Record<BrandKey, string> = {
  CVS: 'Retail/Pharmacy',
  Hollister: 'Apparel',
  Adidas: 'Apparel/Footwear',
  'All-State': 'Insurance',
  'Hey Dude': 'Footwear',
  C4: 'Beverage/Energy',
  Crocs: 'Footwear',
  Stanley: 'Consumer goods',
  '7/11': 'Convenience/Retail',
};

export function inferSponsorCategory(sponsorPartner: string | undefined): SponsorCategory {
  const normalized = normalizeCompact((sponsorPartner || '').replace(/^@/, ''));
  if (!normalized) return 'other';
  const match = SPONSOR_CATEGORY_HINTS.find((hint) => normalized.includes(normalizeCompact(hint.token)));
  return match?.category || 'other';
}

function hasTextToken(haystack: string, token: string): boolean {
  if (!haystack || !token) return false;
  return haystack.includes(token);
}

/**
 * Deterministic priority-order evaluation:
 * 1) sponsorPartner
 * 2) caption
 * 3) hashtags
 * 4) url/permalink domain
 * 5) collaboration/caption flags (support only; cannot match alone)
 */
export function matchesBrand(record: SponsoredRecord, brandKey: BrandKey): boolean {
  const def = BRAND_MAP[brandKey];
  const aliasSet = buildAliasSet(def);
  const handleSet = buildHandleSet(def);
  const hashtagSet = buildHashtagSet(def);

  const sponsorNorm = normalizeCompact((record.sponsorPartner || '').replace(/^@/, ''));
  const sponsorMatched = [...handleSet].some((handle) => sponsorNorm === handle || sponsorNorm.includes(handle));
  if (sponsorMatched) return true;

  const caption = toText(record.caption);
  const captionMatched = [...aliasSet].some((alias) => hasTextToken(caption, alias));
  if (captionMatched) return true;

  const hashtags = (record.hashtags ?? []).map((h) => normalizeCompact(h.replace(/^#/, '')));
  const hashtagMatched = hashtags.some((h) => hashtagSet.has(h));
  if (hashtagMatched) return true;

  const domains = getRecordDomains(record);
  const domainMatched = (def.domainAliases ?? []).some((domainAlias) => {
    const normalizedDomain = domainAlias.toLowerCase().replace(/^www\./, '');
    return domains.some((domain) => domain.includes(normalizedDomain));
  });
  if (domainMatched) return true;

  // Signal 5: support only, never enough on its own for inclusion.
  const supportingSignal = Boolean(record.isOrganizationCollaboration && record.hasOrganizationInCaption);
  return supportingSignal ? false : false;
}

export function filterRecordsByBrand(records: SponsoredRecord[], brandKey: BrandKey): SponsoredRecord[] {
  return records.filter((record) => matchesBrand(record, brandKey));
}

export function computeBrandSummary(recordsForBrand: SponsoredRecord[], brandKey: BrandKey): BrandSummary {
  const athletes = new Set(recordsForBrand.map((record) => record.athlete._id));
  const totalLikes = recordsForBrand.reduce((sum, record) => sum + (record.metrics.likes || 0), 0);
  const totalComments = recordsForBrand.reduce((sum, record) => sum + (record.metrics.comments || 0), 0);
  const totalInteractions = recordsForBrand.reduce((sum, record) => sum + getTotalInteractions(record), 0);
  const avgEngagementRate = recordsForBrand.length
    ? recordsForBrand.reduce((sum, record) => sum + (record.metrics.engagementRate || 0), 0) / recordsForBrand.length
    : 0;
  const estimatedEmv = recordsForBrand.reduce((sum, record) => sum + getEmv(record), 0);
  const activeCampaigns = Math.max(
    1,
    Math.min(
      12,
      Math.round((new Set(recordsForBrand.map((record) => record.athlete._id)).size * 0.4) + (recordsForBrand.length * 0.15)),
    ),
  );

  return {
    brandKey,
    displayName: BRAND_MAP[brandKey].displayName,
    activeCampaigns,
    posts: recordsForBrand.length,
    athletes: athletes.size,
    totalLikes,
    totalComments,
    totalInteractions,
    avgEngagementRate,
    estimatedEmv,
  };
}

export function computeAthleteSummary(recordsForBrand: SponsoredRecord[]): AthleteSummary[] {
  const byAthlete = new Map<string, AthleteSummary>();

  for (const record of recordsForBrand) {
    const athleteId = record.athlete._id;
    const existing = byAthlete.get(athleteId);
    if (!existing) {
      byAthlete.set(athleteId, {
        athleteId,
        athleteName: record.athlete.name,
        sport: record.athlete.sport || 'UNKNOWN',
        conference: record.athlete.conference?.name || 'Independent',
        school: record.athlete.school?.name || 'Unknown School',
        postCount: 1,
        totalLikes: record.metrics.likes || 0,
        totalComments: record.metrics.comments || 0,
        totalInteractions: getTotalInteractions(record),
        avgEngagementRate: record.metrics.engagementRate || 0,
        totalEmv: getEmv(record),
      });
      continue;
    }

    const nextCount = existing.postCount + 1;
    byAthlete.set(athleteId, {
      ...existing,
      postCount: nextCount,
      totalLikes: existing.totalLikes + (record.metrics.likes || 0),
      totalComments: existing.totalComments + (record.metrics.comments || 0),
      totalInteractions: existing.totalInteractions + getTotalInteractions(record),
      avgEngagementRate:
        ((existing.avgEngagementRate * existing.postCount) + (record.metrics.engagementRate || 0)) / nextCount,
      totalEmv: existing.totalEmv + getEmv(record),
    });
  }

  return [...byAthlete.values()].sort((a, b) => b.totalInteractions - a.totalInteractions);
}

export function computeCrossBrandOverlap(recordsForAllBrands: SponsoredRecord[]): OverlapMatrix {
  const matrix: OverlapMatrix = {};
  const brandKeys = Object.keys(BRAND_MAP) as BrandKey[];

  for (const record of recordsForAllBrands) {
    const athleteId = record.athlete._id;
    if (!matrix[athleteId]) matrix[athleteId] = {};

    for (const brandKey of brandKeys) {
      if (!matchesBrand(record, brandKey)) continue;
      const current = matrix[athleteId][brandKey] || 0;
      matrix[athleteId][brandKey] = current + 1;
    }
  }

  return matrix;
}

function getTopPosts(recordsForBrand: SponsoredRecord[]): TopPost[] {
  return [...recordsForBrand]
    .map((record) => ({
      recordId: record._id,
      athleteId: record.athlete._id,
      athleteName: record.athlete.name,
      sport: record.athlete.sport || 'UNKNOWN',
      school: record.athlete.school?.name || 'Unknown School',
      conference: record.athlete.conference?.name || 'Independent',
      mediaType: record.mediaType || 'PHOTO',
      sponsorPartner: record.sponsorPartner,
      caption: record.caption,
      permalink: record.permalink,
      publishedAt: getDateString(record.publishedAt),
      likes: record.metrics.likes || 0,
      comments: record.metrics.comments || 0,
      videoViews: record.metrics.videoViews || 0,
      videoViewsEstimated: !(typeof record.metrics.videoViews === 'number' && record.metrics.videoViews > 0),
      emv: getEmv(record),
      emvEstimated: isEmvEstimated(record),
      totalInteractions: getTotalInteractions(record),
      totalInteractionsEstimated: isTotalInteractionsEstimated(record),
      engagementRate: record.metrics.engagementRate || 0,
    }))
    .sort((a, b) => {
      if (b.totalInteractions !== a.totalInteractions) return b.totalInteractions - a.totalInteractions;
      return b.engagementRate - a.engagementRate;
    })
    .slice(0, 10);
}

function mostCommon(values: string[]): string {
  if (values.length === 0) return 'N/A';
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function buildPatternLabel(record: SponsoredRecord): string {
  const mediaType = (record.mediaType || 'PHOTO').toUpperCase();
  const collab = record.isOrganizationCollaboration || record.isCollaboration;
  const logo = record.hasOrganizationLogo;
  const hashtags = (record.hashtags?.length || 0) > 0;
  const traits = [
    mediaType.includes('VIDEO') ? 'Video' : 'Photo',
    collab ? 'Collab' : 'Solo',
    logo ? 'Logo Featured' : 'Caption Led',
    hashtags ? 'Hashtag Amplified' : 'Clean Caption',
  ];
  return traits.join(' • ');
}

function computeInsightStats(recordsForBrand: SponsoredRecord[]): BrandInsightStats {
  if (recordsForBrand.length === 0) {
    return {
      topMediaType: 'N/A',
      topSport: 'N/A',
      topConference: 'N/A',
      topPattern: 'N/A',
      topPatternShare: 0,
    };
  }

  const topMediaType = mostCommon(recordsForBrand.map((r) => (r.mediaType || 'PHOTO').toUpperCase()));
  const topSport = mostCommon(recordsForBrand.map((r) => r.athlete.sport || 'UNKNOWN'));
  const topConference = mostCommon(recordsForBrand.map((r) => r.athlete.conference?.name || 'Independent'));
  const patternLabels = recordsForBrand.map(buildPatternLabel);
  const topPattern = mostCommon(patternLabels);
  const topPatternCount = patternLabels.filter((pattern) => pattern === topPattern).length;

  return {
    topMediaType,
    topSport,
    topConference,
    topPattern,
    topPatternShare: topPatternCount / recordsForBrand.length,
  };
}

export function buildBrandOutputs(records: SponsoredRecord[]): BrandOutputs {
  const brandKeys = Object.keys(BRAND_MAP) as BrandKey[];

  const brandSummaries = {} as Record<BrandKey, BrandSummary>;
  const athletesByBrand = {} as Record<BrandKey, AthleteSummary[]>;
  const topPostsByBrand = {} as Record<BrandKey, TopPost[]>;
  const recordsByBrand = {} as Record<BrandKey, SponsoredRecord[]>;
  const insightStatsByBrand = {} as Record<BrandKey, BrandInsightStats>;

  for (const brandKey of brandKeys) {
    const matched = filterRecordsByBrand(records, brandKey);
    recordsByBrand[brandKey] = matched;
    brandSummaries[brandKey] = computeBrandSummary(matched, brandKey);
    athletesByBrand[brandKey] = computeAthleteSummary(matched);
    topPostsByBrand[brandKey] = getTopPosts(matched);
    insightStatsByBrand[brandKey] = computeInsightStats(matched);
  }

  const overlapMatrix = computeCrossBrandOverlap(records);

  return {
    brandSummaries,
    athletesByBrand,
    topPostsByBrand,
    recordsByBrand,
    insightStatsByBrand,
    overlapMatrix,
  };
}

function getFollowersEstimateForAthlete(athleteId: string, records: SponsoredRecord[]): number {
  const fromMetrics = records
    .map((r) => r.metrics.followers || 0)
    .filter((v) => v > 0)
    .sort((a, b) => b - a)[0];
  if (fromMetrics) return fromMetrics;

  const avgLikes = records.length
    ? records.reduce((sum, r) => sum + (r.metrics.likes || 0), 0) / records.length
    : 1200;
  const seed = hashToSeed(athleteId) % 42000;
  return Math.round(avgLikes * 22 + 35000 + seed);
}

export function getTalentDiscoveryRowsForBrand(
  brandKey: BrandKey,
  allRecords: SponsoredRecord[] = MOCK_SPONSORED_RECORDS,
): TalentAthleteRow[] {
  const brandRecords = filterRecordsByBrand(allRecords, brandKey);
  const byAthlete = new Map<string, SponsoredRecord[]>();
  for (const record of brandRecords) {
    const athleteId = record.athlete._id;
    const list = byAthlete.get(athleteId) || [];
    list.push(record);
    byAthlete.set(athleteId, list);
  }

  const rows: TalentAthleteRow[] = [];
  for (const [athleteId, records] of byAthlete.entries()) {
    const first = records[0];
    const sponsoredPostsForBrand = records.length;
    const avgEngagementRate = records.reduce((sum, r) => sum + (r.metrics.engagementRate || 0), 0) / records.length;
    const followers = getFollowersEstimateForAthlete(
      athleteId,
      allRecords.filter((r) => r.athlete._id === athleteId),
    );
    const totalEmvForBrand = records.reduce((sum, r) => sum + getEmv(r), 0);

    const erNorm = Math.min(avgEngagementRate / 0.08, 1);
    const followersNorm = Math.min(Math.log10(Math.max(followers, 1)) / 6, 1);
    const sponsoredNorm = Math.min(sponsoredPostsForBrand / 6, 1);
    const fitScore = Math.round((erNorm * 0.5 + followersNorm * 0.3 + sponsoredNorm * 0.2) * 100);

    rows.push({
      athleteId,
      athleteName: first.athlete.name,
      sport: first.athlete.sport || 'UNKNOWN',
      school: first.athlete.school?.name || 'Unknown School',
      conference: first.athlete.conference?.name || 'Independent',
      followers,
      avgEngagementRate,
      sponsoredPostsForBrand,
      fitScore,
      totalEmvForBrand,
    });
  }

  return rows.sort((a, b) => b.fitScore - a.fitScore || b.totalEmvForBrand - a.totalEmvForBrand);
}

export function getOtherSponsorPartnersForAthlete(
  athleteId: string,
  selectedBrand: BrandKey,
  allRecords: SponsoredRecord[] = MOCK_SPONSORED_RECORDS,
): Array<{ sponsorPartner: string; postCount: number }> {
  const athleteRecords = allRecords.filter((record) => record.athlete._id === athleteId);
  const map = new Map<string, number>();
  for (const record of athleteRecords) {
    const raw = (record.sponsorPartner || '').trim();
    if (!raw) continue;
    if (matchesBrand(record, selectedBrand)) continue;
    const normalized = raw.startsWith('@') ? raw.toLowerCase() : `@${raw.toLowerCase()}`;
    map.set(normalized, (map.get(normalized) || 0) + 1);
  }
  return [...map.entries()]
    .map(([sponsorPartner, postCount]) => ({ sponsorPartner, postCount }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 5);
}

export function getAthleteBaselineEngagementRate(
  athleteId: string,
  excludeSponsorPartner: string | undefined,
  allRecords: SponsoredRecord[] = MOCK_SPONSORED_RECORDS,
): number | null {
  const normalizedSponsor = normalizeCompact((excludeSponsorPartner || '').replace(/^@/, ''));
  const comparison = allRecords.filter((record) => {
    if (record.athlete._id !== athleteId) return false;
    const sponsor = normalizeCompact((record.sponsorPartner || '').replace(/^@/, ''));
    if (!sponsor) return false;
    return sponsor !== normalizedSponsor;
  });
  if (comparison.length === 0) return null;
  return comparison.reduce((sum, record) => sum + (record.metrics.engagementRate || 0), 0) / comparison.length;
}

function categoryGroupsForBrand(brandKey: BrandKey): string[] {
  const label = BRAND_CATEGORY_LABELS[brandKey].toLowerCase();
  if (label.includes('retail')) return ['retail'];
  if (label.includes('apparel') && label.includes('footwear')) return ['apparel', 'footwear'];
  if (label.includes('apparel')) return ['apparel'];
  if (label.includes('footwear')) return ['footwear'];
  if (label.includes('insurance')) return ['insurance'];
  if (label.includes('beverage')) return ['beverage'];
  if (label.includes('consumer')) return ['consumer-goods'];
  if (label.includes('convenience')) return ['convenience'];
  return ['other'];
}

export function getInternalCategoryBenchmarkForBrand(
  brandKey: BrandKey,
  summaries: Record<BrandKey, BrandSummary> = brandSummaries,
): {
  categoryLabel: string;
  peerBrands: BrandKey[];
  avgEngagementRate: number;
  avgEmvPerPost: number;
} {
  const groups = categoryGroupsForBrand(brandKey);
  const allBrandKeys = Object.keys(BRAND_MAP) as BrandKey[];
  const peers = allBrandKeys.filter((candidate) => {
    if (candidate === brandKey) return false;
    const candidateGroups = categoryGroupsForBrand(candidate);
    return candidateGroups.some((group) => groups.includes(group));
  });

  const scope = peers.length > 0 ? peers : [brandKey];
  const avgEngagementRate = scope.length
    ? scope.reduce((sum, key) => sum + summaries[key].avgEngagementRate, 0) / scope.length
    : 0;
  const avgEmvPerPost = scope.length
    ? scope.reduce((sum, key) => {
        const posts = Math.max(summaries[key].posts, 1);
        return sum + (summaries[key].estimatedEmv / posts);
      }, 0) / scope.length
    : 0;

  return {
    categoryLabel: BRAND_CATEGORY_LABELS[brandKey],
    peerBrands: peers,
    avgEngagementRate,
    avgEmvPerPost,
  };
}

export function getAthleteBaselineLiftsForBrand(
  brandKey: BrandKey,
  allRecords: SponsoredRecord[] = MOCK_SPONSORED_RECORDS,
): AthleteBaselineLiftRow[] {
  const brandRecords = filterRecordsByBrand(allRecords, brandKey);
  const byAthlete = new Map<string, SponsoredRecord[]>();
  for (const record of brandRecords) {
    const athleteId = record.athlete._id;
    const list = byAthlete.get(athleteId) || [];
    list.push(record);
    byAthlete.set(athleteId, list);
  }

  const rows: AthleteBaselineLiftRow[] = [];
  for (const [athleteId, records] of byAthlete.entries()) {
    const brandEngagementRate = records.reduce((sum, record) => sum + (record.metrics.engagementRate || 0), 0) / records.length;
    const baseline = getAthleteBaselineEngagementRate(athleteId, records[0]?.sponsorPartner, allRecords);
    if (baseline === null || baseline <= 0) continue;
    rows.push({
      athleteId,
      athleteName: records[0].athlete.name,
      brandEngagementRate,
      baselineEngagementRate: baseline,
      lift: (brandEngagementRate - baseline) / baseline,
    });
  }

  return rows.sort((a, b) => b.lift - a.lift);
}

export function getSponsoredPostMonitorPostsForBrand(
  brandKey: BrandKey,
  includeCompetitorPosts = false,
  allRecords: SponsoredRecord[] = MOCK_SPONSORED_RECORDS,
): MonitorPostRow[] {
  const brandCategory = getBrandCategory(brandKey);
  const brandRecords = filterRecordsByBrand(allRecords, brandKey);
  const brandAthletes = new Set(brandRecords.map((record) => record.athlete._id));

  const competitorRecords = includeCompetitorPosts
    ? allRecords.filter((record) => {
        if (!brandAthletes.has(record.athlete._id)) return false;
        if (matchesBrand(record, brandKey)) return false;
        const rawSponsor = (record.sponsorPartner || '').trim();
        if (!rawSponsor) return false;
        return inferSponsorCategory(rawSponsor) === brandCategory;
      })
    : [];

  const rows = [...brandRecords, ...competitorRecords].map((record) => {
    const sponsorPartner = (record.sponsorPartner || '').trim() || '@unknown';
    return {
      recordId: record._id,
      athleteId: record.athlete._id,
      athleteName: record.athlete.name,
      sport: record.athlete.sport || 'UNKNOWN',
      school: record.athlete.school?.name || 'Unknown School',
      publishedAt: getDateString(record.publishedAt),
      caption: record.caption,
      mediaType: (record.mediaType || 'PHOTO').toUpperCase(),
      mediaUrl: record.url || record.permalink,
      permalink: record.permalink,
      isCollaboration: Boolean(record.isCollaboration),
      sponsorPartner,
      sponsorCategory: inferSponsorCategory(sponsorPartner),
      likes: record.metrics.likes || 0,
      comments: record.metrics.comments || 0,
      totalInteractions: getTotalInteractions(record),
      totalInteractionsEstimated: isTotalInteractionsEstimated(record),
      engagementRate: record.metrics.engagementRate || 0,
      emv: getEmv(record),
      emvEstimated: isEmvEstimated(record),
      videoViews: record.metrics.videoViews || 0,
      videoViewsEstimated: !(typeof record.metrics.videoViews === 'number' && record.metrics.videoViews > 0),
      isCompetitorPost: !matchesBrand(record, brandKey),
    };
  });

  return rows.sort((a, b) => {
    const aDate = toDateValue(a.publishedAt)?.getTime() || 0;
    const bDate = toDateValue(b.publishedAt)?.getTime() || 0;
    return bDate - aDate;
  });
}

/**
 * Local development outputs.
 * TODO(live-data): swap to outputs built from real `all_roster_sponsored` records.
 */
export const {
  brandSummaries,
  athletesByBrand,
  topPostsByBrand,
  recordsByBrand,
  insightStatsByBrand,
  overlapMatrix,
} = buildBrandOutputs(MOCK_SPONSORED_RECORDS);
