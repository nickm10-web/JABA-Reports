import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import contentsData from '../data/Genesco_contents.json';
import rosterData from '../data/Genesco_Roster.json';
import { computePerformsLike, type PerformsLike } from '../utils/performsLike';
import { analyzeCaption, buildProfile, compareToProfile, voiceNote } from '../utils/captionAnalysis';
import benchmarkData from '../data/performsLikeBenchmarks.json';
import brandPeersData from '../data/genescoBrandPeers.json';
import tierMediansData from '../data/tierMedians.json';

// ─── Types ────────────────────────────────────────────────────────────────────

type PostMetrics = { comments?: number | null; likes?: number; engagementRate?: number; videoViews?: number };
type Post = {
  _id: string; athlete: { _id: string; name: string; image?: string; sport?: string };
  caption?: string; createdAt?: { $date: string }; publishedAt?: { $date: string };
  isSponsored?: boolean; mediaType?: string; metrics?: PostMetrics; permalink?: string;
  sponsorPartner?: string; url?: string;
  commentsHidden?: boolean; likeAndViewCountsDisabled?: boolean;
};
type RosterAthlete = {
  firstName?: string; lastName?: string; profilePicture?: string; sport?: string;
  metrics?: { sevenDays?: { followers?: number; marketability?: number; influencePower?: number; audienceConnection?: number } };
};
type TierName = 'Mega' | 'Large' | 'Mid' | 'Emerging' | 'Micro' | 'No audience';
type Baseline = { posts: number; videoPosts: number; likes: number; comments: number; views: number; er: number };
type CampaignPost = {
  post: Post; athlete: AthleteRow; brand: string; brandDisplay: string; brandDomain: string;
  baseline: Baseline;
  actual: { likes: number; comments: number | null; views: number | null; er: number };
  deltas: { likes: number | null; comments: number | null; views: number | null; er: number | null };
  performanceIndex: number | null;
  status: 'Outperformed' | 'On pace' | 'Underperformed' | 'Limited baseline';
};
type AthleteRow = {
  name: string; sport: string; image?: string; followers: number; tier: TierName;
  marketability: number; influencePower: number; audienceConnection: number;
  allPosts: Post[]; baselinePosts: Post[]; campaignPosts: Post[];
  baseline: Baseline; campaign: Baseline;
  campaignIndex: number | null; tierMedianER: number; tierFlag: string;
  performsLike: PerformsLike | null;
};

// ─── Brand registry ───────────────────────────────────────────────────────────

// Only confirmed Genesco Sports Enterprises brokered brands
const BRANDS: Record<string, { display: string; domain: string; logo: string }> = {
  '@loweshomeimprovement':{ display: "Lowe's",          domain: 'lowes.com',        logo: '/logos/lowes.svg' },
  '@pepsi':               { display: 'Pepsi',           domain: 'pepsi.com',        logo: '/logos/pepsi_logo.png' },
  '@budlight':            { display: 'Bud Light',       domain: 'budlight.com',     logo: '/logos/budlight.svg' },
  '@7eleven':             { display: '7-Eleven',        domain: '7-eleven.com',     logo: '/logos/7eleven.svg' },
};

// Athlete headshot map (local public assets)
const ATHLETE_HEADSHOTS: Record<string, string> = {
  'Lionel Messi':       '/athletes/messi_crop.jpg',
  'Travis Kelce':       '/athletes/kelce_crop.jpg',
  "Ja'Marr Chase":      '/athletes/chase_crop.jpg',
  'Brian Robinson Jr.': '/athletes/robinson_crop.jpg',
  'Josh Jobe':          '/athletes/jobe_crop.jpg',
};

