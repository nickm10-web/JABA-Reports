import { useEffect, useMemo, useState } from 'react';
import { Heart, MessageCircle, Trophy, Users } from 'lucide-react';

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
      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-slate-100 text-[9px] font-bold uppercase tracking-wider text-slate-400">
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

    return {
      gunnerPost,
      collabPost,
      collabEngagement,
      avgBenchmarkEngagement,
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
      label: 'GUNNER STOCKTON SUPPORT POST',
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
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* HERO */}
      <div className="bg-[#0A0A0A] text-white">
        <div className="mx-auto max-w-[1100px] px-8 pb-12 pt-8 lg:px-10">
          <div className="flex items-start justify-between gap-6">
            <img
              src={`${import.meta.env.BASE_URL}esm/esm-white-gold.avif`}
              alt="ESM"
              className="h-12 w-auto object-contain"
            />
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                Campaign Intelligence Report
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/65">
                {reportMonth}
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C9A35E]">
                2-Post Campaign · 3 Handles · Collab + Paid Partnership
              </p>
              <h1 className="mt-3 text-[44px] font-black uppercase leading-[0.95] tracking-[-0.01em] text-white sm:text-[56px]">
                Partnership
                <br />
                Performance Report
              </h1>
              <div className="mt-4 h-[3px] w-20 bg-[#C9A35E]" />
              <p className="mt-5 max-w-xl text-[12px] leading-relaxed tracking-wide text-white/70">
                A 2-post campaign for Gunner Stockton, distributed across @_drewbobo, @gstockton14, and @pruitthealth via a Collab post and a paid partnership. Benchmarked against PruittHealth's {totalPosts} most recent grid posts.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 lg:items-end">
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-center">
                  <div className="flex h-[88px] items-center justify-center rounded-2xl border-[2px] border-[#C9A35E] bg-white px-5">
                    <img
                      src={`${import.meta.env.BASE_URL}pruitt/pruitthealth-logo.png`}
                      alt="PruittHealth"
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    PruittHealth
                  </p>
                </div>
                <div className="-mt-6 h-12 w-px bg-[#C9A35E]" aria-hidden />
                <div className="flex flex-col items-center">
                  <div className="h-[88px] w-[88px] overflow-hidden rounded-full border-[2px] border-[#C9A35E] bg-black">
                    <img
                      src={`${import.meta.env.BASE_URL}esm/gunner.png`}
                      alt="Gunner Stockton"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    Gunner Stockton
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="mx-auto max-w-[1100px] px-8 py-10 lg:px-10">
        <div className="grid items-start gap-x-10 gap-y-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="border-l-4 border-[#C9A35E] pl-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
              PruittHealth Post Rank
            </p>
            <p className="mt-2 text-[88px] font-black leading-none tracking-[-0.04em] text-[#0A0A0A]">
              #{data.brand_benchmark_summary.rank}
            </p>
            <p className="mt-3 text-[13px] text-slate-600">of {totalPosts} PruittHealth posts</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
              vs. Brand Average
            </p>
            <p className="mt-2 text-[28px] font-black leading-none tracking-tight text-slate-950">
              93<span className="text-[#C9A35E]">x</span>
            </p>
            <p className="mt-2 text-[11px] text-slate-500">PruittHealth's other {comparablePosts} grid posts averaged {avgBenchmarkEngagement} engagements</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
              Collab Engagement
            </p>
            <p className="mt-2 text-[28px] font-black leading-none tracking-tight text-slate-950">
              {formatNumber(collabEngagement)}
            </p>
            <p className="mt-2 text-[11px] text-slate-500">
              {formatNumber(Number(collabPost.likes))} likes · {formatNumber(Number(collabPost.comments))} comments
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto h-px max-w-[1100px] bg-slate-200" />

      {/* CAMPAIGN POSTS */}
      <div className="mx-auto max-w-[1100px] px-8 py-10 lg:px-10">
        <h2 className="text-[22px] font-black uppercase tracking-tight text-slate-950">
          The Campaign Posts
        </h2>
        <div className="mt-3 h-[3px] w-12 bg-[#C9A35E]" />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {[
            {
              n: '1',
              label: 'Collab Post · Gunner Stockton × PruittHealth',
              sub: 'Hosted on @_drewbobo · Distributed across 3 accounts',
              post: collabPost,
              callout: {
                icon: <Trophy className="h-4 w-4" />,
                headline: `RANKED #1 OF ${totalPosts} PRUITTHEALTH POSTS`,
                body: 'Outperformed every other PruittHealth post in the benchmark.',
                tone: 'primary' as const,
              },
            },
            {
              n: '2',
              label: 'Paid Partnership · Gunner Stockton',
              sub: 'Posted on @gstockton14 · 111K followers',
              post: gunnerPost,
              callout: {
                icon: <Users className="h-4 w-4" />,
                headline: 'REACHED A SECOND AUDIENCE',
                body: `Added ${formatNumber(parseEngagement(gunnerPost))} engagements on Gunner's own page, a different follower base than PruittHealth's.`,
                tone: 'muted' as const,
              },
            },
          ].map(({ n, label, sub, post, callout }) => {
            const eng = parseEngagement(post);
            return (
              <a
                key={post.post_url}
                href={post.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-md border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
              >
                <div className="bg-[#0A0A0A] px-4 py-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                    <span className="text-[#C9A35E]">{n}.</span> {label}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/55">
                    {sub}
                  </p>
                </div>
                <div className="grid grid-cols-[42%_1fr]">
                  <div className="aspect-[3/4] overflow-hidden bg-slate-100">
                    <img
                      src={post.thumbnail_url}
                      alt={label}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex flex-col justify-between p-5">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-900">Post ID: {post.shortcode}</p>
                      <p className="text-[11px] text-slate-500">{formatDateLabel(post.date_utc)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Total Engagement
                      </p>
                      <p className="mt-1 text-[44px] font-black leading-none tracking-tight text-slate-950">
                        {formatNumber(eng)}
                      </p>
                      <div className="mt-4 flex items-center gap-4 border-t border-slate-200 pt-3 text-[12px] text-slate-700">
                        <span className="flex items-center gap-1.5" title="Likes">
                          <Heart className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-semibold tabular-nums">{formatNumber(Number(post.likes))}</span>
                        </span>
                        <span className="flex items-center gap-1.5" title="Comments">
                          <MessageCircle className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-semibold tabular-nums">{formatNumber(Number(post.comments))}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex min-h-[72px] items-center gap-3 px-4 py-3 ${
                    callout.tone === 'primary'
                      ? 'bg-[#F5EDD7] text-[#7A5A1F]'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      callout.tone === 'primary' ? 'bg-[#0A0A0A] text-[#C9A35E]' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {callout.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em]">
                      {callout.headline}
                    </p>
                    <p className="text-[11px] leading-snug text-slate-700">{callout.body}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* VISUAL READ */}
      <div className="mx-auto max-w-[1100px] px-8 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[22px] font-black uppercase tracking-tight text-slate-950">
            Visual Read
          </h2>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A35E]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Powered by JABA AI
            </p>
          </div>
        </div>
        <div className="mt-3 h-[3px] w-12 bg-[#C9A35E]" />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {visualReads.map((vr, idx) => (
            <div key={vr.label} className="flex h-full flex-col rounded-md border border-slate-200 bg-white p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900">
                  <span className="text-[#C9A35E]">{idx + 1}.</span> {vr.label}
                </p>
                <p className="whitespace-nowrap text-[10px] uppercase tracking-wider text-slate-500">
                  {vr.runtime}s
                </p>
              </div>

              <div className="mt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Subjects detected
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {vr.subjects.map((s) => (
                    <span
                      key={s.label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
                    >
                      {s.label}
                      <span className="text-[10px] tabular-nums text-slate-400">{s.score}%</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Logos
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {vr.logos.map((l) => (
                    <span
                      key={l.label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#F5EDD7] px-2 py-0.5 text-[11px] font-medium text-[#7A5A1F]"
                    >
                      {l.label}
                      <span className="text-[10px] tabular-nums text-[#7A5A1F]/60">{l.score}%</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Text detected (OCR)
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {vr.text.map((t) => (
                    <span
                      key={t}
                      className="rounded-sm border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-700"
                    >
                      "{t}"
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Composition
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-700">
                    {vr.composition}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Scene breakdown
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-700">
                    {vr.scenes}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Dominant colors
                </p>
                <div className="mt-1.5 flex gap-3">
                  {vr.colors.map((c) => (
                    <div key={c.hex} className="flex flex-col items-center gap-1">
                      <div
                        className="h-7 w-7 rounded-sm border border-slate-200"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[9px] tabular-nums text-slate-500">{c.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP 10 + TAKEAWAY */}
      <div className="mx-auto max-w-[1100px] px-8 py-2 lg:px-10">
        <h2 className="text-[22px] font-black uppercase tracking-tight text-slate-950">
          Top 10 Posts · Benchmark Window
        </h2>
        <div className="mt-3 h-[3px] w-12 bg-[#C9A35E]" />
        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
          @pruitthealth · last {totalPosts} grid posts
        </p>

        <div className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-white">
          {/* Column headers */}
          <div className="grid grid-cols-[60px_72px_1fr_120px_100px_88px] items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
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
            return (
              <div
                key={`${d.post.shortcode}-${i}`}
                className={`grid min-h-[72px] grid-cols-[60px_72px_1fr_120px_100px_88px] items-center gap-4 px-5 py-3 ${
                  d.isCollab ? 'bg-[#F1E8D2]' : i === 0 ? '' : 'border-t border-slate-100'
                }`}
              >
                <span
                  className={`text-[14px] font-black tabular-nums ${
                    d.isCollab ? 'text-[#C9A35E]' : 'text-slate-400'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <PostThumb src={d.post.thumbnail_url} fallbackLabel={type === 'IMAGE' ? 'IMG' : type} />
                <p
                  className={`line-clamp-2 text-[12.5px] leading-snug ${
                    d.isCollab ? 'font-medium text-slate-900' : 'text-slate-700'
                  }`}
                >
                  {caption ?? <span className="text-slate-300">No caption</span>}
                </p>
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                    d.isCollab ? 'text-[#7A5A1F]' : 'text-slate-500'
                  }`}
                >
                  {typeLabel}
                </span>
                <span className="text-[11px] text-slate-500">
                  {new Date(d.post.date_utc).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span
                  className={`text-right tabular-nums ${
                    d.isCollab ? 'text-[18px] font-black text-slate-950' : 'text-[14px] font-bold text-slate-700'
                  }`}
                >
                  {formatNumber(d.eng)}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-[11px] uppercase tracking-[0.14em] text-slate-500">
          Posts ranked #11–{totalPosts} averaged {avgBenchmarkEngagement} engagements.
        </p>

        <div className="mt-10">
          <h2 className="text-[22px] font-black uppercase tracking-tight text-slate-950">
            What This Suggests
          </h2>
          <div className="mt-3 h-[3px] w-12 bg-[#C9A35E]" />
          <div className="mt-5 rounded-md border border-[#E5DCC0] bg-[#F1E8D2] p-7">
            <p className="text-[12.5px] leading-relaxed text-slate-700">
              The Collab + Paid Partnership combination delivered both volume (on the brand grid) and audience extension (on the athlete's account). Worth testing this two-post structure as a repeatable pattern for future PruittHealth athlete activations.
            </p>
          </div>
        </div>
      </div>

      {/* WHY IT MATTERS */}
      <div className="mx-auto max-w-[1100px] px-8 py-10 lg:px-10">
        <h2 className="text-[22px] font-black uppercase tracking-tight text-slate-950">
          Why It Matters
        </h2>
        <div className="mt-3 h-[3px] w-12 bg-[#C9A35E]" />
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {[
            {
              n: '01',
              title: 'One post, three feeds',
              body:
                'The Collab format placed the campaign on @_drewbobo, @gstockton14, and @pruitthealth simultaneously: three audiences from a single piece of content.',
            },
            {
              n: '02',
              title: 'A clear gap from the baseline',
              body: `PruittHealth's prior ${comparablePosts} grid posts averaged ${avgBenchmarkEngagement} engagements. The collab cleared ${formatNumber(collabEngagement)}, 93× the baseline.`,
            },
            {
              n: '03',
              title: 'A second touchpoint from Gunner',
              body: `Gunner's paid partnership post added ${formatNumber(parseEngagement(gunnerPost))} engagements on @gstockton14, reaching his 111K followers as a follow-up to the collab.`,
            },
          ].map(({ n, title, body }) => (
            <div key={n} className="border-t border-slate-200 pt-5">
              <p className="text-[28px] font-black tracking-tight text-[#C9A35E]">{n}</p>
              <p className="mt-3 text-[13px] font-bold uppercase tracking-[0.08em] text-slate-950">
                {title}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-[#0A0A0A] text-white">
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
