import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import { GlowCard } from './ui/spotlight-card';

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

function formatDateLabel(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseEngagement(post: PostRow) {
  return Number(post.likes || 0) + Number(post.comments || 0);
}

function postTypeLabel(p: PostRow) {
  if (p.typename === 'GraphVideo') return 'REEL';
  if (p.typename === 'GraphSidecar') return 'CAROUSEL';
  return 'IMAGE';
}

function truncateCaption(c: string | undefined | null, max = 95) {
  if (!c) return null;
  const clean = c.replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trimEnd() + '…';
}

function PostThumb({ src, fallbackLabel }: { src?: string; fallbackLabel: string }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-[4px] border border-[rgba(245,241,232,0.12)] bg-[#141414] text-[9px] font-bold uppercase tracking-wider text-[#f5f1e8]/55">
        {fallbackLabel}
      </div>
    );
  }
  return (
    <img
      src={src}
      onError={() => setErrored(true)}
      className="h-14 w-14 rounded-[4px] object-cover"
      alt=""
    />
  );
}

// Flat panel treatment — used everywhere. No blur, no shadow, no rounded excess.
const GLASS_BASE =
  'relative overflow-hidden border border-[rgba(245,241,232,0.12)] bg-[#141414]';

// Retained as no-op so call sites don't need to change.
function GlassSheen() { return null; }

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

