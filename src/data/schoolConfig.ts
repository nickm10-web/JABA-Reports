// School Configuration for multi-school dashboard support
// Each school can have its own theme, colors, and branding

export interface SchoolConfig {
  id: string;
  name: string;
  shortName: string;
  mascot: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  conference: string;
  location: string;
  dataName: string; // Name used in the social media data JSON
}

// ============ SEC SCHOOLS ============

export const AUBURN: SchoolConfig = {
  id: 'auburn',
  name: 'Auburn University',
  shortName: 'Auburn',
  mascot: 'Tigers',
  primaryColor: '#0C2340', // Navy Blue
  secondaryColor: '#E87722', // Orange
  accentColor: '#F26522', // Bright Orange
  conference: 'SEC',
  location: 'Auburn, AL',
  dataName: 'Auburn University',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png'
};

export const ALABAMA: SchoolConfig = {
  id: 'alabama',
  name: 'University of Alabama',
  shortName: 'Alabama',
  mascot: 'Crimson Tide',
  primaryColor: '#9E1B32', // Crimson
  secondaryColor: '#FFFFFF', // White
  accentColor: '#821629', // Dark Crimson
  conference: 'SEC',
  location: 'Tuscaloosa, AL',
  dataName: 'The University of Alabama',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/333.png'
};

export const FLORIDA: SchoolConfig = {
  id: 'florida',
  name: 'University of Florida',
  shortName: 'Florida',
  mascot: 'Gators',
  primaryColor: '#0021A5', // Blue
  secondaryColor: '#FA4616', // Orange
  accentColor: '#FA4616', // Orange
  conference: 'SEC',
  location: 'Gainesville, FL',
  dataName: 'Florida',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/57.png'
};

export const GEORGIA: SchoolConfig = {
  id: 'georgia',
  name: 'University of Georgia',
  shortName: 'Georgia',
  mascot: 'Bulldogs',
  primaryColor: '#BA0C2F', // Red
  secondaryColor: '#000000', // Black
  accentColor: '#9D2235', // Dark Red
  conference: 'SEC',
  location: 'Athens, GA',
  dataName: 'University Of Georgia',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/61.png'
};

export const KENTUCKY: SchoolConfig = {
  id: 'kentucky',
  name: 'University of Kentucky',
  shortName: 'Kentucky',
  mascot: 'Wildcats',
  primaryColor: '#0033A0', // Blue
  secondaryColor: '#FFFFFF', // White
  accentColor: '#1C5BA2', // Light Blue
  conference: 'SEC',
  location: 'Lexington, KY',
  dataName: 'Kentucky',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/96.png'
};

export const TENNESSEE: SchoolConfig = {
  id: 'tennessee',
  name: 'University of Tennessee',
  shortName: 'Tennessee',
  mascot: 'Volunteers',
  primaryColor: '#FF8200', // Tennessee Orange
  secondaryColor: '#FFFFFF', // White
  accentColor: '#58595B', // Smokey Gray
  conference: 'SEC',
  location: 'Knoxville, TN',
  dataName: 'Tennessee',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2633.png'
};

export const TEXAS: SchoolConfig = {
  id: 'texas',
  name: 'University of Texas at Austin',
  shortName: 'Texas',
  mascot: 'Longhorns',
  primaryColor: '#BF5700', // Burnt Orange
  secondaryColor: '#FFFFFF', // White
  accentColor: '#333F48', // Dark Gray
  conference: 'SEC',
  location: 'Austin, TX',
  dataName: 'University Of Texas',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/251.png'
};

export const MIZZOU: SchoolConfig = {
  id: 'mizzou',
  name: 'University of Missouri',
  shortName: 'Mizzou',
  mascot: 'Tigers',
  primaryColor: '#F1B82D', // Gold
  secondaryColor: '#000000', // Black
  accentColor: '#D6A121', // Dark Gold
  conference: 'SEC',
  location: 'Columbia, MO',
  dataName: 'University of Missouri',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/142.png'
};

export const OKLAHOMA: SchoolConfig = {
  id: 'oklahoma',
  name: 'University of Oklahoma',
  shortName: 'Oklahoma',
  mascot: 'Sooners',
  primaryColor: '#841617', // Crimson
  secondaryColor: '#FDF9D8', // Cream
  accentColor: '#6D0C0D', // Dark Crimson
  conference: 'SEC',
  location: 'Norman, OK',
  dataName: 'Oklahoma',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/201.png'
};

