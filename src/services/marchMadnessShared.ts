import * as schoolConfigModule from '../config/schoolConfigs';
import type {
  FollowerSnapshot,
  ManualDealRecord,
  TournamentGender,
  TournamentParticipant,
  TournamentPost,
  TournamentWindow,
} from '../types/marchMadness';

interface RuntimeSchoolConfig {
  id: string;
  name: string;
  shortName: string;
  dataFile: string;
  rosterDataFile?: string;
  brandExclusions?: string[];
  brandAliases?: Record<string, string>;
}

export interface LoadedRosterAthlete {
  athleteId: string;
  athleteName: string;
  schoolName: string;
  sport: string;
  gender: TournamentGender;
  followers: number;
}

export interface LocalSchoolDataset {
  participant: TournamentParticipant;
  config: RuntimeSchoolConfig | null;
  contentFile?: string;
  rosterFile?: string;
}

const REPORT_BRAND_ALIASES: Record<string, string> = {
  nikebasketball: 'nike',
  usnikefootball: 'nike',
  adidasoriginals: 'adidas',
  drinkdripdrop: 'dripdrop',
  poweradeus: 'powerade',
  gatoradeofficial: 'gatorade',
};

const REPORT_SCHOOL_ALIASES: Record<string, string> = {
  ucla: 'ucla',
  usc: 'usc',
  lsu: 'lsu',
  'olemiss': 'ole miss',
  'ole-miss': 'ole miss',
  uconn: 'uconn',
  utsa: 'utsa',
  smu: 'smu',
  byu: 'byu',
  'stjohns': 'st johns',
  'st-johns': 'st johns',
  'saint marys': 'saint marys',
  'saint mary s': 'saint marys',
  'miami fl': 'miami fl',
  'miami oh': 'miami oh',
  'southern u': 'southern u',
};

