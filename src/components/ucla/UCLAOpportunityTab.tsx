// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Opportunity Tab
// ═══════════════════════════════════════════════════════════════
import { Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { uclaColors, formatSportName } from './uclaColors';
import { BrandGapEntry } from './uclaTypes';
import { HeatmapGrid } from './UCLAVisualizations';
import { BRAND_CATEGORIES, GAP_SPORTS } from './uclaMockData';
import { useNilContext } from './NilReportContext';

interface OpportunityProps {
  gapMatrix: BrandGapEntry[];
}

export function UCLAOpportunityTab({ gapMatrix }: OpportunityProps) {
  const { shortName, peerSchools } = useNilContext();
  // Count gaps
  const totalGaps = gapMatrix.filter(e => e.status === 'competitor').length;
  const totalActive = gapMatrix.filter(e => e.status === 'active').length;

  // Build heatmap cells
  const cells = gapMatrix.map(e => ({
    row: e.sport,
    col: e.category,
    value: e.brandCount,
    status: e.status,
  }));

  // Untapped potential cards — top gaps where competitors are active
  const competitorGaps = gapMatrix
    .filter(e => e.status === 'competitor' && e.competitorBrands && e.competitorBrands.length > 0)
    .sort((a, b) => (b.competitorBrands?.length || 0) - (a.competitorBrands?.length || 0))
    .slice(0, 6);

  // Competitor brand analysis — aggregate which schools appear most in gaps
  const competitorCounts = new Map<string, number>();
  gapMatrix.forEach(e => {
    if (e.status === 'competitor' && e.competitorBrands) {
      e.competitorBrands.forEach(c => {
        competitorCounts.set(c, (competitorCounts.get(c) || 0) + 1);
      });
    }
  });
  const competitorRanking = [...competitorCounts.entries()]
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-5 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
              <Zap className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: uclaColors.textMuted }}>Active Categories</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: uclaColors.text }}>{totalActive}</p>
          <p className="text-xs mt-1" style={{ color: uclaColors.textDim }}>Sport-category combinations with active deals</p>
        </div>
        <div className="rounded-xl border p-5 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fef9c3' }}>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: uclaColors.textMuted }}>Brand Gaps</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: uclaColors.text }}>{totalGaps}</p>
          <p className="text-xs mt-1" style={{ color: uclaColors.textDim }}>Categories where competitors have deals but UCLA doesn't</p>
        </div>
        <div className="rounded-xl border p-5 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: uclaColors.blue + '15' }}>
              <TrendingUp className="w-4 h-4" style={{ color: uclaColors.blue }} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: uclaColors.textMuted }}>Coverage</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: uclaColors.text }}>
            {((totalActive / (BRAND_CATEGORIES.length * GAP_SPORTS.length)) * 100).toFixed(0)}%
          </p>
          <p className="text-xs mt-1" style={{ color: uclaColors.textDim }}>Overall brand category coverage across sports</p>
        </div>
      </div>

      {/* Brand Gap Matrix */}
      <div className="rounded-xl border p-6 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: uclaColors.textMuted }}>
          Brand Gap Matrix
        </h3>
        <p className="text-xs mb-5" style={{ color: uclaColors.textDim }}>
          Mapping brand category presence across UCLA sports. Yellow gaps indicate where competitors have partnerships.
        </p>
        <HeatmapGrid
          rows={GAP_SPORTS}
          cols={BRAND_CATEGORIES}
          cells={cells}
          rowFormatter={formatSportName}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Untapped Potential */}
        <div className="rounded-xl border p-6 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: uclaColors.textMuted }}>
            Untapped Potential
          </h3>
          <div className="space-y-3">
            {competitorGaps.map((gap, i) => (
              <div key={i} className="rounded-lg border p-4" style={{ borderColor: uclaColors.border, backgroundColor: '#fffbeb' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: uclaColors.text }}>
                      {gap.category} &times; {formatSportName(gap.sport)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: uclaColors.textMuted }}>
                      No {gap.category.toLowerCase()} sponsor in {formatSportName(gap.sport)}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: '#fde047', color: '#854d0e' }}>
                    GAP
                  </span>
                </div>
                {gap.competitorBrands && gap.competitorBrands.length > 0 && (
                  <p className="text-[10px] mt-2" style={{ color: uclaColors.textDim }}>
                    Active at: {gap.competitorBrands.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Analysis */}
        <div className="rounded-xl border p-6 bg-white" style={{ borderColor: uclaColors.border, boxShadow: uclaColors.cardShadow }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: uclaColors.textMuted }}>
            Competitor Activity in {shortName} Gaps
          </h3>
          <p className="text-xs mb-4" style={{ color: uclaColors.textDim }}>
            Schools with active brand partnerships in categories where {shortName} has gaps
          </p>
          <div className="space-y-3">
            {competitorRanking.map(([school, count], i) => {
              const peer = peerSchools.find(p => p.shortName === school);
              return (
                <div key={school} className="flex items-center gap-3">
                  <span className="text-sm font-bold w-6 text-center" style={{ color: uclaColors.textDim }}>{i + 1}</span>
                  {peer && (
                    <img src={peer.logoUrl} alt={school} className="w-6 h-6 object-contain" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: uclaColors.text }}>{school}</p>
                    <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: uclaColors.border }}>
                      <div className="h-full rounded-full"
                        style={{
                          width: `${(count / Math.max(competitorRanking[0]?.[1] || 1, 1)) * 100}%`,
                          backgroundColor: uclaColors.gold,
                        }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: uclaColors.gold }}>
                    {count} gaps
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
