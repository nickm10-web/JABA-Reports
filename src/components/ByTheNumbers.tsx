import { ArrowRight } from 'lucide-react';
import { usePlayflyData, formatNumber } from '../contexts/PlayflyDataContext';

export function ByTheNumbers() {
  const { networkTotals, brandSummary, rosterTeamCount } = usePlayflyData();

  const nt = networkTotals;
  const schools = nt?.overview.schools ?? 0;
  const athletes = nt?.overview.uniqueAthletes ?? 0;
  const sponsoredAthletes = nt?.brandDeals.sponsoredAthletes ?? 0;
  const sponsoredPct = athletes > 0 ? Math.round((sponsoredAthletes / athletes) * 100) : 0;
  const sponsoredPosts = nt?.brandDeals.sponsoredPosts ?? 0;
  const uniqueBrands = nt?.brandDeals.uniqueBrands ?? 0;
  const activeSchoolsWithBrands = brandSummary?.activeSchools ?? 0;
  const schoolsWithoutBrands = schools - activeSchoolsWithBrands;

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">BY THE NUMBERS: YOUR NETWORK VS THE IDEAL STATE</h2>
        <p className="text-gray-400 text-sm">Current reality → What's possible with JABA</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Reality */}
        <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
          <h3 className="text-lg font-bold text-red-400 mb-4">Current Reality</h3>
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-bold text-white">{schools}</div>
              <div className="text-xs text-gray-400">Schools ({activeSchoolsWithBrands} with brand deals)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{rosterTeamCount}+</div>
              <div className="text-xs text-gray-400">Teams with content</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{athletes.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Athletes ({sponsoredPct}% sponsored)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-400">{uniqueBrands.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Unique Brands</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{sponsoredPosts.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Sponsored Posts</div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <ArrowRight className="w-16 h-16 text-[#3B9FD9]" />
        </div>

        {/* Ideal State */}
        <div className="bg-[#1770C0]/20 rounded-xl p-6 border border-[#3B9FD9]/30">
          <h3 className="text-lg font-bold text-[#3B9FD9] mb-4">Ideal State (with JABA)</h3>
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-bold text-white">{schools}</div>
              <div className="text-xs text-gray-400">Schools (100% monetized)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{rosterTeamCount}+</div>
              <div className="text-xs text-gray-400">Teams (all sponsored)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{athletes.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Athletes (80% sponsored)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#3B9FD9]">{uniqueBrands.toLocaleString()}+</div>
              <div className="text-xs text-gray-400">Brands (expanded reach)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{formatNumber(nt?.overview.totalPosts ?? 0)}+</div>
              <div className="text-xs text-gray-400">Total monetizable posts</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center p-6 bg-gradient-to-r from-amber-500/20 to-red-500/20 rounded-xl">
        <div className="text-4xl font-bold text-amber-400 mb-2">{(athletes - sponsoredAthletes).toLocaleString()} Unsponsored Athletes</div>
        <div className="text-sm text-gray-300">{schoolsWithoutBrands > 0 ? `${schoolsWithoutBrands} schools with minimal brand activity` : 'Revenue opportunity across your entire network'}</div>
      </div>
    </div>
  );
}