export const LSU: SchoolConfig = {
  id: 'lsu',
  name: 'Louisiana State University',
  shortName: 'LSU',
  mascot: 'Tigers',
  primaryColor: '#461D7C', // Purple
  secondaryColor: '#FDD023', // Gold
  accentColor: '#3B1A5C', // Dark Purple
  conference: 'SEC',
  location: 'Baton Rouge, LA',
  dataName: 'Louisiana State University',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/99.png'
};

export const TEXAS_AM: SchoolConfig = {
  id: 'texas-am',
  name: 'Texas A&M University',
  shortName: 'Texas A&M',
  mascot: 'Aggies',
  primaryColor: '#500000', // Maroon
  secondaryColor: '#FFFFFF', // White
  accentColor: '#3C0000', // Dark Maroon
  conference: 'SEC',
  location: 'College Station, TX',
  dataName: 'Texas A&M',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/245.png'
};

// ============ BIG TEN SCHOOLS ============

export const OHIO_STATE: SchoolConfig = {
  id: 'ohio-state',
  name: 'The Ohio State University',
  shortName: 'Ohio State',
  mascot: 'Buckeyes',
  primaryColor: '#BB0000', // Scarlet
  secondaryColor: '#666666', // Gray
  accentColor: '#FF0000', // Bright Scarlet
  conference: 'Big Ten',
  location: 'Columbus, OH',
  dataName: 'Ohio State',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png'
};

export const PENN_STATE: SchoolConfig = {
  id: 'penn-state',
  name: 'Penn State University',
  shortName: 'Penn State',
  mascot: 'Nittany Lions',
  primaryColor: '#041E42', // Navy Blue
  secondaryColor: '#FFFFFF', // White
  accentColor: '#1E407C', // Medium Blue
  conference: 'Big Ten',
  location: 'University Park, PA',
  dataName: 'Penn State University',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Penn_State_Nittany_Lions_logo.svg/1200px-Penn_State_Nittany_Lions_logo.svg.png'
};

export const PURDUE: SchoolConfig = {
  id: 'purdue',
  name: 'Purdue University',
  shortName: 'Purdue',
  mascot: 'Boilermakers',
  primaryColor: '#CEB888', // Old Gold
  secondaryColor: '#000000', // Black
  accentColor: '#9D968D', // Dusty Gold
  conference: 'Big Ten',
  location: 'West Lafayette, IN',
  dataName: 'Purdue University',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png'
};

export const WISCONSIN: SchoolConfig = {
  id: 'wisconsin',
  name: 'University of Wisconsin',
  shortName: 'Wisconsin',
  mascot: 'Badgers',
  primaryColor: '#C5050C', // Cardinal Red
  secondaryColor: '#FFFFFF', // White
  accentColor: '#9B0000', // Dark Red
  conference: 'Big Ten',
  location: 'Madison, WI',
  dataName: 'University of Wisconsin',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/275.png'
};

export const MINNESOTA: SchoolConfig = {
  id: 'minnesota',
  name: 'University of Minnesota',
  shortName: 'Minnesota',
  mascot: 'Golden Gophers',
  primaryColor: '#7A0019', // Maroon
  secondaryColor: '#FFCC33', // Gold
  accentColor: '#FFD700', // Bright Gold
  conference: 'Big Ten',
  location: 'Minneapolis, MN',
  dataName: 'Minnesota',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/135.png'
};

export const USC: SchoolConfig = {
  id: 'usc',
  name: 'University of Southern California',
  shortName: 'USC',
  mascot: 'Trojans',
  primaryColor: '#990000', // Cardinal
  secondaryColor: '#FFC72C', // Gold
  accentColor: '#FFCC00', // Bright Gold
  conference: 'Big Ten',
  location: 'Los Angeles, CA',
  dataName: 'University of Southern California (USC)',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/30.png'
};

export const UCLA: SchoolConfig = {
  id: 'ucla',
  name: 'University of California, Los Angeles',
  shortName: 'UCLA',
  mascot: 'Bruins',
  primaryColor: '#2D68C4', // UCLA Blue
  secondaryColor: '#F2A900', // UCLA Gold
  accentColor: '#FFD100', // Bright Gold
  conference: 'Big Ten',
  location: 'Los Angeles, CA',
  dataName: 'University of California, Los Angeles',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/26.png'
};

