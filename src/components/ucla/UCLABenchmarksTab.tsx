// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Benchmarks Tab
// ═══════════════════════════════════════════════════════════════
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

export function UCLABenchmarksTab({ stats }: BenchmarksProps) {
  const { schoolId, shortName, conference, colors, peerSchools, benchmark: schoolBenchmark } = useNilContext();
  const allSchools = [...peerSchools, schoolBenchmark].sort((a, b) => b.totalDeals - a.totalDeals);
  const uclaRank = allSchools.findIndex(s => s.id === schoolId) + 1;

  // Percentiles
  const dealValues = allSchools.map(s => s.totalDeals).sort((a, b) => a - b);
  const emvValues = allSchools.map(s => s.totalEMV).sort((a, b) => a - b);
  const engValues = allSchools.map(s => s.avgEngagement).sort((a, b) => a - b);
  const brandValues = allSchools.map(s => s.brandCount).sort((a, b) => a - b);

  function percentile(arr: number[], val: number) {
    const below = arr.filter(v => v < val).length;
    return Math.round((below / arr.length) * 100);
  }

  // Bump chart series
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const bumpSeries = [schoolBenchmark, ...peerSchools].map(school => ({
    label: school.shortName,
    color: school.id === schoolId ? colors.primary : '#94a3b8',
    data: school.monthlyRanks,
    highlight: school.id === schoolId,
  }));

  return (
    <div className="space-y-6">
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
                const isUcla = school.id === schoolId;
                return (
                  <tr key={school.id}
                    className={`border-b transition-colors ${isUcla ? '' : 'hover:bg-gray-50'}`}
                    style={{
                      borderColor: uclaColors.border,
                      backgroundColor: isUcla ? colors.primary + '08' : undefined,
                    }}>
                    <td className="py-3 pr-3">
                      <span className={`text-sm ${isUcla ? 'font-bold' : 'font-medium'}`}
                        style={{ color: isUcla ? colors.primary : uclaColors.textMuted }}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2.5">
                        <img src={school.logoUrl} alt={school.shortName} className="w-6 h-6 object-contain" />
                        <span className={`${isUcla ? 'font-bold' : 'font-medium'}`}
                          style={{ color: isUcla ? colors.primary : uclaColors.text }}>
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
    </div>
  );
}
