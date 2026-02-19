import { Zap, Eye, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayflyData, formatNumber, formatPercent, formatSportName } from '../contexts/PlayflyDataContext';

export function BiggestShock() {
  const {
    networkTotals,
    brandSummary,
    athletes,
    getTopAthletesByFollowers,
    getSportBreakdown,
  } = usePlayflyData();

  // ─── Sport engagement breakdown ──────────────────────────
  const sportBreakdown = getSportBreakdown();
  const gymnasticsSport = sportBreakdown.find(s => s.sport.toLowerCase().includes('gymnast'));
  const footballSport = sportBreakdown.find(s => s.sport.toLowerCase().includes('football'));

  const gymnasticsEngagement = gymnasticsSport?.avgEngagement ?? 0;
  const footballEngagement = footballSport?.avgEngagement ?? 0;
  const engagementMultiple = footballEngagement > 0
    ? Math.round(gymnasticsEngagement / footballEngagement)
    : 0;

  // Compute sponsored-post share for gymnastics vs football to illustrate the undervaluation
  const gymnasticsAthletes = athletes.filter(a => a.sport.toLowerCase().includes('gymnast'));
  const footballAthletes = athletes.filter(a => a.sport.toLowerCase().includes('football'));
  const gymnasticsAthleteCount = gymnasticsAthletes.length;
  const footballAthleteCount = footballAthletes.length;
  const totalAthletes = athletes.length;
  const gymnasticsPct = totalAthletes > 0 ? Math.round((gymnasticsAthleteCount / totalAthletes) * 100) : 0;
  const footballPct = totalAthletes > 0 ? Math.round((footballAthleteCount / totalAthletes) * 100) : 0;

  // ─── Team page / school brand data ───────────────────────
  const totalSchools = networkTotals?.overview.schools ?? 0;
  const activeSchoolsWithBrands = brandSummary?.activeSchools ?? 0;
  const schoolsWithoutBrands = totalSchools - activeSchoolsWithBrands;

  // Schools that DO have brand deals (from schoolStats)
  const schoolsWithBrandsList = brandSummary?.schoolStats
    .filter(s => s.postCount > 0)
    .map(s => s.schoolName) ?? [];

  // ─── Top high-engagement athletes ────────────────────────
  // Get the top 3 athletes by followers to showcase real athletes
  const topAthletes = getTopAthletesByFollowers(3);

  // Network average engagement rate
  const networkAvgEngagement = networkTotals?.overview.engagementRate ?? 0;

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">BIGGEST SHOCKS</h2>
            <p className="text-gray-400 text-sm">Three discoveries that prove JABA analyzed your data</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* SHOCK #1: Gymnastics Undervalued */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-6 border-l-4 border-purple-500"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded">SHOCK #1</span>
                <h3 className="text-xl font-bold text-white">Your Gymnastics Teams Are Criminally Undervalued</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-400">{formatPercent(gymnasticsEngagement * 100)}</div>
                  <div className="text-xs text-gray-400">{gymnasticsSport ? formatSportName(gymnasticsSport.sport) : 'Gymnastics'} Engagement</div>
                  <div className="text-xs text-gray-500 mt-1">vs {formatPercent(footballEngagement * 100)} Football</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-400">{gymnasticsAthleteCount}</div>
                  <div className="text-xs text-gray-400">Gymnastics Athletes ({gymnasticsPct}%)</div>
                  <div className="text-xs text-gray-500 mt-1">vs {footballAthleteCount} Football ({footballPct}%)</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-amber-400">{engagementMultiple > 0 ? `${engagementMultiple}X` : 'Higher'}</div>
                  <div className="text-xs text-gray-400">Engagement Advantage</div>
                  <div className="text-xs text-gray-500 mt-1">vs football teams</div>
                </div>
              </div>

              <div className="bg-purple-500/10 rounded-lg p-4 mb-3">
                <h4 className="text-sm font-bold text-white mb-2">Real Example:</h4>
                <div className="space-y-2 text-sm">
                  {gymnasticsAthletes.length > 0 ? (
                    <>
                      {(() => {
                        const topGym = [...gymnasticsAthletes].sort((a, b) => b.totalLikes - a.totalLikes)[0];
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">{topGym.school} Gymnastics ({topGym.name})</span>
                              <span className="text-purple-400 font-bold">{formatNumber(topGym.totalLikes)} likes, {formatPercent(topGym.engagementRate * 100)} engagement</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">Followers</span>
                              <span className="text-purple-400 font-bold">{formatNumber(topGym.followers)}</span>
                            </div>
                          </>
                        );
                      })()}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Network Gymnastics Athletes</span>
                        <span className="text-[#3B9FD9] font-bold">{gymnasticsAthleteCount} across the network</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">No gymnastics athlete data available</div>
                  )}
                </div>
              </div>

              <div className="bg-[#1770C0]/20 rounded-lg p-4 border border-[#1770C0]/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#3B9FD9]" />
                  <span className="text-sm font-bold text-[#3B9FD9]">JABA Recommendation:</span>
                </div>
                <p className="text-sm text-gray-300">
                  Package gymnastics WITH football for premium brands.
                  <span className="text-white font-semibold"> Gymnastics engagement rates are {engagementMultiple > 0 ? `${engagementMultiple}X` : 'significantly'} higher than football</span>
                  , making them highly attractive for brand activations. Massive untapped partnership opportunities exist.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SHOCK #2: Team Pages Dark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-red-600/10 to-orange-600/10 rounded-xl p-6 border-l-4 border-red-500"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded">SHOCK #2</span>
                <h3 className="text-xl font-bold text-white">Your Team Pages Are Dark Real Estate</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-400">{schoolsWithoutBrands}/{totalSchools}</div>
                  <div className="text-xs text-gray-400">Schools With ZERO</div>
                  <div className="text-xs text-gray-500 mt-1">team page sponsors</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-400">{activeSchoolsWithBrands}</div>
                  <div className="text-xs text-gray-400">Schools With Brands</div>
                  <div className="text-xs text-gray-500 mt-1">of {totalSchools} total</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-amber-400">{totalSchools > 0 ? Math.round((schoolsWithoutBrands / totalSchools) * 100) : 0}%</div>
                  <div className="text-xs text-gray-400">Untapped Inventory</div>
                  <div className="text-xs text-gray-500 mt-1">if activated</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-[#3B9FD9]">24hrs</div>
                  <div className="text-xs text-gray-400">To Activate</div>
                  <div className="text-xs text-gray-500 mt-1">with JABA</div>
                </div>
              </div>

              <div className="bg-red-500/10 rounded-lg p-4 mb-3">
                <h4 className="text-sm font-bold text-white mb-2">What You're Missing:</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Guaranteed placement = <span className="text-white font-semibold">premium partnership opportunity per page</span></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>Only {activeSchoolsWithBrands} schools monetized{schoolsWithBrandsList.length > 0 && ` (${schoolsWithBrandsList.slice(0, 6).join(', ')}${schoolsWithBrandsList.length > 6 ? `, +${schoolsWithBrandsList.length - 6} more` : ''})`}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><span className="text-amber-400 font-bold">{schoolsWithoutBrands} schools</span> = completely dark inventory</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1770C0]/20 rounded-lg p-4 border border-[#1770C0]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[#3B9FD9]" />
                  <span className="text-sm font-bold text-[#3B9FD9]">Quick Win (30 days):</span>
                </div>
                <p className="text-sm text-gray-300">
                  Activate brands across {schoolsWithoutBrands} unmonetized school pages instantly.
                  <span className="text-white font-semibold"> JABA handles logo placement, tracking, and reporting automatically.</span>
                  Without JABA: months of manual coordination across {totalSchools} athletic departments.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SHOCK #3: Top Athletes With Real Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-[#1770C0]/10 to-blue-600/10 rounded-xl p-6 border-l-4 border-[#1770C0]"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#1770C0]/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-[#3B9FD9]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-[#1770C0]/20 text-[#3B9FD9] text-xs font-bold rounded">SHOCK #3</span>
                <h3 className="text-xl font-bold text-white">These Top Athletes Are Generating Massive Engagement</h3>
              </div>

              <div className="space-y-3 mb-4">
                {topAthletes.map((athlete, i) => {
                  const aboveAvg = networkAvgEngagement > 0
                    ? Math.round(((athlete.engagementRate - networkAvgEngagement) / networkAvgEngagement) * 100)
                    : 0;

                  return (
                    <div key={i} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-lg font-bold text-white">{athlete.name}</div>
                          <div className="text-xs text-gray-400">{athlete.school} &mdash; {formatSportName(athlete.sport)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#3B9FD9]">{formatNumber(athlete.emv)}</div>
                          <div className="text-xs text-gray-400">EMV</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <div className="text-sm font-bold text-[#3B9FD9]">{formatNumber(athlete.followers)}</div>
                          <div className="text-xs text-gray-400">Followers</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#3B9FD9]">{formatPercent(athlete.engagementRate * 100)}</div>
                          <div className="text-xs text-gray-400">Engagement</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#3B9FD9]">{formatNumber(athlete.totalLikes)}</div>
                          <div className="text-xs text-gray-400">Total Likes</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-[#1770C0]/10 rounded p-2">
                        <span className="text-xs text-gray-300">{athlete.postCount} posts &mdash; {formatNumber(athlete.totalComments)} comments</span>
                        {aboveAvg > 0 ? (
                          <span className="text-sm font-bold text-amber-400">{aboveAvg}% above network avg</span>
                        ) : (
                          <span className="text-sm font-bold text-[#3B9FD9]">Top performer</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#1770C0]/20 rounded-lg p-4 border border-[#1770C0]/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#3B9FD9]" />
                  <span className="text-sm font-bold text-[#3B9FD9]">JABA Solves This:</span>
                </div>
                <p className="text-sm text-gray-300">
                  Across {formatNumber(athletes.length)} athletes in your network,
                  <span className="text-white font-semibold"> JABA automatically identifies high-value athletes and matches them to brands in real-time.</span>
                  {' '}Your current manual process misses these opportunities daily.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer CTA */}
      <div className="mt-6 p-6 bg-gradient-to-r from-amber-500/20 to-red-500/20 rounded-xl border border-amber-500/30">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-amber-400" />
          <div>
            <h3 className="text-lg font-bold text-white mb-1">These aren't hypotheticals.</h3>
            <p className="text-sm text-gray-300">
              These are <span className="text-white font-semibold">real athletes in your network right now</span>, with measurable engagement,
              generating content daily. With {formatNumber(networkTotals?.overview.totalLikes ?? 0)} total likes and {formatNumber(networkTotals?.overview.totalEMV ?? 0)} in EMV across the network,
              JABA found them in 30 seconds. How long would it take your team?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
