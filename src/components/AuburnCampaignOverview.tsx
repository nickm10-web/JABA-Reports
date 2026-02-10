import { ArrowLeft, Heart, Eye, MessageCircle, Share2, Award, ExternalLink, Trophy } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════

const campaignData = {
  school: {
    name: 'Auburn',
    sport: 'Basketball',
    logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png', // Auburn logo
  },
  brand: {
    name: "Baumhower's",
    logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png',
  },
  featuredAthletes: [
    {
      name: 'Tahaad Pettiford',
      position: 'Point Guard',
      image: '/tahaad.png',
    },
    {
      name: 'Keshawn Murphy',
      position: 'Guard',
      image: '/keshawn.png',
    },
  ],
  brandPartner: {
    name: "Auburn Men's Basketball",
    type: 'Team Account',
    logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png',
  },
  metrics: {
    totalEngagements: 29017,
    athletes: 2,
    posts: 2,
    likes: 1860,
    comments: 1,
    views: 27099,
    reposts: 57,
  },
};

// Campaign posts data
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
  caption: 'A quick look back at last week, where Tahaad Pettiford and Keshawn Murphy brought the competition in Fortnite and NBA2K',
};

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

const partnershipStats = {
  totalPosts: 840,
  partnershipPosts: 209,
  nonPartnershipPosts: 631,
  partnershipPercentage: 25,
  avgPartnershipLikes: 74,
  avgNonPartnershipLikes: 17,
  engagementMultiplier: 31, // Top partnership (3,489) vs top non-partnership (111)
};

const topPartnershipPosts = [
  { rank: 1, athlete: 'Jarquez Hunter', sport: 'Football', emoji: '🏈', likes: 3489, year: 2023 },
  { rank: 2, athlete: 'Perry Thompson', sport: 'Football', emoji: '🏈', likes: 1777, year: 2024 },
  { rank: 3, athlete: 'THIS CAMPAIGN', sport: 'Basketball', emoji: '🏀', likes: 1757, year: 2026, isCurrent: true },
  { rank: 4, athlete: "Byron's Smokehouse Collab", sport: 'Basketball', emoji: '🏀', likes: 1650, year: 2025 },
  { rank: 5, athlete: 'Charlie Sexton', sport: 'Track & Field', emoji: '🏃', likes: 1211, year: 2023 },
  { rank: 6, athlete: 'Fallan Lanham', sport: 'Volleyball', emoji: '🏐', likes: 1181, year: 2024 },
  { rank: 7, athlete: 'Ike Irish', sport: 'Baseball', emoji: '⚾', likes: 1060, year: 2023 },
  { rank: 8, athlete: 'Sophia Groth', sport: 'Gymnastics', emoji: '🤸', likes: 974, year: 2023 },
  { rank: 9, athlete: 'Keldric Faulk', sport: 'Football', emoji: '🏈', likes: 904, year: 2023 },
  { rank: 10, athlete: 'Sebastian Williams', sport: 'Basketball', emoji: '🏀', likes: 812, year: 2025 },
];

const topNonPartnershipPosts = [
  { rank: 1, title: 'Staff Spotlight', likes: 111, year: 2024 },
  { rank: 2, title: 'Game Day Promotion', likes: 70, year: 2021 },
  { rank: 3, title: 'Best Wings in Auburn', likes: 64, year: 2024 },
  { rank: 4, title: 'Patio Reopening', likes: 60, year: 2023 },
  { rank: 5, title: 'Auburn vs Kentucky', likes: 59, year: 2022 },
  { rank: 6, title: 'Live Music Event', likes: 58, year: 2024 },
  { rank: 7, title: 'Restaurant Week', likes: 57, year: 2025 },
  { rank: 8, title: 'Owner Birthday', likes: 56, year: 2021 },
  { rank: 9, title: 'Official Watch Spot', likes: 54, year: 2022 },
  { rank: 10, title: 'Ice Cold Beers', likes: 52, year: 2024 },
];

