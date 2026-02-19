import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { usePlayflyData, formatNumber, formatPercent, formatDollars } from '../contexts/PlayflyDataContext';

export function CompetitiveIntelligenceHeatmap() {
  const {
    networkTotals,
    brandSummary,
    athletes,
    getTopBrandsByPosts,
    getSportBreakdown,
  } = usePlayflyData();

  // ─── Brand data ──────────────────────────────────────────
  const topBrands = getTopBrandsByPosts(20);

  const findBrand = (name: string) =>
    brandSummary?.brandStats.find(b => b.brandName.toLowerCase().includes(name.toLowerCase()));

  const nikeBrand = findBrand('nike');
  const adidasBrand = findBrand('adidas');
  const raisingCanesBrand = findBrand("raising cane") ?? findBrand("cane's");

  // Top 3 brands by posts for highlighting
  const top3Brands = topBrands.slice(0, 3);

  // ─── Sport breakdown for competitive intelligence ────────
  const sportBreakdown = getSportBreakdown();
  const footballSport = sportBreakdown.find(s => s.sport.toLowerCase().includes('football'));
  const basketballSport = sportBreakdown.find(s =>
    s.sport.toLowerCase().includes('basketball') && s.sport.toLowerCase().includes('men')
  ) ?? sportBreakdown.find(s => s.sport.toLowerCase().includes('basketball'));
  const gymnasticsSport = sportBreakdown.find(s => s.sport.toLowerCase().includes('gymnast'));

  // ─── Top athlete by engagement ───────────────────────────
  const topByEngagement = athletes.length > 0
    ? [...athletes].sort((a, b) => b.engagementRate - a.engagementRate)[0]
    : null;

  // IP effectiveness
  const collabLift = networkTotals?.ipTypeBreakdown.collaboration.liftPercent ?? 0;
  const overallIPLift = networkTotals?.ipEffectiveness.engagementLiftPercent ?? 0;
  const totalEMV = networkTotals?.emvBreakdown.totalEMV ?? 0;
  const totalBrands = networkTotals?.brandDeals.uniqueBrands ?? 0;
  const brandsUsingIP = networkTotals?.brandsUsingIPCount ?? 0;

  // Active schools count
  const activeSchools = brandSummary?.activeSchools ?? 0;
  const totalSchools = networkTotals?.overview.schools ?? 0;
  const unactivatedSchools = totalSchools - activeSchools;

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">COMPETITIVE INTELLIGENCE</h2>
            <p className="text-gray-400 text-sm">How brands perform WITHIN your network</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Nike Analysis */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Nike Performance{nikeBrand ? ` (${nikeBrand.postCount.toLocaleString()} posts)` : ''}
          </h3>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <div className="text-sm font-semibold text-green-400 mb-2">Key Metrics:</div>
              <ul className="text-sm text-gray-300 space-y-1">
                {nikeBrand && (
                  <>
                    <li>* {nikeBrand.postCount.toLocaleString()} sponsored posts</li>
                    <li>* Active across {nikeBrand.schoolCount} schools</li>
                    <li>* {formatPercent(nikeBrand.avgEngagementRate * 100, 2)} avg engagement rate</li>
                  </>
                )}
                {!nikeBrand && (
                  <li className="text-gray-500">Nike data not found in brand partnerships</li>
                )}
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-purple-400 mb-2">Network Context:</div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>* {totalBrands.toLocaleString()} total brands in network</li>
                <li>* {brandsUsingIP.toLocaleString()} brands using IP activations</li>
                <li>* {formatPercent(overallIPLift)} engagement lift with IP</li>
              </ul>
            </div>
          </div>
          <div className="bg-[#1770C0]/10 rounded p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Top Athlete by Engagement:</span>
              <span className="text-sm font-bold text-white">
                {topByEngagement
                  ? `${topByEngagement.name} - ${topByEngagement.school} (${formatPercent(topByEngagement.engagementRate * 100)})`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-300">Collaboration Lift:</span>
              <span className="text-sm font-bold text-[#3B9FD9]">{formatPercent(collabLift)} higher engagement with athlete + brand collab</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-amber-400">
              <span className="text-sm">Gymnastics Opportunity:</span>
              <span className="text-sm font-bold">
                {gymnasticsSport
                  ? `${gymnasticsSport.athleteCount} athletes, ${formatPercent(gymnasticsSport.avgEngagement * 100)} avg engagement`
                  : 'Data not available'}
              </span>
            </div>
          </div>
        </div>

        {/* Adidas Analysis */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Adidas Performance{adidasBrand ? ` (${adidasBrand.postCount.toLocaleString()} posts)` : ''}
          </h3>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <div className="text-sm font-semibold text-green-400 mb-2">Key Metrics:</div>
              <ul className="text-sm text-gray-300 space-y-1">
                {adidasBrand ? (
                  <>
                    <li>* {adidasBrand.postCount.toLocaleString()} sponsored posts</li>
                    <li>* Active across {adidasBrand.schoolCount} schools</li>
                    <li>* {formatPercent(adidasBrand.avgEngagementRate * 100, 2)} avg engagement rate</li>
                  </>
                ) : (
                  <li className="text-gray-500">Adidas data not found in brand partnerships</li>
                )}
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-purple-400 mb-2">Sport Engagement Context:</div>
              <ul className="text-sm text-gray-300 space-y-1">
                {footballSport && (
                  <li>* Football: {footballSport.athleteCount} athletes, {formatPercent(footballSport.avgEngagement * 100)} avg eng</li>
                )}
                {basketballSport && (
                  <li>* Basketball: {basketballSport.athleteCount} athletes, {formatPercent(basketballSport.avgEngagement * 100)} avg eng</li>
                )}
                {gymnasticsSport && (
                  <li>* Gymnastics: {gymnasticsSport.athleteCount} athletes, {formatPercent(gymnasticsSport.avgEngagement * 100)} avg eng</li>
                )}
              </ul>
            </div>
          </div>
          <div className="bg-red-500/10 rounded p-4 border border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-bold text-red-400">Gap Alert:</span>
            </div>
            <p className="text-sm text-gray-300">
              {adidasBrand && nikeBrand ? (
                <>
                  Adidas has <span className="text-white font-bold">{adidasBrand.postCount.toLocaleString()} posts vs Nike's {nikeBrand.postCount.toLocaleString()}</span>
                  {nikeBrand.postCount > adidasBrand.postCount
                    ? ` — a ${Math.round(((nikeBrand.postCount - adidasBrand.postCount) / adidasBrand.postCount) * 100)}% gap. `
                    : '. '}
                  Expanding into underserved sports like gymnastics ({gymnasticsSport ? formatPercent(gymnasticsSport.avgEngagement * 100) : 'high'} engagement) could close this gap significantly.
                </>
              ) : (
                <>
                  Comparing brand performance across {formatNumber(athletes.length)} athletes reveals gaps in sport-specific coverage.
                  Underserved sports represent significant expansion opportunities.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Third Brand or Regional Brand Analysis */}
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {raisingCanesBrand
              ? `Raising Cane's Performance (${raisingCanesBrand.postCount.toLocaleString()} posts)`
              : top3Brands[2]
                ? `${top3Brands[2].brandName} Performance (${top3Brands[2].postCount.toLocaleString()} posts)`
                : 'Brand Expansion Opportunities'}
          </h3>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <div className="text-sm font-semibold text-green-400 mb-2">Key Metrics:</div>
              <ul className="text-sm text-gray-300 space-y-1">
                {(() => {
                  const brand = raisingCanesBrand ?? top3Brands[2];
                  if (brand) {
                    return (
                      <>
                        <li>* {brand.postCount.toLocaleString()} sponsored posts</li>
                        <li>* Active across {brand.schoolCount} schools</li>
                        <li>* {formatPercent(brand.avgEngagementRate * 100, 2)} avg engagement rate</li>
                      </>
                    );
                  }
                  return <li className="text-gray-500">Brand data not available</li>;
                })()}
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-red-400 mb-2">Expansion Opportunity:</div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>* {unactivatedSchools} schools without brand deals</li>
                <li>* {activeSchools} schools currently active</li>
                <li>* {formatDollars(totalEMV)} total network EMV</li>
              </ul>
            </div>
          </div>
          <div className="bg-[#1770C0]/10 rounded p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Expansion Opportunity:</span>
              <span className="text-sm font-bold text-[#3B9FD9]">
                {unactivatedSchools} unactivated schools in the network
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Same playbook, new geography. {unactivatedSchools > 0
                ? `${unactivatedSchools} schools represent untapped brand partnership potential.`
                : 'All schools are currently active with brand partnerships.'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
        <div className="flex items-start gap-4">
          <TrendingUp className="w-8 h-8 text-purple-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-white mb-2">This proves JABA understands brand strategy, not just data</h3>
            <p className="text-sm text-gray-300">
              Most platforms show you "{nikeBrand ? `Nike had ${nikeBrand.postCount.toLocaleString()} posts` : 'brand post counts'}." JABA shows you
              <span className="text-white font-semibold"> where brands are winning, where they're losing, and exactly which {formatNumber(athletes.length)} athletes across {totalSchools} schools</span>
              {' '}represent the best partnership opportunities. That's the level of insight executives actually care about.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
