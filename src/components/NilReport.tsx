// ═══════════════════════════════════════════════════════════════
// NIL Intelligence Report — Generic Wrapper
// Renders the full 7-tab UCLA-style report for any school.
// Accepts SchoolConfig, loads posts, computes derived data.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from 'react';
import { NilReportContext } from './ucla/NilReportContext';
import type { SchoolConfig } from '../config/schoolConfigs';
import { UCLAHeader } from './ucla/UCLAHeader';
import { UCLAInsightDrawer } from './ucla/UCLAInsightDrawer';
import { UCLAOverviewTab } from './ucla/UCLAOverviewTab';
import { UCLABenchmarksTab } from './ucla/UCLABenchmarksTab';
import { UCLABrandDealsTab } from './ucla/UCLABrandDealsTab';
import { UCLAContentTab } from './ucla/UCLAContentTab';
import { UCLAOpportunityTab } from './ucla/UCLAOpportunityTab';
import { UCLAAthletesTab } from './ucla/UCLAAthletesTab';
import { UCLAIPIntelligenceTab } from './ucla/UCLAIPIntelligenceTab';
import { getBrandCategory, generateBrandGapMatrix } from './ucla/uclaMockData';
import { calculatePostEMV } from '../utils/emvCalculator';
import type {
  SponsorPost, BrandGroup, AthleteGroup, AthleteIndex,
  MonthlyTrend, DrawerPayload, UCLATabId,
} from './ucla/uclaTypes';

interface NilReportProps {
  config: SchoolConfig;
  onBack?: () => void;
}

// ─── Post Normalizer ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePost(p: any, schoolName: string, conferenceName: string): SponsorPost {
  return {
    ...p,
    hashtags: p.hashtags || [],
    sponsorPartner: p.sponsorPartner || '',
    isSponsored: p.isSponsored || false,
    isCollaboration: p.isCollaboration || false,
    isOrganizationCollaboration: p.isOrganizationCollaboration || false,
    hasOrganizationLogo: p.hasOrganizationLogo || false,
    hasOrganizationInCaption: p.hasOrganizationInCaption || false,
    athlete: {
      ...p.athlete,
      school: { name: schoolName },
      conference: { name: conferenceName },
    },
    metrics: {
      ...p.metrics,
      shares: p.metrics?.shares || 0,
      saves: p.metrics?.saves || 0,
      videoViews: p.metrics?.videoViews || 0,
      impressions: p.metrics?.impressions || 0,
      reach: p.metrics?.reach || 0,
      followers: p.metrics?.followers || 0,
    },
  } as SponsorPost;
}

// Base non-brand handles excluded from all schools (NIL platforms, social platforms, etc.)
const BASE_BRAND_EXCLUSIONS = new Set([
  'facebook', 'postgame.official', 'myplayersports', 'myplayerathlete',
  'prepdig', 'athletezonestore', 'bruinnil', 'ucla.nil.store',
]);

