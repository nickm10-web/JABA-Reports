import { ThumbsUp, DollarSign, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { getIPPerformanceMetrics } from '../data/playflyIPAnalytics';

export function IPImpactAnalysis() {
  const ipMetrics = getIPPerformanceMetrics();

  // Calculate revenue implications (estimated)
  const estimatedValuePer1Percent = 125000; // $125K per 1% engagement increase
  const totalLift45Percent = estimatedValuePer1Percent * 45;
  const annualEstimate = totalLift45Percent * 2.5; // Multiplier for scale

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-wide mb-2">
          IP PERFORMANCE = REVENUE OPPORTUNITY
        </h2>
        <div className="h-1.5 w-32 bg-[#1770C0]" />
      </div>

      {/* 4 Key Lifts - Large Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Visual IP Content */}
        <div className="bg-white rounded-xl p-6 border border-white/20 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#1770C0] flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-semibold text-gray-300">Visual IP Content</div>
          </div>
          <div className="text-5xl font-bold text-[#1770C0] mb-2">
            +{ipMetrics.logoContentEngagementLift}%
          </div>
          <div className="text-xs text-gray-400">Engagement Lift</div>
        </div>

        {/* Branded Posts */}
        <div className="bg-white rounded-xl p-6 border border-white/20 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#1770C0] flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-semibold text-gray-300">Branded Posts</div>
          </div>
          <div className="text-5xl font-bold text-[#1770C0] mb-2">
            +{ipMetrics.brandedPostPerformanceLift}%
          </div>
          <div className="text-xs text-gray-400">Performance Lift</div>
        </div>

        {/* Collaboration */}
        <div className="bg-white rounded-xl p-6 border border-white/20 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#1770C0] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-semibold text-gray-300">Collaboration</div>
          </div>
          <div className="text-5xl font-bold text-[#1770C0] mb-2">
            +{ipMetrics.collaborationContentLift}%
          </div>
          <div className="text-xs text-gray-400">Content Lift</div>
        </div>

        {/* 90-Day Rolling */}
        <div className="bg-white rounded-xl p-6 border border-white/20 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#1770C0] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-semibold text-gray-300">90-Day Rolling</div>
          </div>
          <div className="text-5xl font-bold text-[#1770C0] mb-2">
            +{ipMetrics.ninetyDayRollingLift}%
          </div>
          <div className="text-xs text-gray-400">Average Lift</div>
        </div>
      </div>

      {/* Explanatory Text */}
      <div className="bg-white rounded-xl p-8 border border-white/20 mb-8">
        <div className="text-2xl font-bold text-white mb-4">
          When student-athletes use branded logos/content, their posts get{' '}
          <span className="text-[#1770C0]">45% MORE ENGAGEMENT</span>
        </div>

        <div className="mb-4">
          <div className="text-lg font-bold text-white mb-3">
            Nike, Wegmans, Sheetz benefit from:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#1770C0] rounded-full" />
              <span className="text-gray-300">Higher visibility with <strong>450M+ follower reach</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#1770C0] rounded-full" />
              <span className="text-gray-300">Authentic athlete endorsements</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#1770C0] rounded-full" />
              <span className="text-gray-300">Consistent performance uplift</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#1770C0] rounded-full" />
              <span className="text-gray-300">Data-driven optimization</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Implications */}
      <div className="bg-[#091831] rounded-xl p-8 border border-white/20 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-8 h-8 text-[#1770C0]" />
          <h3 className="text-xl font-bold text-white">Revenue Implications</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-[#1770C0]">
            <div className="text-sm text-gray-300 mb-1">Each 1% engagement increase =</div>
            <div className="text-3xl font-bold text-[#1770C0]">
              ${estimatedValuePer1Percent.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">estimated brand value</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-[#1770C0]">
            <div className="text-sm text-gray-300 mb-1">45% lift on {(ipMetrics.aggregateLikesFromBrandedContent / 1000000).toFixed(1)}M+ likes =</div>
            <div className="text-3xl font-bold text-[#1770C0]">
              ${annualEstimate.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">estimated annual value</div>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl p-8 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-6">Organic vs. Branded Performance</h3>

        <div className="grid grid-cols-2 gap-6">
          {/* Organic Posts */}
          <div>
            <div className="text-sm font-semibold text-gray-300 mb-3 text-center">
              Organic Posts (Baseline)
            </div>
            <div className="relative">
              <div className="h-48 bg-gray-200 rounded-lg flex items-end justify-center p-4">
                <div
                  className="w-full bg-gradient-to-t from-gray-400 to-gray-500 rounded-t-lg flex items-end justify-center pb-3"
                  style={{ height: `${(ipMetrics.engagementRateComparison.organic / ipMetrics.engagementRateComparison.branded) * 100}%` }}
                >
                  <div className="text-2xl font-bold text-white">
                    {(ipMetrics.engagementRateComparison.organic * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Branded Posts */}
          <div>
            <div className="text-sm font-semibold text-gray-300 mb-3 text-center">
              Branded Posts (+45% Lift)
            </div>
            <div className="relative">
              <div className="h-48 bg-gray-200 rounded-lg flex items-end justify-center p-4">
                <div
                  className="w-full rounded-t-lg flex items-end justify-center pb-3 relative"
                  style={{ height: '100%', background: 'linear-gradient(to top, cyan-500, #2080D0)' }}
                >
                  <div className="text-2xl font-bold text-white">
                    {(ipMetrics.engagementRateComparison.branded * 100).toFixed(0)}%
                  </div>
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                    +{((ipMetrics.engagementRateComparison.difference / ipMetrics.engagementRateComparison.organic) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#1770C0] text-center">
          <div className="text-sm text-gray-400">
            Branded content consistently outperforms organic posts by{' '}
            <span className="font-bold text-[#1770C0]">
              {((ipMetrics.engagementRateComparison.difference / ipMetrics.engagementRateComparison.organic) * 100).toFixed(0)}%
            </span>
            , driving measurable ROI for brand partners
          </div>
        </div>
      </div>

      {/* Bottom Callout */}
      <div className="mt-8 bg-gradient-to-r from-[#1770C0] to-[#1770C0] rounded-xl p-6 text-white text-center">
        <div className="text-2xl font-bold mb-2">
          IP-Driven Content = Proven Revenue Growth
        </div>
        <div className="text-blue-100">
          Brands that leverage athlete IP see consistent, measurable performance improvements across all metrics
        </div>
      </div>
    </div>
  );
}
