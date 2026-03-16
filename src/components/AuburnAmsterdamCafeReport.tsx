import { useState } from 'react';
import { ArrowLeft, Heart, Eye, MessageCircle, Share2, Award, ExternalLink, Trophy } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// DATA — Dual-brand campaign: Amsterdam Cafe + Rocco's Chicken Joint
// ═══════════════════════════════════════════════════════════════

const campaignData = {
  school: {
    name: 'Auburn',
    sport: 'Basketball',
    logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2.png',
  },
  brands: [
    {
      name: 'Amsterdam Cafe',
      handle: '@amsterdamcafeauburn',
      logo: '/amsterdam_logo.png',
    },
    {
      name: "Rocco's Chicken Joint",
      handle: '@roccoschickenjoint',
      logo: '/roccos_logo.png',
    },
  ],
  featuredAthletes: [
    {
      name: 'Keshawn Murphy',
      position: 'Guard',
      image: '/keshawn.png',
    },
  ],
  metrics: {
    totalEngagements: 1254,
    athletes: 1,
    posts: 2,
    likes: 1219,
    comments: 35,
    views: 23668,
    reposts: 0,
  },
};

// ─── Campaign Posts ───
const amsterdamPost = {
  account: '@amsterdamcafeauburn',
  label: 'Amsterdam Cafe',
  image: '/amsterdam-cafe-post.png',
  link: 'https://www.instagram.com/reel/DVL5MZQAD2X/',
  likes: 531,
  comments: 12,
  reposts: 0,
  views: 10263,
  caption: 'Tough loss last night, but still had big fun welcoming @yoo.keshawn to help us out in the kitchen.',
};

const roccosPost = {
  account: '@roccoschickenjoint',
  label: "Rocco's Chicken Joint",
  image: '/roccos-post.png',
  link: 'https://www.instagram.com/reel/DVGpp8GjfWz/',
  likes: 688,
  comments: 23,
  reposts: 0,
  views: 13405,
  caption: '',
};

// ─── Amsterdam Cafe Analysis (100 posts, 4,540 followers) ───
const amsterdamStats = {
  totalPosts: 100,
  avgLikes: 71,
  campaignRank: 1,
  campaignRankLabel: '#1 post of all time',
  vsAvgMultiplier: '7.5x',
  vsBestNonAuburnMultiplier: '1.1x',
};

type AllTimePost = {
  rank: number;
  title: string;
  likes: number;
  year: number;
  isAuburn?: boolean;
  isCurrent?: boolean;
};

const amsterdamAllTimePosts: AllTimePost[] = [
  { rank: 1, title: 'Keshawn Murphy Campaign Reel', likes: 531, year: 2026, isAuburn: true, isCurrent: true },
  { rank: 2, title: 'Gift Card Giveaway', likes: 496, year: 2026 },
  { rank: 3, title: 'Amsterdam is growing!', likes: 471, year: 2023 },
  { rank: 4, title: 'North Auburn Now Open!', likes: 285, year: 2023 },
  { rank: 5, title: "Moore's Mill New Location", likes: 282, year: 2023 },
  { rank: 6, title: 'Open Table Mention', likes: 235, year: 2021 },
  { rank: 7, title: 'Experience Flavor Like Never Before', likes: 193, year: 2023 },
  { rank: 8, title: 'Honey Basil Crusted Snapper', likes: 138, year: 2021 },
  { rank: 9, title: 'Southwest Burrito Bowl', likes: 124, year: 2021 },
  { rank: 10, title: 'JNJ Marketplace Collab', likes: 95, year: 2021 },
];

