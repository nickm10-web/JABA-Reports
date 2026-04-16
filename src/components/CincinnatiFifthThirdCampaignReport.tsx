import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ExternalLink, Eye, Heart, MessageCircle } from 'lucide-react';
import { CINCINNATI } from '../data/schoolConfig';
import {
  CincinnatiFifthThirdCampaignData,
  ComparisonRow,
  HeroActivation,
  BenchmarkSummary,
  loadCincinnatiFifthThirdCampaign,
} from '../data/cincinnatiFifthThirdCampaign';

interface CincinnatiFifthThirdCampaignReportProps {
  onBack?: () => void;
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

function formatCompact(value: number): string {
  const rounded = Math.round(value);
  if (rounded >= 1000000) return `${(rounded / 1000000).toFixed(1)}M`;
  if (rounded >= 1000) return `${(rounded / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${rounded}`;
}

function formatLift(value: number): string {
  const rounded = Number.isFinite(value) ? value : 0;
  return `${rounded >= 0 ? '+' : ''}${rounded.toFixed(1)}%`;
}

function formatSport(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

type ComparisonMetric = 'likes' | 'comments';

const BENCHMARK_METRICS: Array<{ key: ComparisonMetric; label: string }> = [
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comments' },
];

function FifthThirdBadge({ logoUrl }: { logoUrl?: string }) {
  return (
    <div className="w-12 h-12 rounded-2xl bg-white p-2 flex items-center justify-center overflow-hidden shadow-sm">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Fifth Third Bank"
          className="w-full h-full object-contain"
          onError={(event) => {
            const img = event.currentTarget;
            img.style.display = 'none';
            const parent = img.parentElement;
            if (parent) {
              parent.className = 'w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center text-[8px] font-black tracking-wide text-center leading-tight px-1.5 shadow-sm';
              parent.textContent = 'FIFTH THIRD';
            }
          }}
        />
      ) : (
        <div className="w-full h-full rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center text-[8px] font-black tracking-wide text-center leading-tight px-1.5">
          FIFTH THIRD
        </div>
      )}
    </div>
  );
}

function HeroSupportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.075] px-4 py-3 ring-1 ring-white/10">
      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/45">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function HeroSnapshot({
  posts,
  likes,
  comments,
  views,
}: {
  posts: string;
  likes: string;
  comments: string;
  views: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl lg:mt-10">
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            'linear-gradient(150deg, rgba(255,255,255,0.32), transparent 54%)',
        }}
      />
      <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">Campaign Snapshot</p>
        <div className="mt-5 rounded-[1.5rem] bg-black/[0.18] p-5 ring-1 ring-white/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">Views</p>
          <p className="mt-1 text-5xl font-black leading-none tracking-tight text-white sm:text-6xl">{views}</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <HeroSupportStat label="Posts" value={posts} />
          <HeroSupportStat label="Likes" value={likes} />
          <HeroSupportStat label="Comments" value={comments} />
        </div>
      </div>
    </div>
  );
}

function FeaturedAthletePill({
  name,
  sport,
  imageUrl,
}: {
  name: string;
  sport: string;
  imageUrl?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="h-14 w-14 rounded-full object-cover ring-2 ring-white/25" />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-sm font-black text-white">
          {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
        </div>
      )}
      <div>
        <p className="text-lg font-black text-white">{name}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">{formatSport(sport)}</p>
      </div>
    </div>
  );
}

function FeaturedAthletesPanel({
  athletes,
}: {
  athletes: Array<{ name: string; sport: string; imageUrl?: string }>;
}) {
  return (
    <div className="mt-10">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">Featured Athletes</p>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-10">
        {athletes.map((athlete) => (
          <FeaturedAthletePill
            key={athlete.name}
            name={athlete.name}
            sport={athlete.sport}
            imageUrl={athlete.imageUrl}
          />
        ))}
      </div>
    </div>
  );
}

function MetricPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-[11px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function getComparisonMetricValue(row: ComparisonRow, metric: ComparisonMetric): number {
  if (metric === 'likes') return row.likes;
  return row.comments;
}

function formatMetricValue(value: number, metric: ComparisonMetric): string {
  if (metric === 'likes') return formatCompact(value);
  return formatNumber(Math.round(value * 10) / 10);
}

function ActivationCard({ post }: { post: HeroActivation }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="relative h-[30rem] bg-gray-100 sm:h-[36rem]">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.label}
            className="h-full w-full object-cover"
            onError={(event) => {
              const img = event.currentTarget;
              img.style.display = 'none';
              const fallback = img.nextElementSibling as HTMLElement | null;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
        ) : (
          null
        )}
        <div className="hidden h-full w-full items-center justify-center bg-gradient-to-br from-[#2B0A12] via-[#7A1120] to-[#E00122] px-6 text-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">{formatSport(post.sport)}</p>
            <p className="mt-3 text-3xl font-black text-white">{post.athleteName}</p>
            <p className="mt-2 text-sm text-white/80">{post.label}</p>
          </div>
        </div>
        <a
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-800 transition-colors hover:bg-white"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          {post.athleteImageUrl ? (
            <img src={post.athleteImageUrl} alt={post.athleteName} className="h-12 w-12 rounded-full object-cover ring-2 ring-[#E00122]/15" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E00122] text-sm font-black text-white">
              {post.athleteName.split(' ').map((part) => part[0]).join('').slice(0, 2)}
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E00122]">{formatSport(post.sport)}</p>
            <h3 className="text-xl font-black text-gray-950">{post.athleteName}</h3>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">{post.label}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{post.caption}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricPill icon={<Heart className="h-4 w-4" />} label="Likes" value={formatCompact(post.likes)} />
          <MetricPill icon={<MessageCircle className="h-4 w-4" />} label="Comments" value={formatNumber(post.comments)} />
          <MetricPill icon={<Eye className="h-4 w-4" />} label="Views" value={formatCompact(post.views)} />
        </div>

        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date unavailable'}
        </p>
      </div>
    </article>
  );
}

