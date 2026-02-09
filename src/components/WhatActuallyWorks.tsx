import { TrendingUp, DollarSign, Award, Target, ArrowUpRight } from 'lucide-react';

export function WhatActuallyWorks() {
  // IP Performance Metrics
  const ipMetrics = [
    { type: 'Visual IP Content', lift: 45, color: 'blue' },
    { type: 'Branded Posts', lift: 38, color: 'purple' },
    { type: 'Collaboration Content', lift: 52, color: 'green' },
    { type: '90-Day Rolling Average', lift: 28, color: 'amber' },
  ];

  // Revenue implications
  const organicPost = {
    reach: 10000,
    engagement: 500,
    engagementRate: 5.0,
    value: 500,
  };

  const brandedPost = {
    reach: 10000,
    engagement: 725, // 45% more
    engagementRate: 7.25,
    value: 725,
    premium: 225,
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          badge: 'bg-blue-600',
          icon: 'text-blue-600',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-900',
          badge: 'bg-[#1770C0]',
          icon: 'text-purple-600',
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          badge: 'bg-green-600',
          icon: 'text-green-600',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          badge: 'bg-amber-600',
          icon: 'text-amber-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-900',
          badge: 'bg-gray-600',
          icon: 'text-gray-600',
        };
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black tracking-wide mb-2">
          HERE'S WHAT ACTUALLY WORKS
        </h2>
        <div className="h-1.5 w-32 bg-gradient-to-r from-green-600 to-emerald-600" />
        <p className="text-lg text-gray-700 mt-4">
          IP-driven content consistently outperforms organic content. This is Playfly's secret weapon.
        </p>
      </div>

      {/* IP Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {ipMetrics.map((metric) => {
          const colors = getColorClasses(metric.color);
          return (
            <div
              key={metric.type}
              className={`${colors.bg} border-2 ${colors.border} rounded-xl p-6`}
            >
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className={`w-5 h-5 ${colors.icon}`} />
                <div className={`${colors.badge} text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1`}>
                  <ArrowUpRight className="w-3 h-3" />
                  +{metric.lift}%
                </div>
              </div>
              <div className={`text-2xl font-bold ${colors.text} mb-1`}>
                +{metric.lift}%
              </div>
              <div className="text-sm text-gray-700 font-semibold">{metric.type}</div>
            </div>
          );
        })}
      </div>

      {/* Revenue Implications */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-white mb-8">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="w-8 h-8 text-green-400" />
          <h3 className="text-2xl font-bold">What Does 45% More Engagement Mean in Dollars?</h3>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organic Post */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-sm text-gray-300 mb-3 font-semibold">ORGANIC POST</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span className="text-sm text-gray-300">Reach</span>
                <span className="text-lg font-bold">{organicPost.reach.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span className="text-sm text-gray-300">Engagement</span>
                <span className="text-lg font-bold">{organicPost.engagement.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span className="text-sm text-gray-300">Engagement Rate</span>
                <span className="text-lg font-bold">{organicPost.engagementRate}%</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-gray-300 font-semibold">Deal Value</span>
                <span className="text-2xl font-bold text-gray-400">${organicPost.value}</span>
              </div>
            </div>
          </div>

          {/* Branded Post with IP */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border-2 border-green-400">
            <div className="text-sm text-green-300 mb-3 font-semibold flex items-center gap-2">
              BRANDED POST WITH IP
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">+45%</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span className="text-sm text-gray-300">Reach</span>
                <span className="text-lg font-bold">{brandedPost.reach.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span className="text-sm text-gray-300">Engagement</span>
                <span className="text-lg font-bold text-green-300">{brandedPost.engagement.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span className="text-sm text-gray-300">Engagement Rate</span>
                <span className="text-lg font-bold text-green-300">{brandedPost.engagementRate}%</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-gray-300 font-semibold">Deal Value</span>
                <span className="text-2xl font-bold text-green-400">${brandedPost.value}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-300 font-semibold">IP Premium</span>
                <span className="text-xl font-bold text-green-300">+${brandedPost.premium}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scale Impact */}
        <div className="mt-6 bg-green-500/10 rounded-lg p-4 border border-green-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-300">+45%</div>
              <div className="text-xs text-gray-300 mt-1">Engagement Lift</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-300">$225</div>
              <div className="text-xs text-gray-300 mt-1">Premium Per Post</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-300">$81M+</div>
              <div className="text-xs text-gray-300 mt-1">Annual Opportunity at Scale</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insight Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Why This Matters */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">Why This Matters</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Branded content consistently delivers measurable ROI</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>IP-driven posts generate 45% more engagement than organic</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>90-day rolling data proves this is not a fluke—it's repeatable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Collaboration content sees the highest lift at +52%</span>
            </li>
          </ul>
        </div>

        {/* The Playfly Advantage */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-green-900">The Playfly Advantage</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Only platform with school IP rights + athlete access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Proprietary 90-day rolling analytics prove performance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Brands can buy guaranteed performance lifts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>Competitors can't replicate this without conference deals</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white text-center">
        <div className="text-2xl font-bold mb-3">
          Brands Should Pay Premium for This Guarantee
        </div>
        <div className="text-lg text-green-100 max-w-3xl mx-auto">
          This isn't just content. This is a proven, measurable, repeatable performance advantage.
          When brands pay for IP-driven content, they're buying +45% more engagement—guaranteed.
        </div>
        <div className="mt-6 flex items-center justify-center gap-8">
          <div>
            <div className="text-3xl font-bold">45%</div>
            <div className="text-sm text-green-100">Proven Lift</div>
          </div>
          <div className="text-4xl text-green-200">→</div>
          <div>
            <div className="text-3xl font-bold">Premium</div>
            <div className="text-sm text-green-100">Pricing Justified</div>
          </div>
        </div>
      </div>
    </div>
  );
}
