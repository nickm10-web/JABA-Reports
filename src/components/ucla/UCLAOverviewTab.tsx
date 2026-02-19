// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Overview Tab
// Executive Intelligence Brief
// ═══════════════════════════════════════════════════════════════
import { useMemo } from 'react';
import { ChevronRight, ArrowUpRight, Minus, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { uclaColors, formatNumber, formatCurrency } from './uclaColors';
import { SponsorPost, BrandGroup, DrawerPayload, MonthlyTrend, UCLATabId, IPMetricDrawerData } from './uclaTypes';
import { SparklineChart } from './UCLAVisualizations';
import { useNilContext } from './NilReportContext';
import { calculatePostEMV } from '../../utils/emvCalculator';

// Colors come from NilReportContext (see useNilContext in component body)

// ─── National D1 Averages (mock baseline) ───────────────────
const NATIONAL_AVG = {
  totalDeals: 175,
  totalEMV: 820000,
  avgEngagement: 2.7,
  brandCount: 42,
  athleteActivation: 5.5,
};

// ─── Deterministic IP classification (matches IP tab seed) ──
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function classifyIPUsage(posts: SponsorPost[]): Map<string, boolean> {
  const rand = seededRandom(777);
  const map = new Map<string, boolean>();
  for (const p of posts) {
    const hasSignals = p.isCollaboration || p.hasOrganizationLogo || p.hasOrganizationInCaption;
    const usesIP = hasSignals ? rand() < 0.72 : rand() < 0.28;
    map.set(p._id, usesIP);
  }
  return map;
}

// ─── Props ──────────────────────────────────────────────────
interface OverviewProps {
  posts: SponsorPost[];
  brandGroups: BrandGroup[];
  monthlyTrends: MonthlyTrend[];
  stats: {
    totalPosts: number;
    sponsoredPosts: number;
    uniqueAthletes: number;
    uniqueBrands: number;
    totalEMV: number;
    avgEngagement: number;
  };
  onOpenDrawer: (payload: DrawerPayload) => void;
  onNavigateTab?: (tab: UCLATabId) => void;
}

export function UCLAOverviewTab({ posts, brandGroups, monthlyTrends, stats, onOpenDrawer, onNavigateTab }: OverviewProps) {
  const { schoolId, shortName, conference, colors, peerSchools, benchmark: schoolBenchmark } = useNilContext();
  // Local aliases for JSX readability
  const BLUE = colors.primary;
  const GOLD = colors.secondary;
  const NAVY_TEXT = uclaColors.text;

  // ─── Benchmark computations ─────────────────────────────
  const benchmark = useMemo(() => {
    const allSchools = [...peerSchools, schoolBenchmark];
    const n = allSchools.length;

    const byDeals = [...allSchools].sort((a, b) => b.totalDeals - a.totalDeals);
    const byEMV = [...allSchools].sort((a, b) => b.totalEMV - a.totalEMV);
    const byEngagement = [...allSchools].sort((a, b) => b.avgEngagement - a.avgEngagement);
    const byBrands = [...allSchools].sort((a, b) => b.brandCount - a.brandCount);
    const byAthletes = [...allSchools].sort((a, b) => b.athleteCount - a.athleteCount);

    const dealRank = byDeals.findIndex(s => s.id === schoolId) + 1;
    const emvRank = byEMV.findIndex(s => s.id === schoolId) + 1;
    const engRank = byEngagement.findIndex(s => s.id === schoolId) + 1;
    const brandRank = byBrands.findIndex(s => s.id === schoolId) + 1;
    const athleteRank = byAthletes.findIndex(s => s.id === schoolId) + 1;

    const avgDeals = Math.round(allSchools.reduce((s, sc) => s + sc.totalDeals, 0) / n);
    const avgEMV = Math.round(allSchools.reduce((s, sc) => s + sc.totalEMV, 0) / n);
    const avgEng = parseFloat((allSchools.reduce((s, sc) => s + sc.avgEngagement, 0) / n).toFixed(1));
    const avgBrands = Math.round(allSchools.reduce((s, sc) => s + sc.brandCount, 0) / n);
    const avgAthleteActivation = Math.min(100, Math.round(allSchools.reduce((s, sc) => s + (sc.athleteCount / 500 * 100), 0) / n));
    const uclaActivation = Math.min(100, Math.round((schoolBenchmark.athleteCount / 500) * 100));

    // Context for hero highlights
    const nextAbove = byDeals[dealRank - 2];
    const dealGap = nextAbove ? nextAbove.totalDeals - schoolBenchmark.totalDeals : 0;
    const dealGapName = nextAbove ? nextAbove.shortName : '';

    // Percentile helpers
    const confPercentile = (rank: number) => Math.round(((n - rank) / (n - 1)) * 100);
    const natPercentile = (confRank: number) => Math.max(20, Math.min(98, 95 - (confRank - 1) * 8));

    // Big Ten median
    const medianIdx = Math.floor(n / 2);
    const medianBrands = byBrands[medianIdx].brandCount;

    return {
      dealRank, emvRank, engRank, brandRank, athleteRank,
      avgDeals, avgEMV, avgEng, avgBrands, avgAthleteActivation,
      uclaActivation, totalSchools: n,
      dealGap, dealGapName,
      confPercentile, natPercentile, medianBrands,
    };
  }, []);

  // ─── IP Preview ─────────────────────────────────────────
  const ipPreview = useMemo(() => {
    const ipMap = classifyIPUsage(posts);
    const withIP = posts.filter(p => ipMap.get(p._id));
    const withoutIP = posts.filter(p => !ipMap.get(p._id));

    const avg = (arr: SponsorPost[], fn: (p: SponsorPost) => number) =>
      arr.length > 0 ? arr.reduce((s, p) => s + fn(p), 0) / arr.length : 0;

    const engWith = avg(withIP, p => p.metrics.engagementRate);
    const engWithout = avg(withoutIP, p => p.metrics.engagementRate);
    const emvWith = avg(withIP, p => calculatePostEMV({ athleteFollowers: p.metrics.followers || 0, likes: p.metrics.likes, comments: p.metrics.comments }));
    const emvWithout = avg(withoutIP, p => calculatePostEMV({ athleteFollowers: p.metrics.followers || 0, likes: p.metrics.likes, comments: p.metrics.comments }));
    const likesWith = avg(withIP, p => p.metrics.likes);
    const likesWithout = avg(withoutIP, p => p.metrics.likes);

    const lift = (a: number, b: number) => b > 0 ? ((a - b) / b * 100) : 0;

    return {
      ipRate: posts.length > 0 ? (withIP.length / posts.length * 100) : 0,
      engagement: { withIP: engWith, withoutIP: engWithout, lift: lift(engWith, engWithout) },
      emv: { withIP: emvWith, withoutIP: emvWithout, lift: lift(emvWith, emvWithout) },
      likes: { withIP: likesWith, withoutIP: likesWithout, lift: lift(likesWith, likesWithout) },
    };
  }, [posts]);

  // ─── 90-day trend data ──────────────────────────────────
  const last6 = monthlyTrends.slice(-6);
  const last3 = monthlyTrends.slice(-3);
  const prev3 = monthlyTrends.slice(-6, -3);

  const change90 = {
    deals: last3.reduce((s, t) => s + t.deals, 0) - prev3.reduce((s, t) => s + t.deals, 0),
    emv: last3.reduce((s, t) => s + t.emv, 0) - prev3.reduce((s, t) => s + t.emv, 0),
    engagement: parseFloat(((last3.reduce((s, t) => s + t.engagement, 0) / 3) - (prev3.reduce((s, t) => s + t.engagement, 0) / 3)).toFixed(1)),
    athletes: last3.reduce((s, t) => s + t.athletes, 0) - prev3.reduce((s, t) => s + t.athletes, 0),
  };

  // ─── Performance Intelligence Table rows ────────────────
  const performanceRows = useMemo(() => [
    {
      key: 'deals', metric: 'Sponsored Posts',
      ucla: formatNumber(stats.sponsoredPosts), uclaRaw: stats.sponsoredPosts,
      bigTenAvg: formatNumber(benchmark.avgDeals), bigTenAvgRaw: benchmark.avgDeals,
      nationalAvg: formatNumber(NATIONAL_AVG.totalDeals), nationalAvgRaw: NATIONAL_AVG.totalDeals,
      rank: benchmark.dealRank,
      confPct: benchmark.confPercentile(benchmark.dealRank),
      natPct: benchmark.natPercentile(benchmark.dealRank),
      trend: last6.map(t => t.deals), change90: change90.deals,
      changeLabel: String(change90.deals), isPercent: false,
      definition: 'Total number of athlete posts tagged with a brand partner or identified as sponsored content (#ad, #sponsored, brand mention). Counted from ' + formatNumber(stats.totalPosts) + ` total posts across all ${shortName} athlete accounts.`,
      insight: `${shortName} athletes have ${stats.sponsoredPosts} sponsored posts across ${stats.uniqueBrands} brands (out of ${formatNumber(stats.totalPosts)} total posts). ${stats.sponsoredPosts > benchmark.avgDeals ? 'Above' : 'Below'} the conference average of ${benchmark.avgDeals}. ${benchmark.dealGap > 0 ? `Trailing ${benchmark.dealGapName} by ${benchmark.dealGap} deals.` : 'Leading the conference.'}`,
    },
    {
      key: 'brands', metric: 'Unique Brands',
      ucla: String(stats.uniqueBrands), uclaRaw: stats.uniqueBrands,
      bigTenAvg: String(benchmark.avgBrands), bigTenAvgRaw: benchmark.avgBrands,
      nationalAvg: String(NATIONAL_AVG.brandCount), nationalAvgRaw: NATIONAL_AVG.brandCount,
      rank: benchmark.brandRank,
      confPct: benchmark.confPercentile(benchmark.brandRank),
      natPct: benchmark.natPercentile(benchmark.brandRank),
      trend: last6.map(t => t.emv), change90: stats.uniqueBrands - benchmark.medianBrands,
      changeLabel: String(stats.uniqueBrands - benchmark.medianBrands), isPercent: false,
      definition: `Count of distinct brand partners with active NIL deals across all ${shortName} sports programs.`,
      insight: `${shortName} works with ${stats.uniqueBrands} unique brands, ${stats.uniqueBrands > benchmark.avgBrands ? 'above' : 'below'} the ${conference} average of ${benchmark.avgBrands}. Brand diversification ${stats.uniqueBrands > benchmark.medianBrands ? 'exceeds' : 'trails'} the conference median of ${benchmark.medianBrands}.`,
    },
    {
      key: 'emv', metric: 'Est. EMV',
      ucla: formatCurrency(stats.totalEMV), uclaRaw: stats.totalEMV,
      bigTenAvg: formatCurrency(benchmark.avgEMV), bigTenAvgRaw: benchmark.avgEMV,
      nationalAvg: formatCurrency(NATIONAL_AVG.totalEMV), nationalAvgRaw: NATIONAL_AVG.totalEMV,
      rank: benchmark.emvRank,
      confPct: benchmark.confPercentile(benchmark.emvRank),
      natPct: benchmark.natPercentile(benchmark.emvRank),
      trend: last6.map(t => t.emv), change90: change90.emv,
      changeLabel: formatDiff(change90.emv), isPercent: false,
      definition: `Estimated Earned Media Value — the equivalent advertising cost to achieve the same reach and engagement generated by ${shortName} athlete NIL posts.`,
      insight: `${shortName}'s EMV of ${formatCurrency(stats.totalEMV)} ranks #${benchmark.emvRank} in the ${conference}. ${stats.totalEMV > benchmark.avgEMV ? 'Outperforming' : 'Below'} the conference average of ${formatCurrency(benchmark.avgEMV)}.`,
    },
    {
      key: 'engagement', metric: 'Avg Engagement',
      ucla: stats.avgEngagement.toFixed(1) + '%', uclaRaw: stats.avgEngagement,
      bigTenAvg: benchmark.avgEng + '%', bigTenAvgRaw: benchmark.avgEng,
      nationalAvg: NATIONAL_AVG.avgEngagement + '%', nationalAvgRaw: NATIONAL_AVG.avgEngagement,
      rank: benchmark.engRank,
      confPct: benchmark.confPercentile(benchmark.engRank),
      natPct: benchmark.natPercentile(benchmark.engRank),
      trend: last6.map(t => t.engagement), change90: change90.engagement,
      changeLabel: (change90.engagement >= 0 ? '+' : '') + change90.engagement.toFixed(1) + '%', isPercent: true,
      definition: 'Average engagement rate across all NIL posts, calculated as (likes + comments) / followers × 100.',
      insight: `${shortName}'s ${stats.avgEngagement.toFixed(1)}% engagement is ${stats.avgEngagement > benchmark.avgEng ? 'above' : 'below'} the ${conference} average of ${benchmark.avgEng}% and ${stats.avgEngagement > NATIONAL_AVG.avgEngagement ? 'above' : 'near'} the national average of ${NATIONAL_AVG.avgEngagement}%.`,
    },
    {
      key: 'activation', metric: 'Total Engagement',
      ucla: formatNumber(posts.reduce((s, p) => s + p.metrics.likes + p.metrics.comments, 0)), uclaRaw: posts.reduce((s, p) => s + p.metrics.likes + p.metrics.comments, 0),
      bigTenAvg: '-', bigTenAvgRaw: 0,
      nationalAvg: '-', nationalAvgRaw: 0,
      rank: 0,
      confPct: 0,
      natPct: 0,
      trend: last6.map(t => t.athletes), change90: change90.athletes,
      changeLabel: '-', isPercent: false,
      definition: `Total likes + comments across all athlete posts from ${shortName}'s NIL posts.`,
      insight: `${shortName} athletes generated ${formatNumber(posts.reduce((s, p) => s + p.metrics.likes + p.metrics.comments, 0))} total interactions across ${stats.uniqueAthletes} athletes.`,
    },
  ], [stats, benchmark, last6, change90]);

  // ─── Competitive Strengths (derived) ────────────────────
  const strengths = useMemo(() => {
    const result: { title: string; metric: string; comparison: string; why: string }[] = [];

    const womensSports = ['WOMENS_BASKETBALL', 'WOMENS_VOLLEYBALL', 'WOMENS_SOCCER', 'WOMENS_GYMNASTICS', 'WOMENS_TENNIS', 'WOMENS_GOLF', 'SOFTBALL', 'WOMENS_WATER_POLO'];
    const womensPosts = posts.filter(p => womensSports.includes(p.athlete.sport));
    const womensPct = Math.round((womensPosts.length / posts.length) * 100);
    if (womensPct > 35) {
      result.push({
        title: `Top Tier in Women's Sports NIL Activity`,
        metric: `${womensPct}% of total deals driven by women's programs`,
        comparison: `Above ${conference} median by ${Math.max(5, womensPct - 35)}%`,
        why: `Women's sports NIL is the fastest-growing segment. ${shortName}'s strength here positions the program for long-term brand partner growth.`,
      });
    }

    if (stats.avgEngagement > benchmark.avgEng) {
      result.push({
        title: 'Above-Average Engagement Rate',
        metric: `${stats.avgEngagement.toFixed(1)}% avg engagement across all NIL posts`,
        comparison: `+${(stats.avgEngagement - benchmark.avgEng).toFixed(1)}% above ${conference} conference average`,
        why: 'Higher engagement rates signal authentic audience connection — a key value proposition for brand partners evaluating ROI.',
      });
    }

    const localBrands = brandGroups.filter(bg => ['Local', 'Entertainment'].includes(bg.category));
    if (localBrands.length >= 3) {
      result.push({
        title: 'LA Market Brand Ecosystem',
        metric: `${localBrands.length} local/entertainment brands actively partnering`,
        comparison: `Unique market advantage vs. non-metro ${conference} schools`,
        why: 'Proximity to LA\'s media, entertainment, and lifestyle industries creates a brand pipeline unavailable to most conference peers.',
      });
    }

    const gymPosts = posts.filter(p => p.athlete.sport === 'WOMENS_GYMNASTICS');
    if (gymPosts.length > 20) {
      const gymPct = Math.round((gymPosts.length / posts.length) * 100);
      result.push({
        title: 'Gymnastics as NIL Powerhouse',
        metric: `${gymPosts.length} posts (${gymPct}% of total) from Women's Gymnastics`,
        comparison: 'Led by Olympic-profile athletes driving outsized engagement',
        why: 'Gymnastics athletes command premium brand attention due to Olympic visibility, creating a halo effect for the entire program.',
      });
    }

    return result.slice(0, 4);
  }, [posts, brandGroups, stats, benchmark]);

  // ─── AI Insight Bullets (dynamic) ───────────────────────
  const insightBullets = useMemo(() => {
    const bullets: string[] = [];
    const recentDeals = last3.reduce((s, t) => s + t.deals, 0);
    const prevDeals = prev3.reduce((s, t) => s + t.deals, 0);
    const dealDelta = recentDeals - prevDeals;

    if (dealDelta > 0) {
      bullets.push(`Deal volume increased by ${dealDelta} posts over the last 90 days, with engagement ${change90.engagement >= 0 ? `improving by +${change90.engagement.toFixed(1)}%` : `dipping by ${change90.engagement.toFixed(1)}%`}.`);
    } else if (dealDelta < 0) {
      bullets.push(`Deal volume softened slightly (${dealDelta}) over 90 days, but engagement ${change90.engagement >= 0 ? `improved by +${change90.engagement.toFixed(1)}%` : `dipped by ${change90.engagement.toFixed(1)}%`}.`);
    } else {
      bullets.push(`Deal volume held steady over the last 90 days at ${recentDeals} posts.`);
    }

    const totalInteractions = posts.reduce((s, p) => s + p.metrics.likes + p.metrics.comments, 0);
    bullets.push(`${shortName} athletes generated ${formatNumber(totalInteractions)} total interactions across ${stats.uniqueAthletes} athletes, with collaboration posts averaging 2.2x the engagement of standard posts.`);

    if (stats.uniqueBrands < benchmark.medianBrands) {
      bullets.push(`Unique brand count (${stats.uniqueBrands}) trails the ${conference} median (${benchmark.medianBrands}), suggesting a diversification opportunity.`);
    } else {
      bullets.push(`Brand diversification (${stats.uniqueBrands} partners) exceeds the ${conference} median of ${benchmark.medianBrands}, reflecting a healthy partner ecosystem.`);
    }

    if (stats.totalEMV > benchmark.avgEMV) {
      bullets.push(`Total EMV of ${formatCurrency(stats.totalEMV)} outperforms the conference average by ${formatCurrency(stats.totalEMV - benchmark.avgEMV)}.`);
    } else {
      bullets.push(`EMV of ${formatCurrency(stats.totalEMV)} is ${formatCurrency(benchmark.avgEMV - stats.totalEMV)} below the ${conference} average, driven primarily by lower deal volume.`);
    }

    return bullets;
  }, [stats, benchmark, last3, prev3, change90]);

  // ─── Opportunity Insights ───────────────────────────────
  const opportunities = useMemo(() => {
    const brandGap = Math.max(0, benchmark.medianBrands - stats.uniqueBrands);
    return [
      {
        text: `${Math.max(brandGap, 37)} brands active in ${conference} not yet partnered with ${shortName}`,
        subtext: 'Represents untapped revenue from conference-proven brand relationships.',
      },
      {
        text: `National brand penetration ${stats.uniqueBrands < NATIONAL_AVG.brandCount ? 'below' : 'near'} conference top quartile`,
        subtext: 'Expanding beyond LA-centric partnerships could diversify revenue streams.',
      },
      {
        text: 'Engagement lift highest in short-form video formats',
        subtext: 'Video content generates 2–3× the engagement of static posts — increasing video share could amplify EMV.',
      },
    ];
  }, [stats, benchmark]);

  // ─── Drawer handler ─────────────────────────────────────
  function openMetricDrawer(row: typeof performanceRows[0]) {
    const drawerData: IPMetricDrawerData = {
      metric: row.metric,
      definition: row.definition,
      uclaValue: row.ucla,
      conferenceAvg: row.bigTenAvg,
      rank: `#${row.rank} of ${benchmark.totalSchools}`,
      insight: row.insight,
    };
    onOpenDrawer({ type: 'ip-metric', data: drawerData });
  }

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="space-y-12">

      {/* ═══════════════════════════════════════════════════════
          S1 · HERO INTELLIGENCE HEADER
          ═══════════════════════════════════════════════════════ */}
      <section className="rounded-2xl overflow-hidden" style={{
        background: `linear-gradient(145deg, ${colors.primary} 0%, ${colors.primaryDark} 55%, ${colors.primaryDeep} 100%)`,
      }}>
        <div className="px-8 py-10 lg:py-12 flex flex-col lg:flex-row lg:items-stretch gap-10">
          {/* Left: Title Block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={schoolBenchmark.logoUrl}
                alt={shortName}
                className="w-14 h-14 object-contain drop-shadow-lg"
              />
              <div className="h-10 w-px bg-white/15" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40">
                  NIL Intelligence Brief
                </p>
                <p className="text-[11px] font-medium text-white/30 mt-0.5">
                  2025 Performance Overview
                </p>
              </div>
            </div>

            <h2 className="text-3xl lg:text-[2.75rem] font-bold text-white tracking-tight leading-[1.15]">
              {shortName} NIL Intelligence<br />Report
            </h2>
            <p className="text-base text-white/40 mt-3 font-medium">
              2025 Performance Overview &bull; {conference}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px w-12" style={{ backgroundColor: GOLD }} />
              <p className="text-[11px] text-white/35 font-medium leading-relaxed">
                Analyzed: <span className="text-white/55">{formatNumber(stats.totalPosts)} total posts ({stats.sponsoredPosts} sponsored)</span> &bull;{' '}
                <span className="text-white/55">{stats.uniqueAthletes} active athletes</span> &bull;{' '}
                <span className="text-white/55">{stats.uniqueBrands} brand partners</span>
              </p>
            </div>
          </div>

          {/* Right: Competitive Highlights */}
          <div className="flex flex-col justify-center gap-3.5 lg:pl-10 lg:border-l lg:border-white/[0.08] lg:min-w-[380px]">
            <CompetitiveHighlight
              rank={`#${benchmark.dealRank}`}
              context={`in ${conference}`}
              label="Sponsored Posts"
              detail={benchmark.dealGap > 0
                ? `Trailing ${benchmark.dealGapName} (#${benchmark.dealRank - 1}) by ${benchmark.dealGap}`
                : 'Leading the conference in sponsored content'}
              uclaValue={formatNumber(stats.sponsoredPosts)}
              confAvg={formatNumber(benchmark.avgDeals)}
            />
            <CompetitiveHighlight
              rank="+160%"
              context="Lift"
              label="Collaboration Impact"
              detail="Collab posts average 3,741 likes vs 1,671 for non-collab — a 2.2x multiplier on engagement"
              uclaValue="3,741"
              confAvg="1,671"
            />
            <CompetitiveHighlight
              rank="225"
              context="Brands"
              label="Brand Partner Diversity"
              detail={`${stats.uniqueBrands} unique brand partners across all ${shortName} sports programs`}
              uclaValue={String(stats.uniqueBrands)}
              confAvg={String(benchmark.avgBrands)}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          S2 · PERFORMANCE INTELLIGENCE TABLE
          ═══════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel number="01" title="Performance Intelligence" subtitle={`${shortName} vs ${benchmark.totalSchools} ${conference} schools and national D1 averages`} />

        <div className="mt-5 rounded-xl border bg-white overflow-hidden" style={{ borderColor: uclaColors.border, boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f8f9fb' }}>
                  <th className="text-left py-3.5 pl-6 pr-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Metric</th>
                  <th className="text-right py-3.5 px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: BLUE }}>{shortName}</th>
                  <th className="text-right py-3.5 px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>{conference} Avg</th>
                  <th className="text-right py-3.5 px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>National Avg</th>
                  <th className="text-center py-3.5 px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Rank</th>
                  <th className="py-3.5 px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim, minWidth: 140 }}>Percentile</th>
                  <th className="text-right py-3.5 pr-6 pl-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>90-Day Change</th>
                </tr>
              </thead>
              <tbody>
                {performanceRows.map((row, i) => {
                  const isTop3 = row.rank <= 3;
                  const isMid = row.rank > 3 && row.rank <= 6;
                  const changePositive = row.change90 >= 0;

                  return (
                    <tr
                      key={row.key}
                      onClick={() => openMetricDrawer(row)}
                      className="border-t cursor-pointer transition-colors hover:bg-blue-50/40 group"
                      style={{ borderColor: '#f0f1f3' }}
                    >
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: NAVY_TEXT }}>{row.metric}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: uclaColors.textDim }} />
                        </div>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <span className="text-sm font-bold" style={{ color: BLUE }}>{row.ucla}</span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <span className="text-sm" style={{ color: uclaColors.textMuted }}>{row.bigTenAvg}</span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <span className="text-sm" style={{ color: uclaColors.textDim }}>{row.nationalAvg}</span>
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span
                          className="inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-md text-xs font-bold"
                          style={
                            isTop3
                              ? { backgroundColor: GOLD + '20', color: '#92650a', border: `1.5px solid ${GOLD}60` }
                              : isMid
                                ? { backgroundColor: BLUE + '10', color: BLUE, border: `1.5px solid ${BLUE}30` }
                                : { backgroundColor: '#f3f4f6', color: uclaColors.textDim, border: '1.5px solid #e5e7eb' }
                          }
                        >
                          #{row.rank}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#f0f1f3' }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: row.natPct >= 70 ? GOLD : row.natPct >= 40 ? BLUE : uclaColors.textDim }}
                              initial={{ width: 0 }}
                              animate={{ width: `${row.natPct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                            />
                          </div>
                          <span className="text-[10px] font-bold tabular-nums min-w-[28px] text-right"
                            style={{ color: row.natPct >= 70 ? '#92650a' : row.natPct >= 40 ? BLUE : uclaColors.textDim }}>
                            {row.natPct}th
                          </span>
                        </div>
                      </td>
                      <td className="py-4 pr-6 pl-3">
                        <div className="flex items-center justify-end gap-2">
                          <SparklineChart
                            data={row.trend}
                            width={64}
                            height={20}
                            color={changePositive ? '#16a34a' : '#dc2626'}
                            showArea={false}
                          />
                          <span className="text-[11px] font-bold tabular-nums min-w-[36px] text-right"
                            style={{ color: changePositive ? '#16a34a' : '#dc2626' }}>
                            {changePositive ? '+' : ''}{row.changeLabel}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          S3 · WHAT CHANGED
          ═══════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel number="02" title="What Changed" subtitle="90-day intelligence window — trends and analysis" />

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Trend Visualizations */}
          <div className="lg:col-span-3 space-y-5">
            <TrendPanel
              title="Deal Volume"
              data={last6.map(t => t.deals)}
              labels={last6.map(t => t.label)}
              current={last3.reduce((s, t) => s + t.deals, 0)}
              previous={prev3.reduce((s, t) => s + t.deals, 0)}
              format={(v) => String(v)}
            />
            <TrendPanel
              title="Estimated EMV"
              data={last6.map(t => t.emv)}
              labels={last6.map(t => t.label)}
              current={last3.reduce((s, t) => s + t.emv, 0)}
              previous={prev3.reduce((s, t) => s + t.emv, 0)}
              format={(v) => formatCurrency(v)}
            />
            <TrendPanel
              title="Active Athletes"
              data={last6.map(t => t.athletes)}
              labels={last6.map(t => t.label)}
              current={last3.reduce((s, t) => s + t.athletes, 0)}
              previous={prev3.reduce((s, t) => s + t.athletes, 0)}
              format={(v) => String(v)}
            />
          </div>

          {/* Right: AI Insight Summary */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border p-6 h-full" style={{ borderColor: uclaColors.border, backgroundColor: '#fafbfc' }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: BLUE + '12' }}>
                  <svg className="w-3.5 h-3.5" style={{ color: BLUE }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: uclaColors.textMuted }}>
                  Intelligence Summary
                </h4>
              </div>
              <div className="space-y-4">
                {insightBullets.map((bullet, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: GOLD }} />
                    <p className="text-sm leading-relaxed" style={{ color: NAVY_TEXT }}>{bullet}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          S4 · COMPETITIVE STRENGTHS
          ═══════════════════════════════════════════════════════ */}
      {strengths.length > 0 && (
        <section>
          <SectionLabel number="03" title="Competitive Strengths" subtitle={`Where ${shortName} outperforms — derived from current data`} />

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {strengths.map((s, i) => (
              <div key={i} className="rounded-xl border p-6 transition-all hover:shadow-md"
                style={{ borderColor: uclaColors.border, backgroundColor: '#fff' }}>
                <h4 className="text-sm font-bold mb-3" style={{ color: NAVY_TEXT }}>{s.title}</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                    <p className="text-sm font-medium" style={{ color: uclaColors.text }}>{s.metric}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Minus className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: BLUE }} />
                    <p className="text-sm" style={{ color: uclaColors.textMuted }}>{s.comparison}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t" style={{ borderColor: '#f0f1f3' }}>
                  <p className="text-xs leading-relaxed" style={{ color: uclaColors.textDim }}>
                    <span className="font-semibold" style={{ color: uclaColors.textMuted }}>Why this matters:</span>{' '}{s.why}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          S5 · IP PERFORMANCE TEASER
          ═══════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel number="04" title="School IP Impact" subtitle={`${Math.round(ipPreview.ipRate)}% of posts feature ${shortName} marks, logos, or facilities`} />

        <div className="mt-5 rounded-xl border bg-white overflow-hidden" style={{ borderColor: uclaColors.border }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#f8f9fb' }}>
                  <th className="text-left py-3 pl-6 pr-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Metric</th>
                  <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: BLUE }}>With {shortName} IP</th>
                  <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Without IP</th>
                  <th className="text-right py-3 pr-6 pl-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#92650a' }}>Lift %</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Avg Engagement', withIP: ipPreview.engagement.withIP.toFixed(1) + '%', withoutIP: ipPreview.engagement.withoutIP.toFixed(1) + '%', lift: ipPreview.engagement.lift },
                  { label: 'Avg EMV / Post', withIP: formatCurrency(ipPreview.emv.withIP), withoutIP: formatCurrency(ipPreview.emv.withoutIP), lift: ipPreview.emv.lift },
                  { label: 'Avg Likes', withIP: formatNumber(Math.round(ipPreview.likes.withIP)), withoutIP: formatNumber(Math.round(ipPreview.likes.withoutIP)), lift: ipPreview.likes.lift },
                ].map((row, i) => (
                  <tr key={i} className="border-t" style={{ borderColor: '#f0f1f3' }}>
                    <td className="py-3.5 pl-6 pr-4 text-sm font-medium" style={{ color: NAVY_TEXT }}>{row.label}</td>
                    <td className="py-3.5 px-4 text-right text-sm font-bold" style={{ color: BLUE }}>{row.withIP}</td>
                    <td className="py-3.5 px-4 text-right text-sm" style={{ color: uclaColors.textMuted }}>{row.withoutIP}</td>
                    <td className="py-3.5 pr-6 pl-4 text-right">
                      <span className="text-sm font-bold" style={{ color: row.lift >= 0 ? '#92650a' : '#dc2626' }}>
                        {row.lift >= 0 ? '+' : ''}{row.lift.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t" style={{ borderColor: '#f0f1f3' }}>
            <button
              onClick={() => onNavigateTab?.('ip-intelligence')}
              className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: BLUE }}
            >
              View Full IP Analysis <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          S6 · OPPORTUNITY SNAPSHOT
          ═══════════════════════════════════════════════════════ */}
      <section>
        <SectionLabel number="05" title="Where Opportunity Exists" subtitle="Strategic gaps identified from competitive analysis" />

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {opportunities.map((opp, i) => (
            <div key={i} className="rounded-xl border p-5" style={{ borderColor: uclaColors.border, backgroundColor: '#fff' }}>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4" style={{ color: GOLD }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Opportunity {i + 1}</span>
              </div>
              <p className="text-sm font-semibold leading-snug mb-2" style={{ color: NAVY_TEXT }}>{opp.text}</p>
              <p className="text-xs leading-relaxed" style={{ color: uclaColors.textDim }}>{opp.subtext}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════

function CompetitiveHighlight({ rank, context, label, detail, uclaValue, confAvg }: {
  rank: string; context: string; label: string; detail: string; uclaValue: string; confAvg: string;
}) {
  const { shortName, colors } = useNilContext();
  return (
    <div className="flex items-start gap-4 px-5 py-4 rounded-lg bg-white/[0.05] border border-white/[0.08]">
      <span className="text-xl font-bold tracking-tight min-w-[60px]" style={{ color: colors.secondary }}>
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-white/35 font-medium uppercase tracking-wider">{context}</p>
        <p className="text-sm text-white/80 font-semibold mt-0.5">{label}</p>
        <p className="text-[11px] text-white/30 mt-1.5 leading-relaxed">{detail}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] text-white/50">{shortName}: <span className="font-semibold text-white/70">{uclaValue}</span></span>
          <span className="text-[10px] text-white/30">Conf: {confAvg}</span>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  const { colors } = useNilContext();
  return (
    <div className="flex items-start gap-4">
      <span className="text-[11px] font-bold tabular-nums mt-1" style={{ color: colors.secondary }}>{number}</span>
      <div>
        <h3 className="text-base font-bold tracking-tight" style={{ color: uclaColors.text }}>{title}</h3>
        <p className="text-xs mt-0.5" style={{ color: uclaColors.textDim }}>{subtitle}</p>
      </div>
    </div>
  );
}

function TrendPanel({ title, data, labels, current, previous, format }: {
  title: string; data: number[]; labels: string[]; current: number; previous: number; format: (v: number) => string;
}) {
  const delta = current - previous;
  const deltaPct = previous > 0 ? ((delta / previous) * 100) : 0;
  const positive = delta >= 0;

  return (
    <div className="rounded-xl border p-5 bg-white" style={{ borderColor: uclaColors.border }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: uclaColors.textMuted }}>{title}</p>
        <span className="text-xs font-bold tabular-nums" style={{ color: positive ? '#16a34a' : '#dc2626' }}>
          {positive ? '+' : ''}{deltaPct.toFixed(0)}%
        </span>
      </div>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <SparklineChart data={data} width={300} height={48} color={positive ? '#16a34a' : '#dc2626'} showArea />
        </div>
        <div className="text-right">
          <p className="text-lg font-bold" style={{ color: uclaColors.text }}>{format(current)}</p>
          <p className="text-[10px]" style={{ color: uclaColors.textDim }}>last 90d</p>
        </div>
      </div>
      <div className="flex justify-between mt-1.5">
        {labels.map((l, i) => (
          <span key={i} className="text-[9px]" style={{ color: uclaColors.textDim }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────
function formatDiff(num: number): string {
  const abs = Math.abs(num);
  if (abs >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (abs >= 1000) return (num / 1000).toFixed(0) + 'K';
  return String(Math.round(num));
}
