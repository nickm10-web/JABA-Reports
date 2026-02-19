import { ThumbsUp, MessageCircle, Users, TrendingUp, Trophy, Award, BarChart3 } from 'lucide-react';
import { usePlayflyData, formatNumber, formatPercent, formatSportName } from '../contexts/PlayflyDataContext';

export function NetworkDashboard() {
  const { isLoading, networkTotals, getSportBreakdown, getConferenceBreakdown, rosterSchoolCount } = usePlayflyData();

  if (isLoading || !networkTotals) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="text-[#091831] text-center py-12">Loading network data...</div>
      </div>
    );
  }

  const { overview, ipEffectiveness, brandDeals } = networkTotals;
  const sportBreakdown = getSportBreakdown();
  const conferenceBreakdown = getConferenceBreakdown();

  // Top sport by total engagement (likes + comments)
  const topSport = sportBreakdown.length > 0
    ? sportBreakdown.reduce((best, s) => (s.totalLikes + s.totalComments) > (best.totalLikes + best.totalComments) ? s : best, sportBreakdown[0])
    : null;

  const topSportPct = topSport
    ? ((topSport.totalLikes + topSport.totalComments) / (overview.totalLikes + overview.totalComments) * 100)
    : 0;

  // Show top 8 sports by athlete count
  const displayedSports = sportBreakdown.slice(0, 8);
  const maxSportAthletes = displayedSports.length > 0 ? displayedSports[0].athleteCount : 1;

  // Show top 8 conferences
  const displayedConferences = conferenceBreakdown.slice(0, 8);
  const maxConfFollowers = displayedConferences.length > 0
    ? Math.max(...displayedConferences.map(c => c.totalFollowers))
    : 1;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#091831] tracking-wide mb-2">
          NETWORK PERFORMANCE DASHBOARD
        </h2>
        <div className="h-1 w-24 bg-[#1770C0]" />
      </div>

      {/* Metric Cards Grid - 2x3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Aggregate Likes */}
        <div className="bg-white rounded-xl p-6 border-2 border-[#1770C0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <ThumbsUp className="w-6 h-6 text-[#1770C0]" />
          </div>
          <div className="text-4xl font-bold text-[#1770C0] mb-1">
            {formatNumber(overview.totalLikes)}
          </div>
          <div className="text-sm text-gray-700 font-medium">Aggregate Likes</div>
        </div>

        {/* Aggregate Comments */}
        <div className="bg-white rounded-xl p-6 border-2 border-[#1770C0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <MessageCircle className="w-6 h-6 text-[#1770C0]" />
          </div>
          <div className="text-4xl font-bold text-[#1770C0] mb-1">
            {formatNumber(overview.totalComments)}
          </div>
          <div className="text-sm text-gray-700 font-medium">Aggregate Comments</div>
        </div>

        {/* Total Followers */}
        <div className="bg-white rounded-xl p-6 border-2 border-[#1770C0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-[#1770C0]" />
          </div>
          <div className="text-4xl font-bold text-[#1770C0] mb-1">
            {formatNumber(overview.totalFollowers)}
          </div>
          <div className="text-sm text-gray-700 font-medium">Total Followers</div>
        </div>

        {/* Total Posts */}
        <div className="bg-white rounded-xl p-6 border-2 border-[#1770C0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-6 h-6 text-[#1770C0]" />
          </div>
          <div className="text-4xl font-bold text-[#1770C0] mb-1">
            {formatNumber(overview.totalPosts)}
          </div>
          <div className="text-sm text-gray-700 font-medium">Total Posts</div>
        </div>

        {/* Best Performing Sport */}
        <div className="bg-white rounded-xl p-6 border-2 border-[#1770C0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-6 h-6 text-[#1770C0]" />
            {topSport && (
              <div className="flex items-center gap-1 text-gray-600 text-sm font-semibold">
                <span>{formatPercent(topSportPct, 0)}</span>
              </div>
            )}
          </div>
          <div className="text-4xl font-bold text-[#091831] mb-1">
            {topSport ? formatSportName(topSport.sport) : 'N/A'}
          </div>
          <div className="text-sm text-gray-700 font-medium">Top Sport by Engagement</div>
        </div>

        {/* IP Engagement Lift */}
        <div className="bg-white rounded-xl p-6 border-2 border-[#1770C0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-[#1770C0]" />
          </div>
          <div className="text-4xl font-bold text-[#1770C0] mb-1">
            +{formatPercent(ipEffectiveness.engagementLiftPercent, 1)}
          </div>
          <div className="text-sm text-gray-700 font-medium">IP Engagement Lift</div>
        </div>
      </div>

      {/* Additional Network Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-[#091831]">{overview.schools}</div>
          <div className="text-xs text-gray-600 mt-1">Schools</div>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-[#091831]">{formatNumber(overview.uniqueAthletes)}</div>
          <div className="text-xs text-gray-600 mt-1">Unique Athletes</div>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-[#091831]">{formatNumber(brandDeals.uniqueBrands)}</div>
          <div className="text-xs text-gray-600 mt-1">Unique Brands</div>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-[#091831]">{formatNumber(overview.totalEMV)}</div>
          <div className="text-xs text-gray-600 mt-1">Total EMV</div>
        </div>
      </div>

      {/* Sport Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[#091831] mb-4">Sport Breakdown</h3>
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border-2 border-[#1770C0]">
          <div className="space-y-4">
            {displayedSports.map((sport) => {
              const barWidth = (sport.athleteCount / maxSportAthletes) * 100;
              return (
                <div key={sport.sport}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#1770C0]" />
                      <span className="text-sm font-semibold text-[#091831]">{formatSportName(sport.sport)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>{formatNumber(sport.athleteCount)} athletes</span>
                      <span>{formatNumber(sport.totalLikes)} likes</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1770C0] rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {sportBreakdown.length > 8 && (
            <div className="mt-4 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
              Showing top 8 of {sportBreakdown.length} sports
            </div>
          )}
        </div>
      </div>

      {/* Conference Breakdown */}
      <div>
        <h3 className="text-lg font-bold text-[#091831] mb-4">Conference Breakdown</h3>
        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border-2 border-[#1770C0]">
          <div className="space-y-4">
            {displayedConferences.map((conf) => {
              const barWidth = maxConfFollowers > 0 ? (conf.totalFollowers / maxConfFollowers) * 100 : 0;
              return (
                <div key={conf.conference}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#091831]" />
                      <span className="text-sm font-semibold text-[#091831]">{conf.conference}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>{conf.schoolCount} schools</span>
                      <span>{conf.teamCount} teams</span>
                      <span>{formatNumber(conf.totalFollowers)} followers</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#091831] rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {conferenceBreakdown.length > 8 && (
            <div className="mt-4 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
              Showing top 8 of {conferenceBreakdown.length} conferences across {rosterSchoolCount} schools
            </div>
          )}

          {/* Chart Legend */}
          <div className="mt-4 pt-4 border-t border-[#1770C0] flex items-center justify-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#1770C0] rounded-full" />
              <span>Sport by Athlete Count</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#091831] rounded-full" />
              <span>Conference by Followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
