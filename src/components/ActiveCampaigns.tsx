import { useState } from 'react';
import { Briefcase, Users, ChevronDown, ChevronUp, Award, BarChart3 } from 'lucide-react';
import { usePlayflyData, formatNumber, formatPercent, formatSportName } from '../contexts/PlayflyDataContext';

export function ActiveCampaigns() {
  const { isLoading, brandSummary, networkTotals, getTopAthletesByFollowers, getTopBrandsByPosts } = usePlayflyData();
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllSchools, setShowAllSchools] = useState(false);

  if (isLoading || !brandSummary || !networkTotals) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-sm">
        <div className="text-white text-center py-12">Loading brand partnership data...</div>
      </div>
    );
  }

  const topBrands = getTopBrandsByPosts(20);
  const topAthletes = getTopAthletesByFollowers(10);
  const displayedBrands = showAllBrands ? topBrands : topBrands.slice(0, 8);
  const schoolStats = brandSummary.schoolStats || [];
  const displayedSchools = showAllSchools ? schoolStats : schoolStats.slice(0, 8);

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-wide mb-2">
          BRAND PARTNERSHIP ACTIVITY
        </h2>
        <div className="h-1 w-24 bg-[#1770C0]" />
      </div>

      {/* Summary Stats */}
      <div style={{ backgroundColor: 'rgba(23, 112, 192, 0.1)' }} className="rounded-xl p-6 mb-8 border-2 border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-4xl font-bold text-[#1770C0]">{formatNumber(brandSummary.activeBrands)}</div>
            <div className="text-sm text-gray-300 mt-1">Active Brands</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#1770C0]">{formatNumber(brandSummary.totalPosts)}</div>
            <div className="text-sm text-gray-300 mt-1">Sponsored Posts</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#1770C0]">{brandSummary.activeSchools}</div>
            <div className="text-sm text-gray-300 mt-1">Schools with Brand Activity</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#1770C0]">{formatNumber(networkTotals.brandDeals.sponsoredAthletes)}</div>
            <div className="text-sm text-gray-300 mt-1">Athletes with Sponsored Posts</div>
          </div>
        </div>
      </div>

      {/* Top Brands by Post Count */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-[#1770C0]" />
          <h3 className="text-lg font-bold text-white">Top Brands by Post Count</h3>
        </div>

        <div className="space-y-3">
          {displayedBrands.map((brand, idx) => {
            const maxPosts = topBrands[0]?.postCount || 1;
            const barWidth = (brand.postCount / maxPosts) * 100;
            return (
              <div
                key={brand.brandName}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1770C0] flex items-center justify-center text-white text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{brand.brandName}</div>
                        <div className="text-xs text-gray-400">
                          {brand.schoolCount} {brand.schoolCount === 1 ? 'school' : 'schools'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#1770C0]">{brand.postCount}</div>
                      <div className="text-xs text-gray-400">posts</div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1770C0] rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  {brand.avgEngagementRate > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      Avg Engagement Rate: {formatPercent(brand.avgEngagementRate * 100, 2)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {topBrands.length > 8 && (
          <button
            onClick={() => setShowAllBrands(!showAllBrands)}
            className="w-full mt-3 p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-gray-300"
          >
            {showAllBrands ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Show All {topBrands.length} Brands</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Schools with Most Brand Activity */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-[#1770C0]" />
          <h3 className="text-lg font-bold text-white">Schools with Most Brand Activity</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedSchools.map((school, idx) => (
            <div
              key={school.schoolName}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#091831] flex items-center justify-center text-white text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{school.schoolName}</div>
                    <div className="text-xs text-gray-400">{school.brandCount} brands</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#1770C0]">{school.postCount}</div>
                  <div className="text-xs text-gray-400">sponsored posts</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {schoolStats.length > 8 && (
          <button
            onClick={() => setShowAllSchools(!showAllSchools)}
            className="w-full mt-3 p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-gray-300"
          >
            {showAllSchools ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Show All {schoolStats.length} Schools</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Top Athletes by Followers */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#1770C0]" />
          <h3 className="text-lg font-bold text-white">Top Athletes by Followers</h3>
        </div>

        <div className="space-y-3">
          {topAthletes.map((athlete, idx) => (
            <div
              key={`${athlete.name}-${athlete.school}`}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1770C0] flex items-center justify-center text-white text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{athlete.name}</div>
                    <div className="text-xs text-gray-400">
                      {athlete.school} | {formatSportName(athlete.sport)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#1770C0]">{formatNumber(athlete.followers)}</div>
                  <div className="text-xs text-gray-400">followers</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-sm font-bold text-[#091831]">{formatNumber(athlete.totalLikes)}</div>
                  <div className="text-xs text-gray-400">likes</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-[#091831]">{formatNumber(athlete.totalComments)}</div>
                  <div className="text-xs text-gray-400">comments</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-[#091831]">{athlete.postCount}</div>
                  <div className="text-xs text-gray-400">posts</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network IP Impact Callout */}
      <div style={{ backgroundColor: 'rgba(23, 112, 192, 0.1)' }} className="rounded-xl p-6 border-2 border-white/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1770C0] flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-white mb-2">Brand Partnership Insights</div>
            <div className="text-sm text-gray-300 mb-3">
              {formatNumber(brandSummary.activeBrands)} brands are actively partnering with athletes across {brandSummary.activeSchools} schools, generating {formatNumber(brandSummary.totalPosts)} sponsored posts with IP content delivering +{formatPercent(networkTotals.ipEffectiveness.engagementLiftPercent, 1)} engagement lift.
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                {formatNumber(networkTotals.brandDeals.uniqueBrands)} unique brands in network
              </div>
              <div className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                {formatNumber(networkTotals.brandDeals.sponsoredPosts)} total sponsored posts
              </div>
              <div className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20">
                {formatNumber(networkTotals.brandDeals.sponsoredAthletes)} athletes with brand deals
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
