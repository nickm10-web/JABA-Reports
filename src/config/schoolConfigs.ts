// ═══════════════════════════════════════════════════════════════
// NIL Report — School Configurations
// All stats derived from ncaa_updated_ip_contents_feb_18.json
// ═══════════════════════════════════════════════════════════════
import type { PeerSchool } from '../components/ucla/uclaTypes';

export interface NilSchoolColors {
  primary: string;
  secondary: string;
  primaryDark: string;
  primaryDeep: string;
}

export interface SchoolConfig {
  id: string;
  name: string;
  shortName: string;
  nickname: string;
  logoUrl: string;
  conference: string;
  dataFile: string;
  colors: NilSchoolColors;
  peerSchools: PeerSchool[];
  benchmark: PeerSchool;
  /** Lowercase, no-@ handles to exclude from brand deals (NIL stores, collectives, team pages, etc.) */
  brandExclusions?: string[];
  /** Lowercase no-@ alias map: variant → canonical (for semantic deduplication) */
  brandAliases?: Record<string, string>;
}

// ─── Helper to build PeerSchool entries ──────────────────────
function peer(
  id: string, name: string, shortName: string, logoId: number,
  conference: string, totalDeals: number, totalEMV: number,
  avgEngagement: number, topSport: string, athleteCount: number, brandCount: number,
  monthlyRanks: number[]
): PeerSchool {
  return { id, name, shortName, logoUrl: `https://a.espncdn.com/i/teamlogos/ncaa/500/${logoId}.png`, conference, totalDeals, totalEMV, avgEngagement, topSport, athleteCount, brandCount, monthlyRanks };
}

// ─── Shared Peer Pools ────────────────────────────────────────

// Big Ten (for UCLA + Michigan)
const BIG_TEN_PEERS: PeerSchool[] = [
  peer('ohio-state', 'The Ohio State University', 'Ohio State', 194, 'Big Ten', 1021, 12886615, 35.29, 'Football', 707, 437, [1,1,1,1,1,1,1,1,1,1,1,1]),
  peer('usc', 'University of Southern California', 'USC', 30, 'Big Ten', 412, 5425791, 21.88, 'Football', 423, 246, [2,2,2,2,2,2,2,2,2,2,2,2]),
  peer('penn-state', 'Penn State University', 'Penn State', 213, 'Big Ten', 443, 8140999, 27.16, 'Football', 572, 280, [3,3,3,3,3,3,3,3,3,3,3,3]),
  peer('ucla', 'University of California, Los Angeles', 'UCLA', 26, 'Big Ten', 422, 6674959, 22.93, "Women's Gymnastics", 506, 256, [4,4,4,4,4,4,4,4,4,4,4,4]),
  peer('wisconsin', 'University of Wisconsin', 'Wisconsin', 275, 'Big Ten', 403, 4372736, 27.09, 'Football', 475, 206, [5,5,5,5,5,5,5,5,5,5,5,5]),
  peer('michigan', 'University of Michigan', 'Michigan', 130, 'Big Ten', 427, 4661075, 27.28, 'Football', 395, 243, [4,4,4,4,4,4,4,4,4,4,4,4]),
  peer('nebraska', 'University of Nebraska', 'Nebraska', 158, 'Big Ten', 313, 7122549, 27.68, 'Football', 255, 155, [6,6,6,6,6,6,6,6,6,6,6,6]),
  peer('maryland', 'University of Maryland', 'Maryland', 309, 'Big Ten', 135, 1149150, 19.58, 'Football', 205, 90, [7,7,7,7,7,7,7,7,7,7,7,7]),
];

// SEC (for Alabama + Arkansas + Oklahoma)
const SEC_PEERS: PeerSchool[] = [
  peer('ohio-state', 'The Ohio State University', 'Ohio State', 194, 'Big Ten', 1021, 12886615, 35.29, 'Football', 707, 437, [1,1,1,1,1,1,1,1,1,1,1,1]),
  peer('texas', 'University of Texas', 'Texas', 251, 'SEC', 609, 6849245, 28.26, 'Football', 432, 294, [2,2,2,2,2,2,2,2,2,2,2,2]),
  peer('georgia', 'University of Georgia', 'Georgia', 61, 'SEC', 617, 6221304, 22.51, 'Football', 370, 357, [3,3,3,3,3,3,3,3,3,3,3,3]),
  peer('lsu', 'Louisiana State University', 'LSU', 99, 'SEC', 353, 7590985, 25.89, 'Football', 305, 219, [4,4,4,4,4,4,4,4,4,4,4,4]),
  peer('alabama', 'The University of Alabama', 'Alabama', 333, 'SEC', 489, 7923447, 24.52, 'Football', 379, 261, [5,5,5,5,5,5,5,5,5,5,5,5]),
  peer('auburn', 'Auburn University', 'Auburn', 2, 'SEC', 298, 4971634, 24.35, 'Football', 384, 164, [6,6,6,6,6,6,6,6,6,6,6,6]),
  peer('arkansas', 'University of Arkansas', 'Arkansas', 8, 'SEC', 380, 4355212, 22.87, 'Football', 384, 246, [7,7,7,7,7,7,7,7,7,7,7,7]),
  peer('texas-am', 'Texas A&M University', 'Texas A&M', 245, 'SEC', 274, 4332778, 31.51, 'Football', 274, 163, [8,8,8,8,8,8,8,8,8,8,8,8]),
];

