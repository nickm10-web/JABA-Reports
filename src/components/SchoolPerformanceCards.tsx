import { useState, useMemo } from 'react';
import { Search, TrendingUp, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { usePlayflyData, formatNumber, formatSportName, type SchoolMetrics, type AthleteMetric } from '../contexts/PlayflyDataContext';
import { getTeamsBySchool } from '../data/jabaRealData';

export function SchoolPerformanceCards() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'athletes' | 'teams' | 'brands'>('athletes');

  const { schools, brandSummary, athletes } = usePlayflyData();

  // Build school list from real metrics data
  const schoolList = useMemo(() => {
    return (Object.entries(schools) as [string, SchoolMetrics][])
      .map(([name, data]) => {
        const brandInfo = brandSummary?.schoolStats.find(s => s.schoolName === name);
        return {
          name,
          followers: data.overview.totalFollowers,
          totalPosts: data.overview.totalPosts,
          sponsoredPosts: data.brandDeals.sponsoredPosts,
          uniqueBrands: data.brandDeals.uniqueBrands,
          sponsoredAthletes: data.brandDeals.sponsoredAthletes,
          uniqueAthletes: data.overview.uniqueAthletes,
          engagementRate: data.overview.engagementRate,
          ipLift: data.ipEffectiveness.engagementLiftPercent,
          totalEMV: data.emvBreakdown.totalEMV,
          brandPostCount: brandInfo?.postCount ?? 0,
          brandCount: brandInfo?.brandCount ?? 0,
        };
      })
      .sort((a, b) => b.followers - a.followers);
  }, [schools, brandSummary]);

  // Get real athletes for a school
  const getAthletesForSchool = (schoolName: string) => {
    return athletes
      .filter((a: AthleteMetric) => a.school === schoolName)
      .sort((a: AthleteMetric, b: AthleteMetric) => b.followers - a.followers)
      .slice(0, 10);
  };

  // Get real teams for a school
  const getTeamsForSchool = (schoolName: string) => {
    const teams = getTeamsBySchool(schoolName);
    return teams
      .filter(t => t.metrics.ninetyDays.contentCount > 0)
      .map(t => ({
        sport: t.sport,
        followers: t.metrics.ninetyDays.followers,
        contentCount: t.metrics.ninetyDays.contentCount,
        likes: t.metrics.ninetyDays.likes,
        comments: t.metrics.ninetyDays.comments,
        engagementRate: t.metrics.ninetyDays.engagementRate,
        logoContentCount: t.metrics.ninetyDays.logoContentCount,
        sponsoredContentCount: t.metrics.ninetyDays.sponsoredContentCount,
      }))
      .sort((a, b) => b.followers - a.followers);
  };

  // Get brands active at a school from brand summary
  const getBrandsForSchool = (schoolName: string): SchoolMetrics['topBrands'] => {
    const schoolMetrics = schools[schoolName];
    if (!schoolMetrics) return [];
    return schoolMetrics.topBrands
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);
  };

  const filtered = schoolList.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'athletes' as const, label: 'Top Athletes', icon: Users },
    { id: 'teams' as const, label: 'Teams', icon: TrendingUp },
    { id: 'brands' as const, label: 'Top Brands', icon: TrendingUp },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">SCHOOL-BY-SCHOOL PERFORMANCE DEEP DIVE</h2>
        <p className="text-gray-400 text-sm mb-4">Click a school to see athletes, teams, and brand activity from real data.</p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1770C0]"
          />
        </div>
      </div>

      <div className="space-y-3 max-h-[800px] overflow-y-auto">
        {filtered.map((school) => (
          <div
            key={school.name}
            className="bg-white/5 rounded-xl border border-white/10 hover:border-[#1770C0]/50 transition-all"
          >
            {/* School Header */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => setSelectedSchool(selectedSchool === school.name ? null : school.name)}
            >
              <div className="grid grid-cols-7 gap-4 items-center">
                <div className="col-span-2 flex items-center gap-2">
                  {selectedSchool === school.name ? (
                    <ChevronDown className="w-4 h-4 text-[#1770C0] flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <div>
                    <div className="text-lg font-bold text-white">{school.name}</div>
                    <div className="text-xs text-gray-400">{school.uniqueAthletes} athletes</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-white">{formatNumber(school.followers)}</div>
                  <div className="text-xs text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-white">{school.totalPosts.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-white">{school.sponsoredPosts.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Sponsored</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-[#3B9FD9]">{school.uniqueBrands}</div>
                  <div className="text-xs text-gray-400">Brands</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-amber-400">+{school.ipLift.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">IP Lift</div>
                </div>
              </div>
            </div>

            {/* Expanded View */}
            {selectedSchool === school.name && (
              <div className="border-t border-white/10 p-4">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                          activeTab === tab.id
                            ? 'bg-[#1770C0] text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="bg-white/5 rounded-lg p-4">
                  {activeTab === 'athletes' && (() => {
                    const schoolAthletes = getAthletesForSchool(school.name);
                    if (schoolAthletes.length === 0) {
                      return <p className="text-gray-400 text-sm">No individual athlete data available for this school.</p>;
                    }
                    return (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-3">Top Athletes by Followers</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left text-gray-400 pb-2 font-semibold">#</th>
                                <th className="text-left text-gray-400 pb-2 font-semibold">Name</th>
                                <th className="text-left text-gray-400 pb-2 font-semibold">Sport</th>
                                <th className="text-right text-gray-400 pb-2 font-semibold">Followers</th>
                                <th className="text-right text-gray-400 pb-2 font-semibold">Posts</th>
                                <th className="text-right text-gray-400 pb-2 font-semibold">Eng. Rate</th>
                                <th className="text-right text-gray-400 pb-2 font-semibold">EMV</th>
                                <th className="text-right text-gray-400 pb-2 font-semibold">Logo Lift</th>
                              </tr>
                            </thead>
                            <tbody>
                              {schoolAthletes.map((athlete, idx) => (
                                <tr key={athlete.name} className="border-b border-white/5">
                                  <td className="py-3 text-white font-bold">{idx + 1}</td>
                                  <td className="py-3 text-white">{athlete.name}</td>
                                  <td className="py-3 text-gray-300">{formatSportName(athlete.sport)}</td>
                                  <td className="py-3 text-right text-white">{formatNumber(athlete.followers)}</td>
                                  <td className="py-3 text-right text-white">{athlete.postCount}</td>
                                  <td className="py-3 text-right text-[#3B9FD9] font-semibold">{(athlete.engagementRate * 100).toFixed(2)}%</td>
                                  <td className="py-3 text-right text-white">${formatNumber(athlete.emv)}</td>
                                  <td className="py-3 text-right">
                                    {athlete.logoLift !== null ? (
                                      <span className={athlete.logoLift > 0 ? 'text-green-400' : 'text-red-400'}>
                                        {athlete.logoLift > 0 ? '+' : ''}{athlete.logoLift.toFixed(1)}%
                                      </span>
                                    ) : (
                                      <span className="text-gray-500">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                  {activeTab === 'teams' && (() => {
                    const schoolTeams = getTeamsForSchool(school.name);
                    if (schoolTeams.length === 0) {
                      return <p className="text-gray-400 text-sm">No team data available for this school.</p>;
                    }
                    return (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-3">Teams by Followers</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left text-gray-400 pb-2 font-semibold">Team</th>
                                <th className="text-right text-gray-400 pb-2 font-semibold">Followers</th>
                                <th className="text-right text-gray-400 pb-2 font-semibold">Posts</th>
                                <th className="text-right text-gray-400 pb-2 font-semibold">Eng. Rate</th>
                                <th className="text-right text-gray-400 pb-2 font-semibold">Logo Posts</th>
                                <th className="text-right text-gray-400 pb-2 font-semibold">Sponsored</th>
                              </tr>
                            </thead>
                            <tbody>
                              {schoolTeams.map((team, idx) => (
                                <tr key={idx} className="border-b border-white/5">
                                  <td className="py-3 text-white font-semibold">{formatSportName(team.sport)}</td>
                                  <td className="py-3 text-right text-white">{formatNumber(team.followers)}</td>
                                  <td className="py-3 text-right text-white">{team.contentCount}</td>
                                  <td className="py-3 text-right text-[#3B9FD9] font-semibold">{(team.engagementRate * 100).toFixed(2)}%</td>
                                  <td className="py-3 text-right text-white">{team.logoContentCount}</td>
                                  <td className="py-3 text-right">
                                    {team.sponsoredContentCount === 0 ? (
                                      <span className="text-red-400 font-bold">0</span>
                                    ) : (
                                      <span className="text-white">{team.sponsoredContentCount}</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                  {activeTab === 'brands' && (() => {
                    const schoolBrands = getBrandsForSchool(school.name);
                    if (schoolBrands.length === 0) {
                      return <p className="text-gray-400 text-sm">No brand data available for this school.</p>;
                    }
                    return (
                      <div>
                        <h3 className="text-lg font-bold text-white mb-3">Top Brands by Engagement</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left text-gray-400 pb-2 font-semibold">Brand</th>
                                <th className="text-right text-gray-400 pb-2 font-semibold">Posts</th>
                                <th className="text-right text-gray-400 pb-2 font-semibold">Total Engagement</th>
                                <th className="text-left text-gray-400 pb-2 font-semibold">IP Types Used</th>
                              </tr>
                            </thead>
                            <tbody>
                              {schoolBrands.map((brand, idx) => (
                                <tr key={idx} className="border-b border-white/5">
                                  <td className="py-3 text-white font-semibold">{brand.name}</td>
                                  <td className="py-3 text-right text-white">{brand.posts}</td>
                                  <td className="py-3 text-right text-[#3B9FD9] font-semibold">{brand.engagement.toLocaleString()}</td>
                                  <td className="py-3">
                                    <div className="flex gap-1">
                                      {brand.ipTypesUsed.length > 0 ? brand.ipTypesUsed.map((t: string) => (
                                        <span key={t} className="px-2 py-0.5 bg-[#1770C0]/20 text-[#3B9FD9] rounded text-xs">{t}</span>
                                      )) : (
                                        <span className="text-gray-500 text-xs">none</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
