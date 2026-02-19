// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — IP Intelligence Tab
// Analyzes how UCLA intellectual property (logos, marks, facilities,
// uniforms, official team assets) impacts NIL performance.
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { uclaColors, formatNumber, formatCurrency, formatSportName } from './uclaColors';
import { SponsorPost, BrandGroup, DrawerPayload, IPMetricDrawerData } from './uclaTypes';
import { SparklineChart } from './UCLAVisualizations';
import { sportColors } from './uclaColors';
import { useNilContext } from './NilReportContext';
import { calculatePostEMV } from '../../utils/emvCalculator';

// ─── Deterministic seeded random (matches mock data seed) ───
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

// ─── IP classification ──────────────────────────────────────
// Deterministically assigns IP usage to posts so numbers stay
// consistent across renders and match across tabs.
function classifyIPUsage(posts: SponsorPost[]): Map<string, boolean> {
  const rand = seededRandom(777);
  const map = new Map<string, boolean>();
  for (const p of posts) {
    // Posts that are collaborations, have org logo, or org in caption → likely IP usage
    const hasSignals = p.isCollaboration || p.hasOrganizationLogo || p.hasOrganizationInCaption;
    // ~42% of posts use IP (based on mock data signals + random)
    const usesIP = hasSignals ? rand() < 0.72 : rand() < 0.28;
    map.set(p._id, usesIP);
  }
  return map;
}

interface IPIntelligenceProps {
  posts: SponsorPost[];
  brandGroups: BrandGroup[];
  onOpenDrawer: (payload: DrawerPayload) => void;
}