export const MICHIGAN: SchoolConfig = {
  id: 'michigan',
  name: 'University of Michigan',
  shortName: 'Michigan',
  mascot: 'Wolverines',
  primaryColor: '#00274C', // Michigan Blue
  secondaryColor: '#FFCB05', // Maize
  accentColor: '#1a4a70', // Medium Blue
  conference: 'Big Ten',
  location: 'Ann Arbor, MI',
  dataName: 'Michigan',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/130.png'
};

export const MICHIGAN_STATE: SchoolConfig = {
  id: 'michigan-state',
  name: 'Michigan State University',
  shortName: 'Michigan State',
  mascot: 'Spartans',
  primaryColor: '#18453B', // Spartan Green
  secondaryColor: '#FFFFFF', // White
  accentColor: '#0B9A6D', // Bright Green
  conference: 'Big Ten',
  location: 'East Lansing, MI',
  dataName: 'Michigan State University',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/127.png'
};

// ============ ACC SCHOOLS ============

export const CLEMSON: SchoolConfig = {
  id: 'clemson',
  name: 'Clemson University',
  shortName: 'Clemson',
  mascot: 'Tigers',
  primaryColor: '#F56600', // Clemson Orange
  secondaryColor: '#522D80', // Regalia Purple
  accentColor: '#FF6B00', // Bright Orange
  conference: 'ACC',
  location: 'Clemson, SC',
  dataName: 'Clemson',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/228.png'
};

export const VIRGINIA: SchoolConfig = {
  id: 'virginia',
  name: 'University of Virginia',
  shortName: 'Virginia',
  mascot: 'Cavaliers',
  primaryColor: '#232D4B', // Navy Blue
  secondaryColor: '#F84C1E', // Orange
  accentColor: '#E57200', // Cavalier Orange
  conference: 'ACC',
  location: 'Charlottesville, VA',
  dataName: 'Virginia',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/258.png'
};

export const NC_STATE: SchoolConfig = {
  id: 'nc-state',
  name: 'North Carolina State University',
  shortName: 'NC State',
  mascot: 'Wolfpack',
  primaryColor: '#CC0000', // Wolfpack Red
  secondaryColor: '#FFFFFF', // White
  accentColor: '#990000', // Dark Red
  conference: 'ACC',
  location: 'Raleigh, NC',
  dataName: 'North Carolina State',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/152.png'
};

export const UNC: SchoolConfig = {
  id: 'unc',
  name: 'University of North Carolina',
  shortName: 'UNC',
  mascot: 'Tar Heels',
  primaryColor: '#7BAFD4', // Carolina Blue
  secondaryColor: '#FFFFFF', // White
  accentColor: '#13294B', // Navy
  conference: 'ACC',
  location: 'Chapel Hill, NC',
  dataName: 'University of North Carolina (UNC)',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/153.png'
};

export const PITT: SchoolConfig = {
  id: 'pitt',
  name: 'University of Pittsburgh',
  shortName: 'Pitt',
  mascot: 'Panthers',
  primaryColor: '#003594', // Pitt Blue
  secondaryColor: '#FFB81C', // Pitt Gold
  accentColor: '#CDB87D', // Accent Gold
  conference: 'ACC',
  location: 'Pittsburgh, PA',
  dataName: 'Pittsburgh',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/221.png'
};

export const NOTRE_DAME: SchoolConfig = {
  id: 'notre-dame',
  name: 'University of Notre Dame',
  shortName: 'Notre Dame',
  mascot: 'Fighting Irish',
  primaryColor: '#0C2340', // Notre Dame Blue
  secondaryColor: '#C99700', // Gold
  accentColor: '#AE9142', // Metallic Gold
  conference: 'ACC',
  location: 'Notre Dame, IN',
  dataName: 'Notre Dame',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/87.png'
};

export const SMU: SchoolConfig = {
  id: 'smu',
  name: 'Southern Methodist University',
  shortName: 'SMU',
  mascot: 'Mustangs',
  primaryColor: '#CC0035', // SMU Red
  secondaryColor: '#354CA1', // SMU Blue
  accentColor: '#0033A0', // Bright Blue
  conference: 'ACC',
  location: 'Dallas, TX',
  dataName: 'Southern Methodist University (SMU)',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2567.png'
};

// ============ BIG 12 SCHOOLS ============

