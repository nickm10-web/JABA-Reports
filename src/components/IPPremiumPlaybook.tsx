import { Zap, Target, CheckCircle2 } from 'lucide-react';

export function IPPremiumPlaybook() {
  // Current state vs IP Premium state
  const basePostValue = 500;
  const ipPremiumPercent = 0.30; // 30% premium (conservative vs 45% lift)
  const ipPremiumPostValue = basePostValue * (1 + ipPremiumPercent); // $650


  // Post types and their specific lifts
  const postTypes = [
    {
      type: 'Generic post',
      currentPrice: 500,
      ipPremiumPrice: 500,
      uplift: 0,
      engagementLift: 0,
      annualPosts: 0,
      annualImpact: 0,
    },
    {
      type: 'Branded post',
      currentPrice: 500,
      ipPremiumPrice: 650,
      uplift: 150,
      engagementLift: 0.38,
      annualPosts: 35680,
      annualImpact: 35680 * 150,
    },
    {
      type: 'Visual IP content',
      currentPrice: 500,
      ipPremiumPrice: 675,
      uplift: 175,
      engagementLift: 0.45,
      annualPosts: 28540,
      annualImpact: 28540 * 175,
    },
    {
      type: 'Collab content',
      currentPrice: 500,
      ipPremiumPrice: 760,
      uplift: 260,
      engagementLift: 0.52,
      annualPosts: 12460,
      annualImpact: 12460 * 260,
    },
  ];

  const totalAnnualImpact = postTypes.reduce((sum, pt) => sum + pt.annualImpact, 0);

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatPercent = (num: number): string => {
    return `${(num * 100).toFixed(0)}%`;
  };

  // Major brand deals to review
  const brandDealsToReview = [
    { brand: 'Nike', scope: 'Multi-school', useBrandedContent: true, currentValue: 2800000 },
    { brand: 'Wegmans', scope: 'Penn State', useBrandedContent: true, currentValue: 890000 },
    { brand: 'Sheetz', scope: 'Penn State', useBrandedContent: true, currentValue: 620000 },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-3 bg-yellow-100 border-2 border-yellow-400 rounded-xl px-6 py-3 mb-4">
          <Zap className="w-8 h-8 text-yellow-600" />
          <h2 className="text-3xl font-bold text-black">
            THE IP PREMIUM PLAYBOOK - Turning +45% Engagement Into Revenue
          </h2>
        </div>
        <p className="text-lg text-gray-700">Make it tactical. Make it actionable. Make it revenue.</p>
      </div>

      {/* Show the Math Clearly */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-black mb-6">The Math</h3>

        {/* Current State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-100 rounded-xl p-6 border-2 border-gray-300">
            <div className="text-sm font-semibold text-gray-700 mb-4">CURRENT STATE</div>
            <div className="space-y-3">
              <div className="text-sm text-gray-700">
                Brand wants athlete to post about their product.
              </div>
              <div className="text-sm text-gray-700">
                Post gets <span className="font-bold">X engagement</span>.
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-300">
                <div className="text-xs text-gray-600 mb-1">Brand pays</div>
                <div className="text-4xl font-bold text-gray-900">${basePostValue}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border-2 border-green-400">
            <div className="text-sm font-semibold text-green-900 mb-4">WITH IP PREMIUM</div>
            <div className="space-y-3">
              <div className="text-sm text-gray-900">
                Brand wants athlete to post <span className="font-bold text-green-700">with branded logo/content</span>.
              </div>
              <div className="text-sm text-gray-900">
                Post gets <span className="font-bold text-green-700">X + 45% engagement</span> (guaranteed by our data).
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-green-400">
                <div className="text-xs text-gray-600 mb-1">Brand should pay</div>
                <div className="text-4xl font-bold text-green-600">${ipPremiumPostValue.toFixed(0)}</div>
                <div className="text-xs text-green-700 mt-1">({formatPercent(ipPremiumPercent)} premium)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Move */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
          <div className="text-lg font-bold text-blue-900 mb-4">Your move: Either</div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                A
              </div>
              <div className="flex-1">
                <div className="font-semibold text-blue-900 mb-1">Tell brands the price is ${ipPremiumPostValue.toFixed(0)} for branded content</div>
                <div className="text-sm text-blue-800">
                  30% premium to be reasonable (vs 45% actual lift)
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                B
              </div>
              <div className="flex-1">
                <div className="font-semibold text-blue-900 mb-1">Keep price at $500 but guarantee results</div>
                <div className="text-sm text-blue-800">
                  If they don't get +30% engagement, you rebate them
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-300">
            <div className="text-center text-blue-900 font-bold">
              Either way, you're capturing the value you're creating.
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-black mb-4">Pricing Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="text-left p-3 text-sm font-semibold">Post Type</th>
                <th className="text-right p-3 text-sm font-semibold">Current Deal Price</th>
                <th className="text-right p-3 text-sm font-semibold">IP Premium Price</th>
                <th className="text-right p-3 text-sm font-semibold">Uplift</th>
                <th className="text-right p-3 text-sm font-semibold">Engagement Lift</th>
                <th className="text-right p-3 text-sm font-semibold">Annual Posts</th>
                <th className="text-right p-3 text-sm font-semibold">Annual Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {postTypes.map((pt, index) => (
                <tr key={index} className={pt.annualPosts > 0 ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}>
                  <td className="p-3 text-sm font-semibold text-gray-900">{pt.type}</td>
                  <td className="p-3 text-sm text-right text-gray-700">${pt.currentPrice}</td>
                  <td className="p-3 text-sm text-right font-bold text-green-600">
                    ${pt.ipPremiumPrice}
                  </td>
                  <td className="p-3 text-sm text-right font-bold text-blue-600">
                    {pt.uplift > 0 ? `+$${pt.uplift}` : '$0'}
                  </td>
                  <td className="p-3 text-sm text-right text-gray-700">
                    {pt.engagementLift > 0 ? `+${formatPercent(pt.engagementLift)}` : '-'}
                  </td>
                  <td className="p-3 text-sm text-right text-gray-700">
                    {pt.annualPosts > 0 ? pt.annualPosts.toLocaleString() : '-'}
                  </td>
                  <td className="p-3 text-sm text-right font-bold text-green-600">
                    {pt.annualImpact > 0 ? formatCurrency(pt.annualImpact) : '-'}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="p-3 text-sm" colSpan={6}>
                  TOTAL ANNUAL IMPACT
                </td>
                <td className="p-3 text-sm text-right text-green-600 text-xl">
                  {formatCurrency(totalAnnualImpact)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Plan */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-black mb-4">Action Plan</h3>
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border-2 border-blue-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                1
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-blue-900 mb-2">
                  Review all current Nike, Wegmans, Sheetz deals - are they using branded content?
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {brandDealsToReview.map((deal, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-blue-300">
                      <div className="font-semibold text-gray-900">{deal.brand}</div>
                      <div className="text-xs text-gray-600">{deal.scope}</div>
                      <div className="text-sm font-bold text-blue-600 mt-2">
                        {formatCurrency(deal.currentValue)}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {deal.useBrandedContent ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <span className="text-xs text-red-600">No IP usage</span>
                        )}
                        <span className="text-xs text-gray-700">
                          {deal.useBrandedContent ? 'Uses branded content' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1770C0] flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                2
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-purple-900 mb-2">
                  If yes, those deals should have 30% IP premium built in
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-300">
                  <div className="text-sm text-gray-700 mb-2">
                    Example: Nike deal currently worth <span className="font-bold">{formatCurrency(brandDealsToReview[0].currentValue)}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    With 30% IP premium: <span className="font-bold text-purple-600">{formatCurrency(brandDealsToReview[0].currentValue * 1.30)}</span>
                  </div>
                  <div className="text-sm font-semibold text-purple-900 mt-2">
                    Underpriced by: {formatCurrency(brandDealsToReview[0].currentValue * 0.30)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border-2 border-green-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                3
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-green-900 mb-2">For renewal, bake it in</div>
                <div className="text-sm text-gray-700">
                  When contracts come up for renewal, the new baseline includes the IP premium. Don't negotiate down from it.
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl p-6 border-2 border-yellow-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                4
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-yellow-900 mb-2">For new deals, start with premium pricing</div>
                <div className="text-sm text-gray-700">
                  All new brand partnerships should include IP premium from day one. It's not an add-on—it's the value you deliver.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Impact Summary */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-12 h-12" />
            <div className="text-3xl font-bold">Revenue Impact</div>
          </div>
          <div className="text-sm mb-2">See annual impact column above. Sum =</div>
          <div className="text-7xl font-bold mb-4">{formatCurrency(totalAnnualImpact)}</div>
          <div className="text-xl">new annual revenue</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" />
              <div className="text-sm">Branded posts</div>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(postTypes[1].annualImpact)}</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" />
              <div className="text-sm">Visual IP content</div>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(postTypes[2].annualImpact)}</div>
          </div>
          <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 border-2 border-yellow-300">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" />
              <div className="text-sm font-semibold">Collab content</div>
            </div>
            <div className="text-2xl font-bold text-yellow-300">{formatCurrency(postTypes[3].annualImpact)}</div>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-8 text-center">
        <div className="text-2xl font-bold text-gray-900 mb-2">
          The 45% engagement lift is real. The premium is justified. The money is there.
        </div>
        <div className="text-lg text-gray-700">
          Now it's time to <span className="font-bold text-green-600">charge for it</span>.
        </div>
      </div>
    </div>
  );
}