export function UCLAIPIntelligenceTab({ posts, brandGroups, onOpenDrawer }: IPIntelligenceProps) {
  const { schoolId, shortName, conference, colors, peerSchools, benchmark: schoolBenchmark } = useNilContext();
  const BLUE = colors.primary;

  // ─── Classify all posts ─────────────────────────────────
  const ipMap = useMemo(() => classifyIPUsage(posts), [posts]);

  const withIP = useMemo(() => posts.filter(p => ipMap.get(p._id)), [posts, ipMap]);
  const withoutIP = useMemo(() => posts.filter(p => !ipMap.get(p._id)), [posts, ipMap]);

  const ipRate = posts.length > 0 ? (withIP.length / posts.length) * 100 : 0;

  // ─── Performance metrics ────────────────────────────────
  const metricsWithIP = useMemo(() => computeGroupMetrics(withIP), [withIP]);
  const metricsWithoutIP = useMemo(() => computeGroupMetrics(withoutIP), [withoutIP]);

  // ─── IP usage by sport ──────────────────────────────────
  const sportIPData = useMemo(() => {
    const sportMap = new Map<string, { total: number; withIP: number; liftEng: number }>();
    const sportWithIP = new Map<string, SponsorPost[]>();
    const sportWithoutIP = new Map<string, SponsorPost[]>();

    posts.forEach(p => {
      const s = p.athlete.sport;
      if (!sportMap.has(s)) sportMap.set(s, { total: 0, withIP: 0, liftEng: 0 });
      const entry = sportMap.get(s)!;
      entry.total++;
      if (ipMap.get(p._id)) {
        entry.withIP++;
        if (!sportWithIP.has(s)) sportWithIP.set(s, []);
        sportWithIP.get(s)!.push(p);
      } else {
        if (!sportWithoutIP.has(s)) sportWithoutIP.set(s, []);
        sportWithoutIP.get(s)!.push(p);
      }
    });

    return [...sportMap.entries()].map(([sport, data]) => {
      const wPosts = sportWithIP.get(sport) || [];
      const woPosts = sportWithoutIP.get(sport) || [];
      const avgEngWith = wPosts.length > 0 ? wPosts.reduce((s, p) => s + p.metrics.engagementRate, 0) / wPosts.length : 0;
      const avgEngWithout = woPosts.length > 0 ? woPosts.reduce((s, p) => s + p.metrics.engagementRate, 0) / woPosts.length : 0;
      const liftEng = avgEngWithout > 0 ? ((avgEngWith - avgEngWithout) / avgEngWithout) * 100 : 0;

      return {
        sport,
        total: data.total,
        withIP: data.withIP,
        ipRate: data.total > 0 ? (data.withIP / data.total) * 100 : 0,
        avgEngWith,
        avgEngWithout,
        liftEng,
      };
    }).sort((a, b) => b.liftEng - a.liftEng);
  }, [posts, ipMap]);

  // ─── Conference benchmark (mock) ────────────────────────
  const conferenceBenchmark = useMemo(() => {
    const rand = seededRandom(555);
    const schools = [
      { ...schoolBenchmark, ipPct: ipRate, engLift: computeLift(metricsWithIP.avgEngagement, metricsWithoutIP.avgEngagement) },
      ...peerSchools.map(s => {
        const pct = 25 + rand() * 35; // 25-60%
        const lift = 8 + rand() * 45; // 8-53%
        return { ...s, ipPct: pct, engLift: lift };
      }),
    ].sort((a, b) => b.ipPct - a.ipPct);

    return schools.map((s, i) => ({ ...s, ipRank: i + 1 }));
  }, [ipRate, metricsWithIP.avgEngagement, metricsWithoutIP.avgEngagement]);

  const uclaConf = conferenceBenchmark.find(s => s.id === schoolId)!;
  const bigTenMedianIPPct = (() => {
    const sorted = [...conferenceBenchmark].sort((a, b) => a.ipPct - b.ipPct);
    return sorted[Math.floor(sorted.length / 2)].ipPct;
  })();
  const highestIPPct = conferenceBenchmark[0];

  // ─── Brand + IP alignment ──────────────────────────────
  const brandIPData = useMemo(() => {
    return brandGroups.map(bg => {
      const ipPosts = bg.posts.filter(p => ipMap.get(p._id));
      const totalEMV = bg.posts.reduce((s, p) => s + calculatePostEMV({
        athleteFollowers: p.metrics.followers || 0, likes: p.metrics.likes, comments: p.metrics.comments,
      }), 0);
      const recurring = bg.posts.length >= 3;
      return {
        brand: bg.displayName,
        handle: bg.handle,
        usesIP: ipPosts.length > 0,
        ipPostCount: ipPosts.length,
        totalPosts: bg.posts.length,
        ipRate: bg.posts.length > 0 ? (ipPosts.length / bg.posts.length) * 100 : 0,
        totalEMV,
        recurring,
        sports: bg.sports,
      };
    }).sort((a, b) => b.ipRate - a.ipRate);
  }, [brandGroups, ipMap]);

  // ─── IP usage trend (6 months) ─────────────────────────
  const ipTrend = useMemo(() => {
    const months: { label: string; ipRate: number }[] = [];
    for (let m = 7; m <= 12; m++) {
      const mStr = `2025-${String(m).padStart(2, '0')}`;
      const mPosts = posts.filter(p => p.publishedAt.$date.startsWith(mStr));
      const mIP = mPosts.filter(p => ipMap.get(p._id));
      months.push({
        label: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 7],
        ipRate: mPosts.length > 0 ? (mIP.length / mPosts.length) * 100 : 0,
      });
    }
    return months;
  }, [posts, ipMap]);

  // ─── AI Insights (data-driven) ─────────────────────────
  const insights = useMemo(() => {
    const items: string[] = [];
    const topSport = sportIPData[0];
    if (topSport) {
      items.push(`${formatSportName(topSport.sport)} sees the highest engagement lift from IP usage at +${topSport.liftEng.toFixed(0)}%, driven by ${topSport.withIP} IP-tagged posts.`);
    }
    const engLift = computeLift(metricsWithIP.avgEngagement, metricsWithoutIP.avgEngagement);
    items.push(`Posts featuring ${shortName} IP generate ${engLift.toFixed(0)}% higher engagement on average (${metricsWithIP.avgEngagement.toFixed(1)}% vs ${metricsWithoutIP.avgEngagement.toFixed(1)}%).`);

    const emvLift = computeLift(metricsWithIP.avgEMV, metricsWithoutIP.avgEMV);
    items.push(`Estimated EMV per post is ${emvLift.toFixed(0)}% higher when ${shortName} marks are present (${formatCurrency(metricsWithIP.avgEMV)} vs ${formatCurrency(metricsWithoutIP.avgEMV)}).`);

    if (uclaConf) {
      items.push(`${shortName} ranks #${uclaConf.ipRank} in the ${conference} for IP utilization rate at ${ipRate.toFixed(0)}%, compared to the conference median of ${bigTenMedianIPPct.toFixed(0)}%.`);
    }

    const topIPBrand = brandIPData.find(b => b.ipPostCount > 0 && b.totalPosts >= 3);
    if (topIPBrand) {
      items.push(`${topIPBrand.brand} leads in IP alignment with ${topIPBrand.ipRate.toFixed(0)}% of their ${topIPBrand.totalPosts} posts featuring ${shortName} marks.`);
    }

    const lowIPSport = [...sportIPData].sort((a, b) => a.ipRate - b.ipRate).find(s => s.total >= 5);
    if (lowIPSport) {
      items.push(`${formatSportName(lowIPSport.sport)} has the lowest IP utilization at ${lowIPSport.ipRate.toFixed(0)}% — increasing this could unlock significant engagement gains.`);
    }

    return items;
  }, [sportIPData, metricsWithIP, metricsWithoutIP, ipRate, uclaConf, bigTenMedianIPPct, brandIPData]);

  // ─── Drawer helpers ─────────────────────────────────────
  function openIPMetric(metric: string, definition: string, uclaValue: string, conferenceAvg: string, rank: string, insight: string) {
    const data: IPMetricDrawerData = { metric, definition, uclaValue, conferenceAvg, rank, insight };
    onOpenDrawer({ type: 'ip-metric', data });
  }

  // ─── Sport sort state ───────────────────────────────────
  const [sportSort, setSportSort] = useState<'lift' | 'ipRate' | 'sport'>('lift');
  const [sportSortAsc, setSportSortAsc] = useState(false);

  const sortedSportData = useMemo(() => {
    return [...sportIPData].sort((a, b) => {
      let cmp = 0;
      if (sportSort === 'lift') cmp = a.liftEng - b.liftEng;
      else if (sportSort === 'ipRate') cmp = a.ipRate - b.ipRate;
      else cmp = a.sport.localeCompare(b.sport);
      return sportSortAsc ? cmp : -cmp;
    });
  }, [sportIPData, sportSort, sportSortAsc]);

  function handleSportSort(key: typeof sportSort) {
    if (key === sportSort) setSportSortAsc(!sportSortAsc);
    else { setSportSort(key); setSportSortAsc(false); }
  }

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="flex gap-6">
      {/* Main content (left) */}
      <div className="flex-1 min-w-0 space-y-8">

        {/* ═══ 1) IP UTILIZATION RATE ═══════════════════════════ */}
        <section>
          <SectionHeader number="01" title="IP Utilization Rate" />

          <div className="mt-5 rounded-xl border bg-white overflow-hidden" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
            {/* Top row: UCLA rate + trend */}
            <div className="px-6 py-5 border-b" style={{ borderColor: uclaColors.border }}>
              <div className="flex items-baseline gap-6 flex-wrap">
                <button onClick={() => openIPMetric(
                  'IP Utilization Rate',
                  `Percentage of NIL-related posts that feature ${shortName} intellectual property (logos, marks, facilities, uniforms, official team assets).`,
                  ipRate.toFixed(1) + '%',
                  bigTenMedianIPPct.toFixed(1) + '%',
                  `#${uclaConf?.ipRank || '—'} of ${conferenceBenchmark.length}`,
                  insights[3] || '',
                )} className="group text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: uclaColors.textDim }}>
                    Athlete Sponsored Posts with {shortName} IP
                  </p>
                  <p className="text-3xl font-bold group-hover:opacity-80 transition-opacity" style={{ color: BLUE }}>
                    {ipRate.toFixed(1)}%
                  </p>
                </button>

                <Separator />

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: uclaColors.textDim }}>
                    Posts with IP
                  </p>
                  <p className="text-lg font-bold" style={{ color: uclaColors.text }}>
                    {withIP.length} <span className="text-sm font-normal" style={{ color: uclaColors.textMuted }}>of {posts.length}</span>
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: uclaColors.textDim }}>
                    Last 6 Months
                  </p>
                  <SparklineChart
                    data={ipTrend.map(t => t.ipRate)}
                    width={100} height={28}
                    color={uclaColors.gold}
                    showArea={false}
                  />
                </div>
              </div>
            </div>

            {/* Benchmark comparison strip */}
            <div className="px-6 py-4" style={{ backgroundColor: uclaColors.lightBg }}>
              <div className="flex items-center gap-8 flex-wrap text-sm">
                <BenchmarkChip
                  label={`${conference} Median`}
                  value={bigTenMedianIPPct.toFixed(0) + '%'}
                  highlight={ipRate > bigTenMedianIPPct}
                />
                <BenchmarkChip
                  label={`Highest (${conference})`}
                  value={highestIPPct.ipPct.toFixed(0) + '% — ' + highestIPPct.shortName}
                />
                <BenchmarkChip
                  label={`${shortName} Conf Rank`}
                  value={`#${uclaConf?.ipRank || '—'}`}
                  highlight
                />
              </div>
            </div>

            {/* IP by sport */}
            <div className="px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: uclaColors.textDim }}>
                IP Usage by Sport
              </p>
              <div className="space-y-2.5">
                {sportIPData.slice(0, 8).map(s => (
                  <div key={s.sport} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-[130px] truncate" style={{ color: uclaColors.text }}>
                      {formatSportName(s.sport)}
                    </span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: uclaColors.border }}>
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${s.ipRate}%`,
                        backgroundColor: sportColors[s.sport] || BLUE,
                      }} />
                    </div>
                    <span className="text-xs font-bold w-[40px] text-right" style={{ color: uclaColors.text }}>
                      {s.ipRate.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 2) PERFORMANCE LIFT FROM IP ═════════════════════ */}
        <section>
          <SectionHeader number="02" title="Performance Lift from IP" />

          <div className="mt-5 rounded-xl border bg-white overflow-hidden" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: uclaColors.border }}>
              <p className="text-xs" style={{ color: uclaColors.textMuted }}>
                Comparing performance of NIL posts with and without {shortName} intellectual property
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: uclaColors.border, backgroundColor: uclaColors.lightBg }}>
                    <th className="text-left py-3 pl-6 pr-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Metric</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: BLUE }}>With IP</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Without IP</th>
                    <th className="text-right py-3 pr-6 pl-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.gold }}>Lift %</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      metric: 'Avg Engagement Rate',
                      withVal: metricsWithIP.avgEngagement.toFixed(2) + '%',
                      withoutVal: metricsWithoutIP.avgEngagement.toFixed(2) + '%',
                      lift: computeLift(metricsWithIP.avgEngagement, metricsWithoutIP.avgEngagement),
                      drawerDef: 'Average engagement rate (likes + comments / followers) across all posts in the group.',
                    },
                    {
                      metric: 'Avg Reach',
                      withVal: formatNumber(metricsWithIP.avgReach),
                      withoutVal: formatNumber(metricsWithoutIP.avgReach),
                      lift: computeLift(metricsWithIP.avgReach, metricsWithoutIP.avgReach),
                      drawerDef: 'Average estimated reach per post, based on follower count and platform reach rates.',
                    },
                    {
                      metric: 'Est. EMV per Post',
                      withVal: formatCurrency(metricsWithIP.avgEMV),
                      withoutVal: formatCurrency(metricsWithoutIP.avgEMV),
                      lift: computeLift(metricsWithIP.avgEMV, metricsWithoutIP.avgEMV),
                      drawerDef: 'Estimated Earned Media Value per post, calculated using CPM, like value, and comment value.',
                    },
                    {
                      metric: 'Share Rate',
                      withVal: metricsWithIP.shareRate.toFixed(2) + '%',
                      withoutVal: metricsWithoutIP.shareRate.toFixed(2) + '%',
                      lift: computeLift(metricsWithIP.shareRate, metricsWithoutIP.shareRate),
                      drawerDef: 'Percentage of engaged users who shared the post, calculated as shares / (likes + comments + shares).',
                    },
                    {
                      metric: 'Brand Recurrence',
                      withVal: metricsWithIP.brandRecurrence.toFixed(0) + '%',
                      withoutVal: metricsWithoutIP.brandRecurrence.toFixed(0) + '%',
                      lift: computeLift(metricsWithIP.brandRecurrence, metricsWithoutIP.brandRecurrence),
                      drawerDef: 'Percentage of brands with 3+ posts in the group, indicating repeat partnership activity.',
                    },
                  ].map((row, i) => (
                    <tr key={i}
                      className="border-b last:border-b-0 cursor-pointer hover:bg-blue-50/30 transition-colors"
                      style={{ borderColor: uclaColors.border }}
                      onClick={() => openIPMetric(
                        row.metric,
                        row.drawerDef,
                        row.withVal,
                        metricsWithoutIP.avgEngagement > 0 ? 'N/A (internal comparison)' : '—',
                        '—',
                        `Posts with ${shortName} IP show a ${row.lift > 0 ? '+' : ''}${row.lift.toFixed(1)}% lift in ${row.metric.toLowerCase()}.`,
                      )}>
                      <td className="py-4 pl-6 pr-4">
                        <span className="text-sm font-medium" style={{ color: uclaColors.text }}>{row.metric}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-bold" style={{ color: BLUE }}>{row.withVal}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm" style={{ color: uclaColors.textMuted }}>{row.withoutVal}</span>
                      </td>
                      <td className="py-4 pr-6 pl-4 text-right">
                        <LiftBadge value={row.lift} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══ 3) SPORT-LEVEL IP IMPACT ═══════════════════════ */}
        <section>
          <SectionHeader number="03" title="Sport-Level IP Impact" />

          <div className="mt-5 rounded-xl border bg-white overflow-hidden" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: uclaColors.border, backgroundColor: uclaColors.lightBg }}>
                    <th className="text-left py-3 pl-6 pr-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>#</th>
                    <SortTh label="Sport" active={sportSort === 'sport'} onClick={() => handleSportSort('sport')} asc={sportSortAsc && sportSort === 'sport'} />
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Posts</th>
                    <SortTh label="IP Rate" active={sportSort === 'ipRate'} onClick={() => handleSportSort('ipRate')} align="right" asc={sportSortAsc && sportSort === 'ipRate'} />
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Eng. w/ IP</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Eng. w/o IP</th>
                    <SortTh label="Lift" active={sportSort === 'lift'} onClick={() => handleSportSort('lift')} align="right" asc={sportSortAsc && sportSort === 'lift'} />
                  </tr>
                </thead>
                <tbody>
                  {sortedSportData.map((s, i) => (
                    <tr key={s.sport} className="border-b last:border-b-0 hover:bg-blue-50/30 transition-colors"
                      style={{ borderColor: uclaColors.border }}>
                      <td className="py-3.5 pl-6 pr-4 font-medium" style={{ color: uclaColors.textDim }}>{i + 1}</td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sportColors[s.sport] || uclaColors.textDim }} />
                          <span className="font-medium" style={{ color: uclaColors.text }}>{formatSportName(s.sport)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right" style={{ color: uclaColors.textMuted }}>{s.total}</td>
                      <td className="py-3.5 px-4 text-right font-medium" style={{ color: uclaColors.text }}>{s.ipRate.toFixed(0)}%</td>
                      <td className="py-3.5 px-4 text-right font-medium" style={{ color: BLUE }}>{s.avgEngWith.toFixed(2)}%</td>
                      <td className="py-3.5 px-4 text-right" style={{ color: uclaColors.textMuted }}>{s.avgEngWithout.toFixed(2)}%</td>
                      <td className="py-3.5 px-4 text-right"><LiftBadge value={s.liftEng} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══ 4) CONFERENCE IP BENCHMARK ═════════════════════ */}
        <section>
          <SectionHeader number="04" title="Conference IP Benchmark" />

          <div className="mt-5 rounded-xl border bg-white overflow-hidden" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: uclaColors.border, backgroundColor: uclaColors.lightBg }}>
                    <th className="text-left py-3 pl-6 pr-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Rank</th>
                    <th className="text-left py-3 pr-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>School</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>% NIL Posts w/ IP</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Eng. Lift from IP</th>
                  </tr>
                </thead>
                <tbody>
                  {conferenceBenchmark.map(s => {
                    const isUcla = s.id === schoolId;
                    return (
                      <tr key={s.id}
                        className="border-b last:border-b-0 transition-colors"
                        style={{
                          borderColor: uclaColors.border,
                          backgroundColor: isUcla ? BLUE + '06' : undefined,
                        }}>
                        <td className="py-3.5 pl-6 pr-4">
                          <span className={`text-sm ${isUcla ? 'font-bold' : 'font-medium'}`}
                            style={{ color: isUcla ? BLUE : uclaColors.textMuted }}>
                            {s.ipRank}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <img src={s.logoUrl} alt={s.shortName} className="w-5 h-5 object-contain" />
                            <span className={isUcla ? 'font-bold' : 'font-medium'}
                              style={{ color: isUcla ? BLUE : uclaColors.text }}>
                              {s.shortName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium" style={{ color: uclaColors.text }}>
                          {s.ipPct.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <LiftBadge value={s.engLift} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ═══ 5) BRAND + IP ALIGNMENT ════════════════════════ */}
        <section>
          <SectionHeader number="05" title="Brand + IP Alignment" />

          <div className="mt-5 rounded-xl border bg-white overflow-hidden" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: uclaColors.border, backgroundColor: uclaColors.lightBg }}>
                    <th className="text-left py-3 pl-6 pr-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Brand</th>
                    <th className="text-center py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Uses {shortName} IP?</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}># Posts</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>IP Posts</th>
                    <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Est. EMV</th>
                    <th className="text-center py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Recurring?</th>
                    <th className="text-left py-3 pr-6 pl-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Sports</th>
                  </tr>
                </thead>
                <tbody>
                  {brandIPData.slice(0, 20).map(b => (
                    <tr key={b.handle}
                      className="border-b last:border-b-0 hover:bg-blue-50/30 transition-colors"
                      style={{ borderColor: uclaColors.border }}>
                      <td className="py-3 pl-6 pr-4">
                        <div>
                          <span className="font-medium" style={{ color: uclaColors.text }}>{b.brand}</span>
                          <p className="text-[10px]" style={{ color: uclaColors.textDim }}>{b.handle}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {b.usesIP ? (
                          <span className="inline-block w-5 h-5 rounded-full text-[10px] font-bold leading-5 text-center"
                            style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                            &#10003;
                          </span>
                        ) : (
                          <span className="inline-block w-5 h-5 rounded-full text-[10px] font-bold leading-5 text-center"
                            style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
                            &#10005;
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium" style={{ color: uclaColors.text }}>{b.totalPosts}</td>
                      <td className="py-3 px-4 text-right" style={{ color: uclaColors.textMuted }}>{b.ipPostCount}</td>
                      <td className="py-3 px-4 text-right font-medium" style={{ color: BLUE }}>{formatCurrency(b.totalEMV)}</td>
                      <td className="py-3 px-4 text-center">
                        {b.recurring ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ backgroundColor: uclaColors.gold + '20', color: '#92650a' }}>
                            RECURRING
                          </span>
                        ) : (
                          <span className="text-[10px]" style={{ color: uclaColors.textDim }}>—</span>
                        )}
                      </td>
                      <td className="py-3 pr-6 pl-4">
                        <div className="flex flex-wrap gap-1">
                          {b.sports.slice(0, 2).map(s => (
                            <span key={s} className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                              style={{ backgroundColor: BLUE + '10', color: BLUE }}>
                              {formatSportName(s).split(' ').pop()}
                            </span>
                          ))}
                          {b.sports.length > 2 && (
                            <span className="text-[9px]" style={{ color: uclaColors.textDim }}>+{b.sports.length - 2}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* ═══ 6) AI INSIGHT BLOCK (Right sidebar) ═════════════ */}
      <aside className="hidden xl:block w-[280px] flex-shrink-0">
        <div className="sticky top-[120px] rounded-xl border bg-white p-5" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: uclaColors.gold + '20' }}>
              <Lightbulb className="w-4 h-4" style={{ color: uclaColors.gold }} />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: uclaColors.textMuted }}>
              Key Insights
            </h3>
          </div>
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <div key={i} className="pb-4 border-b last:border-b-0 last:pb-0" style={{ borderColor: uclaColors.border }}>
                <p className="text-[12px] leading-relaxed" style={{ color: uclaColors.text }}>
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function computeGroupMetrics(posts: SponsorPost[]) {
  if (posts.length === 0) return { avgEngagement: 0, avgReach: 0, avgEMV: 0, shareRate: 0, brandRecurrence: 0 };

  const totalEng = posts.reduce((s, p) => s + p.metrics.engagementRate, 0);
  const totalReach = posts.reduce((s, p) => s + (p.metrics.reach || 0), 0);
  const totalEMV = posts.reduce((s, p) => s + calculatePostEMV({
    athleteFollowers: p.metrics.followers || 0, likes: p.metrics.likes, comments: p.metrics.comments,
  }), 0);
  const totalShares = posts.reduce((s, p) => s + (p.metrics.shares || 0), 0);
  const totalInteractions = posts.reduce((s, p) => s + p.metrics.likes + p.metrics.comments + (p.metrics.shares || 0), 0);

  // Brand recurrence: % of brands appearing 3+ times
  const brandCounts = new Map<string, number>();
  posts.forEach(p => {
    const key = p.sponsorPartner.toLowerCase();
    brandCounts.set(key, (brandCounts.get(key) || 0) + 1);
  });
  const totalBrands = brandCounts.size;
  const recurringBrands = [...brandCounts.values()].filter(c => c >= 3).length;

  return {
    avgEngagement: totalEng / posts.length,
    avgReach: Math.round(totalReach / posts.length),
    avgEMV: totalEMV / posts.length,
    shareRate: totalInteractions > 0 ? (totalShares / totalInteractions) * 100 : 0,
    brandRecurrence: totalBrands > 0 ? (recurringBrands / totalBrands) * 100 : 0,
  };
}

function computeLift(withVal: number, withoutVal: number): number {
  return withoutVal > 0 ? ((withVal - withoutVal) / withoutVal) * 100 : 0;
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-bold tracking-wider" style={{ color: uclaColors.gold }}>{number}</span>
      <div className="h-px flex-1 max-w-[24px]" style={{ backgroundColor: uclaColors.gold + '40' }} />
      <h2 className="text-base font-bold tracking-tight" style={{ color: uclaColors.text }}>{title}</h2>
    </div>
  );
}

function Separator() {
  return <div className="hidden sm:block w-px h-10 self-center" style={{ backgroundColor: uclaColors.border }} />;
}

function BenchmarkChip({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const { colors } = useNilContext();
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>{label}</p>
      <p className={`text-sm mt-0.5 ${highlight ? 'font-bold' : 'font-medium'}`}
        style={{ color: highlight ? colors.primary : uclaColors.text }}>
        {value}
      </p>
    </div>
  );
}

function LiftBadge({ value }: { value: number }) {
  const positive = value > 0;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
      style={{
        backgroundColor: positive ? uclaColors.gold + '18' : '#fee2e2',
        color: positive ? '#92650a' : '#991b1b',
      }}>
      {positive ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
}

function SortTh({ label, active, onClick, align, asc }: { label: string; active: boolean; onClick: () => void; align?: string; asc: boolean }) {
  const { colors } = useNilContext();
  return (
    <th className={`py-3 px-4 text-[10px] font-semibold uppercase tracking-wider cursor-pointer select-none hover:opacity-70 ${align === 'right' ? 'text-right' : 'text-left'}`}
      style={{ color: active ? colors.primary : uclaColors.textDim }}
      onClick={onClick}>
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (asc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 opacity-30" />}
      </span>
    </th>
  );
}