// Notre Dame national peers
const NOTRE_DAME_PEERS: PeerSchool[] = [
  peer('ohio-state', 'The Ohio State University', 'Ohio State', 194, 'Big Ten', 1021, 12886615, 35.29, 'Football', 707, 437, [1,1,1,1,1,1,1,1,1,1,1,1]),
  peer('clemson', 'Clemson University', 'Clemson', 228, 'ACC', 259, 3767070, 32.08, 'Football', 240, 134, [2,2,2,2,2,2,2,2,2,2,2,2]),
  peer('georgia', 'University of Georgia', 'Georgia', 61, 'SEC', 617, 6221304, 22.51, 'Football', 370, 357, [3,3,3,3,3,3,3,3,3,3,3,3]),
  peer('alabama', 'The University of Alabama', 'Alabama', 333, 'SEC', 489, 7923447, 24.52, 'Football', 379, 261, [4,4,4,4,4,4,4,4,4,4,4,4]),
  peer('michigan', 'University of Michigan', 'Michigan', 130, 'Big Ten', 427, 4661075, 27.28, 'Football', 395, 243, [5,5,5,5,5,5,5,5,5,5,5,5]),
  peer('usc', 'University of Southern California', 'USC', 30, 'Big Ten', 412, 5425791, 21.88, 'Football', 423, 246, [6,6,6,6,6,6,6,6,6,6,6,6]),
  peer('penn-state', 'Penn State University', 'Penn State', 213, 'Big Ten', 443, 8140999, 27.16, 'Football', 572, 280, [7,7,7,7,7,7,7,7,7,7,7,7]),
  peer('unc', 'University of North Carolina', 'UNC', 153, 'ACC', 198, 3044521, 29.9, 'Football', 226, 115, [8,8,8,8,8,8,8,8,8,8,8,8]),
];

// Mountain West (for Boise State)
const MOUNTAIN_WEST_PEERS: PeerSchool[] = [
  peer('san-diego-state', 'San Diego State University', 'San Diego State', 21, 'Mountain West', 191, 928954, 17.87, 'Football', 311, 94, [1,1,1,1,1,1,1,1,1,1,1,1]),
  peer('new-mexico', 'University of New Mexico', 'New Mexico', 167, 'Mountain West', 1, 321520, 21.84, 'Football', 129, 1, [2,2,2,2,2,2,2,2,2,2,2,2]),
  peer('fresno-state', 'Fresno State University', 'Fresno State', 278, 'Mountain West', 35, 450000, 20.1, 'Football', 120, 40, [3,3,3,3,3,3,3,3,3,3,3,3]),
  peer('unlv', 'University of Nevada Las Vegas', 'UNLV', 2439, 'Mountain West', 20, 280000, 18.5, 'Football', 90, 25, [4,4,4,4,4,4,4,4,4,4,4,4]),
  peer('utah-state', 'Utah State University', 'Utah State', 328, 'Mountain West', 15, 200000, 19.2, 'Football', 80, 20, [5,5,5,5,5,5,5,5,5,5,5,5]),
  peer('air-force', 'Air Force Academy', 'Air Force', 2005, 'Mountain West', 10, 150000, 17.0, 'Football', 60, 15, [6,6,6,6,6,6,6,6,6,6,6,6]),
  peer('wyoming', 'University of Wyoming', 'Wyoming', 264, 'Mountain West', 8, 100000, 16.5, 'Football', 50, 12, [7,7,7,7,7,7,7,7,7,7,7,7]),
  peer('colorado-state', 'Colorado State University', 'Colorado State', 36, 'Mountain West', 12, 180000, 18.0, 'Football', 70, 18, [8,8,8,8,8,8,8,8,8,8,8,8]),
];

// ─── School Configurations ────────────────────────────────────

export const uclaConfig: SchoolConfig = {
  id: 'ucla',
  name: 'University of California, Los Angeles',
  shortName: 'UCLA',
  nickname: 'Bruins',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/26.png',
  conference: 'Big Ten',
  dataFile: '/data/ucla-content-posts.json',
  colors: {
    primary: '#2D68C4',
    secondary: '#F2A900',
    primaryDark: '#1a4a9e',
    primaryDeep: '#0f3278',
  },
  peerSchools: BIG_TEN_PEERS.filter(p => p.id !== 'ucla'),
  benchmark: peer('ucla', 'University of California, Los Angeles', 'UCLA', 26, 'Big Ten', 422, 6674959, 22.93, "Women's Gymnastics", 506, 256, [4,4,4,4,4,4,4,4,4,4,4,4]),
};

