import { CheckCircle2, XCircle, Zap, Brain } from 'lucide-react';
import { usePlayflyData, formatNumber } from '../contexts/PlayflyDataContext';

export function WhatPlayflyMAXMisses() {
  const { networkTotals, brandSummary, isLoading } = usePlayflyData();

  if (isLoading || !networkTotals || !brandSummary) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
        <div className="text-center text-gray-400">Loading data...</div>
      </div>
    );
  }

  const schoolCount = networkTotals.overview.schools;
  const sponsoredPosts = networkTotals.brandDeals.sponsoredPosts;
  // Team page opportunity: ~5 sponsorship slots per school
  const teamPageOpportunities = schoolCount * 5;

  const captures = [
    'Official Nike/Wegmans/Raising Cane\'s partnership deals',
    'Athlete-generated sponsored content tracking',
    'Team page logo placement inventory',
    'Basic engagement metrics (likes, comments, shares)',
    'Post-by-post brand tagging',
  ];

  const misses = [
    {
      title: 'Athlete Burnout Signals',
      desc: 'Declining engagement trends that predict athlete churn 30 days before it happens',
      impact: 'Lose top partnerships when athletes ghost',
    },
    {
      title: 'Cross-School Partnership Optimization',
      desc: `Matching athletes to brands systematically across all ${schoolCount} schools (not just within one)`,
      impact: 'Multi-school bundle opportunities left untapped',
    },
    {
      title: 'Real-Time Opportunity Detection',
      desc: 'Athlete goes viral → brand deal activated within 24hrs (not 2 weeks later when momentum dies)',
      impact: 'Viral posts lose 80% value after 48hrs',
    },
    {
      title: 'Competitive Intelligence',
      desc: 'How Nike performs in Big Ten vs SEC. Which brands underperform. Where to expand.',
      impact: 'Flying blind on expansion opportunities across conferences',
    },
    {
      title: 'Team Page Dark Inventory Tracking',
      desc: `Schools with ZERO team page sponsorships = ${teamPageOpportunities}+ partnership slots sitting idle`,
      impact: 'Guaranteed opportunities left on table',
    },
    {
      title: 'Pricing Optimization',
      desc: 'Dynamic pricing based on engagement trends, not static rate cards from 2023',
      impact: 'Underpricing high-performers by 40-60%',
    },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1770C0] to-blue-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">WHAT PLAYFLY MAX IS MISSING</h2>
            <p className="text-gray-400 text-sm">Your current system vs. what JABA adds</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: What MAX Captures */}
        <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            PLAYFLY MAX CAPTURES
          </h3>
          <div className="space-y-3">
            {captures.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Sponsored Posts Tracked</div>
            <div className="text-3xl font-bold text-green-400">{formatNumber(sponsoredPosts)}</div>
          </div>
        </div>

        {/* RIGHT: What MAX Misses */}
        <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
          <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            PLAYFLY MAX MISSES (JABA CAPTURES)
          </h3>
          <div className="space-y-4">
            {misses.map((item, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-start gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm font-bold text-white">{item.title}</div>
                </div>
                <div className="text-xs text-gray-400 mb-2 ml-6">{item.desc}</div>
                <div className="text-xs text-amber-400 font-semibold ml-6">⚠️ {item.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 bg-gradient-to-r from-[#1770C0]/20 to-blue-600/20 rounded-xl border border-[#1770C0]/30">
        <div className="flex items-start gap-4">
          <Zap className="w-8 h-8 text-[#3B9FD9] flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-white mb-2">JABA Solves All 6 Gaps Automatically</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Playfly MAX shows you <span className="text-white font-semibold">what happened</span>.
              JABA shows you <span className="text-[#3B9FD9] font-semibold">what's happening right now</span> and
              <span className="text-[#3B9FD9] font-semibold"> what to do about it</span>.
              That's the difference between {formatNumber(sponsoredPosts)} tracked posts and maximizing every opportunity across {schoolCount} schools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
