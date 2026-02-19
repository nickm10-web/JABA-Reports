// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Benchmarks Tab
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { uclaColors, formatNumber, formatCurrency } from './uclaColors';
import { PercentileBar, HorizontalBarChart, BumpChart } from './UCLAVisualizations';
import { useNilContext } from './NilReportContext';

interface BenchmarksProps {
  stats: {
    totalPosts: number;
    sponsoredPosts: number;
    uniqueAthletes: number;
    uniqueBrands: number;
    totalEMV: number;
    avgEngagement: number;
  };
}

// Map SchoolConfig.conference → team-benchmarks.json conference field
const CONF_MAP: Record<string, string> = {
  'Big Ten': 'Big 10',
  'SEC': 'SEC',
  'Mountain West': 'Mountain West Conference',
  'ACC': 'ACC',
  'Big 12': 'Big 12',
  'Ind / ACC': 'ACC',
  'Independent / ACC': 'ACC',
  'AAC': 'AAC',
  'Pac-12': 'Pac-12',
};

interface TeamBenchmark {
  school: string;
  shortName: string;
  conference: string;
  teamAccounts: number;
  totalFollowers: number;
  totalLikes: number;
  totalComments: number;
  totalPosts: number;
  avgEngagementRate: number;
  likesPerPost: number;
}

type TeamLbSort = 'totalFollowers' | 'totalLikes' | 'avgEngagementRate' | 'likesPerPost' | 'teamAccounts' | 'totalPosts';