const FALLBACK_PUBLIC_DATA_SCHOOLS: Record<string, RuntimeSchoolConfig> = {
  alabama: { id: 'alabama', name: 'The University of Alabama', shortName: 'Alabama', dataFile: '/data/alabama-content-posts.json' },
  arizona: { id: 'arizona', name: 'University of Arizona', shortName: 'Arizona', dataFile: '/data/arizona-content-posts.json' },
  arkansas: { id: 'arkansas', name: 'University of Arkansas', shortName: 'Arkansas', dataFile: '/data/arkansas-content-posts.json' },
  byu: { id: 'byu', name: 'Brigham Young University', shortName: 'BYU', dataFile: '/data/byu-content-posts.json' },
  cal: { id: 'cal', name: 'University of California, Berkeley', shortName: 'Cal', dataFile: '/data/cal-content-posts.json' },
  clemson: { id: 'clemson', name: 'Clemson University', shortName: 'Clemson', dataFile: '/data/clemson-content-posts.json' },
  colorado: { id: 'colorado', name: 'University of Colorado', shortName: 'Colorado', dataFile: '/data/colorado-content-posts.json' },
  georgia: { id: 'georgia', name: 'University of Georgia', shortName: 'Georgia', dataFile: '/data/georgia-content-posts.json' },
  iowa: { id: 'iowa', name: 'University of Iowa', shortName: 'Iowa', dataFile: '/data/iowa-content-posts.json' },
  'iowa state': { id: 'iowa-state', name: 'Iowa State University', shortName: 'Iowa State', dataFile: '/data/iowa-state-content-posts.json' },
  kansas: { id: 'kansas', name: 'University of Kansas', shortName: 'Kansas', dataFile: '/data/kansas-content-posts.json' },
  kentucky: { id: 'kentucky', name: 'Kentucky', shortName: 'Kentucky', dataFile: '/data/kentucky-content-posts.json' },
  lsu: { id: 'lsu', name: 'Louisiana State University', shortName: 'LSU', dataFile: '/data/lsu-content-posts.json' },
  michigan: { id: 'michigan', name: 'University of Michigan', shortName: 'Michigan', dataFile: '/data/michigan-content-posts.json' },
  'michigan state': { id: 'michigan-state', name: 'Michigan State University', shortName: 'Michigan State', dataFile: '/data/michigan-state-content-posts.json' },
  minnesota: { id: 'minnesota', name: 'University of Minnesota', shortName: 'Minnesota', dataFile: '/data/minnesota-content-posts.json' },
  'nc state': { id: 'nc-state', name: 'North Carolina State University', shortName: 'NC State', dataFile: '/data/nc-state-content-posts.json' },
  'notre dame': { id: 'notre-dame', name: 'University of Notre Dame', shortName: 'Notre Dame', dataFile: '/data/notre-dame-content-posts.json' },
  'ohio state': { id: 'ohio-state', name: 'The Ohio State University', shortName: 'Ohio State', dataFile: '/data/ohio-state-content-posts.json' },
  oklahoma: { id: 'oklahoma', name: 'University of Oklahoma', shortName: 'Oklahoma', dataFile: '/data/oklahoma-content-posts.json' },
  'ole miss': { id: 'ole-miss', name: 'University of Mississippi', shortName: 'Ole Miss', dataFile: '/data/ole-miss-content-posts.json' },
  oregon: { id: 'oregon', name: 'University of Oregon', shortName: 'Oregon', dataFile: '/data/oregon-content-posts.json' },
  smu: { id: 'smu', name: 'Southern Methodist University', shortName: 'SMU', dataFile: '/data/smu-content-posts.json' },
  tcu: { id: 'tcu', name: 'Texas Christian University', shortName: 'TCU', dataFile: '/data/tcu-content-posts.json' },
  tennessee: { id: 'tennessee', name: 'University of Tennessee', shortName: 'Tennessee', dataFile: '/data/tennessee-content-posts.json' },
  texas: { id: 'texas', name: 'University of Texas', shortName: 'Texas', dataFile: '/data/texas-content-posts.json' },
  'texas tech': { id: 'texas-tech', name: 'Texas Tech University', shortName: 'Texas Tech', dataFile: '/data/texas-tech-content-posts.json' },
  ucla: { id: 'ucla', name: 'University of California, Los Angeles', shortName: 'UCLA', dataFile: '/data/ucla-content-posts.json' },
  unc: { id: 'unc', name: 'University of North Carolina', shortName: 'UNC', dataFile: '/data/unc-content-posts.json' },
  'north carolina': { id: 'unc', name: 'University of North Carolina', shortName: 'UNC', dataFile: '/data/unc-content-posts.json' },
  usc: { id: 'usc', name: 'University of Southern California', shortName: 'USC', dataFile: '/data/usc-content-posts.json' },
  utah: { id: 'utah', name: 'University of Utah', shortName: 'Utah', dataFile: '/data/utah-content-posts.json' },
  vanderbilt: { id: 'vanderbilt', name: 'Vanderbilt University', shortName: 'Vanderbilt', dataFile: '/data/vanderbilt-content-posts.json' },
  virginia: { id: 'virginia', name: 'University of Virginia', shortName: 'Virginia', dataFile: '/data/virginia-content-posts.json' },
  washington: { id: 'washington', name: 'University of Washington', shortName: 'Washington', dataFile: '/data/washington-content-posts.json' },
  wisconsin: { id: 'wisconsin', name: 'University of Wisconsin', shortName: 'Wisconsin', dataFile: '/data/wisconsin-content-posts.json' },
};

export const TOURNAMENT_WINDOWS: TournamentWindow[] = [
  {
    gender: 'men',
    selectionSunday: '2026-03-15',
    titleGame: '2026-04-06',
    firstFourStart: '2026-03-17',
    roundOf64Start: '2026-03-19',
  },
  {
    gender: 'women',
    selectionSunday: '2026-03-15',
    titleGame: '2026-04-05',
    firstFourStart: '2026-03-18',
    roundOf64Start: '2026-03-20',
  },
];

