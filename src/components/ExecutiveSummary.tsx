import { DollarSign, Award, Users, BarChart3, Globe, Database, Brain, Target, Zap } from 'lucide-react';
import { usePlayflyData, formatNumber } from '../contexts/PlayflyDataContext';

export function ExecutiveSummary() {
  const { networkTotals, brandSummary, rosterTeamCount } = usePlayflyData();

  const nt = networkTotals;
  const sponsoredPosts = nt?.brandDeals.sponsoredPosts ?? 0;
  const schools = nt?.overview.schools ?? 0;
  const totalFollowers = nt?.overview.totalFollowers ?? 0;
  const uniqueBrands = nt?.brandDeals.uniqueBrands ?? 0;
  const uniqueAthletes = nt?.overview.uniqueAthletes ?? 0;
  const sponsoredAthletes = nt?.brandDeals.sponsoredAthletes ?? 0;
  const unsponsoredAthletes = uniqueAthletes - sponsoredAthletes;
  const ipLift = nt?.ipEffectiveness.engagementLiftPercent ?? 0;

  // Top brands from real brand partnership data
  const topBrands = brandSummary?.brandStats.slice(0, 5).map(b => b.brandName) ?? [];

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
      {/* JABA Positioning Statement */}
      <div className="mb-8 pb-6 border-b border-white/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1770C0] to-blue-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-white">
            JABA powers real-time campaign management across your entire network — centralizing what's currently fragmented across {schools} schools into one automated platform.
          </p>
        </div>
      </div>

      {/* Headline */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-wide mb-2">
          THE PLAYFLY OPPORTUNITY IN NUMBERS
        </h2>
        <div className="h-1 w-24 bg-[#1770C0]" />
      </div>

      {/* Three Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Network Reach & Scale */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border-t-4 border-[#1770C0]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1770C0] flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Network Reach & Scale
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#3B9FD9]">{sponsoredPosts.toLocaleString()}</span>
              <span className="text-sm text-gray-300">sponsored posts across YOUR network</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#3B9FD9]">{schools}</span>
              <span className="text-sm text-gray-300">schools in Playfly network</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#3B9FD9]">{rosterTeamCount}+</span>
              <span className="text-sm text-gray-300">teams generating content</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#3B9FD9]">{formatNumber(totalFollowers)}</span>
              <span className="text-sm text-gray-300">total followers across your schools</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#3B9FD9]">{uniqueBrands.toLocaleString()}</span>
              <span className="text-sm text-gray-300">unique brands in your network</span>
            </div>
          </div>
        </div>

        {/* Card 2: Revenue Potential */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border-t-4 border-[#1770C0]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1770C0] flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Revenue Potential
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-[#3B9FD9]">+{ipLift.toFixed(1)}%</span>
              <span className="text-sm text-gray-300">engagement lift with IP-driven content</span>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl font-bold text-[#3B9FD9]">{formatNumber(nt?.emvBreakdown.totalEMV ?? 0)}</span>
              <span className="text-sm text-gray-300">total estimated media value (EMV)</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-[#3B9FD9]" />
                <span className="text-sm font-semibold text-white">Multi-Platform Coverage</span>
              </div>
              <span className="text-xs text-gray-400">Instagram + TikTok coverage across {schools} schools</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-[#3B9FD9]" />
                <span className="text-sm font-semibold text-white">Top Brand Partners</span>
              </div>
              <span className="text-xs text-gray-400">{topBrands.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Why JABA Is The Only Choice */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border-t-4 border-[#1770C0]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1770C0] flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Why JABA Is The Only Choice
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-[#3B9FD9]" />
                <span className="text-sm font-semibold text-white">{formatNumber(nt?.overview.totalPosts ?? 0)}+ Posts Analyzed</span>
              </div>
              <span className="text-xs text-gray-400">Deep athlete-brand performance data you can't replicate</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-[#3B9FD9]" />
                <span className="text-sm font-semibold text-white">Network-Wide AI Matching</span>
              </div>
              <span className="text-xs text-gray-400">Auto-optimizes athlete-brand pairings across {schools} schools</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-[#3B9FD9]" />
                <span className="text-sm font-semibold text-white">Competitive Intelligence Engine</span>
              </div>
              <span className="text-xs text-gray-400">Real-time insights into what works in college NIL</span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-[#3B9FD9]" />
                <span className="text-sm font-semibold text-white">Automated Revenue Capture</span>
              </div>
              <span className="text-xs text-gray-400">AI surfaces {unsponsoredAthletes.toLocaleString()}+ unsponsored athlete opportunities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stat Bar */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#3B9FD9]">{schools}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Schools Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#3B9FD9]">{uniqueAthletes.toLocaleString()}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Athletes Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#3B9FD9]">{sponsoredPosts.toLocaleString()}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Sponsored Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#3B9FD9]">{uniqueBrands.toLocaleString()}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Unique Brands</div>
          </div>
        </div>
      </div>
    </div>
  );
}