const amsterdamRecentPosts: { date: string; likes: number; caption: string; isAuburn?: boolean }[] = [
  { date: 'Feb 25', likes: 531, caption: 'Keshawn Murphy in the kitchen', isAuburn: true },
  { date: 'Feb 13', likes: 35, caption: "Valentine's Day Menu" },
  { date: 'Jan 28', likes: 496, caption: 'Gift Card Giveaway' },
  { date: 'Jan 22', likes: 11, caption: 'Photo post' },
  { date: 'Apr 5', likes: 61, caption: 'Auburn MBB Final Four', isAuburn: true },
  { date: 'Dec 31', likes: 49, caption: 'Happy New Year from Jimmy' },
  { date: 'Nov 6', likes: 32, caption: 'Game Day — War Eagle!', isAuburn: true },
  { date: 'Oct 10', likes: 26, caption: 'Wine Walkabout' },
  { date: 'Sep 18', likes: 31, caption: 'Wine Walkabout Promo' },
  { date: 'Apr 25', likes: 29, caption: 'Photo post' },
  { date: 'Apr 3', likes: 25, caption: 'Wine Dinner' },
  { date: 'Oct 5', likes: 282, caption: "Moore's Mill New Location" },
  { date: 'Aug 11', likes: 93, caption: 'Lemonade Cake' },
  { date: 'Aug 3', likes: 285, caption: 'North Auburn Now Open!' },
  { date: 'Aug 2', likes: 193, caption: 'Experience Flavor' },
];

// ─── Rocco's Analysis (48 posts, 542 followers) ───
const roccosStats = {
  totalPosts: 48,
  avgLikes: 23,
  campaignRank: 1,
  campaignRankLabel: '#1 post of all time',
  vsAvgMultiplier: '30x',
  vsBestNonAuburnMultiplier: '10x',
};

const roccosAllTimePosts: AllTimePost[] = [
  { rank: 1, title: 'Keshawn Murphy Campaign Reel', likes: 688, year: 2026, isAuburn: true, isCurrent: true },
  { rank: 2, title: 'Good food brings us all together', likes: 68, year: 2023 },
  { rank: 3, title: 'NOW OPEN! Grand Opening', likes: 59, year: 2023 },
  { rank: 4, title: 'Stopping in after church', likes: 55, year: 2023 },
  { rank: 5, title: "Article about Rocco's", likes: 49, year: 2023 },
  { rank: 6, title: "Rocco's Love", likes: 34, year: 2023 },
  { rank: 7, title: 'Dip it good — ROC Sauce', likes: 33, year: 2023 },
  { rank: 8, title: "Saturday with Rocco's Love", likes: 33, year: 2023 },
  { rank: 9, title: 'Countdown to kickoff', likes: 27, year: 2023 },
  { rank: 10, title: "Subtle Rocco's flex", likes: 27, year: 2023 },
];

const roccosRecentPosts: { date: string; likes: number; caption: string; isAuburn?: boolean }[] = [
  { date: 'Feb 23', likes: 688, caption: 'Auburn Campaign Reel', isAuburn: true },
  { date: 'Sep 16', likes: 10, caption: 'Tailgate Packages' },
  { date: 'May 10', likes: 10, caption: 'Kids Shirts' },
  { date: 'Apr 16', likes: 14, caption: 'Photo post' },
  { date: 'Mar 19', likes: 9, caption: 'AJHS PTO Restaurant Night' },
  { date: 'Mar 19', likes: 6, caption: 'Catering' },
  { date: 'Jan 19', likes: 11, caption: 'Be a Fan Favorite!' },
  { date: 'Dec 23', likes: 21, caption: 'Holiday post' },
  { date: 'Nov 17', likes: 11, caption: 'Christmas Gift Cards' },
  { date: 'Oct 18', likes: 10, caption: 'Spooky Season' },
  { date: 'Sep 27', likes: 11, caption: 'Early Bird Sunday' },
  { date: 'Sep 20', likes: 19, caption: 'New Catfish Plate' },
  { date: 'Aug 28', likes: 27, caption: 'Countdown to Kickoff' },
  { date: 'Aug 8', likes: 20, caption: 'Schools in Session' },
  { date: 'Jun 30', likes: 20, caption: 'Merch Drop!' },
];

