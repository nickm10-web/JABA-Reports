import { ArrowDown, Heart, Eye, MessageCircle, Share2, TrendingUp, Users, Award, Zap, Star, ExternalLink } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DATA — Real metrics from Instagram + instaloader scrape
// ═══════════════════════════════════════════════════════════════

// Campaign posts
const athletePost = {
  account: '@auburnmbb',
  label: 'Auburn MBB',
  image: '/baumhowers-post.png',
  link: 'https://www.instagram.com/reel/DUEd0DmimWi/',
  likes: 1757,
  comments: 0,
  reposts: 52,
  views: 22200,
};

const brandPost = {
  account: '@baumhowersauburn',
  label: 'Brand Post',
  image: '/baumhowers-post.png',
  link: 'https://www.instagram.com/reel/DT07eUokmge/',
  likes: 103,
  comments: 1,
  reposts: 5,
  views: 4899,
  emv: 2.10,
  caption: 'A quick look back at last week, where Tahaad Pettiford and Keshawn Murphy brought the competition in Fortnite and NBA2K',
};

const combined = {
  totalLikes: athletePost.likes + brandPost.likes,
  totalViews: athletePost.views + brandPost.views,
  totalPosts: 2,
  totalEMV: brandPost.emv,
};

// Baumhower's baseline from instaloader scrape (810+ posts)
const baumhowersProfile = {
  followers: 2008,
  totalPosts: 810,
  recentAvgLikes: 26.8, // Last 30 posts excl Auburn reel
  recentAvgComments: 0.6,
  recentMedianLikes: 12,
};

// Their top posts of all time — with campaign posts inserted at their natural ranking
// The athlete post (1,757 likes) would rank #2 among Baumhower's all-time best
// The brand post (103 likes) is well above their avg of 27 but not top-10 material
const baumhowersTopPosts = [
  { rank: 1, likes: 3489, caption: 'AU Football NIL partnership announcement', year: '2023', isPartnership: true, isCampaign: false },
  { rank: 2, likes: 1777, caption: 'Football kickoff NIL announcement', year: '2024', isPartnership: true, isCampaign: false },
  { rank: 3, likes: 1757, caption: 'The Flight Gaming Show (Athlete Post)', year: '2026', isPartnership: true, isCampaign: true },
  { rank: 4, likes: 1650, caption: "Byron's Smokehouse x Baumhower's collab", year: '2025', isPartnership: true, isCampaign: false },
  { rank: 5, likes: 1211, caption: 'Track & Field NIL partnership', year: '2023', isPartnership: true, isCampaign: false },
  { rank: 6, likes: 1181, caption: 'Fallan Lanham partnership', year: '2024', isPartnership: true, isCampaign: false },
  { rank: 7, likes: 1060, caption: 'Freshman partnership announcement', year: '2023', isPartnership: true, isCampaign: false },
  { rank: 8, likes: 974, caption: 'Gymnastics NIL partnership', year: '2023', isPartnership: true, isCampaign: false },
  { rank: 9, likes: 904, caption: 'AU Football pre-season partnership', year: '2023', isPartnership: true, isCampaign: false },
  { rank: 10, likes: 812, caption: 'Sebastian Trujillo NIL partnership', year: '2025', isPartnership: true, isCampaign: false },
];

// Baumhower's recent posts for comparison (from instaloader scrape)
const baumhowersRecentPosts = [
  { date: 'Feb 8', likes: 5, caption: 'Regular post' },
  { date: 'Feb 7', likes: 12, caption: 'Regular post' },
  { date: 'Feb 5', likes: 31, caption: 'Regular post' },
  { date: 'Feb 4', likes: 4, caption: 'Regular post' },
  { date: 'Jan 29', likes: 42, caption: 'Regular post' },
  { date: 'Jan 29', likes: 15, caption: 'Regular post' },
  { date: 'Jan 28', likes: 4, caption: 'Regular post' },
  { date: 'Jan 22', likes: 103, caption: 'Auburn Campaign Reel', isAuburn: true },
  { date: 'Jan 20', likes: 5, caption: 'Regular post' },
  { date: 'Jan 15', likes: 42, caption: 'Tahaad Pettiford event' },
];

