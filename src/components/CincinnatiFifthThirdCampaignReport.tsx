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

const COMPARISON_METRICS: Array<{ key: ComparisonMetric; label: string }> = [
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comments' },
];

function FifthThirdBadge({ logoUrl }: { logoUrl?: string }) {
  return (
    <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center overflow-hidden shadow-sm">
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
              parent.className = 'w-16 h-16 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center text-[10px] font-black tracking-wide text-center leading-tight px-2 shadow-sm';
              parent.textContent = 'FIFTH THIRD';
            }
          }}
        />
      ) : (
        <div className="w-full h-full rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center text-[10px] font-black tracking-wide text-center leading-tight px-2">
          FIFTH THIRD
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm p-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/70">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      {helper ? <p className="mt-1 text-xs text-white/70">{helper}</p> : null}
    </div>
  );
}

function AthleteIdentityCard({
  name,
  sport,
  imageUrl,
}: {
  name: string;
  sport: string;
  imageUrl?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-14 w-14 rounded-full object-cover ring-2 ring-white/20" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-sm font-black text-white">
            {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
          </div>
        )}
        <div>
          <p className="text-lg font-black text-white">{name}</p>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">{formatSport(sport)}</p>
        </div>
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

function formatComparisonMetricValue(row: ComparisonRow, metric: ComparisonMetric): string {
  const value = getComparisonMetricValue(row, metric);

  if (metric === 'likes') {
    return value > 0 ? formatCompact(value) : 'Hidden';
  }

  return formatNumber(value);
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

function ComparisonBars({
  rows,
  metric,
}: {
  rows: ComparisonRow[];
  metric: ComparisonMetric;
}) {
  const maxValue = rows.reduce((max, row) => Math.max(max, getComparisonMetricValue(row, metric)), 0);

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.id}>
          {row.isCurrent ? (
            <div className="mb-1 pl-14 text-[10px] font-bold uppercase tracking-[0.24em] text-[#E00122]">Campaign Post</div>
          ) : null}
          <div className="flex items-center gap-3">
            <div className="w-11 shrink-0 text-xs font-semibold text-gray-500">{row.dateLabel}</div>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${row.isCurrent ? 'bg-[#E00122]' : 'bg-gray-300'}`}
                style={{
                  width: getComparisonMetricValue(row, metric) > 0
                    ? `${Math.max((getComparisonMetricValue(row, metric) / Math.max(maxValue, 1)) * 100, 4)}%`
                    : '0%',
                }}
              />
            </div>
            <div className={`w-16 shrink-0 text-right text-sm font-semibold ${row.isCurrent ? 'text-[#E00122]' : 'text-gray-500'}`}>
              {formatComparisonMetricValue(row, metric)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryMetric({
  label,
  campaignValue,
  baselineValue,
  lift,
}: {
  label: string;
  campaignValue: string;
  baselineValue: string;
  lift: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">{label}</p>
      <p className="mt-2 text-xl font-black text-gray-950">{campaignValue}</p>
      <p className="mt-1 text-sm text-gray-500">Baseline {baselineValue}</p>
      <p className={`mt-2 text-sm font-bold ${lift.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{lift} vs baseline</p>
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
  const [comparisonMetric, setComparisonMetric] = useState<ComparisonMetric>('likes');

  return (
    <section className="rounded-3xl border border-gray-200 bg-[#FCFCFD] p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E00122]">Athlete Benchmark</p>
          <h2 className="mt-1 text-3xl font-black text-gray-950">{athleteName}</h2>
          <p className="text-sm text-gray-500">{formatSport(sport)} · Benchmarked against {summary.populationSize} recent non-campaign athlete posts</p>
        </div>
        <div className="rounded-full bg-[#E00122]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#E00122]">
          {summary.campaignPostCount} campaign posts included
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SummaryMetric
          label="Average Likes"
          campaignValue={formatCompact(summary.campaignAverageLikes)}
          baselineValue={formatCompact(summary.averageLikes)}
          lift={formatLift(summary.liftVsAverageLikes)}
        />
        <SummaryMetric
          label="Average Comments"
          campaignValue={formatNumber(Math.round(summary.campaignAverageComments * 10) / 10)}
          baselineValue={formatNumber(Math.round(summary.averageComments * 10) / 10)}
          lift={formatLift(summary.liftVsAverageComments)}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">Recent Comparison</p>
            <p className="text-sm text-gray-600">
              Comparing <span className="font-semibold text-gray-900">{COMPARISON_METRICS.find((item) => item.key === comparisonMetric)?.label}</span> across the athlete’s recent posting history.
            </p>
          </div>
          <div className="text-sm font-semibold text-gray-500">{rows.length} recent posts shown</div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {COMPARISON_METRICS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setComparisonMetric(item.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                comparisonMetric === item.key
                  ? 'bg-[#E00122] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <ComparisonBars rows={rows} metric={comparisonMetric} />
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
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at top right, white 0, transparent 42%)' }} />
        <div className="relative mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
          {onBack ? (
            <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex items-center gap-4">
                {data.campaignMeta.schoolLogoUrl ? (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/95 p-2 shadow-sm">
                    <img src={data.campaignMeta.schoolLogoUrl} alt={CINCINNATI.shortName} className="h-full w-full object-contain" />
                  </div>
                ) : null}
                <FifthThirdBadge logoUrl={data.campaignMeta.brandLogoUrl} />
              </div>

              <p className="mt-8 text-xs font-bold uppercase tracking-[0.28em] text-white/70">Campaign Performance Report</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                {data.campaignMeta.title}
              </h1>
              <p className="mt-6 text-sm text-white/70">
                Campaign performance across Tyler McKinley and Mya Perry&apos;s Fifth Third activations
              </p>
              <p className="mt-2 text-sm text-white/60">
                Reporting window: {data.campaignMeta.dateWindow}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {athleteCards.map((athlete) => (
                  <AthleteIdentityCard
                    key={athlete.name}
                    name={athlete.name}
                    sport={athlete.sport}
                    imageUrl={athlete.imageUrl}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Athletes" value={formatNumber(data.campaignTotals.uniqueAthletes)} />
              <StatCard label="Posts" value={formatNumber(data.campaignTotals.totalIncludedPosts)} />
              <StatCard label="Likes" value={formatCompact(data.campaignTotals.likes)} />
              <StatCard label="Comments" value={formatNumber(data.campaignTotals.comments)} />
              <StatCard label="Views" value={formatCompact(data.campaignTotals.views)} />
            </div>
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
