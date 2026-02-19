/**
 * PlayflyDataContext
 *
 * Central data provider that loads real JSON data for the Playfly reports.
 * Eliminates all hardcoded/fabricated data by loading from:
 *   - playfly-metrics-feb12.json  (network totals + per-school IP metrics)
 *   - brand-partnership-summary.json  (brand partnership stats)
 *   - playfly-athletes-metrics.json  (individual athlete data)
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getAllSchools, getJABARosterTeams } from '../data/jabaRealData';

// ─── Types ──────────────────────────────────────────────────

export interface SchoolMetrics {
  overview: {
    totalFollowers: number;
    uniqueAthletes: number;
    athletesWithContent: number;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalEMV: number;
    engagementRate: number;
  };
  brandDeals: {
    sponsoredPosts: number;
    uniqueBrands: number;
    sponsoredAthletes: number;
  };
  ipEffectiveness: {
    postsWithoutIP: number;
    postsWithIP: number;
    totalEngagementWithoutIP: number;
    totalEngagementWithIP: number;
    avgEngagementWithoutIP: number;
    avgEngagementWithIP: number;
    engagementLiftPercent: number;
  };
  ipTypeBreakdown: {
    logo: { posts: number; totalEngagement: number; avgEngagement: number; liftPercent: number };
    collaboration: { posts: number; totalEngagement: number; avgEngagement: number; liftPercent: number };
    mention: { posts: number; totalEngagement: number; avgEngagement: number; liftPercent: number };
  };
  emvBreakdown: {
    totalEMV: number;
    emvWithoutIP: number;
    emvWithIP: number;
    avgEMVPerPost: number;
    avgEMVWithIP: number;
    avgEMVWithoutIP: number;
    emvLiftPercent: number;
  };
  topBrands: { name: string; posts: number; engagement: number; ipTypesUsed: string[] }[];
  brandsUsingIPCount: number;
}

export interface NetworkTotals extends SchoolMetrics {
  overview: SchoolMetrics['overview'] & { schools: number };
}

export interface BrandStat {
  brandName: string;
  postCount: number;
  schoolCount: number;
  avgEngagementRate: number;
}

export interface SchoolBrandStat {
  schoolName: string;
  postCount: number;
  brandCount: number;
  avgEngagementRate: number;
}

export interface BrandPartnershipSummary {
  totalPosts: number;
  activeBrands: number;
  activeSchools: number;
  totalSchools: number;
  avgPostsPerBrand: number;
  brandStats: BrandStat[];
  schoolStats: SchoolBrandStat[];
}

export interface AthleteMetric {
  name: string;
  school: string;
  sport: string;
  followers: number;
  totalLikes: number;
  totalComments: number;
  postCount: number;
  engagementRate: number;
  emv: number;
  orgInCaptionLift: number | null;
  collaborationLift: number | null;
  logoLift: number | null;
}

export interface PlayflyData {
  isLoading: boolean;

  // From playfly-metrics-feb12.json
  networkTotals: NetworkTotals | null;
  schools: Record<string, SchoolMetrics>;

  // From brand-partnership-summary.json
  brandSummary: BrandPartnershipSummary | null;

  // From playfly-athletes-metrics.json
  athletes: AthleteMetric[];

  // From jabaRealData (PlayFlyFull_roster_teams.json)
  rosterTeamCount: number;
  rosterSchoolCount: number;
  rosterSchoolNames: string[];

  // Derived helpers
  getSchoolMetrics: (schoolName: string) => SchoolMetrics | null;
  getSchoolAthletes: (schoolName: string) => AthleteMetric[];
  getTopAthletesByFollowers: (limit?: number) => AthleteMetric[];
  getTopAthletesByEMV: (limit?: number) => AthleteMetric[];
  getTopBrandsByPosts: (limit?: number) => BrandStat[];
  getSportBreakdown: () => { sport: string; athleteCount: number; totalLikes: number; totalComments: number; avgEngagement: number }[];
  getConferenceBreakdown: () => { conference: string; schoolCount: number; teamCount: number; totalFollowers: number; avgEngagement: number }[];
}

const PlayflyDataContext = createContext<PlayflyData | null>(null);

// ─── Provider ───────────────────────────────────────────────

export function PlayflyDataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [networkTotals, setNetworkTotals] = useState<NetworkTotals | null>(null);
  const [schools, setSchools] = useState<Record<string, SchoolMetrics>>({});
  const [brandSummary, setBrandSummary] = useState<BrandPartnershipSummary | null>(null);
  const [athletes, setAthletes] = useState<AthleteMetric[]>([]);

  // Roster data (sync from jabaRealData)
  const rosterTeams = getJABARosterTeams();
  const rosterSchoolNames = getAllSchools();
  const rosterTeamCount = rosterTeams.filter(t =>
    t.metrics.ninetyDays.contentCount > 0 || t.metrics.thirtyDays.contentCount > 0
  ).length;
  const rosterSchoolCount = rosterSchoolNames.length;

  useEffect(() => {
    async function loadAll() {
      try {
        setIsLoading(true);
        const [metricsRes, brandRes, athleteRes] = await Promise.all([
          fetch('/data/playfly-metrics-feb12.json').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/data/brand-partnership-summary.json').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/data/playfly-athletes-metrics.json').then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        if (metricsRes) {
          setNetworkTotals(metricsRes.networkTotals);
          setSchools(metricsRes.schools || {});
        }
        if (brandRes) setBrandSummary(brandRes);
        if (athleteRes) setAthletes(athleteRes);
      } catch (err) {
        console.error('Error loading Playfly data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAll();
  }, []);

  // ─── Derived helpers ────────────────────────────────────

  const getSchoolMetrics = (schoolName: string): SchoolMetrics | null => {
    return schools[schoolName] || null;
  };

  const getSchoolAthletes = (schoolName: string): AthleteMetric[] => {
    return athletes.filter(a => a.school === schoolName);
  };

  const getTopAthletesByFollowers = (limit = 10): AthleteMetric[] => {
    return [...athletes].sort((a, b) => b.followers - a.followers).slice(0, limit);
  };

  const getTopAthletesByEMV = (limit = 10): AthleteMetric[] => {
    return [...athletes].sort((a, b) => b.emv - a.emv).slice(0, limit);
  };

  const getTopBrandsByPosts = (limit = 20): BrandStat[] => {
    if (!brandSummary) return [];
    return [...brandSummary.brandStats].sort((a, b) => b.postCount - a.postCount).slice(0, limit);
  };

  const getSportBreakdown = () => {
    const sportMap = new Map<string, { count: number; likes: number; comments: number; engSum: number }>();
    for (const a of athletes) {
      const entry = sportMap.get(a.sport) || { count: 0, likes: 0, comments: 0, engSum: 0 };
      entry.count++;
      entry.likes += a.totalLikes;
      entry.comments += a.totalComments;
      entry.engSum += a.engagementRate;
      sportMap.set(a.sport, entry);
    }
    return Array.from(sportMap.entries())
      .map(([sport, d]) => ({
        sport,
        athleteCount: d.count,
        totalLikes: d.likes,
        totalComments: d.comments,
        avgEngagement: d.count > 0 ? d.engSum / d.count : 0,
      }))
      .sort((a, b) => b.athleteCount - a.athleteCount);
  };

  const getConferenceBreakdown = () => {
    const confMap = new Map<string, { schools: Set<string>; teams: number; followers: number; engSum: number; engCount: number }>();
    for (const team of rosterTeams) {
      const conf = team.conferenceName || 'Unknown';
      const entry = confMap.get(conf) || { schools: new Set(), teams: 0, followers: 0, engSum: 0, engCount: 0 };
      entry.schools.add(team.schoolName);
      entry.teams++;
      entry.followers += team.metrics.ninetyDays.followers;
      if (team.metrics.ninetyDays.engagementRate > 0) {
        entry.engSum += team.metrics.ninetyDays.engagementRate;
        entry.engCount++;
      }
      confMap.set(conf, entry);
    }
    return Array.from(confMap.entries())
      .map(([conference, d]) => ({
        conference,
        schoolCount: d.schools.size,
        teamCount: d.teams,
        totalFollowers: d.followers,
        avgEngagement: d.engCount > 0 ? d.engSum / d.engCount : 0,
      }))
      .sort((a, b) => b.schoolCount - a.schoolCount);
  };

  const value: PlayflyData = {
    isLoading,
    networkTotals,
    schools,
    brandSummary,
    athletes,
    rosterTeamCount,
    rosterSchoolCount,
    rosterSchoolNames,
    getSchoolMetrics,
    getSchoolAthletes,
    getTopAthletesByFollowers,
    getTopAthletesByEMV,
    getTopBrandsByPosts,
    getSportBreakdown,
    getConferenceBreakdown,
  };

  return (
    <PlayflyDataContext.Provider value={value}>
      {children}
    </PlayflyDataContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────

export function usePlayflyData(): PlayflyData {
  const ctx = useContext(PlayflyDataContext);
  if (!ctx) {
    throw new Error('usePlayflyData must be used within a PlayflyDataProvider');
  }
  return ctx;
}

// ─── Formatting helpers ─────────────────────────────────────

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function formatDollars(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'K';
  return '$' + n.toLocaleString();
}

export function formatPercent(n: number, decimals = 1): string {
  return n.toFixed(decimals) + '%';
}

export function formatSportName(sport: string): string {
  return sport
    .replace(/_/g, ' ')
    .replace(/WOMENS /i, "Women's ")
    .replace(/MENS /i, "Men's ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/And/g, '&');
}