function BenchmarkMetricCard({
  label,
  metric,
  campaignAverage,
  recentAverage,
  lift,
}: {
  label: string;
  metric: ComparisonMetric;
  campaignAverage: number;
  recentAverage: number;
  lift: number;
}) {
  const maxValue = Math.max(campaignAverage, recentAverage, 1);
  const campaignWidth = `${Math.max((campaignAverage / maxValue) * 100, 2)}%`;
  const recentWidth = `${Math.max((recentAverage / maxValue) * 100, 2)}%`;
  const formattedLift = formatLift(lift);

  return (
    <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-gray-950">{formatMetricValue(campaignAverage, metric)}</p>
          <p className="mt-1 text-sm text-gray-500">Campaign Average</p>
        </div>
        <p className={`rounded-full px-3 py-1 text-xs font-black ${lift >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {formattedLift}
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Campaign Average</span>
            <span className="text-[#E00122]">{formatMetricValue(campaignAverage, metric)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-[#E00122]" style={{ width: campaignWidth }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Recent Normal Average</span>
            <span>{formatMetricValue(recentAverage, metric)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gray-300" style={{ width: recentWidth }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DistributionRow({
  label,
  rows,
  metric,
  maxValue,
  color,
}: {
  label: string;
  rows: ComparisonRow[];
  metric: ComparisonMetric;
  maxValue: number;
  color: 'campaign' | 'recent';
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[140px_1fr] sm:items-center">
      <div>
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${color === 'campaign' ? 'text-[#E00122]' : 'text-gray-500'}`}>{label}</p>
        <p className="mt-1 text-xs text-gray-400">{rows.length} posts</p>
      </div>
      <div className="relative h-10 rounded-full bg-gray-50 ring-1 ring-gray-100">
        {rows.map((row, index) => {
          const value = getComparisonMetricValue(row, metric);
          const isHiddenLike = metric === 'likes' && !row.isCurrent && value === 0;
          const left = isHiddenLike ? 0 : (value / maxValue) * 100;
          const titleValue = isHiddenLike ? 'Hidden' : formatMetricValue(value, metric);
          return (
            <span
              key={`${row.id}-${metric}-${index}`}
              title={`${row.dateLabel}: ${titleValue}`}
              className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                color === 'campaign'
                  ? 'bg-[#E00122] shadow-[0_0_0_4px_rgba(224,1,34,0.10)]'
                  : isHiddenLike
                    ? 'border-2 border-gray-300 bg-white'
                    : 'bg-gray-300'
              }`}
              style={{ left: `${Math.min(Math.max(left, 0), 100)}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}

function DistributionBand({
  metric,
  label,
  rows,
  campaignAverage,
  recentAverage,
}: {
  metric: ComparisonMetric;
  label: string;
  rows: ComparisonRow[];
  campaignAverage: number;
  recentAverage: number;
}) {
  const campaignRows = rows.filter((row) => row.isCurrent);
  const recentRows = rows.filter((row) => !row.isCurrent);
  const visibleValues = rows
    .map((row) => getComparisonMetricValue(row, metric))
    .filter((value, index) => !(metric === 'likes' && !rows[index].isCurrent && value === 0));
  const maxValue = Math.max(...visibleValues, campaignAverage, recentAverage, 1);
  const campaignAveragePosition = `${Math.min(Math.max((campaignAverage / maxValue) * 100, 0), 100)}%`;
  const recentAveragePosition = `${Math.min(Math.max((recentAverage / maxValue) * 100, 0), 100)}%`;

  return (
    <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-500">{label} Distribution</p>
          <p className="mt-1 text-sm text-gray-500">Where campaign posts land against recent normal content.</p>
        </div>
        <div className="flex gap-4 text-xs font-semibold text-gray-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#E00122]" />Campaign</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gray-300" />Recent</span>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div className="relative ml-0 sm:ml-[152px]">
          <div className="h-px bg-gray-200" />
          <div className="absolute -top-2 h-4 border-l-2 border-[#E00122]" style={{ left: campaignAveragePosition }} title={`Campaign average: ${formatMetricValue(campaignAverage, metric)}`} />
          <div className="absolute -top-2 h-4 border-l-2 border-gray-400" style={{ left: recentAveragePosition }} title={`Recent normal average: ${formatMetricValue(recentAverage, metric)}`} />
        </div>
        <DistributionRow label="Recent Posts" rows={recentRows} metric={metric} maxValue={maxValue} color="recent" />
        <DistributionRow label="Campaign Posts" rows={campaignRows} metric={metric} maxValue={maxValue} color="campaign" />
      </div>
    </div>
  );
}

function AthleteBenchmarkPanel({
  athleteName,
  sport,
  summary,
  rows,
}: {
  athleteName: string;
  sport: string;
  summary: BenchmarkSummary;
  rows: ComparisonRow[];
}) {
  const campaignPostLabel = `${summary.campaignPostCount} campaign ${summary.campaignPostCount === 1 ? 'post' : 'posts'}`;
  const recentPostLabel = `${summary.populationSize} recent posts benchmarked`;

  return (
    <section className="rounded-[2rem] border border-gray-200 bg-[#FCFCFD] p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E00122]">Athlete Benchmark</p>
          <h2 className="mt-1 text-3xl font-black text-gray-950">{athleteName}</h2>
          <p className="text-sm text-gray-500">{formatSport(sport)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-full bg-[#E00122]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#E00122]">
            {campaignPostLabel}
          </div>
          <div className="rounded-full bg-gray-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
            {recentPostLabel}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <BenchmarkMetricCard
          label="Likes"
          metric="likes"
          campaignAverage={summary.campaignAverageLikes}
          recentAverage={summary.averageLikes}
          lift={summary.liftVsAverageLikes}
        />
        <BenchmarkMetricCard
          label="Comments"
          metric="comments"
          campaignAverage={summary.campaignAverageComments}
          recentAverage={summary.averageComments}
          lift={summary.liftVsAverageComments}
        />
      </div>

      <div className="mt-6 grid gap-4">
        {BENCHMARK_METRICS.map((item) => (
          <DistributionBand
            key={item.key}
            metric={item.key}
            label={item.label}
            rows={rows}
            campaignAverage={item.key === 'likes' ? summary.campaignAverageLikes : summary.campaignAverageComments}
            recentAverage={item.key === 'likes' ? summary.averageLikes : summary.averageComments}
          />
        ))}
      </div>
    </section>
  );
}

export function CincinnatiFifthThirdCampaignReport({ onBack }: CincinnatiFifthThirdCampaignReportProps) {
  const [data, setData] = useState<CincinnatiFifthThirdCampaignData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadCincinnatiFifthThirdCampaign()
      .then((loaded) => {
        if (!cancelled) {
          setData(loaded);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load Cincinnati campaign data.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F8] px-6">
        <div className="max-w-lg rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-rose-600">Unable to load report</p>
          <h1 className="mt-2 text-3xl font-black text-gray-950">Cincinnati x Fifth Third Bank</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F8] px-6">
        <div className="max-w-lg rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#E00122]">Loading content report</p>
          <h1 className="mt-2 text-3xl font-black text-gray-950">Cincinnati x Fifth Third Bank</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">Loading campaign activations and performance benchmarks.</p>
        </div>
      </div>
    );
  }

  const athleteCards = Array.from(
    new Map(
      data.heroActivations.map((post) => [
        post.athleteName,
        { name: post.athleteName, sport: post.sport, imageUrl: post.athleteImageUrl },
      ]),
    ).values(),
  );

  return (
    <div className="min-h-screen bg-[#F7F7F8]">
      <section
        className="relative overflow-hidden border-b border-black/10"
        style={{
          background: 'linear-gradient(135deg, #0D0D12 0%, #2B0A12 34%, #7A1120 68%, #E00122 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 18% 28%, rgba(255,255,255,0.72) 0, transparent 30%), radial-gradient(circle at top right, rgba(255,255,255,0.70) 0, transparent 42%)' }} />
        <div
          className="absolute inset-0 opacity-[0.075]"
          style={{
            backgroundImage:
              'linear-gradient(112deg, transparent 0 43%, rgba(255,255,255,0.9) 43% 43.35%, transparent 43.35% 100%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-6 sm:px-8 sm:py-8 lg:px-10">
          {onBack ? (
            <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                {data.campaignMeta.schoolLogoUrl ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 p-2 shadow-sm">
                    <img src={data.campaignMeta.schoolLogoUrl} alt={CINCINNATI.shortName} className="h-full w-full object-contain" />
                  </div>
                ) : null}
                <FifthThirdBadge logoUrl={data.campaignMeta.brandLogoUrl} />
                <div className="hidden h-8 w-px bg-white/20 sm:block" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/65">Campaign Performance Report</p>
              </div>

              <h1 className="mt-6 max-w-[46rem] text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.7rem]">
                Cincinnati × Fifth Third
                <span className="block">Campaign Report</span>
              </h1>
              <FeaturedAthletesPanel athletes={athleteCards} />
            </div>

            <HeroSnapshot
              posts={formatNumber(data.campaignTotals.totalIncludedPosts)}
              likes={formatCompact(data.campaignTotals.likes)}
              comments={formatNumber(data.campaignTotals.comments)}
              views={formatCompact(data.campaignTotals.views)}
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10 sm:px-8 lg:px-10">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E00122]">Featured Activations</p>
              <h2 className="mt-1 text-3xl font-black text-gray-950">Campaign Activations</h2>
              <p className="mt-2 text-sm text-gray-500">Featured Fifth Third campaign content from Cincinnati athletes</p>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-gray-500 shadow-sm">
              {data.campaignTotals.totalIncludedPosts} campaign posts
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {data.heroActivations.map((post) => (
              <ActivationCard key={post.permalink} post={post} />
            ))}
          </div>
        </section>

        <AthleteBenchmarkPanel
          athleteName="Tyler McKinley"
          sport={data.heroActivations.find((post) => post.athleteName === 'Tyler McKinley')?.sport || 'MENS_BASKETBALL'}
          summary={data.athleteBenchmarks.tylerMcKinley}
          rows={data.benchmarkViews.tylerMcKinley.recentPosts}
        />

        <AthleteBenchmarkPanel
          athleteName="Mya Perry"
          sport={data.heroActivations.find((post) => post.athleteName === 'Mya Perry')?.sport || 'WOMENS_BASKETBALL'}
          summary={data.athleteBenchmarks.myaPerry}
          rows={data.benchmarkViews.myaPerry.recentPosts}
        />

      </main>
    </div>
  );
}
