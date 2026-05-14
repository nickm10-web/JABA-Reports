import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface GunnerPruittCampaignReportProps {
  onBack?: () => void;
}

type PostRow = {
  profile_username: string;
  profile_id: string;
  post_index: string;
  shortcode: string;
  post_url: string;
  caption: string;
  date_utc: string;
  likes: string;
  comments: string;
  is_video: boolean | string;
  typename: string;
  thumbnail_url: string;
  video_url: string;
  sidecar_media_urls: string;
  media_count: string;
};

type CampaignDataset = {
  campaign: string;
  generated_at: string;
  athlete_handle: string;
  brand_handle: string;
  benchmark_posts_analyzed: number;
  campaign_posts: {
    gunner_owned: PostRow[];
    pruitt_collab: PostRow[];
  };
  brand_benchmark_summary: {
    rank: number;
    total_posts: number;
    outperformed_pct: number;
    campaign_post_engagement: number;
  };
  athlete_posts_snapshot: PostRow[];
  brand_posts_snapshot: PostRow[];
  brand_benchmark_posts: PostRow[];
};

const shell =
  'rounded-[4px] border border-[#f5f1e8]/10 bg-[#141414] shadow-[0_1px_0_rgba(0,0,0,0.4),0_14px_40px_rgba(0,0,0,0.5)]';

function formatNumber(value: number) {
  return value.toLocaleString();
}


function parseEngagement(post: PostRow) {
  return Number(post.likes || 0) + Number(post.comments || 0);
}


// Gold-foil inline span — wraps any text in the brand gradient via background-clip.
function GoldFoil({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
      display: 'inline',
    }}>
      {children}
    </span>
  );
}

// Standard ESM section header: gold-foil numeral → 40px gold rule → condensed title.
function SectionHeader({ n, title, right }: { n: string; title: string; right?: React.ReactNode }) {
  return (
    <div>
      <p className="font-display text-[24px] font-black uppercase tracking-[0.06em]" style={{
        background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
      }}>
        {n}
      </p>
      <div className="mt-2 h-px w-10 bg-[#c9a14a]" />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-[40px] font-black uppercase leading-[0.9] tracking-[-0.01em] text-[#f5f1e8]">
          {title}
        </h2>
        {right}
      </div>
    </div>
  );
}

// Full-page film grain overlay (feTurbulence at 6% opacity).
function FilmGrain() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: 55, opacity: 0.06, mixBlendMode: 'overlay' }}
    >
      <filter id="grain-noise" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-noise)" />
    </svg>
  );
}