// ─── Brand Group Builder ─────────────────────────────────────
function buildBrandGroups(
  posts: SponsorPost[],
  exclusions: Set<string> = new Set(),
  aliases: Record<string, string> = {},
): BrandGroup[] {
  const map = new Map<string, SponsorPost[]>();
  for (const p of posts) {
    const raw = (p.sponsorPartner || '').replace(/^@/, '').toLowerCase().trim();
    if (!raw) continue;
    if (BASE_BRAND_EXCLUSIONS.has(raw) || exclusions.has(raw)) continue;
    const key = aliases[raw] ?? raw;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  const groups: BrandGroup[] = [];
  map.forEach((groupPosts, key) => {
    const athleteIds = new Set(groupPosts.map(p => p.athlete._id));
    const sports = [...new Set(groupPosts.map(p => p.athlete.sport))];
    const dates = groupPosts.map(p => p.publishedAt?.$date || '').filter(Boolean).sort();
    const totalEMV = groupPosts.reduce((s, p) =>
      s + calculatePostEMV({ likes: p.metrics.likes, comments: p.metrics.comments }), 0);

    // Build athlete groups
    const athMap = new Map<string, SponsorPost[]>();
    for (const p of groupPosts) {
      if (!athMap.has(p.athlete._id)) athMap.set(p.athlete._id, []);
      athMap.get(p.athlete._id)!.push(p);
    }
    const athleteGroups: AthleteGroup[] = [];
    athMap.forEach((athPosts, athId) => {
      const a = athPosts[0].athlete;
      athleteGroups.push({
        id: athId,
        name: a.name,
        image: a.image,
        sport: a.sport,
        position: a.position,
        year: a.year,
        posts: athPosts,
        followers: athPosts[0].metrics.followers || 0,
        totalEMV: athPosts.reduce((s, p) =>
          s + calculatePostEMV({ likes: p.metrics.likes, comments: p.metrics.comments }), 0),
      });
    });

    groups.push({
      key,
      displayName: '@' + key,
      handle: key,
      posts: groupPosts,
      uniqueAthletes: [...athleteIds],
      sports,
      sponsoredCount: groupPosts.filter(p => p.isSponsored).length,
      dateRange: { min: dates[0] || '', max: dates[dates.length - 1] || '' },
      athleteGroups,
      totalEMV,
      category: getBrandCategory(key),
    });
  });
  return groups.sort((a, b) => b.posts.length - a.posts.length);
}

// ─── Monthly Trends Builder ──────────────────────────────────
function buildMonthlyTrends(posts: SponsorPost[]): MonthlyTrend[] {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const map = new Map<string, { deals: number; emv: number; athletes: Set<string>; engSum: number; engCount: number }>();

  for (const p of posts) {
    const dateStr = p.publishedAt?.$date;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, { deals: 0, emv: 0, athletes: new Set(), engSum: 0, engCount: 0 });
    const entry = map.get(key)!;
    if (p.sponsorPartner) entry.deals++;
    entry.emv += calculatePostEMV({ likes: p.metrics.likes, comments: p.metrics.comments });
    entry.athletes.add(p.athlete._id);
    if (p.metrics.engagementRate) { entry.engSum += p.metrics.engagementRate; entry.engCount++; }
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => {
      const [year, month] = key.split('-');
      return {
        month: key,
        label: months[parseInt(month, 10) - 1] + ' ' + year.slice(2),
        deals: v.deals,
        emv: v.emv,
        athletes: v.athletes.size,
        engagement: v.engCount > 0 ? parseFloat((v.engSum / v.engCount).toFixed(2)) : 0,
      };
    });
}

// ─── Athlete Index Builder ───────────────────────────────────
function buildAthleteIndex(posts: SponsorPost[]): AthleteIndex[] {
  const map = new Map<string, { posts: SponsorPost[]; followers: number }>();
  for (const p of posts) {
    const id = p.athlete._id;
    if (!map.has(id)) map.set(id, { posts: [], followers: p.metrics.followers || 0 });
    map.get(id)!.posts.push(p);
    if (p.metrics.followers) map.get(id)!.followers = Math.max(map.get(id)!.followers, p.metrics.followers);
  }

  const index: AthleteIndex[] = [];
  map.forEach((data, id) => {
    const a = data.posts[0].athlete;
    const brands = new Set(data.posts.map(p => p.sponsorPartner).filter(Boolean));
    const totalLikes = data.posts.reduce((s, p) => s + p.metrics.likes, 0);
    const totalComments = data.posts.reduce((s, p) => s + p.metrics.comments, 0);
    const engRates = data.posts.filter(p => p.metrics.engagementRate > 0).map(p => p.metrics.engagementRate);
    const avgEngagement = engRates.length > 0
      ? parseFloat((engRates.reduce((s, r) => s + r, 0) / engRates.length).toFixed(2))
      : 0;
    const totalEMV = data.posts.reduce((s, p) =>
      s + calculatePostEMV({ likes: p.metrics.likes, comments: p.metrics.comments }), 0);

    index.push({
      id, name: a.name, image: a.image, sport: a.sport,
      position: a.position, year: a.year,
      posts: data.posts.length, totalLikes, totalComments,
      brands: brands.size,
      followers: data.followers,
      totalEMV, avgEngagement,
    });
  });
  return index.sort((a, b) => b.totalEMV - a.totalEMV);
}