// ─── Athlete Benchmarks ───
const athleteBenchmarks = [
  { name: 'Keshawn Murphy', sport: "Men's Basketball", avgLikes: '610', vsAll: '+649%', vsSponsored: '+1,196%' },
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

interface AuburnAmsterdamCafeReportProps {
  onBack?: () => void;
}

type BrandTab = 'amsterdam' | 'roccos';

export function AuburnAmsterdamCafeReport({ onBack }: AuburnAmsterdamCafeReportProps) {
  const [activeTab, setActiveTab] = useState<BrandTab>('amsterdam');

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
          <span className="text-gray-900">DINERS, DRIVE-INS</span>
          {' '}
          <span className="text-[#E87722] italic">AND DIVES</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">Auburn NIL Max Campaign Report</p>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* ─── Campaign Selector — 3-way: Auburn x Amsterdam x Rocco's ─── */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {/* Auburn */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center shrink-0">
              <img
                src={campaignData.school.logo}
                alt={campaignData.school.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black uppercase text-gray-900 leading-tight">
                {campaignData.school.name}
              </h2>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {campaignData.school.sport}
              </p>
            </div>
          </div>

          <span className="text-[#E87722] font-black text-xl sm:text-3xl leading-none select-none shrink-0">&times;</span>

          {/* Amsterdam Cafe */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center shrink-0">
              <img
                src={campaignData.brands[0].logo}
                alt={campaignData.brands[0].name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/100?text=AC';
                }}
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black uppercase text-gray-900 leading-tight">
                {campaignData.brands[0].name}
              </h2>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Auburn</p>
            </div>
          </div>

          <span className="text-[#E87722] font-black text-xl sm:text-3xl leading-none select-none shrink-0">&times;</span>

          {/* Rocco's */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center shrink-0">
              <img
                src={campaignData.brands[1].logo}
                alt={campaignData.brands[1].name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/100?text=RC';
                }}
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black uppercase text-gray-900 leading-tight">
                Rocco&apos;s
              </h2>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Auburn</p>
            </div>
          </div>
        </div>

        {/* ─── Featured Athlete & Brand Partners ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured Athlete */}
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

          {/* Brand Partner 1 — Amsterdam Cafe */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#E87722] mb-3">
              Brand Partner
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 p-2 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={campaignData.brands[0].logo}
                  alt={campaignData.brands[0].name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/100?text=AC';
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{campaignData.brands[0].name}</h3>
                <p className="text-sm text-gray-500">{campaignData.brands[0].handle}</p>
              </div>
            </div>
          </div>

          {/* Brand Partner 2 — Rocco's */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#E87722] mb-3">
              Brand Partner
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 p-2 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={campaignData.brands[1].logo}
                  alt={campaignData.brands[1].name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/100?text=RC';
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{campaignData.brands[1].name}</h3>
                <p className="text-sm text-gray-500">{campaignData.brands[1].handle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Combined Campaign Metrics ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-gradient-to-br from-[#0C2340] via-[#1a3a5c] to-[#0C2340] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="ddd-dots" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1.5" fill="white" />
                </pattern>
                <rect width="100" height="100" fill="url(#ddd-dots)" />
              </svg>
            </div>
            <div className="relative z-10 flex flex-col justify-center h-full">
              <div>
                <p className="text-sm uppercase tracking-wider font-semibold text-white/80 mb-2">
                  Total Engagements
                </p>
                <p className="text-5xl font-black">{formatNumber(campaignData.metrics.totalEngagements)}</p>
                <p className="text-xs text-white/70 mt-2">Combined across both brand reels</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard label="Athletes" value={campaignData.metrics.athletes.toString()} />
            <MetricCard label="# of Posts" value={campaignData.metrics.posts.toString()} />
            <MetricCard label="Likes" value={formatNumber(campaignData.metrics.likes)} />
            <MetricCard label="Comments" value={campaignData.metrics.comments.toString()} />
            <MetricCard label="Views" value={formatNumber(campaignData.metrics.views)} />
            <MetricCard label="Reposts" value={formatNumber(campaignData.metrics.reposts)} />
          </div>
        </div>

        {/* ─── Campaign Reels — Both brand posts side-by-side ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-extrabold text-[#0C2340] uppercase tracking-wide">
              Campaign Reels
            </h3>
            <p className="text-sm text-gray-500 mt-1">Side-by-side breakdown of both restaurant reels</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PostCard post={amsterdamPost} />
              <PostCard post={roccosPost} />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            BRAND ANALYSIS TABS
            ════════════════════════════════════════════════════════════ */}

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-gray-100 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('amsterdam')}
            className={`flex-1 flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all ${
              activeTab === 'amsterdam'
                ? 'bg-white text-[#0C2340] shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <img src={campaignData.brands[0].logo} alt="" className="w-7 h-7 object-contain rounded" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            Amsterdam Cafe
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'amsterdam' ? 'bg-[#E87722]/10 text-[#E87722]' : 'bg-gray-200 text-gray-500'}`}>
              {amsterdamStats.totalPosts} posts
            </span>
          </button>
          <button
            onClick={() => setActiveTab('roccos')}
            className={`flex-1 flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all ${
              activeTab === 'roccos'
                ? 'bg-white text-[#0C2340] shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <img src={campaignData.brands[1].logo} alt="" className="w-7 h-7 object-contain rounded" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            Rocco&apos;s Chicken Joint
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'roccos' ? 'bg-[#E87722]/10 text-[#E87722]' : 'bg-gray-200 text-gray-500'}`}>
              {roccosStats.totalPosts} posts
            </span>
          </button>
        </div>

        {/* ─── Tab Content ─── */}
        {activeTab === 'amsterdam' && (
          <>
            {/* All-Time Top Posts */}
            <AllTimeTopPosts
              brandName="Amsterdam Cafe"
              posts={amsterdamAllTimePosts}
              stats={amsterdamStats}
            />

            {/* Campaign Post vs Recent Posts */}
            {amsterdamRecentPosts.length > 0 && (
              <RecentPostsComparison
                brandName="Amsterdam Cafe"
                recentPosts={amsterdamRecentPosts}
              />
            )}
          </>
        )}

        {activeTab === 'roccos' && (
          <>
            {/* All-Time Top Posts */}
            <AllTimeTopPosts
              brandName="Rocco's Chicken Joint"
              posts={roccosAllTimePosts}
              stats={roccosStats}
            />

            {/* Campaign Post vs Recent Posts */}
            {roccosRecentPosts.length > 0 && (
              <RecentPostsComparison
                brandName="Rocco's Chicken Joint"
                recentPosts={roccosRecentPosts}
              />
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════
            ATHLETE PERFORMANCE
            ════════════════════════════════════════════════════════════ */}

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
// REUSABLE SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════

function AllTimeTopPosts({
  brandName,
  posts,
  stats,
}: {
  brandName: string;
  posts: AllTimePost[];
  stats: { totalPosts: number; avgLikes: number; campaignRankLabel: string; vsAvgMultiplier: string; vsBestNonAuburnMultiplier: string };
}) {
  const maxLikes = posts[0]?.likes ?? 1;
  return (
    <>
      <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E87722]/5 via-transparent to-[#0C2340]/5 pointer-events-none"></div>
        <div className="relative px-6 py-4 border-b border-gray-100/50 bg-white/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E87722] to-[#C96318] flex items-center justify-center shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#0C2340] uppercase tracking-wide">
                {brandName} — All-Time Top 10 Posts
              </h3>
              <p className="text-sm text-gray-500">Out of {stats.totalPosts} posts analyzed &bull; Auburn campaign posts highlighted</p>
            </div>
          </div>
        </div>
        <div className="relative p-6 space-y-2.5">
          {posts.map((post) => {
            const widthPercent = (post.likes / maxLikes) * 100;
            return (
              <div
                key={post.rank}
                className={`rounded-lg p-3.5 transition-all ${
                  post.isCurrent
                    ? 'bg-[#E87722]/10 border-2 border-[#E87722] shadow-md'
                    : post.isAuburn
                      ? 'bg-orange-50 border border-[#E87722]/20'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-sm font-black w-7 ${post.isCurrent ? 'text-[#E87722]' : post.isAuburn ? 'text-[#E87722]/70' : 'text-gray-400'}`}>
                      #{post.rank}
                    </span>
                    <span className={`text-sm font-bold ${post.isCurrent ? 'text-[#E87722]' : 'text-gray-900'}`}>
                      {post.title}
                    </span>
                    {post.isCurrent && (
                      <span className="bg-[#E87722] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        This Campaign &#11088;
                      </span>
                    )}
                    {post.isAuburn && !post.isCurrent && (
                      <span className="bg-[#E87722]/15 text-[#E87722] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Auburn
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-extrabold tabular-nums ${post.isCurrent ? 'text-[#E87722]' : 'text-gray-600'}`}>
                    {formatNumber(post.likes)}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      post.isCurrent
                        ? 'bg-gradient-to-r from-[#E87722] to-[#C96318]'
                        : post.isAuburn
                          ? 'bg-[#E87722]/50'
                          : 'bg-gray-400'
                    }`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{post.year}</p>
              </div>
            );
          })}
          <div className="mt-3 pt-3 border-t border-gray-200 text-center">
            <p className="text-xs font-semibold text-gray-500">
              Average across all {stats.totalPosts} posts: <span className="text-gray-700 font-bold">{stats.avgLikes} likes</span>
            </p>
          </div>
        </div>
      </div>

      {/* Hero Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#E87722] to-[#C96318] rounded-xl p-6 text-center text-white">
          <p className="text-4xl font-black mb-2">{stats.campaignRankLabel}</p>
          <p className="text-sm font-semibold uppercase tracking-wide opacity-90">All-Time Ranking</p>
          <p className="text-xs opacity-75 mt-1">Out of {stats.totalPosts} {brandName} posts</p>
        </div>
        <div className="bg-gradient-to-br from-[#0C2340] to-[#1a3a5c] rounded-xl p-6 text-center text-white">
          <p className="text-5xl font-black mb-2">{stats.vsBestNonAuburnMultiplier}</p>
          <p className="text-sm font-semibold uppercase tracking-wide opacity-90">vs Best Non-Auburn Post</p>
          <p className="text-xs opacity-75 mt-1">Campaign reel vs {brandName}&apos;s top organic post</p>
        </div>
        <div className="bg-gradient-to-br from-[#0C2340] to-[#1a3a5c] rounded-xl p-6 text-center text-white">
          <p className="text-5xl font-black mb-2">{stats.vsAvgMultiplier}</p>
          <p className="text-sm font-semibold uppercase tracking-wide opacity-90">vs Average Post</p>
          <p className="text-xs opacity-75 mt-1">Campaign reel vs {brandName}&apos;s avg likes</p>
        </div>
      </div>
    </>
  );
}

function RecentPostsComparison({
  brandName,
  recentPosts,
}: {
  brandName: string;
  recentPosts: { date: string; likes: number; caption: string; isAuburn?: boolean }[];
}) {
  const maxLikes = Math.max(...recentPosts.map(p => p.likes), 1);
  return (
    <div className="relative bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-[#E87722]/5 via-transparent to-[#0C2340]/5 pointer-events-none"></div>
      <div className="relative px-6 py-4 border-b border-gray-100/50 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E87722] to-[#C96318] flex items-center justify-center shadow-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#0C2340] uppercase tracking-wide">
              Campaign Post vs {brandName}&apos;s Recent Posts
            </h3>
            <p className="text-sm text-gray-500">How the Auburn reel stacked up against {brandName}&apos;s other content</p>
          </div>
        </div>
      </div>
      <div className="relative p-6">
        <div className="space-y-3">
          {recentPosts.map((post, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${post.isAuburn ? 'text-[#E87722]' : 'text-gray-500'}`}>
                    {post.date}
                  </span>
                  {post.isAuburn && (
                    <span className="bg-[#E87722]/10 text-[#E87722] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                      This Campaign
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
                  style={{ width: `${(post.likes / maxLikes) * 100}%` }}
                />
              </div>
            </div>
          ))}
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

function PostCard({ post }: { post: typeof amsterdamPost }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-80 bg-gray-100 overflow-hidden">
        <img
          src={post.image}
          alt={post.label}
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&h=400&fit=crop';
          }}
        />
        <div className="absolute top-3 left-3 bg-black/70 text-white px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
          {post.label}
        </div>
        {post.link && (
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 bg-white/90 text-gray-700 p-2 rounded-lg hover:bg-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
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

export default AuburnAmsterdamCafeReport;