// Full-page sparse gold-dust particles (SVG pattern, mix-blend-mode: screen).
function GoldDust() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: 56, opacity: 0.15, mixBlendMode: 'screen' }}
    >
      <defs>
        <pattern id="gold-dust-pat" x="0" y="0" width="480" height="360" patternUnits="userSpaceOnUse">
          <circle cx="23"  cy="17"  r="0.9" fill="#f3d77a" />
          <circle cx="87"  cy="54"  r="0.6" fill="#c9a14a" />
          <circle cx="156" cy="8"   r="1.1" fill="#f3d77a" />
          <circle cx="198" cy="78"  r="0.7" fill="#e8b84a" />
          <circle cx="234" cy="33"  r="0.5" fill="#f3d77a" />
          <circle cx="312" cy="61"  r="0.8" fill="#c9a14a" />
          <circle cx="367" cy="19"  r="0.6" fill="#f3d77a" />
          <circle cx="45"  cy="98"  r="0.7" fill="#e8c070" />
          <circle cx="123" cy="143" r="0.9" fill="#f3d77a" />
          <circle cx="278" cy="112" r="0.5" fill="#c9a14a" />
          <circle cx="389" cy="134" r="0.8" fill="#f3d77a" />
          <circle cx="67"  cy="189" r="0.6" fill="#e8b84a" />
          <circle cx="145" cy="201" r="1.0" fill="#f3d77a" />
          <circle cx="223" cy="167" r="0.7" fill="#c9a14a" />
          <circle cx="334" cy="183" r="0.5" fill="#f3d77a" />
          <circle cx="8"   cy="234" r="0.8" fill="#e8c070" />
          <circle cx="178" cy="256" r="0.6" fill="#f3d77a" />
          <circle cx="289" cy="243" r="0.9" fill="#c9a14a" />
          <circle cx="356" cy="278" r="0.5" fill="#f3d77a" />
          <circle cx="98"  cy="301" r="0.7" fill="#e8b84a" />
          <circle cx="421" cy="47"  r="0.6" fill="#f3d77a" />
          <circle cx="455" cy="189" r="0.8" fill="#c9a14a" />
          <circle cx="412" cy="312" r="0.5" fill="#f3d77a" />
          <circle cx="18"  cy="339" r="0.9" fill="#e8c070" />
          <circle cx="247" cy="347" r="0.6" fill="#f3d77a" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gold-dust-pat)" />
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

  const topTen = (() => {
    const benchmarkEntries = data.brand_benchmark_posts.map((p) => {
      const isCollab = p.post_url === collabPost.post_url;
      return {
        eng: isCollab ? collabEngagement : parseEngagement(p),
        isCollab,
        isPaidPartnership: false,
        post: p,
      };
    });
    const paidEntry = {
      eng: parseEngagement(gunnerPost),
      isCollab: false,
      isPaidPartnership: true,
      post: gunnerPost,
    };
    const sorted = [...benchmarkEntries, paidEntry].sort((a, b) => b.eng - a.eng);
    const top = sorted.slice(0, 10);
    const rest = sorted.slice(10);
    const restAvg = rest.length
      ? Math.round(rest.reduce((s, d) => s + d.eng, 0) / rest.length)
      : 0;
    const runnerUp = top[1]?.eng ?? 0;
    const collabVsRunnerUp = runnerUp ? collabEngagement / runnerUp : 0;
    return { top, restAvg, runnerUp, collabVsRunnerUp };
  })();

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
      <GoldDust />

      {/* Fixed photo backdrop — desaturated, amber-shifted, ~25% brightness */}
      <div className="fixed inset-0 -z-10">
        <img
          src={`${import.meta.env.BASE_URL}esm/gunner-bg.png`}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
          style={{ filter: 'brightness(0.28) sepia(0.55) saturate(1.6) hue-rotate(-18deg)' }}
        />
        {/* Radial vignette: center-lit, hard-fade to #0a0a0a at edges */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 72% 58% at 50% 32%, transparent 0%, rgba(10,10,10,0.5) 48%, rgba(10,10,10,0.88) 75%, #0a0a0a 100%)' }}
          aria-hidden
        />
        {/* Bottom-half fill so lower sections read on pure dark */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/40 to-[#0a0a0a]" aria-hidden />
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
          .hero-hl-lg { font-size: clamp(32px, 8vw, 48px); }
          .hero-hl-sm { font-size: clamp(18px, 4.5vw, 32px); }
          @media (min-width: 768px) and (max-width: 1023px) {
            .hero-hl-lg { font-size: clamp(40px, 8vw, 72px); }
            .hero-hl-sm { font-size: clamp(20px, 4.5vw, 48px); }
          }
          @media (min-width: 1024px) {
            .hero-hl-lg { font-size: clamp(48px, 7vw, 96px); }
            .hero-hl-sm { font-size: clamp(22px, 4.5vw, 68px); }
          }
        `}</style>
        <section aria-labelledby="hero-heading">
          <div
            className="mx-auto grid max-w-[1200px] min-h-[78vh] items-center px-8 md:grid-cols-[3fr_2fr] lg:px-10"
            style={{ paddingTop: '120px', paddingBottom: '96px' }}
          >

            {/* LEFT — text content */}
            <div
              className="flex flex-col items-center text-center md:items-start md:text-left"
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

              {/* Mobile-only portrait — stacked between logo and headline */}
              <div className="relative mt-6 block w-full md:hidden" style={{ maxHeight: '320px' }}>
                <img
                  src={`${import.meta.env.BASE_URL}Gunner-hero.png`}
                  alt="Gunner Stockton, Georgia Bulldogs quarterback"
                  className="mx-auto block"
                  style={{
                    maxHeight: '320px',
                    width: 'auto',
                    objectFit: 'contain',
                    objectPosition: 'bottom center',
                  }}
                  loading="eager"
                  sizes="100vw"
                />
              </div>

              {/* Headline stack */}
              <h1 id="hero-heading" className="mt-5 font-display uppercase">
                {/* Line 1 — partnership eyebrow, smaller */}
                <span className="hero-hl-sm block font-black leading-[1.0] tracking-[-0.01em] text-[#f5f1e8]">
                  Gunner Stockton <GoldFoil>×</GoldFoil> PruittHealth
                </span>
                {/* Line 2 — main title */}
                <span className="hero-hl-lg block font-black leading-[0.88] tracking-[-0.02em] text-[#f5f1e8]">
                  Partnership Performance
                </span>
                {/* Line 3 — gold-foil accent */}
                <span
                  className="hero-hl-lg block font-black leading-[0.88] tracking-[-0.02em]"
                  style={{
                    background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Report
                </span>
              </h1>

              {/* Gold rule */}
              <div className="mt-8 h-px w-20 bg-[#c9a14a]" />

              {/* Supporting line */}
              <p className="mt-5 text-[14px] leading-relaxed text-[#f5f1e8]/65">
                Benchmarked against PruittHealth's {totalPosts} most recent grid posts.
              </p>
            </div>

            {/* RIGHT — portrait, tablet+ only */}
            <div
              className="relative hidden md:-ml-6 md:block lg:-ml-16"
              style={{ alignSelf: 'stretch', zIndex: 2 }}
            >
              {/* Warm gold radial halo — grounds the figure without a hard edge */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(600px circle at center, rgba(201,161,74,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }}
              />
              {/* Portrait — flush right, feet anchored, breaks vertical containment */}
              <img
                src={`${import.meta.env.BASE_URL}Gunner-hero.png`}
                alt="Gunner Stockton, Georgia Bulldogs quarterback"
                style={{
                  position: 'absolute',
                  bottom: '-40px',
                  right: 0,
                  height: 'calc(100% + 80px)',
                  width: '100%',
                  objectFit: 'contain',
                  objectPosition: 'bottom right',
                }}
                loading="eager"
                sizes="(max-width: 1024px) 40vw, 480px"
              />
            </div>

          </div>
        </section>

        <div className="mx-auto max-w-[1100px] px-8 pb-20 lg:px-10">
          {/* KPI tiles — GlowCard spotlight, equal 3-col grid */}
          <div className="grid grid-cols-3 gap-6">

            {/* Tile 1: Campaign Rank */}
            <GlowCard
              glowColor="gold"
              customSize
              className="bg-[#141414] border border-[rgba(245,241,232,0.12)] p-8"
              style={{ height: '200px' }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5f1e8]/55">
                Campaign Ranks
              </p>
              <p className="mt-3 font-display text-[56px] font-black leading-none text-[#f5f1e8]"
                style={{ fontVariantNumeric: 'tabular-nums' }}>
                #1 &amp; #2
              </p>
              <p className="mt-3 text-[13px] leading-snug text-[#f5f1e8]/55">
                Top two posts of PruittHealth's last {totalPosts} grid posts.
              </p>
            </GlowCard>

            {/* Tile 2: Total Campaign Engagement */}
            <GlowCard
              glowColor="gold"
              customSize
              className="bg-[#141414] border border-[rgba(245,241,232,0.12)] p-8"
              style={{ height: '200px' }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5f1e8]/55">
                Total Campaign Engagement
              </p>
              <p className="mt-3 font-display text-[56px] font-black leading-none text-[#f5f1e8]"
                style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatNumber(campaignTotal)}
              </p>
              <p className="mt-3 text-[13px] leading-snug text-[#f5f1e8]/55">
                Combined engagement across the Collab ({formatNumber(collabEngagement)}) and Paid Partnership ({formatNumber(paidEngagement)}).
              </p>
            </GlowCard>

            {/* Tile 3: vs. Brand Average */}
            <GlowCard
              glowColor="gold"
              customSize
              className="bg-[#141414] border border-[rgba(245,241,232,0.12)] p-8"
              style={{ height: '200px' }}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5f1e8]/55">
                vs. Brand Average
              </p>
              <p className="mt-3 font-display text-[56px] font-black leading-none text-[#f5f1e8]"
                style={{ fontVariantNumeric: 'tabular-nums' }}>
                {campaignMultiplier}×
              </p>
              <p className="mt-3 text-[13px] leading-snug text-[#f5f1e8]/55">
                PruittHealth's other {comparablePosts} grid posts averaged {avgBenchmarkEngagement} engagements.
              </p>
            </GlowCard>

          </div>
        </div>
      </div>

      {/* CAMPAIGN POSTS */}
      <div className="mx-auto max-w-[1100px] px-8 py-16 lg:px-10">
        <SectionHeader n="01" title="The Campaign Posts" />

        <div className="mt-6 grid gap-6 md:grid-cols-[1.5fr_1fr]">
          {[
            {
              n: '1',
              label: 'Collab Post · Gunner Stockton × PruittHealth',
              sub: 'Hosted on @_drewbobo · Distributed across 3 accounts',
              post: collabPost,
              thumb: `${import.meta.env.BASE_URL}esm/thumb-collab.jpg`,
              views: 63900,
              callout: {
                headline: `RANKED #1 OF ${totalPosts} PRUITTHEALTH POSTS`,
                body: 'Outperformed every other PruittHealth post in the benchmark.',
                tone: 'primary' as const,
              },
            },
            {
              n: '2',
              label: 'Paid Partnership · Gunner Stockton',
              sub: 'Posted on @gstockton14 and @pruitthealth · 111K followers',
              post: gunnerPost,
              thumb: `${import.meta.env.BASE_URL}esm/thumb-paid.jpg`,
              views: 19100,
              callout: {
                headline: "RANKED #2 ON PRUITTHEALTH'S GRID",
                body: `Ranked #2 on PruittHealth's grid with ${formatNumber(parseEngagement(gunnerPost))} engagements, plus a second placement on @gstockton14's feed (111K followers).`,
                tone: 'muted' as const,
              },
            },
          ].map(({ n, label, sub, post, thumb, views, callout }) => {
            const eng = parseEngagement(post);
            return (
              <a
                key={post.post_url}
                href={post.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block ${GLASS_BASE} rounded-[4px] transition hover:-translate-y-0.5`}
              >
                <GlassSheen />
                <div className="relative border-b border-[rgba(245,241,232,0.12)] bg-[#0a0a0a] px-4 py-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f5f1e8]">
                    <span className="text-[#c9a14a]">{n}.</span> {label}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#f5f1e8]/55">
                    {sub}
                  </p>
                </div>
                <div className={`grid ${n === '1' ? 'grid-cols-[44%_1fr]' : 'grid-cols-[42%_1fr]'}`}>
                  <div className="aspect-[3/4] overflow-hidden bg-black/30">
                    <img
                      src={thumb}
                      alt={label}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className={`flex flex-col justify-between ${n === '1' ? 'p-7' : 'p-5'}`}>
                    <div>
                      <p className="text-[11px] font-medium italic text-[#f5f1e8]/65">Post ID: {post.shortcode}</p>
                      <p className="text-[11px] italic text-[#f5f1e8]/45">{formatDateLabel(post.date_utc)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/55">
                        Total Engagement
                      </p>
                      <p className={`mt-1 font-black leading-none tracking-tight text-[#f5f1e8] ${n === '1' ? 'text-[56px]' : 'text-[40px]'}`}>
                        {formatNumber(eng)}
                      </p>
                      <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-3 text-[12px] text-[#f5f1e8]/75">
                        <span className="flex items-center gap-1.5" title="Views">
                          <Eye className="h-3.5 w-3.5 text-[#f5f1e8]/55" />
                          <span className="font-semibold tabular-nums">{formatNumber(views)}</span>
                        </span>
                        <span className="flex items-center gap-1.5" title="Likes">
                          <Heart className="h-3.5 w-3.5 text-[#f5f1e8]/55" />
                          <span className="font-semibold tabular-nums">{formatNumber(Number(post.likes))}</span>
                        </span>
                        <span className="flex items-center gap-1.5" title="Comments">
                          <MessageCircle className="h-3.5 w-3.5 text-[#f5f1e8]/55" />
                          <span className="font-semibold tabular-nums">{formatNumber(Number(post.comments))}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`relative min-h-[72px] border-t border-white/10 px-5 py-4 ${
                    callout.tone === 'primary'
                      ? 'bg-[#c9a14a]/15 text-[#f3d77a]'
                      : 'bg-white/[0.06] text-[#f5f1e8]/75'
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em]">
                    {callout.headline}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[#f5f1e8]/70">{callout.body}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* VISUAL READ */}
      <div className="mx-auto max-w-[1100px] px-8 py-16 lg:px-10">
        <SectionHeader
          n="02"
          title="Visual Read"
          right={
            <div className="flex items-center gap-2 pb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9a14a]/60" />
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#f5f1e8]/55">
                Powered by JABA AI
              </p>
            </div>
          }
        />

        <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          {visualReads.map((vr, idx) => (
            <div key={vr.label} className={`${GLASS_BASE} flex h-full flex-col rounded-[4px] p-5`}>
              <GlassSheen />
              <div className="relative flex items-baseline justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f5f1e8]">
                  <span className="text-[#c9a14a]">{idx + 1}.</span> {vr.label}
                </p>
                <p className="whitespace-nowrap text-[10px] uppercase tracking-wider text-[#f5f1e8]/55">
                  {vr.runtime}s
                </p>
              </div>

              <div className="mt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/55">
                  Subjects detected
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {vr.subjects.map((s) => (
                    <span
                      key={s.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] text-[#f5f1e8]/85"
                    >
                      {s.label}
                      <span className="text-[10px] tabular-nums text-[#f5f1e8]/50">{s.score}%</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/55">
                  Logos
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {vr.logos.map((l) => (
                    <span
                      key={l.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a14a]/25 bg-[#c9a14a]/15 px-2 py-0.5 text-[11px] font-medium text-[#f3d77a]"
                    >
                      {l.label}
                      <span className="text-[10px] tabular-nums text-[#f3d77a]/65">{l.score}%</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/55">
                  Text detected (OCR)
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {vr.text.map((t) => (
                    <span
                      key={t}
                      className="rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-[#f5f1e8]/80"
                    >
                      "{t}"
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/55">
                    Composition
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#f5f1e8]/80">
                    {vr.composition}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/55">
                    Scene breakdown
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#f5f1e8]/80">
                    {vr.scenes}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/55">
                  Dominant colors
                </p>
                <div className="mt-1.5 flex gap-4">
                  {vr.colors.map((c) => (
                    <div key={c.hex} className="flex flex-col items-center gap-1.5">
                      <div
                        className="h-6 w-6 rounded-[2px] border border-[#c9a14a]/60"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[8px] font-bold uppercase tracking-[0.14em] tabular-nums text-[#f5f1e8]/55">{c.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP 10 + TAKEAWAY */}
      <div className="mx-auto max-w-[1100px] px-8 py-12 lg:px-10">
        <SectionHeader n="03" title="Top 10 Posts · Benchmark Window" />
        <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-[#f5f1e8]/55">
          @pruitthealth · last {totalPosts} grid posts
        </p>

        <div className={`mt-5 ${GLASS_BASE} rounded-[4px]`}>
          <GlassSheen />
          {/* Column headers */}
          <div className="relative grid grid-cols-[60px_72px_1fr_120px_100px_88px] items-center gap-4 border-b border-white/10 bg-black/25 px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#f5f1e8]/55">
            <span>Rank</span>
            <span />
            <span>Caption</span>
            <span>Type</span>
            <span>Date</span>
            <span className="text-right">Engagement</span>
          </div>
          {topTen.top.map((d, i) => {
            const type = postTypeLabel(d.post);
            const typeLabel = d.isCollab
              ? `Collab · ${type}`
              : d.isPaidPartnership
                ? `Collab · ${type}`
                : type;
            const caption = d.isCollab
              ? 'From the field to our communities, teamwork is everything 🤝 Proud to partner with organiz…'
              : truncateCaption(d.post.caption);
            const isHighlight = d.isCollab || d.isPaidPartnership;
            const localThumb = d.isCollab
              ? `${import.meta.env.BASE_URL}esm/thumb-collab.jpg`
              : d.isPaidPartnership
                ? `${import.meta.env.BASE_URL}esm/thumb-paid.jpg`
                : undefined;
            return (
              <div
                key={`${d.post.shortcode}-${i}`}
                className={`grid min-h-[72px] grid-cols-[60px_72px_1fr_120px_100px_88px] items-center gap-4 px-5 py-3 ${
                  i === 0 ? '' : 'border-t border-white/8'
                } ${isHighlight ? 'bg-[#c9a14a]/12' : ''}`}
              >
                <span
                  className={`text-[14px] font-black tabular-nums ${
                    d.isCollab ? 'text-[#c9a14a]' : 'text-[#f5f1e8]/50'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <PostThumb src={localThumb} fallbackLabel={type === 'IMAGE' ? 'IMG' : type} />
                <p
                  className={`line-clamp-2 text-[12.5px] leading-snug ${
                    d.isCollab ? 'font-medium text-[#f5f1e8]' : 'text-[#f5f1e8]/80'
                  }`}
                >
                  {caption ?? <span className="text-[#f5f1e8]/30">No caption</span>}
                </p>
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                    d.isCollab ? 'text-[#f3d77a]' : 'text-[#f5f1e8]/55'
                  }`}
                >
                  {typeLabel}
                </span>
                <span className="text-[11px] italic text-[#f5f1e8]/45">
                  {new Date(d.post.date_utc).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span
                  className={`text-right tabular-nums ${
                    d.isCollab ? 'text-[18px] font-black text-[#f5f1e8]' : 'text-[14px] font-bold text-[#f5f1e8]/85'
                  }`}
                >
                  {formatNumber(d.eng)}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-[12px] italic text-[#f5f1e8]/50">
          Posts ranked #11–{totalPosts} averaged {avgBenchmarkEngagement} engagements.
        </p>

      </div>

      {/* WHAT THIS SUGGESTS — condensed-caps statement with gold-foil proper nouns */}
      <div className="mx-auto max-w-[1100px] px-8 py-28 lg:px-10">
        <div className="ml-0 max-w-[900px] lg:ml-16">
          <p className="font-display font-black text-[#f5f1e8]"
            style={{ fontSize: 'clamp(32px,4vw,56px)', lineHeight: 1.05, maxWidth: '18ch', letterSpacing: '-0.01em' }}>
            The <GoldFoil>Collab</GoldFoil> + <GoldFoil>Paid Partnership</GoldFoil> combination
            delivered the top two engagement spots on <GoldFoil>PruittHealth</GoldFoil>'s grid,
            plus two touchpoints to <GoldFoil>Gunner</GoldFoil>'s <GoldFoil>111K</GoldFoil> followers
            and a reach extension to <GoldFoil>Drew Bobo</GoldFoil>'s <GoldFoil>11.6K</GoldFoil> via the <GoldFoil>Collab</GoldFoil>.
          </p>
        </div>
      </div>

      {/* WHY IT MATTERS — numerals as the section identifier, no header */}
      <div className="mx-auto max-w-[1100px] px-8 pb-32 pt-20 lg:px-10">
        <div className="grid gap-12 md:grid-cols-3">
          {[
            {
              n: '01',
              title: 'One post, three feeds',
              body: (
                <>
                  The Collab format placed the campaign on{' '}
                  <strong className="font-semibold text-[#f5f1e8]">@_drewbobo</strong>,{' '}
                  <strong className="font-semibold text-[#f5f1e8]">@gstockton14</strong>, and{' '}
                  <strong className="font-semibold text-[#f5f1e8]">@pruitthealth</strong> simultaneously:
                  three audiences from a single piece of content.
                </>
              ),
            },
            {
              n: '02',
              title: 'A clear gap from the baseline',
              body: (
                <>
                  PruittHealth's prior{' '}
                  <strong className="font-semibold text-[#f5f1e8]">{comparablePosts}</strong> grid posts
                  averaged{' '}
                  <strong className="font-semibold text-[#f5f1e8]">{avgBenchmarkEngagement} engagements</strong>.
                  The collab cleared{' '}
                  <strong className="font-semibold text-[#f5f1e8]">{formatNumber(collabEngagement)}</strong>,{' '}
                  <strong className="font-semibold text-[#f5f1e8]">93×</strong> the baseline.
                </>
              ),
            },
            {
              n: '03',
              title: 'Two posts, top two ranks',
              body: (
                <>
                  Gunner's paid partnership ranked{' '}
                  <strong className="font-semibold text-[#f5f1e8]">#2</strong> on PruittHealth's grid with{' '}
                  <strong className="font-semibold text-[#f5f1e8]">
                    {formatNumber(parseEngagement(gunnerPost))} engagements
                  </strong>
                  , and reached his{' '}
                  <strong className="font-semibold text-[#f5f1e8]">111K followers</strong> on{' '}
                  <strong className="font-semibold text-[#f5f1e8]">@gstockton14</strong> as a second
                  touchpoint.
                </>
              ),
            },
          ].map(({ n, title, body }) => (
            <div key={n}>
              {/* Gold-foil numeral at 120px */}
              <p className="font-display text-[120px] font-black leading-[0.85] tracking-[-0.04em]" style={{
                background: 'linear-gradient(180deg, #f3d77a 0%, #c9a14a 45%, #8a6a25 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
              }}>
                {n}
              </p>
              {/* 1px gold hairline rule below each numeral */}
              <div className="h-px bg-[#c9a14a]/60" />
              <p className="mt-5 font-display text-[15px] font-black uppercase tracking-[0.08em] text-[#f5f1e8]">
                {title}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#f5f1e8]/70">{body}</p>
            </div>
          ))}
        </div>
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