export function UCLABenchmarksTab({ stats }: BenchmarksProps) {
  const { schoolId, shortName, conference, colors, peerSchools, benchmark: schoolBenchmark } = useNilContext();
  const allSchools = [...peerSchools, schoolBenchmark].sort((a, b) => b.totalDeals - a.totalDeals);
  const uclaRank = allSchools.findIndex(s => s.id === schoolId) + 1;

  // ─── View toggle ────────────────────────────────────────────
  const [view, setView] = useState<'athletes' | 'team-pages'>('athletes');

  // ─── Team pages data ─────────────────────────────────────────
  const [teamBenchmarks, setTeamBenchmarks] = useState<TeamBenchmark[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamLbSort, setTeamLbSort] = useState<TeamLbSort>('totalLikes');
  const [teamLbAsc, setTeamLbAsc] = useState(false);

  useEffect(() => {
    if (view !== 'team-pages' || teamBenchmarks.length > 0) return;
    setTeamLoading(true);
    fetch('/data/ucla-team-benchmarks.json')
      .then(r => r.json())
      .then((data: { schools: TeamBenchmark[] }) => setTeamBenchmarks(data.schools))
      .catch(() => {/* fail silently */ })
      .finally(() => setTeamLoading(false));
  }, [view, teamBenchmarks.length]);

  const confKey = CONF_MAP[conference] ?? conference;
  const confTeams = useMemo(() => {
    if (!teamBenchmarks.length) return [];
    return teamBenchmarks.filter(t => t.conference === confKey);
  }, [teamBenchmarks, confKey]);

  const sortedTeams = useMemo(() => {
    return [...confTeams].sort((a, b) => {
      const diff = a[teamLbSort] - b[teamLbSort];
      return teamLbAsc ? diff : -diff;
    });
  }, [confTeams, teamLbSort, teamLbAsc]);

  function handleTeamSort(col: TeamLbSort) {
    if (col === teamLbSort) setTeamLbAsc(a => !a);
    else { setTeamLbSort(col); setTeamLbAsc(false); }
  }

  // ─── Percentiles (athlete view) ──────────────────────────────
  const dealValues = allSchools.map(s => s.totalDeals).sort((a, b) => a - b);
  const emvValues = allSchools.map(s => s.totalEMV).sort((a, b) => a - b);
  const engValues = allSchools.map(s => s.avgEngagement).sort((a, b) => a - b);
  const brandValues = allSchools.map(s => s.brandCount).sort((a, b) => a - b);

  function percentile(arr: number[], val: number) {
    const below = arr.filter(v => v < val).length;
    return Math.round((below / arr.length) * 100);
  }

  // ─── Bump chart series ───────────────────────────────────────
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const bumpSeries = [schoolBenchmark, ...peerSchools].map(school => ({
    label: school.shortName,
    color: school.id === schoolId ? colors.primary : '#94a3b8',
    data: school.monthlyRanks,
    highlight: school.id === schoolId,
  }));

  return (
    <div className="space-y-6">
      {/* ─── View Toggle ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex p-0.5 rounded-lg" style={{ backgroundColor: uclaColors.lightBg }}>
          <button
            onClick={() => setView('athletes')}
            className="px-4 py-1.5 rounded-md text-xs font-semibold transition-all"
            style={{
              backgroundColor: view === 'athletes' ? 'white' : 'transparent',
              color: view === 'athletes' ? colors.primary : uclaColors.textMuted,
              boxShadow: view === 'athletes' ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
            }}
          >
            Athlete Posts
          </button>
          <button
            onClick={() => setView('team-pages')}
            className="px-4 py-1.5 rounded-md text-xs font-semibold transition-all"
            style={{
              backgroundColor: view === 'team-pages' ? 'white' : 'transparent',
              color: view === 'team-pages' ? colors.primary : uclaColors.textMuted,
              boxShadow: view === 'team-pages' ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
            }}
          >
            Team Pages
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          ATHLETE POSTS VIEW
      ═══════════════════════════════════════════════════════ */}
      {view === 'athletes' && (
        <>
          {/* School Conference Position */}
          <div className="rounded-xl border p-6 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: uclaColors.textMuted }}>
                {conference} NIL Rankings
              </h3>
              <span className="px-3 py-1 rounded-full text-sm font-bold"
                style={{ backgroundColor: colors.primary + '15', color: colors.primary }}>
                #{uclaRank} Overall
              </span>
            </div>

            {/* Ranking Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: uclaColors.border }}>
                    <th className="text-left py-2 pr-3 font-semibold text-xs uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Rank</th>
                    <th className="text-left py-2 pr-3 font-semibold text-xs uppercase tracking-wider" style={{ color: uclaColors.textDim }}>School</th>
                    <th className="text-right py-2 pr-3 font-semibold text-xs uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Deals</th>
                    <th className="text-right py-2 pr-3 font-semibold text-xs uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Est. EMV</th>
                    <th className="text-right py-2 pr-3 font-semibold text-xs uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Athletes</th>
                    <th className="text-right py-2 font-semibold text-xs uppercase tracking-wider" style={{ color: uclaColors.textDim }}>Avg Eng.</th>
                  </tr>
                </thead>
                <tbody>
                  {allSchools.map((school, i) => {
                    const isThis = school.id === schoolId;
                    return (
                      <tr key={school.id}
                        className={`border-b transition-colors ${isThis ? '' : 'hover:bg-gray-50'}`}
                        style={{
                          borderColor: uclaColors.border,
                          backgroundColor: isThis ? colors.primary + '08' : undefined,
                        }}>
                        <td className="py-3 pr-3">
                          <span className={`text-sm ${isThis ? 'font-bold' : 'font-medium'}`}
                            style={{ color: isThis ? colors.primary : uclaColors.textMuted }}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2.5">
                            <img src={school.logoUrl} alt={school.shortName} className="w-6 h-6 object-contain" />
                            <span className={`${isThis ? 'font-bold' : 'font-medium'}`}
                              style={{ color: isThis ? colors.primary : uclaColors.text }}>
                              {school.shortName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-right font-medium" style={{ color: uclaColors.text }}>
                          {formatNumber(school.totalDeals)}
                        </td>
                        <td className="py-3 pr-3 text-right font-medium" style={{ color: uclaColors.text }}>
                          {formatCurrency(school.totalEMV)}
                        </td>
                        <td className="py-3 pr-3 text-right font-medium" style={{ color: uclaColors.text }}>
                          {school.athleteCount}
                        </td>
                        <td className="py-3 text-right font-medium" style={{ color: uclaColors.text }}>
                          {school.avgEngagement.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Percentile Bars */}
            <div className="rounded-xl border p-6 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: uclaColors.textMuted }}>
                {shortName} Percentile Rankings
              </h3>
              <PercentileBar label="Sponsored Posts" percentile={percentile(dealValues, stats.sponsoredPosts)} value={formatNumber(stats.sponsoredPosts)} />
              <PercentileBar label="Est. EMV" percentile={percentile(emvValues, stats.totalEMV)} value={formatCurrency(stats.totalEMV)} color={uclaColors.gold} />
              <PercentileBar label="Avg Engagement" percentile={percentile(engValues, stats.avgEngagement)} value={stats.avgEngagement.toFixed(1) + '%'} />
              <PercentileBar label="Brand Diversity" percentile={percentile(brandValues, stats.uniqueBrands)} value={String(stats.uniqueBrands) + ' brands'} color={uclaColors.brightGold} />
            </div>

            {/* Deals Comparison Bar Chart */}
            <div className="rounded-xl border p-6 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: uclaColors.textMuted }}>
                Total Deals Comparison
              </h3>
              <HorizontalBarChart
                bars={allSchools.map(s => ({
                  label: s.shortName,
                  value: s.totalDeals,
                  color: s.id === schoolId ? colors.primary : undefined,
                  highlight: s.id === schoolId,
                }))}
                formatValue={v => formatNumber(v)}
              />
            </div>
          </div>

          {/* Bump Chart */}
          <div className="rounded-xl border p-6 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: uclaColors.textMuted }}>
              NIL Ranking Over Time
            </h3>
            <p className="text-xs mb-5" style={{ color: uclaColors.textDim }}>
              Monthly rank position among {conference} schools (lower is better)
            </p>
            <BumpChart series={bumpSeries} months={months} />
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          TEAM PAGES VIEW
      ═══════════════════════════════════════════════════════ */}
      {view === 'team-pages' && (
        <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: uclaColors.border }}>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: uclaColors.textMuted }}>
                {conference} Team Social Accounts
              </h3>
              <p className="text-xs mt-0.5" style={{ color: uclaColors.textDim }}>
                90-day performance · Official team/sport accounts only
              </p>
            </div>
            {sortedTeams.length > 0 && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: colors.primary + '12', color: colors.primary }}>
                {sortedTeams.length} schools
              </span>
            )}
          </div>

          {teamLoading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm" style={{ color: uclaColors.textMuted }}>Loading team data…</p>
            </div>
          ) : sortedTeams.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm" style={{ color: uclaColors.textMuted }}>No team data available for {conference}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: uclaColors.border, backgroundColor: uclaColors.lightBg }}>
                    <th className="text-left py-3 pl-6 pr-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>#</th>
                    <th className="text-left py-3 pr-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: uclaColors.textDim }}>School</th>
                    <SortTh col="teamAccounts" label="Accounts" sort={teamLbSort} asc={teamLbAsc} onSort={handleTeamSort} align="right" />
                    <SortTh col="totalFollowers" label="Followers" sort={teamLbSort} asc={teamLbAsc} onSort={handleTeamSort} align="right" />
                    <SortTh col="totalLikes" label="Total Likes" sort={teamLbSort} asc={teamLbAsc} onSort={handleTeamSort} align="right" colors={colors} />
                    <SortTh col="totalPosts" label="Posts" sort={teamLbSort} asc={teamLbAsc} onSort={handleTeamSort} align="right" />
                    <SortTh col="likesPerPost" label="Likes/Post" sort={teamLbSort} asc={teamLbAsc} onSort={handleTeamSort} align="right" />
                    <SortTh col="avgEngagementRate" label="Avg ER" sort={teamLbSort} asc={teamLbAsc} onSort={handleTeamSort} align="right" />
                  </tr>
                </thead>
                <tbody>
                  {sortedTeams.map((team, i) => {
                    const isThis = team.school.toLowerCase().includes(shortName.toLowerCase()) ||
                      team.shortName.toLowerCase().includes(shortName.toLowerCase());
                    return (
                      <tr key={team.school}
                        className="border-b last:border-b-0 transition-colors"
                        style={{
                          borderColor: uclaColors.border,
                          backgroundColor: isThis ? colors.primary + '08' : undefined,
                        }}>
                        <td className="py-3.5 pl-6 pr-3">
                          <span className="text-xs font-medium" style={{ color: uclaColors.textDim }}>{i + 1}</span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className={isThis ? 'font-bold' : 'font-medium'}
                            style={{ color: isThis ? colors.primary : uclaColors.text }}>
                            {team.shortName || team.school}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 text-right font-medium" style={{ color: uclaColors.textMuted }}>
                          {team.teamAccounts}
                        </td>
                        <td className="py-3.5 pr-4 text-right font-medium" style={{ color: uclaColors.text }}>
                          {formatNumber(team.totalFollowers)}
                        </td>
                        <td className="py-3.5 pr-4 text-right font-bold" style={{ color: colors.primary }}>
                          {formatNumber(team.totalLikes)}
                        </td>
                        <td className="py-3.5 pr-4 text-right" style={{ color: uclaColors.textMuted }}>
                          {formatNumber(team.totalPosts)}
                        </td>
                        <td className="py-3.5 pr-4 text-right font-medium" style={{ color: uclaColors.text }}>
                          {formatNumber(Math.round(team.likesPerPost))}
                        </td>
                        <td className="py-3.5 pr-6 text-right">
                          <span className="font-medium" style={{ color: uclaColors.text }}>
                            {team.avgEngagementRate.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sort header helper ──────────────────────────────────────
function SortTh({
  col, label, sort, asc, onSort, align, colors: colorsOverride,
}: {
  col: TeamLbSort;
  label: string;
  sort: TeamLbSort;
  asc: boolean;
  onSort: (c: TeamLbSort) => void;
  align?: string;
  colors?: { primary: string };
}) {
  const { colors } = useNilContext();
  const active = col === sort;
  const c = colorsOverride ?? colors;
  return (
    <th
      className={`py-3 px-4 text-[10px] font-semibold uppercase tracking-wider cursor-pointer select-none hover:opacity-70 ${align === 'right' ? 'text-right' : 'text-left'}`}
      style={{ color: active ? c.primary : uclaColors.textDim }}
      onClick={() => onSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active
          ? (asc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
          : <ChevronDown className="w-3 h-3 opacity-30" />}
      </span>
    </th>
  );
}
