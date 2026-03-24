import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Heart, MessageCircle, Eye, Target, FileText } from 'lucide-react';
import { CLEMSON } from '../data/schoolConfig';
import {
  ClemsonHardeesCampaignData,
  HeroActivation,
  CommentHighlight,
  ComparisonRow,
  loadClemsonHardeesCampaign,
} from '../data/clemsonHardeesCampaign';

interface ClemsonHardeesCampaignReportProps {
  onBack?: () => void;
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function formatCompact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${value}`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

function HardeesBadge() {
  const logoSrc = `${import.meta.env.BASE_URL}614479365953a50004ee16c7.png`;

  return (
    <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center overflow-hidden">
      <img
        src={logoSrc}
        alt="Hardee's"
        className="w-full h-full object-contain"
        onError={(event) => {
          const img = event.currentTarget;
          img.style.display = 'none';
          const parent = img.parentElement;
          if (parent) {
            parent.className = 'w-16 h-16 rounded-2xl bg-[#F56600] text-white flex items-center justify-center text-xs font-black tracking-wide text-center leading-tight px-2';
            parent.textContent = "HARDEE'S";
          }
        }}
      />
    </div>
  );
}

function ActivationCard({ post }: { post: HeroActivation }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm h-full flex flex-col">
      <div className="relative h-72 bg-gray-100 shrink-0">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
        <div className="absolute top-3 left-3 bg-black/75 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
          {post.accountLabel}
        </div>
        <a
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 bg-white/90 text-gray-700 p-2 rounded-lg hover:bg-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      <div className="p-5 flex flex-1 flex-col">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[#F56600]">{post.sport}</p>
          <h3 className="text-xl font-black text-[#351C54] mt-1">{post.label}</h3>
          <p className="text-sm text-gray-500 mt-1">{post.accountHandle}</p>
          <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">{post.caption}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <MetricPill icon={<Eye className="w-4 h-4" />} label="Views" value={formatCompact(post.views)} />
          <MetricPill icon={<Heart className="w-4 h-4" />} label="Likes" value={formatCompact(post.likes)} />
          <MetricPill icon={<MessageCircle className="w-4 h-4" />} label="Comments" value={formatNumber(post.comments)} />
          <MetricPill icon={<Target className="w-4 h-4" />} label="Estimated EMV" value={formatCurrency(post.estimatedEmv)} />
        </div>

      </div>
    </div>
  );
}

function MetricPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <p className="text-xs uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-bold text-[#351C54] mt-1">{value}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-black text-[#351C54] mt-1">{value}</p>
    </div>
  );
}

function PostComparisonPanel({
  title,
  subtitle,
  activationTabs,
  selectedActivation,
  onSelectActivation,
  modeTabs,
  selectedMode,
  onSelectMode,
  rows,
  takeaway,
}: {
  title: string;
  subtitle: string;
  activationTabs: Array<{ key: string; label: string }>;
  selectedActivation: string;
  onSelectActivation: (value: string) => void;
  modeTabs: Array<{ key: string; label: string }>;
  selectedMode: string;
  onSelectMode: (value: string) => void;
  rows: ComparisonRow[];
  takeaway: string;
}) {
  const sortedRows = [...rows].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime;
  });
  const maxLikes = sortedRows.reduce((max, row) => Math.max(max, row.countsHidden ? 0 : row.likes), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-white space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#F56600]">How This Post Compares</p>
            <h2 className="text-3xl font-black text-[#351C54] mt-1">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className="flex w-full lg:w-auto items-center gap-1 rounded-full bg-gray-100 p-1">
            {activationTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectActivation(tab.key)}
                className={`flex-1 lg:flex-none px-4 py-2 text-xs font-semibold rounded-full transition-colors ${
                  selectedActivation === tab.key ? 'bg-[#F56600] text-white' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {modeTabs.length > 1 && (
          <div className="flex w-full sm:w-auto items-center gap-1 rounded-full bg-gray-100 p-1">
            {modeTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectMode(tab.key)}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  selectedMode === tab.key ? 'bg-[#F56600] text-white' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {sortedRows.map((row) => (
            <div key={row.id}>
              {row.isCurrent && (
                <div className="mb-1 pl-16">
                  <span className="text-[#F56600] text-xs font-bold whitespace-nowrap">THIS CAMPAIGN ⭐</span>
                </div>
              )}
              <div className="flex items-center">
                <div className="w-16 shrink-0">
                  <span className={`text-xs font-bold whitespace-nowrap ${row.isCurrent ? 'text-[#F56600]' : 'text-gray-500'}`}>
                    {row.dateLabel}
                  </span>
                </div>
                <div className="flex-1 mx-3 h-3 bg-gray-100 rounded-full overflow-hidden">
                  {row.countsHidden ? (
                    <div className="h-3 w-full rounded-full border border-dashed border-gray-300 bg-gray-50" />
                  ) : (
                    <div
                      className={`h-3 rounded-full transition-all ${row.isCurrent ? 'bg-[#F56600]' : 'bg-gray-300'}`}
                      style={{ width: `${Math.min((row.likes / Math.max(maxLikes, 1)) * 100, 100)}%`, minWidth: '6px' }}
                    />
                  )}
                </div>
                <span className={`w-20 shrink-0 text-right whitespace-nowrap text-sm ${row.isCurrent ? 'font-extrabold text-[#F56600]' : 'text-gray-500'}`}>
                  {row.countsHidden ? 'Hidden' : formatCompact(row.likes)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {sortedRows.some((row) => row.countsHidden) && (
          <p className="mt-4 text-xs text-gray-500">
            Some posts have hidden public like/view counts on Instagram and are marked as hidden instead of zero.
          </p>
        )}

        <div className="mt-6 rounded-xl p-4 bg-green-50 border border-green-200 text-center">
          <p className="text-sm font-bold text-green-700">{takeaway}</p>
        </div>
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: CommentHighlight }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-800">&ldquo;{comment.text}&rdquo;</p>
      <p className="text-xs font-bold uppercase tracking-wide text-[#F56600] mt-3">@{comment.username}</p>
    </div>
  );
}

export function ClemsonHardeesCampaignReport({ onBack }: ClemsonHardeesCampaignReportProps) {
  const [data, setData] = useState<ClemsonHardeesCampaignData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivation, setSelectedActivation] = useState<'ace' | 'holland' | 'jamison' | 'hardees'>('ace');
  const [selectedMode, setSelectedMode] = useState<'recent' | 'secondary'>('recent');

  useEffect(() => {
    let mounted = true;

    loadClemsonHardeesCampaign()
      .then((result) => {
        if (mounted) {
          setData(result);
        }
      })
      .catch((loadError: unknown) => {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load Clemson content data.');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm max-w-lg w-full">
          <p className="text-sm font-bold uppercase tracking-widest text-red-600">Clemson x Hardee&apos;s</p>
          <h1 className="text-2xl font-black text-[#351C54] mt-2">Report unavailable</h1>
          <p className="text-sm text-gray-600 mt-3">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm max-w-lg w-full">
          <p className="text-sm font-bold uppercase tracking-widest text-[#F56600]">Loading content report</p>
          <h1 className="text-2xl font-black text-[#351C54] mt-2">Building Clemson x Hardee&apos;s</h1>
        </div>
      </div>
    );
  }

  const currentRank = (rows: ComparisonRow[]) => rows.find((row) => row.isCurrent)?.rank || rows.length;

  const comparisonConfigs = {
    ace: {
      title: data.heroActivations[0].label,
      activationLabel: 'Ace',
      modes: {
        recent: {
          label: 'Recent Posts',
          subtitle: 'Ranked by likes against Ace Buckner’s recent posts',
          rows: data.benchmarkViews.ace.recentAthletePosts || [],
          takeaway: `The Ace Buckner Hardee’s post ranked #${data.benchmarks.aceBucknerBenchmark.rankByLikes} of ${data.benchmarks.aceBucknerBenchmark.populationSize} Ace Buckner posts by likes — ${data.benchmarks.aceBucknerBenchmark.xVsAverageLikes.toFixed(1)}x Ace’s average post.`,
        },
        secondary: {
          label: 'Team Posts',
          subtitle: 'Ranked by likes against Clemson Men’s Basketball recent posts',
          rows: data.benchmarkViews.ace.teamPosts || [],
          takeaway: `Against recent Clemson Men’s Basketball posts, this activation ranked #${data.benchmarks.clemsonMensBasketballTeamBenchmark.rankByLikes} of ${data.benchmarks.clemsonMensBasketballTeamBenchmark.populationSize} by likes.`,
        },
      },
    },
    holland: {
      title: data.heroActivations[1].label,
      activationLabel: 'Holland',
      modes: {
        recent: {
          label: 'Recent Posts',
          subtitle: 'Ranked by likes against Holland Harris’s recent posts',
          rows: data.benchmarkViews.holland.recentAthletePosts || [],
          takeaway: `The Holland Harris Hardee’s post ranked #${data.benchmarks.hollandHarrisBenchmark.rankByLikes} of ${data.benchmarks.hollandHarrisBenchmark.populationSize} Holland Harris posts by likes.`,
        },
        secondary: {
          label: 'Team Posts',
          subtitle: 'Ranked by likes against Clemson Women’s Basketball recent posts',
          rows: data.benchmarkViews.holland.teamPosts || [],
          takeaway: `Against recent Clemson Women’s Basketball posts, this activation ranked #${data.benchmarks.clemsonWomensBasketballTeamBenchmark.rankByLikes} of ${data.benchmarks.clemsonWomensBasketballTeamBenchmark.populationSize} by likes.`,
        },
      },
    },
    jamison: {
      title: 'Jamison Brockenbrough',
      activationLabel: 'Jamison',
      modes: {
        recent: {
          label: 'Athlete Posts',
          subtitle: 'Ranked by likes against Jamison Brockenbrough’s recent athlete posts',
          rows: data.benchmarkViews.jamison.athletePosts || [],
          takeaway: `The Jamison Hardee’s post would rank #${currentRank(data.benchmarkViews.jamison.athletePosts || [])} of ${data.benchmarks.jamisonBrockenbroughBenchmark.populationSize} recent Jamison Brockenbrough posts by likes.`,
        },
        secondary: {
          label: 'Athlete Posts',
          subtitle: 'Ranked by likes against Jamison Brockenbrough’s recent athlete posts',
          rows: data.benchmarkViews.jamison.athletePosts || [],
          takeaway: `The Jamison Hardee’s post would rank #${currentRank(data.benchmarkViews.jamison.athletePosts || [])} of ${data.benchmarks.jamisonBrockenbroughBenchmark.populationSize} recent Jamison Brockenbrough posts by likes.`,
        },
      },
    },
    hardees: {
      title: 'Hardee’s Brand Account',
      activationLabel: 'Hardee’s',
      modes: {
        recent: {
          label: 'Recent Brand Posts',
          subtitle: 'Ranked by likes against Hardee’s recent brand posts',
          rows: data.benchmarkViews.hardees.recentBrandPosts || [],
          takeaway: `The Hardee’s x Jamison post ranked #${data.benchmarks.hardeesBrandBenchmark.rankByLikes} of ${data.benchmarks.hardeesBrandBenchmark.populationSize} Hardee’s posts by likes. Hardee’s averages are influenced by much larger national posts.`,
        },
        secondary: {
          label: 'Recent Brand Posts',
          subtitle: 'Ranked by likes against Hardee’s recent brand posts',
          rows: data.benchmarkViews.hardees.recentBrandPosts || [],
          takeaway: `The Hardee’s x Jamison post ranked #${data.benchmarks.hardeesBrandBenchmark.rankByLikes} of ${data.benchmarks.hardeesBrandBenchmark.populationSize} Hardee’s posts by likes. Hardee’s averages are influenced by much larger national posts.`,
        },
      },
    },
  };

  const selectedConfig = comparisonConfigs[selectedActivation];
  const activeModeConfig = selectedConfig.modes[selectedMode];
  const modeTabs = selectedActivation === 'ace' || selectedActivation === 'holland'
    ? [
        { key: 'recent', label: selectedConfig.modes.recent.label },
        { key: 'secondary', label: selectedConfig.modes.secondary.label },
      ]
    : [{ key: 'recent', label: selectedConfig.modes.recent.label }];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-[#351C54]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between items-center pt-5 pb-4">
            <div className="w-[140px]">
              {onBack && (
                <button onClick={onBack} className="text-white/70 text-sm hover:text-white transition-colors flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Hub
                </button>
              )}
            </div>
            <div className="w-[140px]" />
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 py-6 border-b border-white/10">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                <img src={CLEMSON.logoUrl} alt={CLEMSON.shortName} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-lg font-black uppercase text-white leading-tight">{CLEMSON.shortName}</h2>
                <p className="text-xs sm:text-sm text-white/80 uppercase tracking-wide">Multi-sport content performance report</p>
              </div>
            </div>

            <span className="text-[#F56600] font-black text-2xl sm:text-4xl leading-none select-none shrink-0">✕</span>

            <div className="flex items-center gap-4 min-w-0">
              <HardeesBadge />
              <div className="min-w-0">
                <h2 className="text-xs sm:text-lg font-black uppercase text-white leading-tight">Hardee&apos;s</h2>
                <p className="text-xs sm:text-sm text-white/80 uppercase tracking-wide">Brand partner</p>
              </div>
            </div>
          </div>

          <p className="text-center text-white/45 text-[10px] sm:text-xs px-4 pb-4 pt-3">
            {data.campaignMeta.dateWindow} · Pulled {data.campaignMeta.pullDate} · 5 included Hardee’s x Clemson posts in this report · Benchmarked against Clemson team, Clemson athlete, and Hardee&apos;s brand datasets
          </p>

          <div className="flex flex-col items-start gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[#F56600] text-xs font-bold uppercase tracking-widest">Featured Athletes</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {['Ace Buckner', 'Holland Harris', 'Jamison Brockenbrough'].map((athlete) => (
                  <span key={athlete} className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
                    {athlete}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: `${data.campaignTotals.totalIncludedPosts}`, label: 'Included Posts' },
                { value: `${data.campaignTotals.uniqueAthletes}`, label: 'Athletes' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 rounded-lg px-4 py-2 text-center">
                  <p className="text-white font-black text-base leading-tight">{stat.value}</p>
                  <p className="text-white/50 text-xs uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Included Post Likes" value={formatCompact(data.campaignTotals.likes)} />
          <StatCard label="Included Post Comments" value={formatNumber(data.campaignTotals.comments)} />
          <StatCard label="Included Post Views" value={formatCompact(data.campaignTotals.views)} />
          <StatCard label="Estimated EMV" value={formatCurrency(data.campaignTotals.estimatedEmv)} />
        </section>

        <section>
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#F56600]">Featured Posts</p>
            <h2 className="text-3xl font-black text-[#351C54] mt-1">Three featured Hardee’s x Clemson posts</h2>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {data.heroActivations.map((post) => (
              <ActivationCard key={post.permalink} post={post} />
            ))}
          </div>
        </section>

        <section>
          <PostComparisonPanel
            title={selectedConfig.title}
            subtitle={activeModeConfig.subtitle}
            activationTabs={[
              { key: 'ace', label: comparisonConfigs.ace.activationLabel },
              { key: 'holland', label: comparisonConfigs.holland.activationLabel },
              { key: 'jamison', label: comparisonConfigs.jamison.activationLabel },
              { key: 'hardees', label: comparisonConfigs.hardees.activationLabel },
            ]}
            selectedActivation={selectedActivation}
            onSelectActivation={(value) => {
              setSelectedActivation(value as 'ace' | 'holland' | 'jamison' | 'hardees');
              setSelectedMode('recent');
            }}
            modeTabs={modeTabs}
            selectedMode={selectedMode}
            onSelectMode={(value) => setSelectedMode(value as 'recent' | 'secondary')}
            rows={activeModeConfig.rows}
            takeaway={activeModeConfig.takeaway}
          />
        </section>

        <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F56600]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#F56600]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#F56600]">Comment Signal</p>
              <h2 className="text-2xl font-black text-[#351C54]">Audience response on included posts</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {data.commentHighlights.map((comment) => (
              <CommentCard key={`${comment.permalink}-${comment.username}-${comment.text}`} comment={comment} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
