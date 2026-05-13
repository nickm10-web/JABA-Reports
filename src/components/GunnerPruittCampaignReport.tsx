import { useEffect, useMemo, useState } from 'react';
import { Eye, Heart, MessageCircle } from 'lucide-react';

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
  'rounded-[24px] border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04),0_14px_40px_rgba(15,23,42,0.06)]';

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
      <div className="flex h-14 w-14 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-[9px] font-bold uppercase tracking-wider text-white/55 backdrop-blur-sm">
        {fallbackLabel}
      </div>
    );
  }
  return (
    <img
      src={src}
      onError={() => setErrored(true)}
      className="h-14 w-14 rounded-md object-cover"
      alt=""
    />
  );
}

// Liquid glass treatment — applied as a className token.
// Includes: subtle fill, strong top + right inset highlights, soft drop, crisp backdrop blur.
const GLASS_BASE =
  'relative overflow-hidden border border-white/[0.18] bg-white/[0.045] backdrop-blur-[28px] ' +
  'shadow-[0_22px_55px_-14px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.32),inset_-1px_0_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(255,255,255,0.04)]';

// Diagonal specular sheen — drop in as the first child of a glass panel.
function GlassSheen() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          'linear-gradient(118deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.05) 100%)',
      }}
    />
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
      <div className="min-h-screen bg-[#F4F6F8] p-8 text-slate-900">
        <div className={`${shell} mx-auto max-w-3xl p-8`}>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-red-600">Load Error</p>
          <p className="mt-3 text-lg text-slate-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || !derived) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] p-8">
        <div className={`${shell} mx-auto max-w-5xl p-8`}>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Loading</p>
          <p className="mt-3 text-lg text-slate-700">Preparing Gunner Stockton × PruittHealth report…</p>
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
    <div className="relative min-h-screen overflow-x-hidden text-white">
      {/* Fixed photo backdrop spanning the whole report */}
      <div className="fixed inset-0 -z-10">
        <img
          src={`${import.meta.env.BASE_URL}esm/gunner-bg.png`}
          alt=""
          aria-hidden
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-black/75" />
      </div>

      {/* HERO + KPI */}
      <div className="text-white">

        <div className="mx-auto max-w-[1100px] px-8 pb-20 pt-8 lg:px-10">
          {/* Top bar — sits directly over photo, no panel */}
          <div className="flex items-start justify-between gap-6">
            <img
              src={`${import.meta.env.BASE_URL}esm/esm-white-gold.avif`}
              alt="ESM"
              className="h-12 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
            />
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
                Campaign Intelligence Report
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/75 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
                {reportMonth}
              </p>
            </div>
          </div>

          {/* Hero glass panel */}
          <div className={`mt-10 ${GLASS_BASE} rounded-[28px] overflow-hidden`}>
            <GlassSheen />
            <div className="relative grid lg:grid-cols-[55%_45%] lg:items-stretch">
              {/* Left: text column with red gradient framing */}
              <div className="relative p-8 lg:p-10">
                {/* Red gradient that frames the entire left column */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-l-[28px]"
                  style={{ background: 'linear-gradient(105deg, rgba(180,20,20,0.38) 0%, rgba(140,15,15,0.18) 55%, transparent 100%)' }}
                  aria-hidden
                />
                <div className="relative">
                  {/* Top-left identification lockup: brand logo × athlete headshot */}
                  <div className="mb-5 flex items-center gap-2.5">
                    <img
                      src={`${import.meta.env.BASE_URL}pruitt/pruitthealth-logo.png`}
                      alt="PruittHealth"
                      className="h-8 w-auto object-contain"
                      style={{ maxWidth: '110px', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.85)) brightness(0) invert(1)' }}
                    />
                    <span className="text-[13px] font-light text-white/35 leading-none select-none">×</span>
                    <div className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-white/20">
                      <img
                        src={`${import.meta.env.BASE_URL}esm/gunner.png`}
                        alt="Gunner Stockton"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Primary eyebrow: partnership name */}
                  <p className="text-[13px] font-black uppercase tracking-[0.18em] text-[#C9A35E]">
                    Gunner Stockton ×&thinsp;PruittHealth
                  </p>
                  <h1 className="mt-3 text-[44px] font-black uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-[56px]">
                    Partnership
                    <br />
                    Performance Report
                  </h1>
                  <div className="mt-4 h-px w-20 bg-white/30" />
                  <p className="mt-4 text-[11px] leading-relaxed tracking-wide text-white/65">
                    Benchmarked against PruittHealth's {totalPosts} most recent grid posts.
                  </p>
                  {/* In partnership with — logo mark */}
                  <div className="mt-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      In Partnership With
                    </p>
                    <div className="mt-2 inline-flex items-center rounded-md bg-white/[0.08] px-3 py-1.5 backdrop-blur-sm">
                      <img
                        src={`${import.meta.env.BASE_URL}pruitt/pruitthealth-logo.png`}
                        alt="PruittHealth"
                        className="h-6 w-auto object-contain"
                        style={{ maxWidth: '130px', filter: 'brightness(0) invert(1) opacity(0.85)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: collab post image, full height, bleeds to edge */}
              <div className="relative hidden lg:block">
                {/* Dark gradient blending left edge into text column */}
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24"
                  style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, transparent 100%)' }}
                  aria-hidden
                />
                <img
                  src={`${import.meta.env.BASE_URL}esm/thumb-paid.jpg`}
                  alt="Paid partnership post — Gunner Stockton"
                  className="h-full w-full object-cover"
                  style={{ minHeight: '240px' }}
                />
              </div>
            </div>
          </div>

          {/* KPI glass cards */}
          <div className="mt-12 grid items-start gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
            <div className={`${GLASS_BASE} rounded-[20px] p-6`}>
              <GlassSheen />
              <div className="relative border-l-4 border-[#C9A35E] pl-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                  PruittHealth Post Rank
                </p>
                <p className="mt-2 text-[88px] font-black leading-none tracking-[-0.04em] text-white">
                  #{data.brand_benchmark_summary.rank}
                </p>
                <p className="mt-2 text-[12px] text-white/75">of {totalPosts} PruittHealth posts</p>
              </div>
            </div>
            <div className={`${GLASS_BASE} rounded-[20px] p-6`}>
              <GlassSheen />
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                  vs. Brand Average
                </p>
                <p className="mt-2 font-mono text-[28px] font-bold leading-none tracking-tight text-white">
                  93<span className="text-[#C9A35E]">x</span>
                </p>
                <p className="mt-1.5 text-[10px] text-white/70">PruittHealth's other {comparablePosts} grid posts averaged {avgBenchmarkEngagement} engagements</p>
              </div>
            </div>
            <div className={`${GLASS_BASE} rounded-[20px] p-6`}>
              <GlassSheen />
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                  Collab Engagement
                </p>
                <p className="mt-2 text-[28px] font-black leading-none tracking-tight text-white">
                  {formatNumber(collabEngagement)}
                </p>
                <p className="mt-1.5 text-[10px] text-white/70">
                  {formatNumber(Number(collabPost.likes))} likes · {formatNumber(Number(collabPost.comments))} comments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CAMPAIGN POSTS */}
      <div className="mx-auto max-w-[1100px] px-8 py-16 lg:px-10">
        <h2 className="text-[22px] font-black uppercase tracking-tight text-white">
          The Campaign Posts
        </h2>
        <div className="mt-3 h-px w-12 bg-white/30" />

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
                className={`group block ${GLASS_BASE} rounded-2xl transition hover:-translate-y-0.5`}
              >
                <GlassSheen />
                <div className="relative border-b border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur-md">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                    <span className="text-[#C9A35E]">{n}.</span> {label}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/55">
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
                      <p className="text-[11px] font-medium italic text-white/65">Post ID: {post.shortcode}</p>
                      <p className="text-[11px] italic text-white/45">{formatDateLabel(post.date_utc)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
                        Total Engagement
                      </p>
                      <p className={`mt-1 font-black leading-none tracking-tight text-white ${n === '1' ? 'text-[56px]' : 'text-[40px]'}`}>
                        {formatNumber(eng)}
                      </p>
                      <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-3 text-[12px] text-white/75">
                        <span className="flex items-center gap-1.5" title="Views">
                          <Eye className="h-3.5 w-3.5 text-white/55" />
                          <span className="font-semibold tabular-nums">{formatNumber(views)}</span>
                        </span>
                        <span className="flex items-center gap-1.5" title="Likes">
                          <Heart className="h-3.5 w-3.5 text-white/55" />
                          <span className="font-semibold tabular-nums">{formatNumber(Number(post.likes))}</span>
                        </span>
                        <span className="flex items-center gap-1.5" title="Comments">
                          <MessageCircle className="h-3.5 w-3.5 text-white/55" />
                          <span className="font-semibold tabular-nums">{formatNumber(Number(post.comments))}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`relative min-h-[72px] border-t border-white/10 px-5 py-4 ${
                    callout.tone === 'primary'
                      ? 'bg-[#C9A35E]/15 text-[#E8C988]'
                      : 'bg-white/[0.06] text-white/75'
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em]">
                    {callout.headline}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-white/70">{callout.body}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* VISUAL READ */}
      <div className="mx-auto max-w-[1100px] px-8 py-16 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[22px] font-black uppercase tracking-tight text-white">
            Visual Read
          </h2>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/65">
              Powered by JABA AI
            </p>
          </div>
        </div>
        <div className="mt-3 h-px w-12 bg-white/30" />

        <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          {visualReads.map((vr, idx) => (
            <div key={vr.label} className={`${GLASS_BASE} flex h-full flex-col rounded-2xl p-5`}>
              <GlassSheen />
              <div className="relative flex items-baseline justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                  <span className="text-[#C9A35E]">{idx + 1}.</span> {vr.label}
                </p>
                <p className="whitespace-nowrap text-[10px] uppercase tracking-wider text-white/55">
                  {vr.runtime}s
                </p>
              </div>

              <div className="mt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
                  Subjects detected
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {vr.subjects.map((s) => (
                    <span
                      key={s.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] text-white/85"
                    >
                      {s.label}
                      <span className="text-[10px] tabular-nums text-white/50">{s.score}%</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
                  Logos
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {vr.logos.map((l) => (
                    <span
                      key={l.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A35E]/25 bg-[#C9A35E]/15 px-2 py-0.5 text-[11px] font-medium text-[#E8C988]"
                    >
                      {l.label}
                      <span className="text-[10px] tabular-nums text-[#E8C988]/65">{l.score}%</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
                  Text detected (OCR)
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {vr.text.map((t) => (
                    <span
                      key={t}
                      className="rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-white/80"
                    >
                      "{t}"
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
                    Composition
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/80">
                    {vr.composition}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
                    Scene breakdown
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/80">
                    {vr.scenes}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
                  Dominant colors
                </p>
                <div className="mt-1.5 flex gap-3">
                  {vr.colors.map((c) => (
                    <div key={c.hex} className="flex flex-col items-center gap-1">
                      <div
                        className="h-7 w-7 rounded-sm border border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[9px] tabular-nums text-white/55">{c.score}%</span>
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
        <h2 className="text-[22px] font-black uppercase tracking-tight text-white">
          Top 10 Posts · Benchmark Window
        </h2>
        <div className="mt-3 h-px w-12 bg-white/30" />
        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/55">
          @pruitthealth · last {totalPosts} grid posts
        </p>

        <div className={`mt-5 ${GLASS_BASE} rounded-2xl`}>
          <GlassSheen />
          {/* Column headers */}
          <div className="relative grid grid-cols-[60px_72px_1fr_120px_100px_88px] items-center gap-4 border-b border-white/10 bg-black/25 px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
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
                ? `Paid · ${type}`
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
                } ${isHighlight ? 'bg-[#C9A35E]/12' : ''}`}
              >
                <span
                  className={`text-[14px] font-black tabular-nums ${
                    d.isCollab ? 'text-[#C9A35E]' : 'text-white/50'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <PostThumb src={localThumb} fallbackLabel={type === 'IMAGE' ? 'IMG' : type} />
                <p
                  className={`line-clamp-2 text-[12.5px] leading-snug ${
                    d.isCollab ? 'font-medium text-white' : 'text-white/80'
                  }`}
                >
                  {caption ?? <span className="text-white/30">No caption</span>}
                </p>
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                    d.isCollab ? 'text-[#E8C988]' : 'text-white/55'
                  }`}
                >
                  {typeLabel}
                </span>
                <span className="text-[11px] italic text-white/45">
                  {new Date(d.post.date_utc).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span
                  className={`text-right tabular-nums ${
                    d.isCollab ? 'text-[18px] font-black text-white' : 'text-[14px] font-bold text-white/85'
                  }`}
                >
                  {formatNumber(d.eng)}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-[12px] italic text-white/50">
          Posts ranked #11–{totalPosts} averaged {avgBenchmarkEngagement} engagements.
        </p>

      </div>

      {/* WHAT THIS SUGGESTS — pull quote treatment, indented for editorial weight */}
      <div className="mx-auto max-w-[1100px] px-8 py-28 lg:px-10">
        <div className="ml-0 max-w-[860px] lg:ml-24">
          <div className="h-px w-12 bg-white/30" />
          <p className="mt-8 font-serif text-[36px] font-normal leading-[1.22] tracking-tight text-white sm:text-[44px]">
            The Collab + Paid Partnership combination delivered the top two engagement spots on PruittHealth's grid, plus two touchpoints to Gunner's 111K followers and a reach extension to Drew Bobo's 11.6K via the Collab. Worth testing this two-post structure as a repeatable pattern for future PruittHealth athlete activations.
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
                  <strong className="font-semibold text-white">@_drewbobo</strong>,{' '}
                  <strong className="font-semibold text-white">@gstockton14</strong>, and{' '}
                  <strong className="font-semibold text-white">@pruitthealth</strong> simultaneously:
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
                  <strong className="font-semibold text-white">{comparablePosts}</strong> grid posts
                  averaged{' '}
                  <strong className="font-semibold text-white">{avgBenchmarkEngagement} engagements</strong>.
                  The collab cleared{' '}
                  <strong className="font-semibold text-white">{formatNumber(collabEngagement)}</strong>,{' '}
                  <strong className="font-semibold text-white">93×</strong> the baseline.
                </>
              ),
            },
            {
              n: '03',
              title: 'Two posts, top two ranks',
              body: (
                <>
                  Gunner's paid partnership ranked{' '}
                  <strong className="font-semibold text-white">#2</strong> on PruittHealth's grid with{' '}
                  <strong className="font-semibold text-white">
                    {formatNumber(parseEngagement(gunnerPost))} engagements
                  </strong>
                  , and reached his{' '}
                  <strong className="font-semibold text-white">111K followers</strong> on{' '}
                  <strong className="font-semibold text-white">@gstockton14</strong> as a second
                  touchpoint.
                </>
              ),
            },
          ].map(({ n, title, body }) => (
            <div key={n}>
              <p className="text-[112px] font-black leading-[0.9] tracking-[-0.04em] text-white/25">
                {n}
              </p>
              <p className="mt-5 text-[13px] font-bold uppercase tracking-[0.08em] text-white">
                {title}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/70">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-6 border-t border-white/10 bg-black/55 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-8 py-6 lg:px-10">
          <img
            src={`${import.meta.env.BASE_URL}jaba-logo.png`}
            alt="Jaba"
            className="h-12 w-auto object-contain"
          />
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
            @jaba
            <span className="mx-2 text-white/30">·</span>
            <span className="text-white/55">jaba.ai</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default GunnerPruittCampaignReport;