export const BAYLOR: SchoolConfig = {
  id: 'baylor',
  name: 'Baylor University',
  shortName: 'Baylor',
  mascot: 'Bears',
  primaryColor: '#154734', // Baylor Green
  secondaryColor: '#FFB81C', // Baylor Gold
  accentColor: '#21412A', // Dark Green
  conference: 'Big 12',
  location: 'Waco, TX',
  dataName: 'Baylor',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/239.png'
};

export const ARIZONA: SchoolConfig = {
  id: 'arizona',
  name: 'University of Arizona',
  shortName: 'Arizona',
  mascot: 'Wildcats',
  primaryColor: '#CC0033', // Arizona Red
  secondaryColor: '#003366', // Arizona Blue
  accentColor: '#AB0520', // Cardinal Red
  conference: 'Big 12',
  location: 'Tucson, AZ',
  dataName: 'The University of Arizona',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/12.png'
};

export const ARIZONA_STATE: SchoolConfig = {
  id: 'arizona-state',
  name: 'Arizona State University',
  shortName: 'Arizona State',
  mascot: 'Sun Devils',
  primaryColor: '#8C1D40', // Maroon
  secondaryColor: '#FFC627', // Gold
  accentColor: '#FFB310', // Sun Gold
  conference: 'Big 12',
  location: 'Tempe, AZ',
  dataName: 'Arizona State University',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/9.png'
};

export const CINCINNATI: SchoolConfig = {
  id: 'cincinnati',
  name: 'University of Cincinnati',
  shortName: 'Cincinnati',
  mascot: 'Bearcats',
  primaryColor: '#E00122', // Red
  secondaryColor: '#000000', // Black
  accentColor: '#C5093B', // Dark Red
  conference: 'Big 12',
  location: 'Cincinnati, OH',
  dataName: 'Cincinnati',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2132.png'
};

export const UCF: SchoolConfig = {
  id: 'ucf',
  name: 'University of Central Florida',
  shortName: 'UCF',
  mascot: 'Knights',
  primaryColor: '#000000', // Black
  secondaryColor: '#BA9B37', // UCF Gold
  accentColor: '#FFC904', // Bright Gold
  conference: 'Big 12',
  location: 'Orlando, FL',
  dataName: 'University of Central Florida',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png'
};

// ============ MOUNTAIN WEST SCHOOLS ============

export const BOISE_STATE: SchoolConfig = {
  id: 'boise-state',
  name: 'Boise State University',
  shortName: 'Boise State',
  mascot: 'Broncos',
  primaryColor: '#0033A0', // Boise Blue
  secondaryColor: '#D64309', // Bronco Orange
  accentColor: '#FF5F0F', // Bright Orange
  conference: 'Mountain West',
  location: 'Boise, ID',
  dataName: 'Boise State',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/68.png'
};

export const SAN_DIEGO: SchoolConfig = {
  id: 'san-diego',
  name: 'University of San Diego',
  shortName: 'San Diego',
  mascot: 'Toreros',
  primaryColor: '#002855', // USD Blue
  secondaryColor: '#A7A8AA', // Columbia Blue
  accentColor: '#7C878E', // Slate
  conference: 'West Coast',
  location: 'San Diego, CA',
  dataName: 'University of San Diego',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/301.png'
};

// ============ BIG EAST SCHOOLS ============

export const DEPAUL: SchoolConfig = {
  id: 'depaul',
  name: 'DePaul University',
  shortName: 'DePaul',
  mascot: 'Blue Demons',
  primaryColor: '#005EB8', // DePaul Blue
  secondaryColor: '#E4002B', // DePaul Red
  accentColor: '#1E3A8A', // Dark Blue
  conference: 'Big East',
  location: 'Chicago, IL',
  dataName: 'Depaul',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/305.png'
};

// ============ AAC SCHOOLS ============

export const UTSA: SchoolConfig = {
  id: 'utsa',
  name: 'University of Texas at San Antonio',
  shortName: 'UTSA',
  mascot: 'Roadrunners',
  primaryColor: '#0C2340', // Navy Blue
  secondaryColor: '#F15A22', // Orange
  accentColor: '#002244', // Dark Navy
  conference: 'AAC',
  location: 'San Antonio, TX',
  dataName: 'University of Texas at San Antonio (UTSA)',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2636.png'
};

// ============ PAC-12 SCHOOLS ============