// ─── Stats Aggregator ────────────────────────────────────────
function computeStats(posts: SponsorPost[]) {
  const sponsoredPosts = posts.filter(p => p.sponsorPartner).length;
  const uniqueAthletes = new Set(posts.map(p => p.athlete._id)).size;
  const uniqueBrands = new Set(posts.map(p => p.sponsorPartner).filter(Boolean)).size;
  const totalEMV = posts.reduce((s, p) =>
    s + calculatePostEMV({ likes: p.metrics.likes, comments: p.metrics.comments }), 0);
  const engRates = posts.filter(p => p.metrics.engagementRate > 0).map(p => p.metrics.engagementRate);
  const avgEngagement = engRates.length > 0
    ? parseFloat((engRates.reduce((s, r) => s + r, 0) / engRates.length).toFixed(2))
    : 0;

  return {
    totalPosts: posts.length,
    sponsoredPosts,
    uniqueAthletes,
    uniqueBrands,
    totalEMV,
    avgEngagement,
  };
}

// ─── Main Component ──────────────────────────────────────────
export function NilReport({ config, onBack }: NilReportProps) {
  const [posts, setPosts] = useState<SponsorPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<UCLATabId>('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPayload, setDrawerPayload] = useState<DrawerPayload | null>(null);

  // Load posts
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(config.dataFile)
      .then(r => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((raw: any[]) => {
        const normalized = raw.map(p => normalizePost(p, config.name, config.conference));
        setPosts(normalized);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [config.dataFile]);

  // Derived data
  const exclusionSet = useMemo(() => new Set(config.brandExclusions ?? []), [config.brandExclusions]);
  const aliases = useMemo(() => config.brandAliases ?? {}, [config.brandAliases]);
  const brandGroups = useMemo(() => buildBrandGroups(posts, exclusionSet, aliases), [posts, exclusionSet, aliases]);
  const monthlyTrends = useMemo(() => buildMonthlyTrends(posts), [posts]);
  const athleteIndex = useMemo(() => buildAthleteIndex(posts), [posts]);
  const stats = useMemo(() => computeStats(posts), [posts]);
  const gapMatrix = useMemo(() => generateBrandGapMatrix(), []);

  function handleOpenDrawer(payload: DrawerPayload) {
    setDrawerPayload(payload);
    setDrawerOpen(true);
  }

  const contextValue = {
    schoolId: config.id,
    shortName: config.shortName,
    nickname: config.nickname,
    conference: config.conference,
    colors: config.colors,
    peerSchools: config.peerSchools,
    benchmark: config.benchmark,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <img src={config.logoUrl} alt={config.shortName} className="w-16 h-16 object-contain mx-auto mb-4 opacity-60" />
          <p className="text-gray-400 text-sm font-medium">Loading {config.shortName} NIL data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 font-medium">Failed to load data</p>
          <p className="text-gray-400 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <NilReportContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        <UCLAHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={onBack}
          onExport={() => window.print()}
        />

        <main className="max-w-[1400px] mx-auto px-6 py-8">
          {activeTab === 'overview' && (
            <UCLAOverviewTab
              posts={posts}
              brandGroups={brandGroups}
              monthlyTrends={monthlyTrends}
              stats={stats}
              onOpenDrawer={handleOpenDrawer}
              onNavigateTab={setActiveTab}
            />
          )}
          {activeTab === 'benchmarks' && (
            <UCLABenchmarksTab stats={stats} />
          )}
          {activeTab === 'brand-deals' && (
            <UCLABrandDealsTab
              brandGroups={brandGroups}
              onOpenDrawer={handleOpenDrawer}
            />
          )}
          {activeTab === 'content' && (
            <UCLAContentTab
              posts={posts}
              onOpenDrawer={handleOpenDrawer}
            />
          )}
          {activeTab === 'opportunity' && (
            <UCLAOpportunityTab gapMatrix={gapMatrix} />
          )}
          {activeTab === 'athletes' && (
            <UCLAAthletesTab
              athleteIndex={athleteIndex}
              onOpenDrawer={handleOpenDrawer}
            />
          )}
          {activeTab === 'ip-intelligence' && (
            <UCLAIPIntelligenceTab
              posts={posts}
              brandGroups={brandGroups}
              onOpenDrawer={handleOpenDrawer}
            />
          )}
        </main>

        <UCLAInsightDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          payload={drawerPayload}
        />
      </div>
    </NilReportContext.Provider>
  );
}
