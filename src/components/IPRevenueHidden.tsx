import { Zap, DollarSign, TrendingUp } from 'lucide-react';

export function IPRevenueHidden() {
  // IP engagement lifts from data
  const logoLift = 0.45;
  const brandedLift = 0.38;
  const collaborationLift = 0.52;
  const rollingAvgLift = 0.28;

  // Revenue calculations
  const baseBrandedPostValue = 500; // $500/post baseline
  const premiumBrandedPostValue = baseBrandedPostValue * (1 + logoLift); // $725/post with IP premium
  const premiumPerPost = premiumBrandedPostValue - baseBrandedPostValue; // $225/post

  // Single athlete analysis
  const postsPerMonth = 4;
  const monthlyUncapturedPerAthlete = premiumPerPost * postsPerMonth; // $900/month
  const annualUncapturedPerAthlete = monthlyUncapturedPerAthlete * 12; // $10,800/year

  // Penn State analysis
  const pennStateAthletes = 565;
  const pennStatePostsPerMonth = 2;
  const pennStateMonthlyOpportunity = pennStateAthletes * pennStatePostsPerMonth * premiumPerPost;
  const pennStateAnnualOpportunity = pennStateMonthlyOpportunity * 12;

  // Network-wide analysis
  const totalAthletes = 15000;
  const networkPostsPerMonth = 2;
  const networkMonthlyOpportunity = totalAthletes * networkPostsPerMonth * premiumPerPost;
  const networkAnnualOpportunity = networkMonthlyOpportunity * 12;

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-3 bg-yellow-100 border-2 border-yellow-400 rounded-xl px-6 py-3 mb-4">
          <Zap className="w-8 h-8 text-yellow-600" />
          <h2 className="text-3xl font-bold text-black">THE 45% ENGAGEMENT LIFT - YOUR HIDDEN REVENUE</h2>
        </div>
      </div>

      {/* Main Stat */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white mb-8 shadow-xl">
        <div className="text-center">
          <div className="text-6xl font-bold mb-4">+45%</div>
          <div className="text-2xl font-semibold mb-6">
            When athletes use branded/logo content, their posts get 45% MORE ENGAGEMENT
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="text-3xl font-bold mb-1">+{(logoLift * 100).toFixed(0)}%</div>
              <div className="text-sm">Visual IP content</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="text-3xl font-bold mb-1">+{(brandedLift * 100).toFixed(0)}%</div>
              <div className="text-sm">Branded posts</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="text-3xl font-bold mb-1">+{(collaborationLift * 100).toFixed(0)}%</div>
              <div className="text-sm">Collaboration content</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="text-3xl font-bold mb-1">+{(rollingAvgLift * 100).toFixed(0)}%</div>
              <div className="text-sm">90-day rolling avg</div>
            </div>
          </div>
        </div>
      </div>

      {/* What does 45% more engagement mean in dollars? */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-black mb-6 text-center">
          What does 45% more engagement mean in dollars?
        </h3>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Currently (Generic) */}
          <div className="bg-gray-100 rounded-xl p-6 border-2 border-gray-300">
            <div className="text-center mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">CURRENTLY</div>
              <div className="text-lg text-gray-900 mb-4">Athletes do branded posts. They get X engagement.</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-300">
              <div className="text-sm text-gray-600 mb-1">Brand Payment</div>
              <div className="text-5xl font-bold text-gray-900 mb-2">${baseBrandedPostValue}</div>
              <div className="text-xs text-gray-600">per post</div>
            </div>
          </div>

          {/* Could Be (Branded with Premium) */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-400">
            <div className="text-center mb-4">
              <div className="text-sm font-semibold text-red-700 mb-2">COULD BE</div>
              <div className="text-lg text-red-900 mb-4">Athletes do branded posts. They get 45% MORE engagement.</div>
            </div>
            <div className="bg-white rounded-lg p-6 border-2 border-red-400">
              <div className="text-sm text-gray-600 mb-1">Brand SHOULD Pay</div>
              <div className="text-5xl font-bold text-red-600 mb-2">${premiumBrandedPostValue.toFixed(0)}</div>
              <div className="text-xs text-gray-600">per post</div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm font-semibold text-red-600">
                  +${premiumPerPost.toFixed(0)} PREMIUM NOT CHARGED
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Money Being Left Behind */}
        <div className="bg-red-500 text-white rounded-xl p-6 text-center mb-8 shadow-xl">
          <div className="text-lg font-semibold mb-2">YOU'RE NOT CHARGING THE PREMIUM</div>
          <div className="text-5xl font-bold">${premiumPerPost.toFixed(0)}</div>
          <div className="text-sm mt-2">per branded post being left on the table</div>
        </div>
      </div>

      {/* Revenue Breakdown by Level */}
      <div className="space-y-6 mb-8">
        {/* For One Athlete */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-blue-900 mb-2">FOR ONE ATHLETE</div>
              <div className="text-gray-900 mb-3">
                A ${baseBrandedPostValue}/month value athlete doing {postsPerMonth} branded posts/month is leaving{' '}
                <span className="font-bold text-red-600">${monthlyUncapturedPerAthlete.toFixed(0)}</span> on the table.
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Annual uncaptured revenue:</span>
                  <span className="text-2xl font-bold text-red-600">${annualUncapturedPerAthlete.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For Penn State */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1770C0] flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-purple-900 mb-2">FOR ONE SCHOOL (PENN STATE)</div>
              <div className="text-gray-900 mb-3">
                Penn State's {pennStateAthletes.toLocaleString()} athletes, if doing {pennStatePostsPerMonth} branded posts/month each ={' '}
                <span className="font-bold text-red-600">{formatCurrency(pennStateAnnualOpportunity)}</span> annual opportunity.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-purple-300">
                  <div className="text-xs text-gray-600 mb-1">Monthly uncaptured</div>
                  <div className="text-xl font-bold text-red-600">{formatCurrency(pennStateMonthlyOpportunity)}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-300">
                  <div className="text-xs text-gray-600 mb-1">Annual uncaptured</div>
                  <div className="text-xl font-bold text-red-600">{formatCurrency(pennStateAnnualOpportunity)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For Entire Network */}
        <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-xl p-6 border-4 border-red-400 shadow-2xl">
          <div className="flex items-start gap-4 text-white">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold mb-2">FOR THE ENTIRE NETWORK</div>
              <div className="text-lg mb-3">
                {totalAthletes.toLocaleString()} athletes × {networkPostsPerMonth} posts/month × ${premiumPerPost.toFixed(0)} uncaptured premium ={' '}
                <span className="font-bold text-yellow-300">{formatCurrency(networkAnnualOpportunity)}</span> annual revenue
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="text-xs text-red-100 mb-1">Monthly opportunity</div>
                  <div className="text-2xl font-bold">{formatCurrency(networkMonthlyOpportunity)}</div>
                </div>
                <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 border-2 border-yellow-300">
                  <div className="text-xs text-yellow-100 mb-1 font-semibold">Annual opportunity</div>
                  <div className="text-2xl font-bold text-yellow-300">{formatCurrency(networkAnnualOpportunity)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="bg-black rounded-xl p-8 text-white text-center">
        <div className="text-3xl font-bold mb-4">
          You're sitting on {formatCurrency(networkAnnualOpportunity)} in IP revenue that brands will pay for - if you ask for it.
        </div>
        <div className="text-lg text-gray-300">
          The 45% engagement lift is real. The premium is justified. The money is there.
        </div>
      </div>
    </div>
  );
}