export const WASHINGTON_STATE: SchoolConfig = {
  id: 'washington-state',
  name: 'Washington State University',
  shortName: 'Washington State',
  mascot: 'Cougars',
  primaryColor: '#981E32', // Crimson
  secondaryColor: '#5E6A71', // Gray
  accentColor: '#6E1E32', // Dark Crimson
  conference: 'Pac-12',
  location: 'Pullman, WA',
  dataName: 'Washington State',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/265.png'
};

// ============ OTHER SCHOOLS ============

export const ROBERT_MORRIS: SchoolConfig = {
  id: 'robert-morris',
  name: 'Robert Morris University',
  shortName: 'Robert Morris',
  mascot: 'Colonials',
  primaryColor: '#002D62', // RMU Blue
  secondaryColor: '#BD1E2D', // RMU Red
  accentColor: '#FFFFFF', // White
  conference: 'Horizon League',
  location: 'Moon Township, PA',
  dataName: 'Robert Morris University',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2523.png'
};

// ============ AGENCY/COMPANY DASHBOARDS ============

// Playfly Sports - represents athletes from multiple partner schools
export const PLAYFLY: SchoolConfig = {
  id: 'playfly',
  name: 'Playfly Sports',
  shortName: 'Playfly',
  mascot: 'Partners',
  primaryColor: '#1E3A8A', // Playfly Blue
  secondaryColor: '#FFFFFF', // White
  accentColor: '#1E40AF', // Dark Blue
  conference: 'Multi-School',
  location: 'New York, NY',
  dataName: 'Playfly', // Special marker for multi-school loading
  logoUrl: '/playfly-logo.jpg'
};

export const SAINT_JUDE: SchoolConfig = {
  id: 'saint-jude',
  name: "St. Jude Children's Research Hospital",
  shortName: 'St. Jude',
  mascot: 'Hospital',
  primaryColor: '#C8102E', // St. Jude Red
  secondaryColor: '#FFFFFF', // White
  accentColor: '#A50F2D', // Dark Red
  conference: 'Healthcare',
  location: 'Memphis, TN',
  dataName: 'Saint Jude Hospital',
  logoUrl: '/st-jude-logo.svg'
};

// Partner schools for Playfly - All 36 schools with name variations for matching
export const PLAYFLY_PARTNER_SCHOOLS = [
  // SEC
  'Auburn University', 'Auburn',
  'Louisiana State University', 'LSU',
  'Texas A&M',
  'The University of Alabama', 'Alabama',
  'Tennessee',

  // Big 12
  'Baylor',
  'University of Central Florida', 'UCF',
  'Houston',
  'Rice University', 'Rice',
  'The University of Arizona', 'Arizona',
  'Arizona State University', 'Arizona State',

  // Pac-12/Big Ten
  'University of Southern California (USC)', 'USC',
  'Oregon',
  'Oregon State University', 'Oregon State',
  'Washington State',
  'Nebraska',
  'Michigan State', 'Michigan State University',
  'Penn State University', 'Penn State',
  'Maryland',

  // ACC
  'Virginia',

  // Big East
  'Villanova University', 'Villanova',
  'Georgetown University', 'Georgetown',
  'Butler University', 'Butler',
  'Creighton University', 'Creighton',
  'Depaul', 'DePaul',
  'Marquette University', 'Marquette',
  'Providence College', 'Providence',
  'Seton Hall University', 'Seton Hall',
  'St. John\'s University', 'St. John\'s',
  'Xavier University', 'Xavier',

  // Other
  'Old Dominion University', 'Old Dominion',
  'Wichita State University', 'Wichita State',
  'Oral Roberts University (ORU)', 'Oral Roberts',
  'University of New Mexico', 'New Mexico',
  'New Mexico State University', 'New Mexico State',
  'University of Texas at San Antonio (UTSA)', 'UTSA',
];

// ============ ALL SCHOOLS LOOKUP MAP ============

