import { Zap, TrendingUp, Users, Building, Target } from 'lucide-react';

export function IPValueAnalysisDetailed() {
  // The smoking gun: IP content gets 45% more engagement
  const ipEngagementLift = 0.45;
  const baseEngagementRate = 0.032; // 3.2% baseline
  const ipEngagementRate = baseEngagementRate * (1 + ipEngagementLift); // 4.64%

  // Revenue calculations
  const avgRevenuePerEngagement = 0.12; // $0.12 per engagement (CPM-like metric)
  const avgPostsPerAthlete = 168; // 14 posts/month * 12 months
  const avgEngagementsPerPost = 1250; // Average likes + comments per post

  // === SINGLE ATHLETE ANALYSIS ===
  // Current state: Only 10% of posts use branded content
  const currentBrandedPostPercent = 0.10;
  const currentBrandedPosts = avgPostsPerAthlete * currentBrandedPostPercent;
  const currentNonBrandedPosts = avgPostsPerAthlete * (1 - currentBrandedPostPercent);

  // Revenue from branded vs non-branded posts
  const brandedPostRevenue = avgEngagementsPerPost * ipEngagementRate * avgRevenuePerEngagement;
  const nonBrandedPostRevenue = avgEngagementsPerPost * baseEngagementRate * avgRevenuePerEngagement;

  const currentAthleteRevenue =
    currentBrandedPosts * brandedPostRevenue + currentNonBrandedPosts * nonBrandedPostRevenue;

  // Optimized state: 50% of posts use branded content
  const optimizedBrandedPostPercent = 0.50;
  const optimizedBrandedPosts = avgPostsPerAthlete * optimizedBrandedPostPercent;
  const optimizedNonBrandedPosts = avgPostsPerAthlete * (1 - optimizedBrandedPostPercent);

  const optimizedAthleteRevenue =
    optimizedBrandedPosts * brandedPostRevenue + optimizedNonBrandedPosts * nonBrandedPostRevenue;

  const athleteRevenueIncrease = optimizedAthleteRevenue - currentAthleteRevenue;
  const athleteIncreasePercent = (athleteRevenueIncrease / currentAthleteRevenue) * 100;

  // === PENN STATE ANALYSIS ===
  const pennStateAthletes = 1245;
  const pennStateCurrentRevenue = pennStateAthletes * currentAthleteRevenue;
  const pennStatePotentialRevenue = pennStateAthletes * optimizedAthleteRevenue;
  const pennStateOpportunity = pennStatePotentialRevenue - pennStateCurrentRevenue;

  // === NETWORK-WIDE ANALYSIS ===
  const totalAthletes = 15000;
  const networkCurrentRevenue = totalAthletes * currentAthleteRevenue;
  const networkPotentialRevenue = totalAthletes * optimizedAthleteRevenue;
  const networkOpportunity = networkPotentialRevenue - networkCurrentRevenue;

  // === ANNUAL VALUE OF 45% LIFT ===
  // If all posts were branded (theoretical maximum)
  const maxBrandedRevenue = avgPostsPerAthlete * brandedPostRevenue;
  const maxNonBrandedRevenue = avgPostsPerAthlete * nonBrandedPostRevenue;
  const annualValueOf45PercentLift = (maxBrandedRevenue - maxNonBrandedRevenue) * totalAthletes;

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatPercent = (num: number): string => {
    return `${(num * 100).toFixed(1)}%`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      {/* SMOKING GUN Header */}
      <div className="mb-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-12 h-12" />
          <div>
            <div className="text-sm text-yellow-100">THE SMOKING GUN</div>
            <h2 className="text-4xl font-bold">IP Content Premium</h2>
          </div>
        </div>
        <div className="text-6xl font-bold mb-4">+{formatPercent(ipEngagementLift)}</div>
        <div className="text-2xl font-semibold mb-6">
          Branded/Visual IP content gets 45% MORE engagement than organic posts
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border-2 border-white/40">
          <div className="text-sm text-yellow-100 mb-2">Annual Value of the IP Premium</div>
          <div className="text-5xl font-bold mb-2">{formatCurrency(annualValueOf45PercentLift)}</div>
          <div className="text-sm text-yellow-100">
            This is what the 45% engagement lift is worth across your entire network if fully leveraged
          </div>
        </div>
      </div>

      {/* 3-Level Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Single Athlete */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">Single Athlete Impact</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs text-blue-700 mb-1">Current Annual Earnings (10% branded posts)</div>
              <div className="text-3xl font-bold text-blue-900">{formatCurrency(currentAthleteRevenue)}</div>
            </div>

            <div className="flex items-center justify-center py-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <div className="text-xs text-blue-700 mb-1">Optimized Earnings (50% branded posts)</div>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(optimizedAthleteRevenue)}</div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-blue-300">
              <div className="text-xs text-gray-600 mb-1">Revenue Increase</div>
              <div className="text-2xl font-bold text-green-600">
                +{formatCurrency(athleteRevenueIncrease)}
              </div>
              <div className="text-xs text-gray-600 mt-1">({athleteIncreasePercent.toFixed(0)}% increase)</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-blue-800 bg-blue-50 rounded p-2 border border-blue-200">
            <strong>Key Insight:</strong> By using branded content in just 40% more posts, a single athlete can earn{' '}
            <strong>{formatCurrency(athleteRevenueIncrease)}</strong> more per year.
          </div>
        </div>

        {/* Penn State (Top School) */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-300">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-purple-900">Penn State Impact</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs text-purple-700 mb-1">Current Annual Revenue</div>
              <div className="text-3xl font-bold text-purple-900">{formatCurrency(pennStateCurrentRevenue)}</div>
              <div className="text-xs text-purple-700 mt-1">{pennStateAthletes.toLocaleString()} athletes</div>
            </div>

            <div className="flex items-center justify-center py-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <div className="text-xs text-purple-700 mb-1">Optimized Revenue Potential</div>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(pennStatePotentialRevenue)}</div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-purple-300">
              <div className="text-xs text-gray-600 mb-1">Revenue Opportunity</div>
              <div className="text-2xl font-bold text-green-600">+{formatCurrency(pennStateOpportunity)}</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-purple-800 bg-purple-50 rounded p-2 border border-purple-200">
            <strong>Penn State Impact:</strong> Your top-performing school could earn an additional{' '}
            <strong>{formatCurrency(pennStateOpportunity)}</strong> annually by optimizing IP content usage.
          </div>
        </div>

        {/* Entire Network */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border-2 border-green-300">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-green-900">Network-Wide Impact</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs text-green-700 mb-1">Current Network Revenue</div>
              <div className="text-3xl font-bold text-green-900">{formatCurrency(networkCurrentRevenue)}</div>
              <div className="text-xs text-green-700 mt-1">{totalAthletes.toLocaleString()} athletes</div>
            </div>

            <div className="flex items-center justify-center py-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <div className="text-xs text-green-700 mb-1">Optimized Revenue Potential</div>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(networkPotentialRevenue)}</div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-green-300">
              <div className="text-xs text-gray-600 mb-1">Total Revenue Unlock</div>
              <div className="text-2xl font-bold text-green-600">+{formatCurrency(networkOpportunity)}</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-green-800 bg-green-50 rounded p-2 border border-green-200">
            <strong>Network Opportunity:</strong> If you helped all athletes understand the IP premium, the total revenue unlock is{' '}
            <strong>{formatCurrency(networkOpportunity)}</strong>.
          </div>
        </div>
      </div>

      {/* Visual Comparison: Branded vs Non-Branded */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-black mb-4">Engagement Rate Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Non-Branded */}
          <div className="bg-white rounded-lg p-6 border border-gray-300">
            <div className="text-sm font-semibold text-gray-700 mb-3">Organic (Non-Branded) Posts</div>
            <div className="text-5xl font-bold text-gray-600 mb-2">{formatPercent(baseEngagementRate)}</div>
            <div className="text-xs text-gray-600 mb-4">Engagement Rate</div>
            <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
              <div className="h-full bg-gray-600" style={{ width: `${baseEngagementRate * 1000}%` }}></div>
            </div>
          </div>

          {/* Branded */}
          <div className="bg-white rounded-lg p-6 border-2 border-green-400">
            <div className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Branded/Visual IP Posts
            </div>
            <div className="text-5xl font-bold text-green-600 mb-2">{formatPercent(ipEngagementRate)}</div>
            <div className="text-xs text-green-700 mb-1 font-semibold">
              +{formatPercent(ipEngagementLift)} Higher Engagement
            </div>
            <div className="text-xs text-gray-600 mb-4">Engagement Rate</div>
            <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
              <div className="h-full bg-green-600" style={{ width: `${ipEngagementRate * 1000}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA - Make it Visual and Hard to Ignore */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <Zap className="w-16 h-16" />
          <div>
            <div className="text-3xl font-bold mb-2">This is the wake-up call.</div>
            <div className="text-lg">
              Branded content performs <span className="font-bold text-yellow-300">45% better</span>. That's not a
              theory — that's your data.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
            <div className="text-sm text-orange-100 mb-1">Per Athlete Opportunity</div>
            <div className="text-3xl font-bold">{formatCurrency(athleteRevenueIncrease)}/year</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
            <div className="text-sm text-orange-100 mb-1">Per School Opportunity</div>
            <div className="text-3xl font-bold">{formatCurrency(pennStateOpportunity)}/year</div>
          </div>
          <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 border-2 border-yellow-300">
            <div className="text-sm text-yellow-100 mb-1 font-semibold">Network Opportunity</div>
            <div className="text-3xl font-bold text-yellow-300">{formatCurrency(networkOpportunity)}/year</div>
          </div>
        </div>

        <div className="text-center text-lg font-semibold">
          The infrastructure exists. The data proves it works. The question is:{' '}
          <span className="text-yellow-300 font-bold">How fast can you scale it?</span>
        </div>
      </div>
    </div>
  );
}