// Athlete performance
const athleteBenchmarks = [
  { name: 'Keyshawn Hall', sport: "Men's Basketball", avgLikes: '2.5K', vsAll: '+70.0%', vsSponsored: '+257.1%' },
  { name: 'Kevin Overton', sport: "Men's Basketball", avgLikes: '1.8K', vsAll: '+42.5%', vsSponsored: '+118.3%' },
];

const campaignLift = [
  {
    athleteName: 'War Eagle Plus',
    handle: '@wareagleplus',
    sport: 'Auburn Athletics Portal',
    image: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png',
    liftAmount: 1337,
    campaignAvg: 1757,
    athleteAvg: 420,
    liftPercent: 318,
  },
  {
    athleteName: 'Auburn MBB',
    handle: '@auburnmbb',
    sport: "Men's Basketball",
    image: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png',
    liftAmount: 867,
    campaignAvg: 1757,
    athleteAvg: 890,
    liftPercent: 97,
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatCurrency(num: number): string {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
  return '$' + num.toFixed(2);
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface AuburnCampaignDashboardProps {
  onBack?: () => void;
}

export function AuburnCampaignDashboard({ onBack }: AuburnCampaignDashboardProps) {
  const liftPercent = Math.round(((brandPost.likes / baumhowersProfile.recentAvgLikes) - 1) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ─── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowDown className="w-5 h-5 rotate-90" />
                </button>
              )}
              <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2.png" alt="Auburn" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-xl font-extrabold text-[#0C2340] tracking-wide uppercase">
                  Baumhower's <span className="text-[#E87722]">x</span> Auburn
                </h1>
                <p className="text-sm text-gray-500 font-medium">Campaign Performance Report</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Powered by JABA</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ─── 1. Co-Branded Hero Banner ─── */}
        <div className="rounded-2xl overflow-hidden relative">
          <div className="bg-gradient-to-r from-[#0C2340] via-[#1a3a5c] to-[#E87722] p-8 lg:p-10">
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none">
                <pattern id="heroGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                </pattern>
                <rect width="200" height="200" fill="url(#heroGrid)" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Campaign Report
                </span>
                <span className="bg-[#E87722]/30 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Jan 2026
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-2">
                Baumhower's Victory Grille
              </h2>
              <p className="text-lg text-white/80">
                "The Flight Gaming Show" — Tahaad Pettiford & Keshawn Murphy
              </p>
            </div>
          </div>
        </div>

        {/* ─── 2. Combined Campaign KPIs ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={<Heart className="w-5 h-5" />} label="Total Likes" value={formatNumber(combined.totalLikes)} accent />
          <KPICard icon={<Eye className="w-5 h-5" />} label="Total Views" value={formatNumber(combined.totalViews)} />
          <KPICard icon={<Share2 className="w-5 h-5" />} label="Campaign Posts" value={combined.totalPosts.toString()} />
          <KPICard icon={<TrendingUp className="w-5 h-5" />} label="Combined EMV" value={formatCurrency(combined.totalEMV)} accent />
        </div>

        {/* ─── 3. Post-by-Post Breakdown ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-extrabold text-[#0C2340] uppercase tracking-wide">
              Campaign Posts
            </h3>
            <p className="text-sm text-gray-500 mt-1">Side-by-side breakdown of both campaign posts</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PostCard post={athletePost} />
              <PostCard post={brandPost} />
            </div>
          </div>
        </div>

        {/* ─── 4. "Your Auburn Content Dominates Your Feed" ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E87722] to-[#C96318] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0C2340] uppercase tracking-wide">
                  Your Auburn Content Dominates Your Feed
                </h3>
                <p className="text-sm text-gray-500">How the campaign performed vs your typical posts</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Lift highlight */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <p className="text-5xl font-black text-green-600">+{liftPercent}%</p>
                  <p className="text-sm font-semibold text-green-700 mt-1">More Likes Than Your Average Post</p>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-[#E87722]">Auburn Campaign Reel</span>
                        <span className="text-sm font-extrabold text-[#E87722]">{brandPost.likes} likes</span>
                      </div>
                      <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#E87722] to-[#C96318] transition-all" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-500">Your Avg Post</span>
                        <span className="text-sm text-gray-500">{baumhowersProfile.recentAvgLikes.toFixed(0)} likes</span>
                      </div>
                      <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: `${(baumhowersProfile.recentAvgLikes / brandPost.likes) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-500">Your Median Post</span>
                        <span className="text-sm text-gray-500">{baumhowersProfile.recentMedianLikes} likes</span>
                      </div>
                      <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gray-200" style={{ width: `${(baumhowersProfile.recentMedianLikes / brandPost.likes) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Posts Table — Where This Campaign Ranks */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-[#E87722]" />
                <h4 className="text-base font-extrabold text-[#0C2340]">
                  Where This Campaign Ranks Among Your Top Posts of All Time
                </h4>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">#</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Likes</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Content</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Year</th>
                      <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {baumhowersTopPosts.map((post) => (
                      <tr
                        key={post.rank}
                        className={`transition-colors ${post.isCampaign ? 'bg-[#E87722]/5 border-l-4 border-l-[#E87722]' : 'hover:bg-gray-50'}`}
                      >
                        <td className={`px-4 py-3 text-sm font-bold ${post.isCampaign ? 'text-[#E87722]' : 'text-gray-400'}`}>
                          #{post.rank}
                        </td>
                        <td className={`px-4 py-3 text-sm font-extrabold ${post.isCampaign ? 'text-[#E87722]' : 'text-gray-900'}`}>
                          {formatNumber(post.likes)}
                        </td>
                        <td className={`px-4 py-3 text-sm ${post.isCampaign ? 'font-bold text-[#E87722]' : 'text-gray-600'}`}>
                          {post.caption}
                          {post.isCampaign && (
                            <span className="ml-2 inline-flex items-center gap-1 bg-[#E87722] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                              This Campaign
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-sm ${post.isCampaign ? 'text-[#E87722] font-semibold' : 'text-gray-400'}`}>
                          {post.year}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 bg-[#E87722]/10 text-[#E87722] text-xs font-bold px-2 py-1 rounded-md">
                            <Zap className="w-3 h-3" /> Partnership
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 bg-[#0C2340] rounded-xl p-4 text-center">
                <p className="text-white font-bold text-sm">
                  This campaign ranks
                  <span className="text-[#E87722]"> #3 among your top posts of all time</span> — and
                  <span className="text-[#E87722]"> every single one of your top 10</span> is an Auburn athlete partnership.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 5. The Auburn Amplification Effect ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0C2340] to-[#1a3a5c] flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0C2340] uppercase tracking-wide">
                  The Auburn Amplification Effect
                </h3>
                <p className="text-sm text-gray-500">What happens when Auburn athletes post your content</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Views multiplier */}
              <div className="bg-gradient-to-br from-[#0C2340] to-[#1a3a5c] rounded-xl p-6 text-white text-center">
                <p className="text-6xl font-black">{Math.round(athletePost.views / brandPost.views)}x</p>
                <p className="text-sm font-semibold text-white/80 mt-2">More Views</p>
                <p className="text-xs text-white/60 mt-1">Athlete post: {formatNumber(athletePost.views)} vs your post: {formatNumber(brandPost.views)}</p>
              </div>

              {/* Likes multiplier */}
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-4xl font-black text-[#E87722]">{Math.round(athletePost.likes / brandPost.likes)}x</p>
                <p className="text-sm font-semibold text-gray-700 mt-2">More Likes</p>
                <p className="text-xs text-gray-500 mt-1">
                  Athlete post: {formatNumber(athletePost.likes)} vs your post: {brandPost.likes}
                </p>
              </div>

              {/* Total campaign views */}
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-4xl font-black text-green-600">{formatNumber(combined.totalViews)}</p>
                <p className="text-sm font-semibold text-gray-700 mt-2">Total Campaign Views</p>
                <p className="text-xs text-gray-500 mt-1">Across both posts combined</p>
              </div>
            </div>

            {/* Visual comparison */}
            <div className="mt-6 bg-gradient-to-r from-gray-50 via-[#E87722]/5 to-gray-50 rounded-xl p-5">
              <p className="text-center text-sm font-semibold text-gray-600 mb-4">Same content, different distribution</p>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#E87722]">Athlete Post (@wareagleplus x @auburnmbb)</span>
                    <span className="text-sm font-extrabold text-[#E87722]">{formatNumber(athletePost.views)} views</span>
                  </div>
                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#E87722] to-[#C96318]" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">Your Post (@baumhowersauburn)</span>
                    <span className="text-sm text-gray-500">{formatNumber(brandPost.views)} views</span>
                  </div>
                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gray-300" style={{ width: `${(brandPost.views / athletePost.views) * 100}%` }} />
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">
                Auburn athletes amplified your content to an audience you couldn't reach alone
              </p>
            </div>
          </div>
        </div>

        {/* ─── 6. Campaign Post vs Your Recent Posts ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E87722] to-[#C96318] flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0C2340] uppercase tracking-wide">
                  Campaign Post vs Your Recent Posts
                </h3>
                <p className="text-sm text-gray-500">How the Auburn reel stacked up against your other content</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {baumhowersRecentPosts.map((post, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${post.isAuburn ? 'text-[#E87722]' : 'text-gray-500'}`}>
                        {post.date}
                      </span>
                      {post.isAuburn && (
                        <span className="bg-[#E87722]/10 text-[#E87722] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Auburn Reel
                        </span>
                      )}
                    </div>
                    <span className={`text-sm ${post.isAuburn ? 'font-extrabold text-[#E87722]' : 'text-gray-500'}`}>
                      {post.likes} likes
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${post.isAuburn ? 'bg-gradient-to-r from-[#E87722] to-[#C96318]' : 'bg-gray-300'}`}
                      style={{ width: `${(post.likes / 103) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl p-4 bg-green-50 border border-green-200 text-center">
              <p className="text-sm font-bold text-green-700">
                The Auburn campaign reel was your #1 post this month
              </p>
              <p className="text-xs text-gray-500 mt-1">103 likes vs your recent average of 27 likes (+285%)</p>
            </div>
          </div>
        </div>

        {/* ─── 7. Athlete Performance Lift ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-extrabold text-[#0C2340] uppercase tracking-wide">
              Athlete Performance
            </h3>
            <p className="text-sm text-gray-500">How Auburn athletes performed with your content</p>
          </div>
          <div className="divide-y divide-gray-100">
            {athleteBenchmarks.map((athlete) => (
              <div key={athlete.name} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-gray-900">{athlete.name}</p>
                  <p className="text-sm text-gray-500">{athlete.sport}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-semibold">Avg Likes</p>
                    <p className="text-lg font-extrabold text-gray-900">{athlete.avgLikes}</p>
                  </div>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide text-white bg-green-600">
                    {athlete.vsAll} vs All Posts
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide text-white bg-[#0C2340]">
                    {athlete.vsSponsored} vs Sponsored
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 8. Campaign Lift vs Typical Posts ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-extrabold uppercase tracking-wide text-[#0C2340]">
              Campaign Lift <span className="text-gray-400 font-medium normal-case">vs</span> Typical Posts
            </h3>
            <p className="text-sm text-gray-500">Baseline: Last 30 posts per account</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaignLift.map((lift, index) => (
                <LiftCard key={index} {...lift} />
              ))}
            </div>
          </div>
        </div>

        {/* ─── 9. Key Takeaways ─── */}
        <div className="bg-gradient-to-br from-[#0C2340] to-[#1a3a5c] rounded-2xl p-8 text-white">
          <h3 className="text-lg font-extrabold uppercase tracking-wide mb-6 text-[#E87722]">
            Key Takeaways
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TakeawayCard
              number="01"
              text="Auburn athlete partnerships are your top-performing content strategy — all 10 of your highest-engagement posts are athlete partnerships."
            />
            <TakeawayCard
              number="02"
              text={`The athlete post generated ${formatNumber(athletePost.views)} views and ${formatNumber(athletePost.likes)} likes — ${Math.round(athletePost.views / brandPost.views)}x more views than your own post of the same content.`}
            />
            <TakeawayCard
              number="03"
              text={`The campaign reel was your best-performing post this month, outperforming your average by +${liftPercent}%.`}
            />
            <TakeawayCard
              number="04"
              text="Recommendation: Continue investing in Auburn athlete partnerships for maximum brand visibility and audience growth."
            />
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="https://a.espncdn.com/i/teamlogos/ncaa/500/2.png" alt="Auburn" className="w-6 h-6" />
          <span className="font-semibold text-[#0C2340]">Auburn Athletics</span>
        </div>
        <p>Campaign Performance Report</p>
        <p className="mt-1 text-xs">{new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function KPICard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${accent ? 'bg-[#E87722]/5 border-[#E87722]/20' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className={`mb-2 ${accent ? 'text-[#E87722]' : 'text-gray-400'}`}>{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-black ${accent ? 'text-[#E87722]' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function PostCard({ post }: { post: typeof athletePost }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        <img
          src={post.image}
          alt={post.label}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&h=400&fit=crop';
          }}
        />
        <div className="absolute top-3 left-3 bg-black/70 text-white px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
          {post.label}
        </div>
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 bg-white/90 text-gray-700 p-2 rounded-lg hover:bg-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="p-4">
        <p className="text-sm font-bold text-[#0C2340] mb-3">{post.account}</p>
        <div className="grid grid-cols-2 gap-3">
          <MetricPill icon={<Heart className="w-3.5 h-3.5" />} label="Likes" value={formatNumber(post.likes)} />
          <MetricPill icon={<Eye className="w-3.5 h-3.5" />} label="Views" value={formatNumber(post.views)} />
          <MetricPill icon={<MessageCircle className="w-3.5 h-3.5" />} label="Comments" value={post.comments.toString()} />
          {post.reposts > 0 && (
            <MetricPill icon={<Share2 className="w-3.5 h-3.5" />} label="Reposts" value={post.reposts.toString()} />
          )}
        </div>
      </div>
    </div>
  );
}

function MetricPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
      <span className="text-gray-400">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function LiftCard({ athleteName, sport, image, liftAmount, campaignAvg, athleteAvg, liftPercent }: {
  athleteName: string;
  handle?: string;
  sport: string;
  image: string;
  liftAmount: number;
  campaignAvg: number;
  athleteAvg: number;
  liftPercent?: number;
}) {
  const isNegative = liftAmount < 0;
  const absLift = Math.abs(liftAmount);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="relative px-5 py-4 bg-gradient-to-br from-[#E87722] to-[#C96318] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <pattern id={`lift-${athleteName}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="4" height="8" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#lift-${athleteName})`} />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <img src={image} alt={athleteName} className="w-14 h-14 rounded-full object-contain bg-white p-1 border-2 border-white/40" />
          <div>
            <p className="text-white text-xl font-extrabold">
              {isNegative ? '' : '+'}{formatNumber(absLift)} Likes
            </p>
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">vs their average post</p>
          </div>
        </div>
      </div>
      <div className="bg-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-gray-900">{athleteName}</p>
            <p className="text-sm text-gray-500">{sport}</p>
          </div>
          {liftPercent !== undefined && (
            <span className={`text-lg font-extrabold ${isNegative ? 'text-red-500' : 'text-green-600'}`}>
              {isNegative ? '' : '+'}{liftPercent}%
            </span>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm">
            <span className="font-bold text-[#E87722]">Campaign: {formatNumber(campaignAvg)}</span>
            <span className="text-gray-400 mx-2">&bull;</span>
            <span className="text-gray-500">Avg: {formatNumber(athleteAvg)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function TakeawayCard({ number, text }: { number: string; text: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
      <span className="text-[#E87722] text-3xl font-black">{number}</span>
      <p className="text-white/90 text-sm mt-2 leading-relaxed">{text}</p>
    </div>
  );
}

export default AuburnCampaignDashboard;