export const michiganConfig: SchoolConfig = {
  id: 'michigan',
  name: 'University of Michigan',
  shortName: 'Michigan',
  nickname: 'Wolverines',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/130.png',
  conference: 'Big Ten',
  dataFile: '/data/michigan-content-posts.json',
  colors: {
    primary: '#00274C',
    secondary: '#FFCB05',
    primaryDark: '#001a33',
    primaryDeep: '#000d1a',
  },
  peerSchools: BIG_TEN_PEERS.filter(p => p.id !== 'michigan'),
  benchmark: peer('michigan', 'University of Michigan', 'Michigan', 130, 'Big Ten', 427, 4661075, 27.28, 'Football', 395, 243, [4,4,4,4,4,4,4,4,4,4,4,4]),
  brandExclusions: ['championscircle.nilshop', 'champmediaco', 'championscircleuofm', 'swingcityracketsports'],
  brandAliases: { 'drinkdripdrop': 'dripdrop' },
};

export const alabamaConfig: SchoolConfig = {
  id: 'alabama',
  name: 'The University of Alabama',
  shortName: 'Alabama',
  nickname: 'Crimson Tide',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/333.png',
  conference: 'SEC',
  dataFile: '/data/alabama-content-posts.json',
  colors: {
    primary: '#9E1B32',
    secondary: '#FFFFFF',
    primaryDark: '#7a1426',
    primaryDeep: '#56091a',
  },
  peerSchools: SEC_PEERS.filter(p => p.id !== 'alabama'),
  benchmark: peer('alabama', 'The University of Alabama', 'Alabama', 333, 'SEC', 489, 7923447, 24.52, 'Football', 379, 261, [5,5,5,5,5,5,5,5,5,5,5,5]),
  brandExclusions: ['crimsontidethreads', 'athletesthread', 'pantsstore', 'hidethetideofficial', 'yea_ala'],
};

export const arkansasConfig: SchoolConfig = {
  id: 'arkansas',
  name: 'University of Arkansas',
  shortName: 'Arkansas',
  nickname: 'Razorbacks',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/8.png',
  conference: 'SEC',
  dataFile: '/data/arkansas-content-posts.json',
  colors: {
    primary: '#9D2235',
    secondary: '#FFFFFF',
    primaryDark: '#7a1a28',
    primaryDeep: '#57111b',
  },
  peerSchools: SEC_PEERS.filter(p => p.id !== 'arkansas'),
  benchmark: peer('arkansas', 'University of Arkansas', 'Arkansas', 8, 'SEC', 380, 4355212, 22.87, 'Football', 384, 246, [7,7,7,7,7,7,7,7,7,7,7,7]),
  brandExclusions: ['razorbackthreads', 'xx_xyathletics'],
};

export const oklahomaConfig: SchoolConfig = {
  id: 'oklahoma',
  name: 'University of Oklahoma',
  shortName: 'Oklahoma',
  nickname: 'Sooners',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/201.png',
  conference: 'SEC',
  dataFile: '/data/oklahoma-content-posts.json',
  colors: {
    primary: '#841617',
    secondary: '#FDF9D8',
    primaryDark: '#5e1011',
    primaryDeep: '#38090a',
  },
  peerSchools: SEC_PEERS.filter(p => p.id !== 'oklahoma'),
  benchmark: peer('oklahoma', 'University of Oklahoma', 'Oklahoma', 201, 'SEC', 237, 2870594, 30.59, 'Football', 225, 127, [8,8,8,8,8,8,8,8,8,8,8,8]),
  brandExclusions: ['soonersthreads', 'influxersooners', 'myplayerathlete'],
};

export const notredameConfig: SchoolConfig = {
  id: 'notre-dame',
  name: 'University of Notre Dame',
  shortName: 'Notre Dame',
  nickname: 'Fighting Irish',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/87.png',
  conference: 'Independent / ACC',
  dataFile: '/data/notre-dame-content-posts.json',
  colors: {
    primary: '#0C2340',
    secondary: '#C99700',
    primaryDark: '#07172b',
    primaryDeep: '#030c16',
  },
  peerSchools: NOTRE_DAME_PEERS.filter(p => p.id !== 'notre-dame'),
  benchmark: peer('notre-dame', 'University of Notre Dame', 'Notre Dame', 87, 'Independent / ACC', 197, 4107244, 30.6, 'Football', 200, 102, [4,4,4,4,4,4,4,4,4,4,4,4]),
  brandExclusions: ['notredamethreads', 'invescous'],
};

export const boiseStateConfig: SchoolConfig = {
  id: 'boise-state',
  name: 'Boise State University',
  shortName: 'Boise State',
  nickname: 'Broncos',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/68.png',
  conference: 'Mountain West',
  dataFile: '/data/boise-state-content-posts.json',
  colors: {
    primary: '#0033A0',
    secondary: '#D64309',
    primaryDark: '#002270',
    primaryDeep: '#001040',
  },
  peerSchools: MOUNTAIN_WEST_PEERS.filter(p => p.id !== 'boise-state'),
  benchmark: peer('boise-state', 'Boise State University', 'Boise State', 68, 'Mountain West', 288, 1273728, 24.71, 'Football', 300, 142, [1,1,1,1,1,1,1,1,1,1,1,1]),
  brandExclusions: ['boisestatethreads', 'broncosports', 'voxnclothing'],
};