// Brands to exclude - not confirmed as Genesco Sports Enterprises placements
const EXCLUDED_BRANDS = new Set([
  '@messifragrances', '@icons_memorabilia',
  '@adidasfootball', '@adidas', '@adidasar',
  '@mastercard', '@efootball', '@americaneagle',
  '@snickers', '@oakleymeta', '@bountypapertowels', '@sleepnumber',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const posts = contentsData as Post[];
const roster = rosterData as RosterAthlete[];

const fmtInt = (n: number) => {
  if (!Number.isFinite(n)) return '0';
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return Math.round(n).toLocaleString();
};
const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;
const fmtPctShort = (n: number) => `${(n * 100).toFixed(1)}%`;
const fmtDelta = (n: number | null) => n === null ? 'N/A' : `${n >= 0 ? '+' : ''}${(n * 100).toFixed(0)}%`;
const fullName = (r: RosterAthlete) => `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim();
const getDate = (p: Post) => p.publishedAt?.$date ?? p.createdAt?.$date ?? '';
const tierForFollowers = (f: number): TierName => {
  if (f >= 10_000_000) return 'Mega';
  if (f >= 1_000_000) return 'Large';
  if (f >= 100_000) return 'Mid';
  if (f >= 10_000) return 'Emerging';
  if (f > 0) return 'Micro';
  return 'No audience';
};
const ratioDelta = (actual: number, expected: number) => expected > 0 ? actual / expected - 1 : null;
const avgMetric = <T,>(rows: T[], fn: (r: T) => number) => {
  const vals = rows.map(fn).filter((v) => Number.isFinite(v));
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
};
const avgEngagement = <T,>(rows: T[], fn: (r: T) => number) => {
  const vals = rows.map(fn).filter((v) => Number.isFinite(v) && v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
};
const clipDelta = (d: number) => Math.max(-0.95, Math.min(10, d));
const summarizeBaseline = (rows: Post[]): Baseline => {
  const vids = rows.filter((p) => (p.mediaType ?? '').toUpperCase() === 'VIDEO');
  return {
    posts: rows.length, videoPosts: vids.length,
    likes: avgMetric(rows, (p) => p.metrics?.likes ?? 0),
    comments: avgMetric(rows, (p) => p.metrics?.comments ?? 0),
    views: avgMetric(vids, (p) => p.metrics?.videoViews ?? 0),
    er: avgEngagement(rows, (p) => p.metrics?.engagementRate ?? 0),
  };
};
const perfStatus = (idx: number | null, bPosts: number): CampaignPost['status'] => {
  if (bPosts < 5 || idx === null) return 'Limited baseline';
  if (idx >= 1.15) return 'Outperformed';
  if (idx <= 0.85) return 'Underperformed';
  return 'On pace';
};
const fmtDate = (post: Post) => {
  const raw = getDate(post);
  if (!raw) return '-';
  return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtWindow = (w: { start: Date | null; end: Date | null }) => {
  if (!w.start || !w.end) return '-';
  const f = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return `${f(w.start)} – ${f(w.end)}`;
};
const getSponsor = (post: Post) => {
  const tagged = post.sponsorPartner?.trim().toLowerCase();
  if (tagged && tagged !== 'unknown' && tagged !== '') {
    if (EXCLUDED_BRANDS.has(tagged)) return null;
    const meta = BRANDS[tagged];
    return { handle: tagged, display: meta?.display ?? tagged, domain: meta?.domain ?? '', logo: meta?.logo ?? '' };
  }
  if (!post.isSponsored || !post.caption) return null;
  const lower = post.caption.toLowerCase();
  // Detect Pepsi from caption
  if (lower.includes('@pepsi') || lower.includes('#pepsipartner') || lower.includes('pepsi')) {
    const m = BRANDS['@pepsi'];
    if (m) return { handle: '@pepsi', display: m.display, domain: m.domain, logo: m.logo };
  }
  // Detect Bud Light / TEU from caption
  if (lower.includes('teu') || lower.includes('tight end university') || lower.includes('budlight') || lower.includes('bud light')) {
    const m = BRANDS['@budlight'];
    if (m) return { handle: '@budlight', display: m.display, domain: m.domain, logo: m.logo };
  }
  // Detect 7-Eleven from caption
  if (lower.includes('#7elevenpartner') || lower.includes('7-eleven') || lower.includes('7eleven')) {
    const m = BRANDS['@7eleven'];
    if (m) return { handle: '@7eleven', display: m.display, domain: m.domain, logo: m.logo };
  }
  return null;
};

// ─── Theme ────────────────────────────────────────────────────────────────────

const C = {
  bg: '#000000',
  bgDeep: '#000000',
  bgCard: 'rgba(255,255,255,0.03)',
  bgCardHov: 'rgba(255,255,255,0.055)',
  bgCardSolid: '#111111',
  border: 'rgba(255,255,255,0.12)',
  borderMed: 'rgba(255,255,255,0.18)',
  chartreuse: '#DFFF00',
  chartreuseDim: 'rgba(223,255,0,0.14)',
  chartreuseBorder: 'rgba(223,255,0,0.45)',
  text: 'rgba(255,255,255,0.95)',
  text2: 'rgba(255,255,255,0.65)',
  text3: 'rgba(255,255,255,0.38)',
  blue: '#1B6FE8',
  blueL: '#5B9BFF',
  blueDim: 'rgba(27,111,232,0.15)',
  blueBorder: 'rgba(27,111,232,0.35)',
  green: '#22C55E',
  greenDim: 'rgba(34,197,94,0.12)',
  greenBorder: 'rgba(34,197,94,0.30)',
  amber: '#F59E0B',
  amberDim: 'rgba(245,158,11,0.12)',
  amberBorder: 'rgba(245,158,11,0.30)',
  red: '#EF4444',
  redDim: 'rgba(239,68,68,0.10)',
  redBorder: 'rgba(239,68,68,0.25)',
  slate: '#94A3B8',
  slateDim: 'rgba(148,163,184,0.10)',
  slateBorder: 'rgba(148,163,184,0.22)',
  purple: '#A855F7',
};

const NAV = [
  { id: 'summary',         label: 'Summary' },
  { id: 'post-deep-dive',  label: 'Post Analysis' },
  { id: 'brand-peers',     label: 'Brand Peers' },
  { id: 'bubble-matrix',   label: 'Weight Class' },
  { id: 'tier-comparison', label: 'Tier View' },
] as const;

// ─── Main Component ───────────────────────────────────────────────────────────

export function GenescoReportV2() {
  useEffect(() => {
    if (document.querySelector('link[data-gse]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.dataset.gse = '1';
    l.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap';
    document.head.appendChild(l);
  }, []);

  const data = useMemo(() => {
    const rMap = new Map<string, RosterAthlete>();
    roster.forEach((r) => { const n = fullName(r); if (n) rMap.set(n, r); });

    const byAthlete = new Map<string, { all: Post[]; base: Post[]; camp: Post[] }>();
    posts.forEach((p) => {
      const n = p.athlete?.name ?? 'Unknown';
      const row = byAthlete.get(n) ?? { all: [], base: [], camp: [] };
      row.all.push(p);
      if (p.isSponsored) row.camp.push(p); else row.base.push(p);
      byAthlete.set(n, row);
    });

    const athletes: AthleteRow[] = Array.from(byAthlete.entries()).map(([name, rows]) => {
      const rr = rMap.get(name);
      const followers = rr?.metrics?.sevenDays?.followers ?? 0;
      return {
        name, sport: rows.all[0]?.athlete?.sport ?? rr?.sport ?? 'Unknown',
        image: ATHLETE_HEADSHOTS[name] ?? rows.all[0]?.athlete?.image ?? rr?.profilePicture,
        followers, tier: tierForFollowers(followers),
        marketability: rr?.metrics?.sevenDays?.marketability ?? 0,
        influencePower: rr?.metrics?.sevenDays?.influencePower ?? 0,
        audienceConnection: rr?.metrics?.sevenDays?.audienceConnection ?? 0,
        allPosts: rows.all, baselinePosts: rows.base, campaignPosts: rows.camp,
        baseline: summarizeBaseline(rows.base), campaign: summarizeBaseline(rows.camp),
        campaignIndex: null, tierMedianER: 0, tierFlag: '', performsLike: null,
      };
    });

    // Tier medians sourced from the full JABA athlete corpus (~13K athletes),
    // not just this roster. Built by scripts/buildTierMedians.mjs.
    const tierStats = new Map<TierName, number>(
      (Object.entries(tierMediansData.tiers) as [TierName, { medianER: number }][])
        .map(([tier, b]) => [tier, b.medianER])
    );

    const campaignPosts: CampaignPost[] = posts
      .filter((p) => p.isSponsored)
      .flatMap((post) => {
        const sp = getSponsor(post);
        if (!sp) return [];
        const athlete = athletes.find((a) => a.name === post.athlete?.name);
        if (!athlete) return [];
        // Treat hidden comments and zero-view videos as unavailable - they
        // skew deltas toward catastrophic-looking numbers when reality is
        // just "we don't have that data".
        const isVideo = (post.mediaType ?? '').toUpperCase() === 'VIDEO';
        const rawComments = post.metrics?.comments;
        const commentsAvailable = !post.commentsHidden && rawComments != null;
        const rawViews = post.metrics?.videoViews ?? 0;
        const viewsAvailable = isVideo && rawViews > 0 && !post.likeAndViewCountsDisabled;

        const actual = {
          likes: post.metrics?.likes ?? 0,
          comments: commentsAvailable ? (rawComments as number) : null,
          views: viewsAvailable ? rawViews : null,
          er: post.metrics?.engagementRate ?? 0,
        };
        const deltas = {
          likes: ratioDelta(actual.likes, athlete.baseline.likes),
          comments: commentsAvailable && athlete.baseline.comments >= 10
            ? ratioDelta(actual.comments as number, athlete.baseline.comments)
            : null,
          views: viewsAvailable && athlete.baseline.videoPosts >= 3
            ? ratioDelta(actual.views as number, athlete.baseline.views)
            : null,
          er: ratioDelta(actual.er, athlete.baseline.er),
        };
        // Weighted index: ER and likes are primary signals (weight 2x each), comments and views secondary (1x)
        // This prevents low-comment outliers from collapsing the score for image posts
        const weightedInputs: number[] = [];
        if (deltas.er !== null && Number.isFinite(deltas.er)) {
          const r = 1 + clipDelta(deltas.er);
          weightedInputs.push(r, r); // weight 2
        }
        if (deltas.likes !== null && Number.isFinite(deltas.likes)) {
          const r = 1 + clipDelta(deltas.likes);
          weightedInputs.push(r, r); // weight 2
        }
        if (deltas.comments !== null && Number.isFinite(deltas.comments)) {
          weightedInputs.push(1 + clipDelta(deltas.comments)); // weight 1
        }
        if (deltas.views !== null && Number.isFinite(deltas.views)) {
          weightedInputs.push(1 + clipDelta(deltas.views)); // weight 1
        }
        const performanceIndex = weightedInputs.length
          ? Math.exp(weightedInputs.reduce((a, b) => a + Math.log(Math.max(b, 0.05)), 0) / weightedInputs.length)
          : null;
        return [{
          post, athlete, brand: sp.handle, brandDisplay: sp.display, brandDomain: sp.domain,
          baseline: athlete.baseline, actual, deltas, performanceIndex,
          status: perfStatus(performanceIndex, athlete.baseline.posts),
        }];
      })
      .sort((a, b) => (b.performanceIndex ?? 0) - (a.performanceIndex ?? 0));

    const withIndexes = athletes.map((a) => {
      const aCamp = campaignPosts.filter((r) => r.athlete.name === a.name);
      const ratios = aCamp.map((r) => r.performanceIndex).filter((v): v is number => v !== null);
      const campaignIndex = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null;
      const tierER = tierStats.get(a.tier) ?? 0;
      let tierFlag = 'No campaign this window';
      if (campaignIndex !== null && campaignIndex >= 1.15) tierFlag = 'Outperformed on campaign';
      else if (campaignIndex !== null && campaignIndex <= 0.85) tierFlag = 'Underperformed on campaign';
      else if (a.baseline.er > tierER * 1.15) tierFlag = 'Outperforms their tier';
      else if (a.baseline.er < tierER * 0.85) tierFlag = 'Below their tier';
      else if (a.followers >= 1_000_000) tierFlag = 'Audience scale play';
      else tierFlag = 'High-efficiency engagement';
      const performsLike = a.baseline.posts >= 3
        ? computePerformsLike(a.followers, a.baseline.comments, a.baseline.likes)
        : null;
      return { ...a, campaignIndex, tierMedianER: tierER, tierFlag, performsLike };
    });

    const brandHandles = Array.from(new Set(campaignPosts.map((p) => p.brand)));
    const brands = brandHandles.map((handle) => {
      const bp = campaignPosts.filter((r) => r.brand === handle);
      const validIdx = bp.map((r) => r.performanceIndex).filter((v): v is number => v !== null);
      const avgIndex = validIdx.length ? validIdx.reduce((a, b) => a + b, 0) / validIdx.length : 0;
      return {
        handle, display: bp[0]?.brandDisplay ?? handle, domain: bp[0]?.brandDomain ?? '',
        logo: BRANDS[handle]?.logo ?? '',
        posts: bp.length, athletes: Array.from(new Set(bp.map((r) => r.athlete.name))),
        avgIndex,
        outperformed: bp.filter((r) => r.status === 'Outperformed').length,
        onPace: bp.filter((r) => r.status === 'On pace').length,
        underperformed: bp.filter((r) => r.status === 'Underperformed').length,
      };
    }).sort((a, b) => b.posts - a.posts);

    const dates = posts.map((p) => Date.parse(getDate(p))).filter((ms) => Number.isFinite(ms));

    // Roster-wide averages for the hero KPI strip.
    const validERs = campaignPosts.map((r) => r.actual.er).filter((x) => x > 0);
    const avgCampaignER = validERs.length ? validERs.reduce((a, b) => a + b, 0) / validERs.length : 0;
    const validLifts = campaignPosts.map((r) => r.deltas.er).filter((x): x is number => x !== null && Number.isFinite(x));
    // avgCampaignDiscount: negative average of ER deltas (positive value = % drop vs organic).
    const avgDelta = validLifts.length ? validLifts.reduce((a, b) => a + b, 0) / validLifts.length : 0;
    const avgCampaignDiscount = -avgDelta;
    const totalLikes = campaignPosts.reduce((s, r) => s + (r.actual.likes ?? 0), 0);

    return {
      avgCampaignER,
      avgCampaignDiscount,
      totalLikes,
      campaignPosts,
      athletes: withIndexes.sort((a, b) => (b.campaignIndex ?? b.baseline.er) - (a.campaignIndex ?? a.baseline.er)),
      brands,
      counts: {
        total: campaignPosts.length,
        outperformed: campaignPosts.filter((r) => r.status === 'Outperformed').length,
        onPace: campaignPosts.filter((r) => r.status === 'On pace').length,
        underperformed: campaignPosts.filter((r) => r.status === 'Underperformed').length,
        limitedBaseline: campaignPosts.filter((r) => r.status === 'Limited baseline').length,
        brands: brandHandles.length,
        campaignAthletes: new Set(campaignPosts.map((p) => p.athlete.name)).size,
        baselinePosts: posts.filter((p) => !p.isSponsored).length,
      },
      window: { start: dates.length ? new Date(Math.min(...dates)) : null, end: dates.length ? new Date(Math.max(...dates)) : null },
    };
  }, []);

  return (
    <div className="gse">
      <style>{css}</style>
      <TopNav />
      <main className="body">

        {/* ── 1. Executive Summary ── */}
        <section className="section hero-section" id="summary">
          <div className="hero-brand">
            <img src="/logos/genesco-gse.svg" alt="Genesco Sports Enterprises" className="hero-logo" />
            <div className="hero-sep" />
            <div>
              <div className="hero-title">Campaign Performance Report</div>
              <div className="hero-sub">Instagram · Sponsored Placement Analysis</div>
            </div>
          </div>

          <div className="hero-kpis">
            <div className="hero-kpi">
              <span className="hero-kpi-v">{data.counts.total}</span>
              <span className="hero-kpi-l">Campaign posts</span>
            </div>
            <div className="hero-kpi">
              <span className="hero-kpi-v">{data.counts.campaignAthletes}</span>
              <span className="hero-kpi-l">Athletes</span>
            </div>
            <div className="hero-kpi">
              <span className="hero-kpi-v">{data.counts.brands}</span>
              <span className="hero-kpi-l">Brands</span>
            </div>
            <div className="hero-kpi">
              <span className="hero-kpi-v">{fmtInt(data.totalLikes)}</span>
              <span className="hero-kpi-l">Total likes generated</span>
            </div>
            <div className="hero-kpi">
              <span className="hero-kpi-v">{fmtPctShort(data.avgCampaignER)}</span>
              <span className="hero-kpi-l">Avg campaign ER</span>
            </div>
            <div className="hero-kpi">
              <span className="hero-kpi-v">{fmtDelta(-data.avgCampaignDiscount)}</span>
              <span className="hero-kpi-l">Avg lift vs organic</span>
            </div>
          </div>

          <p className="hero-meta">
            Data window: {fmtWindow(data.window)} &nbsp;·&nbsp; Reviewed {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &nbsp;·&nbsp; Baseline: each athlete's non-sponsored Instagram posts in the same window
          </p>
        </section>

        {/* ── 2. Post Analysis (ranked) ── */}
        <section className="section" id="post-deep-dive">
          <SectionHeader
            eyebrow="Campaign Overview"
            title="What Worked. What Didn't."
            subtitle="Each campaign post ranked against that athlete's own organic (non-sponsored) baseline in the same window. Deltas reflect JABA's Sponsored Content Discount Factor, the personal sponsored-vs-organic gap measured for every athlete." />
          <div className="post-table-wrap">
            {data.campaignPosts.map((row, i) => (
              <PostDeepDiveRow key={row.post._id} row={row} rank={i + 1} total={data.campaignPosts.length} />
            ))}
          </div>
        </section>

        {/* ── 4. Brand Peer Comparison ── */}
        <section className="section" id="brand-peers">
          <SectionHeader
            eyebrow="Brand Benchmarks"
            title="How Genesco Posts Rank vs Brand Peers"
            subtitle="For each brokered brand, the campaign's posts are compared to other athletes who have worked with the same brand across JABA's sponsored content library. Peer medians set a realistic bar; percentile rank shows where each Genesco post lands in the distribution." />
          <div className="peer-grid">
            {(() => {
              // Group campaign posts by (brand, athlete). A single Messi-Lowe's
              // card stacking 3 posts reads cleaner than 3 orphan cards.
              const groups = new Map<string, { brand: string; athlete: string; rows: CampaignPost[] }>();
              for (const row of data.campaignPosts) {
                const key = `${row.brand}|${row.athlete.name}`;
                if (!groups.has(key)) groups.set(key, { brand: row.brand, athlete: row.athlete.name, rows: [] });
                groups.get(key)!.rows.push(row);
              }
              return Array.from(groups.values()).map((g) => (
                <PeerCard key={`${g.brand}|${g.athlete}`} rows={g.rows} />
              ));
            })()}
          </div>
        </section>

        {/* ── 5. Bubble Matrix ── */}
        <section className="section" id="bubble-matrix">
          <SectionHeader
            eyebrow="Engagement Weight Class"
            title="Comments vs. Followers: Performs Like"
            subtitle="Each bubble shows where an athlete's organic engagement lands relative to their follower count. A green ring means they punch above their weight; amber means they're leaving engagement on the table." />
          <BubbleMatrix athletes={data.athletes} />
        </section>

        {/* ── 6. Tier Comparison ── */}
        <section className="section" id="tier-comparison">
          <SectionHeader
            eyebrow="Roster Intelligence"
            title="Organic Tier Standing"
            subtitle={`Each athlete's organic engagement rate compared to the median for their follower tier, benchmarked against ${fmtInt(tierMediansData.totalAthletes)} athletes across the full JABA universe. Athletes above the tier median are delivering outsized value relative to their audience size; athletes below it are under-delivering for their reach.`} />
          <TierComparisonTable athletes={data.athletes} campaignPosts={data.campaignPosts} />
        </section>

        <footer className="report-footer">
          <div className="footer-inner">
            <img src="/logos/genesco-gse.svg" alt="GSE" className="footer-logo" />
            <div className="footer-lines">
              <span>Genesco Sports Enterprises · Confidential Campaign Review</span>
              <span>Window: {fmtWindow(data.window)} · {data.counts.total + data.counts.baselinePosts} total posts analyzed</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopNav() {
  const [active, setActive] = useState(NAV[0].id as string);
  useEffect(() => {
    const els = NAV.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="nav-brand-wrap">
          <img src="/logos/genesco-gse.svg" alt="GSE" className="nav-logo" />
          <span className="nav-brand-label">Campaign Review</span>
        </div>
        <nav className="nav-links">
          {NAV.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={`nl ${active === s.id ? 'nl-a' : ''}`}
              onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="sh">
      <span className="sh-eye">{eyebrow}</span>
      <h2 className="sh-title">{title}</h2>
      {subtitle && <p className="sh-sub">{subtitle}</p>}
    </div>
  );
}



// Per-athlete avatar overrides - replace badly-framed source images with a
// known-good local crop.
const AVATAR_OVERRIDE: Record<string, string> = {
  'Lionel Messi':  '/athletes/messi.png',
  'Travis Kelce':  '/athletes/travis.png',
  "Ja'Marr Chase": '/athletes/chase.png',
};

function AthleteAvatar({ name, image, size = 44 }: { name: string; image?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const style = { width: size, height: size, borderRadius: '50%', flexShrink: 0 } as React.CSSProperties;
  const src = AVATAR_OVERRIDE[name] ?? image;
  if (src && !failed) {
    return <img src={src} alt={name} style={{ ...style, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.12)' }} onError={() => setFailed(true)} />;
  }
  return (
    <div style={{ ...style, background: 'rgba(27,111,232,0.2)', display: 'grid', placeItems: 'center', fontSize: size * 0.3, fontWeight: 700, color: C.blueL, border: '2px solid rgba(27,111,232,0.3)' }}>
      {initials}
    </div>
  );
}

function PostDeepDiveRow({ row, rank, total }: { row: CampaignPost; rank: number; total: number }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round(((total - rank) / Math.max(total - 1, 1)) * 100);
  const statusColor = { 'Outperformed': C.green, 'On pace': C.green, 'Underperformed': C.amber, 'Limited baseline': C.red }[row.status];

  const voice = useMemo(() => {
    if (!row.post.caption || row.athlete.baselinePosts.length === 0) return null;
    const baseline = buildProfile(row.athlete.baselinePosts.map((p) => p.caption ?? ''));
    const campaign = analyzeCaption(row.post.caption);
    const cmp      = compareToProfile(campaign, baseline);
    const note     = voiceNote(row.athlete.name, campaign, baseline, cmp);
    return { baseline, campaign, cmp, note };
  }, [row.post.caption, row.athlete.name, row.athlete.baselinePosts]);
  const fmtOrNA = (v: number | null) => v === null ? 'N/A' : fmtInt(v);
  const metrics = [
    { label: 'Eng. Rate', actual: fmtPct(row.actual.er),     baseline: fmtPct(row.baseline.er),     delta: row.deltas.er },
    { label: 'Likes',     actual: fmtInt(row.actual.likes),  baseline: fmtInt(row.baseline.likes),  delta: row.deltas.likes },
    { label: 'Comments',  actual: fmtOrNA(row.actual.comments), baseline: fmtInt(row.baseline.comments), delta: row.deltas.comments },
    { label: 'Views',     actual: fmtOrNA(row.actual.views),    baseline: fmtInt(row.baseline.views),    delta: row.deltas.views },
  ];
  return (
    <div className={`pdr ${open ? 'pdr-open' : ''}`}>
      <div className="pdr-main" onClick={() => setOpen(!open)}>
        <span className="pdr-rank">{rank}</span>
        <AthleteAvatar name={row.athlete.name} image={row.athlete.image} size={44} />
        <div className="pdr-id">
          <span className="pdr-brand">{row.brandDisplay}</span>
          <span className="pdr-athlete">{row.athlete.name}</span>
          <span className="pdr-date">{fmtDate(row.post)}</span>
        </div>
        <div className="pdr-metrics">
          {metrics.map((m) => (
            <div key={m.label} className="pdr-m">
              <span className="pdr-ml">{m.label}</span>
              <span className="pdr-mv">{m.actual}</span>
              <span className={`pdr-md ${(m.delta ?? 0) >= 0 ? 'dpos' : 'dneg'}`}>{fmtDelta(m.delta)}</span>
            </div>
          ))}
        </div>
        <div className="pdr-pct-col">
          <div className="pdr-pct-track"><div className="pdr-pct-fill" style={{ width: `${pct}%`, background: statusColor }} /></div>
          <span className="pdr-pct-label" style={{ color: statusColor }}>{pct}{(() => { const v = pct % 100; const r = pct % 10; if (v >= 11 && v <= 13) return 'th'; if (r === 1) return 'st'; if (r === 2) return 'nd'; if (r === 3) return 'rd'; return 'th'; })()} pct.</span>
        </div>
        <div className="pdr-status" style={{ color: statusColor, background: statusColor + '26', borderColor: statusColor + '4D' }}>
          {row.status}
        </div>
        <span className="pdr-chevron">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </div>
      {open && (
        <div className="pdr-expanded">
          <div className="pdr-exp-grid">
            <div className="pdr-exp-col">
              <div className="pdr-exp-label">Baseline avg. ({row.baseline.posts} organic posts) vs. this post</div>
              <div className="pdr-exp-grid-table">
                <div className="pdr-exp-gh"></div>
                <div className="pdr-exp-gh pdr-exp-gh-base">Organic baseline</div>
                <div className="pdr-exp-gh pdr-exp-gh-campaign">This campaign post</div>
                <div className="pdr-exp-gh">Delta</div>
                {metrics.map((m) => (
                  <div key={m.label} className="pdr-exp-grid-row" style={{ display: 'contents' }}>
                    <span className="pdr-exp-rlabel">{m.label}</span>
                    <span className="pdr-exp-base">{m.baseline}</span>
                    <span className="pdr-exp-actual" style={{ color: (m.delta ?? 0) >= 0 ? C.green : C.amber }}>{m.actual}</span>
                    <span className={`pdr-exp-delta ${(m.delta ?? 0) >= 0 ? 'dpos' : 'dneg'}`}>{fmtDelta(m.delta)}</span>
                  </div>
                ))}
              </div>
            </div>
            {row.post.caption && (
              <div className="pdr-exp-col">
                <div className="pdr-exp-label">Caption</div>
                <p className="pdr-caption">"{row.post.caption.slice(0, 320)}{row.post.caption.length > 320 ? '...' : ''}"</p>
                {voice && (
                  <div className="voice-fit">
                    <div className="voice-fit-head">
                      <span className="voice-fit-eyebrow">Creator Studio · Voice Fit</span>
                      <span className={`voice-fit-chip voice-fit-${voice.cmp.verdict}`}>
                        {voice.cmp.verdict === 'matches' ? 'On voice' : voice.cmp.verdict === 'borderline' ? 'Borderline' : 'Off voice'}
                      </span>
                    </div>
                    <p className="voice-fit-note">{voice.note}</p>
                    <div className="voice-fit-stats">
                      <div><span className="vfs-l">Length</span><span className="vfs-v">{voice.campaign.wordCount}w</span><span className="vfs-b">typical {voice.baseline.avg.wordCount}w</span></div>
                      <div><span className="vfs-l">Emojis</span><span className="vfs-v">{voice.campaign.emojiCount}</span><span className="vfs-b">typical {voice.baseline.avg.emojiCount}</span></div>
                      <div><span className="vfs-l">Hashtags</span><span className="vfs-v">{voice.campaign.hashtagCount}</span><span className="vfs-b">typical {voice.baseline.avg.hashtagCount}</span></div>
                      <div><span className="vfs-l">@Mentions</span><span className="vfs-v">{voice.campaign.mentionCount}</span><span className="vfs-b">typical {voice.baseline.avg.mentionCount}</span></div>
                      <div>
                        <span className="vfs-l">Language</span>
                        <span className="vfs-v">{voice.campaign.language === 'mixed' ? 'bilingual' : voice.campaign.language}</span>
                        <span className="vfs-b">typical {voice.baseline.dominantLanguage === 'mixed' ? 'bilingual' : voice.baseline.dominantLanguage}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Brand Peer Comparison ────────────────────────────────────────────────────

type PeerPost = {
  id: string | null;
  athlete: { id: string | null; name: string; image: string; sport: string; school: string } | null;
  brand: string;
  date: string;
  permalink: string;
  mediaType: string;
  caption: string;
  metrics: { likes: number; comments: number; views: number; er: number; emv: number; followers: number };
  source: string;
};

type PeerBrandPayload = {
  display: string;
  domain: string;
  summary: { postCount: number; athleteCount: number; medianER: number; medianLikes: number; medianViews: number };
  posts: PeerPost[];
};

const PEER_DATA = brandPeersData as { brands: Record<string, PeerBrandPayload> };

const ordinalSuffix = (n: number) => {
  const v = n % 100; const r = n % 10;
  if (v >= 11 && v <= 13) return 'th';
  if (r === 1) return 'st';
  if (r === 2) return 'nd';
  if (r === 3) return 'rd';
  return 'th';
};

function PeerCard({ rows }: { rows: CampaignPost[] }) {
  // All rows in a group share brand + athlete, so we can read those off row[0].
  const first    = rows[0];
  const meta     = BRANDS[first.brand];
  const peer     = PEER_DATA.brands[first.brand];
  const peerPosts= peer?.posts ?? [];
  const peerER   = peer?.summary.medianER ?? 0;
  const peerERs  = peerPosts.map((p) => p.metrics.er).filter((x) => x > 0).sort((a, b) => a - b);

  const rankFor = (er: number) =>
    peerERs.length >= 3 && er > 0
      ? Math.round((peerERs.filter((x) => x < er).length / peerERs.length) * 100)
      : null;

  const topPeers = [...peerPosts]
    .filter((p) => p.metrics.er > 0)
    .sort((a, b) => b.metrics.er - a.metrics.er)
    .slice(0, 3);

  const sortedRows = [...rows].sort((a, b) => b.actual.er - a.actual.er);

  return (
    <div className="peer-card">
      <div className="peer-head">
        {meta && <img src={meta.logo} alt={meta.display} className="peer-logo" />}
        <div className="peer-head-text">
          <div className="peer-title">{first.brandDisplay} · {first.athlete.name}</div>
          <div className="peer-meta">
            {rows.length} Genesco post{rows.length === 1 ? '' : 's'} · {peer?.summary.postCount ?? 0} peer posts from {peer?.summary.athleteCount ?? 0} athletes · peer median ER {(peerER * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="peer-posts-stack">
        {sortedRows.map((row) => {
          const er    = row.actual.er;
          const above = er > peerER;
          const delta = peerER > 0 ? (er - peerER) / peerER : 0;
          const pct   = rankFor(er);
          return (
            <a
              key={row.post._id}
              href={row.post.permalink || row.post.url || '#'}
              target="_blank"
              rel="noreferrer"
              className="peer-post-entry"
            >
              <div className="peer-cpost-head">
                <AthleteAvatar name={row.athlete.name} image={row.athlete.image} size={28} />
                <div className="peer-cpost-meta">
                  <div className="peer-cpost-sub">{fmtDate(row.post)} · {row.post.mediaType || 'post'}</div>
                </div>
                <div className="peer-cpost-er">
                  <span className="peer-cpost-er-v">{(er * 100).toFixed(2)}%</span>
                  <span className="peer-cpost-er-l">post ER</span>
                </div>
              </div>
              <div className="peer-cpost-bar-wrap">
                <div className="peer-cpost-track">
                  <div className="peer-cpost-median" />
                  <div
                    className="peer-cpost-marker"
                    style={{ left: `${pct ?? 50}%`, background: pct === null ? C.text3 : (above ? C.green : C.amber) }}
                    title={pct !== null ? `${pct}${ordinalSuffix(pct)} percentile` : 'Not enough peer data'}
                  />
                </div>
                <div className="peer-cpost-bar-foot">
                  <span>peer min</span>
                  <span className="peer-cpost-pct" style={{ color: pct !== null ? (above ? C.green : C.amber) : C.text3 }}>
                    {pct !== null
                      ? `${pct}${ordinalSuffix(pct)} pct. · ${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(0)}% vs peer median`
                      : 'Not enough peer data'}
                  </span>
                  <span>peer max</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {topPeers.length > 0 && (
        <div className="peer-top">
          <div className="peer-top-label">Top peer posts for this brand</div>
          {topPeers.map((p, i) => (
            <div key={p.id ?? i} className="peer-row">
              <span className="peer-row-n">{i + 1}</span>
              <AthleteAvatar name={p.athlete?.name || '-'} image={p.athlete?.image} size={24} />
              <div className="peer-row-meta">
                <div className="peer-row-name">{p.athlete?.name || 'Unknown'}</div>
                <div className="peer-row-sub">{p.date || '-'}</div>
              </div>
              <div className="peer-row-metrics">
                <span className="peer-row-er">{(p.metrics.er * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BubbleMatrix({ athletes }: { athletes: AthleteRow[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; athlete: AthleteRow } | null>(null);
  const [dims, setDims] = useState({ w: 900, h: 480 });
  const containerRef = useRef<HTMLDivElement>(null);
  // Cache loaded headshot images so we don't reload on every redraw
  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const benchmarks = (benchmarkData as { benchmarks: { label: string; followers: number; signal: number }[] }).benchmarks
    .sort((a, b) => a.followers - b.followers);

  const validAthletes = athletes.filter((a) => a.baseline.posts >= 3 && a.followers > 0);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setDims({ w: e.contentRect.width, h: Math.max(400, e.contentRect.width * 0.50) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Preload headshot images and trigger redraw when ready
  useEffect(() => {
    let pending = 0;
    validAthletes.forEach((a) => {
      const src = AVATAR_OVERRIDE[a.name] ?? a.image;
      if (!src) return;
      if (imgCacheRef.current.has(src)) return;
      pending++;
      const img = new Image();
      img.onload = () => {
        imgCacheRef.current.set(src, img);
        pending--;
        if (pending === 0) {
          const canvas = canvasRef.current;
          if (canvas) canvas.dispatchEvent(new Event('redraw'));
        }
      };
      img.onerror = () => { pending--; };
      img.src = src;
    });
  }, [validAthletes]);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = dims;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const pad = { t: 32, r: 48, b: 56, l: 72 };
    const pw = w - pad.l - pad.r;
    const ph = h - pad.t - pad.b;

    // ── Axis range: tight around the actual athletes ──
    // X: from 500K to 700M (covers Chase 1.5M, Kelce 7.8M, Messi 511M)
    const X_MIN = 500_000;
    const X_MAX = 700_000_000;
    // Y: from 50 to 200K (covers Chase ~26, Kelce ~2.4K, Messi ~6.3K)
    const allComments = validAthletes.map((a) => a.baseline.comments).filter((v) => v > 0);
    const allLikes = validAthletes.map((a) => a.baseline.likes).filter((v) => v > 0);
    const Y_MIN = 10;
    const Y_MAX = Math.max(...allComments, 1) * 4;
    const maxLikes = Math.max(...allLikes, 1);

    const xScale = (v: number) =>
      pad.l + ((Math.log10(Math.max(v, X_MIN)) - Math.log10(X_MIN)) / (Math.log10(X_MAX) - Math.log10(X_MIN))) * pw;
    const yScale = (v: number) =>
      pad.t + ph - ((Math.log10(Math.max(v, Y_MIN)) - Math.log10(Y_MIN)) / (Math.log10(Y_MAX) - Math.log10(Y_MIN))) * ph;
    const rScale = (v: number) => 28 + (Math.log1p(v) / Math.log1p(maxLikes)) * 22;

    // Background
    ctx.fillStyle = C.bgDeep;
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    [1_000_000, 10_000_000, 100_000_000].forEach((v) => {
      const x = xScale(v);
      if (x > pad.l && x < pad.l + pw) {
        ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, pad.t + ph); ctx.stroke();
      }
    });
    [100, 1_000, 10_000, 100_000].forEach((v) => {
      const y = yScale(v);
      if (y > pad.t && y < pad.t + ph) {
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + pw, y); ctx.stroke();
      }
    });

    // Tier zone bands
    const tierBands = [
      { label: 'Mega', min: 10_000_000, max: X_MAX, color: 'rgba(168,85,247,0.10)', textColor: 'rgba(168,85,247,0.55)' },
      { label: 'Large', min: 1_000_000, max: 10_000_000, color: 'rgba(27,111,232,0.10)', textColor: 'rgba(91,155,255,0.55)' },
    ];
    tierBands.forEach((band) => {
      const x1 = Math.max(xScale(band.min), pad.l);
      const x2 = Math.min(xScale(band.max), pad.l + pw);
      if (x2 > x1) {
        ctx.fillStyle = band.color;
        ctx.fillRect(x1, pad.t, x2 - x1, ph);
        // Tier label at top of band
        ctx.fillStyle = band.textColor;
        ctx.font = '600 10px DM Sans, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(band.label, (x1 + x2) / 2, pad.t + 14);
      }
    });

    // (No baseline curve — the overperform / underperform verdict already
    // lives in each bubble's ring color and the "Performs like" label, so a
    // derived curve was adding confusion without new information.)

    // ── Draw bubbles with headshot fill ──
    validAthletes.forEach((a) => {
      const x = xScale(a.followers);
      const y = yScale(a.baseline.comments);
      const r = rScale(a.baseline.likes);
      const isAbove = a.performsLike !== null && a.performsLike.liftMultiple > 1;
      const color = isAbove ? C.green : C.amber;
      const imgSrc = AVATAR_OVERRIDE[a.name] ?? a.image;
      const img = imgSrc ? imgCacheRef.current.get(imgSrc) : undefined;

      // Outer glow
      const grd = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 1.8);
      grd.addColorStop(0, color + '28');
      grd.addColorStop(1, color + '00');
      ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      // Clip to circle and draw headshot with aspect-ratio preservation —
      // source images are landscape (e.g. 600x436), so we crop a centred
      // square from the source rather than letting drawImage stretch them.
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      if (img && img.complete && img.naturalWidth > 0) {
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const srcSide = Math.min(iw, ih);
        const sx = (iw - srcSide) / 2;
        const sy = (ih - srcSide) / 2;
        const dSide = r * 2;
        ctx.drawImage(img, sx, sy, srcSide, srcSide, x - r, y - r, dSide, dSide);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(x - r, y - r, dSide, dSide);
      } else {
        ctx.fillStyle = color + '30';
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.restore();

      // Ring border
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    });

    // ── Name + Performs Like labels ──
    // Cap "Performs like" at 2B — roughly Instagram's total user base. Anything
    // beyond is mathematically extrapolated off the benchmark and reads as
    // comical (Messi at ~20B). We cap and append "+" so the reader knows the
    // athlete is off-chart rather than literally targeting 20B followers.
    const PERFORMS_LIKE_CEILING = 2_000_000_000;
    const fmtFollowers = (n: number) => {
      const capped  = Math.min(n, PERFORMS_LIKE_CEILING);
      const suffix  = n > PERFORMS_LIKE_CEILING ? '+' : '';
      if (capped >= 1e9) return `${(capped / 1e9).toFixed(1)}B${suffix}`;
      if (capped >= 1e6) return `${(capped / 1e6).toFixed(1)}M${suffix}`;
      if (capped >= 1e3) return `${Math.round(capped / 1e3)}K${suffix}`;
      return String(Math.round(capped)) + suffix;
    };
    validAthletes.forEach((a) => {
      const x = xScale(a.followers);
      const y = yScale(a.baseline.comments);
      const r = rScale(a.baseline.likes);
      const isAbove = a.performsLike !== null && a.performsLike.liftMultiple > 1;
      const color = isAbove ? C.green : C.amber;
      const lastName = a.name.split(' ').slice(-1)[0];
      const pl = a.performsLike
        ? `Performs like ${fmtFollowers(a.performsLike.performsLikeFollowers)}`
        : null;

      ctx.font = `700 12px DM Sans, Inter, sans-serif`;
      const nameW = ctx.measureText(lastName).width;
      ctx.font = `500 10px DM Sans, Inter, sans-serif`;
      const plW = pl ? ctx.measureText(pl).width : 0;

      // Pick side: default right, flip to left if we'd clip the right edge.
      const rightEdge    = pad.l + pw;
      const maxLabelW    = Math.max(nameW + 10, plW + 10);
      const flip         = (x + r + 8 + maxLabelW) > rightEdge - 4;
      const lx           = flip ? x - r - 8 - maxLabelW : x + r + 8;
      const ly           = y + 4;
      const align: CanvasTextAlign = 'left';
      const nameX        = lx;
      const plX          = lx;

      // Name pill
      ctx.font = `700 12px DM Sans, Inter, sans-serif`;
      ctx.fillStyle = 'rgba(8,15,28,0.88)';
      ctx.beginPath();
      (ctx as CanvasRenderingContext2D & { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void })
        .roundRect(lx - 4, ly - 13, nameW + 10, 18, 5);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.fillText(lastName, nameX, ly);

      // Performs-like follower equivalent underneath
      if (pl) {
        ctx.font = `500 10px DM Sans, Inter, sans-serif`;
        ctx.fillStyle = 'rgba(8,15,28,0.75)';
        ctx.beginPath();
        (ctx as CanvasRenderingContext2D & { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void })
          .roundRect(lx - 4, ly + 5, plW + 10, 15, 4);
        ctx.fill();
        ctx.fillStyle = C.text2;
        ctx.fillText(pl, plX, ly + 16);
      }
    });

    // ── Axes ──
    ctx.strokeStyle = C.borderMed;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t + ph); ctx.lineTo(pad.l + pw, pad.t + ph); ctx.stroke();

    // Axis labels
    ctx.fillStyle = C.text3;
    ctx.font = '11px DM Sans, Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Followers', pad.l + pw / 2, h - 8);
    ctx.save();
    ctx.translate(14, pad.t + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Avg. Organic Comments', 0, 0);
    ctx.restore();

    // X tick labels
    ctx.fillStyle = C.text3;
    ctx.font = '11px DM Sans, Inter, sans-serif';
    ctx.textAlign = 'center';
    [1_000_000, 10_000_000, 100_000_000, 500_000_000].forEach((v) => {
      const x = xScale(v);
      if (x > pad.l + 10 && x < pad.l + pw - 10) {
        ctx.fillText(fmtInt(v), x, pad.t + ph + 16);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, pad.t + ph); ctx.lineTo(x, pad.t + ph + 4); ctx.stroke();
      }
    });
    // Y tick labels
    ctx.textAlign = 'right';
    [100, 1_000, 10_000].forEach((v) => {
      const y = yScale(v);
      if (y > pad.t + 10 && y < pad.t + ph - 10) {
        ctx.fillStyle = C.text3;
        ctx.fillText(fmtInt(v), pad.l - 8, y + 4);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l - 4, y); ctx.stroke();
      }
    });
  }, [dims, validAthletes, benchmarks]);

  useEffect(() => {
    drawChart();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = () => drawChart();
    canvas.addEventListener('redraw', handler);
    return () => canvas.removeEventListener('redraw', handler);
  }, [drawChart]);

  const getScales = () => {
    const { w, h } = dims;
    const pad = { t: 32, r: 48, b: 56, l: 72 };
    const pw = w - pad.l - pad.r; const ph = h - pad.t - pad.b;
    const X_MIN = 500_000; const X_MAX = 700_000_000;
    const allComments = validAthletes.map((a) => a.baseline.comments).filter((v) => v > 0);
    const allLikes = validAthletes.map((a) => a.baseline.likes).filter((v) => v > 0);
    const Y_MAX = Math.max(...allComments, 1) * 4;
    const maxLikes = Math.max(...allLikes, 1);
    const xScale = (v: number) =>
      pad.l + ((Math.log10(Math.max(v, X_MIN)) - Math.log10(X_MIN)) / (Math.log10(X_MAX) - Math.log10(X_MIN))) * pw;
    const yScale = (v: number) =>
      pad.t + ph - ((Math.log10(Math.max(v, 10)) - Math.log10(10)) / (Math.log10(Y_MAX) - Math.log10(10))) * ph;
    const rScale = (v: number) => 28 + (Math.log1p(v) / Math.log1p(maxLikes)) * 22;
    return { xScale, yScale, rScale };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = rect.width / dims.w;
    const mx = (e.clientX - rect.left) / scaleX;
    const my = (e.clientY - rect.top) / scaleX;
    const { xScale, yScale, rScale } = getScales();
    const hit = validAthletes.find((a) => {
      const dx = mx - xScale(a.followers); const dy = my - yScale(a.baseline.comments);
      return Math.sqrt(dx * dx + dy * dy) <= rScale(a.baseline.likes) + 8;
    });
    setTooltip(hit ? { x: e.clientX - rect.left, y: e.clientY - rect.top, athlete: hit } : null);
  };

  return (
    <div ref={containerRef} className="bubble-wrap">
      <canvas ref={canvasRef} className="bubble-canvas" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)} />
      {tooltip && (
        <div className="bubble-tooltip" style={{ left: Math.min(tooltip.x + 16, dims.w - 230), top: Math.max(tooltip.y - 80, 8) }}>
          <div className="bt-name">{tooltip.athlete.name}</div>
          <div className="bt-tier"><TierBadge tier={tooltip.athlete.tier} /></div>
          <div className="bt-row"><span>Followers</span><strong>{fmtInt(tooltip.athlete.followers)}</strong></div>
          <div className="bt-row"><span>Avg. comments</span><strong>{fmtInt(tooltip.athlete.baseline.comments)}</strong></div>
          <div className="bt-row"><span>Avg. likes</span><strong>{fmtInt(tooltip.athlete.baseline.likes)}</strong></div>
          <div className="bt-row"><span>Organic ER</span><strong>{fmtPctShort(tooltip.athlete.baseline.er)}</strong></div>
          {tooltip.athlete.performsLike && (
            <div className="bt-row bt-performs">
              <span>Performs like</span>
              <strong style={{ color: tooltip.athlete.performsLike.liftMultiple > 1 ? C.green : C.amber }}>
                {fmtInt(tooltip.athlete.performsLike.performsLikeFollowers)} followers
              </strong>
            </div>
          )}
        </div>
      )}
      <div className="bubble-legend">
        <span className="bl-item"><i style={{ background: C.green + '50', border: `1.5px solid ${C.green}` }} />Punches above weight</span>
        <span className="bl-item"><i style={{ background: C.amber + '50', border: `1.5px solid ${C.amber}` }} />Below expected</span>
        <span className="bl-item bl-size">Bubble size = avg. organic likes</span>
      </div>
    </div>
  );
}

function TierComparisonTable({ athletes, campaignPosts }: { athletes: AthleteRow[]; campaignPosts: CampaignPost[] }) {
  const tierOrder: TierName[] = ['Mega', 'Large', 'Mid', 'Emerging', 'Micro'];
  const byTier = tierOrder.map((tier) => ({
    tier, rows: athletes.filter((a) => a.tier === tier && a.baseline.posts > 0),
  })).filter((g) => g.rows.length > 0);

  return (
    <div className="tier-wrap">
      {byTier.map(({ tier, rows }) => {
        const tierMedian = rows[0]?.tierMedianER ?? 0;
        const benchmark = tierMediansData.tiers[tier as keyof typeof tierMediansData.tiers];
        return (
          <div key={tier} className="tier-group">
            <div className="tier-group-header">
              <TierBadge tier={tier} />
              <span className="tgh-median">Tier median ER: {fmtPctShort(tierMedian)}</span>
              {benchmark && (
                <span
                  className="tgh-bench"
                  title={`Tier benchmark calculated from ${fmtInt(benchmark.athleteCount)} ${tier}-tier athletes in the JABA universe`}
                >
                  benchmark: {fmtInt(benchmark.athleteCount)} {tier} athletes
                </span>
              )}
              <span className="tgh-count">{rows.length} in roster</span>
            </div>
            <div className="tier-col-head">
              <span>Athlete</span>
              <span>Organic ER vs tier median</span>
              <span>Posts analyzed</span>
              <span>Sponsored lift vs own baseline</span>
              <span>Organic tier verdict</span>
            </div>
            <div className="tier-rows">
              {rows.sort((a, b) => b.baseline.er - a.baseline.er).map((a) => {
                const erRatio = tierMedian > 0 ? a.baseline.er / tierMedian : 1;
                const isAbove = erRatio >= 1.15;
                const isBelow = erRatio <= 0.85;
                const barColor = isAbove ? C.green : isBelow ? C.amber : C.slate;
                const maxER = Math.max(...rows.map((r) => r.baseline.er), tierMedian * 2, 0.001);
                const barW = Math.min(100, (a.baseline.er / maxER) * 100);
                const medianW = Math.min(100, (tierMedian / maxER) * 100);
                const aCamp = campaignPosts.filter((r) => r.athlete.name === a.name);
                const campaignLift = a.campaignIndex !== null ? a.campaignIndex - 1 : null;
                return (
                  <div key={a.name} className="tier-row">
                    <div className="tr-athlete">
                      <AthleteAvatar name={a.name} image={a.image} size={36} />
                      <div>
                        <span className="tr-name">{a.name}</span>
                        <span className="tr-meta">{fmtInt(a.followers)} followers</span>
                      </div>
                    </div>
                    <div className="tr-er-col">
                      <div className="tr-er-bar-stack">
                        <div className="tr-er-bar-wrap">
                          <div className="tr-er-bar" style={{ width: `${barW}%`, background: barColor + '55', borderColor: barColor + 'AA' }} />
                          <div className="tr-median-line" style={{ left: `${medianW}%` }} />
                          <span className="tr-median-label" style={{ left: `${medianW}%` }}>tier median {fmtPctShort(tierMedian)}</span>
                        </div>
                        <div className="tr-er-scale">
                          <span>0%</span>
                          <span className="tr-er-scale-max">max {fmtPctShort(maxER)}</span>
                        </div>
                      </div>
                      <span className="tr-er-val" style={{ color: barColor }}>{fmtPctShort(a.baseline.er)}</span>
                    </div>
                    <div className="tr-posts">{a.baseline.posts} posts</div>
                    <div className="tr-camp">
                      {aCamp.length > 0 ? (
                        <span className={`tr-camp-lift ${(campaignLift ?? 0) >= 0.15 ? 'dpos' : (campaignLift ?? 0) <= -0.15 ? 'dneg' : ''}`}>
                          {fmtDelta(campaignLift)} on campaign
                        </span>
                      ) : <span className="tr-no-camp">No campaign posts</span>}
                    </div>
                    <div className="tr-flag">
                      <span className={`tr-flag-chip ${isAbove ? 'tfc-pos' : isBelow ? 'tfc-neg' : 'tfc-neu'}`}>
                        {isAbove ? '↑ Outperforms tier' : isBelow ? '↓ Below tier' : '→ At tier median'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TierBadge({ tier }: { tier: TierName }) {
  const colors: Record<TierName, string> = {
    'Mega': C.purple, 'Large': C.blue, 'Mid': C.green, 'Emerging': C.amber, 'Micro': C.slate, 'No audience': C.text3,
  };
  const c = colors[tier];
  return <span className="tier-badge" style={{ color: c, borderColor: c + '55', background: c + '18' }}>{tier}</span>;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{background:${C.bg};}
.gse{
  min-height:100vh;background:${C.bg};color:${C.text};
  font-family:"DM Sans","Inter",-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  font-size:14px;line-height:1.5;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
  font-feature-settings:"cv11","ss01","tnum";
}

/* ── Nav ── */
.nav{position:sticky;top:0;z-index:50;background:rgba(10,10,10,0.85);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid rgb(42,42,42);}
.nav-inner{display:flex;align-items:center;justify-content:space-between;gap:24px;max-width:1440px;margin:0 auto;padding:0 clamp(20px,4vw,60px);height:54px;}
.nav-brand-wrap{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.nav-logo{height:22px;width:auto;opacity:0.9;}
.nav-brand-label{font-size:11px;font-weight:600;color:${C.text3};letter-spacing:0.06em;text-transform:uppercase;white-space:nowrap;}
.nav-links{display:flex;gap:0;}
.nl{padding:5px 0;margin:0 12px;font-size:13px;font-weight:500;color:${C.text3};text-decoration:none;transition:color 0.15s,border-color 0.15s;white-space:nowrap;border-bottom:2px solid transparent;}
.nl:hover{color:${C.text};}
.nl-a{color:${C.chartreuse}!important;border-bottom-color:${C.chartreuse}!important;}

/* ── Body ── */
.body{max-width:1440px;margin:0 auto;padding:0 clamp(20px,4vw,60px);}

/* ── Sections ── */
.section{margin:32px 0 0;padding:28px 28px 32px;scroll-margin-top:66px;border:1px solid ${C.border};border-radius:16px;background:transparent;}
.section:first-of-type{margin-top:28px;}
.hero-section{margin-top:28px;padding-top:36px;}
.sh{margin-bottom:32px;max-width:860px;}
.sh-eye{display:block;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:0.09em;text-transform:uppercase;margin-bottom:7px;font-style:normal;}
.sh-title{font-size:clamp(22px,2.4vw,30px);font-weight:800;color:${C.text};letter-spacing:-0.03em;line-height:1.1;font-style:normal;}
.sh-sub{margin-top:10px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;max-width:640px;font-style:normal;}

/* ── Hero ── */
.hero-brand{display:flex;align-items:center;gap:20px;margin-bottom:32px;}
.hero-logo{height:38px;width:auto;}
.hero-sep{width:1px;height:34px;background:${C.borderMed};}
.hero-title{font-size:24px;font-weight:800;color:${C.text};letter-spacing:-0.03em;line-height:1.15;}
.hero-sub{font-size:12px;color:${C.text3};margin-top:4px;letter-spacing:0.02em;}
.hero-meta{font-size:12px;color:${C.text3};margin-top:20px;padding-top:20px;border-top:1px solid ${C.border};}
.hero-kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;}
.hero-kpi{display:flex;flex-direction:column;gap:4px;padding:16px 18px;background:${C.bgCard};border:1px solid ${C.border};border-radius:12px;}
.hero-kpi-v{font-size:clamp(20px,2vw,26px);font-weight:800;color:${C.text};letter-spacing:-0.03em;font-feature-settings:"tnum";line-height:1.1;}
.hero-kpi-l{font-size:10px;font-weight:600;color:${C.text3};letter-spacing:0.05em;text-transform:uppercase;}

/* ── KPI row ── */
.kpi-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;}
.kpi{display:flex;flex-direction:column;gap:4px;padding:16px 22px;background:${C.bgCard};border:1px solid ${C.border};border-radius:12px;min-width:140px;flex:1;}
.kpi-a{background:${C.blueDim};border-color:${C.blueBorder};}
.kpi-v{font-size:clamp(22px,2.2vw,28px);font-weight:800;color:${C.text};letter-spacing:-0.03em;font-feature-settings:"tnum";}
.kpi-l{font-size:11px;font-weight:600;color:${C.text3};letter-spacing:0.05em;text-transform:uppercase;}

/* ── Summary grid ── */
.summary-grid{display:grid;grid-template-columns:1fr 1.6fr;gap:12px;margin-bottom:0;align-items:stretch;}
.summary-left-col{display:flex;flex-direction:column;gap:12px;}
.summary-card{background:${C.bgCard};border:1px solid ${C.border};border-radius:16px;padding:18px 20px;}
.summary-card-brands{overflow:hidden;}
.sc-eyebrow{display:block;font-size:10px;font-weight:700;color:${C.text3};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;}

/* ── Donut ── */
.perf-donut-wrap{display:flex;align-items:center;gap:16px;}
.donut-svg{width:80px;height:80px;flex-shrink:0;}
.perf-legend{display:flex;flex-direction:column;gap:8px;flex:1;}
.pl-item{display:flex;align-items:center;gap:8px;font-size:12px;}
.pl-item i{width:8px;height:8px;border-radius:2px;flex-shrink:0;}
.pl-n{font-weight:800;font-size:15px;min-width:20px;font-feature-settings:"tnum";}
.pl-label{color:${C.text2};}

/* ── Brand mini list ── */
.brand-mini-list{display:flex;flex-direction:column;gap:8px;}
.bml-row{display:flex;align-items:center;gap:12px;}
.bml-logo{width:34px;height:34px;border-radius:8px;background:#fff;display:grid;place-items:center;flex-shrink:0;overflow:hidden;border:1px solid rgba(255,255,255,0.07);}
.bml-logo img{width:100%;height:100%;object-fit:contain;padding:4px;}
.logo-initials{font-size:11px;font-weight:700;color:#333;}
.bml-info{flex:1;min-width:0;}
.bml-name{display:block;font-size:13px;font-weight:700;color:${C.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bml-sub{display:block;font-size:11px;color:${C.text3};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px;}
.bml-right{text-align:right;flex-shrink:0;}
.bml-status{display:block;font-size:11px;font-weight:600;margin-top:2px;}

/* ── Takeaways ── */
.takeaways{display:flex;flex-direction:column;gap:10px;}
.takeaway{display:flex;align-items:flex-start;gap:11px;}
.tw-icon{display:grid;place-items:center;width:26px;height:26px;border-radius:7px;flex-shrink:0;margin-top:1px;}
.tw-text{font-size:12px;color:${C.text2};line-height:1.55;}

/* ── Post deep dive ── */
.post-table-wrap{display:flex;flex-direction:column;border:1px solid ${C.border};border-radius:16px;overflow:hidden;background:${C.bgCard};}
.pdr{border-top:1px solid ${C.border};}
.pdr:first-child{border-top:0;}
.pdr-main{display:grid;grid-template-columns:20px 44px 200px 1fr 130px 150px 28px;gap:16px;align-items:center;padding:14px 20px;cursor:pointer;transition:background 0.12s;}
.pdr-rank{font-size:13px;font-weight:700;color:${C.text3};text-align:center;font-feature-settings:"tnum";}
.pdr-main:hover{background:rgba(255,255,255,0.025);}
.pdr-id{min-width:0;}
.pdr-brand{display:block;font-size:13px;font-weight:700;color:${C.text};letter-spacing:-0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pdr-athlete{display:block;font-size:12px;color:${C.text2};margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pdr-date{display:block;font-size:11px;color:${C.text3};margin-top:2px;}
.pdr-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:4px 10px;}
.pdr-m{display:flex;flex-direction:column;gap:1px;}
.pdr-ml{font-size:9px;font-weight:700;color:${C.text3};text-transform:uppercase;letter-spacing:0.05em;}
.pdr-mv{font-size:13px;font-weight:700;color:${C.text};font-feature-settings:"tnum";}
.pdr-md{font-size:11px;font-weight:700;font-feature-settings:"tnum";}
.pdr-pct-col{display:flex;flex-direction:column;gap:6px;}
.pdr-pct-track{height:4px;background:rgba(255,255,255,0.07);border-radius:999px;overflow:hidden;}
.pdr-pct-fill{height:100%;border-radius:999px;}
.pdr-pct-label{font-size:11px;font-weight:700;font-feature-settings:"tnum";}
.pdr-status{display:inline-flex;align-items:center;padding:4px 11px;border-radius:999px;border:1px solid;font-size:11px;font-weight:700;white-space:nowrap;}
.pdr-chevron{display:grid;place-items:center;color:${C.text3};}
.pdr-expanded{padding:18px 20px 20px;border-top:1px solid ${C.border};background:rgba(255,255,255,0.015);}
.pdr-exp-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;}
.pdr-exp-label{font-size:10px;font-weight:700;color:${C.text3};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;}
.pdr-exp-vals{display:flex;flex-direction:column;gap:8px;}
.pdr-exp-row{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:${C.text2};}
.pdr-exp-compare{display:flex;align-items:center;gap:8px;}
.pdr-exp-grid-table{display:grid;grid-template-columns:100px 1fr 1fr 90px;gap:0;border:1px solid ${C.border};border-radius:10px;overflow:hidden;font-size:13px;}
.pdr-exp-gh{padding:8px 12px;font-size:10px;font-weight:700;color:${C.text3};text-transform:uppercase;letter-spacing:0.05em;background:rgba(255,255,255,0.02);border-bottom:1px solid ${C.border};}
.pdr-exp-gh-base{color:${C.text2};}
.pdr-exp-gh-campaign{color:${C.text};background:rgba(255,255,255,0.05);}
.pdr-exp-grid-row > .pdr-exp-rlabel{padding:10px 12px;color:${C.text3};font-size:12px;border-top:1px solid ${C.border};}
.pdr-exp-grid-row > .pdr-exp-base{padding:10px 12px;color:${C.text2};font-weight:600;font-feature-settings:"tnum";border-top:1px solid ${C.border};}
.pdr-exp-grid-row > .pdr-exp-actual{padding:10px 12px;font-weight:700;font-feature-settings:"tnum";background:rgba(255,255,255,0.04);border-top:1px solid ${C.border};}
.pdr-exp-grid-row > .pdr-exp-delta{padding:10px 12px;font-weight:700;font-feature-settings:"tnum";text-align:right;border-top:1px solid ${C.border};}
.pdr-exp-grid-row:first-of-type > *{border-top:0;}
/* legacy (kept for any untouched consumers) */
.pdr-exp-base{font-weight:600;color:${C.text2};font-feature-settings:"tnum";}
.pdr-exp-arrow{color:${C.text3};font-size:11px;}
.pdr-exp-actual{font-weight:700;font-feature-settings:"tnum";}
.pdr-exp-delta{font-size:11px;font-weight:700;font-feature-settings:"tnum";}
.pdr-caption{font-size:13px;color:${C.text2};line-height:1.65;font-style:italic;}

/* ── Creator Studio · Voice Fit ── */
.voice-fit{margin-top:14px;padding:14px 16px;border:1px solid ${C.border};border-radius:10px;background:rgba(255,255,255,0.02);}
.voice-fit-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;}
.voice-fit-eyebrow{font-size:10px;font-weight:700;color:${C.text3};text-transform:uppercase;letter-spacing:0.08em;}
.voice-fit-chip{display:inline-flex;padding:3px 10px;border-radius:999px;border:1px solid;font-size:10px;font-weight:700;letter-spacing:0.02em;white-space:nowrap;}
.voice-fit-matches   {color:${C.green};background:${C.green}26;border-color:${C.green}4D;}
.voice-fit-borderline{color:${C.amber};background:${C.amber}26;border-color:${C.amber}4D;}
.voice-fit-off-voice {color:${C.red};  background:${C.red}26;  border-color:${C.red}4D;}
.voice-fit-note{font-size:13px;color:${C.text};line-height:1.55;font-style:normal;}
.voice-fit-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid ${C.border};}
.voice-fit-stats > div{display:flex;flex-direction:column;gap:2px;}
.vfs-l{font-size:9px;font-weight:700;color:${C.text3};text-transform:uppercase;letter-spacing:0.04em;}
.vfs-v{font-size:14px;font-weight:700;color:${C.text};font-feature-settings:"tnum";}
.vfs-b{font-size:10px;color:${C.text3};font-feature-settings:"tnum";}

/* ── Brand Peer Comparison ── */
.peer-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}
.peer-card{min-width:0;}
.peer-posts-stack{display:flex;flex-direction:column;gap:10px;}
.peer-post-entry{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border:1px solid ${C.border};border-radius:10px;background:rgba(255,255,255,0.02);text-decoration:none;color:inherit;transition:background 0.15s;}
.peer-post-entry:hover{background:rgba(255,255,255,0.05);}
.peer-post-entry + .peer-post-entry{margin-top:0;}
@media(max-width:760px){.peer-grid{grid-template-columns:1fr;}}
.peer-card{background:${C.bgCard};border:1px solid ${C.border};border-radius:16px;padding:20px 22px;display:flex;flex-direction:column;gap:14px;text-decoration:none;color:inherit;transition:border-color 0.15s,background 0.15s;}
.peer-card:hover{border-color:${C.borderMed};background:${C.bgCardHov};}
.peer-head{display:flex;align-items:center;gap:14px;padding-bottom:12px;border-bottom:1px solid ${C.border};}
.peer-logo{height:32px;width:auto;max-width:110px;object-fit:contain;background:rgba(255,255,255,0.96);padding:4px 8px;border-radius:6px;flex-shrink:0;}
.peer-head-text{flex:1;min-width:0;}
.peer-title{font-size:15px;font-weight:700;color:${C.text};letter-spacing:-0.01em;}
.peer-meta{font-size:11px;color:${C.text3};margin-top:3px;line-height:1.4;}
.peer-cpost-head{display:grid;grid-template-columns:32px 1fr auto;gap:12px;align-items:center;}
.peer-cpost-meta{min-width:0;}
.peer-cpost-name{font-size:12px;font-weight:600;color:${C.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.peer-cpost-sub{font-size:10px;color:${C.text3};margin-top:2px;}
.peer-cpost-er{display:flex;flex-direction:column;align-items:flex-end;}
.peer-cpost-er-v{font-size:14px;font-weight:800;color:${C.text};font-feature-settings:"tnum";letter-spacing:-0.02em;}
.peer-cpost-er-l{font-size:9px;font-weight:600;color:${C.text3};text-transform:uppercase;letter-spacing:0.05em;margin-top:1px;}
.peer-cpost-bar-wrap{display:flex;flex-direction:column;gap:4px;}
.peer-cpost-track{position:relative;height:8px;background:rgba(255,255,255,0.06);border-radius:999px;}
.peer-cpost-median{position:absolute;left:50%;top:-2px;bottom:-2px;width:1px;background:rgba(255,255,255,0.35);}
.peer-cpost-marker{position:absolute;top:-3px;width:14px;height:14px;border-radius:50%;border:2px solid ${C.bg};transform:translateX(-50%);box-shadow:0 0 0 1px rgba(0,0,0,0.4);}
.peer-cpost-bar-foot{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;font-size:9px;color:${C.text3};text-transform:uppercase;letter-spacing:0.04em;font-weight:600;}
.peer-cpost-pct{text-align:center;font-feature-settings:"tnum";text-transform:none;letter-spacing:0;font-size:10px;}
.peer-dot{color:${C.text3};opacity:0.6;}
.peer-pct{font-size:12px;color:${C.text2};font-weight:600;}
.peer-top{display:flex;flex-direction:column;gap:6px;}
.peer-top-label{font-size:10px;font-weight:700;color:${C.text3};letter-spacing:0.06em;text-transform:uppercase;margin-bottom:2px;}
.peer-row{display:grid;grid-template-columns:18px 28px 1fr auto;gap:10px;align-items:center;padding:7px 10px;background:rgba(255,255,255,0.02);border:1px solid ${C.border};border-radius:8px;text-decoration:none;transition:background 0.15s;}
.peer-row:hover{background:rgba(255,255,255,0.05);}
.peer-row-n{font-size:10px;color:${C.text3};font-weight:700;text-align:center;}
.peer-row-meta{min-width:0;}
.peer-row-name{font-size:12px;font-weight:600;color:${C.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.peer-row-sub{font-size:10px;color:${C.text3};}
.peer-row-metrics{display:flex;gap:10px;align-items:baseline;}
.peer-row-er{font-size:12px;font-weight:700;color:${C.green};font-feature-settings:"tnum";}
.peer-row-likes{font-size:11px;color:${C.text2};font-weight:600;font-feature-settings:"tnum";}
.peer-warn{display:flex;align-items:center;gap:6px;padding:7px 11px;background:${C.slateDim};border-radius:7px;font-size:11px;color:${C.text3};font-weight:600;}

/* ── Bubble ── */
.bubble-wrap{position:relative;width:100%;background:${C.bgDeep};border:1px solid ${C.border};border-radius:16px;overflow:hidden;padding:20px 20px 16px;}
.bubble-canvas{display:block;width:100%;cursor:crosshair;}
.bubble-tooltip{position:absolute;pointer-events:none;background:rgba(8,15,28,0.97);border:1px solid ${C.borderMed};border-radius:10px;padding:12px 14px;font-size:12px;display:flex;flex-direction:column;gap:5px;min-width:200px;z-index:10;box-shadow:0 8px 32px rgba(0,0,0,0.5);}
.bt-name{font-size:14px;font-weight:800;color:${C.text};margin-bottom:4px;}
.bt-tier{margin-bottom:4px;}
.bt-row{display:flex;justify-content:space-between;gap:16px;color:${C.text2};}
.bt-row strong{color:${C.text};font-feature-settings:"tnum";}
.bt-performs{border-top:1px solid ${C.border};padding-top:5px;margin-top:2px;}
.bubble-legend{display:flex;flex-wrap:wrap;gap:6px 20px;margin-top:14px;padding-top:14px;border-top:1px solid ${C.border};}
.bl-item{display:inline-flex;align-items:center;gap:8px;font-size:12px;color:${C.text2};}
.bl-item i{width:12px;height:12px;border-radius:50%;flex-shrink:0;}
.bl-size{color:${C.text3};}

/* ── Tier comparison ── */
.tier-wrap{display:flex;flex-direction:column;gap:16px;}
.tier-group{background:${C.bgCard};border:1px solid ${C.border};border-radius:16px;overflow:hidden;}
.tier-group-header{display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid ${C.border};background:rgba(255,255,255,0.02);}
.tgh-median{font-size:12px;color:${C.text3};margin-left:4px;}
.tgh-bench{font-size:11px;color:${C.text3};opacity:0.75;cursor:help;border-bottom:1px dotted ${C.text3};}
.tgh-count{font-size:11px;color:${C.text3};margin-left:auto;}
.tier-col-head{display:grid;grid-template-columns:220px 1fr 80px 180px 180px;gap:16px;align-items:center;padding:9px 20px;border-top:1px solid ${C.border};background:rgba(255,255,255,0.015);}
.tier-col-head > span{font-size:10px;font-weight:700;color:${C.text3};text-transform:uppercase;letter-spacing:0.06em;}
.tier-rows{display:flex;flex-direction:column;}
.tier-row{display:grid;grid-template-columns:220px 1fr 80px 180px 180px;gap:16px;align-items:center;padding:22px 20px 14px;border-top:1px solid ${C.border};}
.tier-row:first-child{border-top:0;}
.tier-row:hover{background:rgba(255,255,255,0.015);}
.tr-athlete{display:flex;align-items:center;gap:11px;}
.tr-name{display:block;font-size:13px;font-weight:700;color:${C.text};}
.tr-meta{display:block;font-size:11px;color:${C.text3};margin-top:2px;}
.tr-er-col{display:flex;align-items:center;gap:12px;}
.tr-er-bar-stack{flex:1;display:flex;flex-direction:column;gap:4px;min-width:0;}
.tr-er-bar-wrap{position:relative;height:8px;background:rgba(255,255,255,0.06);border-radius:999px;overflow:visible;}
.tr-er-bar{height:100%;border-radius:999px;border:1px solid;transition:width 0.3s;}
.tr-median-label{position:absolute;top:-18px;transform:translateX(-50%);font-size:9px;font-weight:600;color:${C.text2};white-space:nowrap;letter-spacing:0.02em;background:${C.bg};padding:0 4px;}
.tr-er-scale{display:flex;justify-content:space-between;font-size:9px;font-weight:600;color:${C.text3};letter-spacing:0.04em;text-transform:uppercase;margin-top:2px;}
.tr-er-scale-max{font-feature-settings:"tnum";}
.tr-median-line{position:absolute;top:-3px;bottom:-3px;width:2px;background:rgba(255,255,255,0.65);border-radius:1px;}
.tr-er-val{font-size:13px;font-weight:700;font-feature-settings:"tnum";flex-shrink:0;min-width:50px;text-align:right;}
.tr-posts{font-size:12px;color:${C.text3};text-align:right;}
.tr-camp{font-size:12px;}
.tr-camp-lift{font-weight:700;font-feature-settings:"tnum";}
.tr-no-camp{color:${C.text3};}
.tr-flag-chip{display:inline-block;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;}
.tfc-pos{background:${C.greenDim};color:${C.green};}
.tfc-neg{background:${C.amberDim};color:${C.amber};}
.tfc-neu{background:${C.slateDim};color:${C.slate};}
.tier-badge{display:inline-block;padding:3px 11px;border-radius:999px;font-size:12px;font-weight:700;border:1px solid;}

/* ── Shared ── */
.dpos{color:${C.green};}
.dneg{color:${C.amber};}

/* ── Footer ── */
.report-footer{margin-top:80px;padding:28px 0 56px;border-top:1px solid ${C.border};}
.footer-inner{display:flex;align-items:center;gap:18px;}
.footer-logo{height:22px;width:auto;opacity:0.25;}
.footer-lines{display:flex;flex-direction:column;gap:3px;}
.footer-lines span{font-size:11px;color:${C.text3};}
.footer-lines span:first-child{font-weight:700;color:${C.text2};}

/* ── Responsive ── */
@media(max-width:1200px){
  .summary-grid{grid-template-columns:1fr 1fr;}
  .summary-card:last-child{grid-column:1/-1;}
  .pdr-main{grid-template-columns:20px 44px 1fr 1fr;gap:12px;}
  .pdr-pct-col,.pdr-status,.pdr-chevron{display:none;}
  .tier-row{grid-template-columns:180px 1fr 60px;}
  .tr-camp,.tr-flag{display:none;}
  .hero-kpis{grid-template-columns:repeat(3,1fr);}
}
@media(max-width:900px){
  .summary-grid{grid-template-columns:1fr;}
  .worked-grid{grid-template-columns:1fr;}
}
@media(max-width:760px){
  /* Section padding tightens on phones so cards don't waste horizontal space */
  .section{padding:20px 16px 22px;}
  .body{padding:0 clamp(12px,3vw,20px);}

  /* ── Nav: single-line horizontal scroll strip ── */
  .nav-inner{flex-direction:row;height:54px;padding:0 16px;gap:12px;align-items:center;}
  .nav-links{flex-wrap:nowrap;overflow-x:auto;gap:0;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
  .nav-links::-webkit-scrollbar{display:none;}
  .nl{flex-shrink:0;margin:0 10px;}

  /* ── Hero: 2-col KPI grid, condensed hero text ── */
  .hero-section{padding:18px 16px 22px;}
  .hero-brand{gap:12px;margin-bottom:18px;}
  .hero-logo{height:28px;}
  .hero-title{font-size:18px;}
  .hero-sub{font-size:11px;}
  .hero-kpis{grid-template-columns:repeat(2,1fr);}
  .hero-kpi{padding:12px 14px;}
  .hero-kpi-v{font-size:19px;}
  .hero-meta{font-size:11px;line-height:1.5;margin-top:14px;padding-top:14px;}

  /* ── Tier View: stacked card per athlete ── */
  .tier-col-head{display:none;}
  .tier-row{grid-template-columns:1fr;gap:10px;padding:16px;}
  .tr-athlete{grid-column:1/-1;}
  .tr-er-col{grid-column:1/-1;}
  .tr-posts{grid-column:1/-1;font-size:12px;color:${C.text3};}
  .tr-camp{grid-column:1/-1;display:block;}
  .tr-flag{grid-column:1/-1;display:block;}
  .tgh-bench{display:none;}

  /* ── Post Analysis: collapse to 2-level stack ── */
  .pdr-main{grid-template-columns:20px 44px 1fr;gap:10px;padding:12px 14px;}
  .pdr-id{min-width:0;}
  .pdr-metrics{grid-column:1/-1;grid-template-columns:repeat(2,1fr);gap:6px 12px;margin-top:4px;}
  .pdr-m{flex-direction:row;justify-content:space-between;align-items:baseline;}

  /* ── Expanded row: single column ── */
  .pdr-exp-grid{grid-template-columns:1fr;}
  .pdr-exp-grid-table{grid-template-columns:80px 1fr 1fr 70px;font-size:12px;}
  .pdr-exp-gh{padding:6px 8px;font-size:9px;}
  .pdr-exp-grid-row > *{padding:8px!important;}
  .voice-fit-stats{grid-template-columns:repeat(2,1fr);gap:10px;}

  /* ── Brand Peers: already 1-col here via peer-grid rule ── */
  .peer-cpost-head{grid-template-columns:32px 1fr auto;}

  /* ── Bubble chart: hide verbose subtitle to save vertical space ── */
  .bubble-wrap{padding:14px 12px 10px;}
}
`;