export const SCHOOLS: Record<string, SchoolConfig> = {
  // SEC
  'auburn': AUBURN,
  'alabama': ALABAMA,
  'florida': FLORIDA,
  'georgia': GEORGIA,
  'kentucky': KENTUCKY,
  'tennessee': TENNESSEE,
  'texas': TEXAS,
  'mizzou': MIZZOU,
  'oklahoma': OKLAHOMA,
  'lsu': LSU,
  'texas-am': TEXAS_AM,
  // Big Ten
  'michigan': MICHIGAN,
  'ohio-state': OHIO_STATE,
  'penn-state': PENN_STATE,
  'purdue': PURDUE,
  'wisconsin': WISCONSIN,
  'minnesota': MINNESOTA,
  'usc': USC,
  'ucla': UCLA,
  'michigan-state': MICHIGAN_STATE,
  'msu': MICHIGAN_STATE,
  // ACC
  'clemson': CLEMSON,
  'virginia': VIRGINIA,
  'nc-state': NC_STATE,
  'unc': UNC,
  'pitt': PITT,
  'notre-dame': NOTRE_DAME,
  'smu': SMU,
  // Big 12
  'baylor': BAYLOR,
  'arizona': ARIZONA,
  'arizona-state': ARIZONA_STATE,
  'cincinnati': CINCINNATI,
  'ucf': UCF,
  // Mountain West / West Coast
  'boise-state': BOISE_STATE,
  'san-diego': SAN_DIEGO,
  // Big East
  'depaul': DEPAUL,
  // AAC
  'utsa': UTSA,
  // Pac-12
  'washington-state': WASHINGTON_STATE,
  // Other
  'robert-morris': ROBERT_MORRIS,
  // Agencies
  'playfly': PLAYFLY,
  'saint-jude': SAINT_JUDE,
};

// Get school by ID
export const getSchoolById = (id: string): SchoolConfig | null => {
  return SCHOOLS[id] || null;
};

// Get school by data name (for matching with JSON data)
export const getSchoolByDataName = (dataName: string): SchoolConfig | null => {
  const normalizedName = dataName.toLowerCase();
  for (const school of Object.values(SCHOOLS)) {
    if (school.dataName.toLowerCase() === normalizedName) {
      return school;
    }
  }
  return null;
};

// Detect school from URL path (e.g., /alabama, /penn-state, /cincinnati)
export const getSchoolFromUrl = (): SchoolConfig => {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname.toLowerCase();

    // Check for path-based school routing (e.g., /alabama/dashboard, /penn-state)
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const potentialSchoolId = pathSegments[0];
      const school = SCHOOLS[potentialSchoolId];
      if (school) {
        return school;
      }
    }

    // Fallback: Check hostname for subdomain-based routing
    const hostname = window.location.hostname.toLowerCase();
    for (const [id, school] of Object.entries(SCHOOLS)) {
      if (hostname.includes(id.replace('-', ''))) {
        return school;
      }
    }
  }
  // Default to Penn State
  return PENN_STATE;
};

// Extract school ID from URL path
export const getSchoolIdFromPath = (pathname: string): string | null => {
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0) {
    const potentialSchoolId = pathSegments[0];
    if (SCHOOLS[potentialSchoolId]) {
      return potentialSchoolId;
    }
  }
  return null;
};

// Current active school (dynamically detected from URL)
export const CURRENT_SCHOOL = getSchoolFromUrl();

// School-specific gradient styles
export const getSchoolGradient = (school: SchoolConfig) => {
  return `linear-gradient(135deg, ${school.primaryColor} 0%, ${school.accentColor} 100%)`;
};

// School-specific text styles
export const getSchoolTextColor = (school: SchoolConfig, variant: 'primary' | 'secondary' | 'accent' = 'primary') => {
  switch (variant) {
    case 'primary':
      return school.primaryColor;
    case 'secondary':
      return school.secondaryColor;
    case 'accent':
      return school.accentColor;
  }
};

// Group schools by conference for display
export const SCHOOLS_BY_CONFERENCE: Record<string, SchoolConfig[]> = {
  'SEC': [AUBURN, ALABAMA, FLORIDA, GEORGIA, KENTUCKY, TENNESSEE, TEXAS, MIZZOU, OKLAHOMA],
  'Big Ten': [MICHIGAN, OHIO_STATE, PENN_STATE, PURDUE, WISCONSIN, MINNESOTA, USC, UCLA, MICHIGAN_STATE],
  'ACC': [CLEMSON, VIRGINIA, NC_STATE, UNC, PITT, NOTRE_DAME, SMU],
  'Big 12': [BAYLOR, ARIZONA, ARIZONA_STATE, CINCINNATI, UCF],
  'Mountain West': [BOISE_STATE],
  'West Coast': [SAN_DIEGO],
  'Big East': [DEPAUL],
  'Healthcare': [SAINT_JUDE],
  'Other': [ROBERT_MORRIS],
};
