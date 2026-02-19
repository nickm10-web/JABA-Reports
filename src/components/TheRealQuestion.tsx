import { HelpCircle } from 'lucide-react';
import { usePlayflyData, formatNumber } from '../contexts/PlayflyDataContext';

export function TheRealQuestion() {
  const { networkTotals, brandSummary, rosterTeamCount, isLoading } = usePlayflyData();

  if (isLoading || !networkTotals || !brandSummary) {
    return (
      <div className="bg-gradient-to-br from-[#1770C0]/20 to-blue-900/20 backdrop-blur-lg border border-[#3B9FD9]/30 rounded-2xl p-10 mb-8">
        <div className="text-center text-gray-400">Loading data...</div>
      </div>
    );
  }

  const schoolCount = networkTotals.overview.schools;
  const teamCount = rosterTeamCount;
  const athleteCount = networkTotals.overview.uniqueAthletes;
  const currentPartnerships = networkTotals.brandDeals.sponsoredPosts;
  // Estimate team page opportunity: ~5 slots per school with room to grow
  const teamPageOpportunities = schoolCount * 5;

  return (
    <div className="bg-gradient-to-br from-[#1770C0]/20 to-blue-900/20 backdrop-blur-lg border border-[#3B9FD9]/30 rounded-2xl p-10 mb-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-[#1770C0]/20 flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-10 h-10 text-[#3B9FD9]" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-6">THE REAL QUESTION</h2>

        <div className="space-y-4 text-lg text-gray-300 leading-relaxed mb-8">
          <p>
            Playfly, you manage <span className="text-white font-semibold">{schoolCount} schools</span>,
            <span className="text-white font-semibold"> {formatNumber(teamCount)}+ teams</span>, and
            <span className="text-white font-semibold"> {formatNumber(athleteCount)}+ athletes</span> across the biggest college sports conferences.
          </p>

          <p className="text-red-400 font-semibold">
            Without a system like JABA, you're manually:
          </p>

          <ul className="text-left max-w-2xl mx-auto space-y-2 text-base">
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span>Tracking which athletes are hot RIGHT NOW (not last quarter)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span>Matching brands to the right school/team/athlete (guesswork at scale)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span>Identifying team page inventory gaps ({teamPageOpportunities}+ opportunities across {schoolCount} schools)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span>Monitoring performance decline (athlete burnout costs partnerships)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">•</span>
              <span>Coordinating across {schoolCount} independent athletic departments (herding cats)</span>
            </li>
          </ul>

          <p className="text-[#3B9FD9] font-semibold pt-4">
            With JABA:
          </p>

          <ul className="text-left max-w-2xl mx-auto space-y-2 text-base">
            <li className="flex items-start gap-2">
              <span className="text-[#3B9FD9]">✓</span>
              <span className="text-white font-semibold">All of this is automated</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3B9FD9]">✓</span>
              <span>You get 24/7 opportunity detection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3B9FD9]">✓</span>
              <span>Brands get matched to athletes in real-time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3B9FD9]">✓</span>
              <span>Partnership growth is accelerated across all {schoolCount} schools</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#3B9FD9]">✓</span>
              <span className="text-white font-semibold">You scale from {formatNumber(currentPartnerships)} sponsored posts to maximizing every opportunity</span>
            </li>
          </ul>
        </div>

        <div className="pt-8 border-t border-white/20">
          <p className="text-2xl font-bold text-white mb-4">
            Which version of Playfly do you want to be?
          </p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-400 mb-2">{formatNumber(currentPartnerships)}</div>
              <div className="text-sm text-gray-400">Manual Process</div>
            </div>
            <div className="text-4xl text-gray-600">vs</div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#3B9FD9] mb-2">Unlimited</div>
              <div className="text-sm text-gray-400">JABA-Powered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