export function normalizeSchoolName(name: string): string {
  return (REPORT_SCHOOL_ALIASES[name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()] || name)
    .toLowerCase()
    .replace(/\bthe\b/g, '')
    .replace(/\buniversity\b/g, '')
    .replace(/\bcollege\b/g, '')
    .replace(/\bat\b/g, '')
    .replace(/\bof\b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function createSchoolId(name: string): string {
  return normalizeSchoolName(name).replace(/\s+/g, '-');
}

export function getWindowForGender(gender: TournamentGender): TournamentWindow {
  return TOURNAMENT_WINDOWS.find((window) => window.gender === gender)!;
}

function getRuntimeSchoolConfigs(): RuntimeSchoolConfig[] {
  return Object.values(schoolConfigModule).filter((value) => {
    return Boolean(
      value &&
      typeof value === 'object' &&
      'id' in value &&
      'name' in value &&
      'shortName' in value &&
      'dataFile' in value
    );
  }) as RuntimeSchoolConfig[];
}

const ALL_SCHOOL_CONFIGS = getRuntimeSchoolConfigs();

export async function loadParticipants(): Promise<TournamentParticipant[]> {
  const response = await fetch('/data/march-madness-2026-participants.json');
  if (!response.ok) {
    throw new Error(`Unable to load March Madness participants: ${response.status}`);
  }
  return response.json();
}

export async function loadFollowerSnapshots(): Promise<FollowerSnapshot[]> {
  const response = await fetch('/data/march-madness-2026-follower-snapshots.json');
  if (!response.ok) {
    throw new Error(`Unable to load follower snapshots: ${response.status}`);
  }
  return response.json();
}

export async function loadManualDeals(): Promise<ManualDealRecord[]> {
  const response = await fetch('/data/march-madness-2026-manual-deals.json');
  if (!response.ok) {
    throw new Error(`Unable to load manual deals: ${response.status}`);
  }
  return response.json();
}

export function resolveLocalSchoolDataset(
  participant: TournamentParticipant
): LocalSchoolDataset {
  const participantNorm = normalizeSchoolName(participant.schoolName);
  const config = ALL_SCHOOL_CONFIGS.find((candidate) => {
    return (
      normalizeSchoolName(candidate.name) === participantNorm ||
      normalizeSchoolName(candidate.shortName) === participantNorm ||
      normalizeSchoolName(candidate.id) === participantNorm
    );
  }) || null;

  const fallback = FALLBACK_PUBLIC_DATA_SCHOOLS[participantNorm];
  const resolvedConfig = config || fallback || null;

  if (!resolvedConfig) {
    return { participant, config: null };
  }

  const rosterFile = resolvedConfig.rosterDataFile || resolvedConfig.dataFile.replace('-content-posts.json', '-roster.json');

  return {
    participant,
    config: resolvedConfig,
    contentFile: resolvedConfig.dataFile,
    rosterFile,
  };
}

export async function loadLocalRoster(dataset: LocalSchoolDataset): Promise<LoadedRosterAthlete[]> {
  if (!dataset.rosterFile) {
    return [];
  }

  try {
    const response = await fetch(dataset.rosterFile);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const athletes = Array.isArray(data) ? data : data?.athletes;
    if (!Array.isArray(athletes)) {
      return [];
    }

    const sport = dataset.participant.gender === 'men' ? 'MENS_BASKETBALL' : 'WOMENS_BASKETBALL';

    return athletes
      .filter((athlete) => athlete && athlete.sport === sport)
      .map((athlete) => ({
        athleteId: String(athlete._id || `${dataset.participant.schoolId}-${athlete.name}`),
        athleteName: athlete.name,
        schoolName: dataset.participant.schoolName,
        sport,
        gender: dataset.participant.gender,
        followers: Number(athlete.followers || 0),
      }));
  } catch (error) {
    console.warn(`Error loading roster ${dataset.rosterFile}:`, error);
    return [];
  }
}

export async function loadLocalPosts(dataset: LocalSchoolDataset): Promise<TournamentPost[]> {
  if (!dataset.contentFile) {
    return [];
  }

  try {
    const response = await fetch(dataset.contentFile);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    const allowedSport = dataset.participant.gender === 'men' ? 'MENS_BASKETBALL' : 'WOMENS_BASKETBALL';
    const window = getWindowForGender(dataset.participant.gender);
    const start = new Date(`${window.selectionSunday}T00:00:00Z`).getTime();
    const end = new Date(`${window.titleGame}T23:59:59Z`).getTime();
    const exclusions = new Set((dataset.config?.brandExclusions || []).map((brand) => normalizeBrandName(brand)));
    const aliases = dataset.config?.brandAliases || {};

    return data
      .map((post) => normalizePost(post, dataset.participant.schoolName, dataset.participant.gender, aliases))
      .filter((post): post is TournamentPost => Boolean(post))
      .filter((post) => {
        const publishedAt = new Date(post.publishedAt).getTime();
        return post.sport === allowedSport && publishedAt >= start && publishedAt <= end;
      })
      .filter((post) => !post.brandName || !exclusions.has(normalizeBrandName(post.brandName)));
  } catch (error) {
    console.warn(`Error loading posts ${dataset.contentFile}:`, error);
    return [];
  }
}

function normalizePost(
  rawPost: any,
  fallbackSchoolName: string,
  gender: TournamentGender,
  schoolAliases: Record<string, string>
): TournamentPost | null {
  const athlete = rawPost?.athlete;
  if (!athlete?.name || !athlete?.sport) {
    return null;
  }

  const publishedAt = rawPost?.publishedAt?.$date || rawPost?.createdAt?.$date;
  if (!publishedAt) {
    return null;
  }

  const rawBrand = typeof rawPost.sponsorPartner === 'string' ? rawPost.sponsorPartner : '';
  const brandName = rawBrand ? applyBrandAlias(rawBrand, schoolAliases) : null;

  return {
    postId: String(rawPost._id || rawPost.permalink || `${athlete.name}-${publishedAt}`),
    athleteId: athlete._id,
    athleteName: athlete.name,
    schoolName: fallbackSchoolName,
    gender,
    sport: athlete.sport,
    publishedAt,
    caption: rawPost.caption || '',
    brandName,
    platform: rawPost.source || 'INSTAGRAM',
    likes: Number(rawPost?.metrics?.likes || 0),
    comments: Number(rawPost?.metrics?.comments || 0),
    engagementRate: Number(rawPost?.metrics?.engagementRate || 0),
    sponsorPartner: rawBrand,
    isSponsored: Boolean(rawPost.isSponsored || rawPost.sponsored),
    isCollaboration: Boolean(rawPost.isCollaboration),
    isOrganizationCollaboration: Boolean(rawPost.isOrganizationCollaboration),
    hasOrganizationInCaption: Boolean(rawPost.hasOrganizationInCaption),
    hasOrganizationLogo: Boolean(rawPost.hasOrganizationLogo),
    permalink: rawPost.permalink,
  };
}

function applyBrandAlias(rawBrand: string, schoolAliases: Record<string, string>): string {
  const normalized = normalizeBrandName(rawBrand);
  const mergedAliases = {
    ...REPORT_BRAND_ALIASES,
    ...Object.fromEntries(
      Object.entries(schoolAliases).map(([key, value]) => [normalizeBrandName(key), normalizeBrandName(value)])
    ),
  };
  return mergedAliases[normalized] || normalized;
}

export function normalizeBrandName(brand: string): string {
  return brand
    .replace(/^@/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

export function formatBrandName(brand: string): string {
  return brand
    .replace(/^@/, '')
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
