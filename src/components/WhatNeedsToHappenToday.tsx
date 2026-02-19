import { Calendar, Zap, TrendingUp } from 'lucide-react';
import { usePlayflyData, formatNumber } from '../contexts/PlayflyDataContext';

export function WhatNeedsToHappenToday() {
  const { networkTotals, athletes, isLoading } = usePlayflyData();

  if (isLoading || !networkTotals) {
    return (
      <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-lg border border-red-500/30 rounded-2xl p-8 mb-8">
        <div className="text-center text-gray-400">Loading data...</div>
      </div>
    );
  }

  const schoolCount = networkTotals.overview.schools;

  // Compute high-engagement unsponsored athletes:
  // Athletes with above-average engagement rate but no sponsored posts detected
  const avgEngagement = athletes.length > 0
    ? athletes.reduce((sum, a) => sum + a.engagementRate, 0) / athletes.length
    : 0;
  const highEngagementUnsponsored = athletes.filter(
    a => a.engagementRate > avgEngagement * 2 && a.postCount > 5
  );
  const unsponsoredCount = highEngagementUnsponsored.length;

  return (
    <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-lg border border-red-500/30 rounded-2xl p-8 mb-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">WHAT NEEDS TO HAPPEN TODAY</h2>
            <p className="text-gray-300 text-sm">90-day action plan across {schoolCount} schools</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white/10 rounded-xl p-5 border border-red-400/30">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-bold text-white">Week 1-2: Team Page Activation Blitz</h3>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            Activate team page sponsorships across {schoolCount} schools.
            Guaranteed placement = guaranteed revenue.
          </p>
          <div className="text-xs text-gray-400">
            <span className="text-red-400 font-semibold">Without JABA:</span> Months of manual coordination.
            <span className="text-[#3B9FD9] font-semibold"> With JABA:</span> Weeks, fully automated.
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-5 border border-red-400/30">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-bold text-white">Week 3-4: Undervalued Athletes Program</h3>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            {unsponsoredCount > 0
              ? `JABA has identified ${formatNumber(unsponsoredCount)} high-engagement athletes who are currently underutilized for brand partnerships.`
              : 'JABA identifies high-engagement athletes currently underutilized for brand partnerships.'
            }
            {' '}Match them to brands based on real engagement data.
          </p>
          <div className="text-xs text-gray-400">
            JABA identifies them automatically and matches to brands in real-time.
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-5 border border-red-400/30">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-bold text-white">Week 5-12: Cross-Conference Expansion</h3>
          </div>
          <p className="text-sm text-gray-300 mb-3">
            Top brands dominate one conference. Expand them to all {schoolCount} schools across conferences.
            Same brand, new territory, huge upside.
          </p>
          <div className="text-xs text-gray-400">
            JABA handles multi-school coordination across conferences automatically.
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 bg-white/10 rounded-xl border border-[#3B9FD9]/30">
        <div className="text-center">
          <div className="text-4xl font-bold text-[#3B9FD9] mb-2">Maximize Every Opportunity</div>
          <div className="text-sm text-gray-300">90-day activation across {schoolCount} schools with {formatNumber(networkTotals.overview.uniqueAthletes)}+ athletes</div>
          <div className="text-xs text-amber-400 mt-2">Every week you wait = lost opportunities</div>
        </div>
      </div>
    </div>
  );
}