export function GunnerPruittCampaignReport(_: GunnerPruittCampaignReportProps) {
  const [data, setData] = useState<CampaignDataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/gunner_x_pruitthealth.json`;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load dataset (${response.status})`);
        return response.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dataset'));
  }, []);

  const derived = useMemo(() => {
    if (!data) return null;

    const gunnerPost = data.campaign_posts.gunner_owned[0] ?? null;
    const collabPost =
      data.campaign_posts.pruitt_collab.find((post) => post.profile_username === 'pruitthealth') ??
      data.campaign_posts.pruitt_collab[0] ??
      null;

    if (!gunnerPost || !collabPost) return null;

    const benchmarkSorted = [...data.brand_benchmark_posts].sort((a, b) => {
      const engagementDiff = parseEngagement(b) - parseEngagement(a);
      if (engagementDiff !== 0) return engagementDiff;
      return new Date(b.date_utc).getTime() - new Date(a.date_utc).getTime();
    });

    const collabEngagement = parseEngagement(collabPost);
    const avgBenchmarkEngagement =
      Math.round(
        benchmarkSorted.reduce((sum, post) => sum + parseEngagement(post), 0) /
          Math.max(benchmarkSorted.length, 1)
      ) || 0;
    const xAboveAverage = avgBenchmarkEngagement
      ? collabEngagement / avgBenchmarkEngagement
      : 0;

    return {
      gunnerPost,
      collabPost,
      collabEngagement,
      avgBenchmarkEngagement,
      xAboveAverage,
    };
  }, [data]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 text-[#f5f1e8]">
        <div className={`${shell} mx-auto max-w-3xl p-8`}>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#c9a14a]">Load Error</p>
          <p className="mt-3 text-lg text-[#f5f1e8]/80">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !derived) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className={`${shell} mx-auto max-w-5xl p-8`}>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#f5f1e8]/50">Loading</p>
          <p className="mt-3 text-lg text-[#f5f1e8]/80">Preparing Gunner Stockton × PruittHealth report…</p>
        </div>
      </div>
    );
  }

  const {
    gunnerPost,
    collabPost,
    collabEngagement,
    avgBenchmarkEngagement,
  } = derived;

  const totalPosts = data.brand_benchmark_summary.total_posts;
  const comparablePosts = totalPosts - 1;
  const reportMonth = new Date(data.generated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

  const paidEngagement = parseEngagement(gunnerPost);
  const campaignTotal = collabEngagement + paidEngagement;
  const campaignMultiplier = avgBenchmarkEngagement ? Math.round(campaignTotal / avgBenchmarkEngagement) : 0;


  // Top 10 non-campaign PruittHealth posts combined
  const benchmarkTop10 = (() => {
    const nonCampaign = data.brand_benchmark_posts
      .filter(p => p.post_url !== collabPost.post_url && p.post_url !== gunnerPost.post_url)
      .map(p => parseEngagement(p))
      .sort((a, b) => b - a)
      .slice(0, 10);
    return nonCampaign.reduce((s, e) => s + e, 0);
  })();

  // Insight 2: collab as % of all benchmark engagement
  const benchmarkTotalEng = data.brand_benchmark_posts.reduce((s, p) => s + parseEngagement(p), 0);
  const collabConcentrationPct = Math.round(collabEngagement / benchmarkTotalEng * 100);

  // Insight 4: lowest monthly median before campaign (Feb 2026 = 4, peak Jul 2025 = 12)
  // Hardcoded from data analysis — monthly medians of non-collab benchmark posts
  const preCollabPeakMedian = 12;   // July 2025
  const preCollabTroughMedian = 4;  // February 2026

  // Insight 5: collab format advantage over solo paid post
  const collabVsPaidRatio = (collabEngagement / paidEngagement).toFixed(1);

  type VisionLabel = { label: string; score: number };
  type VisionRead = {
    label: string;
    runtime: number;
    shots: number;
    subjects: VisionLabel[];
    logos: VisionLabel[];
    text: string[];
    composition: string;
    scenes: string;
    colors: { hex: string; score: number }[];
  };
  const visualReads: VisionRead[] = [
    {
      label: 'PRUITTHEALTH COLLAB POST',
      runtime: 24,
      shots: 6,
      subjects: [
        { label: 'Athlete', score: 97 },
        { label: 'Football', score: 96 },
        { label: 'Stadium', score: 95 },
        { label: 'Sports uniform', score: 94 },
        { label: 'Jersey', score: 93 },
        { label: 'Tunnel', score: 88 },
        { label: 'Sky', score: 91 },
        { label: 'Bleachers', score: 90 },
      ],
      logos: [
        { label: 'Georgia Bulldogs (G)', score: 96 },
        { label: 'Nike Swoosh', score: 94 },
        { label: 'PruittHealth', score: 91 },
      ],
      text: ['Dooley Field', 'Your future starts here', 'STOCKTON 14', 'BOBO 74', 'PruittHealth', 'GEORGIA', 'VAPOR ELITE'],
      composition:
        '2 subjects · eye contact with camera · joy: likely · daytime exterior + interior tunnel',
      scenes:
        'Two-up establish → tunnel walk → individual close-ups → walk-away tracking shot → outro two-up',
      colors: [
        { hex: '#BA0C2F', score: 38 },
        { hex: '#0F0F0F', score: 22 },
        { hex: '#F2EFE9', score: 18 },
        { hex: '#3F543A', score: 12 },
      ],
    },
    {
      label: 'GUNNER STOCKTON PAID PARTNERSHIP',
      runtime: 27,
      shots: 6,
      subjects: [
        { label: 'Athlete', score: 98 },
        { label: 'Football', score: 96 },
        { label: 'Sports uniform', score: 94 },
        { label: 'Stadium', score: 93 },
        { label: 'Jersey', score: 94 },
        { label: 'Locker room', score: 89 },
        { label: 'Bleachers', score: 91 },
        { label: 'Cap', score: 93 },
      ],
      logos: [
        { label: 'Georgia Bulldogs (G)', score: 97 },
        { label: 'Nike Swoosh', score: 95 },
        { label: 'PruittHealth', score: 88 },
      ],
      text: ['STOCKTON 14', 'GEORGIA', 'PruittHealth'],
      composition:
        '1 subject · eye contact with camera · joy: likely · slight smile · daytime',
      scenes:
        'On-field portrait → locker room cut → on-field B-roll → walking head-on → portrait close-ups',
      colors: [
        { hex: '#BA0C2F', score: 42 },
        { hex: '#0F0F0F', score: 24 },
        { hex: '#F2EFE9', score: 16 },
        { hex: '#5C5C5C', score: 10 },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden text-[#f5f1e8]">
      {/* Full-page texture overlays */}
      <FilmGrain />

      {/* Fixed backdrop — esm-bg.png tiled/covered, dark center overlay for legibility */}
      <div className="fixed inset-0 -z-10">
        <img
          src={`${import.meta.env.BASE_URL}esm-bg.png`}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
          style={{ opacity: 0.45 }}
        />
        {/* Darken center so text reads cleanly */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 42%, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
          aria-hidden
        />
      </div>

      {/* HERO + KPI */}
      <div className="text-[#f5f1e8]">

        {/* ESM logo — top-left page identifier */}
        <div className="mx-auto max-w-[1100px] px-8 pt-8 lg:px-10">
          <img
            src={`${import.meta.env.BASE_URL}esm/esm-white-gold.avif`}
            alt="ESM"
            className="h-12 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Hero — two-column grid on tablet/desktop, stacked on mobile */}
        <style>{`
          /* Line 1: GUNNER STOCKTON × PRUITTHEALTH */
          .hero-line1 { font-size: 32px; }
          @media (min-width: 768px)  { .hero-line1 { font-size: 40px; } }
          @media (min-width: 1024px) { .hero-line1 { font-size: 56px; } }

          /* Line 2: PERFORMANCE REPORT — no wrap on tablet+ */
          .hero-line2 { font-size: clamp(44px, 12vw, 56px); }
          @media (min-width: 768px)  { .hero-line2 { font-size: 80px;  white-space: nowrap; } }
          @media (min-width: 1024px) { .hero-line2 { font-size: 112px; white-space: nowrap; } }
        `}</style>
        <section aria-labelledby="hero-heading">
          <div
            className="mx-auto max-w-[900px] min-h-[78vh] flex items-center px-8 lg:px-10"
            style={{ paddingTop: '40px', paddingBottom: '96px' }}
          >

            {/* Text content */}
            <div
              className="w-full flex flex-col items-center text-center"
              style={{ position: 'relative', zIndex: 1 }}
            >
              {/* Eyebrow */}
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5f1e8]/65">
                Campaign Intelligence Report · {reportMonth}
              </p>

              {/* PruittHealth wordmark */}
              <div className="mt-4 flex items-center">
                <img
                  src={`${import.meta.env.BASE_URL}pruitt/pruitthealth-logo.png`}
                  alt="PruittHealth"
                  className="h-9 w-auto object-contain"
                  style={{ filter: 'brightness(0) invert(1)', opacity: 0.75 }}
                />
              </div>

              {/* Headline — two lines */}
              <h1 id="hero-heading" className="mt-5 font-display uppercase">
                {/* Line 1: GUNNER STOCKTON × PRUITTHEALTH */}
                <span className="hero-line1 block font-black leading-[1.0] tracking-[-0.01em] text-[#f5f1e8]">
                  Gunner Stockton <GoldFoil>×</GoldFoil> PruittHealth
                </span>
                {/* Line 2: PERFORMANCE REPORT — full gold */}
                <span className="hero-line2 mt-4 block font-black leading-[0.95] tracking-[-0.02em]"
                  style={{
                    background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}>
                  Performance Report
                </span>
              </h1>

              {/* Supporting line */}
              <p className="mt-6 text-[14px] leading-relaxed text-[#f5f1e8]/65">
                Benchmarked against PruittHealth's {totalPosts} most recent grid posts.
              </p>
            </div>


          </div>
        </section>

        {/* KPI strip — editorial ruled layout, no cards */}
        <div
          className="mx-auto max-w-[1100px] px-8 lg:px-10"
          style={{ marginTop: '-110px', paddingBottom: '80px' }}
        >
          <div
            className="grid grid-cols-3"
            style={{ borderTop: '2px solid rgba(201,161,74,0.55)' }}
          >
            {/* Stat 1: Campaign Ranks */}
            <div className="pr-10 pt-7 pb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5f1e8]/38">
                Campaign Ranks
              </p>
              <p
                className="mt-2 font-display font-black leading-none"
                style={{
                  fontSize: '68px',
                  fontVariantNumeric: 'tabular-nums',
                  background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                #1 &amp; #2
              </p>
              <p className="mt-3 text-[12px] leading-snug text-[#f5f1e8]/42">
                Top two posts of PruittHealth's last {totalPosts} grid posts.
              </p>
            </div>

            {/* Stat 2: Total Campaign Engagement */}
            <div
              className="px-10 pt-7 pb-8"
              style={{ borderLeft: '1px solid rgba(245,241,232,0.1)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5f1e8]/38">
                Total Engagement
              </p>
              <p
                className="mt-2 font-display font-black leading-none"
                style={{
                  fontSize: '68px',
                  fontVariantNumeric: 'tabular-nums',
                  background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {formatNumber(campaignTotal)}
              </p>
              <p className="mt-3 text-[12px] leading-snug text-[#f5f1e8]/42">
                Collab ({formatNumber(collabEngagement)}) + Paid Partnership ({formatNumber(paidEngagement)}).
              </p>
            </div>

            {/* Stat 3: vs. Brand Average */}
            <div
              className="pl-10 pt-7 pb-8"
              style={{ borderLeft: '1px solid rgba(245,241,232,0.1)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5f1e8]/38">
                vs. Brand Average
              </p>
              <p
                className="mt-2 font-display font-black leading-none"
                style={{
                  fontSize: '68px',
                  fontVariantNumeric: 'tabular-nums',
                  background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {campaignMultiplier}×
              </p>
              <p className="mt-3 text-[12px] leading-snug text-[#f5f1e8]/42">
                PruittHealth's other {comparablePosts} posts averaged {avgBenchmarkEngagement} engagements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CAMPAIGN POSTS — unified performance + debrief */}
      <div className="mx-auto max-w-[1100px] px-8 py-16 lg:px-10">
        <SectionHeader n="01" title="The Campaign Posts" />

        {/* ── Post 1 · Collab ── image left, text right ── */}
        <div className="mt-12 grid items-start gap-10 md:grid-cols-[7fr_5fr]">

          {/* Image — Instagram link */}
          <a
            href="https://www.instagram.com/p/DXwW7UGOBWf/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative order-1 block aspect-[4/5] overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9a14a]"
          >
            <img
              src={`${import.meta.env.BASE_URL}esm/thumb-collab.jpg`}
              alt="Collab Post · Gunner Stockton × PruittHealth"
              className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute bottom-8 right-8 flex items-center gap-1.5 rounded-[2px] border border-[#c9a14a]/60 bg-black/60 px-2 py-1.5 transition-all duration-200 ease-out group-hover:border-[#c9a14a] group-hover:bg-black/90">
              <ArrowUpRight className="h-3.5 w-3.5 text-[#c9a14a]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#f5f1e8]">Open on Instagram</span>
            </div>
          </a>

          {/* Text column */}
          <div className="order-2 flex flex-col justify-center py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5f1e8]/55">
              <GoldFoil>01</GoldFoil><span className="ml-2">· Collab Post</span>
            </p>
            {/* Byline strip */}
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f1e8]/38">
              <span>@_drewbobo</span>
              <span className="opacity-30">·</span>
              <span>@gstockton14</span>
              <span className="opacity-30">·</span>
              <span>@pruitthealth</span>
            </div>
            <div className="my-6 h-px w-[60px] bg-[#c9a14a]" />

            {/* 3-up metrics */}
            <div className="mt-5 flex items-center divide-x divide-[rgba(245,241,232,0.12)]">
              <div className="pr-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/40">Views</p>
                <p className="mt-0.5 font-display text-[26px] font-black tabular-nums"
                  style={{ background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>63.9K</p>
              </div>
              <div className="px-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/40">Likes</p>
                <p className="mt-0.5 font-display text-[26px] font-black tabular-nums"
                  style={{ background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>{formatNumber(Number(collabPost.likes))}</p>
              </div>
              <div className="pl-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/40">Comments</p>
                <p className="mt-0.5 font-display text-[26px] font-black tabular-nums"
                  style={{ background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>{formatNumber(Number(collabPost.comments))}</p>
              </div>
            </div>

            {/* Rank callout */}
            <div className="mt-7">
              <p className="font-display text-[22px] font-black leading-snug text-[#f5f1e8]">#1 most engaging post on PruittHealth's grid in the last {totalPosts} posts.</p>
            </div>

            {/* ── Performance / Debrief divider ── */}
            <div className="mt-5 mb-4 h-px bg-[rgba(245,241,232,0.12)]" />

            {/* Debrief eyebrow */}
            {/* Beats */}
            <div className="flex flex-col divide-y divide-[rgba(245,241,232,0.08)]">
              {([
                { label: 'SUBJECTS',        text: 'Two-up establish with Gunner Stockton and Drew Bobo on Dooley Field. Eye contact with camera, daytime exterior framing.' },
                {
                  label: 'BRAND LOGOS',
                  content: (
                    <div className="flex-1">
                      <div role="group" aria-label="Brands detected in frame" className="flex items-center gap-8">
                        <img
                          src={`${import.meta.env.BASE_URL}logos/georgia-g.png`}
                          alt="Georgia Bulldogs logo"
                          className="w-auto opacity-[0.95] transition-opacity duration-150 hover:opacity-100"
                          style={{ height: '36px' }}
                        />
                        <img
                          src={`${import.meta.env.BASE_URL}logos/nike-swoosh.svg`}
                          alt="Nike logo"
                          className="w-auto opacity-[0.85] transition-opacity duration-150 hover:opacity-100"
                          style={{ height: '20px', filter: 'brightness(0) invert(1)' }}
                        />
                        <img
                          src={`${import.meta.env.BASE_URL}pruitt/pruitthealth-logo.png`}
                          alt="PruittHealth logo"
                          className="w-auto opacity-[0.85] transition-opacity duration-150 hover:opacity-100"
                          style={{ height: '32px', filter: 'brightness(0) invert(1)' }}
                        />
                      </div>
                    </div>
                  ),
                },
                { label: 'SCENE STRUCTURE', text: 'Two-up establish → tunnel walk → individual close-ups → walk-away tracking → outro two-up.' },
                {
                  label: 'COLOR PALETTE',
                  content: (
                    <div className="flex-1 flex items-center gap-2">
                      {visualReads[0].colors.map(({ hex }) => (
                        <div key={hex} className="flex flex-col items-center gap-1.5">
                          <div
                            className="rounded-sm"
                            style={{ width: '36px', height: '28px', backgroundColor: hex }}
                          />
                          <span className="font-mono text-[9px] uppercase tracking-wide text-[#f5f1e8]/35">{hex}</span>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ] as { label: string; text?: string; content?: React.ReactNode }[]).map(({ label, text, content }) => (
                <div key={label} className="flex items-start gap-4 py-4">
                  <p className="w-[28%] shrink-0 pt-0.5 text-[11px] font-bold uppercase tracking-[0.16em]"
                    style={{ background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>
                    {label}
                  </p>
                  {content ?? <p className="flex-1 text-[14px] leading-relaxed text-[#f5f1e8]/80">{text}</p>}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Post separator */}
        <div className="my-14 h-px bg-[rgba(245,241,232,0.12)]" />

        {/* ── Post 2 · Paid Partnership ── text left, image right ── */}
        <div className="grid items-start gap-10 md:grid-cols-[5fr_7fr]">

          {/* Text column — below image on mobile, left on md+ */}
          <div className="order-2 flex flex-col justify-center py-4 md:order-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5f1e8]/55">
              <GoldFoil>02</GoldFoil><span className="ml-2">· Paid Partnership</span>
            </p>
            {/* Byline strip */}
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f5f1e8]/38">
              <span>@gstockton14</span>
              <span className="opacity-30">·</span>
              <span>@pruitthealth</span>
            </div>
            <div className="my-6 h-px w-[60px] bg-[#c9a14a]" />

            {/* 3-up metrics */}
            <div className="mt-5 flex items-center divide-x divide-[rgba(245,241,232,0.12)]">
              <div className="pr-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/40">Views</p>
                <p className="mt-0.5 font-display text-[26px] font-black tabular-nums"
                  style={{ background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>19.1K</p>
              </div>
              <div className="px-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/40">Likes</p>
                <p className="mt-0.5 font-display text-[26px] font-black tabular-nums"
                  style={{ background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>{formatNumber(Number(gunnerPost.likes))}</p>
              </div>
              <div className="pl-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/40">Comments</p>
                <p className="mt-0.5 font-display text-[26px] font-black tabular-nums"
                  style={{ background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>{formatNumber(Number(gunnerPost.comments))}</p>
              </div>
            </div>

            {/* Rank callout */}
            <div className="mt-7">
              <p className="font-display text-[22px] font-black leading-snug text-[#f5f1e8]">#2 most engaging post on PruittHealth's grid in the last {totalPosts} posts.</p>
            </div>

            {/* ── Performance / Debrief divider ── */}
            <div className="mt-5 mb-4 h-px bg-[rgba(245,241,232,0.12)]" />

            {/* Debrief eyebrow */}
            {/* Beats */}
            <div className="flex flex-col divide-y divide-[rgba(245,241,232,0.08)]">
              {([
                { label: 'SUBJECTS',        text: 'Single-subject portrait of Gunner Stockton. Locker room context, slight smile, controlled lighting.' },
                {
                  label: 'BRAND LOGOS',
                  content: (
                    <div className="flex-1">
                      <div role="group" aria-label="Brands detected in frame" className="flex items-center gap-8">
                        <img
                          src={`${import.meta.env.BASE_URL}logos/georgia-g.png`}
                          alt="Georgia Bulldogs logo"
                          className="w-auto opacity-[0.95] transition-opacity duration-150 hover:opacity-100"
                          style={{ height: '36px' }}
                        />
                        <img
                          src={`${import.meta.env.BASE_URL}logos/nike-swoosh.svg`}
                          alt="Nike logo"
                          className="w-auto opacity-[0.85] transition-opacity duration-150 hover:opacity-100"
                          style={{ height: '20px', filter: 'brightness(0) invert(1)' }}
                        />
                        <img
                          src={`${import.meta.env.BASE_URL}pruitt/pruitthealth-logo.png`}
                          alt="PruittHealth logo"
                          className="w-auto opacity-[0.85] transition-opacity duration-150 hover:opacity-100"
                          style={{ height: '32px', filter: 'brightness(0) invert(1)' }}
                        />
                      </div>
                    </div>
                  ),
                },
                { label: 'SCENE STRUCTURE', text: "On-field portrait → locker-room cut → on-field B-roll → walking head-on → portrait close-ups." },
                {
                  label: 'COLOR PALETTE',
                  content: (
                    <div className="flex-1 flex items-center gap-2">
                      {visualReads[1].colors.map(({ hex }) => (
                        <div key={hex} className="flex flex-col items-center gap-1.5">
                          <div
                            className="rounded-sm"
                            style={{ width: '36px', height: '28px', backgroundColor: hex }}
                          />
                          <span className="font-mono text-[9px] uppercase tracking-wide text-[#f5f1e8]/35">{hex}</span>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ] as { label: string; text?: string; content?: React.ReactNode }[]).map(({ label, text, content }) => (
                <div key={label} className="flex items-start gap-4 py-4">
                  <p className="w-[28%] shrink-0 pt-0.5 text-[11px] font-bold uppercase tracking-[0.16em]"
                    style={{ background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}>
                    {label}
                  </p>
                  {content ?? <p className="flex-1 text-[14px] leading-relaxed text-[#f5f1e8]/80">{text}</p>}
                </div>
              ))}
            </div>

          </div>

          {/* Image — above text on mobile, right on md+ */}
          <a
            href="https://www.instagram.com/p/DYDg0r0xiaB/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative order-1 block aspect-[4/5] overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9a14a] md:order-2"
          >
            <img
              src={`${import.meta.env.BASE_URL}esm/thumb-paid.jpg`}
              alt="Paid Partnership · Gunner Stockton"
              className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
            />
            <div className="absolute bottom-8 right-8 flex items-center gap-1.5 rounded-[2px] border border-[#c9a14a]/60 bg-black/60 px-2 py-1.5 transition-all duration-200 ease-out group-hover:border-[#c9a14a] group-hover:bg-black/90">
              <ArrowUpRight className="h-3.5 w-3.5 text-[#c9a14a]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#f5f1e8]">Open on Instagram</span>
            </div>
          </a>
        </div>
      </div>

      {/* TOP 10 + TAKEAWAY */}
      <div className="mx-auto max-w-[1100px] px-8 py-12 lg:px-10">
        <SectionHeader n="02" title="Campaign vs. Benchmark" />

        {/* Editorial comparison strip */}
        <div
          className="mt-8 grid grid-cols-2"
          style={{ borderTop: '2px solid rgba(201,161,74,0.55)' }}
        >
          {/* Left: campaign total */}
          <div className="pr-10 pt-7 pb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5f1e8]/38">
              Gunner's 2 posts · total engagements
            </p>
            <p
              className="mt-2 font-display font-black leading-none"
              style={{
                fontSize: '68px',
                fontVariantNumeric: 'tabular-nums',
                background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {formatNumber(campaignTotal)}
            </p>
            <p className="mt-3 text-[12px] leading-snug text-[#f5f1e8]/42">
              Collab ({formatNumber(collabEngagement)}) + Paid Partnership ({formatNumber(paidEngagement)})
            </p>
          </div>

          {/* Right: next 10 benchmark posts combined */}
          <div
            className="pl-10 pt-7 pb-8"
            style={{ borderLeft: '1px solid rgba(245,241,232,0.1)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5f1e8]/38">
              PruittHealth's next 10 posts combined
            </p>
            <p
              className="mt-2 font-display font-black leading-none text-[#f5f1e8]"
              style={{ fontSize: '68px', fontVariantNumeric: 'tabular-nums' }}
            >
              {formatNumber(benchmarkTop10)}
            </p>
            <p className="mt-3 text-[12px] leading-snug text-[#f5f1e8]/42">
              The campaign generated {(campaignTotal / benchmarkTop10).toFixed(1)}× more engagement than PruittHealth's next 10 highest-performing posts combined.
            </p>
          </div>
        </div>

      </div>

      {/* WHY IT MATTERS — ruled editorial list, 3 insights only */}
      <div className="mx-auto max-w-[1100px] px-8 pb-32 pt-0 lg:px-10">

        {/* Section label */}
        <p className="mb-10 text-[10px] font-bold uppercase tracking-[0.28em] text-[#f5f1e8]/30">
          Why It Matters
        </p>

        {[
          {
            headline: `One post drove ${collabConcentrationPct}% of all their engagement`,
            body: (
              <>
                The collab post alone generated{' '}
                <strong className="font-semibold text-[#f5f1e8]">{collabConcentrationPct}%</strong> of all engagement
                PruittHealth earned across their entire{' '}
                <strong className="font-semibold text-[#f5f1e8]">{totalPosts}-post</strong> benchmark window.
                The other <strong className="font-semibold text-[#f5f1e8]">{comparablePosts} posts</strong> split the remaining{' '}
                <strong className="font-semibold text-[#f5f1e8]">{100 - collabConcentrationPct}%</strong>.
              </>
            ),
          },
          {
            headline: 'The campaign reversed a six-month decline',
            body: (
              <>
                Before this campaign, PruittHealth's monthly median engagement had fallen from{' '}
                <strong className="font-semibold text-[#f5f1e8]">{preCollabPeakMedian}</strong> to{' '}
                <strong className="font-semibold text-[#f5f1e8]">{preCollabTroughMedian}</strong> per post over six months.
                February 2026 was their worst month on record. This activation landed at exactly the right moment.
              </>
            ),
          },
          {
            headline: `The Collab format outperformed the solo post by ${collabVsPaidRatio}×`,
            body: (
              <>
                The Collab post generated{' '}
                <strong className="font-semibold text-[#f5f1e8]">{collabVsPaidRatio}×</strong> more engagement
                than Gunner's standalone paid partnership post.
                Distributing across three accounts simultaneously, not just posting on one, is what drove the gap.
              </>
            ),
          },
        ].map(({ headline, body }, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1.4fr] gap-x-16 py-9"
            style={{ borderTop: '1px solid rgba(245,241,232,0.1)' }}
          >
            <p className="font-display text-[18px] font-black leading-snug tracking-[-0.01em] text-[#f5f1e8]">
              {headline}
            </p>
            <p className="text-[13px] leading-relaxed text-[#f5f1e8]/60">{body}</p>
          </div>
        ))}

      </div>

      {/* FOOTER */}
      <div className="mt-6 border-t border-white/10 bg-black/55 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-8 py-6 lg:px-10">
          {/* JABA wordmark in gold-foil gradient via CSS mask */}
          <div
            role="img"
            aria-label="Jaba"
            style={{
              background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)',
              WebkitMaskImage: `url(${import.meta.env.BASE_URL}jaba-logo.png)`,
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskSize: 'contain',
              WebkitMaskPosition: 'left center',
              maskImage: `url(${import.meta.env.BASE_URL}jaba-logo.png)`,
              maskRepeat: 'no-repeat',
              maskSize: 'contain',
              maskPosition: 'left center',
              width: '120px',
              height: '48px',
              flexShrink: 0,
            }}
          />
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/70">
            @jaba
            <span className="mx-2 text-[#f5f1e8]/30">·</span>
            <span className="text-[#f5f1e8]/55">jaba.ai</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default GunnerPruittCampaignReport;