const athleteBenchmarks = [
  { name: 'Keyshawn Hall', sport: "Men's Basketball", avgLikes: '2.5K', vsAll: '+70.0%', vsSponsored: '+257.1%' },
  { name: 'Kevin Overton', sport: "Men's Basketball", avgLikes: '1.8K', vsAll: '+42.5%', vsSponsored: '+118.3%' },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

interface AuburnCampaignOverviewProps {
  onBack?: () => void;
}

export function AuburnCampaignOverview({ onBack }: AuburnCampaignOverviewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ─── */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to Hub</span>
          </button>
        )}
        <h1 className="text-4xl font-black tracking-tight">
          <span className="text-gray-900">CAMPAIGN</span>
          <span className="text-[#E87722] italic">OVERVIEW</span>
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* ─── Campaign Selector ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 inline-flex items-center gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            {/* School Logo & Info */}
            <div className="w-16 h-16 rounded-lg bg-white p-2 flex items-center justify-center">
              <img
                src={campaignData.school.logo}
                alt={campaignData.school.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-gray-900">
                {campaignData.school.name}
              </h2>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                {campaignData.school.sport}
              </p>
            </div>

            {/* Close button */}
            <button className="ml-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors">
              <span className="text-lg leading-none">&times;</span>
            </button>
          </div>

          {/* Brand Badge */}
          <div className="flex items-center gap-4">
            <img
              src="/baumhowers-logo.jpg"
              alt="Baumhower's"
              className="w-20 h-20 object-contain"
            />
            <div>
              <h2 className="text-xl font-black uppercase text-gray-900">
                Auburn
              </h2>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                Baumhower's
              </p>
            </div>
          </div>
        </div>

        {/* ─── Featured Athletes & Brand Partner ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured Athletes */}
          {campaignData.featuredAthletes.map((athlete, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#E87722] mb-3">
                Featured Athlete
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden">
                  <img
                    src={athlete.image}
                    alt={athlete.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/100';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{athlete.name}</h3>
                  <p className="text-sm text-gray-500">{athlete.position}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Brand Partner */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#E87722] mb-3">
              Brand Partner
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#0C2340] p-2 flex-shrink-0 flex items-center justify-center">
                <img
                  src={campaignData.brandPartner.logo}
                  alt={campaignData.brandPartner.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {campaignData.brandPartner.name}
                </h3>
                <p className="text-sm text-gray-500">{campaignData.brandPartner.type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Metrics Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Auburn Navy Card - Total Engagements Only */}
          <div className="md:col-span-1 bg-gradient-to-br from-[#0C2340] via-[#1a3a5c] to-[#0C2340] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1.5" fill="white" />
                </pattern>
                <rect width="100" height="100" fill="url(#dots)" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col justify-center h-full">
              {/* Total Engagements */}
              <div>
                <p className="text-sm uppercase tracking-wider font-semibold text-white/80 mb-2">
                  Total Engagements
                </p>
                <p className="text-5xl font-black">{formatNumber(campaignData.metrics.totalEngagements)}</p>
                <p className="text-xs text-white/70 mt-2">Likes, comments, views, and reposts combined</p>
              </div>
            </div>
          </div>

          {/* Right Side - 6 Metric Cards */}
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard label="Athletes" value={campaignData.metrics.athletes.toString()} />
            <MetricCard label="# of Posts" value={campaignData.metrics.posts.toString()} />
            <MetricCard label="Likes" value={formatNumber(campaignData.metrics.likes)} />
            <MetricCard label="Comments" value={campaignData.metrics.comments.toString()} />
            <MetricCard label="Views" value={formatNumber(campaignData.metrics.views)} />
            <MetricCard label="Reposts" value={campaignData.metrics.reposts.toString()} />
          </div>
        </div>

        {/* ─── Campaign Posts Breakdown ─── */}
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

        {/* ─── Partnership Content Dominates Your Best Performance ─── */}
        <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E87722]/5 via-transparent to-[#0C2340]/5 pointer-events-none"></div>
          <div className="relative px-6 py-4 border-b border-gray-100/50 bg-white/60 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E87722] to-[#C96318] flex items-center justify-center shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0C2340] uppercase tracking-wide">
                  How Auburn Partnerships Amplify Your Reach
                </h3>
                <p className="text-sm text-gray-500">Strategic athlete collaborations create breakthrough visibility moments</p>
              </div>
            </div>
          </div>
          <div className="relative p-6 space-y-6">
            {/* Hero Stats - 2 Large Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#E87722] to-[#C96318] rounded-xl p-6 text-center text-white">
                <p className="text-5xl font-black mb-2">{partnershipStats.engagementMultiplier}x</p>
                <p className="text-sm font-semibold uppercase tracking-wide opacity-90">More Engagement</p>
                <p className="text-xs opacity-75 mt-1">Top partnership vs top regular post</p>
              </div>
              <div className="bg-gradient-to-br from-[#0C2340] to-[#1a3a5c] rounded-xl p-6 text-center text-white">
                <p className="text-5xl font-black mb-2">#3</p>
                <p className="text-sm font-semibold uppercase tracking-wide opacity-90">All-Time Ranking</p>
                <p className="text-xs opacity-75 mt-1">This campaign ranks 3rd out of {partnershipStats.partnershipPosts} partnership posts</p>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {/* LEFT COLUMN - Top 10 WITH Auburn Partnerships */}
              <div className="relative bg-gradient-to-br from-white via-orange-50/30 to-white rounded-xl border border-[#E87722]/30 overflow-hidden shadow-lg backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E87722]/10 via-transparent to-[#E87722]/5 pointer-events-none"></div>
                <div className="relative bg-gradient-to-r from-[#E87722] to-[#C96318] px-4 py-3 flex items-center gap-2 shadow-md">
                  <Trophy className="w-5 h-5 text-white drop-shadow-lg" />
                  <h4 className="text-sm font-extrabold uppercase tracking-wide text-white drop-shadow-md">
                    Top 10 WITH Auburn Partnerships
                  </h4>
                </div>
                <div className="relative p-4 space-y-2 max-h-[500px] overflow-y-auto bg-white/40 backdrop-blur-sm">
                  {topPartnershipPosts.map((post) => {
                    const maxLikes = topPartnershipPosts[0].likes;
                    const widthPercent = (post.likes / maxLikes) * 100;

                    return (
                      <div
                        key={post.rank}
                        className={`rounded-lg p-3 transition-all ${
                          post.isCurrent
                            ? 'bg-[#E87722]/10 border-2 border-[#E87722]'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${post.isCurrent ? 'text-[#E87722]' : 'text-gray-400'}`}>
                              #{post.rank}
                            </span>
                            <span className="text-lg">{post.emoji}</span>
                            <span className={`text-sm font-bold ${post.isCurrent ? 'text-[#E87722]' : 'text-gray-900'}`}>
                              {post.athlete}
                              {post.isCurrent && <span className="ml-2">⭐</span>}
                            </span>
                          </div>
                          <span className={`text-sm font-extrabold ${post.isCurrent ? 'text-[#E87722]' : 'text-gray-600'}`}>
                            {formatNumber(post.likes)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              post.isCurrent
                                ? 'bg-gradient-to-r from-[#E87722] to-[#C96318]'
                                : 'bg-gray-400'
                            }`}
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{post.sport} • {post.year}</p>
                      </div>
                    );
                  })}
                  <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                    <p className="text-xs font-semibold text-gray-500">
                      Average: <span className="text-[#E87722] font-bold">{partnershipStats.avgPartnershipLikes} likes</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Top 10 WITHOUT Auburn Partnerships */}
              <div className="relative bg-gradient-to-br from-white via-gray-50/30 to-white rounded-xl border border-gray-300/50 overflow-hidden shadow-lg backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 via-transparent to-gray-400/5 pointer-events-none"></div>
                <div className="relative bg-gradient-to-r from-gray-500 to-gray-600 px-4 py-3 flex items-center gap-2 shadow-md">
                  <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <h4 className="text-sm font-extrabold uppercase tracking-wide text-white drop-shadow-md">
                    Top 10 WITHOUT Auburn Partnerships
                  </h4>
                </div>
                <div className="relative p-4 space-y-2 max-h-[500px] overflow-y-auto bg-white/40 backdrop-blur-sm">
                  {/* Real non-partnership posts */}
                  {topNonPartnershipPosts.map((post) => {
                    const maxLikes = topNonPartnershipPosts[0].likes;
                    const widthPercent = (post.likes / maxLikes) * 100;

                    return (
                      <div key={post.rank} className="rounded-lg p-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-400">#{post.rank}</span>
                            <span className="text-sm font-bold text-gray-900">{post.title}</span>
                          </div>
                          <span className="text-sm font-extrabold text-gray-600">{post.likes}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gray-400" style={{ width: `${widthPercent}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{post.year}</p>
                      </div>
                    );
                  })}

                  <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                    <p className="text-xs font-semibold text-gray-500">
                      Average: <span className="text-gray-700 font-bold">{partnershipStats.avgNonPartnershipLikes} likes</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Campaign Post vs Your Recent Posts ─── */}
        <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E87722]/5 via-transparent to-[#0C2340]/5 pointer-events-none"></div>
          <div className="relative px-6 py-4 border-b border-gray-100/50 bg-white/60 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E87722] to-[#C96318] flex items-center justify-center shadow-lg">
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
          <div className="relative p-6">
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

        {/* ─── Athlete Performance Lift ─── */}
        <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E87722]/5 via-transparent to-[#0C2340]/5 pointer-events-none"></div>
          <div className="relative px-6 py-4 border-b border-gray-100/50 bg-white/60 backdrop-blur-sm">
            <h3 className="text-lg font-extrabold text-[#0C2340] uppercase tracking-wide">
              Athlete Performance
            </h3>
            <p className="text-sm text-gray-500">How Auburn athletes performed with your content</p>
          </div>
          <div className="relative divide-y divide-gray-100/50 bg-white/40 backdrop-blur-sm">
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
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
        {label}
      </p>
      <p className="text-3xl font-black text-gray-900">{value}</p>
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

export default AuburnCampaignOverview;
