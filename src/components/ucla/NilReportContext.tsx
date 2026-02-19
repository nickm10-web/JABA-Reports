// ═══════════════════════════════════════════════════════════════
// NIL Report — Generic School Context
// Allows UCLA tab components to be reused for any school
// ═══════════════════════════════════════════════════════════════
import { createContext, useContext } from 'react';
import type { PeerSchool } from './uclaTypes';

export interface NilSchoolColors {
  primary: string;
  secondary: string;
  primaryDark: string;
  primaryDeep: string;
}

export interface NilReportContextType {
  schoolId: string;
  shortName: string;
  nickname: string;
  conference: string;
  colors: NilSchoolColors;
  peerSchools: PeerSchool[];
  benchmark: PeerSchool;
}

// Default to UCLA
const UCLA_DEFAULT: NilReportContextType = {
  schoolId: 'ucla',
  shortName: 'UCLA',
  nickname: 'Bruins',
  conference: 'Big Ten',
  colors: {
    primary: '#2D68C4',
    secondary: '#F2A900',
    primaryDark: '#1a4a9e',
    primaryDeep: '#0f3278',
  },
  peerSchools: [],
  benchmark: {
    id: 'ucla',
    name: 'University of California, Los Angeles',
    shortName: 'UCLA',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/26.png',
    conference: 'Big Ten',
    totalDeals: 422,
    totalEMV: 6674959,
    avgEngagement: 22.93,
    topSport: "Women's Gymnastics",
    athleteCount: 506,
    brandCount: 256,
    monthlyRanks: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  },
};

export const NilReportContext = createContext<NilReportContextType>(UCLA_DEFAULT);

export function useNilContext(): NilReportContextType {
  return useContext(NilReportContext);
}
